/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

// class to interact with the NexusMods API
// see https://github.com/Nexus-Mods/node-nexus-api for more details
import Nexus from "@nexusmods/nexus-api";

// import stringify from "json-stringify-pretty-compact";
import { createReadStream, createWriteStream } from "fs";
import fs from "node:fs/promises";
import path from "node:path";
import {https} from "follow-redirects";
import { fileURLToPath } from "url";
// import AdmZip from 'adm-zip';
import ArchiveHandler from "./archive-handler.js";
import EventEmitter from "events";

import { exec } from "child_process";

export const Emitter = new EventEmitter();


function stringifyJSON(data) {
    return JSON.stringify(data, null, 4);
    return stringify(data, { maxLength: 124, indent: 4 });
}


/**
 * PalHUB API Interface <3
 * Handles interactions between the client's machine and the main PalHUB server.
 *
 * @class API
 * @method get
 * @method post
 * @method getModList
 */
export class API {
    static async get(url) {
        const response = await fetch(url);
        return response.json();
    }

    static async post(url, data) {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    static async getModList() {
        return await this.get("http://localhost:3000/mods");
    }
}


class DekNexus extends Nexus {

    async getRequiredMods(modId) {
        await this.mQuota.wait();
        let urlPath = '/games/{gameId}/mods/{modId}/requirements';
        return this.request(this.mBaseURL + urlPath, this.args({ 
            path: this.filter({ modId, gameId }) 
        }));
    }

}



/**
 * PalHUB Client Interface <3
 * Handles client machine interactions. eg, managing mods, starting servers, etc.
 *
 */
export class Client {
    static async ensureNexusLink(api_key) {
        if (this._nexus) return this._nexus;
        const appName = "PalHUB";
        const appVersion = "0.0.1";
        const defaultGame = "palworld";
        const nexus = new DekNexus({
            defaultGame,
            appVersion,
            appName,
        });
        nexus.setGame(defaultGame);
        await nexus.setKey(api_key);
        this._nexus = nexus;
        return this._nexus;
    }

    // use node js to validate the game installation seems to be a valid Palworld game path
    // also determine if it is installeld for steam, xbox pass, or windows store.
    static async validateGamePath(game_path) {
        return new Promise(async (resolve, reject) => {
            if (!!!game_path) return resolve({ type: "{invalid-path}" });
            try {
                console.log("validating game path", game_path);
                // const exists = await fs.access(game_path);
                const files = await fs.readdir(game_path, { withFileTypes: true }); //, encoding: 'utf-8', recursive: true});
                const fileExists = (filename) => files.some((file) => file.isFile() && file.name === filename);
                // console.log({ files });

                if (game_path.includes("SteamLibrary")) {
                    // steam ~ obviously

                    // check for the Palworld executable
                    const has_exe = fileExists("Palworld.exe");
                    // console.log({ has_exe });

                    if (has_exe) {
                        const exe_path = path.join(game_path, "Palworld.exe");
                        const ue4ss_path = path.join(game_path, "Pal/Binaries/Win64/dwmapi.dll");
                        const has_ue4ss = await fs.access(ue4ss_path).then(()=>true).catch(()=>false);
                        console.log({ exe_path, has_exe, ue4ss_path, has_ue4ss });
                        return resolve({
                            type: "steam",
                            has_exe,
                            exe_path,
                            has_ue4ss,
                            ue4ss_path,
                        });
                    }
                }

                // if (game_path.includes('WindowsApps')) return resolve('windows'); // windows store
                // if (game_path.includes('XboxGames')) return resolve('xbox'); // xbox game pass
            } catch (error) {
                console.error("validateGamePath error", error);
            }
            resolve({ type: "{UNKNOWN}" });
        });
    }

    static downloadModFromNexus() {}


    static async downloadFile(cache_dir, download_url, callbacks={}) {
        const filename = download_url.split("/").pop();
        const outputPath = path.join(cache_dir, filename);

        return new Promise((resolve, reject) => {
            https.get(download_url, (response) => {
                if (response.statusCode !== 200) {
                    return reject(new Error(`Failed to get '${download_url}' (${response.statusCode})`));
                }

                const totalSize = parseInt(response.headers["content-length"], 10);

                let downloadedSize = 0;

                response.on("data", (chunk) => {
                    downloadedSize += chunk.length;
                    const percentage = ((downloadedSize / totalSize) * 100).toFixed(2);
                    process.stdout.write(`Downloading: ${percentage}%\r`);

                    if (callbacks.onProgress) callbacks.onProgress({ filename, outputPath, percentage });
                    else Emitter.emit("download-file", {
                        filename,
                        outputPath,
                        percentage,
                    });
                });
                // pipe the response to the new file as its received. This is a streaming download
                // so the file is saved to disk as it downloads. helpful for large files. 
                const newfile = createWriteStream(outputPath);
                newfile.on("finish", () => {
                    newfile.close(() => {
                        console.log("\nDownload completed: ", filename);
                        if (callbacks.onFinish) callbacks.onFinish({ filename, outputPath });
                        resolve(true);
                    });
                });
                newfile.on("error", (error) => {
                    if (callbacks.onError) callbacks.onError({ filename, outputPath, error });
                    fs.unlink(outputPath, () => {}); // Delete the file async if an error occurs
                    reject({ error });
                });
                response.pipe(newfile);
            })
            .on("error", (error) => {
                if (callbacks.onError) callbacks.onError({ filename, outputPath, error });
                fs.unlink(outputPath, () => {}); // Delete the file async if an error occurs
                reject({ error });
            });
        });        
    }





    // download and install mod from nexus
    // mod will be a zip file and may be very large
    // we use steaming to save the file to disk as it downloads
    static async downloadMod(cache_path, download_url, mod, file) {
        const outputPath = path.join(cache_path, file.file_name);

        if (!mod) return Promise.reject("No mod data provided");
        if (!file) return Promise.reject("No file data provided");
        if (!download_url) return Promise.reject("No download URL provided");
        if (await this.checkModFileIsDownloaded(cache_path, file)) return Promise.reject("Mod file already downloaded");

        return new Promise((resolve, reject) => {
            const newfile = createWriteStream(outputPath);

            https
                .get(download_url, (response) => {
                    if (response.statusCode !== 200) {
                        reject(new Error(`Failed to get '${download_url}' (${response.statusCode})`));
                        return;
                    }

                    const totalSize = parseInt(response.headers["content-length"], 10);
                    let downloadedSize = 0;

                    response.on("data", (chunk) => {
                        downloadedSize += chunk.length;
                        const percentage = ((downloadedSize / totalSize) * 100).toFixed(2);
                        process.stdout.write(`Downloading: ${percentage}%\r`);
                        Emitter.emit("download-mod-file", {
                            mod_id: mod.mod_id,
                            file_id: file.file_id,
                            percentage,
                        });
                    });

                    response.pipe(newfile);

                    newfile.on("finish", () => {
                        newfile.close(() => {
                            this.addModDataToCacheJSON(cache_path, mod, file).then(()=>{
                                console.log("\nDownload completed.");
                                resolve(true);
                            });
                        });
                    });

                    newfile.on("error", (error) => {
                        fs.unlink(outputPath, () => {}); // Delete the file async if an error occurs
                        reject({ error });
                    });
                })
                .on("error", (error) => {
                    fs.unlink(outputPath, () => {}); // Delete the file async if an error occurs
                    reject({ error });
                });
        });
    }

    static determineInstallPath(game_path, entry) {
        let install_path = game_path;
        if (entry.isDirectory) {
            switch (entry.entryName) {
                case "LogicMods/":
                    install_path = path.join(game_path, "Pal/Content/Paks");
                    break;
                case "Mods/":
                    install_path = path.join(game_path, "Pal/Binaries/Win64");
                    break;
                default:
                    install_path = game_path;
                    break;
            }
            // } else if (firstEntry.entryName.endsWith('.pak')) {
            //     // unknown mod type ~ assume regular .pak replacement
            //     const install_path = path.join(game_path, 'Pal/Content/Paks/~mods');
            //     archive.extractAllTo(install_path, true);
            //     console.log('extracted to:', install_path);
        } else {
            // unknown mod type ~ assume regular .pak replacement
            install_path = path.join(game_path, "Pal/Content/Paks/~mods");
        }
        return install_path;
    }


    static installMod(cache_path, game_path, mod, file) {
        return new Promise(async (resolve, reject) => {
            try {
                // check if the mod is already downloaded
                const downloaded = await this.checkModFileIsDownloaded(cache_path, file);
                if (!downloaded) return reject("Mod file not downloaded");
                // check if the mod is already installed
                const installed = await this.checkModIsInstalled(game_path, mod, file);
                if (installed) return reject("Mod already installed");

                // unzip the mods zip file, and copy it to the game directory
                const archive = new ArchiveHandler(path.join(cache_path, file.file_name));
                const entries = await archive.getEntries();
                // for (const entry of entries) {
                //     console.log({ entry });
                // }

                // determine install type from first entry
                const firstEntry = entries[0];
                const install_path = this.determineInstallPath(game_path, firstEntry);

                Emitter.emit("install-mod-file", {
                    install_path,
                    name: mod.name,
                    version: file.version,
                    mod_id: mod.mod_id,
                    file_id: file.file_id,
                    entries: entries.map((entry) => entry.entryName),
                });

                // forward the extracting event to the renderer
                archive.on("extracting", (data) => {
                    console.log("extracting:", data);
                    Emitter.emit("extract-mod-file", data);
                });

                console.log("extracted to:", install_path);
                await archive.extractAllTo(install_path, true);

                // add mod data to the config file
                await this.addModDataToJSON(game_path, mod, file, entries);


                return resolve({ success: true });
            } catch (error) {
                reject(error);
            }
        });
    }

    static uninstallMod(game_path, mod, config_override=null) {
        console.log("uninstalling mod:", mod.name);
        return new Promise(async (resolve, reject) => {
            try {
                // check if the mod is already installed
                const installed = config_override || await this.checkModIsInstalled(game_path, mod);
                if (!installed) return reject("Mod not installed");
                // remove the mod from the config file
                const entries = await this.removeModDataFromJSON(game_path, mod, config_override);
                console.log("uninstalling mod entries:", entries);

                // determine the root path to uninstall this mods files from
                const firstEntry = entries[0];
                let base_path = game_path;
                switch (firstEntry) {
                    case "Pal/":
                        base_path = game_path;
                        break;
                    case "Mods/":
                        base_path = path.join(game_path, "Pal/Binaries/Win64");
                        break;
                    case "LogicMods/":
                        base_path = path.join(game_path, "Pal/Content/Paks");
                        break;
                    default:
                        base_path = path.join(game_path, "Pal/Content/Paks/~mods");
                        break;
                }
                // remove the mod files from the game directory
                const used_entries = [];
                for (const entry of entries) {
                    const fileordir = path.join(base_path, entry);
                    console.log("iterating:", fileordir);
                    // unlink if file, ignore if directory
                    if ((await fs.stat(fileordir)).isDirectory()) continue;

                    await fs.unlink(fileordir);
                    used_entries.push(entry);
                }

                // sort entries from longest to shortest to ensure we delete the deepest directories first
                entries.sort((a, b) => b.length - a.length);

                for (const entry of entries) {
                    if (used_entries.includes(entry)) continue;
                    const fileordir = path.join(base_path, entry);
                    if (!(await fs.stat(fileordir)).isDirectory()) continue;
                    const files = await fs.readdir(fileordir);
                    if (files.length) continue;

                    console.log("deleting empty directory:", fileordir);
                    await fs.rmdir(fileordir, { recursive: true });
                }

                resolve({ success: true });
            } catch (error) {
                reject({ error });
            }
        });
    }

    static validateModFiles(game_path, mod, file) {
        return new Promise(async (resolve, reject) => {
            try {
                // check if the mod is already installed
                const installed = await this.checkModIsInstalled(game_path, mod, file);
                if (!installed) return reject("Mod not installed");

                // iterate over the mod files and check if they exist
                const config = await this.readJSON(game_path);
                const mod_data = config.mods[mod.mod_id];
                const entries = mod_data.entries;
                const base_path = this.determineInstallPath(game_path, { entryName: entries[0] });

                const results = {};
                for (const entry of entries) {
                    const fileordir = path.join(base_path, entry);
                    results[entry] = await fs.access(fileordir).then(() => true).catch(() => false);
                }

                resolve(true);

            } catch (error) {
                reject(error);
            }
        });
    }


    // todo: update this so that only one read/write for json is done
    static async uninstallAllMods(game_path) {
        console.log("uninstalling all mods from:", game_path);
        const config = await this.readJSON(game_path);
        const result = {}
        const mod_keys = Object.keys(config.mods);
        for (const mod_id of mod_keys) {
            console.log("uninstalling mod:", mod_id);
            // const mod = config.mods[mod_id];
            result[mod_id] = await this.uninstallMod(game_path, {mod_id}, config);
            console.log("uninstalled mod:", mod_id, result[mod_id]);
        }

        await this.writeJSON(game_path, config);
        return result;
    }

    static async checkModFileIsDownloaded(cache_path, file) {
        try {
            console.log("checking if mod file is downloaded", path.join(cache_path, file.file_name));
            await fs.access(path.join(cache_path, file.file_name));
            console.log(`mod file is downloaded: ${file.file_name}`);
            return true;
        } catch (error) {
            console.log(`mod file is NOT downloaded: ${file.file_name}`, error);
            return false;
        }
    }

    static async checkModIsInstalled(game_path, mod, file = null) {
        console.log("checking if mod is installed", game_path, mod?.name, file?.file_name);
        try {
            // check if the mod is already installed
            const config = await this.readJSON(game_path);
            if (!config.mods || !config.mods[mod.mod_id]) return false;
            const mod_data = config.mods[mod.mod_id];
            if (!mod_data) return false;

            // return true if file unspecified or matches installed file
            return file ? mod_data.file_name === file.file_name : true;
        } catch (error) {
            console.error("checkModIsInstalled error", error);
        }
        return false;
    }

    static get json_filename() {
        return "palhub.config.json";
    }

    static async readJSON(base_path, filename) {
        const config_path = path.join(base_path, filename || this.json_filename);
        try { return JSON.parse(await fs.readFile(config_path, "utf-8"));
        } catch (error){/* console.error("readJSON error", error); */}

        return {};
    }

    static async writeJSON(base_path, data, filename) {
        const config_path = path.join(base_path, filename || this.json_filename);
        return await fs.writeFile(config_path, stringifyJSON(data));
    }

    // expose the stringifyJSON function
    static async stringifyJSON(data) {
        return stringifyJSON(data);
    }



    static async addModDataToJSON(game_path, mod, file, entries) {
        const config = await this.readJSON(game_path);
        config.mods = config.mods || {};
        config.mods[mod.mod_id] = {
            version: file.version,
            file_id: file.file_id,
            file_name: file.file_name,
            entries: entries.map((entry) => entry.entryName),
        };

        return await this.writeJSON(game_path, config);
    }


    static async removeModDataFromJSON(game_path, mod, config_override=null) {
        const config = config_override ?? await this.readJSON(game_path);

        if (!config.mods || !config.mods[mod.mod_id]) return [];

        console.log("removing mod", mod.mod_id, config.mods[mod.mod_id]);

        const clone = (d) => JSON.parse(JSON.stringify(d));
        const entries = clone(config.mods[mod.mod_id].entries);
        console.log('removing entries:', entries);

        config.mods[mod.mod_id] = null;
        delete config.mods[mod.mod_id];

        if (!config_override) await this.writeJSON(game_path, config);

        return entries;
    }


    static async addModDataToCacheJSON(cache_path, mod, file) {
        const config = await this.readJSON(cache_path);
        console.log("adding mod data to cache json", {cache_path, mod, file});
        config.mods = config.mods || {};
        config.mods[mod.mod_id] = {};
        config.mods[mod.mod_id][file.file_id] = {
            ver: file.version,
            zip: file.file_name,
        };
        return await this.writeJSON(cache_path, config);
    }

    static async removeModDataFromCacheJSON(cache_path, mod, file) {
        const config = await this.readJSON(cache_path);

        console.log("removing mod data from cache json", {cache_path, mod, file});
        if (!config.mods || !config.mods[mod.mod_id]) return [];

        let entries = [];
        if (file) {
            if (!config.mods[mod.mod_id][file.file_id]) return [];
            config.mods[mod.mod_id][file.file_id] = null;
            delete config.mods[mod.mod_id][file.file_id];
        } else {
            entries = Object.values(config.mods[mod.mod_id]).map((entry) => entry.zip);
            config.mods[mod.mod_id] = null;
            delete config.mods[mod.mod_id];
        }

        await this.writeJSON(cache_path, config);
    }




    static async uninstallFilesFromCache(cache_path, mod, file) {
        console.log('uninstalling files from cache', {cache_path, mod: mod.mod_id, file});
        // try {
        //     await this.uninstallMod(cache_path, mod);
        // } catch (error) {
        //     console.log("uninstallFilesFromCache", "failed to uninstall mod:", mod.name, error);
        // }
        await this.removeModDataFromCacheJSON(cache_path, mod, file);
        await fs.unlink(path.join(cache_path, file.file_name));
    }

    static launchExe(exe_path) {
        console.log("launching exe", exe_path);
        exec(exe_path, (error, stdout, stderr) => {
            if (error) return console.error(`exec error: ${error}`);
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        });
        return true;
    }


    // downloads latest release from the UE4SS github repo
    // https://github.com/UE4SS-RE/RE-UE4SS/releases
    // https://github.com/UE4SS-RE/RE-UE4SS/releases/download/v3.0.1/UE4SS_v3.0.1.zip
    // https://github.com/UE4SS-RE/RE-UE4SS/releases/download/v3.0.1/UE4SS_v3.0.1.zip
    static async downloadAndInstallUE4SS(cache_dir, game_path) {
        // get latest release download url:
        const ue4ss_version = '3.0.1';
        const release_url = 'https://github.com/UE4SS-RE/RE-UE4SS/releases';
        const url = `${release_url}/download/v${ue4ss_version}/UE4SS_v${ue4ss_version}.zip`;


        try {
            const path_data = await this.validateGamePath(game_path);

            // remove dll from path if it exists
            const ue4ss_install_dir = path_data.ue4ss_path.replace('dwmapi.dll', '');

            if (!path_data.ue4ss_path) {
                console.log("downloading UE4SS", url);
            }

            await this.downloadFile(cache_dir, url, {
                onProgress: data => Emitter.emit("ue4ss-process", 'download', data),
            });

            // unzip and install
            const archive = new ArchiveHandler(path.join(cache_dir, `UE4SS_v${ue4ss_version}.zip`));
            // forward the extracting event to the renderer
            archive.on("extracting", (data) => {
                Emitter.emit("ue4ss-process", 'extract', data);
            });
            // extract the zip to the game directory
            await archive.extractAllTo(ue4ss_install_dir, true);

            return true;

        } catch (error) {
            console.error("downloadAndInstallUE4SS error", error);
        }
        return false;
    }



}

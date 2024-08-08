/**
 * system: PalHUB Client
 * author: dekitarpg@gmail.com
 *
 * loads DEAP and API modules.
 * Add handler for API functions.
 * Launch application via DEAP.
 */

import { app, ipcMain } from "electron";
import Store from "electron-store";
import Dekache from "dekache";
import { Client, Emitter } from './dek/palhub';

import detectSteamGameInstallation from "./dek/detectSteamGame";
import detectXboxGameInstallation from "./dek/detectXboxGame";

console.log({ Client, Emitter });

import config from "./config";
import DEAP from "./dek/deap";
import DAPI from "./dek/api";

// handle uncaught exceptions && promises
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    // process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", promise, "reason:", reason);
    // process.exit(1);
});

// Create a new instance of electron-store for handling
// user specific data storage.
const uStoreData = new Store({ name: "uStoreData" });

const uStoreHandler = async (event, action, key, value) => {
    switch (action) {
        // handle uStore events that DO desire a return value:
        case "get":
            return uStoreData.get(key, value);

        // handle uStore events that do NOT desire a return value:
        case "set":
            uStoreData.set(key, value);
            break;
        case "delete":
            uStoreData.delete(key);
            break;
        case "clear":
            uStoreData.clear();
            break;
    }
};

// set up the uStore handler for both invoked and sent events..
ipcMain.handle("uStore", uStoreHandler); // called via invoke
ipcMain.on("uStore", uStoreHandler); // called via send

// console.log({API, Client});

// a basic cache for the nexus API to prevent unnecessary requests
const nexusApiCache = new Dekache({ name: "need some cache bruh?", mins: 5 });

// a more long term cache for persistent storage of mod data
const nexusApiModDataStore = new Store({ name: "nexusApiModData" });
const lengthOfOneHour = 1000 * 60 * 60;
const lengthOfOneDay = lengthOfOneHour * 24;
const lengthOfOneWeek = lengthOfOneDay * 7;

// functions that should be cached within the data store and their cache duration
const nexusFunctionsToCache = {
    getModInfo: lengthOfOneDay,
    getModFiles: lengthOfOneHour,
    getDownloadURLs: lengthOfOneHour,
    getLatestAdded: lengthOfOneHour,
    getLatestUpdated: lengthOfOneHour,
    getTrending: lengthOfOneHour,
    getTrackedMods: lengthOfOneHour,
}

ipcMain.handle("nexus", async (event, api_key, functionName, ...functionArgs) => {
    const getUncachedValue = async () => {
        const nexus = await Client.ensureNexusLink(api_key);
        if (!nexus[functionName]) return console.error(`Nexus function ${functionName} not found`);
        return await nexus[functionName](...functionArgs);
    }
    // return uncached value when checking rate limit, as each other request 
    // will also update the rate limit data, so we don't need to cache it.
    if (functionName === 'getRateLimits') return await getUncachedValue();

    // create a cache key based on the function name and arguments
    const cache_key = `${functionName}-${JSON.stringify(functionArgs)}`;

    let result = null;
    let forced = false;

    // if the function is getModData, check if we are force updating data
    if (functionName === 'getModInfo') forced = functionArgs[1] === true;

    if (nexusFunctionsToCache[functionName]) {
        const cached = nexusApiModDataStore.get(cache_key);
        // if the cache is not forced and the cache duration is not expired, return the cached value
        if (!forced && cached) {
            const cache_time = cached.cache_time;
            const cache_duration = Date.now() - cache_time;
            const cache_limit = nexusFunctionsToCache[functionName];
            if (cache_duration < cache_limit) return cached;
        }
        // else, get the uncached value and set
        result = await nexusApiCache.get(cache_key, getUncachedValue);
        result.cache_time = Date.now(); // add cache time to the result
        nexusApiModDataStore.set(cache_key, result);
    } else {
        // get the cached value or get the uncached value then set the cache and return the result
        result = await nexusApiCache.get(cache_key, getUncachedValue);
    }

    return result;
});

ipcMain.handle("palhub", async (event, action, ...args) => {
    if (!Client[action]) return console.error(`PalHUB function ${action} not found`);
    return await Client[action](...args);
});

ipcMain.handle("detect-game-installation", async (event) => {
    // await detectXboxGameInstallation("palworld");
    return await detectSteamGameInstallation("1623730");
});


Emitter.on("download-mod-file", (download_data) => {
    DEAP.main_window.webContents.send("download-mod-file", download_data);
});
Emitter.on("install-mod-file", (install_data) => {
    DEAP.main_window.webContents.send("install-mod-file", install_data);
});
Emitter.on("extract-mod-file", (extract_data) => {
    console.log("extract-mod-file:", extract_data);
    DEAP.main_window.webContents.send("extract-mod-file", extract_data);
});

Emitter.on("ue4ss-process", (type, data) => {
    console.log("ue4ss-process:", type, data);
    DEAP.main_window.webContents.send("ue4ss-process", type, data);
});


DEAP.setup(config);

DEAP.addIPCHandler("get-user-count", async () => {
    // if (!DEAP.app.isPackaged) return 0;
    return await DAPI.getUserCount({
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        uuid: DEAP.datastore.get("uuid"),
        version: DEAP.version,
    });
});

DEAP.launch();

// (async () => {
//     await app.whenReady();
//     // Finally, launch the nextron application via DEAP
// })();

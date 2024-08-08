const fs = require('fs');
const path = require('path');
const vdf = require('vdf');
const regedit = require('regedit');

const steamRegistryKey = 'HKLM\\Software\\Wow6432Node\\Valve\\Steam';

function getSteamPathFromRegistry() {
    return new Promise((resolve, reject) => {
        regedit.list(steamRegistryKey, (err, result) => {
            if (err) return reject(err);
            resolve(result[steamRegistryKey].values['InstallPath'].value);
        });
    });
}

function getSteamLibraryFolders(basePath) {
    return new Promise((resolve, reject) => {
        const libraryFile = path.join(basePath, 'steamapps', 'libraryfolders.vdf');
        fs.readFile(libraryFile, 'utf-8', (err, data) => {
            if (err) return reject(err);
            const {libraryfolders} = vdf.parse(data);
            resolve(Object.values(libraryfolders));
        });
    });
}

function getGameManifest(basePath, appId) {
    return new Promise((resolve, reject) => {
        const manifestFile = path.join(basePath, 'steamapps', `appmanifest_${appId}.acf`);
        if (!fs.existsSync(manifestFile)) return resolve(null);
        fs.readFile(manifestFile, 'utf-8', (err, data) => {
            if (err) return reject(err);
            resolve(vdf.parse(data)?.AppState);
        });
    });
}

async function findGameInstallation(libraryPaths, appId) {
    for (const libData of libraryPaths) {
        const manifest = await getGameManifest(libData.path, appId);
        if (manifest) {
            const gameFolderPath = path.join(libData.path, 'steamapps', 'common');
            const potentialGamePath = path.join(gameFolderPath, manifest.installdir);
            return potentialGamePath;
        }
    }
    return null;
}

export default async function detectSteamGameInstallation(appId) {
    try {
        const steamPath = await getSteamPathFromRegistry();
        const libraryPaths = await getSteamLibraryFolders(steamPath);
        const gamePath = await findGameInstallation(libraryPaths, appId);

        if (gamePath) {
            console.log(`Game found at: ${gamePath}`);
            return gamePath;
        } else {
            console.log('Game not found');
        }
    } catch (err) {
        console.error('Error detecting game installation:', err);
    }
    return null;
}

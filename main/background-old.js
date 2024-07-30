/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import path from 'path';
import { app, ipcMain, Tray,  } from 'electron';
import serve from 'electron-serve';
import Store from 'electron-store';
const { autoUpdater } = require("electron-updater");

import { createWindow } from './helpers';
import Dekache from 'dekache';
import { PalHUB } from './helpers';
const {API, Client, Emitter} = PalHUB;

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
    serve({ directory: 'app' })
} else {
    app.setPath('userData', `${app.getPath('userData')} (development)`)
}

// testicle

let mainWindow;

;(async () => {
    await app.whenReady()

    const width = 1064;
    const height = 840;
    const preload = path.join(__dirname, 'preload.js');

    mainWindow = createWindow('main', {
        webPreferences: { preload },
        width, height,
        minWidth: 680,
        minHeight: 720,
        // frame: false, 
    })

    if (isProd) {
        await mainWindow.loadURL('app://./home')
    } else {
        const port = process.argv[2]
        await mainWindow.loadURL(`http://localhost:${port}/home`)
        mainWindow.webContents.openDevTools()
    }
})();

app.on('window-all-closed', () => {
    app.quit();
});

ipcMain.on('message', async (event, arg) => {
    event.reply('message', `${arg} World!`);
});

// Create a new instance of electron-store for handling
// user specific data storage.
const uStoreData = new Store({ name: "uStoreData" });

const uStoreHandler = async (event, action, key, value) => {
    switch (action) {
        // handle uStore events that DO desire a return value:
        case 'get': return uStoreData.get(key, value);

        // handle uStore events that do NOT desire a return value:
        case 'set': uStoreData.set(key, value); break;
        case 'delete': uStoreData.delete(key); break;
        case 'clear': uStoreData.clear(); break;
    }
}

// set up the uStore handler for both invoked and sent events.. 
ipcMain.handle('uStore', uStoreHandler); // called via invoke
ipcMain.on('uStore', uStoreHandler); // called via send


// console.log({API, Client});

// a cache for the nexus API to prevent unnecessary requests
const nexusApiCache = new Dekache({name:'need some cache bruh?', mins: 10});

ipcMain.handle('nexus', async (event, api_key, functionName, ...functionArgs) => {
    const cache_key = `${functionName}-${JSON.stringify(functionArgs)}`;
    return await nexusApiCache.get(cache_key, async() => { 
        const nexus = await Client.ensureNexusLink(api_key); 
        if (!nexus[functionName]) return console.error(`Nexus function ${functionName} not found`);
        return await nexus[functionName](...functionArgs);
    });
});


ipcMain.handle('palhub', async (event, action, ...args) => {
    if (!Client[action]) return console.error(`PalHUB function ${action} not found`);
    return await Client[action](...args);
});


Emitter.on('download-mod-file', (download_data) => {
    console.log('download-mod-file:', download_data);
    // ipcMain.emit('download-mod-file', percentage);
    mainWindow.webContents.send('download-mod-file', download_data);
});


ipcMain.handle("install-update", async() => {
    if (app.isPackaged) autoUpdater.quitAndInstall();
});
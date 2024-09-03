/**
 * system: PalHUB Client
 * author: dekitarpg@gmail.com
 *
 * loads DEAP and API modules.
 * Add handler for API functions.
 * Launch application via DEAP.
 */

import config from "./config";
import DEAP from "./dek/deap";
import ipcHandlers from "./ipc-handlers";
import { Client, Emitter } from './dek/palhub';
import { setExternalVBS } from "./dek/detectSteamGame";

// import { ipcMain } from 'electron';
// import backend from "i18next-electron-fs-backend";
// import fs from 'fs';

// set the app details for nexus api requests
Client.setAppDetails(DEAP.name, DEAP.version);

// setup the application using the given configuration
// will handle uncaught exceptions and rejections if enabled
DEAP.setup(config, ()=>{ // then run this callback
    if (process.platform === 'win32') { // update regedit script path
        // In a packaged app, resourcesPath points to the resources directory
        if (DEAP.app.isPackaged) setExternalVBS(process.resourcesPath, 'vbs'); 
        else setExternalVBS(DEAP.app.getAppPath(), 'resources/vbs'); // Development mode
    }
});

// add all ipc handlers defined in ipc-handlers folder
for (const key in ipcHandlers) {
    if (!Object.prototype.hasOwnProperty.call(ipcHandlers, key)) continue;
    DEAP.addIPCHandler(key, ipcHandlers[key]);
}

// handle events from DEAP that should be forwarded to the renderer process
for (const event of ['download-mod-file', 'install-mod-file', 'extract-mod-file', 'ue4ss-process', 'watched-file-change', 'language-change']) {
    Emitter.on(event, (...args) => DEAP.main_window.webContents.send(event, ...args));
}

// launch the electron app via DEAP wrapper
DEAP.launch({
    onAppReady() {
        // backend.mainBindings(ipcMain, DEAP.main_window, fs);
    },
    // onAppActivate: () => {},
    // onAppWindowsClosed:() => {},
    // onSecondInstanceLaunched: () => {},
    // onBeforeQuitApp: () => {},

    //! TODO: onCreateWindow(win) {}
});

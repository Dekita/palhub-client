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

// set the app details for nexus api requests
Client.setAppDetails(DEAP.name, DEAP.version);

// setup the application using the given configuration
// will handle uncaught exceptions and rejections if enabled
DEAP.setup(config, ()=>{ // then run this callback
    if (process.platform === 'win32') { // update regedit script path
        // In a packaged app, resourcesPath points to the resources directory
        // when packaged, use the resourcesPath to find the vbs script
        if (DEAP.app.isPackaged) setExternalVBS(process.resourcesPath, 'vbs'); 
    }
    // add all ipc handlers defined in ipc-handlers folder
    for (const key in ipcHandlers) {
        if (!Object.prototype.hasOwnProperty.call(ipcHandlers, key)) continue;
        DEAP.addIPCHandler(key, ipcHandlers[key]);
    }
    // handle events from DEAP that should be forwarded to the renderer process
    for (const event of Emitter.EVENTS_TO_HANDLE) {
        Emitter.on(event, (...args) => DEAP.main_window.webContents.send(event, ...args));
    }
});

// launch the electron app via DEAP wrapper
DEAP.launch({
    // onAppReady() {},
    // onAppActivate: () => {},
    // onAppWindowsClosed:() => {},
    // onSecondInstanceLaunched: () => {},
    // onBeforeQuitApp: () => {},
    // onLoadWindow(id, win) {}
});

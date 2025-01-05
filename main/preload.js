/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import { contextBridge, ipcRenderer, webUtils} from 'electron';

// expose the user data (electron-store) API to the renderer process
contextBridge.exposeInMainWorld('uStore', {
    async get(key, value) { return await ipcRenderer.invoke('uStore', 'get', key, value) },
    set(key, value) { ipcRenderer.invoke('uStore', 'set', key, value) },
    delete(key) { ipcRenderer.invoke('uStore', 'delete', key) },
    clear() { ipcRenderer.invoke('uStore', 'clear') },
});

contextBridge.exposeInMainWorld('serverCache', {
    async get(key, value) { return await ipcRenderer.invoke('serverCache', 'get', key, value) },
    set(key, value) { ipcRenderer.invoke('serverCache', 'set', key, value) },
    delete(key) { ipcRenderer.invoke('serverCache', 'delete', key) },
    clear() { ipcRenderer.invoke('serverCache', 'clear') },
});

// expose nexus functionality to renderer process
contextBridge.exposeInMainWorld('nexus', async(...args) => {
    return await ipcRenderer.invoke('nexus', ...args);
});

// expose main palhub functionality to renderer process
contextBridge.exposeInMainWorld('palhub', async(...args) => {
    return await ipcRenderer.invoke('palhub', ...args);
});

// expose the logger to the renderer process
const LOG_TYPES = ['log', 'info', 'http', 'warn', 'error', 'fatal'];
contextBridge.exposeInMainWorld('logger', LOG_TYPES.reduce((acc, logtype) => {
    return {...acc, [logtype]: async(...args) => {
        return await ipcRenderer.invoke('logger', logtype, ...args);
    }};
}, {}));

// Expose protected methods that allow the renderer process to use
contextBridge.exposeInMainWorld('ipc', {
    send(channel, value) { ipcRenderer.send(...arguments) },
    removeListener(channel, callback) { ipcRenderer.removeListener(channel, callback) },
    removeAllListeners(channel) { ipcRenderer.removeAllListeners(...arguments) },
    invoke(channel, value) { return ipcRenderer.invoke(...arguments) },
    once(channel, callback) { ipcRenderer.once(channel, (_event, ...args) => callback(...args)) },
    on(channel, callback) {
        const subscription = (_event, ...args) => callback(...args);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
    },

    // Expose the webUtils API to getPathForFile in the renderer process
    getPathForFile(path) { return webUtils.getPathForFile(path) },
});

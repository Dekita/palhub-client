/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import { contextBridge, ipcRenderer} from 'electron';

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

// Expose protected methods that allow the renderer process to use
contextBridge.exposeInMainWorld('ipc', {
    send(channel, value) {
        ipcRenderer.send(...arguments);
    },
    on(channel, callback) {
        const subscription = (_event, ...args) => callback(...args);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel, callback) {
        ipcRenderer.once(channel, (_event, ...args) => callback(...args));
    },
    removeListener(channel, callback) {
        ipcRenderer.removeListener(channel, callback);
    },
    removeAllListeners(channel) {
        ipcRenderer.removeAllListeners(...arguments);
    },
    invoke(channel, value) {
        return ipcRenderer.invoke(...arguments);
    }
});
/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import { screen, BrowserWindow, shell, Menu } from 'electron';

export const createWindow = (DEAP, windowName, options) => {
    const key = `windows.${windowName}`;
    const store = DEAP.datastore;
    const defaultSize = {
        width: options.width,
        height: options.height,
    }
    const getCurrentPosition = () => {
        const position = win.getPosition()
        const size = win.getSize()
        return {
            x: position[0],
            y: position[1],
            width: size[0],
            height: size[1],
        }
    }
    const windowWithinBounds = (windowState, bounds) => {
        return (
            windowState.x >= bounds.x &&
            windowState.y >= bounds.y &&
            windowState.x + windowState.width <= bounds.x + bounds.width &&
            windowState.y + windowState.height <= bounds.y + bounds.height
        )
    }
    const resetToDefaults = () => {
        const bounds = screen.getPrimaryDisplay().bounds
        return Object.assign({}, defaultSize, {
            x: (bounds.width - defaultSize.width) / 2,
            y: (bounds.height - defaultSize.height) / 2,
        })
    }
    const ensureVisibleOnSomeDisplay = () => {
        const windowState = store.get(key, defaultSize);
        console.log('ensureVisibleOnSomeDisplay', windowState);
        const visible = screen.getAllDisplays().some((display) => {
            return windowWithinBounds(windowState, display.bounds);
        });
        // Window is partially or fully not visible now.
        // Reset it to safe defaults.
        if (!visible) return resetToDefaults();
        return windowState;
    }

    let state = ensureVisibleOnSomeDisplay();

    const win = new BrowserWindow({
        ...options, ...state,
        show: false, // Don't show the window until it's ready
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            ...options.webPreferences,
        },
    });
    
    Menu.setApplicationMenu(null);
    win.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
    // save state on window close
    win.on('close', () => {
        if (!win.isMinimized() && !win.isMaximized()) {
            Object.assign(state, getCurrentPosition());
        }
        store.set(key, state);
    });
    // store reference to the window id for deap system
    win.deap_id = windowName;

    // return de vindow wuuuut?!
    return win;
}

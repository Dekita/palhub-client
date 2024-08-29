/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import { screen, BrowserWindow, shell, Menu } from 'electron';
import Store from 'electron-store';

export const createWindow = (windowName, options) => {
    const key = 'window-state'
    const name = `window-state-${windowName}`
    const store = new Store({ name })
    const defaultSize = {
        width: options.width,
        height: options.height,
    }
    let state = {}

    const restore = () => store.get(key, defaultSize);

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

    const ensureVisibleOnSomeDisplay = (windowState) => {
        const visible = screen.getAllDisplays().some((display) => {
            return windowWithinBounds(windowState, display.bounds)
        })
        // Window is partially or fully not visible now.
        // Reset it to safe defaults.
        if (!visible) return resetToDefaults();
        return windowState;
    }

    const saveState = () => {
        if (!win.isMinimized() && !win.isMaximized()) {
            Object.assign(state, getCurrentPosition());
        }
        store.set(key, state);
    }

    state = ensureVisibleOnSomeDisplay(restore())

    const win = new BrowserWindow({
        ...state,
        ...options,
        show: false, // Don't show the window until it's ready
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            ...options.webPreferences,
        },
    });
    
    Menu.setApplicationMenu(null);

    win.on('ready-to-show', () => {
        console.log('\n--- showing the window ---\n');
        win.show();
        win.focus();
        win.webContents.send('deap-window-setup', windowName);
    });

    win.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });
    
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    win.on('close', saveState);

    return win;
}

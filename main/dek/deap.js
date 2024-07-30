/**
 * system: DEAP - Dekitas Electron App Project
 * author: dekitarpg@gmail.com
 *
 * This module handles creating an electron application
 * it uses various configuration options to determine
 * how windows behave, and the pages loaded.
 *
 */
import { app, dialog, ipcMain, BrowserWindow, Menu, Tray } from "electron";
import { autoUpdater } from "electron-updater";
import createLogger, { LoggyBoi } from "../../utils/dek/logger";
import { createWindow } from './create-window';

import Store from "electron-store";
import serve from "electron-serve";
import path from "path";
// import fs from 'fs';

const IS_PRODUCTION = process.env.NODE_ENV === "production";

if (IS_PRODUCTION) {
    serve({ directory: "app" });
} else {
    app.setPath("userData", `${app.getPath("userData")} (development)`);
}

const logger = console;//createLogger(__filename);

const PACKAGE_JSON = (() => {
    if (app.isPackaged) return {};
    return require("../../package.json");
})();
const APP_NAME = (() => {
    if (app.isPackaged) return app.getName();
    return PACKAGE_JSON.productName;
})();
const APP_VERSION = (() => {
    if (app.isPackaged) return app.getVersion();
    return PACKAGE_JSON.version;
})();

function capitalize([char1, ...rest]) {
    return char1.toUpperCase() + rest.join("");
}

class DEAP {
    // quick reference to electron.app;
    static get app() {
        return app;
    }
    static get name() {
        return APP_NAME;
    }
    static get version() {
        return APP_VERSION;
    }
    static get datastore() {
        return this._datastore;
    }
    static get window_keys() {
        return Object.keys(this._windows);
    }
    static get main_window() {
        const winkey = Object.keys(this._windows);
        return this._windows[winkey.shift()] || null;
    }
    /**
     * setup app using given config
     */
    static setup(config = {}) {
        this._tray = null;
        this._windows = {};
        this._config = config;
        this.setupDefaultIPC();
        this.setInstanceLock(!config.dev_mode && config.single_instance);
        this.setDatastore({
            name: "[dekita.palhub.data]",
            defaults: config.data_store,
        });
        this.setUserAgent("dekitarpg.com");
        // setup global logfile
        LoggyBoi.setGlobalOptions({
            ...config.logger,
            file_options: {
                filename: path.join(app.getAppPath(), "/errors.log"),
                options: { flags: "a", encoding: "utf8" },
            },
            // http_options: {
            //     port: 9699,
            //     host: '127.0.0.1',
            // }
        });
        logger.info(app.getAppPath());
    }
    static setInstanceLock(single) {
        if (single && !app.requestSingleInstanceLock({})) app.quit();
    }
    static setDatastore(store_options) {
        this._datastore = new Store(store_options);
    }
    static setUserAgent(agent_str) {
        this._user_agent = `${APP_NAME} ${APP_VERSION} ${agent_str}`.trim();
    }
    /**
     * ■ ipc handlers:
     */
    static setupDefaultIPC() {
        ipcMain.handle("get-name", (e) => APP_NAME);
        ipcMain.handle("get-version", (e) => APP_VERSION);
        ipcMain.handle("get-path", (event, key) => {
            if (key === "app") return app.getAppPath();
            return app.getPath(key);
        });
        ipcMain.handle("open-file-dialog", async (event, options) => {
            if (options) {
                return await dialog.showOpenDialog(options);
            }
            const extensions = ["jpg", "png", "gif"];
            return await dialog.showOpenDialog({
                filters: [{ name: "Images", extensions }],
                properties: ["openFile"],
            });
        });
        ipcMain.handle("save-file-dialog", async (event) => {
            const filters = [{ name: "Stylesheet", extensions: ["css"] }];
            return await dialog.showSaveDialog({ filters });
        });
        ipcMain.handle("get-config", async (event, key, defaultvalue) => {
            return this._datastore.get(key, defaultvalue);
        });
        ipcMain.handle("set-config", async (event, key, value) => {
            const return_value = this._datastore.set(key, value);
            if (key === "auto-boot") this.updateAutoBootMode();
            return return_value;
        });
        ipcMain.handle("delete-config", async (event, key) => {
            return this._datastore.delete(key);
        });
        ipcMain.handle("open-child-window", async (event, ...args) => {
            return this.createWindow(...args);
        });
        ipcMain.handle("reload-window", async (event, id) => {
            return this._windows[id] ? this._windows[id].reload() || true : false;
        });
        // ipcMain.handle("window-fully-rendered", async (event, id) => {
        //     this._windows[id].emit('window-fully-rendered');
        // });
        ipcMain.handle("install-update", async () => {
            if (app.isPackaged) autoUpdater.quitAndInstall();
        });
        ipcMain.handle("app-action", async (event, id, action) => {
            console.log('app-action:', id, action);
            switch (action) {
                case "maximize": {
                    if (this._windows[id].isMaximized()) {
                        this._windows[id].restore();
                        return false;
                    }
                    this._windows[id].maximize();
                    return true;
                }
                case "minimize":
                    return this._windows[id].minimize();
                case "exit":
                    return this._windows[id].close();
            }
        });
    }
    static addIPCHandler(handle, callback) {
        ipcMain.handle(handle, callback);
    }
    static createWindow(id, windoe_config = this._config.windows[id]) {
        if (!windoe_config) throw new Error(`window ${id} is not defined in config!`);
        if (this._windows[id]) return this._windows[id].reload();
        // if making first window, then assign it systray on mini:
        const assign_systray = !this.window_keys.length;
        const width = windoe_config.size.w;
        const height = windoe_config.size.h;
        const min_w = windoe_config.size.min_w || width;
        const min_h = windoe_config.size.min_h || height;

        let reloading = false;

        // this._windows[id] = new BrowserWindow({
        this._windows[id] = createWindow(id, {
            icon: this._config.app_icon.ico,
            show: false,
            width,
            height,
            minWidth: min_w,
            minHeight: min_h,
            autoHideMenuBar: true,
            useContentSize: true,
            backgroundColor: "#36393f",
            frame: windoe_config.opts.show_frame,
            fullscreen: windoe_config.opts.fullscreen,
            transparent: windoe_config.opts.transparent,
            webPreferences: {
                preload: windoe_config.load,
                devTools: !app.isPackaged,

                enableRemoteModule: false,
                nodeIntegration: false,
                contextIsolation: true,
                // contextIsolation: false,
            },
        });
        this._windows[id].setMenu(null);
        this._windows[id].on("minimize", (event) => {
            if (assign_systray && this._datastore.get("tiny-tray")) {
                this._windows[id].setSkipTaskbar(true);
                this.createTray(this._windows[id]);
                event.preventDefault();
            }
        });
        this._windows[id].on("restore", (event) => {
            if (assign_systray && this._datastore.get("tiny-tray")) {
                this._windows[id].setSkipTaskbar(false);
                this.destroyTray();
            }
            event.preventDefault();
            reloading = true;
        });
        this._windows[id].on("closed", (event) => {
            this._windows[id] = null;
            delete this._windows[id];
            if (!assign_systray) return; // - child windows
            const other_keys = this.window_keys.filter((key) => key !== id); // main window:
            for (const key of other_keys) this._windows[key].close(); // - close kids
        });

        this._windows[id].on("ready-to-show", () => {
            // this._windows[id].on('window-fully-rendered', () => {
            const can_tiny = assign_systray && !reloading && this._datastore.get("auto-tiny");
            if (this._config.dev_mode) this._windows[id].webContents.openDevTools();
            if (!can_tiny) this._windows[id].show();
            else this._windows[id].minimize();
            reloading = false;
        });
        this._windows[id].webContents.on("before-input-event", (event, input) => {
            if (input.control && input.key.toUpperCase() === "R") {
                this.loadFileToWindow(id, windoe_config);
                event.preventDefault();
            }
        });
        this.loadFileToWindow(id, windoe_config);
    }
    // creates a system tray icon and defines its options
    static createTray(windoe) {
        this._tray = new Tray(this._config.app_icon.ico);
        const menu = this.createTrayMenu(windoe);
        this._tray.on("double-click", () => windoe.show());
        this._tray.setToolTip(windoe.title);
        this._tray.setContextMenu(menu);
    }
    static createTrayMenu(windoe) {
        return Menu.buildFromTemplate([
            { label: "Show", click: () => windoe.show() },
            {
                label: "Exit",
                click: () => {
                    app.isQuiting = true;
                    app.quit();
                },
            },
        ]);
    }
    static destroyTray() {
        if (!this._tray) return;
        this._tray.destroy();
        this._tray = null;
    }
    static async loadFileToWindow(id, config) {
        // set user agent and show/reload
        const windoe = this._windows[id];
        windoe.webContents.setUserAgent(this._user_agent);

        // if (windoe.isVisible()) windoe.reload();
        // else windoe.loadFile(config.page);

        if (windoe.isVisible()) windoe.reload();
        else {
            if (IS_PRODUCTION) {
                await windoe.loadURL(`app://./${config.page}`);
            } else {
                const port = process.argv[2];
                await windoe.loadURL(`http://localhost:${port}/${config.page}`);
                windoe.webContents.openDevTools();
            }
        }

        logger.log(`loading window: ${id}`);
        logger.log(config);
    }
    // updates the 'auto-start at system boot' feature
    static updateAutoBootMode() {
        const openAtLogin = this._datastore.get("auto-boot");
        app.setLoginItemSettings({ openAtLogin });
    }
    static launch() {
        // if (this._config.handle_rejections) {
        //     process.on('unhandledRejection', logger.error);
        // }
        app.on("ready", () => this.onAppReady());
        app.on("activate", () => this.onAppActivate());
        app.on("before-quit", () => this.onBeforeQuitApp());
        app.on("window-all-closed", () => this.onAppWindowsClosed());
        app.on("second-instance", () => this.onSecondInstanceLaunched());
    }
    static onAppReady() {
        // create window when electron has initialized.
        this.createWindow("main");

        setTimeout(()=>{
            this.initializeAutoUpdater();
        }, 3000);
    }
    static onAppActivate() {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (!BrowserWindow.getAllWindows().length) createMainWindow();
    }
    static onAppWindowsClosed() {
        if (process.platform !== "darwin") app.quit();
    }
    static onBeforeQuitApp() {
        // for completeness
    }
    // someone tried to run a second instance of app
    static onSecondInstanceLaunched() {
        if (!this._config.single_instance) return;
        if (!this.main_window) return;
        if (this.main_window.isMinimized()) {
            this.main_window.restore();
        }
        this.main_window.focus();
    }
    static initializeAutoUpdater() {
        console.log('initializing auto-updater:', app.isPackaged);
        if (!app.isPackaged) {
            this.main_window?.webContents?.send("auto-updater", 'not-packaged');
            return;
        }
        this.main_window?.webContents?.send("auto-updater", 'initializing');
        // define listeners:
        const updater_events = ["checking-for-update", "update-available", "update-not-available", "download-progress", "update-downloaded", "before-quit-for-update", "error"];
        for (const event of updater_events) {
            autoUpdater.on(event, data => {
                this.main_window?.webContents?.send("auto-updater", event, data);
            });
        }
        // begin checking updates:

        autoUpdater.checkForUpdates();
        // autoUpdater.checkForUpdatesAndNotify();
    }
}

export default DEAP;

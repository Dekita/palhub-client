/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
* system: DEAP - Dekitas Electron App Project
* author: dekitarpg@gmail.com
*
* This module handles creating an electron application
* it uses various configuration options to determine
* how windows behave, and the pages loaded.
*/

import { app, dialog, ipcMain, BrowserWindow, Menu, Tray, nativeImage, shell, session } from "electron";
import { updateAppVersion } from "./devstore";
import { autoUpdater } from "electron-updater";
import createLogger, { LoggyBoi } from "./logger";
import { createWindow } from "./create-window";
import Store from "electron-store";
import serve from "electron-serve";
import path from "node:path";
// import fs from 'fs';

// !see: https://www.electronjs.org/docs/latest/api/command-line-switches
// app.commandLine.appendSwitch('remote-debugging-port', '8315')

// !see: https://www.electronjs.org/docs/latest/api/session
// !see: https://www.electronjs.org/docs/latest/api/extensions
// session.defaultSession.loadExtension(path.join(__dirname, '../../extensions/react-devtools'));

// get the package.json file for the app (when in dev mode)
const PACKAGE_JSON = (() => {
    if (app.isPackaged) return {};
    return require("../../package.json");
})();
// set the app name and version from package.json or app.getXXX()
const APP_NAME = (() => {
    if (app.isPackaged) return app.getName();
    return PACKAGE_JSON.productName;
})();
// if the app is not packaged, update app version in the package.json file
const APP_VERSION = (() => {
    if (app.isPackaged) return app.getVersion();
    return updateAppVersion(PACKAGE_JSON);
})();

class DEAP {
    // quick reference to electron.app;
    static get app() {
        return app;
    }
    static get name() {
        return APP_NAME;
    }
    static get pack_json() {
        if (app.isPackaged) return {};
        return PACKAGE_JSON;
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
    static setup(config = {}, callback = () => {}) {
        this._tray = null;
        this._windows = {};
        this._config = config;
        // setup app instance lock and return if we are not the main instance
        this._can_launch = this.setInstanceLock();
        if (!this._can_launch) return;

        this.setAppPathDatas();
        // setup global logfile
        LoggyBoi.logpath = path.join(app.getPath("userData"), "app.log");
        LoggyBoi.setGlobalOptions({
            ...config.logger,
            file_options: {
                filename: LoggyBoi.logpath,
                options: { flags: "a", encoding: "utf8" },
            },
            // http_options: {
            //     port: 9699,
            //     host: '127.0.0.1',
            // }
        });
        this.logger = createLogger("deap");
        this.logger.info(app.getAppPath());
        this.setUserAgent("dekitarpg.com");
        this.setupDefaultIPC();
        this.setDatastore({
            name: "[dekita.palhub.data]",
            defaults: config.data_store,
        });
        if (callback) callback(this);
    }
    static setInstanceLock() {
        if (!app.isPackaged) return true;
        if (!this._config.single_instance) return true;
        // returns true if we are the main instance
        return app.requestSingleInstanceLock({}); 
    }
    static setAppPathDatas() {
        // serve the app from the app.asar file when packaged
        if (app.isPackaged) serve({ directory: "app" });
        // set the userData path to include (development) when in dev mode
        else app.setPath("userData", `${app.getPath("userData")} (development)`);
    } 
    static useLogger(id) {
        const logger = (action, ...args) => {
            const { idtag } = this.logger; // get the current idtag
            this.logger.idtag = id; // set the idtag to the id
            DEAP.logger[action](...args); // log the action to the console
            DEAP.logger.idtag = idtag; // reset the idtag to previous value
        };
        const logkeys = ["log", "info", "warn", "error", "fatal"];
        return logkeys.reduce((acc, key) => {
            return { ...acc, [key]: (...args) => logger(key, ...args) };
        }, {});
    }
    static setDatastore(store_options) {
        this._datastore = new Store(store_options);
        this.logger.info("Datastore initialized");
    }
    static setUserAgent(agent_str) {
        this._user_agent = `${APP_NAME} ${APP_VERSION} ${agent_str}`.trim();
        this.logger.info(`User-Agent: ${this._user_agent}`);
    }
    /**
     * ■ ipc handlers:
     */
    static setupDefaultIPC() {
        // default ipc handlers
        ipcMain.handle("get-name", (e) => APP_NAME);
        ipcMain.handle("get-version", (e) => APP_VERSION);
        ipcMain.handle("get-path", (event, key) => {
            if (key === "log") return LoggyBoi.logpath;
            if (key === "app") return app.getAppPath();
            return app.getPath(key);
        });
        ipcMain.handle("open-external", (event, url) => {
            shell.openExternal(url)
        });
        ipcMain.handle("open-file-location", (event, filepath) => {
            shell.showItemInFolder(filepath);
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
        ipcMain.handle("get-config", async (event, key, defaultvalue = null) => {
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
        ipcMain.handle("check-for-updates", async () => {
            if (app.isPackaged) autoUpdater.checkForUpdates();
        });
        ipcMain.handle("install-update", async () => {
            if (app.isPackaged) autoUpdater.quitAndInstall(true, true);
        });
        ipcMain.handle("app-action", async (event, id, action) => {
            this.logger.info(`app-action: ${id} -- ${action}`);
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
                    if (!id) return app.quit();
                    return this._windows[id].close();
            }
        });
        ipcMain.handle("get-window-id", async (event) => {
            return BrowserWindow.fromWebContents(event.sender)?.deap_id;
        });
        ipcMain.handle("check-image-path", async (event, pathtocheck = this._config.app_icon.ico) => {
            const thepath = path.join(__dirname, pathtocheck);
            return {
                path: thepath,
                valid: !nativeImage.createFromPath(thepath).isEmpty(),
            };
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
                enableRemoteModule: false,
                nodeIntegration: false,
                contextIsolation: true,
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
        this._windows[id].on("show", () => {
            // this._windows[id].webContents.send('deap-window-setup', id);
            if (this._onLoadWindowCB) {
                this._onLoadWindowCB(id, this._windows[id]);
                this._onLoadWindowCB = null;
            }
            this._windows[id].focus();
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
        let trayIcon;
        if (!app.isPackaged) trayIcon = this._config.app_icon.ico;// when in dev mode
        else trayIcon = path.join(__dirname, "./icon.ico"); // fix for packaged app
        this._tray = new Tray(nativeImage.createFromPath(trayIcon));
        const menu = this.createTrayMenu(windoe);
        this._tray.on("double-click", () => windoe.show());
        this._tray.setToolTip(windoe.title);
        this._tray.setContextMenu(menu);
    }
    static createTrayMenu(windoe) {
        return Menu.buildFromTemplate([
            { label: "Show", click: () => windoe.show() },
            { label: "Exit", click: () => {
                app.isQuiting = true;
                app.quit();
            }},
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
        this.logger.info(`Loading window: ${id}`);
        if (windoe.isVisible()) windoe.reload();
        else {
            if (app.isPackaged) await windoe.loadURL(`app://./${config.page}`);
            else await windoe.loadURL(`http://localhost:${process.argv[2]}/${config.page}`);
        }
    }
    // updates the 'auto-start at system boot' feature
    static updateAutoBootMode() {
        const openAtLogin = this._datastore.get("auto-boot");
        app.setLoginItemSettings({ openAtLogin });
    }
    static launch(callbacks = {}) {
        // if we are not the main instance, then quit the app
        if (!this._can_launch) return app.quit();
        // handle uncaught exceptions and rejections
        if (this._config.handle_rejections) {
            process.on("unhandledRejection", this?.logger?.error ?? console.error);
        }
        if (this._config.handle_exceptions) {
            process.on("uncaughtException", this?.logger?.error ?? console.error);
        }
        // setup app event listeners
        app.on("ready", () => this.onAppReady(callbacks));
        app.on("activate", () => this.onAppActivate(callbacks));
        app.on("before-quit", () => this.onBeforeQuitApp(callbacks));
        app.on("window-all-closed", () => this.onAppWindowsClosed(callbacks));
        // handles forwarding deep links for macOS
        app.on('open-url', (...args) => this.onAppOpenURL(...args)); 
        // handles forwarding deep links for windows / linux
        app.on("second-instance", (...args) => this.onSecondInstanceLaunched(callbacks, ...args)); 
        if (callbacks.onLoadWindow) this._onLoadWindowCB = callbacks.onLoadWindow;
    }
    static onAppReady(callbacks) {
        // setup for deep linking in packaged app
        if (app.isPackaged) {
            let extra_args = []; 
            if (process.defaultApp && process.argv.length >= 2) {
                extra_args = [process.execPath, [path.resolve(process.argv[1])]];
                this.logger.info(`deep-linking: ${extra_args.join(" --- ")}`);
            }
            app.setAsDefaultProtocolClient('dek-ue', ...extra_args);
        }
        this.createWindow("main"); // create main window when electron has initialized.
        if (callbacks.onAppReady) callbacks.onAppReady(this);
        setTimeout(() => this.initializeAutoUpdater(), 3000);
    }
    static onAppActivate(callbacks) {
        if (callbacks.onAppActivate) callbacks.onAppActivate(this);
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (!BrowserWindow.getAllWindows().length) this.createWindow("main");
    }
    static onAppWindowsClosed(callbacks) {
        if (callbacks.onAppWindowsClosed) callbacks.onAppWindowsClosed(this);
        if (process.platform !== "darwin") app.quit();
    }
    // cleanup any resources before quitting
    static onBeforeQuitApp(callbacks) {
        this.destroyTray();
        this.logger.info("Application is quitting...");
        if (callbacks.onBeforeQuitApp) callbacks.onBeforeQuitApp(this);
    }
    // someone tried to run a second instance of app
    static onSecondInstanceLaunched(callbacks, event, commandLine, workingDirectory) {
        if (!this._config.single_instance || !this.main_window) return;
        // if (this.main_window.isMinimized()) this.main_window.restore();
        if (callbacks.onSecondInstanceLaunched) callbacks.onSecondInstanceLaunched(this);
        // the commandLine is array of strings in which last element is deep link url
        this.main_window.webContents.send("open-deap-link", commandLine.pop());
        this.main_window.focus();
    }
    static onAppOpenURL(event, url) {
        event.preventDefault();
        // open-deep-link when macOS 
        if (process.platform === 'darwin') {
            this.logger.info(`open-deap-link[open-url]: ${url}`);
            this.main_window?.webContents?.send("open-deap-link", url);
        } else {
            this.logger.error(`IGNORED-open-deap-link: ${url}`);
        }
    }
    static initializeAutoUpdater() {
        this.logger.info(`initializing auto-updater: ${app.isPackaged}`);
        if (!app.isPackaged) {
            this.main_window?.webContents?.send("auto-updater", "not-packaged");
            return;
        }
        this.main_window?.webContents?.send("auto-updater", "initializing");
        // define listeners:
        const updater_events = ["checking-for-update", "update-available", "update-not-available", "download-progress", "update-downloaded", "before-quit-for-update", "error"];
        for (const event of updater_events) autoUpdater.on(event, (...data) => {
            this.main_window?.webContents?.send("auto-updater", event, ...data);
        });
        // begin checking updates:
        autoUpdater.checkForUpdates();
        // check for updates every hour
        setInterval(() => autoUpdater.checkForUpdates(), 1000 * 60 * 60); // 1 hour
    }
}

export default DEAP;

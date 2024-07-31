/**
* system: PalHUB Client
* author: dekitarpg@gmail.com
* 
* This file handles all configuration options for the palhub client.
* Config data is used to define how the app and windows behave.
*/

// load modules used for generating config:

import {randomUUID} from 'crypto';
import {join} from 'path';

// export the configuration:
export default {
    /**
    * dev_mode: 
    * flag to be used in development only!
    */
    dev_mode: process.env.NODE_ENV !== 'production',

    /**
    * show_debug: 
    * shows debug menu (javascript console) 
    * devmode must also be true for this to work <3
    */
    show_debug: true,

    /**
    * single_instance:
    * determines if the app is allowed to open multiple instances.
    * NOTE: if dev_mode is enabled, this will always be false. 
    */
    single_instance: true,

    /**
    * handle_rejections:
    * determine if DEAP should handle unhandled promise rejections
    */
    handle_rejections: true, 

    /**
    * app_icon:
    * defines the ico and png files for the app icon
    */
    app_icon: {
        ico: join(__dirname, '../resources/icon.ico'),
        png: join(__dirname, '../resources/icon.png'),
    },
    
    /**
    * logger:
    * options sent to the logger module
    */
    logger: {
        replacer: __dirname,      
    },

    /**
    * data_store:
    * Custom app specific configuration saved to appdata json file
    * these proeprties can be get/set from global.app_settings.
    */
     data_store: {
        'auto-boot': false,
        'auto-play': false,
        'auto-tiny': false,
        'tiny-tray': false,
        // creates a random uuid on first boot,
        // that uuid is then used afterwords
        'uuid': randomUUID(),
    },

    /**
    * windows:
    * defines each window used within the app
    */
    windows: {
        // window id
        main: {
            // the initial page to load for this window
            page: 'play',
            // size for window
            size: {
                w: 1280,
                h: 834,
                min_w: 420, 
                min_h: 360,
            },
            // the preload file to load for this window
            load: join(__dirname, './preload.js'),
            // various options for the window behaviour
            opts: {
                fullscreen: false,
                transparent: false,
                show_frame: false, 
            },
        },
        help: {
            page: 'help',
            size: {w: 640, h: 420},
            load: join(__dirname, './preload.js'),
            opts: {
                fullscreen: false,
                transparent: false,
                show_frame: false, 
            },
        },
    },

    // end of config
}
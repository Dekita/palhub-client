/**
 * @file: data-store.js
 * @author: dekitarpg@gmail.com
 */
(function datastore_wrapper() {
    'use strict';
    // use strict mode to enforce typing standards

    /**
     * ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
     * ■ Constants && Global Variables:..
     * ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
     */

    /**
     * development_mode
     * All required node modules
     */
    const path = require('path');
    const fs = require('fs');

    /**
     * ■■■■■■■■■■■■■■■■■■■
     * ■ DataStore {Class}
     * ■■■■■■■■■■■■■■■■■■■
     */
    class DataStore {
        /**
         * new DataStore(opts) {DataStore}
         * @param opts {object}
         * @param opts.filename {String}
         * @param opts.defaults {Object}
         */
        constructor(opts) {
            this.basepath = opts.dir_path || __dirname;
            this.path = path.join(this.basepath, opts.filename + '.json');
            this.data = this._readDataFile(this.path, opts.defaults);
            this.tout = opts.delay_ms || 1000;
            this._save_timeout_handle = null;
        }

        /**
         * {DataStore}.has(key)
         * @return boolean based on if 'key' property exists and is not falsy
         */
        has() {
            const [...argz] = arguments;
            return (
                argz.reduce((r, i) => {
                    if (r === null) return r;
                    if (r[i] === null || r[i] === undefined) return null;
                    const valid = typeof r[i] === 'object' && r[i] !== null;
                    return valid ? (r = r[i]) : (r = r !== null);
                }, this.data) !== null
            );
        }

        /**
         * {DataStore}.get(key)
         * @return 'key' property on the 'data' object
         */
        get(key) {
            return this.data[key];
        }

        /**
         * {DataStore}.get(key)
         * @return 'key' property on the 'data' object
         */
        objectGet(objkey, key) {
            return this.data[objkey][key];
        }

        /**
         * {DataStore}.set(key, value)
         * Sets 'key' property on the 'data' object to 'value'
         */
        set(key, val) {
            //console.log('setting:', key, val);
            this.data[key] = val;
            this._setSaveDataTimer();
            return this.data[key];
        }

        /**
         * {DataStore}.get(key)
         * @return 'key' property on the 'data' object
         */
        objectSet(objkey, key, val) {
            this.data[objkey][key] = val;
            this._setSaveDataTimer();
            return this.data[objkey][key];
        }

        /**
         * {DataStore}.unique_push(key, value)
         * pushes key: val onto object if it doesnt exist.
         * if array ensures only 1 mathing element exists.
         */
        unique_push(key, val) {
            var data = this.data[key];
            if (Array.isArray(data)) {
                if (data.indexOf(val) == -1) {
                    this.data[key].push(val);
                    this._setSaveDataTimer();
                }
            }
            return this.data[key];
        }
        /**
         * {DataStore}.delete(key, value)
         * deletes key from object.
         * if array ensures only deletes index with val.
         */
        delete(key, val) {
            var data = this.data[key];
            if (Array.isArray(data)) {
                var index = data.indexOf(val);
                if (index > -1) {
                    this.data[key].splice(index, 1);
                    this._setSaveDataTimer();
                }
            } else {
                this.data[key] = undefined;
            }
            return this.data[key];
        }
        /**
         * {DataStore}._setSaveDataTimer()
         * sets the save data timeout function
         */
        _setSaveDataTimer() {
            if (this._save_timeout_handle !== null) {
                clearTimeout(this._save_timeout_handle);
            }
            this._save_timeout_handle = setTimeout(() => {
                this._saveDataFile();
            }, this.tout);
        }
        /**
         * {DataStore}._saveDataFile()
         * writes the desired data file
         */
        _saveDataFile() {
            // console.log(`saved data file @: ${this.path}`)
            this._save_timeout_handle = null;
            // Wait, I thought using the node.js' synchronous APIs was bad form?
            // We're not writing a server so there's not nearly the same IO demand on the process
            // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
            // we might lose that data. Note that in a real app, we would try/catch this.
            try {
                const dirpath = path.dirname(this.path);
                if (!fs.existsSync(dirpath)) {
                    fs.mkdirSync(dirpath, { recursive: true });
                }
                fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
            } catch (error) {
                console.error(error);
            }
        }
        /**
         * {DataStore}._readDataFile(filePath, defaults)
         * @param filepath {String}
         * @param options {Object}
         * reads the desired data file
         */
        _readDataFile(filePath, defaults) {
            // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
            // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
            try {
                const fileContents = fs.readFileSync(filePath);
                const fileObject = JSON.parse(fileContents);
                for (let defaultname in defaults) {
                    const value = defaults[defaultname];
                    if (!fileObject[defaultname] && value !== null) {
                        fileObject[defaultname] = value;
                    }
                }
                return fileObject;
            } catch (error) {
                // if there was some kind of error, return the passed in defaults instead.
                return defaults || {};
            }
        }
    }

    /**
     * Export the module
     */
    module.exports = DataStore;

    /**
     * End module code
     */
})();

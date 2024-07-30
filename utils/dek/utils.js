const { DateTime, Duration } = require('luxon');
// const path = require('path');
// const fs = require('fs');

// variables used privately within class:
const boottime = Date.now();
Object.freeze(boottime);

/**
 * @class
 */
module.exports = class Utils {
    /**
     * returns Date object for when utils module was first accessed
     */
    static get BOOTTIME() {
        return boottime;
    }

    /**
     * @param {number} [milliseconds=1000] - number of ms to wait
     * @returns {Promise} that will resolve in number ms
     */
    static async wait(milliseconds = 1000) {
        return new Promise((r) => setTimeout(r, milliseconds));
    }
    /**
     * @param {number} max - the max number to get
     * @param {number} min - the min number to get
     * @returns {number} between max and min
     */
    static rand(max, min) {
        //const n = min || 0, x = max || 100;
        //return Math.floor(n + (Math.random()*(x-n)));
        const n = Math.ceil(min || 0);
        const x = Math.floor(max || 100);
        return Math.floor(Math.random() * (x - n)) + n;
        return Math.floor(Math.random() * (x - n + 1)) + n;
    }
    // returns random boolean
    static randBool() {
        return this.randFromArray([false, true]);
    }
    // returns random element from given array
    static randFromArray(array) {
        return array[this.rand(array.length)];
    }
    static arrayRand(array) {
        return this.randFromArray(array);
    }
    // returns random value from available object properties
    static randFromObject(object) {
        return object[this.randFromArray(Object.keys(object))];
    }
    // clamps value between min and max
    static clamp(value, max, min) {
        return Math.min(Math.max(parseInt(value), min || 0), max);
    }
    // get ms difference between now and given timestamp/date
    static getMSDiff(timestamp) {
        return new Date() - new Date(timestamp * 1000);
    }
    // return true if `date` is older than `mins` old
    static checkTimeDiff(date, mins) {
        const wait = 1000 * 60 * mins - 100;
        return this.getMSDiff(date) >= wait;
    }
    // returns a basic datestring
    static dateString(date = new Date(), type = 'en-US') {
        return date.toLocaleDateString(type);
    }
    // // requires a module, but also removes it from the cache first
    // // to ensure data returned is crispy fresh good <3
    // static freshRequire(modulename) {
    //     delete require.cache[require.resolve(modulename)];
    //     return require(modulename);
    // }
    // generates a random hex color code
    static generateHexColor(type2 = false) {
        if (!type2)
            return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        return `#${(0x1000000 + Math.random() * 0xffffff)
            .toString(16)
            .substr(1, 6)}`;
    }
    // capitalizes the given string
    static capitalize([char1, ...rest]) {
        return char1.toUpperCase() + rest.join('');
    }
    // checks if string is like a discord snowflake id
    static seemsFlakey(potential_flake) {
        return /^[0-9]{14,19}$/.test(potential_flake);
    }
    // returns true if given object is a valid number
    static isValidNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    }
    // returns true if given object is a valid string
    static isValidString(value) {
        return typeof value === 'string' && !!value;
    }
    // returns true if given string is a valid url
    static isValidURL(string) {
        return /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g.test(
            String(string)
        );
    }
    // returns true if given string is a valid image url
    static isImageURL(string) {
        if (!this.isValidURL(string)) return false;
        return /.(jpg|gif|png|jpeg)$/i.test(string);
    }
    static isFunction(variable) {
        if (!variable) return false;
        return variable instanceof Function || typeof variable === 'function';
    }
    // format string using object properties as replacers
    // eg: format("hi NAME!", {NAME: 'mr hankey'});
    static format(str, objekt) {
        const regstr = Object.keys(objekt).join('|');
        const regexp = new RegExp(regstr, 'gi');
        return str.replace(regexp, (matched) => {
            return objekt[matched.toLowerCase()];
        });
    }
    // format bytes number into MB, GB, etc
    // https://stackoverflow.com/a/18650828
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const value = (bytes / Math.pow(k, i)).toFixed(dm);
        return `${parseFloat(value)} ${sizes[i]}`;
    }
    // format time, using DateTime, based on format template:
    // const template = "HH:MM:SS PERIOD"
    // const template = "HH:MM:SS PERIOD"
    // const template = "HH:MM:SS";
    static formatTime(time = DateTime.now(), template = 'HH:MM PERIOD') {
        return this.format(template, {
            hh: String(time.hour).padStart(2, '0'),
            mm: String(time.minute).padStart(2, '0'),
            ss: String(time.second).padStart(2, '0'),
            period: `${time.hour > 12 ? 'PM' : 'AM'}`,
        });
    }
    static dateString(js_date = Date.now()) {
        const format = DateTime.DATETIME_MED_WITH_WEEKDAY;
        const datetime = DateTime.fromJSDate(new Date(js_date));
        return datetime.toLocaleString(format);
    }
    // format duration from given ms into years, days, hours, etc.
    static formatDuration(duration_ms) {
        let forced = false;
        const base_dur = Duration.fromMillis(duration_ms);
        const shift_args = ['years', 'days', 'hours', 'minutes', 'seconds'];
        const duration = base_dur.shiftTo(...shift_args).toObject();
        const template = shift_args
            .filter((type) => {
                if (duration[type] > 0) forced = true;
                return forced || type === 'seconds';
            })
            .join(', ');
        return this.format(template, {
            years: `${duration.years}y`,
            days: `${duration.days}d`,
            hours: `${duration.hours}h`,
            minutes: `${duration.minutes}m`,
            seconds: `${parseInt(duration.seconds)}s`,
        });
    }
    // randomize a given array!
    // @src https://stackoverflow.com/a/12646864
    // !note: destructive to initial array
    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    // recursively get all files from a given directory
    // example:
    // for await (const filepath of UTILS.getFiles('some/dir')) {}
    static async *getFiles(directory) {
        const readopts = { withFileTypes: true };
        const entries = await fs.promises.readdir(directory, readopts);
        for (const entry of entries) {
            const result = path.resolve(directory, entry.name);
            if (entry.isDirectory()) yield* this.getFiles(result);
            else yield result;
        }
    }

    // debounce some callback to only run every delay ms
    static debounce(callbaque, delay = 1000) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                callbaque(...args);
            }, delay);
        };
    }
    // throttle some callback to only run every delay ms
    static throttle(callbaque, delay = 1000) {
        let waiting_args = null;
        let waiting = false;
        const timeout = () => {
            if (waiting_args === null) {
                waiting = false;
            } else {
                callbaque(...waiting_args);
                waiting_args = null;
                setTimeout(timeout, delay);
            }
        };
        return (...args) => {
            if (waiting) {
                waiting_args = args;
                return;
            }
            waiting = true;
            callbaque(...args);
            setTimeout(timeout, delay);
        };
    }

    // race some promise against a timeout.
    static raceTimeout(promise, timeout = 5000) {
        return Promise.race([
            promise,
            new Promise((_, reject) => {
                setTimeout(() => reject('timeout'), timeout);
            }),
        ]);
    }

    // static wait(ms) {
    //     return new Promise(r => setTimeout(r, ms));
    // };
};

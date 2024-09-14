/**
* ■ package-updater.js
* author: dekitarpg@gmail.com
* stores information on how many times the app has been launched in dev mode! <3
* can save the data to a separate file and/or update package.json version automatically
*/

import { join } from 'path';
import { writeFileSync } from 'fs';
import DataStore from 'electron-store';
import freshRequire from './freshRequire';

const UPDATE_PACKAGE_VERSION = true;
const SAVE_TO_SEPERATE_FILE = false;

// max other version is never reached. always 1 below
// as when it reaches MAX, it will increment minor version
// which will then increment major version when minor reaches MAX
const MAX_OTHER_VERSION = 100;

export const updateAppVersion = (currentPackageJSON) => {
    // fallback default values for bootups/release/version
    let default_bootups = 0;
    let default_release = null;
    let default_version = null;
    // get default bootups/release/version from currentPackageJSON
    if (currentPackageJSON) {
        const { version, release } = currentPackageJSON;
        if (version) {
            const [major, minor, other] = version.split('.').map(Number);
            default_bootups = major * MAX_OTHER_VERSION * MAX_OTHER_VERSION + minor * MAX_OTHER_VERSION + other;
        }
        if (release) {
            const {date, time} = release;
            default_release = `${date}, ${time}`;
        }
        default_version = version;
    }
    // actually increment the version from bootups counter
    let new_bootups = default_bootups + 1;
    const major = Math.floor(new_bootups / MAX_OTHER_VERSION / MAX_OTHER_VERSION);
    const minor = Math.floor(new_bootups / MAX_OTHER_VERSION) % MAX_OTHER_VERSION;
    const other = new_bootups % MAX_OTHER_VERSION;
    const version = `${major}.${minor}.${other}`;
    const release = new Date().toLocaleString('en-US', { timeZone: 'UTC' });
    if (SAVE_TO_SEPERATE_FILE) {
        // datastore initializaer contained in this function
        // to avoid error when launch in production mode
        // or when not being saved to a separate file
        const devstore = new DataStore({
            cwd: join(__dirname, '..'),
            name: "[dekapp.version]",
            defaults: {
                bootups: default_bootups, // stores #times server/app rebooted
                release: default_release, // updates after each bootup
                version: default_version, // version based on #bootups
            },
        });
        devstore.set('bootups', new_bootups);
        devstore.set('version', version);
        devstore.set('release', release);
    }
    // update package.json version if enabled
    if (UPDATE_PACKAGE_VERSION && currentPackageJSON) {
        try { 
            const packagePath = join(__dirname, '..', 'package.json');
            const packageJSON = currentPackageJSON ?? freshRequire(packagePath);
            const [date, time] = release.split(', ');
            packageJSON.release = { date, time };
            packageJSON.version = version; 
            // // remove trailing zeros from version string if any
            // while (packageJSON.version.endsWith('0')) { 
            //     if (packageJSON.version.endsWith('.0')) break;
            //     packageJSON.version = packageJSON.version.slice(0, -1);
            // }
            const updatedJSON = JSON.stringify(packageJSON, null, 4);
            writeFileSync(packagePath, updatedJSON, { encoding: 'utf-8' });
            console.log('Updated package.json version:', packageJSON.version);
            // console.log('Updated package.json:', updatedJSON);
        } catch ( error ) {
            console.error('Error updating package.json:', error);
        }
    }
    return version;
}

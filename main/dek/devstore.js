/**
* ■ devstore.js
* author: dekitarpg@gmail.com
* application specific storage: doesnt handle user datas
* simply stores information on how many times the app
* has been launched in dev mode! <3
*/

import DataStore from 'electron-store';
import { join } from 'path';
import { writeFileSync } from 'fs';
import freshRequire from './freshRequire';

const UPDATE_PACKAGE_VERSION = true;

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
            default_bootups = major * 100 * 100 + minor * 100 + other;
        }
        if (release) {
            const {date, time} = release;
            default_release = `${date}, ${time}`;
        }
        default_version = version;
    }
    // datastore initializaer contained in this function
    // to avoid error when launch in production mode
    const devstore = new DataStore({
        cwd: join(__dirname, '..'),
        name: "[dekapp.version]",
        defaults: {
            bootups: default_bootups, // stores #times server/app rebooted
            release: default_release, // updates after each bootup
            version: default_version, // version based on #bootups
        },
    });
    // actually increment the version from bootups counter
    let new_bootups = devstore.get('bootups') + 1;
    const major = Math.floor(new_bootups / 100 / 100);
    const minor = Math.floor(new_bootups / 100) % 100;
    const other = new_bootups % 100;
    const version = `${major}.${minor}.${other}`;
    const release = new Date().toLocaleString('en-US', { timeZone: 'UTC' });
    devstore.set('bootups', new_bootups);
    devstore.set('version', version);
    devstore.set('release', release);
    // update package.json version if enabled
    if (UPDATE_PACKAGE_VERSION && currentPackageJSON) {
        try { 
            const packagePath = join(__dirname, '..', 'package.json');
            const packageJSON = currentPackageJSON ?? freshRequire(packagePath);
            const [date, time] = release.split(', ');
            packageJSON.release = { date, time };
            packageJSON.version = version; 
            // remove trailing zeros from version string if any
            while (packageJSON.version.endsWith('0')) { 
                packageJSON.version = packageJSON.version.slice(0, -1);
            }
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


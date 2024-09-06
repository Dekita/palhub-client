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

const devstore = new DataStore({
    cwd: join(__dirname, '..'),
    name: "[dekapp.version]",
    defaults: {
        bootups: 0, // stores #times server/app rebooted
        release: null, // updates after each bootup
        version: null, // version based on #bootups
    },
});

function updatePackageJSON(currentPackageJSON) {
    try { 
        const packagePath = join(__dirname, '..', 'package.json');
        const packageJSON = currentPackageJSON ?? freshRequire(packagePath);
        const [date, time] = devstore.get('release').split(', ');
        packageJSON.release = { date, time };
        packageJSON.version = devstore.get('version');
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

devstore.updateVersion = function updateVersion(currentPackageJSON) {
    let new_bootups = devstore.get('bootups') + 1;
    const major = Math.floor(new_bootups / 100 / 100);
    const minor = Math.floor(new_bootups / 100) % 100;
    const other = new_bootups % 100;
    const nuver = `${major}.${minor}.${other}`;
    devstore.set('bootups', new_bootups);
    devstore.set('version', nuver);
    devstore.set('release', new Date().toLocaleString('en'));
    if (UPDATE_PACKAGE_VERSION && currentPackageJSON) {
        updatePackageJSON(currentPackageJSON);
    }
    return nuver;
};

export default devstore;

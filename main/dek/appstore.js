/**
 * appstore.js
 * author: dekitarpg@gmail.com
 *
 * ■ appstore:
 * application specific storage: doesnt handle user datas
 * simply stores information on how many times the app
 * has been rebooted in dev mode!
 */
const DataStore = require('./data-store');

const appstore = new DataStore({
    dir_path: __dirname,
    filename: '../appdata/[dekita.dekbot][main]',
    delay_ms: 100, // delay in ms before save json file
    defaults: {
        bootups: 0, // stores #times server rebooted
        release: null, // updates after each bootup
        version: null, // version based on #bootups
    },
});

appstore.updateVersion = function () {
    let new_bootups = appstore.get('bootups') + 1;
    const major = Math.floor(new_bootups / 100 / 100);
    const minor = Math.floor(new_bootups / 100) % 100;
    const other = new_bootups % 100;
    const nuver = `${major}.${minor}.${other}`;
    appstore.set('bootups', new_bootups);
    appstore.set('version', nuver);
    appstore.set('release', new Date().toLocaleString());
    return nuver;
};

module.exports = appstore;

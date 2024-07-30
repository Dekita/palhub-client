
/** EXAMPLE: 
 
console.log ("Running RCON test!");
(async() => {
    console.log("-starting")
    // const result = await DekRCON.run({
    //     cmd: "Info",
    //     then: res=>console.log(res.trim()),
    //     error: console.error,
    //     close: ()=>console.log("rcon closed"),
    // });
    const result = await DekRCON.run("Info");
    console.log('result:', result)
    console.log("-finished")
})();

*/


const {RconClient} = require('./rcon-client');
const fs = require('fs');
const ini = require('ini');

// console.log('RconClient:', RconClient)

// import {RconClient} from './rcon-client'

// todo: read from env file or something
const CREDENTIALS  = {
    password: "",//"MyAwesomeTestPassword",
    host: "palworld", // "127.0.0.1",
    port: 25575,
}

async function getPasswordFromINI() {
    const ini_path = '/app/PalServer/Pal/Saved/Config/WindowsServer/PalWorldSettings.ini';
    const ini_file = await fs.promises.readFile(ini_path, 'utf-8');
    const parsed_ini = ini.parse(ini_file);
    const PalScript = parsed_ini['/Script/Pal'];
    const {PalGameWorldSettings} = PalScript;
    const {OptionSettings} = PalGameWorldSettings;
    // replace the () around the OptionSettings values and parse into usable object
    const ReplOptionSettings = OptionSettings.replace(/^\(|\)$/g, '').replace(/\,/g, "\n");
    const OptionSettingsObject = ini.parse(ReplOptionSettings);    
    return OptionSettingsObject.AdminPassword
}


// export default class DekRCON {
module.exports = class DekRCON {

    static prepare(cmd_or_options) {
        return {
            then:()=>{}, 
            error:console.error, 
            close:()=>{},
            cmd: cmd_or_options,
            ...cmd_or_options,
        };
    }

    static async run(cmd_or_options, pwd=null) {
        const {cmd, then, error, close} = this.prepare(cmd_or_options);
        try {
            const credentials = {...CREDENTIALS};
            // if (!!!pwd) credentials.password = pwd;
            credentials.password = await getPasswordFromINI();
            // console.log('rcon credentials:', credentials)
            const rcon = new DekRCON(credentials,false);
            await rcon.connect();
            const result = await rcon.cmd(cmd)
            await rcon.close();
            await then(result);
            return result;
        } catch (e) {
            error(e);
        }
        return null;
    }

    constructor(credentials = CREDENTIALS, auto_connect = true) {
        this.credentials = credentials;
        if (auto_connect) this.connect();
    }

    async connect() {
        this.rcon = await RconClient.connect(this.credentials);
        return this.rcon
    }

    async cmd(cmd) {
        return (await this.rcon.cmd(cmd)).trim();
    }

    async close() {
        return await this.rcon.close();
    }

}


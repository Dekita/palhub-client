/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import { Client } from '../dek/palhub';

// export default 
export default async (event, action, ...args) => {
    if (!Client[action]) return console.error(`PalHUB function ${action} not found`);
    return await Client[action](...args);
}
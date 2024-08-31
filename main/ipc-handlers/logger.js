/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import DEAP from "../dek/deap";

const logger_cache = {};

// export default 
export default async (event, id, action, ...args) => {
    if (!logger_cache[id]) logger_cache[id] = DEAP.useLogger(id);
    if (logger_cache[id][action]) logger_cache[id][action](...args);
}
/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import Dekache from "dekache";
import Store from "electron-store";
import { Client } from '../dek/palhub';


// a basic cache for the nexus API to prevent unnecessary requests
const nexusApiCache = new Dekache({ name: "need some cache bruh?", mins: 5 });

// a more long term cache for persistent storage of mod data
const nexusApiModDataStore = new Store({ name: "nexusApiModData" });
const lengthOfOneHour = 1000 * 60 * 60;
const lengthOfOneDay = lengthOfOneHour * 24;
const lengthOfOneWeek = lengthOfOneDay * 7;

// functions that should be cached within the data store and their cache duration
const nexusFunctionsToCache = {
    getModInfo: lengthOfOneDay,
    getModFiles: lengthOfOneHour,
    getDownloadURLs: lengthOfOneHour,
    getLatestAdded: lengthOfOneHour,
    getLatestUpdated: lengthOfOneHour,
    getTrending: lengthOfOneHour,
    getTrackedMods: lengthOfOneHour,
}

export default async (event, api_key, functionName, ...functionArgs) => {
    const getUncachedValue = async () => {
        const nexus = await Client.ensureNexusLink(api_key);
        if (!nexus[functionName]) return console.error(`Nexus function ${functionName} not found`);
        try {
            return await nexus[functionName](...functionArgs);
        } catch (error) {
            console.error(`Nexus function ${functionName} failed`, error);
        }
        return null;
    }
    // return uncached value when checking rate limit, as each other request 
    // will also update the rate limit data, so we don't need to cache it.
    if (functionName === 'getRateLimits') return await getUncachedValue();

    // create a cache key based on the function name and arguments
    const cache_key = `${functionName}-${JSON.stringify(functionArgs)}`;

    let result = null;
    let forced = false;

    // if the function is getModData, check if we are force updating data
    if (functionName === 'getModInfo') forced = functionArgs[1] === true;

    if (nexusFunctionsToCache[functionName]) {
        const cached = nexusApiModDataStore.get(cache_key, null);
        // if the cache is not forced and the cache duration is not expired, return the cached value
        if (!forced && cached?.cache_time) {
            const cache_time = cached.cache_time;
            const cache_duration = Date.now() - cache_time;
            const cache_limit = nexusFunctionsToCache[functionName];
            if (cache_duration < cache_limit) return cached;
        }
        // else, get the uncached value and set
        result = await nexusApiCache.get(cache_key, getUncachedValue);
        result.cache_time = Date.now(); // add cache time to the result
        nexusApiModDataStore.set(cache_key, result);
    } else {
        // get the cached value or get the uncached value then set the cache and return the result
        result = await nexusApiCache.get(cache_key, getUncachedValue);
    }

    return result;
}
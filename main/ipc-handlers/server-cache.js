/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import DEAP from "../dek/deap";
import Store from "electron-store";

// Create a new instance of electron-store for handling
// user specific data storage.
const serverPasswordCache = new Store({ name: "[dek.ue.server.pass]" });

// export default 
export default async (event, action, key, value) => {
    switch (action) {
        // handle uStore events that DO desire a return value:
        case "get": return serverPasswordCache.get(key, value);
        // handle uStore events that do NOT desire a return value:
        case "set": return serverPasswordCache.set(key, value);
        case "delete": return serverPasswordCache.delete(key);
        case "clear":  return serverPasswordCache.clear();
    }
}
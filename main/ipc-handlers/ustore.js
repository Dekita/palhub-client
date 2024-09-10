/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import DEAP from "../dek/deap";

export default async (event, action, key, value) => {
    //!TEMP: key switcher until all other modules are updated
    const switchable_keys = {
        "cache_dir": "app-cache",
        "api_key": "api-keys.nexus",
        "game_path": "games.palworld.path",
    }
    if (switchable_keys[key]) {
        const old_key = key;
        key = switchable_keys[key];
        console.log(`switched key from ${old_key} to ${key}`);
    }
    // console.log(`ustore: ${action} ${key} ${value}`);
    switch (action) {
        // handle uStore events that DO desire a return value:
        case "get": return DEAP.datastore.get(key, value);
        // handle uStore events that do NOT desire a return value:
        case "set": return DEAP.datastore.set(key, value);
        case "delete": return DEAP.datastore.delete(key);
        case "clear":  return DEAP.datastore.clear();
    }
}

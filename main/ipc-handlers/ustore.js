/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import Store from "electron-store";

// Create a new instance of electron-store for handling
// user specific data storage.
const uStoreData = new Store({ name: "uStoreData" });

// export default 
export default async (event, action, key, value) => {
    switch (action) {
        // handle uStore events that DO desire a return value:
        case "get": return uStoreData.get(key, value);
        // handle uStore events that do NOT desire a return value:
        case "set": return uStoreData.set(key, value);
        case "delete": return uStoreData.delete(key);
        case "clear":  return uStoreData.clear();
    }
}

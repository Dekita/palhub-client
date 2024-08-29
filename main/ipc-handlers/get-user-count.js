/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import DEAP from "../dek/deap";
import DAPI from "../dek/api";

export default async () => {
    // if (!DEAP.app.isPackaged) return 0;
    return await DAPI.getUserCount({
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        uuid: DEAP.datastore.get("uuid"),
        version: DEAP.version,
    });
}
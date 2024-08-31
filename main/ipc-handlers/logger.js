/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import DEAP from "../dek/deap";

// export default 
export default async (event, id, action, ...args) => {
    const {idtag} = DEAP.logger; // get the current idtag
    DEAP.logger.idtag = id; // set the idtag to the id
    await DEAP.logger[action](...args); // log the action to the console
    DEAP.logger.idtag = idtag; // reset the idtag to previous value
}
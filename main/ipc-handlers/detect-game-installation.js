/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import detectSteamGameInstallation from "../dek/detectSteamGame";
// import detectXboxGameInstallation from ".../dek/detectXboxGame";

export default async () => {
    // await detectXboxGameInstallation("palworld");
    return await detectSteamGameInstallation("1623730");
}
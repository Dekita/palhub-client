/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
export default async function wait(milliseconds = 1000) {
    return new Promise((r) => setTimeout(r, milliseconds));
}
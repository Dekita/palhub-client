/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
let isDevEnvironment = false;

if (process && process.env.NODE_ENV === 'development') {
    isDevEnvironment = true;
}

export { isDevEnvironment };

'use client';/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
Used to create a logger wrapper for the application logger
*/
export default function useAppLogger(id) {
    // return a function that will log to the application logger using id
    return async (action, ...args) => {
        if (typeof window === 'undefined' || !window?.ipc) return; // Ensure window ipc is defined
        await window.ipc.invoke('logger', `[${id}]`, action, ...args);
    }
}

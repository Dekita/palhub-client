
import React from 'react';


const openFileLocation = async() => {
    const logPath = logPageID === 0 ? app_log_path : ue4ss_log_path;
    try { await window.ipc.invoke('open-file-location', logPath) } 
    catch (error) { applog('error', error.message) }
};

export default openFileLocation;

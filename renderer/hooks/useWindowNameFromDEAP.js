/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import { useEffect, useState } from 'react';

export default function useWindowNameFromDEAP() {
    const [windowName, setWindowName] = useState('');
    useEffect(() => {
        if (!window.ipc) return;
        const remove_ue4ss_handler = window.ipc.on('deap-window-setup', (window_name) => {
            if (!window_name || windowName.length) return;
            console.log('deap-window-setup', window_name);
            setWindowName(window_name);
        });
        return () => remove_ue4ss_handler();
    }, [windowName]);
    return windowName;
}
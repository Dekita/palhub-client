/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import { useEffect, useState } from 'react';

export default function useWindowNameFromDEAP() {
    const [windowName, setWindowName] = useState('');
    useEffect(() => {
        if (!window.ipc || windowName.length) return;
        (async()=>{
            const name = await window.ipc.invoke('get-window-id');
            if (!name) return;
            console.log('get-window-name', name);
            setWindowName(name);
        })();
    }, [windowName]);
    return windowName;
}
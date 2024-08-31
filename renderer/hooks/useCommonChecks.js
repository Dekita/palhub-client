/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import { useRouter } from 'next/router';

export default function useCommonChecks() {
    const [commonData, setCommonData] = React.useState(null);
    const router = useRouter();

    const onRunCommonChecks = React.useCallback(() => {
        if (typeof window === 'undefined') return false;
        return window && window.ipc; //&& window.uStore && window.palhub && window.nexus && window.logger;
    }, []);

    React.useEffect(() => {
        if (!onRunCommonChecks()) return applog('error','modules not loaded');
        (async () => {
            const api_key = await window.uStore.get('api_key');
            if (!api_key) return router.push('/settings');
            
            const game_path = await window.uStore.get('game_path');
            if (!game_path) return router.push('/settings');
            
            const game_data = await window.palhub('validateGamePath', game_path);
            if (!game_data.has_exe) return router.push('/settings');
            if (!game_data.has_ue4ss) return router.push('/settings');

            setCommonData({ api_key, game_path, game_data });
        })();
    }, []);

    return [commonData, onRunCommonChecks];
}
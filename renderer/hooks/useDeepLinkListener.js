/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React, { useCallback, useEffect, useState } from 'react';
import useAppLogger from './useAppLogger';

// Context for Localization
const DeepLinkContext = React.createContext();

// dek-ue://???
function parseDeepLink(deepLink) {
    // Parse the deep link
    const url = new URL(deepLink);
    // Ensure the protocol is correct
    if (url.protocol !== 'dek-ue:') {
        logger('error', `Invalid DEAP Link Protocol: ${url.protocol}`);
        return { segments: [], params: {} };
    }
    // Split and filter to get path segments
    const segments = url.pathname.split('/').filter(Boolean); 
    // Use URLSearchParams to extract query parameters
    const params = Object.fromEntries(url.searchParams.entries());
    // Return the segments and params
    return { segments, params };    
}

// nxm://palworld/mods/2017/files/8213?key=KWVYopKUGVMi42jyp9mt_Q&expires=1735734581&user_id=51283421
function parseDeepLinkNXM(link) {
    const url = new URL(link);
    if (url.protocol !== 'nxm:') {
        return { segments: [], params: {} };
    }
    const splits = url.pathname.split('/');
    const segments = splits.filter(Boolean);
    const params = Object.fromEntries(url.searchParams.entries());
    const [game_slug, page_type, mod_id, link_type, file_id] = segments;

    return { game_slug, mod_id, file_id, ...params };
}

// DeepLink Provider Component
export const DeepLinkProvider = ({ children }) => {
    const [deepLink, setDeepLink] = useState('');
    const [linkChanged, setLinkChanged] = useState(false);
    const logger = useAppLogger('hooks/useDeepLinkListener');

    useEffect(() => {
        if (!window.ipc || deepLink.length) return;
        const removeLinkListener = window.ipc.on('open-deap-link', (link) => {
            logger('info', `Received DEAP Link: ${link}`);
            setDeepLink(link);
        });
        return () => removeLinkListener();
    }, []);

    useEffect(() => {
        if (!deepLink) return;
        setLinkChanged(true);
    }, [deepLink]);

    const consumeDeepLink = useCallback(() => {
        if (!deepLink) return;
        const consumed = parseDeepLinkNXM(deepLink);
        setLinkChanged(false);
        setDeepLink(null);
        return consumed;
    }, [deepLink]);

    const exposed = [deepLink, linkChanged, consumeDeepLink];
    return <DeepLinkContext.Provider value={exposed}>{children}</DeepLinkContext.Provider>;
};

// Export actual hook to useLocalization
export default function useDeepLinkListener() {
    return React.useContext(DeepLinkContext);
}

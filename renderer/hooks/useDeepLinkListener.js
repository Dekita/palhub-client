/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React, { useCallback, useEffect, useState } from 'react';
import useAppLogger from './useAppLogger';

// Context for Localization
const DeepLinkContext = React.createContext();


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
        setLinkChanged(false);
        setDeepLink(null);
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
    }, [deepLink]);

    const exposed = [deepLink, linkChanged, consumeDeepLink];
    return <DeepLinkContext.Provider value={exposed}>{children}</DeepLinkContext.Provider>;
};

// Export actual hook to useLocalization
export default function useDeepLinkListener() {
    return React.useContext(DeepLinkContext);
}

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
    }, [deepLink]);

    useCallback(() => {
        if (!deepLink) return;
        setLinkChanged(true);
    }, [deepLink]);

    const consumeDeepLink = useCallback(() => {
        if (!deepLink) return;
        setLinkChanged(false);
        setDeepLink(null);
    }, [deepLink]);

    const exposed = [deepLink, linkChanged, consumeDeepLink];
    return <DeepLinkContext.Provider value={exposed}>{children}</DeepLinkContext.Provider>;
};

// Export actual hook to useLocalization
export default function useDeepLinkListener() {
    return React.useContext(DeepLinkContext);
}

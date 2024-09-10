/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import { useRouter } from 'next/router';
// import useSelectedGame from './useSelectedGame';
import useAppLogger from './useAppLogger';

// Context for Localization
const CommonAppDataContext = React.createContext();


// CommonAppData Provider Component
export const CommonAppDataProvider = ({ children }) => {
    const applog = useAppLogger("hooks/useCommonChecks");
    const [requiredModulesLoaded, setRequiredModulesLoaded] = React.useState(false);
    const [commonAppData, setCommonAppData] = React.useState(null);
    const updateCommonAppData = React.useCallback((key, value) => {
        setCommonAppData(prev => ({ ...prev, [key]: value }));
    }, []);

    const refreshApis = React.useCallback(async () => {
        if (!requiredModulesLoaded) return;
        const apis = await window.uStore.get('api-keys');
        updateCommonAppData('apis', apis);
    }, [requiredModulesLoaded]);

    const refreshCache = React.useCallback(async () => {
        if (!requiredModulesLoaded) return;
        const cache = await window.uStore.get('app-cache');
        updateCommonAppData('cache', cache);
    }, [requiredModulesLoaded]);

    const refreshGames = React.useCallback(async () => {
        if (!requiredModulesLoaded) return;
        const games = await window.uStore.get('games');
        updateCommonAppData('games', games);
    }, [requiredModulesLoaded]);

    const updateSelectedGame = React.useCallback(async (game) => {
        if (!games[game.id]) return;
        const data = await window.palhub('validateGamePath', game.path);
        updateCommonAppData('selectedGame', { ...game, data });
        await window.uStore.set('games.active', game.id);
    }, []);    

    // function to redirect to settings if required modules are loaded
    // 
    const router = useRouter();
    const refreshCommonDataWithRedirect = React.useCallback(async () => {
        // get the api keys, cache, and games
        const apis  = await window.uStore.get('api-keys');
        const cache = await window.uStore.get('app-cache');
        const games = await window.uStore.get('games');
        // if no api keys are set, redirect to settings
        Object.values(apis).find(api => api === null) && router.push('/settings');
        // if no cache is set, redirect to settings
        !cache && router.push('/settings');

        // check if the selected game is valid and set the data if it is
        let selectedGame = null;
        if (games?.[games?.active]?.path) {
            try {
                const game = games[games.active];
                const data = await window.palhub('validateGamePath', game.path);
                selectedGame = { id: games.active, ...game, ...data };
            } catch (error) {
                console.error(error);
            }
        }
        
        // set the commonly used app datas
        setCommonAppData(prev => ({apis, cache, games, selectedGame}));
        setRequiredModulesLoaded(true);
    }, []);

    // ensures that all required modules are fully loaded
    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        const REQUIRED_MODULES = ['uStore', 'palhub', 'logger', 'ipc'];
        if (REQUIRED_MODULES.some(module => !window[module])) return;
        refreshCommonDataWithRedirect();
    }, []);

    const exposed = { requiredModulesLoaded, commonAppData, updateCommonAppData, updateSelectedGame };
    return <CommonAppDataContext.Provider value={exposed}>{children}</CommonAppDataContext.Provider>;
};

// Export actual hook to useLocalization
export default function useCommonChecks() {
    return React.useContext(CommonAppDataContext);
}

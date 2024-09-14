/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import { useRouter } from 'next/router';
// import useSelectedGame from './useSelectedGame';
import useLocalization from './useLocalization';
import useAppLogger from './useAppLogger';

// Context for Localization
const CommonAppDataContext = React.createContext();


// CommonAppData Provider Component
export const CommonAppDataProvider = ({ children }) => {
    const { t, tA, ready } = useLocalization();
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
        // todo
    }, []);

    const updateSelectedGamePath = React.useCallback(async (game_id, new_path) => {
        const games = await window.uStore.get('games');
        const game = games[game_id];
        if (!game) return;
        // update the game path stored in the uStore 
        await window.uStore.set(`games.${commonAppData.games.active}.path`, new_path);
        // validate the new path and update the selected game data
        const data = await window.palhub('validateGamePath', new_path);
        const idname = { id: game_id, name: t(`games.${game_id}.name`) };
        const selectedGame = { ...idname, ...game, ...data };
        updateCommonAppData('selectedGame', selectedGame);
        await window.uStore.set('games.active', game_id);
    }, [commonAppData?.games?.active]); 

    // 
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
                const idname = { id: games.active, name: t(`games.${games.active}.name`) };
                selectedGame = { ...idname, ...game, ...data };
            } catch (error) {
                console.error(error);
            }
        }
        
        // set the commonly used app datas
        setCommonAppData(prev => ({apis, cache, games, selectedGame}));
        setRequiredModulesLoaded(true);
    }, [ready]);

    // ensures that all required modules are fully loaded
    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        const REQUIRED_MODULES = ['uStore', 'palhub', 'logger', 'ipc'];
        if (REQUIRED_MODULES.some(module => !window[module])) return;
        refreshCommonDataWithRedirect();
    }, [ready]);

    return <CommonAppDataContext.Provider value={{
        requiredModulesLoaded, 
        commonAppData, 
        refreshApis,
        refreshCache,
        refreshGames,
        updateSelectedGamePath, 
        refreshCommonDataWithRedirect,
    }}>{children}</CommonAppDataContext.Provider>;
};

// Export actual hook to useLocalization
export default function useCommonChecks() {
    return React.useContext(CommonAppDataContext);
}

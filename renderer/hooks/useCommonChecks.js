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

    const updateSelectedGame = React.useCallback(async (tempGame=null, callmemaybe=()=>{}) => {
        const game_id = tempGame?.id ?? 'undefined';
        const store_id = getStoreID(game_id, tempGame);
        console.log('updating selected game:', store_id);
        const path = await window.uStore.get(store_id);
        const data = await window.palhub('validateGamePath', path);
        const idname = { id: game_id, name: t(`games.${data.id}.name`) };
        const selectedGame = { ...idname, ...data };
        updateCommonAppData('selectedGame', selectedGame);

        const active_id = getStoreID(selectedGame.id, selectedGame, false);
        await window.uStore.set('games.active', active_id);
        // call the callback function when the game id is updated
        callmemaybe(selectedGame);
    }, [t]);

    const getStoreID = React.useCallback((game_id, tempGame=null, prefixGames=true) => {
        const prefix = prefixGames ? 'games.' : '';
        let store_id = `${prefix}${game_id}`;
        if (tempGame && game_id !== 'undefined') {
            store_id = `${prefix}${tempGame.id}.${tempGame.type}.${tempGame.launch_type}`;
        }
        return store_id;
    }, []);

    const updateSelectedGamePath = React.useCallback(async (tempGame, new_path, callmemaybe=()=>{}) => {
        const game_id = tempGame?.id ?? 'undefined';

        // update the game path stored in the uStore 
        const store_id = getStoreID(game_id, tempGame);
        console.log('updating path:', store_id, new_path);
        await window.uStore.set(store_id, new_path);

        // validate the new path and update the selected game data
        const data = await window.palhub('validateGamePath', new_path);
        const idname = { id: game_id, name: t(`games.${data.id}.name`) };
        const selectedGame = { ...idname, ...data };
        updateCommonAppData('selectedGame', selectedGame);
        // use selectedGame.id as id may change from data returned via 
        // validating the path. game_id is 'undefined' when a new/unknownn game is
        // being added. the validation step will return the correct id.
        // as long as the game is supported. 
        const active_id = getStoreID(selectedGame.id, selectedGame, false);
        await window.uStore.set('games.active', active_id);

        if (game_id === 'undefined' && selectedGame.id !== game_id) {
            // if selected game.id is different from the game_id, 
            // then its safe to use data.is as the new game id to update the store
            await window.uStore.set(getStoreID(selectedGame.id, selectedGame), new_path);
            // remove the undefined datas
            await window.uStore.delete(`games.undefined`);
            // call the callback function when the game id is updated
            callmemaybe(selectedGame);
            console.log('updated selected game:', selectedGame);
        }
    }, [t, commonAppData?.games?.active]); 

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
        if (games?.active) {
            try {
                const game_path = await window.uStore.get(`games.${games.active}`);
                // const game = games[games.active];
                const data = await window.palhub('validateGamePath', game_path);
                selectedGame = { ...data, name: t(`games.${games.active}.name`) };
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
        updateSelectedGame,
        updateSelectedGamePath, 
        refreshCommonDataWithRedirect,
    }}>{children}</CommonAppDataContext.Provider>;
};

// Export actual hook to useLocalization
export default function useCommonChecks() {
    return React.useContext(CommonAppDataContext);
}

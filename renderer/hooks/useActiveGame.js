
import React from 'react';
import useCommonChecks from './useCommonChecks';
import useLocalization from "./useLocalization";


export default function useActiveGame() {
    const { commonAppData } = useCommonChecks();
    const { t } = useLocalization();
    
    const gamesArray = React.useMemo(()=> {
        const gamesArray = [];
        const game = commonAppData?.selectedGame;
        for (const [id, data] of Object.entries(commonAppData?.games)) {
            if (id === 'active') continue;
            for (const [type, platform_data] of Object.entries(data)) {
                for (const [launch_type, path] of Object.entries(platform_data)) {
                    const active = game?.id === id && game?.type === type && game?.launch_type === launch_type;
                    gamesArray.push({id, type, launch_type, path, active, name: t(`games.${id}.name`)});
                }
            }
        }
        // console.log('refreshing memoized datas', gamesArray);
        return gamesArray;
    }, [commonAppData]);

    const activeGame = gamesArray.find(g => g.active);
    const selectedGameID = gamesArray.indexOf(activeGame);

    return {gamesArray, activeGame, selectedGameID};
}



import React from 'react';
import useCommonChecks from '@hooks/useCommonChecks';
import useLocalization from '@hooks/useLocalization';
import DekSelect from '@components/core/dek-select';
import GameCardComponent, {PlatformIcon} from '@components/game-card';


export default function ActiveGameSelector({gamesArray, selectedGameID, setTempGame=null, className='col-12 pb-3'}) {
    const { commonAppData, updateSelectedGame } = useCommonChecks();
    const api_key = commonAppData?.apis?.nexus;

    const onChangeSelectedGame = React.useCallback(async(event, selected_text, target_text, index) => {
        updateSelectedGame(gamesArray[index], async (game) => {
            const slug = game.map_data.providers.nexus;
            await window.nexus(api_key, 'setGame', slug);
            if (setTempGame) await setTempGame(game);
        });
    }, [updateSelectedGame, gamesArray]);

    React.useEffect(() => {
        if (selectedGameID === -1 && gamesArray.length > 0) {
            updateSelectedGame(gamesArray[0]);
        }
    }, [selectedGameID, gamesArray]);

    const { t } = useLocalization();
    const iconOptions = {height:'1.8rem', style:{marginTop:-4}};
    return <div className={className}>
        <DekSelect active_id={selectedGameID} onChange={onChangeSelectedGame}>
        {gamesArray.map(({id, type, launch_type, path, active}) => {
            return <dekItem key={`selector-${id}-${type}-${launch_type}`} text="hi">
                <PlatformIcon type={type} options={iconOptions} />
                {`${t(`games.${id}.name`)} `}
                {launch_type !== 'game' && t(`common.app-types.${launch_type}`)}
                {/* {` - ${path}`} */}
            </dekItem>
        })}
        </DekSelect>
    </div>;
}
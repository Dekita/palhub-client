
import React from 'react';
import useActiveGame from '@hooks/useActiveGame';
import useLocalization from '@hooks/useLocalization';
import GradientBanner from '@components/core/gradient-banner';
import ActiveGameSelector from '@components/active-game-selector';

export default function ColorfulGameSelector() {
    const { t } = useLocalization();
    const {gamesArray, selectedGameID} = useActiveGame();

    return <GradientBanner height={72}>
        <div className='row'>
            <div className='col-auto py-3'>
                <p className='font-bold mb-0'>{t('common.select-game')}</p>
            </div>
            <div className='col'>
                <ActiveGameSelector {...{selectedGameID, gamesArray, className:'py-2'}} />
            </div>
        </div>
    </GradientBanner>
} 


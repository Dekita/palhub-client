/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

// InputComponent.js
import React from 'react';
import Col from 'react-bootstrap/Col';
// import Image from 'next/image';
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
// import { SphereSpinner } from 'react-spinners-kit';
import DOMPurify from 'dompurify';
// import Link from 'next/link';

import * as CommonIcons from '@config/common-icons';
import useLocalization from '@hooks/useLocalization';
import useSelectedGame from '@hooks/useSelectedGame';
import useCommonChecks from '@hooks/useCommonChecks';
import isDevEnvironment from '@utils/isDevEnv';

export default function gameCardComponent({ id, path, onClick=()=>{}, tempGame=null }) {
    const {requiredModulesLoaded, commonAppData, updateSelectedGame} = useCommonChecks();
    const [gameData, setGameData] = React.useState(null);
    const IconComponent = CommonIcons.star;
    const { t, tA } = useLocalization();
    
    const realOnClick = React.useCallback(() => {
        if (gameData) onClick(gameData);
    }, [gameData, onClick]);

    // const games = commonAppData?.games;
    // const game = games[id];

    React.useEffect(()=>{
        if (!requiredModulesLoaded || !path) return;
        (async () => {
            try {
                const data = await window.palhub('validateGamePath', path);
                setGameData({ name: t(`games.${id}.name`), ...data });
                // console.log('gameData:', data);
            } catch (error) {
                console.error(error);
            }
        })();
    }, [requiredModulesLoaded, path, tempGame?.id, tempGame?.has_ue4ss]);
    
    // console.log({id, game, ta: tA(`/games.${id}.info`)})

    // if (!path) return null;

    // console.log('gameData:', gameData);

    // when not dev environment and game is hidden, return null
    if (!isDevEnvironment() && gameData?.map_data?.is_hidden) return null;

    return <Col xs={12} md={6} lg={6} xl={4} className='mb-2' onClick={realOnClick}>
    {/* return <Col xs={12} md={6} lg={4} xl={3} className='mb-2' onClick={realOnClick}> */}
        <Card className='theme-border chartcard cursor-pointer'>
            <Card.Body className='text-start p-0'>
                <Card.Title className='p-1'>
                    <div className="ratio ratio-16x9">
                        <Image src={`/img/${id}/game-logo.jpg`} alt="Game Logo Image" fluid thumbnail />
                    </div>
                    <div className='modcard set-topleft p-1 bg-info'>
                        <PlatformIcon type={gameData?.type} />
                        {gameData?.launch_type === 'server' && <div className='d-inline-block'>
                            <strong className='px-1 py-0'><small>{t(`common.app-types.${gameData?.launch_type}`)}</small></strong>
                        </div>}

                    </div>
                </Card.Title>
                <div className='anal-cavity large px-2 pb-2'>
                    <div className='text-white'>
                        {/* {tA(`games.${id}.info`).map((line, idx) => <p key={idx} className="mb-0">{line}</p>)} */}
                        {t(`games.${id}.info.0`)}
                    </div>
                </div>
            </Card.Body>
        </Card>
    </Col>;
}

export function PlatformIcon({type, options={}}) {
    options = {fill:'currentColor', className:'text-white p-1', height:'2rem', width:'2rem', ...options};
    switch (type) {
        case 'xbox': return <CommonIcons.xbox {...options} />
        case 'steam': return <CommonIcons.steam {...options} />
        case 'epic': return <CommonIcons.epic {...options} className="text-white p-0"/> // no padding for this one <3
        // case 'gog': return <CommonIcons.gog {...options} />
        // case 'uplay': return <CommonIcons.uplay {...options} />
        // case 'origin': return <CommonIcons.origin {...options} />
        // case 'battle': return <CommonIcons.battle {...options} />
        // case 'rockstar': return <CommonIcons.rockstar {...options} />
        // case 'bethesda': return <CommonIcons.bethesda {...options} />
        // case 'microsoft': return <CommonIcons.microsoft {...options} />
        default : return null;
    }
}
    
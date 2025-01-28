/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import Image from 'react-bootstrap/Image';
import CheckModsModal from '@components/modals/mod-check';
import LoadListModal from '@components/modals/load-list';
import PlayVanillaModal from '@components/modals/play-vanilla';
import useLocalization from '@hooks/useLocalization';
import useCommonChecks from '@hooks/useCommonChecks';
import useAppLogger from '@hooks/useAppLogger';


import useActiveGame from '@hooks/useActiveGame';
import ActiveGameSelector from '@components/active-game-selector';
// import GradientBanner from '@components/core/gradient-banner';
import ColorfulGameSelector from '@components/colorful-game-selector';



export default function PlayPage() {
    const { t, tA } = useLocalization();
    const applog = useAppLogger("pages/play");
    const { refreshCommonDataWithRedirect, requiredModulesLoaded, commonAppData } = useCommonChecks();
    const cache_dir = commonAppData?.cache;
    const game_path = commonAppData?.selectedGame?.path;
    const game_data = commonAppData?.selectedGame;
    const api_key = commonAppData?.apis?.nexus;
    
    const [showLoadListModal, setShowLoadListModal] = React.useState(false);
    const [showCheckModsModal, setShowCheckModsModal] = React.useState(false);
    const [showPlayVanillaModal, setShowPlayVanillaModal] = React.useState(false);
    const {gamesArray, activeGame, selectedGameID} = useActiveGame();
    const game = activeGame;
    
    const onClickCheckMods = React.useCallback(async () => {
        if (!requiredModulesLoaded) return;
        setShowCheckModsModal(true);
    }, [requiredModulesLoaded]);
    
    const onClickLoadNewModlist = React.useCallback(async () => {
        if (!requiredModulesLoaded) return;
        setShowLoadListModal(true);
    }, [requiredModulesLoaded]);
    
    const onClickPlayVanillaPalworld = React.useCallback(async () => {
        if (!requiredModulesLoaded) return;
        setShowPlayVanillaModal(true);
    }, [requiredModulesLoaded]);

    const onRunGameExe = React.useCallback(async () => {
        if (!requiredModulesLoaded) return;
        if (!game_data.has_exe) {
            applog('error','game exe not found');
            return;
        }
        applog('info', `Launching Game: ${game_data.exe_path}`);

        // const args = ['-steam', '-launch', '-appid', '1167190']
        // const env = { ...process.env, SteamAppId: '<AppID>', SteamGameId: '<AppID>' };
        // "E:/Program Files (x86)/Steam/Steam.exe"
        // steam://rungameid/2909400

        if (game_data.type === 'steam' && game_data.map_data.platforms.game.steam.url) {
            await window.ipc.invoke('open-external', `steam://rungameid/${game_data.map_data.platforms.game.steam.id}`);
            // window.open(`steam://rungameid/${game_data.map_data.platforms.game.steam.id}`, '_blank');
        } else {
            await window.palhub('launchExe', game_data.exe_path, []);//, {env: {SteamAppId: game_data.map_data.platforms.game.steam.id, SteamGameId: game_data.map_data.platforms.game.steam.id}});
        }
    }, [requiredModulesLoaded, game_data]);

    const onClickLaunchGame = React.useCallback(async () => {
        if (!requiredModulesLoaded) return;
        await onRunGameExe();
    }, [requiredModulesLoaded, onRunGameExe]);

    React.useEffect(() => {
        refreshCommonDataWithRedirect();
    }, [refreshCommonDataWithRedirect]);

    console.log(game_data);

    return <React.Fragment>
        <CheckModsModal show={showCheckModsModal} setShow={setShowCheckModsModal} />
        <LoadListModal show={showLoadListModal} setShow={setShowLoadListModal} />
        <PlayVanillaModal show={showPlayVanillaModal} setShow={setShowPlayVanillaModal} onRunGameExe={onRunGameExe} />

        <div className="container">
            <div className="mx-auto px-3 pt-5 pb-4">

                <ColorfulGameSelector />

                <div className='row mt-4'>
                    <div className='col-12 card px-1'>
                        <div className='card-body py-2 px-1'>
                            <div className='row'>
                                <div className='d-lg-none col-lg-7'>
                                    <Image src={`/img/${game?.id}/game-logo.webp`} alt="Game Logo Image" rounded fluid />
                                </div>
                                <div className='col-12 col-lg-5 pt-4 px-5 pe-lg-2'>
                                    <h1 className="font-bold mb-4">{t('/play.head', {game})}</h1>
                                    {tA(`games.${game?.id}.info`).map((line, idx) => <p key={idx} className="mb-4">{line}</p>)}
                                </div>
                                <div className='d-none d-lg-block col-lg-7'>
                                    <Image src={`/img/${game?.id}/game-logo.webp`} alt="Game Logo Image" rounded fluid />
                                </div>
                            </div>

                            <div className='px-0'>
                                <button className='btn btn-success p-3 w-100 mt-3' onClick={onClickLaunchGame}>
                                    <strong>{t('/play.launch-main', {game})}</strong>
                                    <small className="d-block">{t('/play.launch-info')}</small>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                <div className='row mt-4'>
                   <div className='col-12 col-md-4 mb-3'>
                        <button className='btn btn-dark hover-primary p-3 w-100' onClick={onClickCheckMods}>
                            <strong>{t('/play.check-mods-main')}</strong>
                            <small className="d-block">{t('/play.check-mods-info')}</small>
                        </button>
                    </div>
                   <div className='col-12 col-md-4 mb-3'>
                        <button className='btn btn-dark hover-warning p-3 w-100' onClick={onClickLoadNewModlist}>
                            <strong>{t('/play.load-mods-main')}</strong>
                            <small className="d-block">{t('/play.load-mods-info')}</small>
                        </button>
                    </div>
                   <div className='col-12 col-md-4 mb-3'>
                        <button className='btn btn-dark hover-danger p-3 w-100' onClick={onClickPlayVanillaPalworld}>
                            <strong>{t('/play.vanilla-main', {game})}</strong>
                            <small className="d-block">{t('/play.vanilla-info')}</small>
                        </button>
                    </div>
                </div>

                {/* <h1 className="font-bold mb-4">Suggested Servers</h1>
                <div className="row">
                    <ModCardComponent />
                    <ModCardComponent />
                    <ModCardComponent />
                    <ModCardComponent />
                </div>

                <h1 className="font-bold mb-4">Suggested Mods</h1>
                <div className="row">
                    <ModCardComponent />
                    <ModCardComponent />
                    <ModCardComponent />
                    <ModCardComponent />
                </div> */}

            </div>
        </div>
    </React.Fragment>
}

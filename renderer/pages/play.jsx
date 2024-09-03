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
import useCommonChecks from '@hooks/useCommonChecks';
import useLocalization from '@hooks/useLocalization';
import useAppLogger from '@hooks/useAppLogger';

export default function PlayPage() {
    const { t } = useLocalization();
    const applog = useAppLogger("pages/play");
    const [commonData, onRunCommonChecks] = useCommonChecks();
    const [showLoadListModal, setShowLoadListModal] = React.useState(false);
    const [showCheckModsModal, setShowCheckModsModal] = React.useState(false);
    const [showPlayVanillaModal, setShowPlayVanillaModal] = React.useState(false);
    const onClickCheckMods = async () => {
        if (!onRunCommonChecks()) return applog('error','modules not loaded');
        setShowCheckModsModal(true);
    }
    const onClickLoadNewModlist = async () => {
        if (!onRunCommonChecks()) return applog('error','modules not loaded');
        setShowLoadListModal(true);
    }
    const onClickPlayVanillaPalworld = async () => {
        if (!onRunCommonChecks()) return applog('error','modules not loaded');
        setShowPlayVanillaModal(true);
    }
    const onClickLaunchGame = async () => {
        await onRunGameExe();
    }
    const onRunGameExe = async () => {
        if (!onRunCommonChecks()) return applog('error','modules not loaded');
        const game_path = await window.uStore.get('game_path');
        if (!game_path) return applog('error','game_path not found');
        const game_data = await window.palhub('validateGamePath', game_path);
        if (!game_data.has_exe) return applog('error','game exe not found');
        await window.palhub('launchExe', game_data.exe_path);
        applog('info', `Launching Game: ${game_data.exe_path}`);
    }

    const game = { name: "Palworld" }; 

    return <React.Fragment>
        <CheckModsModal show={showCheckModsModal} setShow={setShowCheckModsModal} />
        <LoadListModal show={showLoadListModal} setShow={setShowLoadListModal} />
        <PlayVanillaModal show={showPlayVanillaModal} setShow={setShowPlayVanillaModal} onRunGameExe={onRunGameExe} />

        <div className="container">
            <div className="mx-auto px-3 pt-5 pb-4">
                <div className='row'>
                    <div className='col-12 card px-1'>
                        <div className='card-body py-2 px-1'>
                            <div className='row'>
                                <div className='d-lg-none col-lg-7'>
                                    <Image src="/img/3Pals.png" alt="Palworld" className='px-0' rounded fluid />
                                </div>
                                <div className='col-12 col-lg-5 pt-4 px-5 pe-lg-2'>
                                    <h1 className="font-bold mb-4">{t('/play.header', {game})}</h1>
                                    <p className="mb-4">{t('games.palworld.info.line1')}</p>
                                    <p className="mb-4">{t('games.palworld.info.line2')}</p>
                                    <p className="mb-4">{t('games.palworld.info.line3')}</p>
                                </div>
                                <div className='d-none d-lg-block col-lg-7'>
                                    <Image src="/img/Lamball.png" alt="Palworld" rounded fluid />
                                </div>
                            </div>

                            <div className='px-0'>
                                <button className='btn btn-success p-3 w-100 mt-3' onClick={onClickLaunchGame}>
                                    <strong>{t('/play.launch_main', {game})}</strong>
                                    <small className="d-block">{t('/play.launch_info')}</small>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                <div className='row mt-4'>
                   <div className='col-12 col-md-4 mb-3'>
                        <button className='btn btn-dark hover-primary p-3 w-100' onClick={onClickCheckMods}>
                            <strong>{t('/play.check_mods_main')}</strong>
                            <small className="d-block">{t('/play.check_mods_info')}</small>
                        </button>
                    </div>
                   <div className='col-12 col-md-4 mb-3'>
                        <button className='btn btn-dark hover-warning p-3 w-100' onClick={onClickLoadNewModlist}>
                            <strong>{t('/play.load_mods_main')}</strong>
                            <small className="d-block">{t('/play.load_mods_info')}</small>
                        </button>
                    </div>
                   <div className='col-12 col-md-4 mb-3'>
                        <button className='btn btn-dark hover-danger p-3 w-100' onClick={onClickPlayVanillaPalworld}>
                            <strong>{t('/play.vanilla_main', {game})}</strong>
                            <small className="d-block">{t('/play.vanilla_info')}</small>
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

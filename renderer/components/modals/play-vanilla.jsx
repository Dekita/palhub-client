/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import React from "react";
import Button from 'react-bootstrap/Button';
import useLocalization from '@hooks/useLocalization';
import useActiveGame from "@hooks/useActiveGame";
import DekCommonAppModal from '@components/core/modal';
import useCommonChecks from "@hooks/useCommonChecks";

export default function PlayVanillaModal({show,setShow, onRunGameExe}) {
    const { requiredModulesLoaded, commonAppData } = useCommonChecks();
    const onCancel = React.useCallback(() => setShow(false), []);
    const { activeGame } = useActiveGame();
    const game = activeGame;
    const { t } = useLocalization();

    const onClickPlayVanillaPalworld = React.useCallback(async () => {
        if (!window.uStore) return console.error('uStore not loaded');
        if (!window.palhub) return console.error('palhub not loaded');
        if (!window.nexus) return console.error('nexus not loaded');
        // const game_path = await window.uStore.get('game_path');
        const game_path = commonAppData?.selectedGame.path;
        if (!game_path) return console.error('game_path not found');
        
        const result = await window.palhub('uninstallAllMods', game_path);
        // console.log({game_path, result});
        await onRunGameExe();
        onCancel();
    }, [onRunGameExe, commonAppData]);

    const headerText = t('modals.play-vanilla.head', {game});
    const modalOptions = {show, setShow, onCancel, headerText, showX: true};
    return <DekCommonAppModal {...modalOptions}>
        <div type="DekBody" className="d-grid p-3 px-4 text-center">
            <h3 className="">{t('common.warning')}</h3>
            <p className="lead text-warning mb-1">{t('modals.play-vanilla.info', {game})}</p>
            <p className="lead text-warning mb-1"></p>
            <strong className="lead text-warning">{t('modals.play-vanilla.warn')}</strong>
        </div>
        <div type="DekFoot" className='d-flex w-100 gap-3'>
            <Button
                variant='danger'
                className='col p-2 px-3'
                disabled={false}
                onClick={onCancel}>
                <strong>{t('common.cancel')}</strong>
            </Button>
            <Button
                variant='success'
                className='col p-2 px-3'
                disabled={false}
                onClick={onClickPlayVanillaPalworld}>
                <strong>{t('common.confirm')}</strong>
            </Button>
        </div>
    </DekCommonAppModal>;
}

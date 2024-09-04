/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import React from "react";
import IconX from '@svgs/fa5/regular/window-close.svg';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import useScreenSize from '@hooks/useScreenSize';
import useLocalization from '@hooks/useLocalization';
import useSelectedGame from '@hooks/useSelectedGame';

export default function PlayVanillaModal({show,setShow, onRunGameExe}) {
    const game = useSelectedGame();
    const { t, tA } = useLocalization();

    const handleCancel = () => setShow(false);
    const {isDesktop} = useScreenSize();
    const fullscreen = !isDesktop;

    const onClickPlayVanillaPalworld = async () => {
        if (!window.uStore) return console.error('uStore not loaded');
        if (!window.palhub) return console.error('palhub not loaded');
        if (!window.nexus) return console.error('nexus not loaded');

        const game_path = await window.uStore.get('game_path');
        if (!game_path) return console.error('game_path not found');

        const result = await window.palhub('uninstallAllMods', game_path);
        console.log({game_path, result});

        // todo: uninstall all mods first

        await onRunGameExe();

        handleCancel();
    }

    // return the actual envmodal
    return <Modal
        show={show}
        size="lg"
        fullscreen={fullscreen}
        onHide={handleCancel}
        backdrop='static'
        keyboard={false}
        centered>
        <Modal.Header className='p-4 theme-border '>
            <Modal.Title className='col'>
                <strong>{t('modals.play-vanilla.head', {game})}</strong>
            </Modal.Title>
            <Button
                variant='none'
                className='p-0 hover-danger no-shadow'
                onClick={handleCancel}>
                <IconX className='modalicon' fill='currentColor' />
            </Button>
        </Modal.Header>
        <Modal.Body className="text-center">
            <h3 className="">{t('common.warning')}</h3>
            <p className="lead text-warning mb-1">{t('modals.play-vanilla.info', {game})}</p>
            <p className="lead text-warning mb-1"></p>
            <strong className="lead text-warning">{t('modals.play-vanilla.warn')}</strong>
        </Modal.Body>
        <Modal.Footer className='d-flex justify-content-center'>
            <Button
                variant='danger'
                className='col p-2 px-3'
                disabled={false}
                onClick={handleCancel}>
                <strong>{t('common.cancel')}</strong>
            </Button>
            <Button
                variant='success'
                className='col p-2 px-3'
                disabled={false}
                onClick={onClickPlayVanillaPalworld}>
                <strong>{t('common.confirm')}</strong>
            </Button>
        </Modal.Footer>
    </Modal>;
}

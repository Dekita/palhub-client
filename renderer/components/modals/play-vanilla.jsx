/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import IconX from '@svgs/fa5/regular/window-close.svg';

import Carousel from 'react-bootstrap/Carousel';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
// import Col from 'react-bootstrap/Col';
// import Row from 'react-bootstrap/Row';

// import useMediaQuery from '@hooks/useMediaQuery';
import useScreenSize from '@hooks/useScreenSize';

import MarkdownRenderer from '@components/markdown/renderer';
import BBCodeRenderer from "@components/core/bbcode";

import { ENVEntry } from '@components/modals/common';
// import DekSelect from '@components/core/dek-select';
import DekSwitch from '@components/core/dek-switch'
import DekChoice from "@components/core/dek-choice";
// import DekCheckbox from '@components/core/dek-checkbox';

import ModFileCard from '@components/core/mod-file-card';
import Link from "next/link";
import { version } from "dompurify";

import ModTable from '@components/core/mod-table';

export default function PlayVanillaModal({show,setShow, onRunGameExe}) {

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
    return (
        <Modal
            show={show}
            size="lg"
            fullscreen={fullscreen}
            onHide={handleCancel}
            backdrop='static'
            keyboard={false}
            centered>
            <Modal.Header className='p-4 theme-border '>
                <Modal.Title className='col'>
                    <strong>Play Vanilla Palworld</strong>
                </Modal.Title>
                <Button
                    variant='none'
                    className='p-0 hover-danger no-shadow'
                    onClick={handleCancel}>
                    <IconX className='modalicon' fill='currentColor' />
                </Button>
            </Modal.Header>
            <Modal.Body className="text-center">

                <h3 className="">WARNING</h3>
                <p className="lead text-warning mb-1">Clicking the 'confirm' button below will remove all mods installed by the PalHUB mod manager and then attempt to launch the game. This action is irreversible once started.</p>
                <p className="lead text-warning mb-1"></p>
                <strong className="lead text-warning">Are you sure you want to continue?</strong>

            </Modal.Body>

            <Modal.Footer className='d-flex justify-content-center'>
                <Button
                    // size='sm'
                    variant='danger'
                    className='col p-2 px-3'
                    disabled={false}
                    onClick={handleCancel}>
                    <strong>Cancel</strong>
                </Button>
                <Button
                    // size='sm'
                    variant='success'
                    className='col p-2 px-3'
                    disabled={false}
                    onClick={onClickPlayVanillaPalworld}>
                    <strong>Confirm</strong>
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

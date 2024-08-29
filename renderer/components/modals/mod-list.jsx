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

export default function ModListModal({show,setShow, mods}) {

    const handleCancel = () => setShow(false);
    const {isDesktop} = useScreenSize();
    const fullscreen = !isDesktop;

    // if (!mod) mod = {name: 'n/a', author: 'n/a', summary: 'n/a', description: 'n/a', picture_url: 'n/a'};

    // const [modFiles, setModFiles] = useState([]);
    const [modConfig, setModConfig] = useState({});


    const openModInBrowser = (mod_id) => {
        window.open(`https://www.nexusmods.com/palworld/mods/${mod_id}`, '_blank');
    }

    const prepareModList = (mods, modConfig) => {
        return JSON.stringify(mods.map(mod => ({
            name: mod.name,
            mod_id: mod.mod_id,
            author: mod.author,
            version: mod.version,
            file_id: modConfig.mods[mod.mod_id].file_id,
            file_name: modConfig.mods[mod.mod_id].file_name,
        })), null, 4).trim();
    }


    const onCopyModList = useCallback(() => {
        const json = prepareModList(mods, modConfig);
        navigator.clipboard.writeText(json);
    }, [mods, modConfig]);

    const onSaveModList = useCallback(() => {
        // download json document: 
        const element = document.createElement('a');
        const json = prepareModList(mods, modConfig);
        const file = new Blob([json], {type: 'application/json'});
        element.href = URL.createObjectURL(file);
        element.download = "mod-list-filename.json";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(element.href);
    }, [mods, modConfig]);


    useEffect(() => {
        (async () => {
            if (!window.uStore) return console.error('uStore not loaded');
            if (!window.palhub) return console.error('palhub not loaded');
            if (!window.nexus) return console.error('nexus not loaded');
            if (!mods) return;

            const api_key = await window.uStore.get('api_key');
            const game_path = await window.uStore.get('game_path');
            const cache_dir = await window.uStore.get('cache_dir');

            const config = await window.palhub('readJSON', game_path);
            setModConfig(config);
        })();
    }, [mods]);

    console.log({mods, modConfig});


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
                    <strong>Current Mod List</strong>
                </Modal.Title>
                <Button
                    variant='none'
                    className='p-0 hover-danger no-shadow'
                    onClick={handleCancel}>
                    <IconX className='modalicon' fill='currentColor' />
                </Button>
            </Modal.Header>
            <Modal.Body className="p-0">

                {/* map mods into a table */}
                {modConfig && <ModTable mods={mods.map(mod => {
                    const modConfigEntry = modConfig?.mods?.[mod.mod_id];
                    if (!modConfigEntry) return null;
                    const {file_id, file_name} = modConfigEntry;
                    return {
                        ...mod,
                        file_id,
                        file_name,
                        installed: true, 
                        downloaded: true,
                    }
                })}/>}

            </Modal.Body>

            <Modal.Footer className='d-flex justify-content-center'>
                <Button
                    // size='sm'
                    variant='primary'
                    className='col p-2 px-3'
                    disabled={false}
                    onClick={onCopyModList}>
                    <strong>Copy JSON</strong>
                </Button>
                <Button
                    // size='sm'
                    variant='secondary'
                    className='col p-2 px-3'
                    disabled={false}
                    onClick={onSaveModList}>
                    <strong>Save JSON</strong>
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

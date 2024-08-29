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

import ModTable from "@components/core/mod-table";

/**
* Validate pasted JSON
Expected structure: 
[
    {
        "name": "Pal Details (UI)",
        "mod_id": 489,
        "author": "DekitaRPG",
        "version": "2.3",
        "file_id": 6181,
        "file_name": "DekPalDetails-489-2-3-1719888927.zip"
    },
    {
        "name": "Mod Config Menu (UI)",
        "mod_id": 577,
        "author": "DekitaRPG",
        "version": "1.8",
        "file_id": 6185,
        "file_name": "DekModConfigMenu-577-1-8-1719889707.zip"
    },
    {
        "name": "xMOG - Reskin System",
        "mod_id": 1204,
        "author": "DekitaRPG",
        "version": "1.6",
        "file_id": 6353,
        "file_name": "DekXMOG-1204-1-6-1720258308.zip"
    }
]
*/
    
function validatePastedJSON(json) {
    try {
        const obj = typeof json === 'string' ? JSON.parse(json) : json;
        if (!Array.isArray(obj)) return false;
        for (const item of obj) {
            if (!item.name) return false;
            if (!item.mod_id) return false;
            if (!item.author) return false;
            if (!item.version) return false;
            if (!item.file_id) return false;
            if (!item.file_name) return false;
        }
        return obj;
    } catch (e) {
        return false;
    }
}

async function wait(milliseconds = 1000) {
    return new Promise((r) => setTimeout(r, milliseconds));
}

export default function LoadListModal({show,setShow}) {

    const {isDesktop} = useScreenSize();
    const fullscreen = !isDesktop;
    const height = fullscreen ? "calc(100vh - 182px)" : "calc(100vh / 4 * 2 + 26px)";

    // if (!mod) mod = {name: 'n/a', author: 'n/a', summary: 'n/a', description: 'n/a', picture_url: 'n/a'};

    // const [modFiles, setModFiles] = useState([]);
    // const [modConfig, setModConfig] = useState({});
    
    const [logMessages, setLogMessages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [mods, setMods] = useState(null);
    
    const logRef = useRef(null);

    const addLogMessage = (message) => {
        setLogMessages(old => [...old, message]);
        if (logRef.current) {
            setTimeout(() => logRef.current.scrollTop = logRef.current.scrollHeight);
            // logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    };

    const resetLogMessages = () => {
        setLogMessages([]);
    };

    const handleCancel = () => {
        setShow(false);
        setTimeout(() => {
            setMods(null);
            setIsProcessing(false);
            setIsComplete(false);
        }, 250);
    };

    const processJSON = useCallback(async(json) => {
        if (!window.uStore) return console.error('uStore not loaded');
        if (!window.palhub) return console.error('palhub not loaded');
        if (!window.nexus) return console.error('nexus not loaded');
        if (!json) return console.error('json not found');


        // const api_key = await window.uStore.get('api_key');
        const game_path = await window.uStore.get('game_path');
        const cache_dir = await window.uStore.get('cache_dir');

        // use mod as both 'mod' and 'file' for palhub checks, 
        for (const mod of json) {
            mod.downloaded = await window.palhub('checkModFileIsDownloaded', cache_dir, mod);
            mod.installed = await window.palhub('checkModIsInstalled', game_path, mod, mod);
            mod.latest = true;
        }
    }, []);

    const onClickedLoadFromFile = useCallback(async () => {
        console.log('clicked load from file');
        const result = await window.ipc.invoke('open-file-dialog', {
            title: 'Select Mod List JSON File',
            properties: ['openFile'],
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (result.filePaths.length === 0) return;

        const file_path = result.filePaths[0];
        let json = await window.palhub('readJSON', '', file_path);
        json = validatePastedJSON(json);
        
        await processJSON(json);
        setMods(json);
        
        console.log({result, json})
    }, []);

    const onTextAreaChange = useCallback(async(e) => {
        if (!window.uStore) return console.error('uStore not loaded');
        if (!window.palhub) return console.error('palhub not loaded');
        if (!window.nexus) return console.error('nexus not loaded');

        const json_string = e.target.value;
        const json = validatePastedJSON(json_string);
        const is_valid = !!json;

        if (!is_valid) {
            e.target.classList.remove('form-secondary');
            e.target.classList.add('form-danger');
        } else {
            e.target.classList.remove('form-danger');
            e.target.classList.remove('form-secondary');
            e.target.classList.add('form-success');
            e.target.classList.add('disabled');

            await wait(1000);

            e.target.classList.remove('form-success');
            e.target.classList.remove('form-danger');
            e.target.classList.add('form-secondary');
            e.target.classList.remove('disabled');

            await processJSON(json);
            setMods(json);
        }

        
        console.log({
            is_valid,
            json,
        });
    }, []);

    const onClickedDownloadAndInstall = useCallback(async() => {
        if (!window.uStore) return console.error('uStore not loaded');
        if (!window.palhub) return console.error('palhub not loaded');
        if (!window.nexus) return console.error('nexus not loaded');
        if (!mods) return;

        const api_key = await window.uStore.get('api_key');
        const game_path = await window.uStore.get('game_path');
        const cache_dir = await window.uStore.get('cache_dir');

        setIsComplete(false);
        setIsProcessing(true);

        resetLogMessages();
        addLogMessage('Downloading and Installing Mods...');

        const wait_between = 1000;

        await window.palhub('uninstallAllMods', game_path);
        await wait(wait_between);

        const total = mods.length;
        for (const [index, mod] of mods.entries()) {
            console.log({index, mod});

            addLogMessage(`Processing Mod... ${index+1} / ${total}`);
            // downloadMod(cache_path, download_url, mod, file)

            let download = 'already-downloaded';
            try {
                if (!mod.downloaded) {
                    addLogMessage(`Getting Download Link: ${mod.name}`);
                    const file_links = await window.nexus(api_key, 'getDownloadURLs', mod.mod_id, mod.file_id);
                    const download_url = file_links.find(link => !!link.URI)?.URI;

                    addLogMessage(`Downloading Mod From: ${download_url}`);
                    download = await window.palhub('downloadMod', cache_dir, download_url, mod, mod);

                    await wait(wait_between);
                    addLogMessage(`Downloaded Mod... ${mod.name}`);
                    console.log({file_links, download_url, download});
                }
            } catch (error) {
                addLogMessage(`Error Downloading Mod: ${mod.name}`);
                addLogMessage(error.message);
                console.log('download error:', error);
            }
            await wait(wait_between);
            try {
                const install = await window.palhub('installMod', cache_dir, game_path, mod, mod);

                await wait(wait_between);
                addLogMessage(`Successfully Installed Mod: ${mod.name}`);
                console.log({install});
            } catch (error) {
                addLogMessage(`Error Installing Mod: ${mod.name}`);
                addLogMessage(error.message);
                console.log('install error:', error);
            }
            await wait(wait_between);
        }

        addLogMessage(`Downloaded and Installed ${total} mods!`);
        await wait(wait_between);
        setIsProcessing(false);
        setIsComplete(true);
    }, [mods]);




    useEffect(() => {
        if (!window.ipc) return console.error('ipc not loaded');

        const remove_dl_handler = window.ipc.on('download-mod-file', ({mod_id, file_id, percentage}) => {
            addLogMessage(`Downloading Mod: ${mod_id} / ${file_id} - ${percentage}%`);
        });

        const remove_in_handler = window.ipc.on('install-mod-file', ({install_path, name, version, mod_id, file_id, entries}) => {
            addLogMessage(`Installing Mod: ${name} v${version}`);
            // console.log({install_path, mod_id, file_id, entries});
        });

        const remove_ex_handler = window.ipc.on('extract-mod-file', ({entry, outputPath}) => {
            addLogMessage(`Extracting: ${entry}`);
            // console.log({entry, outputPath});
        });

        return () => {
            // window.ipc.removeListener('download-mod-file', download_handler);
            // window.ipc.removeListener('install-mod-file', install_handler);
            // window.ipc.removeListener('extract-mod-file', extract_handler);
            remove_dl_handler();
            remove_in_handler();
            remove_ex_handler();
        }        
    }, []);


    const shouldShowLogs = isComplete || isProcessing;

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
                    <strong>Load New Mod List</strong>
                </Modal.Title>
                {!isProcessing && <Button
                    variant='none'
                    className='p-0 hover-danger no-shadow'
                    onClick={handleCancel}>
                    <IconX className='modalicon' fill='currentColor' />
                </Button>}
            </Modal.Header>
            <Modal.Body className="p-0">

                {shouldShowLogs && <div className='overflow-auto m-0 p-3'
                        style={{height}}
                        ref={logRef}>

                        <pre className='m-0 p-2'>
                            {logMessages.join('\n')}
                        </pre>
                </div>}

                
                {/* map mods into a table */}
                {!shouldShowLogs && mods && <ModTable mods={mods} showStatus={true}/>}

                {/* add area for users to paste json as text */}
                {!shouldShowLogs && !mods && <div className='p-2'>
                    <textarea
                        className='form-control form-secondary overflow-y-auto m-0' 
                        placeholder='Paste PalHUB Mod List JSON here...'
                        style={{resize: 'none', height}}
                        onChange={onTextAreaChange}
                    />
                </div>}

            </Modal.Body>
            {!shouldShowLogs && <Modal.Footer className='d-flex justify-content-center'>
                {/* <Button
                    // size='sm'
                    variant='primary'
                    className='col p-2 px-3'
                    disabled={false}
                    onClick={onClickedLoadFromJSON}>
                    <strong>Paste JSON</strong>
                </Button> */}
                {mods && <Button
                    // size='sm'
                    variant='danger'
                    className='col p-2 px-3'
                    disabled={false}
                    onClick={()=> setMods(null)}>
                    <strong>Cancel</strong>
                </Button>}
                {mods && <Button
                    // size='sm'
                    variant='success'
                    className='col p-2 px-3'
                    disabled={false}
                    onClick={onClickedDownloadAndInstall}>
                    <strong>Download & Install</strong><strong className="d-none d-sm-inline"> Mod List</strong>
                </Button>}
                {!mods && <Button
                    // size='sm'
                    variant='secondary'
                    className='col p-2 px-3'
                    disabled={false}
                    onClick={onClickedLoadFromFile}>
                    <strong>Load From File</strong>
                </Button>}
            </Modal.Footer>}
        </Modal>
    );
}

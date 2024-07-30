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

import MarkdownRenderer from '@components/core/markdown';
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


async function wait(milliseconds = 1000) {
    return new Promise((r) => setTimeout(r, milliseconds));
}

export default function CheckModsModal({show,setShow}) {

    const handleCancel = () => setShow(false);
    const {isDesktop} = useScreenSize();
    const fullscreen = !isDesktop;

    // if (!mod) mod = {name: 'n/a', author: 'n/a', summary: 'n/a', description: 'n/a', picture_url: 'n/a'};

    // const [modFiles, setModFiles] = useState([]);
    const [modConfig, setModConfig] = useState({});
    const [mods, setMods] = useState([]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [shouldShowLogs, setShouldShowLogs] = useState(false);
    const [logMessages, setLogMessages] = useState([]);
    const logRef = useRef(null);


    const addLogMessage = (message) => {
        setLogMessages(old => [...old, message]);
        setTimeout(() => {
            if (!logRef?.current) return;
            logRef.current.scrollTop = logRef.current.scrollHeight
        });
    };

    const resetLogMessages = () => {
        setLogMessages([]);
    };

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

    const checkLatestIsNewer = (installed, latest) => {
        // remove all characters to ensure strings are only numbers
        const splitter = str => str.split('.').map(e => e.replace(/\D/g, ''));
        const [i_major, i_minor, i_patch] = splitter(installed).map(Number);
        const [l_major, l_minor, l_patch] = splitter(latest).map(Number);
        return i_major < l_major || i_minor < l_minor || i_patch < l_patch;
    }

    const onUpdateMods = useCallback(async() => {
        resetLogMessages();
        setShouldShowLogs(true);

        const api_key = await window.uStore.get('api_key');
        const game_path = await window.uStore.get('game_path');
        const cache_dir = await window.uStore.get('cache_dir');

        const wait_between = 1000;
        await wait(wait_between);

        const total = mods.length;
        for (const [index, mod] of mods.entries()) {
            addLogMessage(`Processing Mod... ${index+1} / ${total}`);

            const latest = mod.version;
            const installed = modConfig.mods[mod.mod_id].version;
            if (!checkLatestIsNewer(installed, latest)) {
                addLogMessage(`Skipping Mod: ${mod.name} - Already Up To Date`);
                continue;
            }

            try {
                addLogMessage(`Getting Latest Version: ${mod.name}`);
                const {files} = await window.nexus(api_key, 'getModFiles', mod.mod_id);
                files.sort((a,b) => b.uploaded_timestamp - a.uploaded_timestamp);
                const latest_file = files.find(file => file.version === latest);
    
    
                addLogMessage(`Getting Download Link: ${mod.name}`);
                const file_links = await window.nexus(api_key, 'getDownloadURLs', mod.mod_id, latest_file.file_id);
                const download_url = file_links.find(link => !!link.URI)?.URI;
                console.log({mod, latest_file, file_links, download_url});

                try {
                    addLogMessage(`Downloading Mod From: ${download_url}`);
                    await window.palhub('downloadMod', cache_dir, download_url, mod, latest_file);
                } catch (error) {
                    console.log('download error:', error);
                    addLogMessage(error);
                }
    
                await wait(wait_between);

                try {
                    const install = await window.palhub('installMod', cache_dir, game_path, mod, latest_file);
    
                    await wait(wait_between);
                    addLogMessage(`Successfully Installed Mod: ${mod.name}`);
                    console.log({install});
                } catch (error) {
                    console.log('install error:', error);
                    addLogMessage(error);
                }
                await wait(wait_between);                

            } catch (error) {
                console.log('download error:', error);
                addLogMessage(error);
            }
        }

        await wait(wait_between);                
        setShouldShowLogs(false);
    }, [mods, modConfig]);

    const onValidateFiles = useCallback(async() => {
        resetLogMessages();
        setShouldShowLogs(true);

        const api_key = await window.uStore.get('api_key');
        const game_path = await window.uStore.get('game_path');
        const cache_dir = await window.uStore.get('cache_dir');

        const wait_between = 1000;
        await wait(wait_between);

        const total = mods.length;
        
        
        for (const [index, mod] of mods.entries()) {
            addLogMessage(`Processing Mod... ${index+1} / ${total}`);
            try {
                console.log(mod)
                const file = modConfig.mods[mod.mod_id];
                const result = await window.palhub('validateModFiles', game_path, mod, file);
                addLogMessage(`Validation Successful: ${mod.name} - ${result}`);
            } catch (error) {
                console.log('validate error:', error);
                addLogMessage(error);
            }
            await wait(wait_between);
        }

        await wait(wait_between);
        setShouldShowLogs(false);
    }, [mods, modConfig]);


    const updateButtonEnabled = useMemo(() => {
        if (!mods || !modConfig) return false;
        return mods.some(mod => {
            const latest = mod.version;
            const installed = modConfig.mods[mod.mod_id].version;
            return checkLatestIsNewer(installed, latest);
        });
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
            const mod_ids = Object.keys(config.mods);
            setMods(await Promise.all(mod_ids.map(async mod_id => {
                return await window.nexus(api_key, 'getModInfo', mod_id);
            })));
            setModConfig(config);
        })();
    }, [shouldShowLogs]);

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

    console.log({mods, modConfig});

    const height = fullscreen ? "calc(100vh - 182px)" : "calc(100vh / 4 * 2 + 26px)";

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
                    <strong>Check Installed Mods</strong>
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
                {!shouldShowLogs && modConfig && <ModTable mods={mods.map(mod => {
                    const modConfigEntry = modConfig?.mods[mod.mod_id];
                    if (!modConfigEntry) return null;
                    const {file_id, file_name, version} = modConfigEntry;
                    return {
                        ...mod,
                        file_id,
                        file_name,
                        installed: true, 
                        downloaded: true,
                        latest: mod.version === version,
                    }
                })} showStatus={true}/>}

                {shouldShowLogs && <div className='overflow-auto m-0 p-3'
                        style={{height}}
                        ref={logRef}>

                        <pre className='m-0 p-2'>
                            {logMessages.join('\n')}
                        </pre>
                </div>}                

            </Modal.Body>

            <Modal.Footer className='d-block'>
                <div className="row">
                    {/* <div className='col-6 col-md-3 mb-2 mb-md-0 px-1'>
                        <Button
                            // size='sm'
                            variant='primary'
                            className='w-100'
                            disabled={false}
                            onClick={onCopyModList}>
                            <strong>Copy JSON</strong>
                        </Button>
                    </div>
                    <div className='col-6 col-md-3 mb-2 mb-md-0 px-1'>
                        <Button
                            // size='sm'
                            variant='secondary'
                            className='w-100'
                            disabled={false}
                            onClick={onSaveModList}>
                            <strong>Save JSON</strong>
                        </Button>
                    </div> */}
                    <div className='col-6 mb-2 mb-md-0 px-1'>
                        <Button
                            // size='sm'
                            variant='warning'
                            className='w-100'
                            disabled={!updateButtonEnabled}
                            onClick={onUpdateMods}>
                            <strong>Update Mods</strong>
                        </Button>
                    </div>
                    <div className='col-6 mb-0 mb-md-0 px-1'>
                        <Button
                            // size='sm'
                            variant='success'
                            className='w-100'
                            disabled={false}
                            onClick={onValidateFiles}>
                            <strong>Validate Files</strong>
                        </Button>
                    </div>
                </div>

            </Modal.Footer>
        </Modal>
    );
}

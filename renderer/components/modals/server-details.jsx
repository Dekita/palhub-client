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

import { ENVEntry, ensureEntryValueType } from '@components/modals/common';
// import DekSelect from '@components/core/dek-select';
import DekSwitch from '@components/core/dek-switch'
import DekChoice from "@components/core/dek-choice";
// import DekCheckbox from '@components/core/dek-checkbox';

import ModFileCard from '@components/core/mod-file-card';
import Link from "next/link";

import wait from '@utils/wait';


const serverLongDescription=`
[b][size=150]Welcome to [Your Server Name], the Ultimate Custom Palworld Experience![/size][/b]

Dive into an enhanced world of adventure and creativity with our custom modified Palworld game server. We've taken the core elements you love and added unique features to bring you an unparalleled gaming experience.

[b]Features:[/b]

[list]
[*][b]Custom Pals and Abilities:[/b] Discover exclusive Pals with unique abilities that you won't find anywhere else.
[*][b]Expanded Maps:[/b] Explore new territories and hidden areas with our expanded and intricately designed maps.
[*][b]Enhanced Crafting System:[/b] Enjoy a more complex and rewarding crafting system with additional recipes and materials.
[*][b]Dynamic Events:[/b] Participate in exclusive server-wide events and challenges that keep the gameplay fresh and exciting.
[*][b]Player-Driven Economy:[/b] Engage in a robust, player-driven economy with customized trading options and unique items.
[*][b]Community-Focused:[/b] Join a friendly and active community with regular updates, events, and a dedicated support team to ensure the best gaming experience.
[/list]

Join [Your Server Name] today and experience Palworld like never before!
`;

const serverLongDescriptionMD=`
###### **Welcome to [Your Server Name], the Ultimate Custom Palworld Experience!**

Dive into an enhanced world of adventure and creativity with our custom modified Palworld game server. We've taken the core elements you love and added unique features to bring you an unparalleled gaming experience.

## Features:

- **Custom Pals and Abilities:** Discover exclusive Pals with unique abilities that you won't find anywhere else.
- **Expanded Maps:** Explore new territories and hidden areas with our expanded and intricately designed maps.
- **Enhanced Crafting System:** Enjoy a more complex and rewarding crafting system with additional recipes and materials.
- **Dynamic Events:** Participate in exclusive server-wide events and challenges that keep the gameplay fresh and exciting.
- **Player-Driven Economy:** Engage in a robust, player-driven economy with customized trading options and unique items.
- **Community-Focused:** Join a friendly and active community with regular updates, events, and a dedicated support team to ensure the best gaming experience.

Join [Your Server Name] today and experience Palworld like never before!
`;

export default function ServerDetailsModal({show,setShow,server}) {

    const {isDesktop} = useScreenSize();
    const fullscreen = !isDesktop;
    const height = fullscreen ? "calc(100vh - 182px)" : "calc(100vh - 256px)";

    // if (!mod) mod = {name: 'n/a', author: 'n/a', summary: 'n/a', description: 'n/a', picture_url: 'n/a'};

    const [serverpageID, setServerpageID] = useState(0);
    const serverpageTypes = ['Details', 'Settings', 'Mods'];
    const [servermodFiles, setServerModFiles] = useState([]);

    const [logMessages, setLogMessages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
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
            setIsProcessing(false);
            setServerModFiles([]);
            setIsComplete(false);
            setServerpageID(0);
        }, 250);
    };



    const onInstallServerModList = useCallback(async() => {
        console.log('onInstallServerModList');
        // return;

        if (!window.uStore) return console.error('uStore not loaded');
        if (!window.palhub) return console.error('palhub not loaded');
        if (!window.nexus) return console.error('nexus not loaded');
        if (!servermodFiles || !servermodFiles.length) return;

        const api_key = await window.uStore.get('api_key');
        const game_path = await window.uStore.get('game_path');
        const cache_dir = await window.uStore.get('cache_dir');

        setIsComplete(false);
        setIsProcessing(true);

        resetLogMessages();
        addLogMessage('Downloading and Installing Mods...');

        const wait_between = 1000;

        console.log({api_key, game_path, cache_dir});

        addLogMessage('Uninstalling Previous Mods...');
        await window.palhub('uninstallAllMods', game_path);
        await wait(wait_between);
        addLogMessage('Uninstalled Previous Mods...');

        const total = servermodFiles.length;
        for (const [index, {mod, file}] of servermodFiles.entries()) {
            console.log({index, mod, file});

            addLogMessage(`Processing Mod... ${index+1} / ${total}`);
            // downloadMod(cache_path, download_url, mod, file)

            let download = 'already-downloaded';
            try {

                const downloaded = await window.palhub('checkModFileIsDownloaded', cache_dir, file);
                if (!downloaded) {
                    addLogMessage(`Getting Download Link: ${mod.name}`);
                    const file_links = await window.nexus(api_key, 'getDownloadURLs', mod.mod_id, file.file_id);
                    const download_url = file_links.find(link => !!link.URI)?.URI;

                    addLogMessage(`Downloading Mod From: ${download_url}`);
                    download = await window.palhub('downloadMod', cache_dir, download_url, mod, file);

                    await wait(wait_between);
                    addLogMessage(`Downloaded Mod... ${mod.name}`);
                    console.log({file_links, download_url, download});
                }
            } catch (error) {
                addLogMessage(`Error Downloading Mod: ${mod.name}`);
                console.log('download error:', error);
            }
            await wait(wait_between);
            try {
                const install = await window.palhub('installMod', cache_dir, game_path, mod, file);

                await wait(wait_between);
                addLogMessage(`Successfully Installed Mod: ${mod.name}`);
                console.log({install});
            } catch (error) {
                addLogMessage(`Error Installing Mod: ${mod.name}`);
                console.log('install error:', error);
            }
            await wait(wait_between);
        }

        addLogMessage(`Downloaded and Installed ${total} mods!`);
        await wait(wait_between);
        setIsProcessing(false);
        setIsComplete(true);

        setTimeout(() => {
            setIsComplete(false);
        }, 1000);
    }, [servermodFiles]);




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



    useEffect(() => {
        (async () => {
            if (!window.uStore) return console.error('uStore not loaded');
            if (!window.palhub) return console.error('palhub not loaded');
            if (!window.nexus) return console.error('nexus not loaded');
            if (!server) return;
            const api_key = await window.uStore.get('api_key');

            const server_mod_files = [];

            const addModAndFile = async (mod_id, file_id, type) => {
                console.log('getModAndFile:', mod_id, file_id, type);
                try {
                    const mod = await window.nexus(api_key, 'getModInfo', mod_id);
                    if (!mod) throw Error('mod not found:', mod_id);
                    const {files} = await window.nexus(api_key, 'getModFiles', mod_id);
                    const file = files.find(f => f.file_id == file_id);// not === as may be string or int
                    if (!file) throw Error('file not found:', file_id);
                    server_mod_files.push({file, mod, type});
                } catch (error) {
                    console.log('getModAndFile error:', error);
                }
            }

            for (const mod_id in server.mods.required) {
                const file_id = server.mods.required[mod_id];
                await addModAndFile(mod_id, file_id, 'required');
            }
            for (const mod_id in server.mods.optional) {
                const file_id = server.mods.optional[mod_id];
                await addModAndFile(mod_id, file_id, 'optional');
            }
            for (const mod_id in server.mods.blocked) {
                const file_id = server.mods.blocked[mod_id];
                await addModAndFile(mod_id, file_id, 'blocked');
            }
            
            setServerModFiles(server_mod_files);
        })();
    }, [server]);


    if (!server) return null;

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
                    <strong>{server.serverName}</strong> <small>{server.gameVersion}</small>
                </Modal.Title>
                {!shouldShowLogs && <Button
                    variant='none'
                    className='p-0 hover-danger no-shadow'
                    onClick={handleCancel}>
                    <IconX className='modalicon' fill='currentColor' />
                </Button>}
            </Modal.Header>
            <Modal.Body className='overflow-y-scroll' style={fullscreen?{}:{height:"calc(100vh / 4 * 3)"}}>

                {!shouldShowLogs && <>
                    <div className='ratio ratio-16x9'>
                        <img src={server.splashURL} alt={server.serverName} className='d-block w-100' />
                    </div>
                    <div className="row">
                        <DekChoice 
                            className='col py-3'
                            // disabled={true}
                            choices={serverpageTypes}
                            active={serverpageID}
                            onClick={(i,value)=>{
                                console.log(`Setting Page: ${value}`)
                                setServerpageID(i);
                            }}
                        />
                        <div className="col-12 col-sm-4 col-md-3 pt-3">
                            <button className="btn btn-success px-4 w-100">
                                <strong>Join Server</strong><br />
                            </button>
                        </div>
                    </div>
                </>}



                {/* <MarkdownRenderer markdownText={serverLongDescriptionMD} /> */}

                <Carousel interval={null} indicators={false} controls={false} className='theme-border' activeIndex={serverpageID}>
                    <Carousel.Item className="container-fluid">
                        <BBCodeRenderer bbcodeText={serverLongDescription} />
                        <div className="text-center mb-1">
                            <Link href={`https://discord.gg/WyTdramBkm`} target='_blank' className='btn btn-warning p-2 px-4'>
                                <strong>Join {server.serverName} Discord</strong><br />
                                <small>opens in your default browser</small>
                            </Link>
                        </div>
                    </Carousel.Item>

                    <Carousel.Item className="container-fluid">
                        <div className="row">
                        {Object.keys(server).sort().map((key, i) => {
                            const disallowed = [
                                'mods',
                                'splashURL',
                                'serverName',
                                'gameVersion',
                                'serverDescription',
                                'serverLongDescription',
                                'serverLongDescriptionMD',
                                'serverURL',
                                'discordURL',
                                'rESTAPIPort',
                                'rESTAPIEnabled',
                                'rCONEnabled',
                                'rCONPort',
                                'banListURL',
                                'logFormatType',
                                'DekitaWasHere',
                                'bUseAuth',
                                'publicPort',
                                'adminPassword',
                                'serverPassword',
                                'publicIP',
                                'autoSaveSpan',
                            ]
                            if (disallowed.includes(key)) return null;
                            return <div key={i} className='col-12 col-md-6'>
                                <div className="row">
                                    <div className="col-6">
                                        <strong>{key}</strong>
                                    </div>
                                    <div className="col-6 text-end">
                                        {ensureEntryValueType(server[key]) || '???'}
                                    </div>
                                </div>
                            </div>
                        })}
                        </div>
                    </Carousel.Item>                    

                    <Carousel.Item className="container-fluid">
                        {shouldShowLogs && <div className='m-0 p-3' ref={logRef}>
                            <pre className='m-0 p-2'>
                                {logMessages.join('\n')}
                            </pre>
                        </div>}

                        {!shouldShowLogs && <>
                            {servermodFiles.map(({file, mod}, i) => {
                                return <ModFileCard key={i} mod={mod} file={file} />
                            })}
                            <div className="text-center mb-1">
                                <button className='btn btn-success p-2 px-4' onClick={onInstallServerModList}>
                                    <strong>Install {server.serverName} Mod List</strong><br />
                                    <small>Note: alters your active mod list</small>
                                </button>
                            </div>
                        </>}
                    </Carousel.Item>
                </Carousel>


                {/* <div className="container">
                <div className="row gap-3">
                    {<Button
                        // size='sm'
                        variant='secondary'
                        className='col p-3'
                        disabled={false}
                        onClick={()=>{}}>
                        <strong>Server Website</strong>
                    </Button>}
                    {<Button
                        // size='sm'
                        variant='secondary'
                        className='col p-3'
                        disabled={false}
                        onClick={()=>{}}>
                        <strong>Server Discord</strong>
                    </Button>}
                </div>
                </div> */}
            </Modal.Body>
            {/* <Modal.Footer className='d-flex justify-content-center'>
                <Button
                    // size='sm'
                    variant='success'
                    className='col p-2'
                    disabled={false}
                    onClick={onDownloadInstall}>
                    <strong>Download & Install</strong><br />
                    <small>powered by nexusmods</small>
                </Button>
            </Modal.Footer> */}
        </Modal>
    );
}

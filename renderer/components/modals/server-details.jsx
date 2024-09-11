/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import MarkdownRenderer from '@components/markdown/renderer';
// import BBCodeRenderer from '@components/core/bbcode';

import { ENVEntry, ENVEntry_Input, ensureEntryValueType } from '@components/modals/common';
// import DekSelect from '@components/core/dek-select';
// import DekSwitch from '@components/core/dek-switch';
import DekChoice from '@components/core/dek-choice';
// import DekCheckbox from '@components/core/dek-checkbox';

import ModFileCard from '@components/core/mod-file-card';
import Link from 'next/link';

import DekCheckbox from '@components/core/dek-checkbox';

import * as CommonIcons from '@config/common-icons';
import useLocalization from '@hooks/useLocalization';
import DekCommonAppModal from '@components/core/modal';
import useScreenSize from '@hooks/useScreenSize';
import wait from '@utils/wait';

// HIDDEN either because should not be shown to end user, 
// or because the information is shown in a different way <3
const HIDDEN_SERVER_DATA_KEYS = [
    'mods',
    'splashURL',
    'serverName',
    'gameVersion',
    'serverDescription',
    'longServerDescription',
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
    'palhubServerURL',
    'discordServerID',
    'playerCount',
    'fps',
];


export default function ServerDetailsModal({ show, setShow, server }) {
    const { t, tA } = useLocalization();
    const { isDesktop } = useScreenSize();
    const fullscreen = !isDesktop;
    const height = fullscreen ? "calc(100vh - 96px)" : "calc(100vh / 4 * 3)";

    const [serverpageID, setServerpageID] = React.useState(0);
    const serverpageTypes = tA('modals.server-details.tabs', 3);
    const [servermodFiles, setServerModFiles] = React.useState([]);

    const [logMessages, setLogMessages] = React.useState([]);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [isComplete, setIsComplete] = React.useState(false);
    const logRef = React.useRef(null);

    const [showPassword, setShowPassword] = React.useState(false);
    const [rememberPassword, setRememberPassword] = React.useState(true);
    const passwordRef = React.useRef(null);

    const [hasGotMods, setHasGotMods] = React.useState(false);
    const [hasGotPassword, setHasGotPassword] = React.useState(false);

    const addLogMessage = (message) => {
        setLogMessages((old) => [...old, message]);
        if (logRef.current) setTimeout(() => (logRef.current.scrollTop = logRef.current.scrollHeight));
    };

    const resetLogMessages = () => {
        setLogMessages([]);
    };

    const onCancel = React.useCallback(() => {
        setShow(false);
        setTimeout(() => {
            setIsProcessing(false);
            setServerModFiles([]);
            setIsComplete(false);
            setServerpageID(0);
        }, 250);
    }, []);

    const onClickJoinServer = React.useCallback(async () => {
        try {
            if (!window.uStore) return console.error('uStore not loaded');
            if (!window.palhub) return console.error('palhub not loaded');
            if (!window.nexus) return console.error('nexus not loaded');
            if (!server) return;

            const game_path = await window.uStore.get('game_path');
            if (!game_path) return console.error('game_path not found');

            const game_data = await window.palhub('validateGamePath', game_path);
            if (!game_data.has_exe) return console.error('game exe not found');

            // const api_key = await window.uStore.get('api_key');
            const cache_dir = await window.uStore.get('cache_dir');

            // check all required mods are installed:
            for (const [index, { mod, file }] of servermodFiles.entries()) {
                const is_downloaded = await window.palhub('checkModFileIsDownloaded', cache_dir, file);
                const is_installed = await window.palhub('checkModIsInstalled', game_path, mod, file);
                if (!is_downloaded) throw new Error('mod not downloaded:', mod, file);
                if (!is_installed) throw new Error('mod not installed:', mod, file);
            }

            if (rememberPassword && passwordRef?.current?.value?.length) {
                await window.serverCache.set(server.palhubServerURL, passwordRef.current.value);
            }
            // await window.uStore.set('remeber_server_passwords', rememberPassword);

            console.log('writing launch config:', game_data.content_path);
            await window.palhub('writeJSON', game_data.content_path, {
                'auto-join-server': {
                    // Handle IPv4-mapped IPv6 addresses (like ::ffff:172.24.0.6)
                    path: server.palhubServerURL,
                    pass: passwordRef?.current?.value ?? '',
                },
            }, 'palhub.launch.config.json');

            console.log('launching game:', game_data.exe_path);
            await window.palhub('launchExe', game_data.exe_path);
        } catch (error) {
            console.log('onClickJoinServer error:', error);
            setHasGotPassword(passwordRef?.current?.value?.length);
            setHasGotMods(false);
        }
    }, [server, servermodFiles, passwordRef, rememberPassword]);

    const onInstallServerModList = React.useCallback(async () => {
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

        console.log({ api_key, game_path, cache_dir });

        addLogMessage('Uninstalling Previous Mods...');
        await window.palhub('uninstallAllMods', game_path);
        await wait(wait_between);
        addLogMessage('Uninstalled Previous Mods...');

        const total = servermodFiles.length;
        for (const [index, { mod, file }] of servermodFiles.entries()) {
            // console.log({index, mod, file});

            addLogMessage(`Processing Mod... ${index + 1} / ${total}`);
            // downloadMod(cache_path, download_url, mod, file)

            let download = 'already-downloaded';
            try {
                const downloaded = await window.palhub('checkModFileIsDownloaded', cache_dir, file);
                if (!downloaded) {
                    addLogMessage(`Getting Download Link: ${mod.name}`);
                    const file_links = await window.nexus(api_key, 'getDownloadURLs', mod.mod_id, file.file_id);
                    const download_url = file_links.find((link) => !!link.URI)?.URI;

                    addLogMessage(`Downloading Mod From: ${download_url}`);
                    download = await window.palhub('downloadMod', cache_dir, download_url, mod, file);

                    await wait(wait_between);
                    addLogMessage(`Downloaded Mod... ${mod.name}`);
                    console.log({ file_links, download_url, download });
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
                console.log({ install });
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

    React.useEffect(() => {
        if (!window.ipc) return console.error('ipc not loaded');

        const remove_dl_handler = window.ipc.on('download-mod-file', ({ mod_id, file_id, percentage }) => {
            addLogMessage(`Downloading Mod: ${mod_id} / ${file_id} - ${percentage}%`);
        });

        const remove_in_handler = window.ipc.on('install-mod-file', ({ install_path, name, version, mod_id, file_id, entries }) => {
            addLogMessage(`Installing Mod: ${name} v${version}`);
            // console.log({install_path, mod_id, file_id, entries});
        });

        const remove_ex_handler = window.ipc.on('extract-mod-file', ({ entry, outputPath }) => {
            addLogMessage(`Extracting: ${entry}`);
            // console.log({entry, outputPath});
        });

        return () => {
            remove_dl_handler();
            remove_in_handler();
            remove_ex_handler();
        };
    }, []);

    const shouldShowLogs = isComplete || isProcessing;

    React.useEffect(() => {
        (async () => {
            if (!window.uStore) return console.error('uStore not loaded');
            if (!window.palhub) return console.error('palhub not loaded');
            if (!window.nexus) return console.error('nexus not loaded');
            if (!window.serverCache) return console.error('serverCache not loaded');
            if (!server) return;
            const api_key = await window.uStore.get('api_key');
            const game_path = await window.uStore.get('game_path');
            const cache_dir = await window.uStore.get('cache_dir');

            const server_mod_files = [];

            const addModAndFile = async (mod_id, file_id, type) => {
                console.log('getModAndFile:', mod_id, file_id, type);
                try {
                    const mod = await window.nexus(api_key, 'getModInfo', mod_id);
                    if (!mod) throw Error('mod not found:', mod_id);
                    const { files } = await window.nexus(api_key, 'getModFiles', mod_id);
                    const file = files.find((f) => f.file_id == file_id); // not === as may be string or int
                    if (!file) throw Error('file not found:', file_id);
                    server_mod_files.push({ file, mod, type });
                } catch (error) {
                    console.log('getModAndFile error:', error);
                }
            };

            for (const mod_id in server.mods.required) {
                const file_id = server.mods.required[mod_id];
                await addModAndFile(mod_id, file_id, 'required');
            }
            for (const mod_id in server.mods.optional) {
                const file_id = server.mods.optional[mod_id];
                await addModAndFile(mod_id, file_id, 'optional');
            }
            // for (const mod_id in server.mods.blocked) {
            //     const file_id = server.mods.blocked[mod_id];
            //     await addModAndFile(mod_id, file_id, 'blocked');
            // }

            if (rememberPassword) {
                console.log('getting:/...', server.palhubServerURL);
                const password = await window.serverCache.get(server.palhubServerURL);
                if (password && passwordRef.current) passwordRef.current.value = password;
            }

            setServerModFiles(server_mod_files);

            // check if password is required:
            const wants_password = server.serverPassword?.length;
            const has_password = passwordRef?.current?.value?.length;
            setHasGotPassword(wants_password ? has_password : true);

            // check all required mods are installed:
            for (const [index, { mod, file }] of servermodFiles.entries()) {
                const is_downloaded = await window.palhub('checkModFileIsDownloaded', cache_dir, file);
                const is_installed = await window.palhub('checkModIsInstalled', game_path, mod, file);
                if (!is_downloaded || !is_installed) return setHasGotMods(false);
            }
            setHasGotMods(true);
        })();
    }, [show]); //server, rememberPassword, passwordRef?.current?.value]);

    if (!server) return null;

    const carouselOptions = {
        interval: null,
        indicators: false,
        controls: false,
        className: 'theme-border',
        activeIndex: serverpageID,
    };

    const headerText = `${server.serverName} - ${server.gameVersion}`;
    const modalOptions = {show, setShow, onCancel, headerText, showX: !shouldShowLogs};
    return <DekCommonAppModal {...modalOptions}>
        <dekModalBody className='d-block overflow-y-scroll' style={{height}}>
            <div className='p-3'>
                {!shouldShowLogs && <React.Fragment>
                    <div className="ratio ratio-16x9">
                        <img src={server.splashURL} alt={server.serverName} className="d-block w-100" />
                    </div>
                    <div className="row">
                        <DekChoice
                            className="col py-3"
                            // disabled={true}
                            choices={serverpageTypes}
                            active={serverpageID}
                            onClick={(i, value) => {
                                console.log(`Setting Page: ${value}`);
                                setServerpageID(i);
                            }}
                        />
                        <div className="col-12 col-sm-4 col-md-3 pt-sm-3 pt-0 py-3">
                            <button className="btn btn-success px-4 w-100" onClick={onClickJoinServer}>
                                <strong>{t('modals.server-details.join')}</strong>
                                <br />
                            </button>
                        </div>
                    </div>
                </React.Fragment>}

                {(!hasGotMods || !hasGotPassword) && <div className="alert alert-danger text-center">
                    {!hasGotMods && <div className="container">
                        <strong>{t('common.note')}</strong> {t('modals.server-details.mods-required')}
                    </div>}
                    {!hasGotPassword && <div className="container">
                        <strong>{t('common.note')}</strong> {t('modals.server-details.pass-required')}
                    </div>}
                </div>}

                <Carousel {...carouselOptions}>
                    <Carousel.Item className="container-fluid">
                        {/* <BBCodeRenderer bbcodeText={server.longServerDescription} /> */}
                        <MarkdownRenderer>{server.longServerDescription}</MarkdownRenderer>
                        {server.discordServerID && <div className="text-center mb-1">
                            <Link className="btn btn-warning p-2 px-4" href={`https://discord.gg/${server.discordServerID}`} target="_blank">
                                <strong>{t('modals.server-details.join-discord', { server })}</strong>
                                <br />
                                <small>{t('common.open-link')}</small>
                            </Link>
                        </div>}
                    </Carousel.Item>

                    <Carousel.Item className="container-fluid">
                        {server?.serverPassword?.length && (
                            <div className="row">
                                <div className="card bg-secondary border border-secondary2 pt-3 px-3 pb-2 mb-3">
                                    <input autoComplete="off"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter Server Password Here.."
                                        className="form-control form-dark theme-bg mb-1"
                                        style={{ width: '100%' }}
                                        ref={passwordRef}
                                    />
                                    <div className="row px-2">
                                        <div className="col">
                                            <DekCheckbox
                                                inline={true}
                                                color="dark"
                                                text="Show Server Password"
                                                iconPos="left"
                                                checked={showPassword}
                                                onClick={setShowPassword}
                                            />
                                        </div>
                                        <div className="col text-end">
                                            <DekCheckbox
                                                inline={true}
                                                color="dark"
                                                text="Remember Server Password"
                                                // iconPos='left'
                                                checked={rememberPassword}
                                                onClick={setRememberPassword}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="row">
                            {Object.keys(server).sort().map((key, i) => {
                                if (HIDDEN_SERVER_DATA_KEYS.includes(key)) return null;
                                return <div key={i} className="col-12 col-md-6">
                                    <div className="row">
                                        <div className="col-6">
                                            <strong>{key}</strong>
                                        </div>
                                        <div className="col-6 text-end">
                                            {ensureEntryValueType(server[key]) || '???'}
                                        </div>
                                    </div>
                                </div>;
                            })}
                        </div>
                    </Carousel.Item>

                    <Carousel.Item className="container-fluid">
                        {shouldShowLogs && <div className="m-0 p-3" ref={logRef}>
                            <pre className="m-0 p-2">{logMessages.join('\n')}</pre>
                        </div>}
                        {!shouldShowLogs && <React.Fragment>
                            {servermodFiles.map(({ file, mod }, i) => {
                                return <ModFileCard key={i} mod={mod} file={file} />;
                            })}
                            <div className="text-center mb-1">
                                <button className="btn btn-success p-2 px-4" onClick={onInstallServerModList}>
                                    <strong>{t('modals.server-details.install-mods', { server })}</strong>
                                    <br />
                                    <small>{t('modals.install-note')}</small>
                                </button>
                            </div>
                        </React.Fragment>}
                    </Carousel.Item>
                </Carousel>
            </div>
        </dekModalBody>
    </DekCommonAppModal>;
}

/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import IconX from '@svgs/fa5/regular/window-close.svg';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import useScreenSize from '@hooks/useScreenSize';
import ModTable from '@components/core/mod-table';

import useLocalization from '@hooks/useLocalization';
import useCommonChecks from '@hooks/useCommonChecks';
import DekCommonAppModal from '@components/core/modal';

import wait from 'utils/wait';

export default function CheckModsModal({ show, setShow }) {
    const { t, tA } = useLocalization();
    const { requiredModulesLoaded, commonAppData } = useCommonChecks();
    const cache_dir = commonAppData?.cache;
    const game_path = commonAppData?.selectedGame?.path;
    const game_data = commonAppData?.selectedGame;
    const api_key = commonAppData?.apis?.nexus;


    const onCancel = useCallback(() => setShow(false), []);
    const { isDesktop } = useScreenSize();
    const fullscreen = !isDesktop;
    const [modConfig, setModConfig] = useState({});
    const [mods, setMods] = useState([]);
    const [shouldShowLogs, setShouldShowLogs] = useState(false);
    const [logMessages, setLogMessages] = useState([]);
    const logRef = useRef(null);

    const addLogMessage = (message) => {
        setLogMessages((old) => [...old, message]);
        setTimeout(() => {
            if (!logRef?.current) return;
            logRef.current.scrollTop = logRef.current.scrollHeight;
        });
    };

    const resetLogMessages = () => {
        setLogMessages([]);
    };

    const prepareModList = (mods, modConfig) => {
        return JSON.stringify(
            mods.map((mod) => ({
                name: mod.name,
                mod_id: mod.mod_id,
                author: mod.author,
                version: mod.version,
                file_id: modConfig.mods[mod.mod_id].file_id,
                file_name: modConfig.mods[mod.mod_id].file_name,
            })),
            null,
            4
        ).trim();
    };

    const onCopyModList = useCallback(() => {
        const json = prepareModList(mods, modConfig);
        navigator.clipboard.writeText(json);
    }, [mods, modConfig]);

    const onSaveModList = useCallback(() => {
        // download json document:
        const element = document.createElement('a');
        const json = prepareModList(mods, modConfig);
        const file = new Blob([json], { type: 'application/json' });
        element.href = URL.createObjectURL(file);
        element.download = 'mod-list-filename.json';
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(element.href);
    }, [mods, modConfig]);

    const checkLatestIsNewer = (installed, latest) => {
        // remove all characters to ensure strings are only numbers
        const splitter = (str) => str.split('.').map((e) => e.replace(/\D/g, ''));
        const [i_major, i_minor, i_patch] = splitter(installed).map(Number);
        const [l_major, l_minor, l_patch] = splitter(latest).map(Number);
        return i_major < l_major || i_minor < l_minor || i_patch < l_patch;
    };

    const onUpdateMods = useCallback(async () => {
        resetLogMessages();
        setShouldShowLogs(true);

        // const api_key = nexusApiKey;//await getApiKey();
        // const game_path = appGamePath;//await getGamePath();
        // const cache_dir = appCacheDir;//await getCacheDir();

        const wait_between = 1000;
        await wait(wait_between);

        const total = mods.length;
        for (const [index, mod] of mods.entries()) {
            addLogMessage(`Processing Mod... ${index + 1} / ${total}`);

            const latest = mod.version;
            const installed = modConfig.mods[mod.mod_id].version;
            if (!checkLatestIsNewer(installed, latest)) {
                addLogMessage(`Skipping Mod: ${mod.name} - Already Up To Date`);
                continue;
            }

            try {
                addLogMessage(`Getting Latest Version: ${mod.name}`);
                const result = await window.nexus(api_key, 'getModFiles', mod.mod_id);
                console.log('getModFiles:', result);

                const { files } = result ?? {files:[]};
                files.sort((a, b) => b.uploaded_timestamp - a.uploaded_timestamp);
                const latest_file = files.find((file) => file.version === latest);

                addLogMessage(`Getting Download Link: ${mod.name}`);
                const file_links = await window.nexus(api_key, 'getDownloadURLs', mod.mod_id, latest_file.file_id);
                const download_url = file_links.find((link) => !!link.URI)?.URI;
                console.log({ mod, latest_file, file_links, download_url });

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
                    console.log({ install });
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
    }, [mods, modConfig, game_path]);

    const onValidateFiles = useCallback(async () => {
        resetLogMessages();
        setShouldShowLogs(true);

        // const api_key = nexusApiKey;//await getApiKey();
        // const game_path = appGamePath;//await getGamePath();
        // const cache_dir = appCacheDir;//await getCacheDir();

        const wait_between = 1000;
        await wait(wait_between);

        const total = mods.length;

        console.log(game_path);
        for (const [index, mod] of mods.entries()) {
            addLogMessage(`Processing Mod... ${index + 1} / ${total}`);
            console.log(`Processing Mod... ${index + 1} / ${total}`);
            try {
                const file = modConfig.mods[mod.mod_id];
                console.log({mod, file});
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
    }, [mods, modConfig, game_path]);

    const updateButtonEnabled = useMemo(() => {
        if (!mods || !modConfig) return false;
        return mods.some((mod) => {
            if (!mod) return false;
            console.log({ mod });
            const latest = mod.version;
            const installed = modConfig.mods[mod.mod_id].version;
            return checkLatestIsNewer(installed, latest);
        });
    }, [mods, modConfig]);

    useEffect(() => {
        if (!requiredModulesLoaded) return;
        const remove_dl_handler = window.ipc.on('download-mod-file', ({ mod_id, file_id, percentage }) => {
            addLogMessage(`Downloading Mod: ${mod_id} / ${file_id} - ${percentage}%`);
        });
        const remove_in_handler = window.ipc.on('install-mod-file', ({ install_path, name, version, mod_id, file_id, entries }) => {
            addLogMessage(`Installing Mod: ${name} v${version}`);
        });
        const remove_ex_handler = window.ipc.on('extract-mod-file', ({ entry, outputPath }) => {
            addLogMessage(`Extracting: ${entry}`);
        });
        return () => {
            remove_dl_handler();
            remove_in_handler();
            remove_ex_handler();
        };
    }, []);
    
    useEffect(() => {
        if (!requiredModulesLoaded) return;
        (async () => {
            if (!mods || !!!game_path) return;

            const config = await window.palhub('readJSON', game_path);
            if (!config) return console.error('config not loaded');

            const mod_ids = Object.keys(config?.mods || []);
            const nexus_id = game_data.map_data.providers.nexus;
            const newMods = await Promise.all(mod_ids.map(async (mod_id) => {
                return await window.nexus(api_key, 'getModInfo', mod_id, nexus_id);
            }));
            // console.log({ newMods });
            setMods(newMods);
            setModConfig(config);
        })();
    }, [shouldShowLogs, requiredModulesLoaded, game_path, game_data]);

    // console.log({ mods, modConfig });

    const height = fullscreen ? 'calc(100vh - 182px)' : 'calc(100vh / 4 * 2 + 26px)';
    const headerText = t('modals.check-mods.head', {game: commonAppData?.selectedGame});
    const modalOptions = {show, setShow, onCancel, headerText, showX: true};
    return <DekCommonAppModal {...modalOptions}>
        <div type="DekBody" className="d-grid">
            {/* map mods into a table */}
            {!shouldShowLogs && modConfig && <ModTable mods={mods.map((mod) => {
                const modConfigEntry = modConfig?.mods[mod.mod_id];
                if (!modConfigEntry) return null;
                const { file_id, file_name, version } = modConfigEntry;
                return {
                    ...mod,
                    file_id,
                    file_name,
                    installed: true,
                    downloaded: true,
                    latest: mod.version === version,
                };
                })}
                showStatus={true}
            />}
            {/* show the log messages while downloading/installing/validating */}
            {shouldShowLogs && <div className="overflow-auto m-0 p-3" style={{ height }} ref={logRef}>
                <pre className="m-0 p-2">{logMessages.join('\n')}</pre>
            </div>}
        </div>
        <div type="DekFoot" className='d-block w-100'>
            <div className="row">
                <div className="col-6 col-md-3 mb-2 mb-md-0 px-1">
                    <Button variant="primary" className="w-100" onClick={onCopyModList}>
                        <strong>{t('modals.check-mods.copy-json')}</strong>
                    </Button>
                </div>
                <div className="col-6 col-md-3 mb-2 mb-md-0 px-1">
                    <Button variant="secondary" className="w-100" onClick={onSaveModList}>
                        <strong>{t('modals.check-mods.save-json')}</strong>
                    </Button>
                </div>
                <div className="col-6 col-md-3 mb-2 mb-md-0 px-1">
                    <Button variant="warning" className="w-100" disabled={!updateButtonEnabled} onClick={onUpdateMods}>
                        <strong>{t('modals.check-mods.update')}</strong>
                    </Button>
                </div>
                <div className="col-6 col-md-3 mb-2 mb-md-0 px-1">
                    <Button variant="success" className="w-100" onClick={onValidateFiles}>
                        <strong>{t('modals.check-mods.validate')}</strong>
                    </Button>
                </div>
            </div>
        </div>
    </DekCommonAppModal>;
}

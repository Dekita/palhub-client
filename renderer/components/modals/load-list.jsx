/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import IconX from '@svgs/fa5/regular/window-close.svg';
// import Carousel from 'react-bootstrap/Carousel';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ModTable from '@components/core/mod-table';
import useAppLogger from '@hooks/useAppLogger';
import useModalResizer from '@hooks/useModalResizer';
import useLocalization from '@hooks/useLocalization';
import useCommonChecks from '@hooks/useCommonChecks';
import DekCommonAppModal from '@components/core/modal';
import wait from 'utils/wait';


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

export default function LoadListModal({ show, setShow }) {
    const applog = useAppLogger('LoadListModal');
    const { t } = useLocalization();
    const { height } = useModalResizer();
    const { requiredModulesLoaded, commonAppData } = useCommonChecks();
    const cache_dir = commonAppData?.cache;
    const game_path = commonAppData?.selectedGame?.path;
    const game_data = commonAppData?.selectedGame;
    const api_key = commonAppData?.apis?.nexus;

    const [logMessages, setLogMessages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [mods, setMods] = useState(null);
    const logRef = useRef(null);

    const addLogMessage = (message, applogtype = null) => {
        setLogMessages((old) => [...old, message]);
        if (applogtype) applog(applogtype, message);
        if (logRef.current) {
            setTimeout(() => (logRef.current.scrollTop = logRef.current.scrollHeight));
        }
    };

    const resetLogMessages = () => {
        setLogMessages([]);
    };

    const onCancel = useCallback(() => {
        setShow(false);
        setTimeout(() => {
            setMods(null);
            setIsProcessing(false);
            setIsComplete(false);
        }, 250);
    }, []);

    const validatePastedJSON = (json) => {
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
    };

    const processJSON = useCallback(async (json) => {
        if (!requiredModulesLoaded) return;
        if (!json) return applog('error', 'json not found - unable to process');

        // use mod as both 'mod' and 'file' for palhub checks,
        for (const mod of json) {
            mod.downloaded = await window.palhub('checkModFileIsDownloaded', cache_dir, mod);
            mod.installed = await window.palhub('checkModIsInstalled', game_path, mod, mod);
            mod.latest = true;
        }
    }, []);

    const onClickedLoadFromFile = useCallback(async () => {
        if (!requiredModulesLoaded) return;
        applog('info', 'Loading Mod List From File');

        const result = await window.ipc.invoke('open-file-dialog', {
            title: 'Select Mod List JSON File',
            properties: ['openFile'],
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        });

        if (result.filePaths.length === 0) return applog('error', 'No File Selected');
        const file_path = result.filePaths[0];
        applog('info', `Loading From File: ${file_path}`);
        let json = await window.palhub('readJSON', '', file_path);
        json = validatePastedJSON(json);
        await processJSON(json);
        setMods(json);
        applog('info', `Loaded ${json.length} mods from file`);
    }, []);

    const onTextAreaChange = useCallback(async (e) => {
        if (!requiredModulesLoaded) return;
        if (!e.target.value) return;
        applog('info', 'Loading Mod List From Pasted JSON');

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
        applog('info', `Pasted JSON is ${is_valid ? 'valid' : 'invalid'}`);
        applog('info', `Loaded ${json.length} mods from pasted JSON`);
    }, []);

    const onClickedDownloadAndInstall = useCallback(async () => {
        if (!requiredModulesLoaded) return;
        if (!mods) return applog('error', 'mods not found - unable to process');

        setIsComplete(false);
        setIsProcessing(true);

        resetLogMessages();
        addLogMessage('Downloading and Installing Mods...', 'info');

        const wait_between = 1000;

        await window.palhub('uninstallAllMods', game_path);
        await wait(wait_between);

        const counters = {
            downloaded: 0,
            installed: 0,
        };

        const total = mods.length;
        for (const [index, mod] of mods.entries()) {
            addLogMessage(`Processing Mod... ${index + 1} / ${total}`);

            await wait(wait_between);
            // check if mod is already downloaded
            try {
                if (!mod.downloaded) {
                    addLogMessage(`Getting Download URL: (${mod.mod_id}-${mod.file_id}) ${mod.name}`, 'info');
                    const file_links = await window.nexus(api_key, 'getDownloadURLs', mod.mod_id, mod.file_id);
                    const download_url = file_links.find((link) => !!link.URI)?.URI;
                    addLogMessage(`Mod Download URL: ${download_url}`, 'info');
                    const downloaded = await window.palhub('downloadMod', cache_dir, download_url, mod, mod);
                    addLogMessage(`Downloaded Mod... ${mod.name} - ${downloaded}`, 'info');
                    if (downloaded) counters.downloaded++;
                }
            } catch (error) {
                addLogMessage(`Error Downloading Mod: ${mod.name}`, 'error');
                addLogMessage(error.message, 'error');
            }

            await wait(wait_between);
            // check if mod is already installed
            try {
                const installed = await window.palhub('installMod', cache_dir, game_path, mod, mod);
                addLogMessage(`Successfully Installed Mod: ${mod.name} - ${installed}`, 'info');
                if (installed) counters.installed++;
            } catch (error) {
                addLogMessage(`Error Installing Mod: ${mod.name}`, 'error');
                addLogMessage(error.message, 'error');
            }
            await wait(wait_between);
        }

        addLogMessage(`Downloaded: ${counters.downloaded} / Installed: ${counters.installed}`);
        await wait(wait_between);
        setIsProcessing(false);
        setIsComplete(true);
    }, [mods]);

    useEffect(() => {
        if (!requiredModulesLoaded) return;
        const remove_dl_handler = window.ipc.on('download-mod-file', ({ mod_id, file_id, percentage }) => {
            addLogMessage(`Downloading Mod: ${mod_id} / ${file_id} - ${percentage}%`, 'info');
        });
        const remove_in_handler = window.ipc.on('install-mod-file',({ install_path, name, version, mod_id, file_id, entries }) => {
            addLogMessage(`Installing Mod: ${name} v${version} - (${mod_id}-${file_id})`, 'info');
        });
        const remove_ex_handler = window.ipc.on('extract-mod-file', ({ entry, outputPath }) => {
            addLogMessage(`Extracting: ${entry}`, 'info');
        });
        return () => {
            remove_dl_handler();
            remove_in_handler();
            remove_ex_handler();
        };
    }, []);

    const shouldShowLogs = isComplete || isProcessing;

    const headerText = t('modals.load-mods.head');
    const modalOptions = {show, setShow, onCancel, headerText, showX: true};
    return <DekCommonAppModal {...modalOptions}>
        <div type="DekBody" className="d-grid">
            {/* add area for logs */}
            {shouldShowLogs && <div className="overflow-auto m-0 p-3" style={{ height }} ref={logRef}>
                <pre className="m-0 p-2">{logMessages.join('\n')}</pre>
            </div>}
            {/* map mods into a table */}
            {!shouldShowLogs && mods && <ModTable mods={mods} showStatus={true} />}
            {/* add area for users to paste json as text */}
            {!shouldShowLogs && !mods && <div className="p-2">
                <textarea
                    className="form-control form-secondary overflow-y-auto m-0"
                    placeholder={t('modals.load-mods.help')}
                    style={{ resize: 'none', height }}
                    onChange={onTextAreaChange}
                />
            </div>}
        </div>
        {!shouldShowLogs && <div type="DekFoot" className='d-flex w-100 gap-3'>
            {mods && <Button variant="danger" className="col p-2 px-3" onClick={() => setMods(null)}>
                <strong>{t('common.cancel')}</strong>
            </Button>}
            {mods && <Button variant="success" className="col p-2 px-3" onClick={onClickedDownloadAndInstall}>
                <strong>{t('modals.load-mods.load')}</strong>
            </Button>}
            {!mods && <Button variant="secondary" className="col p-2 px-3" onClick={onClickedLoadFromFile}>
                <strong>{t('modals.check-mods.load-json')}</strong>
            </Button>}
        </div>}
    </DekCommonAppModal>;
}

/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import IconX from '@svgs/fa5/regular/window-close.svg';

import Modal from 'react-bootstrap/Modal';
// import useMediaQuery from '@hooks/useMediaQuery';
import useScreenSize from '@hooks/useScreenSize';
import replaceUe4ssIniKeyValue from 'utils/replaceIniKey';

export default function InstallUe4ssModal({ show, setShow }) {
    const handleCancel = () => setShow(false);
    const { isDesktop } = useScreenSize();
    const fullscreen = !isDesktop;

    const height = fullscreen ? 'calc(100vh - 182px)' : 'calc(100vh / 4 * 2 + 26px)';
    const logRef = useRef(null);

    const [logMessages, setLogMessages] = useState([]);

    const addLogMessage = (message) => {
        setLogMessages((old) => [...old, message]);
        if (logRef.current) {
            setTimeout(() => (logRef.current.scrollTop = logRef.current.scrollHeight));
            // logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    };

    const resetLogMessages = () => {
        setLogMessages([]);
    };

    // initialize the ue4ss installation's configuration
    const setUe4ssDefaultSettings = useCallback(async () => {
        if (!window.uStore) return console.error('uStore not loaded');
        if (!window.palhub) return console.error('palhub not loaded');
        if (!window.nexus) return console.error('nexus not loaded');
        try {
            addLogMessage('Setting UE4SS Default Settings');
            const game_path = await window.uStore.get('game_path');
            const game_data = await window.palhub('validateGamePath', game_path);
            const ini_path = await window.palhub('joinPath', game_data.ue4ss_root, 'UE4SS-settings.ini');
            let updated_ini = await window.palhub('readFile', ini_path, { encoding: 'utf-8' });
            updated_ini = replaceUe4ssIniKeyValue(updated_ini, 'General', 'bUseUObjectArrayCache', false);
            //  do any other configuration initialization changes here.
            await window.palhub('writeFile', ini_path, updated_ini, { encoding: 'utf-8' });
            addLogMessage('Successfully set General.bUseUObjectArrayCache to false');
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        if (!window.ipc) return console.error('ipc not loaded');

        const remove_ue4ss_handler = window.ipc.on('ue4ss-process', (type, data) => {
            switch (type) {
                case 'download':
                    addLogMessage(`Downloading: ${data.filename} - ${data.percentage}%`);
                    break;

                case 'extract':
                    addLogMessage(`Extracting: ${data.outputPath}`);
                    break;

                case 'error':
                    addLogMessage(data);
                    break;

                case 'complete':
                    addLogMessage('UE4SS Installation Complete!');
                    setUe4ssDefaultSettings();
                    break;
            }
        });

        return () => remove_ue4ss_handler();
    }, []);

    // return the actual envmodal
    return (
        <Modal
            show={show}
            size="lg"
            fullscreen={fullscreen}
            onHide={handleCancel}
            backdrop="static"
            keyboard={false}
            centered
        >
            <Modal.Header className="p-4 theme-border ">
                <Modal.Title className="col">
                    <strong>Installing UE4SS.. Please Wait.</strong>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <div className="overflow-auto m-0 p-3" style={{ height }} ref={logRef}>
                    <pre className="m-0 p-2 text-start">{logMessages.join('\n')}</pre>
                </div>
            </Modal.Body>
        </Modal>
    );
}

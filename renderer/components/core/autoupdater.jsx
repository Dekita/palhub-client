/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import styles from '../styles/Home.module.css'
// import { motion } from 'framer-motion';
import React from 'react';
import { useRouter } from 'next/router';
import useLocalization from '@hooks/useLocalization';

export default function AutoUpdater({}) {
    const router = useRouter();
    const { t } = useLocalization();
    const active_route = router.pathname;
    const [updateMessage, setUpdateMessage] = React.useState();
    const [canInstallUpdate, setCanInstallUpdate] = React.useState(false);

    const beginInstallUpdate = () => {
        if (!window.ipc) return console.error('ipc not loaded');
        window.ipc.invoke('install-update');
    }

    React.useEffect(() => {
        if (!window.ipc) return console.error('ipc not loaded');

        const remove_auto_update_handler = window.ipc.on('auto-updater', (type, data) => {
            console.log('auto-update', {type, data});
            switch (type) {
                case 'checking-for-update':
                    setUpdateMessage(t('#updater.checking'));
                    break;
                case 'update-available':
                    setUpdateMessage(t('#updater.available'));
                    break;
                case 'update-not-available':
                    setUpdateMessage(t('#updater.current'));
                    setTimeout(() => setUpdateMessage(null), 3000);
                    break;
                case 'update-downloaded':
                    setUpdateMessage(null);
                    setCanInstallUpdate(true);
                    break;
                case 'error':
                    const error = JSON.stringify(data);
                    setUpdateMessage(t('#updater.error', {error}));
                    break;
                case 'before-quit-for-update':
                    setUpdateMessage(t('#updater.preparing'));
                    break;
                case 'download-progress':
                    const {bytesPerSecond, percent, transferred, total} = data;
                    const mbps = (bytesPerSecond / 1024 / 1024).toFixed(2);
                    const perc = percent.toFixed(2);
                    setUpdateMessage(t('#updater.downloading', {mbps, perc}));
                    break;
                case 'initializing':
                    setUpdateMessage(t('#updater.starting'));
                    break;
                default:
                    break;
            }
        });

        // // for testing
        // const data = {bytesPerSecond: 1000345543534, percent: 50, transferred: 500, total: 1000};
        // const {bytesPerSecond, percent, transferred, total} = data;
        // const mbps = (bytesPerSecond / 1024 / 1024).toFixed(2);
        // setUpdateMessage(`UPDATING @ ${mbps} MB/s - ${percent.toFixed(2)}%`);
        // setUpdateMessage(null);
        // setCanInstallUpdate(false);

        return () => remove_auto_update_handler();
    }, [active_route]); 

    const showUpdateMessage = updateMessage || canInstallUpdate;

    return <React.Fragment>
        {showUpdateMessage && <div className='container text-center'>
            {updateMessage && <div className='text-white alert alert-danger border-2 border-danger2 py-1 px-3 mt-3'>
                <small><strong>{updateMessage}</strong></small>
            </div>}
            {canInstallUpdate && <button className='btn btn-sm btn-info mt-2 px-3' onClick={beginInstallUpdate}>
                <small><strong>{t('#updater.install')}</strong></small>
            </button>}
        </div>}
    </React.Fragment>;
}

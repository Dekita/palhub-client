/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/

// import styles from '../styles/Home.module.css'
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import Container from 'react-bootstrap/Container';
import Dropdown from 'react-bootstrap/Dropdown';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Table from 'react-bootstrap/Table';

import DekSelect from '@components/core/dek-select';
import Dektionary from '@config/dektionary';
import * as CommonIcons from '@config/common-icons';

import DekCheckbox from '@components/core/dek-checkbox';
import Image from 'next/image';

import navbar_items from '@config/navbar-items';

const NSFWIcons = {
    enabled: CommonIcons.eye,
    disabled: CommonIcons.eye_slash,
};

export default function AutoUpdater({}) {
    const router = useRouter();
    const active_route = router.pathname;

    const [updateMessage, setUpdateMessage] = useState();


    useEffect(() => {
        if (!window.ipc) return console.error('ipc not loaded');

        const remove_auto_update_handler = window.ipc.on('auto-updater', (type, data) => {
            console.log('auto-update', {type, data});
            switch (type) {
                case 'checking-for-update':
                    setUpdateMessage('Checking for updates...');
                    break;
                case 'update-available':
                    setUpdateMessage('Update available.');
                    // initialize the auto updater
                    window.ipc.invoke('install-update');
                    break;
                case 'update-not-available':
                    setUpdateMessage('No updates available.');
                    setTimeout(() => setUpdateMessage(null), 3000);
                    break;
                case 'update-downloaded':
                    setUpdateMessage('Update downloaded.');
                    break;
                case 'error':
                    setUpdateMessage(`Error updating: ${JSON.stringify(data)}`);
                    break;
                case 'before-quit-for-update':
                    setUpdateMessage('Preparing to update...');
                    break;
                case 'download-progress':
                    setUpdateMessage(`Downloading:  ${JSON.stringify(data)}`);
                    break;
                case 'initializing':
                    setUpdateMessage('Initializing...');
                    break;
                default:
                    break;
            }
        });



        return () => remove_auto_update_handler();
    }, []);   

    return <>
        {updateMessage && <div className='container mt-5 alert alert-danger border-2 border-danger2 text-center'>
            <div className='px-3 text-white'>
                <small><strong>{updateMessage}</strong></small>
            </div>
        </div>}
    </>;
}

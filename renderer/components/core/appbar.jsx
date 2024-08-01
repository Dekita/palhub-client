/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/

// import styles from '../styles/Home.module.css'
import { useEffect, useRef, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Dropdown from 'react-bootstrap/Dropdown';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import Dektionary from '@config/dektionary';
import * as CommonIcons from '@config/common-icons';
import Link from 'next/link';


export default function MainAppbar() {

    const [appVersion, setAppVersion] = useState('0.0.0');

    const onClickMinimizeApp = () => {
        if (window.ipc) window.ipc.invoke('app-action', 'main', 'minimize');
        else console.log('window.ipc not found');
    }
    const onClickMaximizeApp = () => {
        if (window.ipc) window.ipc.invoke('app-action', 'main', 'maximize');
        else console.log('window.ipc not found');
    }
    const onClickCloseApp = () => {
        if (window.ipc) window.ipc.invoke('app-action', 'main', 'exit');
        else console.log('window.ipc not found');
    }

    useEffect(() => {
        if (!window.ipc) return;
        window.ipc.invoke('get-version').then((version) => {
            setAppVersion(version);
        });
    }, []);

    // -webkit-user-select: none;-webkit-app-region: drag;

    const sharedStyle = {
        paddingTop: 6,
    } 
 

    return (
        <Container className='theme-text p-0 appbar' fluid>
            <div className='d-flex p-0'>
                {/* <Link 
                    href='https://dekitarpg.com' target="_blank" 
                    className='px-3 hover-dark hover-warning'
                    style={sharedStyle}>
                    <small><strong>{Dektionary.brandname}</strong></small>
                </Link> */}
                <div 
                    className='px-3 text-dark'
                    style={sharedStyle}>
                    <small><strong>{Dektionary.brandname}</strong> v{appVersion}</small>
                </div>


                <div className='col deap-dragbar px-2'>
                    {/* is the main draggable region to move de vindoe */}
                </div>
                <div className='text-end'>
                    <button onClick={onClickMinimizeApp} className='btn appbar-btn py-1 no-shadow'>
                        <CommonIcons.minimize height='1rem' fill='currentColor'/>
                    </button>
                    <button onClick={onClickMaximizeApp} className='btn appbar-btn py-1 no-shadow'>
                        <CommonIcons.maximize height='1rem' fill='currentColor'/>
                    </button>
                    <button onClick={onClickCloseApp} className='btn appbar-btn py-1 no-shadow'>
                        <CommonIcons.close_window height='1rem' fill='currentColor'/>
                    </button>
                </div>
            </div>
        </Container>
    );
}

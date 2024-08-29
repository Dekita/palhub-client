/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import { useCallback, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import useWindowNameFromDEAP from '@hooks/useWindowNameFromDEAP';
import * as CommonIcons from '@config/common-icons';
import Dektionary from '@config/dektionary';
// import Link from 'next/link';

export default function MainAppbar() {
    const windowName = useWindowNameFromDEAP();
    const [appVersion, setAppVersion] = useState('0.0.0');
    const sharedStyle = {paddingTop: 6};

    const onClickMinimizeApp = useCallback(() => {
        if (window.ipc) window.ipc.invoke('app-action', windowName, 'minimize');
        else console.log('window.ipc not found');
    }, [windowName]);
    const onClickMaximizeApp = useCallback(() => {
        if (window.ipc) window.ipc.invoke('app-action', windowName, 'maximize');
        else console.log('window.ipc not found');
    }, [windowName]);
    const onClickCloseApp = useCallback(() => {
        if (window.ipc) window.ipc.invoke('app-action', windowName, 'exit');
        else console.log('window.ipc not found');
    }, [windowName]);

    useEffect(() => {
        if (!window.ipc) return;
        window.ipc.invoke('get-version').then((version) => {
            setAppVersion(version);
        });
    }, []);

    return <Container className='theme-text p-0 appbar' fluid>
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
    </Container>;
}

/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import { useCallback, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import * as CommonIcons from '@config/common-icons';
import useWindowNameFromDEAP from '@hooks/useWindowNameFromDEAP';
import useLocalization from '@hooks/useLocalization';
import useAppLogger from '@hooks/useAppLogger';


export default function MainAppbar() {
    const { t, ready } = useLocalization();
    const windowName = useWindowNameFromDEAP();
    const [appVersion, setAppVersion] = useState('0.0.0');
    const logger = useAppLogger('components/core/appbar');
    
    const onClickMinimizeApp = useCallback(() => {
        window?.ipc?.invoke('app-action', windowName, 'minimize');
        logger('info', 'onClickMinimizeApp');
    }, [windowName]);
    const onClickMaximizeApp = useCallback(() => {
        window?.ipc?.invoke('app-action', windowName, 'maximize');
        logger('info', 'onClickMaximizeApp');
    }, [windowName]);
    const onClickCloseApp = useCallback(() => {
        window?.ipc?.invoke('app-action', windowName, 'exit');
        logger('info', 'onClickCloseApp');
    }, [windowName]);
    
    useEffect(() => {
        window?.ipc?.invoke('get-version').then(setAppVersion);
    }, []);
    
    // if (!ready) return <></>;
    
    return <Container className='theme-text p-0 appbar' fluid>
        <div className='d-flex p-0'>
            <div className='px-3 text-dark' style={{paddingTop: 6}}>
                <small><strong>{t('app.brandname')}</strong> {t('app.version', {version: appVersion})}</small>
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

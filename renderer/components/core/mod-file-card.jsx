/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import DOMPurify from 'dompurify';
import * as CommonIcons from 'config/common-icons';
import { fetcher } from "@hooks/useSwrJSON";
import DekFileTree from '@components/core/dek-filetree';
import { SphereSpinner } from 'react-spinners-kit';
import BBCodeRenderer from "@components/core/bbcode";
import { ProgressBar } from 'react-bootstrap';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Popover from 'react-bootstrap/Popover';

export default function ModFileCard({mod, file}) {
    const [filetree, setFiletree] = React.useState(null);
    const [showFileTree, setShowFileTree] = React.useState(false);
    const [isDownloaded, setIsDownloaded] = React.useState(false);
    const [isInstalled, setIsInstalled] = React.useState(false);

    const [isDownloading, setIsDownloading] = React.useState(false);
    const [isInstalling, setIsInstalling] = React.useState(false);
    const [isUninstalling, setIsUninstalling] = React.useState(false);

    const [downloadProgress, setDownloadProgress] = React.useState(0);

    React.useEffect(() => {
        if (!window.ipc) return console.error('ipc not loaded');

        const remove_dl_handler = window.ipc.on('download-mod-file', ({mod_id, file_id, percentage}) => {
            if (mod_id !== mod.mod_id || file_id !== file.file_id) return;
            setDownloadProgress(Number(percentage));
        });

        (async () => {
            if (!window.uStore) return console.error('uStore not loaded');
            if (!window.palhub) return console.error('palhub not loaded');
            if (!window.nexus) return console.error('nexus not loaded');

            if (!showFileTree) return;

            const api_key = await window.uStore.get('api_key');
            const filetree = await fetcher(file.content_preview_link);

            console.log({filetree});
            setFiletree(filetree);
        })();

        return () => {
            remove_dl_handler();
        }

    }, [showFileTree, mod, file]);

    React.useEffect(() => {
        (async () => {
            if (!window.uStore) return console.error('uStore not loaded');
            if (!window.palhub) return console.error('palhub not loaded');
            if (!window.nexus) return console.error('nexus not loaded');
            const cache_dir = await window.uStore.get('cache_dir');
            const game_path = await window.uStore.get('game_path');
            const api_key = await window.uStore.get('api_key');

            if (!file || !mod) return;

            const is_downloaded = await window.palhub('checkModFileIsDownloaded', cache_dir, file);
            setIsDownloaded(is_downloaded);

            const is_installed = await window.palhub('checkModIsInstalled', game_path, mod, file);
            setIsInstalled(is_installed);

            console.log({is_downloaded, is_installed, cache_dir, game_path, name: mod?.name, file: file?.file_name});
        })();
    }, [mod, file]);



    const onDownloadModZip = React.useCallback(async() => {
        console.log('downloading mod:', mod);
        if (!window.uStore) return console.error('uStore not loaded');
        if (!window.palhub) return console.error('palhub not loaded');
        if (!window.nexus) return console.error('nexus not loaded');
        const api_key = await window.uStore.get('api_key');
        const cache_dir = await window.uStore.get('cache_dir');

        try {
            setIsDownloading(true);
            const file_links = await window.nexus(api_key, 'getDownloadURLs', mod.mod_id, file.file_id);
            const download_url = file_links.find(link => !!link.URI)?.URI;
            console.log({file_links, download_url});
    
            const result = await window.palhub('downloadMod', cache_dir, download_url, mod, file);
            setIsDownloading(false);
            setIsDownloaded(true);
            console.log({result});
        } catch (error) {
            console.error('error downloading mod:', error);
        }            
        // handleCancel();
    }, [mod, file]);

    const onInstallModFiles = React.useCallback(async() => {
        console.log('installing mod:', mod);
        if (!window.uStore) return console.error('uStore not loaded');
        if (!window.palhub) return console.error('palhub not loaded');
        if (!window.nexus) return console.error('nexus not loaded');
        const api_key = await window.uStore.get('api_key');
        const game_path = await window.uStore.get('game_path');
        const cache_dir = await window.uStore.get('cache_dir');

        try {
            const result = await window.palhub('installMod', cache_dir, game_path, mod, file);
            setIsInstalled(true);
            console.log({result});
        } catch (error) {
            console.error('error installing mod:', error);
        }
        // handleCancel();
    }, [mod, file]);

    const onUninstallModFiles = React.useCallback(async() => {
        console.log('uninstalling mod:', mod);
        if (!window.uStore) return console.error('uStore not loaded');
        if (!window.palhub) return console.error('palhub not loaded');
        if (!window.nexus) return console.error('nexus not loaded');
        const game_path = await window.uStore.get('game_path');

        try {
            const result = await window.palhub('uninstallMod', game_path, mod);
            setIsInstalled(false);
            console.log({result});
        } catch (error) {
            console.error('error uninstalling mod:', error);
        }
        // handleCancel();
    }, [mod, file]);

    const onUninstallModCache = React.useCallback(async() => {
        console.log('uninstalling mod:', mod);
        if (!window.uStore) return console.error('uStore not loaded');
        if (!window.palhub) return console.error('palhub not loaded');
        if (!window.nexus) return console.error('nexus not loaded');
        const cache_dir = await window.uStore.get('cache_dir');
        const game_path = await window.uStore.get('game_path');
        setDownloadProgress(0);

        try {
            // try {
            //     await window.palhub('uninstallMod', game_path, mod);
            // } catch {
            //     console.log('error uninstalling mod:', error);
            // }
            await window.palhub('uninstallFilesFromCache', cache_dir, mod, file);
            setIsDownloaded(false);
            // setIsInstalled(false);
        } catch (error) {
            console.error('error uninstalling mod:', error);
        }
        // handleCancel();
    }, [mod, file]);



    // external_virus_scan_url
    // mod_version
    // uploaded_timestamp
    // uploaded_time
    // version
    // content_preview_link

    const bytesToSize = (bytes) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }
    const delay = { show: 100, hide: 250 };
    const placement = 'bottom';

    const EyeIcon = showFileTree ? CommonIcons.eye_other : CommonIcons.eye;

    const buttonWidth = 54;


    return <div className='row' style={{minHeight:92}}>
        <div className={`col`}>
            <div className='row'>
                <div className='col'>
                    <h6 className={`pe-3 mb-0`}>v{file.version} - {file.file_name}</h6>
                    <small className='text-dark'>uploaded: {new Date(file.uploaded_time).toLocaleString()}</small>
                    <small className='text-dark'> - size: {bytesToSize(file.size_in_bytes)}</small>
                </div>
                
                <div className='col text-end pe-0' style={{maxWidth:108}}>
                    {file.is_primary && (
                        <span className='badge bg-secondary border border-secondary2 w-100'>
                            suggested
                        </span>
                    )}
                    {isInstalled && (
                            <span className='badge bg-success border border-success2 w-100'>
                                installed
                            </span>
                    )}
                    {isDownloaded && !isInstalled && (
                        <span className='badge bg-primary border border-primary2 w-100'>
                            downloaded
                        </span>
                    )}
                </div>
            </div>
            
            <BBCodeRenderer bbcodeText={file.description} />
        </div>
        <div className="col text-end px-0" style={{maxWidth: 206}}>
            <OverlayTrigger placement={placement} delay={delay} overlay={
                <Tooltip className="text-end">View File Tree</Tooltip>
            }>
                <button
                    disabled={false}
                    style={{minWidth: buttonWidth}}
                    className='btn btn-dark hover-secondary col p-2'
                    onClick={() => setShowFileTree(!showFileTree)}>
                    <EyeIcon fill='currentColor' height="2rem" />
                </button>
            </OverlayTrigger>

            <OverlayTrigger placement={placement} delay={delay} overlay={
                <Tooltip className="text-end">Virus Scan Results<br />(opens in default browser)</Tooltip>
            }>
                <a
                    disabled={false}
                    style={{minWidth: buttonWidth}}
                    href={file.external_virus_scan_url}
                    target="_blank"
                    className='btn btn-dark hover-warning col p-2 mx-2'
                    >
                    <CommonIcons.shield fill='currentColor' height="2rem" />
                </a>
            </OverlayTrigger>
            
            {isDownloaded && isInstalled && (
            <OverlayTrigger placement={placement} delay={delay} overlay={
                <Tooltip className="text-end">Uninstall mod files from your local palworld game directory.</Tooltip>
            }>
                <button
                    disabled={false}
                    style={{minWidth: buttonWidth}}
                    className='btn btn-dark hover-danger col p-2'
                    onClick={onUninstallModFiles}>
                    <CommonIcons.trash fill='currentColor' height="2rem" />
                </button>
            </OverlayTrigger>)}
            
            {!isDownloaded && (
            <OverlayTrigger placement={placement} delay={delay} overlay={
                <Tooltip className="text-end">Download Mod Files</Tooltip>
            }>
                <button
                    style={{minWidth: buttonWidth}}
                    disabled={isDownloading}
                    className='btn btn-dark hover-primary col p-2'
                    onClick={onDownloadModZip}>
                    <CommonIcons.download fill='currentColor' height="2rem" />
                </button>
            </OverlayTrigger>)}

            {isDownloaded && !isInstalled && (
            <OverlayTrigger placement={placement} delay={delay} overlay={
                <Tooltip className="text-end">Install mod files to your local palworld game directory.</Tooltip>
            }>
                <button
                    disabled={false}
                    style={{minWidth: buttonWidth}}
                    className='btn btn-dark hover-success col p-2'
                    onClick={onInstallModFiles}>
                    <CommonIcons.arrow_right fill='currentColor' height="2rem" />
                </button>
            </OverlayTrigger>)}
            
            {isDownloaded && (
                <button
                    disabled={false}
                    style={{minWidth: buttonWidth}}
                    className='btn hover-dark hover-danger col p-0'
                    onClick={onUninstallModCache}>
                    remove files from cache
                </button>
            )}

            {!isDownloaded && isInstalled && (
                <button
                    disabled={false}
                    style={{minWidth: buttonWidth}}
                    className='btn hover-dark hover-danger col p-0'
                    onClick={onUninstallModFiles}>
                    uninstall mod files
                </button>
            )}

            {isDownloading && (
                <div className='d-flex justify-content-end'>
                    <ProgressBar now={downloadProgress} 
                        label={`${downloadProgress}%`} 
                        variant="success" className='mt-2 border border-success2 radius0' 
                        style={{width: 182}}
                    />
                </div>
            )}

            {/* <div className="d-flex justify-content-center p-3">
                <SphereSpinner color='currentColor' />
            </div> */}
        </div>

        {showFileTree && <DekFileTree data={filetree} />}



        {/* <iframe src={file.content_preview_link} className='w-100' style={{height: '50vh'}}></iframe> */}

        <hr className='mt-2' />
    </div>
}

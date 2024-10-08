/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import { fetcher } from "@hooks/useSwrJSON";
import DekFileTree from '@components/core/dek-filetree';
import BBCodeRenderer from "@components/core/bbcode";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Tooltip from 'react-bootstrap/Tooltip';
// import Popover from 'react-bootstrap/Popover';
import * as CommonIcons from '@config/common-icons';
import useLocalization from '@hooks/useLocalization';
import useCommonChecks from '@hooks/useCommonChecks';

export default function ModFileCard({mod, file}) {
    const { requiredModulesLoaded, commonAppData } = useCommonChecks();

    const api_key = commonAppData?.apis?.nexus;
    const cache_dir = commonAppData?.cache;
    const game_path = commonAppData?.selectedGame.path;

    const { t, tA, language } = useLocalization();    
    const [filetree, setFiletree] = React.useState(null);
    const [showFileTree, setShowFileTree] = React.useState(false);
    const [isDownloaded, setIsDownloaded] = React.useState(false);
    const [isInstalled, setIsInstalled] = React.useState(false);
    const [isDownloading, setIsDownloading] = React.useState(false);
    const [isInstalling, setIsInstalling] = React.useState(false);
    const [isUninstalling, setIsUninstalling] = React.useState(false);
    const [downloadProgress, setDownloadProgress] = React.useState(0);

    React.useEffect(() => {
        if (!requiredModulesLoaded) return;

        const remove_dl_handler = window.ipc.on('download-mod-file', ({mod_id, file_id, percentage}) => {
            if (mod_id !== mod.mod_id || file_id !== file.file_id) return;
            setDownloadProgress(Number(percentage));
        });

        (async () => {
            if (!showFileTree) return;
            const filetree = await fetcher(file.content_preview_link);
            console.log({filetree});
            setFiletree(filetree);
        })();

        return () => remove_dl_handler();
    }, [showFileTree, mod, file]);

    React.useEffect(() => {
        if (!requiredModulesLoaded) return;
        (async () => {
            if (!file || !mod) return;

            const is_downloaded = await window.palhub('checkModFileIsDownloaded', cache_dir, file);
            setIsDownloaded(is_downloaded);

            const is_installed = await window.palhub('checkModIsInstalled', game_path, mod, file);
            setIsInstalled(is_installed);

            console.log({is_downloaded, is_installed, cache_dir, game_path, name: mod?.name, file: file?.file_name});
        })();
    }, [mod, file]);



    const onDownloadModZip = React.useCallback(async() => {
        if (!requiredModulesLoaded) return;
        console.log('downloading mod:', mod);

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
        if (!requiredModulesLoaded) return;
        console.log('installing mod:', mod);

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
        if (!requiredModulesLoaded) return;
        console.log('uninstalling mod:', mod);

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
        if (!requiredModulesLoaded) return;
        console.log('uninstalling mod:', mod);
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

    if (!requiredModulesLoaded) return null;

    return <div className='row' style={{minHeight:92}}>
        <div className={`col`}>
            <div className='row'>
                <div className='col'>
                    <h6 className={`pe-3 mb-0`}>{t('modals.mod-details.file-version', {file})}</h6>
                    <small className='text-dark'>{t('modals.mod-details.file-info', {
                        date: new Date(file.uploaded_time).toLocaleString(language ?? 'en', { dateStyle: 'medium', timeStyle: 'short' }), 
                        size: bytesToSize(file.size_in_bytes),
                    })}</small>
                </div>
                <div className='col text-end pe-0' style={{maxWidth:108}}>
                    {file.is_primary && <span className='badge bg-secondary border border-secondary2 w-100'>{t('common.suggested')}</span>}
                    {isInstalled && <span className='badge bg-success border border-success2 w-100'>{t('common.installed')}</span>}
                    {isDownloaded && !isInstalled && <span className='badge bg-primary border border-primary2 w-100'>{t('common.downloaded')}</span>}
                </div>
            </div>
            
            <BBCodeRenderer bbcodeText={file.description} />
        </div>
        <div className="col text-end px-0" style={{maxWidth: 206}}>
            <OverlayTrigger placement={placement} delay={delay} overlay={
                <Tooltip className="text-end">{t('modals.mod-details.popups.view-tree')}</Tooltip>
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
                <Tooltip className="text-end">
                    {t('modals.mod-details.popups.view-scan')}<br />
                    {t('common.open-link')}    
                </Tooltip>
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
                <Tooltip className="text-end">{t('modals.mod-details.popups.uninstall')}</Tooltip>
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
                <Tooltip className="text-end">{t('modals.mod-details.popups.download')}</Tooltip>
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
                <Tooltip className="text-end">{t('modals.mod-details.popups.install')}</Tooltip>
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
                    {t('modals.mod-details.remove')}
                </button>
            )}

            {!isDownloaded && isInstalled && (
                <button
                    disabled={false}
                    style={{minWidth: buttonWidth}}
                    className='btn hover-dark hover-danger col p-0'
                    onClick={onUninstallModFiles}>
                    {t('modals.mod-details.uninstall')}
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
        </div>

        {showFileTree && <DekFileTree data={filetree} />}



        {/* <iframe src={file.content_preview_link} className='w-100' style={{height: '50vh'}}></iframe> */}

        <hr className='mt-2' />
    </div>
}

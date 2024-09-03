/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import Link from 'next/link';
import Carousel from 'react-bootstrap/Carousel';
import DekChoice from "@components/core/dek-choice";
// import DekSelect from '@components/core/dek-select';
import DekCheckbox from '@components/core/dek-checkbox';
import BrandHeader from '@components/core/brand-header';

import { ENVEntry, ENVEntryLabel } from '@components/modals/common';
import InstallUe4ssModal from '@components/modals/ue4ss-install';
import Ue4ssSettingsModal from '@components/modals/ue4ss-settings';

import useLocalization from '@hooks/useLocalization';
import useAppLogger from '@hooks/useAppLogger';
import wait from '@utils/wait';

const SetupStep = ({step, handleUE4SSInstall}) => {
    switch (step) {
        case 0: return <div className='card bg-success border-success2 border my-4 p-3 text-center'>
            <h4 className='mb-0'><strong>Your all set up!</strong></h4>
            <p className='px-2 px-xl-5'>
                Everything seems configured and ready to go. You can now use PalHUB client to easily manage your Palworld game mods using the buttons below!
            </p>
            <div className='row gap-2 px-3'>
                <Link href='/play' className='col btn btn-dark p-3'>
                    <strong>Play Game</strong>
                </Link>
                <Link href='/mods' className='col btn btn-dark p-3'>
                    <strong>Add Mods</strong>
                </Link>
            </div>
        </div>;
        case 1: return <div className='card bg-danger border-danger2 border mt-4 p-3 text-center'>
            <h4 className='mb-0 text-warning'><strong>WARNING</strong></h4>
            <p>
                It appears you have not set your Palworld game installation path.<br />
                Please set the path to your Palworld game installation before continuing.
            </p>
        </div>;
        case 2: return <div className='card bg-danger border-danger2 border mt-4 p-3 text-center'>
            <h4 className='mb-0 text-warning'><strong>WARNING</strong></h4>
            <p>
                It appears you have not set your Nexus Mods API Key.<br />
                Please set your API Key before continuing.
            </p>
        </div>;
        case 3: return <div className='card bg-danger border-danger2 border mt-4 p-3 text-center'>
            <h4 className='mb-0 text-warning'><strong>WARNING</strong></h4>
            <p>
                It appears you have not set your PalHUB Cache Directory.<br />
                Please set the path to your PalHUB cache directory before continuing.
            </p>
        </div>;
        case 4: return <div className='card bg-danger border-danger2 border mt-4 p-3 text-center'>
            <h4 className='mb-0 text-warning'><strong>WARNING</strong></h4>
            <p>
                It appears you have not entered a <strong>valid</strong> Palworld game installation path.<br />
                Please set the path to your Palworld game installation before continuing.
            </p>
        </div>;
        case 5: return <div className='card bg-danger border-danger2 border mt-4 p-3 text-center'>
            <h4 className='mb-0 text-warning'><strong>WARNING</strong></h4>
            <p>
                It appears you do not have the Unreal Engine 4/5 Scripting System installed.<br />
                UE4SS is required for full mod functionality. It must be installed before continuing.
            </p>
            <button
                className='btn btn-warning p-3 w-100'
                onClick={handleUE4SSInstall}>
                <strong>Click here to download & install UE4SS</strong>
            </button>
        </div>;
        default: return null;
    }
}

export default function SettingsPage({modals, ThemeController}) {
    const { t, i18n, VALID_LANGUAGES } = useLocalization();
    
    // initial settings data for the application
    const [settings, setSettings] = React.useState({
        server_url: 'D:/SteamLibrary/steamapps/common/Palworld',
        server_type: '{UNKNOWN}',
        game_type: '{UNKNOWN}',
        game_path: '', // D:\SteamLibrary\steamapps\common\Palworld
        cache_dir: '', // D:\PalHUB\Client\cache
        show_key: false,
        api_key: '', // nexus mods api key

        has_ue4ss: false,
        has_exe: false, 

        settings_page: 0,

        // app options implemented by DEAP <3
        // ! todo: convert other options to be handled by DEAP for v1 rlease..
        'auto-boot': false,
        'auto-play': false,
        'auto-tiny': false,
        'tiny-tray': false,
    });

    // const [ue4ssProcess, setUE4SSProcess] = React.useState(null);
    const [showUE4SSInstall, setShowUE4SSInstall] = React.useState(false);
    const [showUE4SSSettings, setShowUE4SSSettings] = React.useState(false);

    // function to update a single setting
    const updateSetting = (key, value, store=false) => {
        // console.log('updating setting', key, value, store)
        if (store && window.uStore) window.uStore.set(key, value);
        setSettings(current=>({ ...current, [key]: value }));
    }

    const updateConfig = async (key, value) => {
        console.log('updating config', key, value)
        if (!window.ipc) return console.error('ipc not loaded');
        await window.ipc.invoke("set-config", key, value);
        setSettings(current=>({ ...current, [key]: value }));
    }

    // load initial settings from store
    React.useEffect(() => {
        (async () => {
            if (!window.uStore) return console.error('uStore not loaded');
            if (!window.palhub) return console.error('palhub not loaded');
            if (!window.ipc) return console.error('ipc not loaded');

            const api_key = await window.uStore.get('api_key', settings.api_key);
            let game_path = await window.uStore.get('game_path', settings.game_path);
            let cache_dir = await window.uStore.get('cache_dir', settings.cache_dir);
            let path_data = await window.palhub('validateGamePath', game_path);

            if (!!!game_path && !!!cache_dir) {
                console.log("Detecting game installation..")
                const new_path = await window.ipc.invoke("detect-game-installation");
                const new_data = await window.palhub('validateGamePath', new_path);
                if (new_path && new_data?.type) {
                    game_path = new_path;
                    path_data = new_data;
                    cache_dir = game_path ? `${game_path}\\PalHubCache` : '';
                    console.log({game_path, cache_dir})
                }
            }
            // console.log({path_data})
            
            updateSetting('api_key', api_key);
            updateSetting('game_path', game_path, true);
            updateSetting('cache_dir', cache_dir, true);
            updateSetting('game_type', path_data?.type ?? '{UNKNOWN}');
            updateSetting('has_ue4ss', path_data?.has_ue4ss ?? false);
            updateSetting('has_exe', path_data?.has_exe ?? false);
            // updateSetting('server_url', server_url);
            // updateSetting('server_type', server_type);

            const auto_boot = await window.ipc.invoke("get-config", "auto-boot");
            const auto_play = await window.ipc.invoke("get-config", "auto-play");
            const auto_tiny = await window.ipc.invoke("get-config", "auto-tiny");
            const tiny_tray = await window.ipc.invoke("get-config", "tiny-tray");
            updateConfig('auto-boot', auto_boot);
            updateConfig('auto-play', auto_play);
            updateConfig('auto-tiny', auto_tiny);
            updateConfig('tiny-tray', tiny_tray);
        })();
    }, []);

    // handles updating the password when a user types. 
    // has a small delay before hiding the password
    let passwordTimeoutHandler = null;
    const handlePasswordChange = React.useCallback((name, new_value) => {
        updateSetting('show_key', true);
        updateSetting('api_key', new_value);
        if (passwordTimeoutHandler) clearTimeout(passwordTimeoutHandler);
        passwordTimeoutHandler = setTimeout(() => {
            updateSetting('api_key', new_value, true);
            updateSetting('show_key', false);
        }, 1000);
    }, [passwordTimeoutHandler]);

    let gamePathTimeoutHandler = null;
    const handleGamePathChange = React.useCallback((name, new_value) => {
        updateSetting('game_type', '{UNKNOWN}');
        updateSetting('game_path', new_value);
        if (gamePathTimeoutHandler) clearTimeout(gamePathTimeoutHandler);
        gamePathTimeoutHandler = setTimeout(async () => {
            const path_data = await window.palhub('validateGamePath', new_value);
            updateSetting('game_path', new_value, true);
            updateSetting('game_type', path_data.type);
            updateSetting('has_ue4ss', path_data.has_ue4ss ?? false);
            updateSetting('has_exe', path_data?.has_exe ?? false);
            console.log({path_data})
        }, 1000);
    }, []);

    let serverPathTimeoutHandler = null;
    const handleServerPathChange = React.useCallback((name, new_value) => {
        updateSetting('server_url', new_value);
        if (serverPathTimeoutHandler) clearTimeout(serverPathTimeoutHandler);
        serverPathTimeoutHandler = setTimeout(() => {
            updateSetting('server_url', new_value, true);
        }, 1000);
    }, []);

    let cachePathTimeoutHandler = null;
    const handleCachePathChange = React.useCallback((name, new_value) => {
        updateSetting('cache_dir', new_value);
        if (cachePathTimeoutHandler) clearTimeout(cachePathTimeoutHandler);
        cachePathTimeoutHandler = setTimeout(() => {
            updateSetting('cache_dir', new_value, true);
        }, 1000);
    }, []);

    const onClickPathInput = React.useCallback(async(name, value) => {
        console.log('clicked path input', name, value);
        const result = await window.ipc.invoke('open-file-dialog', {
            title: 'Select Palworld Game Directory',
            properties: ['openDirectory'],
            // filters: [
            //     { name: 'JSON Files', extensions: ['json'] },
            //     { name: 'All Files', extensions: ['*'] }
            // ]
        });
    }, []);

    const handleUE4SSInstall = React.useCallback(async() => {
        setShowUE4SSInstall(true);

        if (!window.uStore) return console.error('uStore not loaded');
        if (!window.palhub) return console.error('palhub not loaded');

        const game_path = await window.uStore.get('game_path', settings.game_path);
        const cache_dir = await window.uStore.get('cache_dir', settings.cache_dir);
        await window.palhub('downloadAndInstallUE4SS', cache_dir, game_path);
        const path_data = await window.palhub('validateGamePath', game_path);
        updateSetting('has_ue4ss', path_data.has_ue4ss);

        await wait(1000);
        setShowUE4SSInstall(false);
    }, []);

    const install_types = ['steam','windows','xbox'];//, '{UNKNOWN}'];
    const installed_type = React.useMemo(() => {
        return install_types.indexOf(settings.game_type);
    }, [settings]);

    // determine the current setup step
    let current_setup_step = 0;
    if (!settings.game_path) current_setup_step = 1;
    if (!settings.api_key) current_setup_step = 2;
    if (!settings.cache_dir) current_setup_step = 3;
    if (settings.game_path && !settings.has_exe) current_setup_step = 4;
    if (settings.has_exe && !settings.has_ue4ss) current_setup_step = 5;

    // console.log({installed_type, settings})

    const onClickHelp = React.useCallback(() => {
        if (!window.ipc) return console.error('ipc not loaded');
        window.ipc.invoke('open-child-window', 'help');
    }, []);
    
    const words = [
        "The ULTIMATE mod manager for Palworld",
        "Join modified community servers with ease",
        "Download mods directly from Nexus Mods",
        "Manage your mod library with minimal clicks",
        "Configure the settings below to get started;",
    ];

    const valid_languages = ['en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'];

    return <React.Fragment>
        <InstallUe4ssModal show={showUE4SSInstall} setShow={setShowUE4SSInstall} />
        <Ue4ssSettingsModal show={showUE4SSSettings} setShow={setShowUE4SSSettings} />
        <BrandHeader type='altsmall' tagline="PalHUB Client" words={words} />

        <div className="container">
            <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                <div className="mx-auto px-3">

                    <SetupStep step={current_setup_step} handleUE4SSInstall={handleUE4SSInstall} />

                    <DekChoice 
                        className='pb-3'
                        disabled={false}
                        choices={['App Setup', 'Game Settings']}
                        active={settings.settings_page}
                        onClick={(i,value)=>{
                            console.log(`Setting Page: ${value}`)
                            updateSetting('settings_page', i);
                        }}
                    />

                </div>
            </div>
        </div>



        <Carousel interval={null} className='container' indicators={false} controls={false} activeIndex={settings.settings_page}>
            <Carousel.Item className=''>
                <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                    <div className="mx-auto px-3">

                    <ENVEntry 
                        value={settings.cache_dir}
                        name="PalHUB Cache Directory"
                        updateSetting={handleCachePathChange}
                        tooltip="The path to the PalHUB cache directory. This is where mods will be downloaded and stored."
                    />
                    <ENVEntry 
                        name="Nexus Mods API Key"
                        value={settings.api_key}
                        type={settings.show_key ? 'text' : 'password'}
                        updateSetting={handlePasswordChange}
                        tooltip="Your Nexus Mods API Key is required to download mods."
                    />
                    <div className='row mb-2'>
                        <div className='col px-3'>
                            <DekCheckbox
                                inline={true}
                                text="Show API Key"
                                // iconPos='left'
                                checked={settings.show_key}
                                onClick={(newval) => {
                                    console.log(newval);
                                    updateSetting('show_key', newval);
                                }}
                            />
                        </div>
                        <div className='col text-end px-3'>
                            <a
                                target="_blank"
                                href="https://next.nexusmods.com/settings/api-keys"
                                className='hover-dark text-warning'
                                // onClick={() => window.open('https://next.nexusmods.com/settings/api-keys', '_blank')}
                                style={{ width: 256 }}>
                                <strong>Get Nexus Mods API Key</strong>
                            </a>                            
                        </div>
                    </div>
                    <div className='row mb-2'>
                        <div className='col-12 col-lg-4'>
                            <ENVEntry 
                                name="Launch At Startup"
                                value={settings['auto-boot']}
                                updateSetting={(n,v)=>updateConfig('auto-boot', v)}
                                tooltip="Automatically start the PalHUB Client with your computer."
                            />
                        </div>
                        <div className='col-12 col-lg-4'>
                            <ENVEntry
                                name="Auto Minimize"
                                value={settings['auto-tiny']}
                                updateSetting={(n,v)=>updateConfig('auto-tiny', v)}
                                tooltip="Launch PalHUB Client in a minimized state when started."
                            />
                        </div>
                        <div className='col-12 col-lg-4'>
                            <ENVEntry
                                name="Minimize To Tray"
                                value={settings['tiny-tray']}
                                updateSetting={(n,v)=>updateConfig('tiny-tray', v)}
                                tooltip="Send PalHUB Client to the system tray when minized."
                            />
                        </div>
                    </div>

                    <ENVEntryLabel name="Change Color Theme [beta]" tooltip="Alter the UI by selecting from a range of spicy color themes.." />
                    <DekChoice 
                        className='pb-3 mt-1'
                        choices={ThemeController.themes}
                        active={ThemeController.theme_id}
                        onClick={(i,value)=>{
                            // updateSetting('theme-id', value, true);
                            ThemeController.setThemeID(value);
                        }}
                    />
                    <DekChoice 
                        className='pb-3'
                        disabled={false}
                        choices={['3pals','Grizzbolt','Lamball']}
                        active={ThemeController.bg_id}
                        onClick={(i,value)=>{
                            // updateSetting('theme-bg', value, true);
                            ThemeController.setBgID(i);
                        }}
                    />                    
                    {/* <ENVEntry
                        name="Auto Play"
                        value={settings['auto-play']}
                        updateSetting={(n,v)=>updateConfig('auto-play', v)}
                        tooltip="Automatically start playing the game when the client is started."
                    /> */}
                    {/* <div className="text-center my-5">
                        <button
                            className='btn btn-secondary p-3 m-2'
                            onClick={() => window.open('https://palhub.com', '_blank')}
                            style={{ width: 256 }}>
                            <strong>Get PalHUB Server</strong>
                        </button>
                    </div> */}   

                    </div>
                </div>

            </Carousel.Item>

            <Carousel.Item className=''>
                <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                    <div className="mx-auto px-3">

                        <ENVEntry 
                            name="Local Palworld Game Installation Path"
                            value={settings.game_path}
                            updateSetting={handleGamePathChange}
                            tooltip="The path to your Palworld game installation."
                        />

                        {/* <ENVEntry 
                            value={settings.server_url}
                            name="Local Game Server Installation Path"
                            updateSetting={handleServerPathChange}
                            tooltip="The path to your Palworld game server installation."
                        /> */}

                        <DekChoice 
                            className='pb-3'
                            disabled={true}
                            choices={install_types}
                            active={installed_type}
                            onClick={(i,value)=>{
                                console.log(`Setting Page: ${value}`)
                                // updateJobData('seamless', value === 'Yes')
                            }}
                        />
                        {settings?.has_ue4ss && <>
                            <div className='btn btn-dark px-3' onClick={() => setShowUE4SSSettings(true)}>
                                <strong>Edit UE4SS Settings</strong>
                            </div>
                        </>}
                        <div className='btn btn-dark ms-2 px-3' onClick={onClickHelp}>
                            <strong>FAQ</strong>
                        </div>
                    </div>
                </div>
            </Carousel.Item>
        </Carousel>



        <div className="container">
            <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                <div className="mx-auto px-3 pt-5 pb-4">

                    <strong>{t('settings.welcome')}</strong>

                    <DekChoice
                        className='pb-3'
                        choices={VALID_LANGUAGES}
                        active={VALID_LANGUAGES.indexOf(i18n.language)}
                        onClick={(i,value)=>{
                            i18n.changeLanguage(value);
                        }}
                    />

                </div>
            </div>
        </div>
    </React.Fragment>
}

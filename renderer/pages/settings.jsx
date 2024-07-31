import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import Input from '../components/input';
import Button from '../components/button';
import Navbar from '../components/navbar';
import Modal from '../components/modal';

import ModCardComponent from '../components/mod-card';
import AppHeadComponent from '../components/app-head';
import { ENVEntry, ENVEntryLabel } from '@components/modals/common';
// import DekSelect from '@components/core/dek-select';
import DekChoice from "@components/core/dek-choice";
import DekCheckbox from '@components/core/dek-checkbox';

import InstallUe4ssModal from '@components/modals/ue4ss-install';
import DekSelect from '@components/core/dek-select';

async function wait(milliseconds = 1000) {
    return new Promise((r) => setTimeout(r, milliseconds));
}

export default function SettingsPage({modals, ThemeController}) {
    console.log({ThemeController})
    // initial settings data for the application
    const [settings, setSettings] = React.useState({
        server_url: 'D:/SteamLibrary/steamapps/common/Palworld',
        server_type: '{UNKNOWN}',
        game_path: '',
        game_type: '{UNKNOWN}',
        show_key: false,
        api_key: '',

        cache_dir: 'D:/UE_Modding/HL Utils/palhub-client/cache',

        has_ue4ss: false,
    });

    // const [ue4ssProcess, setUE4SSProcess] = React.useState(null);
    const [showUE4SSInstall, setShowUE4SSInstall] = React.useState(false);

    // function to update a single setting
    const updateSetting = (key, value, store=false) => {
        // console.log('updating setting', key, value, store)
        if (store && window.uStore) window.uStore.set(key, value);
        setSettings(current=>({ ...current, [key]: value }));
    }

    const handleThemeChange = (event, newvalue) => {
        ThemeController.setThemeID(event.target.innerText);
    };

    // load initial settings from store
    React.useEffect(() => {
        (async () => {
            if (!window.uStore) return console.error('uStore not loaded');
            if (!window.palhub) return console.error('palhub not loaded');

            const api_key   = await window.uStore.get('api_key', settings.api_key);
            const game_path = await window.uStore.get('game_path', settings.game_path);
            const cache_dir = await window.uStore.get('cache_dir', settings.cache_dir);
            const path_data = await window.palhub('validateGamePath', game_path);
            const game_type = path_data?.type ?? '{UNKNOWN}';
            
            // const server_url = await window.uStore.get('server_url', settings.server_url);
            // const server_data = await window.palhub('validateGamePath', server_url);
            // const server_type = server_data?.type ?? '{UNKNOWN}';
            
            updateSetting('api_key', api_key);
            updateSetting('game_path', game_path);
            updateSetting('cache_dir', cache_dir);
            updateSetting('game_type', game_type);
            updateSetting('has_ue4ss', path_data.has_ue4ss);
            // updateSetting('server_url', server_url);
            // updateSetting('server_type', server_type);
        })();
    }, []);

    // React.useEffect(() => {
    //     if (!window.ipc) return console.error('ipc not loaded');

    //     const remove_ue4ss_handler = window.ipc.on('ue4ss-process', (type, data) => {
    //         setUE4SSProcess({ type, data });
    //     });

    //     return () => remove_ue4ss_handler();
    // }, []);    


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
            updateSetting('has_ue4ss', path_data.has_ue4ss);
            updateSetting('game_type', path_data.type);
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

    console.log({installed_type, settings})




    return <React.Fragment>

        <InstallUe4ssModal show={showUE4SSInstall} setShow={setShowUE4SSInstall} />


        <div className="container">
            <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                <div className="mx-auto px-3 pt-5 pb-4">
                    <h1 className="font-bold mb-4">Settings</h1>
                    <div className='mb-4'>
                        <p className="mb-0">
                            Welcome to PalHUB Client, the ultimate Palworld mod manager.
                        </p>
                        <p className="">
                            To get started, please configure the settings below.
                        </p>
                    </div>

                    <ENVEntry 
                        name="Local Palworld Game Installation Path"
                        value={settings.game_path}
                        updateSetting={handleGamePathChange}
                        tooltip="The path to your Palworld game installation."
                    />

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

                    {/* <ENVEntry 
                        value={settings.server_url}
                        name="Local Game Server Installation Path"
                        updateSetting={handleServerPathChange}
                        tooltip="The path to your Palworld game server installation."
                    /> */}
                    
                    <ENVEntry 
                        value={settings.cache_dir}
                        name="PalHUB Cache Directory"
                        updateSetting={handleCachePathChange}
                        tooltip="The path to the PalHUB cache directory. This is where mods will be downloaded and stored."
                    />

                    {!settings.has_ue4ss && <div className='card bg-danger border-danger2 border mt-4 p-3 text-center'>
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
                    </div>}

                    {settings.has_ue4ss && <div className='card bg-success border-success2 border my-4 p-3 text-center'>
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
                    </div>}


                    {/* <div className="text-center my-5">
                        <button
                            className='btn btn-secondary p-3 m-2'
                            onClick={() => window.open('https://palhub.com', '_blank')}
                            style={{ width: 256 }}>
                            <strong>Get PalHUB Server</strong>
                        </button>
                    </div> */}
                    <h1 className="font-bold mb-4">App Options</h1>

                    <ENVEntryLabel name="Change Color Theme" tooltip="Alter the UI by selecting from a range of spicy color themes.." />
                    <DekSelect
                        onChange={handleThemeChange}
                        active_id={ThemeController.theme_id}
                        uid='theme-dropdown'>
                        {ThemeController && ThemeController.themes &&
                            ThemeController.themes.map((theme, index) => (
                                <dekItem text={theme} id={index} key={index} />
                            ))}
                    </DekSelect>

                    {/* ['palhub', 'ikon', 'khakii', '1..6', 'metroid1', 'metroid2', 'nature1',] */}
                    <DekChoice 
                        className='pb-3'
                        choices={ThemeController.themes}
                        active={ThemeController.theme_id}
                        onClick={(i,value)=>{
                            console.log(`Setting Page: ${value}`)
                            handleThemeChange({target:{innerText:value}});
                            // updateJobData('seamless', value === 'Yes')
                        }}
                    />


                </div>
            </div>
        </div>
    </React.Fragment>
}

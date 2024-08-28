/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useScreenSize from '@hooks/useScreenSize';
import Modal from 'react-bootstrap/Modal';

import React from 'react';
import Container from 'react-bootstrap/Container';
import Collapse from 'react-bootstrap/Collapse';

import { stringify , parse } from 'ini'
import { ENVEntry, ENVEntryLabel, ensureEntryValueType } from "@components/modals/common";

import DekChoice from "@components/core/dek-choice";
import DekSelect from '@components/core/dek-select';
import DekCheckbox from '@components/core/dek-checkbox';
import IconX from '@svgs/fa5/regular/window-close.svg';




const UE4SS_NUMBOOLS = [
    'EnableHotReloadSystem',
    'UseCache',
    'InvalidateCacheIfDLLDiffers',
    'LoadAllAssetsBeforeDumpingObjects',
    'DumpOffsetsAndSizes',
    'KeepMemoryLayout',
    'LoadAllAssetsBeforeGeneratingCXXHeaders',
    'IgnoreAllCoreEngineModules',
    'MakeAllFunctionsBlueprintCallable',
    'IgnoreEngineAndCoreUObject',
    'MakeAllPropertyBlueprintsReadWrite',
    'MakeEnumClassesBlueprintType',
    'MakeAllConfigsEngineConfig',
    'HookProcessInternal',
    'HookProcessLocalScriptFunction',
    'HookInitGameState',
    'HookCallFunctionByNameWithArguments',
    'HookBeginPlay',
    'HookLocalPlayerExec',
    'EnableDumping',
    'FullMemoryDump',
    'GUIUFunctionCaller',
    'ConsoleEnabled',
    'GuiConsoleEnabled',
    'GuiConsoleVisible',
    'GuiConsoleFontScaling',
];

const IGNORED_UE4SS_CONFIG = [
    'ConsoleEnabled',
    'GuiConsoleEnabled',
    'GuiConsoleVisible',
    'GraphicsAPI',
    'MajorVersion',
    'MinorVersion',
    'bUseUObjectArrayCache',
];


const replaceUe4ssIniKeyValue = (iniContentString, section, key, newValue) => {
    // Create a regular expression to match the specific section and key
    const sectionRegex = new RegExp(`\\[${section}\\][\\s\\S]*?${key}\\s*=\\s*.*`, 'g');
    const replacer = s => s.replace(new RegExp(`(${key}\\s*=\\s*)[^\\n]*`), `$1${newValue}`);
    // Replace the old key-value pair with the new value
    return iniContentString.replace(sectionRegex, replacer);
}



export default function Ue4ssSettingsModal({show,setShow}) {

    const {isDesktop} = useScreenSize();
    const fullscreen = !isDesktop;
    
    const height = fullscreen ? "calc(100vh - 182px)" : "calc(100vh / 4 * 2 + 26px)";
    
    
    
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const [hasChanges, setHasChanges] = React.useState(false);
    const [settings, setSettings] = React.useState({});
    
    const handleCancel = () => {
        setShow(false);
        setTimeout(() => {
            setHasChanges(false);
            setShowAdvanced(false);
        }, 250);
    }

    // function to call for updating individual setting
    const updateSetting = (key, value) => {
        const keys = key.split('.');
        setSettings((data) => {
            // if value is function, call it passing data and use return value as new value
            if (typeof value === 'function') value = value(data);
            // update the data using key and value
            const updated_data = { ...data, [keys[0]]: { ...data[keys[0]], [keys[1]]: value } };
            // return updated data
            return updated_data;
        });
        setHasChanges(true);
        console.log('updated setting:', key, value)
    };


    React.useEffect(() => {
        (async () => {
            if (!window.uStore) return console.error('uStore not loaded');
            if (!window.palhub) return console.error('palhub not loaded');
            if (!window.nexus) return console.error('nexus not loaded');


            const api_key = await window.uStore.get('api_key');
            if (!api_key) return router.push('/settings');
            
            const game_path = await window.uStore.get('game_path');
            if (!game_path) return router.push('/settings');
            
            const game_data = await window.palhub('validateGamePath', game_path);
            if (!game_data.has_exe) return router.push('/settings');
            if (!game_data.has_ue4ss) return router.push('/settings');

            game_data.ue4ss_path

            console.log({game_data})


            // const cache_dir = await window.uStore.get('cache_dir');

            const ini_path = await window.palhub('joinPath', game_data.ue4ss_root, 'UE4SS-settings.ini');
            const ini_string = await window.palhub('readFile', ini_path, {encoding : 'utf-8'});

            setSettings(parse(ini_string));
        })();
    }, [show]);

    const onApply = React.useCallback(async () => {
        console.log('saving ini:..')
        if (!window.uStore) return console.error('uStore not loaded');
        if (!window.palhub) return console.error('palhub not loaded');
        if (!window.nexus) return console.error('nexus not loaded');
        
        const game_path = await window.uStore.get('game_path');
        const game_data = await window.palhub('validateGamePath', game_path);
        const ini_path = await window.palhub('joinPath', game_data.ue4ss_root, 'UE4SS-settings.ini');
        const ini_string = await window.palhub('readFile', ini_path, {encoding : 'utf-8'});
        
        let updated_ini = `${ini_string}`;
        for (const category in settings) {
            for (const [key, data] of Object.entries(settings[category])) {
                if (['MajorVersion', 'MinorVersion'].includes(key)) continue;
                updated_ini = replaceUe4ssIniKeyValue(updated_ini, category, key, data);
                console.log('updated:', key, data)
            }
        }
        
        // const new_ini_string = stringify(settings);
        await window.palhub('writeFile', ini_path, updated_ini, {encoding : 'utf-8'});
        setHasChanges(false);
    }, [settings]);


    if (settings) console.log(settings.General)



    return  <Modal
        show={show}
        size="lg"
        fullscreen={fullscreen}
        onHide={handleCancel}
        backdrop='static'
        keyboard={false}
        centered>
        <Modal.Header className='p-4 theme-border '>
            <Modal.Title className='col'>
                <strong>UE4SS-Settings.ini Configuration</strong>
            </Modal.Title>
            <div className='btn p-0 hover-danger no-shadow' onClick={handleCancel}>
                <IconX className='modalicon' fill='currentColor' />
            </div>
        </Modal.Header>
        <Modal.Body className="p-0">
            <div className='overflow-auto m-0 p-3 pt-4' style={{height}}>

                {hasChanges && <div className='mb-3'>
                    <div className='btn btn-danger w-100 p-3' onClick={onApply}>
                        <strong>Save Unsaved Changes</strong>
                    </div>
                </div>}

                <ENVEntryLabel name="Show UE4SS Console" tooltip="Display the UE4SS console when the game launches?" />
                <DekChoice 
                    className='pb-3'
                    disabled={false}
                    choices={['No', 'Console', 'GUI']}
                    active={settings?.Debug?.ConsoleEnabled === '1' ? 1 : settings?.Debug?.GuiConsoleEnabled === '1' ? 2 : 0}
                    onClick={(i,value)=>{
                        const isGui = value === 'GUI';
                        const isConsole = value === 'Console';
                        updateSetting('Debug.ConsoleEnabled', isConsole ? '1' : '0');
                        updateSetting('Debug.GuiConsoleEnabled', isGui ? '1' : '0');
                        updateSetting('Debug.GuiConsoleVisible', isGui ? '1' : '0');
                    }}
                />

                <ENVEntryLabel name="GUI Console Graphics API" tooltip="The display mode for the gui console." />
                <DekChoice 
                    className='pb-3'
                    disabled={settings?.Debug?.GuiConsoleEnabled !== '1'}
                    choices={['DX11', 'D3D11', 'OpenGL']}
                    active={settings?.Debug?.GraphicsAPI === 'dx11' ? 0 : settings?.Debug?.GraphicsAPI === 'd3d11' ? 1 : 2}
                    onClick={(i,value)=>{
                        updateSetting('Debug.GraphicsAPI', value === 'DX11' ? 'dx11' : value === 'D3D11' ? 'd3d11' : 'opengl');
                    }}
                />

                <div className='row'>
                    <div className='col'>
                        <ENVEntry 
                            name="bUseUObjectArrayCache"
                            value={settings?.General?.bUseUObjectArrayCache}
                            updateSetting={(name, value) => updateSetting(`General.${name}`, value)}
                            tooltip="Toggling this can help if your game crashes on startup. Disabled works best for most."
                        />
                    </div>
                    <div className='col'>
                        <ENVEntry 
                            name="Show UE4SS Developer Settings"
                            value={showAdvanced}
                            updateSetting={(name, value) => setShowAdvanced(value)}
                        />
                    </div>
                </div>

                <Collapse in={showAdvanced}>
                    <div className='row'>
                        <hr className='text-secondary border-4 mt-3'/>
                        <h3 className='text-dark font-bold mb-0 text-center'>UE4SS Developer Settings</h3>
                        {Object.keys(settings).map((key) => {
                            // if (key === 'General') return null;
                            return Object.keys(settings[key]).map((name, index) => {
                                if (IGNORED_UE4SS_CONFIG.includes(name)) return null;
                                // if (key === 'General' && name === 'bUseUObjectArrayCache') return null;
                                const value = settings[key][name];
                                const updater = (name, value) => updateSetting(`${key}.${name}`, value ? '1' : '0');
                                const type = UE4SS_NUMBOOLS.includes(name) ? 'numbool' : ensureEntryValueType(value);
                                return <div className="col-12 col-md-6" key={index}>
                                    <ENVEntry {...{name, value, type, updateSetting: updater, defaults: settings}} />
                                </div>
                            })
                        })}
                    </div>
                </Collapse>

            </div>
        </Modal.Body>
    </Modal>;
}

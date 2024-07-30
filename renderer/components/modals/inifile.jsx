/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ENVEntry, ensureEntryValueType } from "@components/modals/common";
import useScreenSize from "@hooks/useScreenSize";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import IconX from '@svgs/fa5/regular/window-close.svg';
import { fetcher } from '@hooks/useSwrJSON';

// import fs from 'node:fs';
import dotenv from 'dotenv';



import ini from 'ini';


function readINI(INI_FILE) {
    const PalScript = INI_FILE['/Script/Pal'];
    const {PalGameWorldSettings} = PalScript;
    const {OptionSettings} = PalGameWorldSettings;
    // replace the () around the OptionSettings values and parse into usable object
    const ReplOptionSettings = OptionSettings.replace(/^\(|\)$/g, '').replace(/\,/g, "\n");
    const OptionSettingsObject = ini.parse(ReplOptionSettings);
    Object.entries(OptionSettingsObject).map(([name, value]) => {
        OptionSettingsObject[name] = ensureEntryValueType(value, true);
    })
    console.log(OptionSettingsObject);
    return OptionSettingsObject;
}

function writeINI(ini_data) {
    // Convert the data object to INI format
    const iniData = ini.stringify(data);

    // Write the INI data to the file
    fs.writeFileSync(INI_FILE, ini_data, 'utf-8');
}










export default function INIModal({show,setShow,INI_FILE,INI_DEFAULTS,PALHUB_ADMIN_PASS}) {
    const handleCancel = () => setShow(false);
    const {isDesktop} = useScreenSize();
    const fullscreen = !isDesktop;


    const [settings, setSettings] = useState({});
    // function to call for updating individual setting
    const updateSetting = (key, value) => {
        setSettings((data) => {
            // if value is function, call it passing data and use return value as new value
            if (typeof value === 'function') value = value(data);
            // update the data using key and value
            const updated_data = { ...data, [key]: value };
            // return updated data
            return updated_data;
        });
        console.log('updated setting:', key, value)
        // console.log('envdatas:', envdatas);

    };

    // initially setup 'settings'
    useEffect(() => {
        setSettings(readINI(INI_FILE));
    }, [INI_FILE,INI_DEFAULTS]);


    const disallowed_fields = ["RESTAPIEnabled","RESTAPIPort","RCONEnabled","RCONPort","PublicPort"]
    const sorted_options = Object.keys(settings).sort().filter(option =>{
        return !disallowed_fields.includes(option);
    });


    const onSaveINI = useCallback(async() => {
        console.log('saving ini:..')
        const fetch_result = await fetcher('/api/ini', {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pwd: PALHUB_ADMIN_PASS,
                ini: settings
            }),
            method: 'POST',
        });
        handleCancel();
    }, [settings])

    // return the actual envmodal
    return (
        <Modal
            show={show}
            size="xl"
            fullscreen={fullscreen}
            onHide={handleCancel}
            backdrop='static'
            keyboard={false}
            centered>
            <Modal.Header className='p-4 theme-border '>
                <Modal.Title className='col'>
                    <strong>Edit INI Configuration</strong>
                </Modal.Title>
                <Button
                    variant='none'
                    className='p-0 hover-danger no-shadow'
                    onClick={handleCancel}>
                    <IconX className='modalicon' fill='currentColor' />
                </Button>
            </Modal.Header>
            <Modal.Body className='overflow-y-auto' style={fullscreen?{}:{height:"calc(100vh / 3 * 2)"}}>
                <div className="row">
                    {sorted_options.map((name) => {
                        const value=settings[name],defaults=INI_DEFAULTS;
                        return <div className="col-12 col-md-6 col-xl-4">
                            <ENVEntry {...{name, value, updateSetting, defaults}} />
                        </div>
                    })}
                </div>
            </Modal.Body>
            <Modal.Footer className='d-flex justify-content-center'>
                <Button
                    // size='sm'
                    variant='success'
                    className='col p-2'
                    disabled={false}
                    onClick={onSaveINI}>
                    <strong>Save Changes to INI</strong><br />
                    <small>Requires system restart!</small>
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

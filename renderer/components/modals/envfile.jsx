/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import IconX from '@svgs/fa5/regular/window-close.svg';

import Carousel from 'react-bootstrap/Carousel';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
// import Col from 'react-bootstrap/Col';
// import Row from 'react-bootstrap/Row';

import DekSwitch from '@components/core/dek-switch'
// import DekSelect from '@components/core/dek-select';
import DekChoice from "@components/core/dek-choice";
import { fetcher } from '@hooks/useSwrJSON';
// import wait from "@utils/wait";

// import { motion } from 'framer-motion';
import Collapse from 'react-bootstrap/Collapse';
import Card from 'react-bootstrap/Card';
// import useMediaQuery from '@hooks/useMediaQuery';
import useScreenSize from '@hooks/useScreenSize';

// import fs from 'node:fs';
import dotenv from 'dotenv';


import { ENVEntry, ensureEntryValueType } from "./common";

// function updateENV(prop_name='', new_value='', env_path='') {
//     const env_content = fs.readFileSync(env_path, 'utf8');
//     const prop_regexp = new RegExp(`^(${prop_name}\\s*=\\s*).*?$`, 'm');
//     const updated_env = env_content.replace(prop_regexp, `$1${new_value}`);
//     fs.writeFileSync(env_path, updated_env);
// }

// function readENV(env_path) {
//     const env_content = fs.readFileSync(env_path, 'utf8');
//     const env_configs = dotenv.parse(env_content);
//     return env_configs;
// }





function doInitialConversion(ENV_FILE) {
    const converted = {};
    const parsed_env = dotenv.parse(ENV_FILE);
    Object.entries(parsed_env).map(([name, value]) => {
        converted[name] = ensureEntryValueType(value, 'int');
    })

    // console.log({converted, parsed_env})
    return converted;
}

function prepareCategories(ENV_FILE) {
    // const regex = /###\s([^\n:]+):([^\n]+)\n([\s\S]*?)(?=(###|$))/g;
    const regex = /###\s([^:\n]+):([^\n]+)\n([\s\S]*?)(?=(###|$))/g;
    // const regex = /###\s*(\w+:\w+)\s*\n# ([^\n]+)\n([\s\S]*?)(?=\n\n|\Z)/g;

    const env_vars = {}; let match;
    while ((match = regex.exec(ENV_FILE)) !== null) {
        const [_, key, cat, val] = match;
        // const key = match[1].trim();
        // const cat = match[2].trim();
        // const val = match[3].trim();
        env_vars[key] = {cat, val};
    }
    // for (let [index, split] of splits.entries()) {
    //     console.log({index, split})
    // }
    return env_vars;
}


export default function ENVModal({show,setShow,ENV_FILE,ENV_DEFAULTS,PALHUB_ADMIN_PASS}) {
    const handleCancel = () => setShow(false);
    const {isDesktop} = useScreenSize();
    const fullscreen = !isDesktop;

    // main settings object, formed from .env file variables
    const [settings, setSettings] = useState({});
    const [defaults, setDefaults] = useState({});
    const [envdatas, setENVDatas] = useState({});
    const [categories, setCategories] = useState({});


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
        console.log('envdatas:', envdatas);

    };
    // initially setup 'settings'
    useEffect(() => {
        setENVDatas(prepareCategories(ENV_FILE));
        setSettings(doInitialConversion(ENV_FILE));
        setDefaults(doInitialConversion(ENV_DEFAULTS));

        const new_categories = {};
        const cats = prepareCategories(ENV_FILE);
        {Object.entries(cats).map(([name, value]) => {
            new_categories[value.cat] = new_categories[value.cat] || [];
            new_categories[value.cat].push({name, desc: value.val});
        })}
        setCategories(new_categories);

    }, [ENV_FILE,ENV_DEFAULTS]);

    const catlen = Object.keys(categories).length;


    const onSaveENV = useCallback(async() => {
        console.log('saving env:..')
        const fetch_result = await fetcher('/api/env', {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pwd: PALHUB_ADMIN_PASS,
                env: settings
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
                    <strong>Edit ENV Variables</strong>
                </Modal.Title>
                <Button
                    variant='none'
                    className='p-0 hover-danger no-shadow'
                    onClick={handleCancel}>
                    <IconX className='modalicon' fill='currentColor' />
                </Button>
            </Modal.Header>
            <Modal.Body className='overflow-y-auto' style={fullscreen?{}:{height:"calc(100vh / 3 * 2)"}}>
                {Object.entries(categories).map(([catname, catdata], index) => {
                    const add_hr = (index < catlen-1);

                    console.log({catname, catdata})
                    const columns = catdata?.map(({name, desc}) => {
                        const value = settings[name]
                        return <div className="col-12 col-md-6 col-xl-4">
                            <ENVEntry {...{name, value, updateSetting, defaults, envdatas}} />
                        </div>
                    })

                    return <div className="row">
                        <div className="col-12 px-3 text-start text-secondary">{catname}</div>
                        {columns}{add_hr ? <hr className="border-secondary"/> : null}
                    </div>
                })}
            </Modal.Body>
            <Modal.Footer className='d-flex justify-content-center'>
                <Button
                    // size='sm'
                    variant='success'
                    className='col p-2'
                    disabled={false}
                    onClick={onSaveENV}>
                    <strong>Save Changes to ENV</strong><br />
                    <small>Requires system restart!</small>
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

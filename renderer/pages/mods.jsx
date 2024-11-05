/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import Link from 'next/link';
// import Image from 'next/image'


import ModCardComponent from '../components/mod-card';

import { ENVEntry, ENVEntryLabel } from '@components/modals/common';
// import DekSelect from '@components/core/dek-select';
import DekChoice from "@components/core/dek-choice";
// import DekCheckbox from '@components/core/dek-checkbox';

import CheckModsModal from '@components/modals/mod-check';
import ModDetailsModal from '@components/modals/mod-details';
// import ModListModal from '@components/modals/mod-list';
import Image from 'react-bootstrap/Image';
import Carousel from 'react-bootstrap/Carousel';
import BBCodeRenderer from "@components/core/bbcode";
import { useRouter } from 'next/router';

import * as CommonIcons from '@config/common-icons';
import useLocalization from '@hooks/useLocalization';
import useSelectedGame from '@hooks/useSelectedGame';
import useCommonChecks from '@hooks/useCommonChecks';


/**
{
    "name": "Quivern Rainbowdragon",
    "summary": "New look with colorful feathers for the Quivern :D",
    "description": "[center][size=4]This mod is a commission together with the Chillet, and its goal was to redesign the Quivern based on an existing character. The mod adds ears, colorful feathers, horns, and paws[/size]\n<br />\n<br />[size=5]Installation[/size]\n<br />\n<br />[size=3]Unpack the zip and drop on  \"...Palworld&#92;Content&#92;Pal&#92;Content&#92;Paks\" or \"~Mods\" folder. [/size]\n<br />\n<br />[url=https://www.nexusmods.com/palworld/search/?gsearch=ddarckwolf&amp;gsearchtype=authors&amp;tab=mods]\n<br />\n<br />[size=6][u]My Other Mods :D\n<br />[/u][/size][/url]\n<br />\n<br />[url=https://ko-fi.com/ddarckwolf]\n<br />[img]https://ko-fi.com/img/githubbutton_sm.svg[/img]\n<br />\n<br />\n<br />[/url]\n<br />[url=https://www.buymeacoffee.com/ddarckwolf][img]https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png[/img]\n<br />[/url][/center]",
    "picture_url": "https://staticdelivery.nexusmods.com/mods/6063/images/1678/1678-1720655960-891455967.png",
    "mod_downloads": 0,
    "mod_unique_downloads": 0,
    "uid": 26040386717326,
    "mod_id": 1678,
    "game_id": 6063,
    "allow_rating": true,
    "domain_name": "palworld",
    "category_id": 10,
    "version": "v1.0",
    "endorsement_count": 0,
    "created_timestamp": 1720656865,
    "created_time": "2024-07-11T00:14:25.000+00:00",
    "updated_timestamp": 1720656865,
    "updated_time": "2024-07-11T00:14:25.000+00:00",
    "author": "Ddarckwolf",
    "uploaded_by": "Ddwolf11",
    "uploaded_users_profile_url": "https://www.nexusmods.com/users/72870268",
    "contains_adult_content": false,
    "status": "published",
    "available": true,
    "user": {
        "member_id": 72870268,
        "member_group_id": 27,
        "name": "Ddwolf11"
    },
    "endorsement": null
}
*/

const BANNED_MODS = [];

export default function ModsPage() {
    const router = useRouter();
    const game = useSelectedGame();
    const { t, tA } = useLocalization();
    const { requiredModulesLoaded, commonAppData } = useCommonChecks();
    const cache_dir = commonAppData?.cache;
    const game_path = commonAppData?.selectedGame?.path;
    const game_data = commonAppData?.selectedGame;
    const api_key = commonAppData?.apis?.nexus;
    const slug = game_data?.map_data?.providers?.nexus;


    const [showModDetails, setShowModDetails] = React.useState(false);
    const [showModList, setShowModList] = React.useState(false);
    const [activeMod, setActiveMod] = React.useState(null);
    const [modlistID, setModlistID] = React.useState(0);
    const [mods, setMods] = React.useState([]);
    const [ads, setAds] = React.useState([]);
    const modlistTypes = tA('/mods.tabs', 5) ?? [];
    const modSearchRef = React.useRef(null);
    
    const showSaveModList = modlistID === 0;
    // https://www.nexusmods.com/palworld/mods/1204
    const advertised_mods = [577, 1204, 146, 489];//1650, 487, 577, 489]//, 1204];//, 1314, 1650, 1640];

    // React.useEffect(() => {
    //     if (!requiredModulesLoaded) return;
    //     redirectIfNeedConfigured();
    // }, [requiredModulesLoaded]);

    const getInstalledMods = async (api_key, game_path) => {
        const config = await window.palhub('readJSON', game_path);
        if (!config || !config.mods) return [];
        const mod_ids = Object.keys(config.mods);
        return await Promise.all(mod_ids.map(async mod_id => {
            return await window.nexus(api_key, 'getModInfo', mod_id, slug);
        }));
    }

    const getDownloadedMods = async (api_key, cache_dir) => {
        console.log('cache_dir:', cache_dir);
        const config = await window.palhub('readJSON', cache_dir);
        const mod_ids = Object.keys(config.mods);
        return await Promise.all(mod_ids.map(async mod_id => {
            return await window.nexus(api_key, 'getModInfo', mod_id, slug);
        }));
    }

    // load initial settings from store
    React.useEffect(() => {
        if (!requiredModulesLoaded) return;
        (async () => {
            let new_mods = null;
            // // const api_key = await getApiKey();
            // // const game_path = await getGamePath();
            // // const cache_dir = await getCacheDir();
            // const cache_dir = commonAppData?.cache;
            // const game_path = commonAppData?.selectedGame?.game?.path;
            // const game_data = commonAppData?.selectedGame?.data;
            // const api_key = commonAppData?.apis?.nexus;

            switch (modlistID) { 
                case 0: new_mods = await getInstalledMods(api_key, game_path); break;
                case 1: new_mods = await getDownloadedMods(api_key, cache_dir); break;
                case 2: new_mods = await window.nexus(api_key, 'getLatestAdded', slug); break;
                case 3: new_mods = await window.nexus(api_key, 'getTrending', slug); break;
                case 4: new_mods = await window.nexus(api_key, 'getLatestUpdated', slug); break;
                case 5: new_mods = await window.nexus(api_key, 'getTrackedMods'); break;
            }
            if (new_mods) {

                let new_ads = await Promise.all(advertised_mods.map(async mod_id => {
                    return await window.nexus(api_key, 'getModInfo', mod_id);
                }));

                const validation_filter = (mod) => {
                    if (!mod || !mod.status) return false;
                    return mod.status === 'published' && mod.available;
                }
                
                new_ads = new_ads.filter(validation_filter).map(mod => {
                    mod.ad = true;
                    return mod;
                });

                new_mods = new_mods.filter(validation_filter)

                if (![0, 1].includes(modlistID)) {
                    if (new_mods.length > 8) new_mods = new_mods.slice(0, 8);
                    else if (new_mods.length > 4) new_mods = new_mods.slice(0, 4);
                }
                setAds(new_ads);
                setMods(new_mods);
            }
        })();
    }, [modlistID]);

    const onClickModCard = (mod) => {
        console.log('clicked mod:', mod);
        setActiveMod(mod);
        setShowModDetails(true);
    }

    const onFindSpecificMod = async () => {
        const value = modSearchRef.current.value;
        let mod_id = null;
        // if value is valid number then it is considered as mod id:
        if (parseInt(value)) mod_id = parseInt(value);
        // if value is https://www.nexusmods.com/palworld/mods/MOD_ID then get the mod_id using regex
        if (value.includes('nexusmods.com')) {
            const match = value.match(/mods\/(\d+)/);
            if (match) mod_id = match[1];
        }
        // console.log('finding specific mod:', mod_id);
        if (!mod_id) return console.error('Invalid mod id or url');
        if (!window.uStore) return console.error('uStore not loaded');
        if (!window.nexus) return console.error('nexus not loaded');
        // const cache_dir = commonAppData?.cache;
        // const game_path = commonAppData?.selectedGame?.game?.path;
        // const game_data = commonAppData?.selectedGame?.data;
        // const api_key = commonAppData?.apis?.nexus;

        // const api_key = await getApiKey();
        const mod = await window.nexus(api_key, 'getModInfo', mod_id);
        onClickModCard(mod);
    }

    console.log({commonAppData})

    
    const gold_mod = false;
    const banner_height = 256;
    const color_a = gold_mod ? 'danger' : 'info';
    const color_b = gold_mod ? 'warning' : 'primary';
    const gradient_a = `bg-gradient-${color_a}-to-${color_b} border-${color_a}`;
    const gradient_b = `bg-${color_b} border-${color_a}`;
    const gradient_c = `bg-gradient-${color_b}-to-${color_a} border-${color_a}`;

    return <React.Fragment>
        <CheckModsModal show={showModList} setShow={setShowModList} />
        {/* <ModListModal show={showModList} setShow={setShowModList} mods={mods} /> */}
        <ModDetailsModal mod={activeMod} show={showModDetails} setShow={setShowModDetails} />
        <div className="container">
            <div className="mx-auto px-3 py-5">
                <div className='position-relative'>
                    {/* main gradient background elements */}
                    <div className='row mb-4'  style={{height: banner_height}}>
                        <div className={`col transition-all border border-4 border-end-0 p-5 radius9 no-radius-end ${gradient_a}`}></div>
                        <div className={`col transition-all border border-4 border-start-0 border-end-0 p-5 ${gradient_b}`}></div>
                        <div className={`col transition-all border border-4 border-start-0 p-5 radius9 no-radius-start ${gradient_c}`}></div>
                    </div>
                    {/* actual content elements */}
                    <div className='position-absolute top-0 w-100 pt-3'>
                        <div className='d-flex text-center'>
                            {/* create carousel with each ad as the items */}
                            <Carousel interval={6900} className='w-100' indicators={true} style={{height: 234}}>
                                {ads && ads.map((mod, i) => {
                                    return <Carousel.Item key={i} className=''>
                                        <div className='container-fluid'>
                                            <div className='row mx-auto bg-dark cursor-pointer radius6' style={{maxWidth: 800}} onClick={()=>onClickModCard(mod)}>
                                                <div className='col-12 col-lg-6 ps-lg-0 text-center'>
                                                    <div className='position-relative'>
                                                        <Image src={mod.picture_url} alt={mod.name} className='bg-transparent my-2' fluid style={{maxHeight: banner_height-56}}/>
                                                        {/* <div className='d-lg-none py-3 text-center w-100 position-absolute top-0'>
                                                            <h2 className='text-white bg-dark'>{mod.name}</h2>
                                                        </div> */}
                                                    </div>
                                                </div>
                                                <div className='d-none d-lg-block col-12 col-lg-6 ps-lg-0 h-100 py-3 text-start'>
                                                    <h3 className='text-white mb-0'><strong>{mod.name}</strong></h3>
                                                    <small className='text-white'><strong>by {mod.author}</strong></small>
                                                    <hr className='my-3'/>
                                                    <BBCodeRenderer bbcodeText={mod.summary} />
                                                </div>
                                            </div>
                                        </div>
                                    </Carousel.Item>
                                })}
                            </Carousel>
                        </div>
                        <div className='row'>
                            <div className='col text-end d-flex flex-column p-3'>
                                <small>
                                    {t('/mods.powered')} <Link href="https://nexusmods.com" target='_blank' className='hover-dark text-warning'>{t('common.nexus')}</Link>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='row pt-2'>
                    {showSaveModList && <div className='col-4'>
                        <button 
                            className='btn btn-primary w-100'
                            onClick={() => setShowModList(true)}>
                            {t('/mods.save-list')}
                        </button>
                    </div>}

                    <div className='col'>
                        {/* <ENVEntryLabel name="View mod by id or url" tooltip="Enter a nexus mods url or nexus mod id to view a specific mod." /> */}
                        <div className="input-group">
                            <input 
                                type='text'
                                placeholder={t('/mods.search-placeholder')}
                                className='form-control form-primary no-radius-end' 
                                autoComplete="off"
                                ref={modSearchRef}
                            />
                            <div className="input-group-append">
                                <button className="btn btn-primary no-radius-start px-4" type="button" onClick={onFindSpecificMod}>
                                    <strong>{t('/mods.search-button')}</strong>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <DekChoice 
                    className='py-3'
                    // disabled={true}
                    choices={modlistTypes}
                    active={modlistID}
                    onClick={(i,value)=>{
                        console.log(`Setting Page: ${value}`)
                        setModlistID(i);
                    }}
                />                

                <div className="row mt-3">
                    {mods && mods.map((mod, i) => <ModCardComponent key={i} mod={mod} onClick={onClickModCard} />)}
                </div>
            </div>
        </div>
    </React.Fragment>
}

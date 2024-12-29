/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
// import Head from 'next/head'
import Link from 'next/link';
// import Image from 'next/image'

// import Input from '../components/input';
// import Button from '../components/button';
// import Navbar from '../components/navbar';
// import Modal from '../components/modal';

import ModCardComponent from '@components/mod-card';
import ServerCardComponent from '@components/server-card';
// import AppHeadComponent from '../components/app-head';

import { ENVEntry, ENVEntryLabel } from '@components/modals/common';
// import DekSelect from '@components/core/dek-select';
import DekChoice from "@components/core/dek-choice";
// import DekCheckbox from '@components/core/dek-checkbox';

import ServerDetailsModal from '@components/modals/server-details';
import Image from 'react-bootstrap/Image';
import Carousel from 'react-bootstrap/Carousel';
import BBCodeRenderer from "@components/core/bbcode";
import { useRouter } from 'next/router';

import useSwrJSON from '@hooks/useSwrJSON';

import * as CommonIcons from '@config/common-icons';
import useLocalization from '@hooks/useLocalization';
import useCommonChecks from '@hooks/useCommonChecks';

/**
{
    "success": true,
    "servers": [
        {
            "difficulty": "Normal",
            "dayTimeSpeedRate": 1,
            "nightTimeSpeedRate": 1,
            "expRate": 1,
            "palCaptureRate": 1,
            "palSpawnNumRate": 1,
            "palDamageRateAttack": 1,
            "palDamageRateDefense": 1,
            "playerDamageRateAttack": 1,
            "playerDamageRateDefense": 1,
            "playerStomachDecreaceRate": 1,
            "playerStaminaDecreaceRate": 1,
            "playerAutoHPRegeneRate": 1,
            "playerAutoHpRegeneRateInSleep": 1,
            "palStomachDecreaceRate": 1,
            "palStaminaDecreaceRate": 1,
            "palAutoHPRegeneRate": 1,
            "palAutoHpRegeneRateInSleep": 1,
            "buildObjectDamageRate": 1,
            "buildObjectDeteriorationDamageRate": 1,
            "collectionDropRate": 1,
            "collectionObjectHpRate": 1,
            "collectionObjectRespawnSpeedRate": 1,
            "enemyDropItemRate": 1,
            "deathPenalty": "ItemAndEquipment",
            "bEnablePlayerToPlayerDamage": false,
            "bEnableFriendlyFire": false,
            "bEnableInvaderEnemy": true,
            "bActiveUNKO": false,
            "bEnableAimAssistPad": true,
            "bEnableAimAssistKeyboard": false,
            "dropItemMaxNum": 3000,
            "dropItemMaxNum_UNKO": 100,
            "baseCampMaxNum": 128,
            "baseCampWorkerMaxNum": 15,
            "dropItemAliveMaxHours": 1,
            "bAutoResetGuildNoOnlinePlayers": false,
            "autoResetGuildTimeNoOnlinePlayers": 72,
            "guildPlayerMaxNum": 20,
            "baseCampMaxNumInGuild": 4,
            "palEggDefaultHatchingTime": 72,
            "workSpeedRate": 1,
            "autoSaveSpan": 30,
            "bIsMultiplay": false,
            "bIsPvP": false,
            "bCanPickupOtherGuildDeathPenaltyDrop": false,
            "bEnableNonLoginPenalty": true,
            "bEnableFastTravel": true,
            "bIsStartLocationSelectByMap": true,
            "bExistPlayerAfterLogout": false,
            "bEnableDefenseOtherGuildPlayer": false,
            "bInvisibleOtherGuildBaseCampAreaFX": false,
            "coopPlayerMaxNum": 4,
            "serverPlayerMaxNum": 32,
            "serverName": "Default Palworld Server",
            "serverDescription": "",
            "adminPassword": false,
            "serverPassword": false,
            "publicPort": 8211,
            "publicIP": "",
            "rCONEnabled": false,
            "rCONPort": 25575,
            "region": "",
            "bUseAuth": true,
            "banListURL": "https://api.palworldgame.com/api/banlist.txt",
            "rESTAPIEnabled": false,
            "rESTAPIPort": 8212,
            "bShowPlayerList": false,
            "allowConnectPlatform": "Steam",
            "bIsUseBackupSaveData": true,
            "logFormatType": "Text",
            "supplyDropSpan": 180,
            "DekitaWasHere": true,
            "gameVersion": "v0.3.4.56710"
        }
    ]
}
*/

const BANNED_MODS = [];

export default function ServersPage() {
    const router = useRouter();
    const { t, tA } = useLocalization();
    const { requiredModulesLoaded, commonAppData } = useCommonChecks();
    const cache_dir = commonAppData?.cache;
    const game_path = commonAppData?.selectedGame?.path;
    const game_data = commonAppData?.selectedGame;
    const api_key = commonAppData?.apis?.nexus;
    
    const [showServerDetails, setShowServerDetails] = React.useState(false);
    const [activeServer, setActiveServer] = React.useState(null);

    const {data, error, loading, mutate } = useSwrJSON(`https://palhub.dekitarpg.com/api/server-ping`);
    if (loading) return (<h1>Loading...</h1>);
    if (error) return (<h1>{error}</h1>);
    // return (<pre>{data}</pre>);
    console.log({data})
    
    const show_ads = true;//

    const onClickServerCard = (mod) => {
        console.log('clicked server:', mod);
        setActiveServer(mod);
        setShowServerDetails(true);
    }

    const gold_mod = true;
    const banner_height = 256;
    const color_a = gold_mod ? 'danger' : 'info';
    const color_b = gold_mod ? 'warning' : 'primary';
    const gradient_a = `bg-gradient-${color_a}-to-${color_b} border-${color_a}`;
    const gradient_b = `bg-${color_b} border-${color_a}`;
    const gradient_c = `bg-gradient-${color_b}-to-${color_a} border-${color_a}`;

    return <React.Fragment>
        <ServerDetailsModal show={showServerDetails} server={activeServer} setShow={setShowServerDetails} />
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
                                {data?.servers?.map((server, i) => <Carousel.Item key={i} className=''>
                                    <div className='container-fluid'>
                                        <div className='row mx-auto bg-dark cursor-pointer radius6' style={{maxWidth: 800}} onClick={()=>onClickServerCard(server)}>
                                            <div className='col-12 col-lg-6 ps-lg-0 text-center'>
                                                <div className='position-relative'>
                                                    <Image src={server.splashURL} alt={server.serverName} className='bg-transparent my-2' fluid style={{maxHeight: banner_height-56}}/>
                                                    {/* <div className='d-lg-none py-3 text-center w-100 position-absolute top-0'>
                                                        <h2 className='text-white bg-dark'>{mod.name}</h2>
                                                    </div> */}
                                                </div>
                                            </div>
                                            <div className='d-none d-lg-block col-12 col-lg-6 ps-lg-0 h-100 py-3 text-start'>
                                                <h3 className='text-white mb-0'><strong>{server.serverName}</strong></h3>
                                                <small className='text-dark'><small>
                                                    <div className='d-flex'>
                                                        <div className='col-6'>
                                                            {server.gameVersion}
                                                        </div>
                                                        <div className='col-6 text-end'>
                                                            {/* <CommonIcons.account fill='currentColor' height="0.9rem" /> */}
                                                            <span className='ps-1'>{t('/servers.players', {server})}</span>
                                                        </div>
                                                    </div>
                                                </small></small>
                                                <hr className='my-3'/>
                                                <BBCodeRenderer bbcodeText={server.serverDescription || t('common.no-info')} />
                                            </div>
                                        </div>
                                    </div>
                                </Carousel.Item>)}
                            </Carousel>
                        </div>
                        <div className='row'>
                            <div className='col text-end d-flex flex-column p-3'>
                                <small className=''>
                                    {t('/servers.powered')} <Link href="https://dekitarpg.com" target='_blank' className='hover-dark text-warning'>{t('app.devname')}</Link>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row pt-2'>
                    <div className='col card bg-danger text-center p-3 border border-2 border-warning'>
                        <strong>{t('/servers.betawarn')}</strong>
                    </div>
                </div>
                <div className="row mt-3">
                    {data?.servers?.map((server, i) => 
                        <ServerCardComponent key={i} server={server} onClick={onClickServerCard} ad={show_ads && i < 2} />
                    )}
                    <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-2">
                        <div className='card theme-border chartcard cursor-pointer' onClick={()=>router.push('/faq')}>
                            <div className='card-body text-start p-0'>
                                <div className='card-title p-1 mb-0 bg-warning'>
                                    <div className="ratio ratio-16x9 theme-bg rounded">
                                        <CommonIcons.plus fill='currentColor' className="bg-dark p-3" />
                                    </div>
                                </div>
                                <div className='anal-cavity px-2 mb-2 pt-2'>
                                    <strong className='text-warning'>{t('/servers.list-button.head')}</strong>
                                    <small className='text-dark'>{t('/servers.list-button.info')}</small>
                                    <span>{t('/servers.list-button.span')}</span>
                                </div>
                            </div>
                        </div>
                    </div>  
                </div>
            </div>
        </div>
    </React.Fragment>
}

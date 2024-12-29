/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

const DEFAULT_EXAMPLE_SERVER_LISTING = {
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
    "gameVersion": "v0.3.4.56710",
    "discordServerID": "https://discord.gg/8Z8ZzZ8Z8Z",
    "splashURL": "https://staticdelivery.nexusmods.com/mods/6063/images/1313/1313-1712987634-744711640.png",
    "playerCount": 0,
    "fps": 60,
}

// InputComponent.js
import React from 'react';
import Col from 'react-bootstrap/Col';
// import Image from 'next/image';
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
// import { SphereSpinner } from 'react-spinners-kit';
import DOMPurify from 'dompurify';
// import Link from 'next/link';

import * as CommonIcons from '@config/common-icons';
import useLocalization from '@hooks/useLocalization';

export default function ServerCardComponent({ server, onClick=()=>{}, ad=false }) {
    if (!server) server = DEFAULT_EXAMPLE_SERVER_LISTING;
    
    const { t, tA } = useLocalization();    
    const IconComponent = CommonIcons.star;
    const realOnClick = () => onClick(server);

    return <Col xs={12} md={6} lg={4} xl={3} className='mb-2' onClick={realOnClick}>
        <Card className='theme-border chartcard cursor-pointer'>
            <Card.Body className='text-start p-0'>
                <Card.Title className='p-1'>
                    <div className="ratio ratio-16x9">
                        <Image src={server.splashURL} alt={server.name} fluid thumbnail />
                    </div>
                    {false && <div className='modcard'>
                        <div className='p-0'>
                            <span className='alert bg-info px-1 py-0'>{server.allowConnectPlatform}</span>
                        </div>
                    </div>}
                    {ad && <div className='modcard'>
                        <IconComponent fill='currentColor' className='modicon'/>
                    </div>}
                </Card.Title>


                <div className='anal-cavity px-2'>
                    <p className='text-secondary mb-0 font-bold truncate'>{server.serverName ?? 'n/a'}</p>
                    <small className='text-dark'><small>
                        <div className='d-flex'>
                            <div className='col'>
                                {server.gameVersion}
                            </div>
                            <div className='col text-center'>
                                {server.allowConnectPlatform.toUpperCase()}
                            </div>
                            <div className='col text-end'>
                                {/* <CommonIcons.account fill='currentColor' height="0.9rem" /> */}
                                <span className='ps-1'>{t('/servers.players', {server})}</span>
                            </div>
                        </div>
                    </small></small>
    
                    {/* <Link href={server.uploaded_users_profile_url} target='_blank' className='hover-dark'>{server.uploaded_by}</Link> */}
                    <div className='text-white' dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(server.serverDescription)}}></div>
                    {/* <div className='badge bg-info m-1'>{server.allowConnectPlatform}</div> */}
                </div>
            </Card.Body>
        </Card>
    </Col>    

    return (
        <div className="col-3">
            <div className="flex items-center">
                <Image src={mod.picture} alt={mod.name} fluid />
            </div>
            <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-800">{mod.name}</h2>
                <p className="text-gray-500">{mod.author}</p>
            </div>
            <p className="text-gray-600 mt-2">{mod.summary}</p>
            <div className="mt-4">
                <a href="#" className="text-blue-600 hover:underline">Read More</a>
            </div>
        </div>
    );
}
    
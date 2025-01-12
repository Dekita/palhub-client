/*
* ########################################
* # PalHUB::Client by dekitarpg@gmail.com
* ########################################
list of unreal engine games, their steam game/server app id
(if they have one), and nexus mod id (if they have one)
*/

const KNOWN_PATCHES = {
    palworld_server: {
        "Pal/Binaries/Win64/Mods/BPModLoaderMod/Scripts/main.lua": "https://raw.githubusercontent.com/Okaetsu/RE-UE4SS/refs/heads/logicmod-temp-fix/assets/Mods/BPModLoaderMod/Scripts/main.lua"
    }
}

const UE4SS_SETTINGS_PRESETS = {
    palworld: {
        "General.bUseUObjectArrayCache": false,
    }
}

const KNOWN_MODLOADERS = {
    required_ue4ss: {version: "3.0.1", required: true, patches: [], settings: {}},
    optional_ue4ss: {version: "3.0.1", required: false,patches: [], settings: {}},
}

// FORMAT: 
// "generic": {
//     is_hidden: true, // only shown in dev mode
//     providers: { // list of mod store providers
//         nexus: "providerslug", 
//         other: "otherslug" 
//     },
//     platforms: { // list of game store platforms 
//         game: {  // game store ids for each platform the main game is available on
//             steam: {id: "1234567", root: "UEProjectRoot", app: "AppExeName"}, 
//             epic: null, 
//             xbox: null,
//             modloader: { // list of compatible modlaoders to use with the game
//                 ue4ss: {version: "3.0.1", patches: []}, // use UE4SS mod loader
//                 other: {provider: "other", id: "1234567"} // use other mod loader from provider
//             }                
//         },
//         server: { // dedicated server store ids for each platform the server is available on
//             steam: {id: "7654321", root: "UEProjectRoot", app: "ServerExeName"}, 
//             epic: null, 
//             xbox: null, 
//             mod: { // community mod to create/host dedicated servers
//                 provider: null, 
//                 id: null
//             },
//             modloader: { // list of compatible modlaoders to use with the game SERVER
//                 ue4ss: {version: "3.0.1", patches: []}, // use UE4SS mod loader
//                 other: {provider: "other", id: "1234567"} // use other mod loader from provider
//             }                
//         },
//     },
// },

export default {
    "palworld": {
        providers: {
            nexus: "palworld"
        },
        platforms: {
            game: {
                steam: {id: "1623730", root: "Pal", app: "Palworld"},
                xbox: {id: null, root: "Pal", app: "gamelaunchhelper"},
                modloader: {ue4ss: {
                    ...KNOWN_MODLOADERS.required_ue4ss, 
                    settings: UE4SS_SETTINGS_PRESETS.palworld
                }}
            },
            server: {
                steam: {id: "2394010", root: "Pal", app: "PalServer"},
                modloader: {ue4ss: {
                    ...KNOWN_MODLOADERS.required_ue4ss, 
                    patches: [KNOWN_PATCHES.palworld_server], 
                    settings: UE4SS_SETTINGS_PRESETS.palworld
                }}
            },
        },
    },
    "ff7remake": {
        providers: {
            nexus: "finalfantasy7remake"
        },
        platforms: {
            game: {
                steam: {id: "1167190", root: "End", app: "ff7remake"},
                modloader: {ue4ss: KNOWN_MODLOADERS.optional_ue4ss}
            }
        },
    },
    "hogwarts-legacy": {
        providers: {
            nexus: "hogwartslegacy"
        },
        platforms: {
            game: {
                steam: {id: "1554650", root: "Phoenix", app: "HogwartsLegacy"},
                modloader: {ue4ss: KNOWN_MODLOADERS.optional_ue4ss}
            }
        },
    },
    "black-myth-wukong": {
        providers: {
            nexus: "blackmythwukong"
        },
        platforms: {
            game: {
                steam: {id: "2358720", root: "b1", app: "b1"},
                modloader: {ue4ss: KNOWN_MODLOADERS.optional_ue4ss}
            }
        },
    },
    "lockdown-protocol": {
        providers: {
            nexus: "lockdownprotocol"
        },
        platforms: {
            game: {
                steam: {id: "1683320", root: "LockdownProtocol", app: "LockdownProtocol"},
                modloader: {ue4ss: KNOWN_MODLOADERS.optional_ue4ss}
            }
        },
    },
    "tekken8": {
        providers: {
            nexus: "tekken8"
        },
        platforms: {
            game: {
                steam: {id: "2385860", root: "Polaris", app: "Polaris-Win64-Shipping"},
                modloader: {ue4ss: KNOWN_MODLOADERS.optional_ue4ss}
            }
        },
    },
    // "orcs-must-die-deathtrap": {
    //     is_hidden: true, 
    //     providers: {
    //         nexus: "orcsmustdiedeathtrap"
    //     },
    //     platforms: {
    //         game: {
    //             steam: {id: "2273980", root: "OMD", app: "OMD-Win64-Shipping"},
    //             modloader: {ue4ss: KNOWN_MODLOADERS.optional_ue4ss}
    //         }
    //     },
    // },
}

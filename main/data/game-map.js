/*
* ########################################
* # PalHUB::Client by dekitarpg@gmail.com
* ########################################
list of unreal engine games, their steam game/server app id
(if they have one), and nexus mod id (if they have one)
*/

const KNOWN_MODLOADERS = {
    "ue4ss": {version: "3.0.1", patches: []},
}

export default {
    "generic": {
        is_hidden: true, // only shown in dev mode
        providers: { // list of mod store providers
            nexus: "test", 
            other: "test" 
        },
        platforms: { // list of game store platforms 
            game: {  // game store ids for each platform the main game is available on
                steam: "1234567", 
                epic: null, 
                xbox: null,
                modloader: { // list of compatible modlaoders to use with the game
                    ue4ss: {version: "3.0.1", patches: []}, // use UE4SS mod loader
                    other: {provider: "other", id: "1234567"} // use other mod loader from provider
                }                
            },
            server: { // dedicated server store ids for each platform the server is available on
                steam: "7654321", 
                epic: null, 
                xbox: null, 
                mod: { // community mod to create/host dedicated servers
                    provider: null, 
                    id: null
                },
                modloader: { // list of compatible modlaoders to use with the game SERVER
                    ue4ss: {version: "3.0.1", patches: []}, // use UE4SS mod loader
                    other: {provider: "other", id: "1234567"} // use other mod loader from provider
                }                
            },
        },
    },
    "palworld": {
        providers: {
            nexus: "palworld"
        },
        platforms: {
            game: {
                steam: "1623730",
                epic: null,
                xbox: null
            },
            server: {
                steam: "2394010",
                epic: null,
                xbox: null,
            },
        },
    },
    "ff7r": {
        is_hidden: true, 
        providers: {
            nexus: "finalfantasy7remake"
        },
        platforms: {
            game: {
                steam: "1167190",
                epic: null,
                xbox: null
            }
        },
    },
    "hogwarts-legacy": {
        is_hidden: true, 
        providers: {
            nexus: "hogwartslegacy"
        },
        platforms: {
            game: {
                steam: "1554650",
                epic: null,
                xbox: null
            }
        },
    },
    "black-myth-wukong": {
        is_hidden: true, 
        providers: {
            nexus: "blackmythwukong"
        },
        platforms: {
            game: {
                steam: "2358720",
                epic: null,
                xbox: null
            }
        },
    },
    "lockdown-protocol": {
        is_hidden: true, 
        providers: {
            nexus: "lockdownprotocol"
        },
        platforms: {
            game: {
                steam: "1683320",
                epic: null,
                xbox: null
            }
        },
    },
    // custom games not pre-defined
    "custom": {}, 
}

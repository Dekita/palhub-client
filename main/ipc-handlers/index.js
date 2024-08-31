/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import nexus from './nexus';
import palhub from './palhub';
import ustore from './ustore';
import logger from './logger';
import serverCache from './server-cache';
import getUserCount from './get-user-count';
import detectGameInstallation from './detect-game-installation';

export default {
    "nexus": nexus,
    "palhub": palhub,
    "uStore": ustore,
    "logger": logger,
    "serverCache": serverCache,
    "get-user-count": getUserCount,
    "detect-game-installation": detectGameInstallation,
}
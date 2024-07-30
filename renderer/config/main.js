/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/

/**
 * ■ config.js
 * author: dekitarpg@gmail.com
 *
 * The CONFIG object holds all of the configurable options that
 * the bot/app requires to run. Some properties are loaded
 * from the project .env files, others can be customized here.
 */

require('dotenv').config();

//
// ALL CONFIG OPTIONS BELOW ARE READ DIRECTLY FROM .env FILES
//
module.exports = {
    dev_mode: process.env.NODE_ENV === 'development',

    /**
     * ■ internal_port:
     * The port used by the express api server (if there is one)
     */
    internal_port: process.env.PALHUB_INTERNAL_WEBSITE_PORT,

    /**
     * ■ netdata_host:
     * Used to determine the netdata server to communicate with
     * on the internal docker network. This allows us to poll
     * it for all various metrics the netdata server has..
     * ..which is a lot.
     */
    netdata_host: {
        name: process.env.PALHUB_INTERNAL_NETDATA_HOST,
        port: process.env.PALHUB_INTERNAL_NETDATA_PORT,
    },

    /**
     * ■ netdata_api_url()
     * @returns an http:// string for the netdata host api url.
     */
    netdata_api_url: function () {
        const { name, port } = this.netdata_host;
        return `http://${name}:${port}/api/v1/data?`;
    },

    /**
     * netdata_calls:
     * used from within the ./common/sysinfo.js for determining
     * the extra netdata calls to show within the developer command
     */
    netdata_calls: {
        'some.chart.id': 'Some description for bot command.',
    },

    /**
     * ■ netstat_options:
     * Set the netdata dstats options
     * all options in this object are passed directly to hot-shots/statsd interface
     */
    netstat_options: {
        /**
         * prefix:
         * configure this option to change the prefix sent to
         * the netdata dstat server along with every request.
         * @note all records are prefixed with this.
         */
        prefix: 'dekita.palhub.',
        /**
         * read the host and port from the [MAIN].env file.
         */
        host: process.env.PALHUB_INTERNAL_NETDATA_HOST,
        port: process.env.PALHUB_INTERNAL_NDSTATS_PORT,
    },

};

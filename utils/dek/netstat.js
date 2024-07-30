/**
 * netstat: written by dekitarpg@gmail.com
 */

/**
 * use hot-shots module instead of node-statsd
 * since its clearly far superior.
 */
const StatsD = require('hot-shots');
const LOGGER = require('./logger')(__filename);
const CONFIG = require('../../config/main');

/**
 * Create instance of statsd client.
 */
const StatClient = new StatsD(CONFIG.netstat_options);

/**
 * NetStat is a static class/module that is used to record analytics.
 * It uses the internal netdata server exposed to the system by docker.
 * Netdata has a built in statsd server available on port 8125,
 * so we connect to that and send information there.
 *
 * This information can be viewed in the netdata dashboard directly.
 * see `./sysinfo.js` file for details on how to then fetch and view
 * that information from within the bot client. For documentation
 * on the underlying statsd client
 *
 * Example:
 * ```
 * const NetStat = require('../common/netstat');
 * NetStat.increment('some.key', 1); // etc..
 * ```
 * This will add 1 to dekita.some.key under statsd in netdata.
 */
class NetStat {
    /**
     * Function alias from {hot-shots}.increment
     */
    static increment() {
        StatClient.increment(...arguments);
    }
    /**
     * Function alias from {hot-shots}.decrement
     */
    static decrement() {
        StatClient.decrement(...arguments);
    }
    /**
     * Function alias from {hot-shots}.histogram
     */
    static histogram() {
        StatClient.histogram(...arguments);
    }
    /**
     * Function alias from {hot-shots}.gauge
     */
    static gauge() {
        StatClient.gauge(...arguments);
    }
    /**
     * Function alias from {hot-shots}.set
     */
    static set() {
        StatClient.set(...arguments);
    }
    /**
     * Function alias from {hot-shots}.timing
     */
    static timing() {
        StatClient.timing(...arguments);
    }
    /**
     * Function alias from {hot-shots}.timer
     */
    static timer() {
        StatClient.timer(...arguments);
    }
    /**
     * Function alias from {hot-shots}.close
     */
    static close() {
        StatClient.close(...arguments);
    }
    /**
     * Called when the statsd socket connects (tcp only?)
     */
    static async onSocketConnected() {
        LOGGER.log(`connected to ${StatClient.host}:${StatClient.port}`);
    }
    /**
     * Called when the statsd socket begins listening (udp only?)
     */
    static async onSocketListening() {
        LOGGER.log(`listening on ${StatClient.host}:${StatClient.port}`);
    }
    /**
     * Called when the statsd socket receives a message
     */
    static async onSocketMessage(msg, rinfo) {
        LOGGER.log(`message: ${msg} from ${rinfo.address}:${rinfo.port}`);
    }
    /**
     * Called when the statsd socket closes
     */
    static async onSocketClose() {
        LOGGER.log(`listening on ${StatClient.host}:${StatClient.port}`);
    }
    /**
     * Called when the statsd socket hits an error
     */
    static async onSocketError(error) {
        LOGGER.log(`socket error:`, error);
        StatClient.socket.close();
    }
    /**
     * returns the underlying statsd client.
     * @see https://github.com/brightcove/hot-shots
     */
    static get statsd() {
        return StatClient;
    }
}

/**
 * Various event listeners
 */
StatClient.socket.on('connected', NetStat.onSocketConnected);
StatClient.socket.on('listening', NetStat.onSocketListening);
StatClient.socket.on('message', NetStat.onSocketMessage);
StatClient.socket.on('close', NetStat.onSocketClose);
StatClient.socket.on('error', NetStat.onSocketError);

// Export the module <3
module.exports = NetStat;

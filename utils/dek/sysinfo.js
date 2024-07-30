/**
 * sysinfo.js
 * author: dekitarpg@gmail.com
 * module to use an internal docker network to communicate
 * with the netdata container running alongside this container.
 *
 * Using this in conjunction with the ./netstat.js module,
 * we are able to both view any system metrics netdata has to offer,
 * and also create and send custom metrics to netdata, which can
 * later be viewed.
 *
 * The ./hard-grapht.js module is used with this module to graph
 * the fetched netdata information and then convert it to a discord.js
 * file attachment for sending to the connect client via a bot.
 */

/**
 * Various required modules.
 */
const osu = require('node-os-utils');
const config = require('../../config/main');
const UTILS = require('./utils');
const bent = require('bent');
const getJSON = bent('json');
const { URLSearchParams } = require('url');

// TODO: 
// !: use v2 and allow cgroups?? 
// ?: /api/v2/data?charts=cgroup.cpu

/**
 * The LOCAL url for the netdata api. This is exposed via a private
 * network within the projects main docker-compose file.
 * ie: netdata:19999 is defined in the docker-compose file.
 */
const NETDATA_API_URL = config.netdata_api_url();
// console.info({NETDATA_API_URL})

/**
 * Module to get dockerized node containers actual system info
 * uses node-os-utils and requires an additional netdata container
 * within the core project's docker-compose file.
 */
class SysInfo {
    /**
     * @type {String}
     * @desc internal docker container ip address
     */
    static get ip() {
        return this._ip;
    }

    /**
     * @type {String}
     * @desc the operating system the container is using
     */
    static get os() {
        return this._os;
    }

    /**
     * @type {String}
     * @desc the platform type the docker container is using
     */
    static get type() {
        return this._type;
    }

    /**
     * @type {String}
     * @desc the platform architecture the docker container is using
     */
    static get arch() {
        return this._arch;
    }

    /**
     * @type {String}
     * @desc the platform the docker container is using
     */
    static get platform() {
        return this._platform;
    }

    /**
     * @type {String}
     * @desc the cpu model string
     */
    static get cpu_model() {
        return this._cpu_model;
    }

    /**
     * @type {String}
     * @desc stores the docker container name! <3
     * thanks to this, we can do some fun stuff!!
     */
    static get hostname() {
        return this._hostname;
    }

    /**
     * @type {String}
     * @desc store the cgroup id string for use in api calls
     */
    static get cgroup() {
        return this._cgroup;
    }

    /**
     * @private
     * @desc Performs the initial setup of the module. called internally.
     */
    static async _setup() {
        // return if already defined
        if (this._ip) return;
        this._ip = osu.os.ip();
        this._os = await osu.os.oos();
        this._type = osu.os.type();
        this._arch = osu.os.arch();
        this._platform = osu.os.platform();
        this._cpu_model = osu.cpu.model();
        this._hostname = osu.os.hostname();
        this._cgroup = `cgroup_${this._hostname}`;
    }
    /**
     * @param {string} chart_type_str the NETDATA_CALLS chart key string
     * @param {string} duration_str the READABLE_DURATIONS key string
     * @param {object} [extra_options={}] extra query options for netdata
     * @returns {JSON} the raw fetched json from netdata
     */
    static async fetch(chart_type_str, duration_str, extra_options = {}) {
        const [api_type, resource] = chart_type_str.split('.');
        const duration = SysInfo.READABLE_DURATIONS[duration_str];
        let chart_type = `${api_type}.${resource}`;
        if (api_type === 'docker') {
            chart_type = `${this._cgroup}.${resource}`;
        }
        const query_options = {
            points: 100,
            before: 0, //0=now
            after: duration ? duration : -900, // -900 seconds from 0=now
            context: chart_type,
            ...extra_options,
        };
        if (['available', 'idlejitter'].includes(resource)) {
            query_options.options = 'percentage';
            // query_options.gtime = 86400;
        }
        const query = new URLSearchParams(query_options);
        return await getJSON(`${NETDATA_API_URL}${query.toString()}`);
    }
    /**
     * fetches then maps chart data into an easier to manipulate format.
     * @param {string} chart_type_str the NETDATA_CALLS chart key string
     * @returns {object} containing {label: [...datas], ...label: [...datas]};
     */
    static async mappedFetch(chart_type_str) {
        return this.mapFetch(await this.fetch(chart_type_str));
    }
    /**
     * maps fetched labels and data properties to an object of
     * @param {JSON} fetched_data data returned from .fetch call
     * @returns {object} {label: [...datas], ...label: [...datas]};
     */
    static mapFetch(fetched_data) {
        const { labels, data } = fetched_data;
        return labels.reduce((r, label) => {
            const data_index = labels.indexOf(label);
            const reductor = (dr, di) => [...dr, di[data_index]];
            return { ...r, [label]: data.reduce(reductor, []) };
        }, {});
    }

    /**
     *
     * @param {string} chart_type_str the NETDATA_CALLS chart key string
     * @param {string} duration_str the READABLE_DURATIONS key string
     * @param {object} [extra_options={}] extra query options for netdata
     * @param {object} [chart_options={}]extra options for HardGrapht.js
     * @returns {MessageAttachment} containing png of chart.
     */
    // static async fetchNetdataGraph(chart_type_str, duration_str, options, chart_options={}) {
    //     const fetched = await SysInfo.fetch(chart_type_str, duration_str, options);
    //     const metrics = await SysInfo.mapFetch(fetched);
    //     const [waste, ...label_keys] = Object.keys(metrics)
    //     const [times, ...label_vals] = Object.values(metrics);
    //     const axis_labels = times.map(timestamp => {
    //         return UTILS.formatDuration(UTILS.getMSDiff(timestamp)) + ' ago';
    //     });
    //     return await HardGrapht.createAttachment({
    //         label_keys, label_vals, axis_labels
    //     }, {
    //         title: chart_type_str,
    //         display_xaxis: false,
    //         display_yaxis: true,
    //         ...chart_options,
    //     });
    // }
    static async fetchNetdataGraph(
        chart_type_str,
        duration_str = '15 mins',
        options = {}
    ) {
        const fetched = await SysInfo.fetch(
            chart_type_str,
            duration_str,
            options
        );
        const metrics = await SysInfo.mapFetch(fetched);
        const [waste, ...label_keys] = Object.keys(metrics);
        const [times, ...label_vals] = Object.values(metrics);
        const axis_labels = times.map((timestamp) => {
            return UTILS.formatDuration(UTILS.getMSDiff(timestamp)) + ' ago';
        });
        return {
            label_keys: label_keys,
            label_vals: label_vals,
            axis_labels: axis_labels,
            title: chart_type_str,
        };
    }
}
/**
 * Contains useful netdata chart_type_strings
 */
SysInfo.NETDATA_CALLS = {
    ...(config.netdata_calls || {}),
    'docker.cpu_limit': 'Get the bot container specific CPU usage.',
    'docker.cpu_per_core':
        'Total CPU utilization per core within the system-wide CPU resources.',
    'docker.mem_usage':
        'The amount of RAM and swap memory used by the container.',
    'system.idlejitter': 'Idle jitter is calculated by netdata.',
    'system.cpu': 'Total CPU utilization (all cores).',
    'system.load': 'Current system load in 1/5/15min averages.',
    'system.ip': 'Total IP traffic in the system.',
    'system.io': 'Total Disk I/O, for all physical disks.',
    'system.ram': 'System Random Access Memory (i.e. physical memory) usage.',
    'system.swap': 'System swap memory usage.',
    'mem.available': 'Available Memory is estimated by the kernel.',

    'disk_util.sdc': 'disk drive utilization',
    'disk.sdc': 'disk drive reads/writes',
};

const keys = Object.keys(SysInfo.NETDATA_CALLS);
/**
 * Contains map to convert NETDATA_CALLS key into
 * `{label: key, value: key, description};` objects
 * that can be used for selection dropdown menus
 */
SysInfo.NETDATA_CALL_MAP = keys.map((key) => {
    const description = SysInfo.NETDATA_CALLS[key];
    return { label: key, value: key, description };
});

/**
 * An object containing key value pairs where the key is an identifier for the
 * duration, and the value is a number for how many seconds is in that duration.
 * @enum {object}
 */
SysInfo.READABLE_DURATIONS = {
    /** @type {number} */
    '10 secs': -10,

    /** @type {number} */
    '15 mins': -900,
    /** @type {number} */
    '30 mins': -1800,
    /** @type {number} */
    '60 mins': -3600,
    /** @type {number} */
    '1 hour': -3600,
    /** @type {number} */
    '3 hours': -10800,
    /** @type {number} */
    '6 hours': -21600,
    /** @type {number} */
    '12 hours': -43200,
    /** @type {number} */
    '24 hours': -86400,
    /** @type {number} */
    '1 day': -86400,
    /** @type {number} */
    '7 days': -604800,
    /** @type {number} */
    '14 days': -1209600,
    /** @type {number} */
    '28 days': -2419200,
    /** @type {number} */
    '30 days': -2592000,
};

// do what it says on the tin!
SysInfo._setup();

// export all the goods..
module.exports = SysInfo;

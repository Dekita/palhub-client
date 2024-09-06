/**
 * logger.js
 * handles logging with additional functionality.
 * author: dekitarpg@gmail.com
 */

/**
// EXAMPLE USAGE: 
// opts are OPTIONAL!
import createLogger, { LoggyBoi, setGlobalOptions } from './logger.js';

const log = createLogger(__filename, {
    file_options: {
        filename: 'somefile.log',
        options: {flags: 'a', encoding: 'utf8'},
    },
    http_options: {
        port: 1234,  // tcp only
        host: 'localhost', // tcp only
        path: 'someurlpath', // ipc only
    },

    file_record: {
        fatal: true,
        error: true,
        warn: false,
        http: false, 
        info: false, 
    },
    log_colors: {
        fatal: 'red',
        error: 'red',
        warn: 'yellow',
        http: 'green', 
        info: 'cyan', 
    },
});

log.info('my awesome log');
// => 21:22:36 PM [filename] my awesome log

// to extend class functionality: 
class KustoomLoog extends LoggyBoi {}
*/

/*
* File System Flags in Node.js:
* 
* 'r'   - Open file for reading. Throws an error if the file does not exist.
* 'r+'  - Open file for reading and writing. Throws an error if the file does not exist.
* 'rs+' - Open file for reading and writing in synchronous mode. Skips local file system cache.
* 
* 'w'   - Open file for writing. Creates the file if it does not exist, or truncates it if it exists.
* 'wx'  - Like 'w', but fails if the file already exists.
* 'w+'  - Open file for reading and writing. Creates the file if it does not exist, or truncates it if it exists.
* 'wx+' - Like 'w+', but fails if the file already exists.
* 
* 'a'   - Open file for appending. Creates the file if it does not exist.
* 'ax'  - Like 'a', but fails if the file already exists.
* 'a+'  - Open file for reading and appending. Creates the file if it does not exist.
* 'ax+' - Like 'a+', but fails if the file already exists.
*/




import { createWriteStream } from 'fs';
import { DateTime } from 'luxon';
import { Socket } from 'net';

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',

    fg: {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        crimson: '\x1b[38m', // Scarlet
    },
    bg: {
        black: '\x1b[40m',
        red: '\x1b[41m',
        green: '\x1b[42m',
        yellow: '\x1b[43m',
        blue: '\x1b[44m',
        magenta: '\x1b[45m',
        cyan: '\x1b[46m',
        white: '\x1b[47m',
        crimson: '\x1b[48m',
    },
};

// should log type be recorded to error file
const LOG_RECORD = {
    fatal: true,
    error: true,
    warn: true,
    http: true,
    info: true,
};

const LOG_SEND = {
    fatal: false,
    error: false,
    warn: false,
    http: false,
    info: false,
};

const LOG_COLORS = {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    http: 'green',
    info: 'cyan',
};

// transport: 'console', 'file', 'http'
const LOG_FORMATTER = (
    { level, datetime, id, message, metadata, color },
    transport,
    logger
) => {
    switch (transport) {
        // return object for http so it sends log as json <3
        // case 'http': return {level, datetime, id, message, metadata};

        // colorize elements for console logging only
        // (adds extra characters for color codes)
        case 'console':
            level = logger.colorize(color, level.toUpperCase());
            id = logger.colorize(color, id);
            break;
    }
    // return array used for log format..
    return [level, datetime, id, message];
};

// new FileTransport({filename, options});
class FileTransport extends console.Console {
    constructor(file_options) {
        const { filename = '', options = {} } = file_options;
        const log_stream = createWriteStream(filename, options);
        super({ stdout: log_stream, stderr: log_stream });
    }
}

// new HTTPTransport({path}); // ipc
// new HTTPTransport({host, port}); // tcp
class HTTPTransport extends console.Console {
    constructor(http_options) {
        const socket = new Socket();
        const { path, host, port } = http_options;
        if (!!path) socket.connect({ path }); // ipc
        else socket.connect({ port, host }); // tcp
        super({ stdout: socket, stderr: socket });
    }
}

class LoggyBoi {
    /**
     * sets global defaults for all loggers created in future
     * @param {object} [global_options={}]
     * @static
     */
    static setGlobalOptions(global_options = {}) {
        const {
            log_format = null,
            log_colors = {},
            send_record = {},
            file_record = {},
            file_options = {},
            http_options = {},
        } = global_options;

        this._grecord = {
            ...LOG_RECORD,
            ...file_record,
        };
        this._gsend = {
            ...LOG_SEND,
            ...send_record,
        };
        this._gcolors = {
            ...LOG_COLORS,
            ...log_colors,
        };
        this._gformatter = log_format || LOG_FORMATTER;
        console.log('global options set:', file_options);
        if (this.validFileOptions(file_options)) {
            this._gfilestream = new FileTransport(file_options);
        }
        if (this.validHTTPOptions(http_options)) {
            this._ghttpstream = new HTTPTransport(http_options);
        }
    }
    /**
     * @param {object} file_options
     * @returns {boolean} based on if file_options is valid
     */
    static validFileOptions(file_options) {
        return !!file_options.filename;
    }
    /**
     * @param {object} http_options
     * @returns {boolean} based on if http_options is valid
     */
    static validHTTPOptions(http_options) {
        return !!http_options.path || http_options.port;
    }

    constructor() {
        this.initialize(...arguments);
    }
    initialize(id_or_filename, logger_options = {}) {
        const {
            file_record = {},
            send_record = {},
            log_colors = {},
        } = logger_options;
        this.file_record = { ...LoggyBoi._grecord, ...file_record };
        this.http_record = { ...LoggyBoi._gsend, ...send_record };
        this.log_colors = { ...LoggyBoi._gcolors, ...log_colors };
        this.addFileTransport(logger_options.file_options);
        this.addHTTPTransport(logger_options.http_options);
        this.setFormatter(logger_options.log_format);
        this.setID(id_or_filename);
    }

    setFormatter(formatter_function) {
        this._formatter = formatter_function || LoggyBoi._gformatter;
    }

    addFileTransport(file_options = {}) {
        if (LoggyBoi.validFileOptions(file_options)) {
            this._filestream = new FileTransport(file_options);
        } else {
            this._filestream = LoggyBoi._gfilestream;
        }
    }

    addHTTPTransport(http_options = {}) {
        if (LoggyBoi.validHTTPOptions(http_options)) {
            this._httpstream = new HTTPTransport(http_options);
        } else {
            this._httpstream = LoggyBoi._ghttpstream;
        }
    }

    setID(id_or_filename) {
        let idtag = String(id_or_filename);
        if (idtag.startsWith('/')) {
            const replacer = /\/bot-.*\/src\//g;
            idtag = idtag.replace(replacer, '');
        }
        if (idtag.endsWith('.js')) {
            idtag = idtag.replace('.js', '');
            idtag = `[${idtag}]`;
        }
        this.idtag = idtag;
    }

    colorize(color, text) {
        return `${colors.fg[color]}${text}${colors.reset}`;
    }

    /**
     * @public
     */
    get Logger() {
        return LoggyBoi;
    } //for creating children if needed
    async log() {
        await this._log('info', ...arguments);
    } // should use .info instead.
    async info() {
        await this._log('info', ...arguments);
    }
    async http() {
        await this._log('http', ...arguments);
    }
    async warn() {
        await this._log('warn', ...arguments);
    }
    async error() {
        await this._log('error', ...arguments);
    }
    async fatal() {
        await this._log('fatal', ...arguments);
    }

    get timestamp() {
        return DateTime.now().toLocaleString(DateTime.DATETIME_MED);
    }

    async tofile(log_level, ...rest) {
        if (!this._filestream) return;
        await this._filestream[log_level](this.timestamp, this.idtag, ...rest);
    }

    /**
     * @private
     */
    async _log(level) {
        const format_data = this._formatArgz(...arguments);
        await console[level](...this._formatter(format_data, 'console', this)); // regular console log:
        if (this._filestream && this.file_record[level]) {
            // log to file::
            await this._filestream[level](
                ...this._formatter(format_data, 'file', this)
            );
        }
        if (this._httpstream && this.http_record[level]) {
            // log to http::
            await this._httpstream[level](
                ...this._formatter(format_data, 'http', this)
            );
        }
    }
    // converts arguments sent to _log function into an object
    _formatArgz(level, message, metadata = {}) {
        return {
            id: this.idtag,
            datetime: this.timestamp,
            color: this.log_colors[level],
            level,
            message,
            metadata,
        };
    }
}

// initialize default values
// LoggyBoi.setGlobalOptions();

// export as function to quickly create new logger
export default function createLogger(idtag, options) {
    return new LoggyBoi(idtag, options);
}

// export class as import { LoggyBoi } from 'module';
export { LoggyBoi };

// export function for setGlobalOptions
export function setGlobalOptions() {
    LoggyBoi.setGlobalOptions(...arguments);
}

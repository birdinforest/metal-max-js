import { dateTime } from './utility';

// Turn on for debugging
const LOGS_OUTPUT = true;// process.env.LOGS_OUTPUT && process.env.LOGS_OUTPUT === '1';
const LOGS_3D = true;// process.env.LOGS_3D && process.env.LOGS_3D === '1';
const LOGS_ENGINE = true;// process.env.LOGS_3D && process.env.LOGS_ENGINE === '1';

/**
 * Treat exactly like a console.log with the first param being the function on `console`
 * @param consoleFunc - function name to use - belonging to `console` object.
 * @param template - template string eg. can have `%s`, `%c` which is replaced by `format`
 * @param format - format for the `%c` eg `'font-weight: bold;'`
 * @param params - all outputs after the format
 * @example
 * doLog('info', '%c', 'font-weight: bold;', someVar);
 */
const doLog = (consoleFunc: string, template: string, format: string, ...params: any[]) => {
    const keyFunc = consoleFunc as keyof Console;
    if(LOGS_OUTPUT) {
        console[keyFunc](template, format, ...params);
    }
};

/**
 * Returns shared formatting of console.log output with additional custom colour
 * @param {string} hex color in format #ffffff
 */
const consoleCss = (hex: string) => `color:${hex};font-weight:2200;font-size:12px`;

/**
 * LOG container
 */
const log = {
    /**
     * Default Log info with blue icon
     */
    info: (...params: string[]) => {
        doLog('info', '%c🔵 %s', consoleCss('#2B4CEA'), ...params);
    },

    /**
     * Log error
     * @param  {...any} params
     */
    error: (...params: string[]) => {
        doLog('error', '%c⛔ %s', consoleCss('#A42B15'), ...params);
    },

    /**
     * Log warning
     * @param  {...any} params
     */
    warn: (...params: string[]) => {
        doLog('warn', '%c⚠️ %s', consoleCss('#ECB100'), ...params);
    },

    /**
     * Log info with building icon
     * @param  {...any} params
     */
    info3d: (...params: string[]) => {
        if(LOGS_3D) {
            doLog('info', '%c🏣 %s', consoleCss('#ff6f00'), ...params);
        }
    },
    
    infoEngine: (...params: string[]) => {
        if(LOGS_ENGINE) {
            doLog('info', '%c☢️ %s', consoleCss('#e78f0d'), ...params);
        }
    }

};

export default log;

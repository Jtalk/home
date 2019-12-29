import * as TraceKit from "tracekit";
import * as request from "superagent";
import api from "./superagent-api";
import {Map} from "immutable";

let LEVEL_ERROR = "ERROR";
let LEVEL_INFO = "INFO";
let LEVEL_DEBUG = "DEBUG";

let defaultHandler = consoleHandler;

export class Logger {

    constructor(name, handler) {
        this.name = name;
        this.handler = handler;
    }

    static of(name, handler = null) {
        return new Logger(name, handler);
    }

    error(message, e) {
        this._handleMessage(LEVEL_ERROR, message, e);
    }

    info(message, e) {
        this._handleMessage(LEVEL_INFO, message, e);
    }

    log(message, e) {
        this.info(message, e);
    }

    debug(message, e) {
        this._handleMessage(LEVEL_DEBUG, message, e);
    }

    _handleMessage(level, message, ex) {
        let e = this._prepareEvent(level, message, ex);
        this._handleEvent(e);
    }

    _prepareEvent(level, message, ex) {
        let scope = this.name;
        var event = {
            message: message,
            level: level,
            scope: scope,
            timestamp: new Date().getTime()
        };
        if (ex) {
            event.exception = this._exception(ex);
        }
        return event;
    }

    _handleEvent(e) {
        this._getHandler()(e);
    }

    _getHandler() {
        return this.handler || defaultHandler;
    }

    _exception(ex) {
        let tracek = TraceKit.computeStackTrace(ex, 500);
        let rawStack = tracek.stack ? tracek.stack : [];
        let prettyTrace = rawStack.map(l => `at ${l.func}(${l.args.join(", ")}) ${l.url}:${l.line}:${l.column}`)
        return {
            message: tracek.message ? tracek.message : "<empty>",
            name: tracek.name ? tracek.name : "<unknown>",
            stack: prettyTrace,
            url: tracek.url ? tracek.url : "<unknown>",
            useragent: tracek.useragent
        }
    }
}

export function reduxLoggerOpts(logger) {
    return {
        stateTransformer: state => Map(state).toJS(),
        actionTransformer: action => Map(action).toJS(),
    }
}

export function setDefaultHandler(handler) {
    defaultHandler = handler;
}

export function consoleHandler(e) {
    let logger = console.log.bind(console);
    switch (e.level) {
        case LEVEL_ERROR: logger = console.error.bind(console); break;
        case LEVEL_INFO: logger = console.info.bind(console); break;
        case LEVEL_DEBUG: logger = console.debug.bind(console); break;
        default: logger = console.log;
    }
    logger(e.level, e.message, e.exception);
}

export function serverHandler(e) {
    request.post("/logs", {events: [e]})
        .use(api)
        .catch(rej => {
            consoleHandler({
                message: "Cannot access log server: " + rej,
                level: LEVEL_ERROR,
                scope: "SYSTEM",
                timestamp: e.timestamp
            });
        });
    consoleHandler(e);
}
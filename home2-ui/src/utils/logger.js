import * as TraceKit from "tracekit";
import * as request from "superagent";
import api from "./superagent-api";

let LEVEL_ERROR = "ERROR";
let LEVEL_INFO = "INFO";
let LEVEL_DEBUG = "DEBUG";

export class Logger {

    constructor(name) {
        this.name = name;
        this.handler = serverHandler;
    }

    static of(name) {
        return new Logger(name);
    }

    error(message, e) {
        this._handleMessage(LEVEL_ERROR, message, e);
    }

    info(message, e) {
        this._handleMessage(LEVEL_INFO, message, e);
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
        this.handler(e);
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

export function consoleHandler(e) {
    let toString = (msg, stacktrace) => {
        if (stacktrace) {
            msg = msg + "\n" + JSON.stringify(stacktrace);
        }
        return msg;
    };
    var logger = console.log;
    switch (e.level) {
        case LEVEL_ERROR: logger = console.error; break;
        case LEVEL_INFO: logger = console.info; break;
        case LEVEL_DEBUG: logger = console.debug; break;
        default: logger = console.log;
    }
    let date = new Date(e.timestamp).toLocaleString();
    logger(toString(`${date} [${e.level}] ${e.scope} - ${e.message}`, e.stacktrace));
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
import what from "what.js"
import {Logger} from "./logger";

const log = Logger.of("date-time");

export function formatDateTime(date) {
    switch (what(date)) {
        case "date":
            return date.toLocaleString();
        case "number":
        case "string":
            return formatDateTime(new Date(date));
        case "undefined":
        case "null":
            return date;
        default:
            log.error(`Unknown date: ${date}`, new Error());
            return undefined;
    }
}

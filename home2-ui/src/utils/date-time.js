import what from "what.js"
import moment from "moment";

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
            throw Error(`Unknown date: ${date}`);
    }
}

export function normaliseFormat(date) {
    console.log("Date is", date);
    return date;
}
import * as what from "what.js"

export function formatDateTime(date) {
    if (date instanceof Date) {
        return date.toLocaleString();
    } else {
        throw Error("Unsupported date-time type: " + what(date));
    }
}

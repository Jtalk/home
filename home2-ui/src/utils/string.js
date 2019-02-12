import * as replaceString from "replace-string";
import * as what from "what.js";

export function format(template, ...args) {
    var i = 0;
    return replaceString(template, "{}", () => args[i++]);
}

export function toString(v) {
    if (what(v) === "object" || what(v) === "array") {
        return JSON.stringify(v);
    } else {
        return "" + v;
    }
}
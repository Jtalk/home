import * as replaceString from "replace-string";

export function format(template, ...args) {
    var i = 0;
    return replaceString(template, "{}", () => args[i++]);
}
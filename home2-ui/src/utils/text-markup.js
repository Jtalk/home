import parser from "bbcode-to-react";
import "../bbcode/tags";

export function formatMarkup(text) {
    return parser.toReact(text);
}
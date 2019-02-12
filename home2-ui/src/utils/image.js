import * as config from "react-global-configuration";
import {format} from "./string";

export function imageUrl(id) {
    let template = config.get("image.url.template");
    return format(template, id);
}
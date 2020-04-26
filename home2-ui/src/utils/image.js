import config from "react-global-configuration";
import {format} from "./string";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function imageUrl(url) {
    if (!url) {
        return url;
    }
    url = url.trim();
    if (url.startsWith("/")) {
        // Relative path, append API endpoint prefix
        let api = config.get("api.prefix");
        return `${api}${url}`;
    } else if (UUID_REGEX.test(url)) {
        // Image ID
        let template = config.get("image.url.template");
        return format(template, url);
    } else {
        return url;
    }
}
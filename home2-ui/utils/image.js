import {format} from "./string";
import getConfig from "next/config";

const {publicRuntimeConfig: config} = getConfig();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function imageUrl(url) {
    if (!url) {
        return url;
    }
    url = url.trim();
    if (url.startsWith("/")) {
        // Relative path, append API endpoint prefix
        let api = config.api.prefix;
        let result = `${api}${url}`;
        console.debug(`Converting relative image URL '${url}' into a full one`, result);
        return result;
    } else if (UUID_REGEX.test(url)) {
        // Image ID
        let template = config.image.url.template;
        let result = format(template, url);
        console.debug(`Converting image UUID ${url} int a full URL`, result);
        return result;
    } else {
        console.debug("Skipping converting absolute image URL", url);
        return url;
    }
}

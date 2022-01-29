import { format } from "./string";
import getConfig from "next/config";

const { publicRuntimeConfig: config } = getConfig();

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
  } else if (!url.startsWith("http:") && !url.startsWith("https:")) {
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

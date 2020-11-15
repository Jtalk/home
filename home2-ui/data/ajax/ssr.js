import getConfig from "next/config";

const { serverRuntimeConfig: config } = getConfig();
export function isSsrPreloadEnabled() {
  return config.ssr.preload;
}

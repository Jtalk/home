import getConfig from "next/config";

const { publicRuntimeConfig: config } = getConfig();

export function dynamicSSR() {
  return config?.import?.dynamic?.ssr;
}

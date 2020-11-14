import getConfig from "next/config";

export const ApiPrefix = () => {
  const { publicRuntimeConfig: config } = getConfig();
  return config.api.prefix || "";
};

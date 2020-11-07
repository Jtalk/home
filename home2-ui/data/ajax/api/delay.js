import getConfig from "next/config";

const { publicRuntimeConfig: config } = getConfig();

export default async function delay() {
  if (!config.api.debug?.delay) return;
  const Duration = await import("duration-js");
  let delay = Duration.parse(config.api.debug.delay);
  if (delay) {
    console.debug("Simulating a loading delay for debug");
    const sleepjs = await import("sleepjs");
    await sleepjs.sleep(delay.milliseconds());
  }
}

export function isApiDelayEnabled() {
  return !!config.api.debug?.delay;
}

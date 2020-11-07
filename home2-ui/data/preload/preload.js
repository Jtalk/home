export default async function preload(name, loader) {
  try {
    if (typeof loader === "function") {
      return await loader();
    } else {
      return await loader;
    }
  } catch (e) {
    console.error(`Error preloading ${name}`, e);
    return null;
  }
}

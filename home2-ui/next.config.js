const api = process.env.REACT_APP_API_URL || "http://localhost:8090";
const debugDelay = process.env.REACT_APP_TEST_DURATION;
const APP_VERSION = process.env.REACT_APP_VERSION || undefined;
const API_KEY = process.env.REACT_APP_BUGSNAG_API_KEY;
const SSR_PRELOAD = process.env.SSR_PRELOAD !== "false";
const DYNAMIC_IMPORT_SSR_ON = process.env.DYNAMIC_IMPORT_SSR !== "false";

console.info("API server is set to", api);
console.debug("API debug response delay is set to", debugDelay);
console.info("SSR data preload is", SSR_PRELOAD ? "on" : "off");
console.info("Dynamic SSR components are", DYNAMIC_IMPORT_SSR_ON ? "on" : "off");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const withSourceMaps = require("@zeit/next-source-maps");

module.exports = withBundleAnalyzer(
  withSourceMaps({
    serverRuntimeConfig: {
      ssr: {
        preload: SSR_PRELOAD,
      },
    },
    publicRuntimeConfig: {
      api: {
        prefix: api,
        debug: {
          delay: debugDelay,
        },
      },
      import: {
        dynamic: {
          ssr: DYNAMIC_IMPORT_SSR_ON,
        },
      },
      image: {
        url: {
          template: `${api}/images/{}`,
        },
      },
      bugsnag: {
        key: API_KEY,
        version: APP_VERSION,
      },
    },
    async redirects() {
      return [
        {
          source: "/home",
          destination: "/",
          permanent: true,
        },
        {
          source: "/home/index.xhtml",
          destination: "/",
          permanent: true,
        },
        {
          source: "/home/projects.xhtml",
          destination: "/projects",
          permanent: true,
        },
        {
          source: "/home/blog.xhtml",
          destination: "/blog/articles",
          permanent: true,
        },
        {
          source: "/home/blog/post.xhtml",
          destination: "/blog/articles",
          permanent: true,
        },
        {
          source: "/projects/jacra",
          destination: "/projects",
          permanent: false,
        },
        {
          source: "/atom.xml",
          destination: "/api/atom.xml",
          permanent: false,
        },
        {
          source: "/rss.xml",
          destination: "/api/atom.xml",
          permanent: false,
        },
        {
          source: "/home/rss",
          destination: "/api/atom.xml",
          permanent: false,
        },
        {
          source: "/feed",
          destination: "/api/atom.xml",
          permanent: false,
        },
        {
          source: "/index.rss",
          destination: "/api/atom.xml",
          permanent: false,
        },
      ];
    },
    excludeFile: (str) => /\*.{spec,test}.js/.test(str),
  })
);

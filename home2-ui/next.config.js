const api = process.env.REACT_APP_API_URL || "http://localhost:8090";
const debugDelay = process.env.REACT_APP_TEST_DURATION;
const APP_VERSION = process.env.REACT_APP_VERSION || undefined;
const API_KEY = process.env.REACT_APP_BUGSNAG_API_KEY;

console.info("API server is set to", api);
console.debug("API debug response delay is set to", debugDelay);

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const withSourceMaps = require("@zeit/next-source-maps");

module.exports = withBundleAnalyzer(
  withSourceMaps({
    serverRuntimeConfig: {},
    publicRuntimeConfig: {
      api: {
        prefix: api,
        debug: {
          delay: debugDelay,
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
          source: "/home/projects.xhtml",
          destination: "/projects",
          permanent: true,
        },
        {
          source: "/home/blog/post.xhtml",
          destination: "/blog/articles",
          permanent: true,
        },
        {
          source: "/atom.xml",
          destination: "/api/atom.xml",
        },
        {
          source: "/home/rss",
          destination: "/api/atom.xml",
        },
      ];
    },
    excludeFile: (str) => /\*.{spec,test}.js/.test(str),
  })
);

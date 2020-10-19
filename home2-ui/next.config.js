const api = process.env.REACT_APP_API_URL || "http://localhost:8090";
const debugDelay = process.env["REACT_APP_TEST_DURATION"] || "0s";
const APP_VERSION = process.env.REACT_APP_VERSION || undefined;
const API_KEY = process.env.REACT_APP_BUGSNAG_API_KEY;

console.debug("API server is set to", api);
console.debug("API debug response delay is set to", debugDelay);

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer({
    serverRuntimeConfig: {
    },
    publicRuntimeConfig: {
        api: {
            prefix: api,
            debug: {
                delay: debugDelay
            }
        },
        image: {
            url: {
                template: `${api}/images/{}`
            }
        },
        bugsnag: {
            key: API_KEY,
            version: APP_VERSION
        }
    },
    async redirects() {
        return [
            {
                source: '/home',
                destination: '/',
                permanent: true,
            },
            {
                source: '/home/projects.xhtml',
                destination: '/projects',
                permanent: true,
            },
            {
                source: '/home/blog/post.xhtml',
                destination: '/blog/articles',
                permanent: true,
            },

        ]
    },
    excludeFile: (str) => /\*.{spec,test}.js/.test(str)
});

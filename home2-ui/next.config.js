const api = process.env.REACT_APP_API_URL || "http://localhost:8090";
const debugDelay = process.env["REACT_APP_TEST_DURATION"] || "0s";

console.debug("API server is set to", api);
console.debug("API debug response delay is set to", debugDelay);

module.exports = {
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
}

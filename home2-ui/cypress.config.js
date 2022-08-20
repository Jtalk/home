const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'k3zgy6',
  env: {
    API_PREFIX: 'http://localhost:8090',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:8070',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
})

const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implementa hooks de nodos si es necesario
    },
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.js'
  },
})
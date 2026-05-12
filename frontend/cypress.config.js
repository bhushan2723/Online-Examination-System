const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',  // your React app
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 60000,
    retries: { runMode: 2, openMode: 0 },
    video: true,
    setupNodeEvents(on, config) {
      // you can register tasks or plugins here
      return config;
    },
  },
  env: {
    API_URL: 'http://localhost:5000/api', // your Express API
  },
});

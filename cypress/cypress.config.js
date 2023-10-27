const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "6avbnz",
  env: {
    stage_url: "https://stage.retailo.me/stockflo/",
    dev_url: "https://dev.retailo.me/stockflo/",
    local_url: "http://localhost:3001/stockflo/",
    userEmail: "joeroot@gmail.com",
    userPassword: "password",
    // Variables according to the env
    country: {
      local: {
        PAK: "Pakistan",
        SAUDI: "Saudi Arabia",
        UAE: "United Arab Emirates",
      },
      dev: {
        PAK: "",
        SAUDI: "",
        UAE: "",
      },
      stage: {
        PAK: "",
        SAUDI: "",
        UAE: "",
      },
    },
    businessUnit: {
      local: {
        PAK: "Karachi",
        SAUDI: "Riyad",
        UAE: "Dubai",
      },
      dev: {
        PAK: "",
        SAUDI: "",
        UAE: "",
      },
      stage: {
        PAK: "",
        SAUDI: "",
        UAE: "",
      },
    },
    warehouse: {
      local: {
        PAK: "NPD Warehouse",
        SAUDI: "Saudi Arabia",
        UAE: "United Arab Emirates",
      },
      dev: {
        PAK: "",
        SAUDI: "",
        UAE: "",
      },
      stage: {
        PAK: "",
        SAUDI: "",
        UAE: "",
      },
    },
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});

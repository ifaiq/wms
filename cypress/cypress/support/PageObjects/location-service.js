import commonLocators from "../../fixtures/common_locators.json";
import locationLocators from "../../fixtures/location-locators.json";
import { generateRandomNumber } from "./utilsObjects.js";

export class LocationScreen {
  constructor() {
    const {
      local: { PAK: country },
    } = Cypress.env("country");
    const {
      local: { PAK: businessUnit },
    } = Cypress.env("businessUnit");
    const {
      local: { PAK: warehouse },
    } = Cypress.env("warehouse");

    this.country = country;
    this.businessUnit = businessUnit;
    this.warehouse = warehouse;
  }

  fillLocationData() {
    cy.selectFromDropdown(locationLocators.locationCountry, this.country);
    cy.selectFromDropdown(
      locationLocators.locationBusinessUnit,
      this.businessUnit
    );
    cy.selectFromDropdown(locationLocators.locationWareHouse, this.warehouse);
    // cy.selectFromDropdown(locationLocators.locationParent, null);

    const locationName = "Demo Location " + generateRandomNumber();

    cy.typeIn(locationLocators.locationName, locationName);

    return locationName;
  }

  createLocationForPakistan() {
    cy.clickButton(locationLocators.menuLocator);
    cy.contains(locationLocators.menuLocatorLocations).click();
    cy.clickButton(locationLocators.createLocation);

    const locationName = this.fillLocationData();

    cy.clickButton(locationLocators.saveInfo).wait(3000);
    cy.get(locationLocators.heading)
      .invoke("text")
      .then((value) => {
        expect(value.trim()).to.include(locationName);
      });

    return locationName;
  }

  selectPKFilter() {
    cy.clickButton(commonLocators.filterLocator);

    cy.selectFromDropdown(locationLocators.countryFilter, this.country);
    cy.selectFromDropdown(
      locationLocators.businessUnitFilter,
      this.businessUnit
    );
    cy.selectFromDropdown(locationLocators.warehouseFilter, this.warehouse);
  }
}

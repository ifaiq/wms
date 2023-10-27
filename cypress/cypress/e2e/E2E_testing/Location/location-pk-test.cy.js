import commonLocators from "../../../fixtures/common_locators.json";
import locationLocators from "../../../fixtures/location-locators.json";
import { LocationScreen } from "../../../support/PageObjects/location-service";
import {
  openURL,
  enterUserCredentials,
  splitQueryParams,
} from "../../../support/PageObjects/utilsObjects";

describe("Location - PAK", () => {
  const locationScreen = new LocationScreen();

  // It will only run once
  before(() => {
    openURL();
  });

  beforeEach(() => {
    enterUserCredentials();
    // Custom command for reuseability - 'clickButton'
    cy.clickButton(locationLocators.menuLocator);
    cy.contains(locationLocators.menuLocatorLocations).click();
  });

  it("Verify error messages on clicking create location without entering any data", () => {
    cy.clickButton(locationLocators.createLocation);
    cy.clickButton(locationLocators.saveInfo);

    // verify country error message
    cy.get(locationLocators.locationCountryError)
      .invoke("text")
      .then((value) => {
        expect(value.trim()).to.include("Country is required");
      });

    // verify city error message
    cy.get(locationLocators.locationBusinessUnitError)
      .invoke("text")
      .then((value) => {
        expect(value.trim()).to.include("City is required");
      });

    // verify warehouse error message
    cy.get(locationLocators.locationWarehouseError)
      .invoke("text")
      .then((value) => {
        expect(value.trim()).to.include("Warehouse is required");
      });

    // verify new location name error message
    cy.get(locationLocators.locationNameError)
      .invoke("text")
      .then((value) => {
        expect(value.trim()).to.include("Location is required");
      });
  });

  it("Go to create new location, add all the information and click clear info", () => {
    // Go to create location page
    cy.clickButton(locationLocators.createLocation);

    // Fill in all the information
    locationScreen.fillLocationData();

    // Hit clear info button
    cy.clickButton(locationLocators.clearInfo);
    cy.clickButton(commonLocators.confirmModalOK);

    cy.get(locationLocators.locationCountry).should("not.have.value");
    cy.get(locationLocators.locationBusinessUnit).should("not.have.value");
    cy.get(locationLocators.locationWareHouse).should("not.have.value");
    cy.get(locationLocators.locationParent).should("not.have.value");
    cy.get(locationLocators.locationName).should("not.have.value");
  });

  it("Create new location and click save button", () => {
    cy.clickButton(locationLocators.createLocation);

    const locationName = locationScreen.fillLocationData();

    cy.clickButton(locationLocators.saveInfo).wait(500);

    cy.get(locationLocators.heading)
      .invoke("text")
      .then((value) => {
        expect(value.trim()).to.include(locationName);
      });
  });

  it("Verify newly created location data", () => {
    // Go to create location page
    cy.clickButton(locationLocators.createLocation);
    cy.intercept("POST", "**/locations").as("locationInfo");
    locationScreen.fillLocationData();
    cy.clickButton(locationLocators.saveInfo);
    cy.wait("@locationInfo");

    cy.get("@locationInfo").should(({ request, response }) => {
      const requestBody = request.body;
      const responseBody = response.body;

      expect(requestBody.name).to.eq(responseBody.name);
      expect(requestBody.country).to.eq(responseBody.country);
      expect(requestBody.businessUnitId).to.eq(responseBody.businessUnitId);
      expect(requestBody.warehouseId).to.eq(responseBody.warehouseId);
      expect(requestBody.availableForSale).to.eq(responseBody.availableForSale);
      expect(requestBody.grnApplicable).to.eq(responseBody.grnApplicable);
      expect(requestBody.returnApplicable).to.eq(responseBody.returnApplicable);
      expect(requestBody.parentId).to.eq(responseBody.parentId);
    });
  });

  it("Verify Location Filters", () => {
    // Go to create location page
    locationScreen.selectPKFilter();
    cy.intercept("GET", "**/locations/*").as("locationInfo");
    cy.clickButton(locationLocators.applyFilter);
    cy.wait("@locationInfo");
    cy.get("@locationInfo").should(({ request, response }) => {
      const params = splitQueryParams(request.url);
      expect(response.body.locations[0].country).to.eq(params.country);
      expect(String(response.body.locations[0].businessUnitId)).to.eq(
        params.businessUnitId
      );
      expect(String(response.body.locations[0].warehouseId)).to.eq(
        params.warehouseId
      );
    });
  });

  it("Verify Clear Filters", () => {
    // Go to create location page
    locationScreen.selectPKFilter();
    cy.clickButton(locationLocators.applyFilter);
    cy.intercept("GET", "**/locations/*").as("locationInfo");
    cy.clickButton(commonLocators.clearFilter);
    cy.wait("@locationInfo");
    cy.get("@locationInfo").should(({ request }) => {
      const params = splitQueryParams(request.url);
      expect(params.country).to.be.undefined;
      expect(params.businessUnitId).to.be.undefined;
      expect(params.warehouseId).to.be.undefined;
    });
  });

  it("Verify that user is unable to proceed without providing configuration Details", () => {
    // Go to create location page
    cy.clickButton(locationLocators.createLocation);

    cy.get(locationLocators.isAvailableForSale)
      .uncheck()
      .then(() => {
        cy.get(locationLocators.isGrnApplicable).should("not.be.checked");
        cy.get(locationLocators.isReturnApplicable).should("be.checked");
      })
      .wait(500);

    cy.get(locationLocators.isReturnApplicable)
      .uncheck()
      .then(() => {
        cy.get(locationLocators.isGrnApplicable).should("be.checked");
        cy.get(locationLocators.isAvailableForSale).should("be.checked");
      })
      .wait(500);

    cy.get(locationLocators.isGrnApplicable)
      .uncheck()
      .then(() => {
        cy.get(locationLocators.isAvailableForSale).should("be.checked");
        cy.get(locationLocators.isReturnApplicable).should("not.be.checked");
      });
  });

  it("Verify that user is only able to proceed if he provides Available for Sale + GRN Applicable configuration Details", () => {
    // Go to create location page
    cy.clickButton(locationLocators.createLocation);
    cy.intercept("POST", "**/locations").as("locationInfo");
    locationScreen.fillLocationData();
    cy.get(locationLocators.isAvailableForSale).check();
    cy.get(locationLocators.isGrnApplicable).check();
    cy.clickButton(locationLocators.saveInfo);
    cy.wait("@locationInfo");
    cy.get("@locationInfo")
      .its("response.statusCode")
      .should("matches", /20[01]/);
  });

  it("Verify that user is able to proceed if he provides GRN Applicable configuration Details", () => {
    // Go to create location page
    cy.clickButton(locationLocators.createLocation);
    cy.intercept("POST", "**/locations").as("locationInfo");
    locationScreen.fillLocationData();
    cy.get(locationLocators.isAvailableForSale).uncheck();
    cy.get(locationLocators.isGrnApplicable).check();
    cy.get(locationLocators.isReturnApplicable).uncheck();
    cy.clickButton(locationLocators.saveInfo);
    cy.wait("@locationInfo");
    cy.get("@locationInfo")
      .its("response.statusCode")
      .should("matches", /20[01]/);
  });

  it.only("Verify that user is able to proceed if he provides Available for Sale configuration Details", () => {
    // Go to create location page
    cy.clickButton(locationLocators.createLocation);
    cy.intercept("POST", "**/locations").as("locationInfo");
    locationScreen.fillLocationData();
    cy.get(locationLocators.isAvailableForSale).check();
    cy.get(locationLocators.isGrnApplicable).uncheck();
    cy.get(locationLocators.isReturnApplicable).uncheck();
    cy.clickButton(locationLocators.saveInfo);
    cy.wait("@locationInfo");
    cy.get("@locationInfo")
      .its("response.statusCode")
      .should("matches", /20[01]/);
  });

  it("Verify that user is able to proceed if he provides Return Applicable configuration Details", () => {
    // Go to create location page
    cy.clickButton(locationLocators.createLocation);
    cy.intercept("POST", "**/locations").as("locationInfo");
    locationScreen.fillLocationData();
    cy.get(locationLocators.isAvailableForSale).uncheck();
    cy.get(locationLocators.isGrnApplicable).uncheck();
    cy.get(locationLocators.isReturnApplicable).check();
    cy.clickButton(locationLocators.saveInfo);
    cy.wait("@locationInfo");
    cy.get("@locationInfo")
      .its("response.statusCode")
      .should("matches", /20[01]/);
  });

  it("Verify that user is unable to proceed if he tries to select all the option in configuration Details", () => {
    let condition = false;
    // Go to create location page
    cy.clickButton(locationLocators.createLocation);

    // Unchecking all types of location
    cy.get(locationLocators.isAvailableForSale).uncheck();
    cy.get(locationLocators.isGrnApplicable).uncheck();
    cy.get(locationLocators.isReturnApplicable).uncheck();

    cy.get(".ant-checkbox-input")
      .then((checkboxes) => {
        for (const checkbox of checkboxes) {
          condition = condition || checkbox.checked;
        }
        return condition;
      })
      .should("eq", true);
  });
});

/// <reference types="Cypress" />

import transferLocators from "../../../fixtures/transfer-locators.json";
import commonLocators from "../../../fixtures/common_locators.json";
import { TransferService } from "../../../support/PageObjects/transfer-service";
import { PurchaseOrderService } from "../../../support/PageObjects/purch-order-service.js";
import { validatePopupMessage } from "../../../support/PageObjects/utilsObjects";
import {
  openURL,
  enterUserCredentials,
} from "../../../support/PageObjects/utilsObjects";

describe("Create New Transfer - PAK", () => {
  const transferService = new TransferService();
  const purchOrderService = new PurchaseOrderService();

  // It will only run once
  before(() => {
    openURL();
    enterUserCredentials();
  });

  beforeEach(() => {
    cy.clickButton(commonLocators.menuLocator);
    cy.contains(transferLocators.inventoryMovementsLocator).click();
  });

  it("Verify Clear Filters", () => {
    transferService.selectPKFilter();
    // write test case here
  });

  it("Save Transfer without adding any products", () => {
    transferService.fillInTransferInfo();
    transferService.clickSaveInfo();
    validatePopupMessage("Please Add Products");
  });

  it("Confirm Transfer without adding any products", () => {
    transferService.fillInTransferInfo();
    transferService.clickConfirmTransfer();

    validatePopupMessage("Please Add Products");
  });

  it("Save Transfer without required fileds and confirm validation messages", () => {
    cy.clickButton(transferLocators.createTransfer);

    transferService.clickSaveInfo();

    transferService.verifyValidationMessages();
  });

  it("Save transfer without providing transfer-stock and cancel it", () => {
    const { locationName, productName } = purchOrderService.confirmGRNWithSubLocation();
    transferService.navigateToTransfer();
    transferService.fillInTransferInfo(locationName);
    transferService.addTransferProduct(productName);
    transferService.clickSaveInfo();
    cy.wait(2000);
    transferService.clickCancel();

    cy.intercept("GET", "**/transfer/**").as("transferInfo");
    cy.wait("@transferInfo");

    cy.get("@transferInfo").should(({ request, response }) => {
      const requestBody = request.body;
      const responseBody = response.body;

      expect(responseBody.transfer.status).to.eq("CANCELLED");
    });

  });

  it.only("Confirm transfer with providing transfer-stock and verify FE and BE Data", () => {
    const { locationName, productName } = purchOrderService.confirmGRNWithSubLocation();
    transferService.navigateToTransfer();
    transferService.fillInTransferInfo(locationName);
    transferService.addTransferProduct(productName, 50);
    cy.intercept("POST", "**/transfer").as("transferSaveInfo");
    transferService.clickSaveInfo();
    cy.wait(2000);
    cy.wait("@transferSaveInfo");

    cy.get("@transferSaveInfo").should(({ request, response }) => {
      const requestBody = request.body;
      const responseBody = response.body;

      expect(responseBody.transfer.status).to.eq("READY");
      expect(requestBody.products[0].productId).to.eq(responseBody.transfer.products[0].productId);
      expect(requestBody.products[0].physicalQuantity).to.eq(responseBody.transfer.products[0].physicalQuantity);
      expect(requestBody.products[0].transferQuantity).to.eq(responseBody.transfer.products[0].transferQuantity);
    });

    transferService.clickConfirmTransfer();

    cy.intercept("GET", "**/transfer/**").as("transferStatusInfo");
    cy.wait("@transferStatusInfo");

    cy.get("@transferStatusInfo").should(({ request, response }) => {
      const responseBody = response.body;
      expect(responseBody.transfer.status).to.eq("DONE");
    });
  });

  it("Confirm transfer with transfer-stock greater than physical-stock ", () => {
    const { locationName, productName } = purchOrderService.confirmGRNWithSubLocation();
    transferService.navigateToTransfer();
    transferService.fillInTransferInfo(locationName);
    transferService.addTransferProduct(productName, 200);
    transferService.clickSaveInfo();
    cy.wait(2000);
    transferService.clickConfirmTransfer();
    validatePopupMessage("Transfer Stock must be less than or equal to Physical Stock");
  });

  it("Fill in the transfer information and press clear info button", () => {
    transferService.fillInTransferInfo();

    cy.wait(500);

    transferService.clickClearInfo();

    transferService.verifyFieldsAreEmptyOrNull();
  });
});

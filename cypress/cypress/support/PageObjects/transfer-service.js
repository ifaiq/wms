/// <reference types="Cypress" />

import transferLocators from "../../fixtures/transfer-locators.json";
import commonLocators from "../../fixtures/common_locators.json";
import { validateRequiredFieldMessages } from "./utilsObjects";

const DEF_WAIT = 500;

export class TransferService {
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

  selectPKFilter() {
    cy.clickButton(commonLocators.filterLocator);
    // code here
  }

  fillInTransferInfo(fromLocation = "") {
    cy.clickButton(transferLocators.createTransfer);
    cy.selectFromDropdown(transferLocators.transferCountry, this.country).wait(
      DEF_WAIT
    );
    cy.selectFromDropdown(
      transferLocators.transferBusinessUnit,
      this.businessUnit
    ).wait(DEF_WAIT);
    cy.selectFromDropdown(
      transferLocators.transferWarehouse,
      this.warehouse
    ).wait(DEF_WAIT);
    cy.selectFromDropdown(transferLocators.transferReason, "Other");
    cy.typeIn(
      transferLocators.transferReasonComment,
      "Testing Comment"
    );
    cy.selectFromDropdown(transferLocators.transferLocationFrom, fromLocation);
    cy.selectFromDropdown(
      transferLocators.transferLocationTo,
      "",
      { force: true }
    );
  }

  navigateToTransfer() {
    cy.clickButton(commonLocators.menuLocator);
    cy.contains(transferLocators.inventoryMovementsLocator).click();
  }

  addTransferProduct(productName, transferQty = 0) {
    cy.clickButton(transferLocators.transferAddProductRow);
    cy.get(transferLocators.productNameSearch).type(productName).wait(4000);
    cy.wait(15000);
    cy.get(transferLocators.dropdown_Product_Locator)
      .contains(productName)
      .click();
    if (transferQty > 0) {
      cy.typeIn(transferLocators.productQuantityLocator, transferQty).wait(2500);
    }
  }

  clickSaveInfo() {
    cy.clickButton(transferLocators.transferSaveInfo);
  }

  clickConfirmTransfer() {
    cy.clickButton(transferLocators.transferConfirm);
    cy.clickButton(commonLocators.confirmModalOK);
  }

  clickClearInfo() {
    cy.clickButton(transferLocators.transferClearInfo);
  }

  clickCancel() {
    cy.clickButton(transferLocators.transferCancel);
    cy.clickButton(commonLocators.confirmModalOK);
  }

  verifyValidationMessages() {
    validateRequiredFieldMessages(
      transferLocators.errorMessageCountry,
      "Country is required"
    );
    validateRequiredFieldMessages(
      transferLocators.errorMessageCity,
      "City is required"
    );
    validateRequiredFieldMessages(
      transferLocators.errorMessageWarehouse,
      "Warehouse is required"
    );
    validateRequiredFieldMessages(
      transferLocators.errorMessageReason,
      "Reason is required"
    );
    validateRequiredFieldMessages(
      transferLocators.errorMessageFromLocation,
      "From Location is required"
    );
    validateRequiredFieldMessages(
      transferLocators.errorMessageToLocation,
      "To Location is required"
    );
  }

  verifyFieldsAreEmptyOrNull() {
    cy.get(transferLocators.transferCountry).should("not.have.value");
    cy.get(transferLocators.transferBusinessUnit).should("not.have.value");
    cy.get(transferLocators.transferWarehouse).should("not.have.value");
    cy.get(transferLocators.transferReason).should("not.have.value");
    cy.get(transferLocators.transferReasonComment).should("not.have.value");
    cy.get(transferLocators.transferLocationFrom).should("not.have.value");
    cy.get(transferLocators.transferLocationTo).should("not.have.value");
  }
}

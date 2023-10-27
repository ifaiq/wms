const adjData = require("../../fixtures/adjustment_locators.json");
import { productCreationOnHyper } from "./utilsObjects";

class adjustmentPage {
  addPakistaniInfoToAdjustment() {
    cy.clickButton(adjData.click_Select_Country);
    cy.clickButton(adjData.pakistani_Country_Locator);
    cy.clickButton(adjData.click_Select_City);
    cy.clickButton(adjData.pakistani_City_Locator);
    cy.clickButton(adjData.click_Select_Warehouse);
    cy.clickButton(adjData.pakistani_Warehouse_Locator);
    cy.clickButton(adjData.click_Select_Reason);
    cy.clickButton(adjData.intialCount_Locator);
    cy.get(adjData.enter_Reason_Comment).type(
      "Automation Testing" + " " + Math.floor(Math.random() * 10000000)
    );
  }

  addNewRowForProduct() {
    cy.clickButton(adjData.click_To_Add_Product_Row);
  }

  addPakistaniProductForAdjustment() {
    let productName = productCreationOnHyper(cy);
    cy.wait(2000);
    cy.get(adjData.click_To_Add_Product_Name).type(productName).wait(2500);
    cy.get(adjData.click_ON_The_First_Dropdown_Product_Locator)
      .contains(productName)
      .click();
  }

  addPakistaniNewProductQty() {
    cy.get(adjData.new_Total_Qty_Locator).each((ele, index, list) => {
      if (ele.text() === "0") {
        cy.wrap(ele).type("{selectAll}").type("100").type("{enter}");
      }
    });
  }

  savingDataOfAdustment() {
    cy.get(adjData.all_Button_Locator).contains("Save Info").click().wait(2500);
  }

  clearAdustment() {
    cy.wait(1000);
    cy.get(adjData.all_Button_Locator)
      .contains("Clear Info")
      .click()
      .wait(1000);
  }

  cancelAdustment() {
    cy.get(adjData.all_Button_Locator).contains("Cancel").click().wait(1000);
    cy.get(adjData.all_Button_Locator).contains("No").click().wait(1000);
    cy.get(adjData.all_Button_Locator).contains("Cancel").click().wait(1000);
    cy.get(adjData.all_Button_Locator).contains("Yes").click().wait(1000);
  }

  confirmAdustment() {
    cy.get(adjData.all_Button_Locator).contains("Confirm").click().wait(1000);
    cy.get(adjData.all_Button_Locator).contains("No").click().wait(1000);
    cy.get(adjData.all_Button_Locator).contains("Confirm").click().wait(1000);
    cy.get(adjData.all_Button_Locator).contains("Yes").click().wait(1000);
  }

  validationOnEmptyPakistaniAdjustment() {
    cy.get(adjData.error_Empty_adjustment_Form_Locator)
      .contains("Country is required")
      .should("have.text", "Country is required");
    cy.get(adjData.error_Empty_adjustment_Form_Locator)
      .contains("City is required")
      .should("have.text", "City is required");
    cy.get(adjData.error_Empty_adjustment_Form_Locator)
      .contains("Warehouse is required")
      .should("have.text", "Warehouse is required");
    cy.get(adjData.error_Empty_adjustment_Form_Locator)
      .contains("Reason is required")
      .should("have.text", "Reason is required");
    cy.wait(1500);
  }
}
export default adjustmentPage;

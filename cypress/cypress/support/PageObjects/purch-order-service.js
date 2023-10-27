import RFQdata from '../../fixtures/purch-order-locators.json';
import locationLocators from "../../fixtures/location-locators.json";
import { LocationScreen } from "../PageObjects/location-service";
import { productCreationOnHyper } from "./utilsObjects";

export class PurchaseOrderService {
  constructor() {
    this.locationService = new LocationScreen();
  }

  addPakistaniInfoToRFQ() {
    cy.clickButton(RFQdata.click_PO_type);
    cy.clickButton(RFQdata.projection_PO_type_Locator);
    cy.clickButton(RFQdata.click_Select_Country);
    cy.clickButton(RFQdata.pakistani_Country_Locator);
    cy.clickButton(RFQdata.click_Select_City);
    cy.clickButton(RFQdata.pakistani_City_Locator);
    cy.clickButton(RFQdata.click_Select_Warehouse);
    cy.clickButton(RFQdata.pakistani_Warehouse_Locator);
    cy.get(RFQdata.click_Select_Vendor).type("Nestle");
    cy.clickButton(RFQdata.pakistani_Vendor_Locator);
    cy.clickButton(RFQdata.payment_Type_Locator);
    cy.clickButton(RFQdata.credit_Payment_Type_Locator);
    cy.clickButton(RFQdata.credit_Payment_Type_Days_Locator)
      .clear()
      .wait(1000)
      .type("10");
  }

  addNewRowForProduct() {
    cy.clickButton(RFQdata.click_To_Add_Product_Row);
  }

  addPakistaniProductToRFQ() {
    let productName = productCreationOnHyper(cy);
    cy.wait(2000);
    cy.get(RFQdata.click_To_Add_Product_Name).type(productName).wait(2500);
    cy.get(RFQdata.click_ON_The_First_Dropdown_Product_Locator)
      .contains(productName)
      .click();
    
      return productName;
  }

  addPakistaniProductQty() {
    cy.get(RFQdata.productQtyLocator).clear().type("100");
    cy.get(RFQdata.productPriceLocator).clear().type("100." + Math.floor(Math.random() * 10000000));
    cy.get(RFQdata.productMRPLocator).clear().type("100." + Math.floor(Math.random() * 10000000));
  }
  deleteProduct() {
    cy.clickButton(RFQdata.minus_Button_Locator);
  }

  clearingDataRFQ() {
    cy.get(RFQdata.all_Button_Locator)
      .contains(" Clear Info")
      .click()
      .wait(1000);
    cy.get(RFQdata.all_Button_Locator).contains("No").click();
    cy.get(RFQdata.all_Button_Locator)
      .contains(" Clear Info")
      .click()
      .wait(1000);
    cy.get(RFQdata.all_Button_Locator).contains("Yes").click();
  }

  savingDataRFQ() {
    cy.get(RFQdata.all_Button_Locator).contains("Save Info").click().wait(5000);
  }

  confirmDataRFQ() {
    cy.get(RFQdata.all_Button_Locator).contains("Confirm").click().wait(1500);
  }

  cancelDataRFQ() {
    cy.get(RFQdata.all_Button_Locator).contains("Cancel").click().wait(1500);
    cy.get(RFQdata.all_Button_Locator).contains("No").click();
    cy.get(RFQdata.all_Button_Locator).contains("Cancel").click().wait(1000);
    cy.get(RFQdata.all_Button_Locator).contains("Yes").click();
  }

  unlockRFQ() {
    cy.get(RFQdata.all_Button_Locator).contains("Unlock").click().wait(1500);
  }

  lockRFQ() {
    cy.get(RFQdata.all_Button_Locator).contains("Lock").click().wait(1500);
  }

  viewReciptsRFQ() {
    cy.wait(2000);
    cy.get(RFQdata.all_Button_Locator)
      .contains("View Receipts")
      .click()
      .wait(1500);
  }

  printButtonOnRFQ() {
    cy.get(RFQdata.all_Button_Locator).contains("Print").click().wait(1500);
  }

  moveToGRN() {
    cy.get("tr td:nth-child(5)").each((ele, index) => {
      if (ele.text().includes("READY")) {
        cy.wrap(ele).contains("READY").click().wait(1000);
      }
    });
  }

  cancelGRN() {
    cy.get("tr td:nth-child(5)").each((ele, index) => {
      if (ele.text().includes("READY")) {
        cy.wrap(ele).contains("READY").click().wait(1000);
        cy.get(RFQdata.all_Button_Locator)
          .contains(" Cancel")
          .click()
          .wait(1000);
        cy.get(RFQdata.all_Button_Locator).contains("No").click();
        cy.get(RFQdata.all_Button_Locator)
          .contains("Cancel")
          .click()
          .wait(1000);
        cy.get(RFQdata.all_Button_Locator).contains("Yes").click().wait(1500);
        // cy.get(RFQdata.invoice_Widget_On_GRN_Locator).should('not.be.visible')
      }
    });
  }

  createPO() {
    this.addPakistaniInfoToRFQ();
    this.addNewRowForProduct();
    const productName = this.addPakistaniProductToRFQ();
    this.addPakistaniProductQty();
    this.savingDataRFQ();
    this.confirmDataRFQ();
    this.viewReciptsRFQ();

    return productName;
  }

  confirmGRN() {
    cy.get("tr td:nth-child(5)").each((ele, index) => {
      if (ele.text().includes("READY")) {
        cy.wrap(ele).contains("READY").click().wait(1000);
        cy.get(RFQdata.all_Button_Locator)
          .contains("Confirm")
          .click()
          .wait(1000);
      }
    });
  }

  addSubLocationAndConfirmGRN(locationName) {
    cy.get("tr td:nth-child(5)").each((ele, index) => {
      if (ele.text().includes("READY")) {
        cy.wrap(ele).contains("READY").click().wait(1000);
        cy.selectFromDropdown(
          RFQdata.selectGrnToLocation,
          locationName
        );
        cy.clickButton(RFQdata.updateGRNLocator).wait(2000);
        cy.get(RFQdata.all_Button_Locator)
          .contains("Confirm")
          .click()
          .wait(1000);
      }
    });
  }

  confirmGRNWithSubLocation() {
    const locationName = this.locationService.createLocationForPakistan();
    cy.wait(2000);
    cy.clickButton(RFQdata.menu_Locator);
    cy.contains(RFQdata.menu_Purchase_Locator).click();
    cy.clickButton(RFQdata.click_Create_RFQ);
    const productName = this.createPO();
    this.addSubLocationAndConfirmGRN(locationName);
    cy.wait(2000);
    return { locationName, productName };
  }

  cancelReturnGRN() {
    cy.get(RFQdata.all_Button_Locator).contains("Return").click();
    cy.get(RFQdata.all_Button_Locator).contains("No").click().wait(1000);
    cy.get(RFQdata.all_Button_Locator).contains("Return").click();
    cy.get(RFQdata.all_Button_Locator).contains("Yes").click().wait(2000);
    cy.get(RFQdata.all_Button_Locator).contains("Cancel").click();
    cy.get(RFQdata.all_Button_Locator).contains("No").click().wait(1000);
    cy.get(RFQdata.all_Button_Locator).contains("Cancel").click();
    cy.get(RFQdata.all_Button_Locator).contains("Yes").click().wait(1000);
  }

  confirmReturnGRN() {
    cy.get(RFQdata.all_Button_Locator).contains("Return").click();
    cy.get(RFQdata.all_Button_Locator).contains("No").click().wait(1000);
    cy.get(RFQdata.all_Button_Locator).contains("Return").click();
    cy.get(RFQdata.all_Button_Locator).contains("Yes").click().wait(2000);
    cy.get(RFQdata.all_Button_Locator).contains("Confirm").click().wait(1000);
  }

  cancelBackOrder() {
    cy.get("tr td:nth-child(5)").each((ele, index) => {
      if (ele.text().includes("READY")) {
        cy.wrap(ele).contains("READY").click().wait(1000);
        cy.get("tr td:nth-child(4)").each((ele, index, list) => {
          if (ele.text() === "100") {
            cy.wrap(ele)
              .type("{selectall}", "{backspace}")
              .wait(1000)
              .type("50")
              .type("{enter}")
              .wait(1500);
            cy.get(RFQdata.all_Button_Locator)
              .contains("Save Info")
              .click()
              .wait(1500);
            cy.get(RFQdata.all_Button_Locator)
              .contains("Confirm")
              .click()
              .wait(1000);
            cy.get(RFQdata.all_Button_Locator)
              .contains("No")
              .click()
              .wait(1000);
          }
        });
      }
    });
  }

  confirmBackOrder() {
    cy.get("tr td:nth-child(5)").each((ele, index) => {
      if (ele.text().includes("READY")) {
        cy.wrap(ele).contains("READY").click().wait(1000);
        cy.get("tr td:nth-child(4)").each((ele, index, list) => {
          if (ele.text() === "100") {
            cy.wrap(ele)
              .type("{selectall}", "{backspace}")
              .wait(1000)
              .type("50")
              .type("{enter}")
              .wait(1500);
            cy.get(RFQdata.all_Button_Locator)
              .contains("Save Info")
              .click()
              .wait(1500);
            cy.get(RFQdata.all_Button_Locator)
              .contains("Confirm")
              .click()
              .wait(1000);
            cy.get(RFQdata.all_Button_Locator)
              .contains("Yes")
              .click()
              .wait(2000);
          }
        });
      }
    });
  }
}

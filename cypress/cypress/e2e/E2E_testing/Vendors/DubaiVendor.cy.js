/// <reference types="cypress" />
import vendorPage from "../../../support/PageObjects/vendorObjects";
import {
  openURL,
  enterUserCredentials,
} from "../../../support/PageObjects/utilsObjects";

describe("Adding a New Dubai Vendor", () => {
  const vendorData = new vendorPage();

  let fdata;
  before(() => {
    cy.fixture("vendor_locators").then(function (data) {
      fdata = data;
    });
    openURL();
  });
  beforeEach(() => {
    enterUserCredentials();
  });

  it("saveNewVendor", () => {
    vendorData.newDubaiUserInfo();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.add_edit_confirm_Vendor_Title).should(
      "have.text",
      "Confirm Vendor Information"
    );
    cy.wait(1500);
  });

  it("clearInfoUAEVendor", () => {
    vendorData.newDubaiUserInfo();
    cy.clickButton(fdata.click_Clear_Vendor).wait(1000);
    cy.clickButton(fdata.click_No_Clearinfo);
    cy.clickButton(fdata.click_Clear_Vendor).wait(1000);
    cy.clickButton(fdata.click_Yes_Clearinfo);
    cy.get(fdata.add_edit_confirm_Vendor_Title).should(
      "have.text",
      "Add Vendor Information"
    );
    cy.wait(1500);
  });

  it("editUAEVendor", () => {
    vendorData.newDubaiUserInfo();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.vendor_Name_Locator)
      .wait(2000)
      .clear()
      .type(
        "UAE Vendor EditAuto Testing Co." +
          " " +
          Math.floor(Math.random() * 1000)
      );
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.add_edit_confirm_Vendor_Title).should(
      "have.text",
      "Confirm Vendor Information"
    );
    cy.wait(1500);
  });

  it("confirmUAEVendor", () => {
    vendorData.newDubaiUserInfo();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.vendor_Name_Locator)
      .wait(2000)
      .clear()
      .type(
        "UAE Vendor EditAuto Testing Co." +
          " " +
          Math.floor(Math.random() * 1000)
      );
    cy.clickButton(fdata.click_Save_Vendor);
    cy.clickButton(fdata.click_Conform_Button);
    cy.get(fdata.add_edit_confirm_Vendor_Title).should(
      "have.text",
      "Vendor Details"
    );
    cy.wait(1500);
  });

  it("unlockUAEVendor", () => {
    vendorData.newDubaiUserInfo();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.vendor_Name_Locator)
      .wait(2000)
      .clear()
      .type(
        "Israr EditAuto Testing Co." + " " + Math.floor(Math.random() * 1000)
      );
    cy.clickButton(fdata.click_Save_Vendor);
    cy.clickButton(fdata.click_Conform_Button);
    cy.clickButton(fdata.click_Unlock_Button)
      .wait(2000)
      .get(fdata.click_Conform_Button)
      .should("not.be.disabled");
    cy.wait(1500);
  });

  it("disableUAEVendor", () => {
    vendorData.newDubaiUserInfo();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.clickButton(fdata.click_Conform_Button);
    cy.clickButton(fdata.click_enable_disable_Button)
      .wait(2000)
      .should("have.attr", "aria-checked", "true");
    cy.wait(1500);
  });

  it("enableUAEVendor", () => {
    vendorData.newDubaiUserInfo();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.clickButton(fdata.click_Conform_Button);
    cy.clickButton(fdata.click_enable_disable_Button).wait(2000);
    cy.clickButton(fdata.click_enable_disable_Button)
      .wait(2000)
      .should("have.attr", "aria-checked", "false");
    cy.wait(1500);
  });

  it("validationOnEmptyUAEVendor", () => {
    cy.clickButton(fdata.click_Create_Vendor);
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.error_Empty_Vendor_Form_Locator)
      .contains("Vendor Name is required!")
      .should("have.text", "Vendor Name is required!");
    cy.get(fdata.error_Empty_Vendor_Form_Locator)
      .contains("Country is required!")
      .should("have.text", "Country is required!");
    cy.get(fdata.error_Empty_Vendor_Form_Locator)
      .contains("Type is required!")
      .should("have.text", "Type is required!");
    cy.get(fdata.country_Locator)
      .click()
      .get(fdata.country_Locator_Dubai)
      .click();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.error_Empty_Vendor_Form_Locator)
      .contains("CR No. is required!")
      .should("have.text", "CR No. is required!");
    cy.get(fdata.type_Locator)
      .click()
      .get(fdata.type_Locator_Individual)
      .click();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.error_Empty_Vendor_Form_Locator)
      .contains("CR No. is required!")
      .should("have.text", "CR No. is required!");
    cy.wait(1500);
  });

  // Validating form on leaving mandatory fields empty

  it("leavingVendorNameEmpty", () => {
    cy.clickButton(fdata.click_Create_Vendor);
    cy.get(fdata.country_Locator)
      .click()
      .get(fdata.country_Locator_Dubai)
      .click();
    cy.get(fdata.type_Locator)
      .click()
      .get(fdata.type_Locator_Individual)
      .click();
    cy.get(fdata.cr_No_Locator)
      .type("12321323112lahore" + Math.floor(Math.random() * 10000000000000000))
      .should("have.attr", "maxlength", "25");
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.error_Empty_Vendor_Form_Locator)
      .contains("Vendor Name is required!")
      .should("have.text", "Vendor Name is required!");
    cy.wait(1500);
  });

  it("leavingCountryEmpty", () => {
    cy.clickButton(fdata.click_Create_Vendor);
    cy.get(fdata.vendor_Name_Locator).type(
      "Israr Auto Testing Co." + " " + Math.floor(Math.random() * 1000)
    );
    cy.get(fdata.type_Locator)
      .click()
      .get(fdata.type_Locator_Individual)
      .click();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.error_Empty_Vendor_Form_Locator)
      .contains("Country is required!")
      .should("have.text", "Country is required!");
    cy.wait(1500);
  });

  it("leavingTypeEmpty", () => {
    cy.clickButton(fdata.click_Create_Vendor);
    cy.get(fdata.vendor_Name_Locator).type(
      "Israr Auto Testing Co." + " " + Math.floor(Math.random() * 1000)
    );
    cy.get(fdata.country_Locator)
      .click()
      .get(fdata.country_Locator_Dubai)
      .click();
    cy.get(fdata.cr_No_Locator).type(
      "12321323112lahore" + Math.floor(Math.random() * 10000000000000000)
    );
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.error_Empty_Vendor_Form_Locator)
      .contains("Type is required!")
      .should("have.text", "Type is required!");
    cy.wait(1500);
  });

  it("leavingVendorNameEmpty", () => {
    cy.clickButton(fdata.click_Create_Vendor);
    cy.get(fdata.vendor_Name_Locator).type(
      "Israr Auto Testing Co." + " " + Math.floor(Math.random() * 1000)
    );
    cy.get(fdata.country_Locator)
      .click()
      .get(fdata.country_Locator_Dubai)
      .click();
    cy.get(fdata.type_Locator).click().get(fdata.type_Locator_Company).click();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.error_Empty_Vendor_Form_Locator)
      .contains("CR No. is required!")
      .should("have.text", "CR No. is required!");
    cy.wait(1500);
  });

  it("confirmSaudiVendorData", () => {
    cy.intercept("POST", "**/vendors").as("userInfo");
    vendorData.newDubaiUserInfo();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.clickButton(fdata.click_Conform_Button);
    cy.get(fdata.add_edit_confirm_Vendor_Title).should(
      "have.text",
      "Vendor Details"
    );
    cy.wait("@userInfo");

    // Compare vendor name
    cy.get(":nth-child(1) > :nth-child(1) > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.name).to.eq(value);
        });
      });
    // Compare Comapny name
    cy.get(":nth-child(1) > :nth-child(2) > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.company).to.eq(value);
        });
      });
    //  Compare designation
    cy.get(":nth-child(1) > :nth-child(3) > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.jobPosition).to.eq(value);
        });
      });
    //  Compare Address
    cy.get(":nth-child(1) > :nth-child(4) > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.address).to.eq(value);
        });
      });
    //  Compare Country
    cy.get(":nth-child(1) > :nth-child(5) > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.country).to.eq("ARE");
        });
      });
    //  Compare Type
    cy.get(":nth-child(1) > :nth-child(6) > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.type).to.eq(value);
        });
      });
    //  Compare STRN
    cy.get(":nth-child(4) > .flex-col > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.crNumber).to.eq(value);
        });
      });
    //  Compare Contact number
    cy.get(".p-2 > :nth-child(2) > :nth-child(1) > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.phone).to.eq(value);
        });
      });
    //  Compare Bank Name
    cy.get(".rounded-md > :nth-child(1) > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.bankAccounts[0].bank).to.eq(value);
        });
      });
    //  Compare Account Number
    cy.get(".uppercase > .flex-col > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.bankAccounts[0].accountNumber).to.eq(value);
        });
      });
  });
});

import vendorPage from "../../../support/PageObjects/vendorObjects";
import {
  openURL,
  enterUserCredentials,
} from "../../../support/PageObjects/utilsObjects";

/// <reference types="cypress" />

describe("Adding a New Pakistani Vendor", () => {
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
    vendorData.newPakistaniUserInfo();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.add_edit_confirm_Vendor_Title).should(
      "have.text",
      "Confirm Vendor Information"
    );
    cy.wait(1500);
    cy.takeScreenshot();
  });

  it("clearInfoPakistaniVendor", () => {
    vendorData.newPakistaniUserInfo();
    cy.clickButton(fdata.click_Clear_Vendor).wait(1000);
    cy.clickButton(fdata.click_No_Clearinfo);
    cy.clickButton(fdata.click_Clear_Vendor).wait(1000);
    cy.clickButton(fdata.click_Yes_Clearinfo);
    cy.get(fdata.add_edit_confirm_Vendor_Title).should(
      "have.text",
      "Add Vendor Information"
    );
    cy.wait(1500);
    cy.takeScreenshot();
  });

  it("editPakistaniVendor", () => {
    vendorData.newPakistaniUserInfo();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.vendor_Name_Locator)
      .wait(2000)
      .clear()
      .type(
        "Pakistani Vendor EditAuto Testing Co." +
          " " +
          Math.floor(Math.random() * 1000)
      );
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.add_edit_confirm_Vendor_Title).should(
      "have.text",
      "Confirm Vendor Information"
    );
    cy.wait(1500);
    cy.takeScreenshot();
  });

  it("confirmPakistaniVendor", () => {
    vendorData.newPakistaniUserInfo();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.vendor_Name_Locator)
      .wait(2000)
      .clear()
      .type(
        "Pakistani Vendor EditAuto Testing Co." +
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
    cy.takeScreenshot();
  });

  it("unlockPakistaniVendor", () => {
    vendorData.newPakistaniUserInfo();
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
    cy.takeScreenshot();
  });

  it("disablePakistaniVendor", () => {
    vendorData.newPakistaniUserInfo();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.clickButton(fdata.click_Conform_Button);
    cy.clickButton(fdata.click_enable_disable_Button)
      .wait(2000)
      .should("have.attr", "aria-checked", "true");
    cy.wait(1500);
    cy.takeScreenshot();
  });

  it("enablePakistaniVendor", () => {
    vendorData.newPakistaniUserInfo();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.clickButton(fdata.click_Conform_Button);
    cy.clickButton(fdata.click_enable_disable_Button).wait(2000);
    cy.clickButton(fdata.click_enable_disable_Button)
      .wait(2000)
      .should("have.attr", "aria-checked", "false");
    cy.wait(1500);
    cy.takeScreenshot();
  });

  it("validationOnEmptyPakistaniVendor", () => {
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
      .get(fdata.country_Locator_Pakistan)
      .click();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.error_Empty_Vendor_Form_Locator)
      .contains("NTN is required!")
      .should("have.text", "NTN is required!");
    cy.get(fdata.type_Locator)
      .click()
      .get(fdata.type_Locator_Individual)
      .click();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.error_Empty_Vendor_Form_Locator)
      .contains("NIC is required!")
      .should("have.text", "NIC is required!");
    cy.wait(1500);
    cy.takeScreenshot();
  });

  // Validating form on leaving mandatory fields empty

  it("leavingVendorNameEmpty", () => {
    cy.clickButton(fdata.click_Create_Vendor);
    cy.get(fdata.country_Locator)
      .click()
      .get(fdata.country_Locator_Pakistan)
      .click();
    cy.get(fdata.type_Locator)
      .click()
      .get(fdata.type_Locator_Individual)
      .click();
    cy.get(fdata.nic_Locator)
      .type("35102-8771423-" + Math.floor(Math.random() * 10))
      .should("have.attr", "maxlength", "15");
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.error_Empty_Vendor_Form_Locator)
      .contains("Vendor Name is required!")
      .should("have.text", "Vendor Name is required!");
    cy.wait(1500);
    cy.takeScreenshot();
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
    cy.takeScreenshot();
  });

  it("leavingTypeEmpty", () => {
    cy.clickButton(fdata.click_Create_Vendor);
    cy.get(fdata.vendor_Name_Locator).type(
      "Israr Auto Testing Co." + " " + Math.floor(Math.random() * 1000)
    );
    cy.get(fdata.country_Locator)
      .click()
      .get(fdata.country_Locator_Pakistan)
      .click();
    cy.get(fdata.ntn_Locator).type("3234567-" + Math.floor(Math.random() * 10));
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.error_Empty_Vendor_Form_Locator)
      .contains("Type is required!")
      .should("have.text", "Type is required!");
    cy.wait(1500);
    cy.takeScreenshot();
  });

  it("leavingVendorNameEmpty", () => {
    cy.clickButton(fdata.click_Create_Vendor);
    cy.get(fdata.vendor_Name_Locator).type(
      "Israr Auto Testing Co." + " " + Math.floor(Math.random() * 1000)
    );
    cy.get(fdata.country_Locator)
      .click()
      .get(fdata.country_Locator_Pakistan)
      .click();
    cy.get(fdata.type_Locator).click().get(fdata.type_Locator_Company).click();
    cy.clickButton(fdata.click_Save_Vendor);
    cy.get(fdata.error_Empty_Vendor_Form_Locator)
      .contains("NTN is required!")
      .should("have.text", "NTN is required!");
    cy.wait(1500);
    cy.takeScreenshot();
  });

  it("confirmPakistaniVendorData", () => {
    cy.intercept("POST", "**/vendors").as("userInfo");
    vendorData.newPakistaniUserInfo();
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
          cy.takeScreenshot();
        });
      });
    // Compare Comapny name
    cy.get(":nth-child(1) > :nth-child(2) > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.company).to.eq(value);
          cy.takeScreenshot();
        });
      });
    //  Compare designation
    cy.get(":nth-child(1) > :nth-child(3) > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.jobPosition).to.eq(value);
          cy.takeScreenshot();
        });
      });
    //  Compare Address
    cy.get(":nth-child(1) > :nth-child(4) > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.address).to.eq(value);
          cy.takeScreenshot();
        });
      });
    //  Compare Country
    cy.get(":nth-child(1) > :nth-child(5) > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.country).to.eq("PAK");
          cy.takeScreenshot();
        });
      });
    //  Compare Type
    cy.get(":nth-child(1) > :nth-child(6) > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.type).to.eq(value);
          cy.takeScreenshot();
        });
      });
    //  Compare STRN
    cy.get(":nth-child(4) > .flex-col > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.strn).to.eq(value);
          cy.takeScreenshot();
        });
      });
    //  Compare Contact number
    cy.get(".p-2 > :nth-child(2) > :nth-child(1) > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.phone).to.eq(value);
          cy.takeScreenshot();
        });
      });
    //  Compare Bank Name
    cy.get(".rounded-md > :nth-child(1) > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.bankAccounts[0].bank).to.eq(value);
          cy.takeScreenshot();
        });
      });
    //  Compare Account Number
    cy.get(".uppercase > .flex-col > .flex > .mt-4")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.bankAccounts[0].accountNumber).to.eq(value);
          cy.takeScreenshot();
        });
      });
  });

  // it.only('Demo test case', () => {
  //   cy.clickButton(fdata.click_Create_Vendor)
  //   cy.get("[data-test-id= 'testVendorCountry']").click().wait(1000)

  // })
});

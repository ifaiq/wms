const fdata = require("../../fixtures/vendor_locators.json");

class vendorPage {
  openURL() {
    cy.visit(Cypress.env("stage_url"));
  }
  enterUserCredentials() {
    cy.get(fdata.email_Locator).clear().wait(1000);
    cy.get(fdata.email_Locator).type(Cypress.env("enter_Email"));
    cy.get(fdata.password_Locator).clear().wait(1000);
    cy.get(fdata.password_Locator).type(Cypress.env("enter_Password"));
    cy.clickButton(".bg-blue-blue2");
  }
  newPakistaniUserInfo() {
    cy.clickButton(fdata.click_Create_Vendor);
    cy.get(fdata.add_edit_confirm_Vendor_Title).should(
      "have.text",
      "Add Vendor Information"
    );
    cy.get(fdata.company_Name_Locator).type(
      "Pakistani Vendor Auto Testing" + " " + Math.floor(Math.random() * 1000)
    );
    cy.get(fdata.vendor_Name_Locator).type(
      "Pakistani Vendor Auto Testing Co." +
        " " +
        Math.floor(Math.random() * 1000)
    );
    cy.get(fdata.designation_Locator).type(
      "Supervisor" + " " + Math.floor(Math.random() * 1000)
    );
    cy.get(fdata.address_Locator).type(
      "Lahore" + " " + Math.floor(Math.random() * 1000)
    );
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
    cy.get(fdata.strn_Locator).type(
      Math.floor(Math.random() * 1000000000000000)
    );
    cy.get(fdata.contact_No_Locator)
      .type(Math.floor("92333" + Math.floor(Math.random() * 10000000)))
      .should("have.attr", "maxlength", "15");
    cy.get(fdata.email_Address_Locator).type(
      "PakistaniVendor" + Math.floor(Math.random() * 1000) + "@gmail.com"
    );
    cy.get(fdata.bank_Locator)
      .click()
      .get(fdata.pakistani_Select_Bank_Locator)
      .click();
    cy.get(fdata.iban_Locator)
      .type("PK00AAAA" + Math.floor(Math.random() * 100000000000000000))
      .should("have.attr", "maxlength", "24");
  }

  newDubaiUserInfo() {
    cy.clickButton(fdata.click_Create_Vendor);
    cy.get(fdata.add_edit_confirm_Vendor_Title).should(
      "have.text",
      "Add Vendor Information"
    );
    cy.get(fdata.company_Name_Locator).type(
      "UAE Vendor Auto Testing" + " " + Math.floor(Math.random() * 1000)
    );
    cy.get(fdata.vendor_Name_Locator).type(
      "UAE Vendor Auto Testing Co." + " " + Math.floor(Math.random() * 1000)
    );
    cy.get(fdata.designation_Locator).type(
      "Supervisor" + " " + Math.floor(Math.random() * 1000)
    );
    cy.get(fdata.address_Locator).type(
      "UAE" + " " + Math.floor(Math.random() * 1000)
    );
    cy.get(fdata.country_Locator)
      .click()
      .get(fdata.country_Locator_Dubai)
      .click();
    cy.get(fdata.type_Locator)
      .click()
      .get(fdata.type_Locator_Individual)
      .click();
    cy.get(fdata.vat_Locator)
      .type(Math.floor(Math.random() * 10000000000000000))
      .should("have.attr", "maxlength", "15");
    cy.get(fdata.cr_No_Locator)
      .type("12321323112lahore" + Math.floor(Math.random() * 10000000000000000))
      .should("have.attr", "maxlength", "25");
    cy.get(fdata.contact_No_Locator)
      .type(Math.floor("92333" + Math.floor(Math.random() * 10000000)))
      .should("have.attr", "maxlength", "15");
    cy.get(fdata.email_Address_Locator).type(
      "UAEVendor" + Math.floor(Math.random() * 1000) + "@gmail.com"
    );
    cy.get(fdata.bank_Locator)
      .click()
      .get(fdata.uae_Select_Bank_Locator)
      .click();
    cy.get(fdata.iban_Locator)
      .type("AE0703312345" + Math.floor(Math.random() * 100000000000000000))
      .should("have.attr", "maxlength", "23");
  }

  newSaudiUserInfo() {
    cy.clickButton(fdata.click_Create_Vendor);
    cy.get(fdata.add_edit_confirm_Vendor_Title).should(
      "have.text",
      "Add Vendor Information"
    );
    cy.get(fdata.company_Name_Locator).type(
      "Saudi Vendor Auto Testing" + " " + Math.floor(Math.random() * 1000)
    );
    cy.get(fdata.vendor_Name_Locator).type(
      "Saudi Vendor Auto Testing Co." + " " + Math.floor(Math.random() * 1000)
    );
    cy.get(fdata.designation_Locator).type(
      "Supervisor" + " " + Math.floor(Math.random() * 1000)
    );
    cy.get(fdata.address_Locator).type(
      "Saudi" + " " + Math.floor(Math.random() * 1000)
    );
    cy.get(fdata.country_Locator)
      .click()
      .get(fdata.country_Locator_Saudi)
      .click();
    cy.get(fdata.type_Locator)
      .click()
      .get(fdata.type_Locator_Individual)
      .click();
    cy.get(fdata.vat_Locator)
      .type(Math.floor(Math.random() * 10000000000000000))
      .should("have.attr", "maxlength", "15");
    cy.get(fdata.cr_No_Locator)
      .type(Math.floor(Math.random() * 1000000000000000))
      .should("have.attr", "maxlength", "6");
    cy.get(fdata.contact_No_Locator)
      .type(Math.floor("92333" + Math.floor(Math.random() * 10000000)))
      .should("have.attr", "maxlength", "15");
    cy.get(fdata.email_Address_Locator).type(
      "SaudiVendor" + Math.floor(Math.random() * 1000) + "@gmail.com"
    );
    cy.get(fdata.bank_Locator)
      .click()
      .get(fdata.saudi_Select_Bank_Locator)
      .click();
    cy.get(fdata.iban_Locator)
      .type("SA0380000000" + Math.floor(Math.random() * 100000000000000000))
      .should("have.attr", "maxlength", "24");
  }
}
export default vendorPage;

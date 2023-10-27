// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//

// -- This is a clickButton command --
Cypress.Commands.add("clickButton", (buttonLocator, forceData = null) => {
  return cy.get(buttonLocator).click(forceData);
});

// -- This is will Selects option from dropdown command --
Cypress.Commands.add(
  "selectFromDropdown",
  (selectElement, option = "" | null, forceData = null) => {
    // if no option is provided it will check the 1st 1 by def
    if (!option) {
      return cy
        .get(selectElement)
        .click(null)
        .get(`.ant-select-item.ant-select-item-option`)
        .siblings()
        .last({ log: false })
        .click(forceData);
    }
    return cy
      .get(selectElement)
      .click(null)
      .get(`.ant-select-item.ant-select-item-option[title='${option}']`)
      .children(".ant-select-item-option-content")
      .last({ log: false })
      .click(forceData);
  }
);

// -- This command will be used to type in input filed --
Cypress.Commands.add("typeIn", (inputElement, text = "" | null) => {
  return cy.get(inputElement).click(null).clear().type(text);
});

// -- This is to add Screenshots
Cypress.Commands.add("takeScreenshot", () => {
  cy.screenshot();
});
import "cypress-file-upload";

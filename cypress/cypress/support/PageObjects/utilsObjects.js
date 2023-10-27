const commonLocators = require("../../fixtures/common_locators.json");

// Payload for creating product on Hypr
const payload_template = {
  name: "dummy",
  price: 45,
  size: "30x30",
  unit: "kg",
  brand: "dummyBrand",
  urdu_name: "",
  urdu_size: "",
  urdu_brand: "",
  urdu_unit: "",
  disabled: 0,
  market_price: 40,
  barcode: "HYPR474192538",
  cost_price: 46,
  sku: "dummy",
  description: "dummy for testing ",
  tax_percent: 3,
  tax_category: 3,
  tax_inclusive: true,
  consent_required: true,
  location_id: "78",
  updated_by: 160,
  weight: 2,
  width: null,
  length: 2,
  height: 1,
  categories: [
    { id: 1438, product_priority: null },
    { id: 1439, product_priority: "maxPriority" },
  ],
};

const openURL = () => {
  cy.visit(Cypress.env("local_url"));
  // cy.visit(Cypress.env('dev_url'))
  // cy.visit(Cypress.env('stage_url'))
};

const closeURL = () => {
  cy.clickButton(commonLocators.menu_Locator);
  cy.clickButton(commonLocators.menu_Purchase_Locator);
};

const enterUserCredentials = () => {
  cy.typeIn(commonLocators.email_Locator, Cypress.env("userEmail")).wait(500);
  cy.typeIn(commonLocators.password_Locator, Cypress.env("userPassword")).wait(
    500
  );
  cy.clickButton(".bg-blue-blue2");
};

const productCreationOnHyper = (cy) => {
  let name = "doNotUseWMS" + Math.floor(Math.random() * 10000);
  let sku = "retailo-sku1" + " " + Math.floor(Math.random() * 10000);
  let payload = payload_template;
  payload.name = name;
  payload.sku = sku;
  cy.request({
    method: "POST",
    url: "https://stage.retailo.me/product/createProduct",
    headers: {
      authorization:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjI4LCJuYW1lIjoic2FyYSIsImFkZHJlc3MiOiIxMjMyMyIsInBob25lIjoiMDkwMDc4NjAxIiwiZW1haWwiOiIiLCJjbmljIjoiMTIzMTIzMTIzIiwiY25pY19waWN0dXJlIjpudWxsLCJ1c2VybmFtZSI6ImFkbWluIiwiZGlzYWJsZWQiOjAsInJvbGUiOnsiY3JlYXRlZF9hdCI6bnVsbCwidXBkYXRlZF9hdCI6bnVsbCwiZGVsZXRlZF9hdCI6bnVsbCwiaWQiOjEsIm5hbWUiOiJBRE1JTiIsImRpc2FibGVkIjpmYWxzZX0sImFjY2Vzc0hpZXJhcmNoeSI6IioiLCJzZXNzaW9uX3V1aWQiOiI5YTNiZmNiNi04OTY5LTQ0MWQtYTU1YS0wMmEyOWJlYzJlNWIiLCJpYXQiOjE2NTQ0OTkzMTAsImF1ZCI6Imh5cHIucGsiLCJpc3MiOiJoeXByLnBrIn0.XuZwSi7jT-7muxyrfdHbyxArUgRcsXX2m4ft0VFaTII",
    },
    body: payload,
  }).then((productID) => {
    cy.log(productID);
  });
  return name;
};

const splitQueryParams = (url) => {
  const params = url.split("?")[1]?.split("&");
  const paramObj = {};
  params.forEach((param) => {
    const [key, value] = param.split("=");
    paramObj[key] = value;
  });
  return paramObj;
};

const generateRandomNumber = () => {
  return Math.floor(Math.random() * 9999);
};

const validatePopupMessage = (validationText = "") => {
  cy.get(commonLocators.popupMessage)
    .invoke("text")
    .then((value) => {
      expect(value).to.equals(validationText);
    });
};

const validateRequiredFieldMessages = (element, validationText = "") => {
  // verify error message
  cy.get(element)
    .invoke("text")
    .then((value) => {
      expect(value.trim()).to.include(validationText);
    });
};

export {
  openURL,
  closeURL,
  enterUserCredentials,
  productCreationOnHyper,
  splitQueryParams,
  generateRandomNumber,
  validatePopupMessage,
  validateRequiredFieldMessages,
};

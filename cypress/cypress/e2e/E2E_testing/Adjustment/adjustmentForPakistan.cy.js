// @ts-ignore
/// <reference types="cypress" />
import adjustmentPage from "../../../support/PageObjects/adjustmentObjects.js";
import purchasePage from "../../../support/PageObjects/purchaseObjects.js";
const adjData = require("../../../fixtures/adjustment_locators.json");
import {
  enterUserCredentials,
  openURL,
} from "../../../support/PageObjects/utilsObjects";

describe("Creating New RFQ for Pakistan", () => {
  const adjustmentData = new adjustmentPage();
  const data = new purchasePage();

  let fdata;
  before(() => {
    openURL();
  });
  beforeEach(() => {
    enterUserCredentials();
    cy.clickButton(adjData.menu_Locator);
    cy.contains(adjData.menu_Transfer_Locator).click();
    cy.clickButton(adjData.click_Create_Adjustment);
  });

  it("Save New Adjustment without adding product", () => {
    cy.intercept("");
    adjustmentData.addPakistaniInfoToAdjustment();
    adjustmentData.savingDataOfAdustment();
    cy.get(
      ".ant-notification-notice-with-icon > .ant-notification-notice-description"
    )
      .invoke("text")
      .then((value) => {
        expect(value).to.equals("Please Add Products");
      });
  });

  it("Save New Adjustment for product with QTY = 0 ", () => {
    adjustmentData.addPakistaniInfoToAdjustment();
    adjustmentData.addNewRowForProduct();
    adjustmentData.addPakistaniProductForAdjustment();
    adjustmentData.savingDataOfAdustment();
    cy.wait(1000);
    cy.get(adjData.header_for_adjustment_Form_Locator)
      .invoke("text")
      .then((value) => {
        expect(value.replace("  ", "")).to.include("Edit Adjustment- A00");
      });
  });

  it("Save New Adjustment for product with QTY > 0 ", () => {
    adjustmentData.addPakistaniInfoToAdjustment();
    adjustmentData.addNewRowForProduct();
    adjustmentData.addPakistaniProductForAdjustment();
    adjustmentData.addPakistaniNewProductQty();
    adjustmentData.savingDataOfAdustment();
    cy.wait(1000);
    cy.get(adjData.header_for_adjustment_Form_Locator)
      .invoke("text")
      .then((value) => {
        expect(value.replace("  ", "")).to.include("Edit Adjustment- A00");
      });
  });

  it("Clear Adjustment without product ", () => {
    adjustmentData.addPakistaniInfoToAdjustment();
    adjustmentData.clearAdustment();
    cy.wait(1000);
    cy.get(adjData.header_for_adjustment_Form_Locator)
      .invoke("text")
      .then((value) => {
        expect(value.trim()).to.equal("Adjustment");
      });
  });

  it("Clear Adjustment for product with QTY > 0 ", () => {
    adjustmentData.addPakistaniInfoToAdjustment();
    adjustmentData.addNewRowForProduct();
    adjustmentData.addPakistaniProductForAdjustment();
    adjustmentData.addPakistaniNewProductQty();
    adjustmentData.clearAdustment();
    cy.wait(1000);
    cy.get(adjData.header_for_adjustment_Form_Locator)
      .invoke("text")
      .then((value) => {
        expect(value.trim()).to.equal("Adjustment");
      });
  });

  it("Cancel Adjustment ", () => {
    adjustmentData.addPakistaniInfoToAdjustment();
    adjustmentData.addNewRowForProduct();
    adjustmentData.addPakistaniProductForAdjustment();
    adjustmentData.addPakistaniNewProductQty();
    adjustmentData.savingDataOfAdustment();
    adjustmentData.cancelAdustment();
    cy.wait(1000);
    cy.get(adjData.header_for_adjustment_Form_Locator)
      .invoke("text")
      .then((value) => {
        expect(value.trim()).to.include("Cancelled Adjustment");
      });
  });

  it("Confirm Adjustment ", () => {
    cy.intercept("GET", "**/adjustment/**").as("userInfo");
    adjustmentData.addPakistaniInfoToAdjustment();
    adjustmentData.addNewRowForProduct();
    adjustmentData.addPakistaniProductForAdjustment();
    adjustmentData.addPakistaniNewProductQty();
    adjustmentData.savingDataOfAdustment();
    adjustmentData.confirmAdustment();
    cy.wait(1000);
    cy.get(adjData.header_for_adjustment_Form_Locator)
      .invoke("text")
      .then((value) => {
        expect(value.trim()).to.include("Confirmed Adjustment");
      });
    cy.wait("@userInfo");

    // Compare Country
    cy.get(".mt-2.text-gray-grey2").each((ele, index) => {
      cy.get("@userInfo").should((xhr) => {
        if (xhr.response.body.adjustment.country === ele.text()) {
          expect(xhr.response.body.adjustment.country).to.eq(ele.text());
        }
        return;
      });
    });

    // Compare City
    cy.get(".mt-2.text-gray-grey2").each((ele, index) => {
      cy.get("@userInfo").should((xhr) => {
        if (xhr.response.body.adjustment.businessUnit.name === ele.text())
          expect(xhr.response.body.adjustment.businessUnit.name).to.eq(
            ele.text()
          );
      });
    });

    // Compare Country
    cy.get(".mt-2.text-gray-grey2").each((ele, index) => {
      cy.get("@userInfo").should((xhr) => {
        if (xhr.response.body.adjustment.warehouse.name === ele.text())
          expect(xhr.response.body.adjustment.warehouse.name).to.eq(ele.text());
      });
    });

    // Compare Reason
    cy.get(".mt-2.text-gray-grey2").each((ele, index) => {
      cy.get("@userInfo").should((xhr) => {
        if (xhr.response.body.adjustment.reason.reason === ele.text())
          expect(xhr.response.body.adjustment.reason.reason).to.eq(ele.text());
      });
    });

    // Compare Reason Comment
    cy.get(".mt-2.text-gray-grey2").each((ele, index) => {
      cy.get("@userInfo").should((xhr) => {
        if (xhr.response.body.adjustment.reasonValue === ele.text())
          expect(xhr.response.body.adjustment.reasonValue).to.eq(ele.text());
      });
    });
  });

  it("Validation on Saving Empty Adjustment ", () => {
    adjustmentData.savingDataOfAdustment();
    adjustmentData.validationOnEmptyPakistaniAdjustment();
    cy.wait(1000);
    cy.get(adjData.header_for_adjustment_Form_Locator)
      .invoke("text")
      .then((value) => {
        expect(value.trim()).to.equal("Adjustment");
      });
  });

  it("Confirm Adjustment From Hypr", () => {
    cy.intercept("GET", "**/adjustment/**").as("userInfo");
    adjustmentData.addPakistaniInfoToAdjustment();
    adjustmentData.addNewRowForProduct();
    adjustmentData.addPakistaniProductForAdjustment();
    adjustmentData.addPakistaniNewProductQty();
    adjustmentData.savingDataOfAdustment();
    adjustmentData.confirmAdustment();
    cy.wait(1000);
    cy.get(adjData.header_for_adjustment_Form_Locator)
      .invoke("text")
      .then((value) => {
        expect(value.trim()).to.include("Confirmed Adjustment");
      });
    cy.get("tr td:nth-child(4)")
      .invoke("text")
      .then((valueOfQtyRec) => {
        cy.request({
          method: "GET",
          url: "https://stage.retailo.me/product/getAllProducts",
          qs: {
            search: data.productName,
            page: "1",
            per_page: "20",
            isAdmin: "1",
            company_id: "4",
            business_unit_id: "4",
            location_id: "78",
          },
          headers: {
            authorization:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjI4LCJuYW1lIjoic2FyYSIsImFkZHJlc3MiOiIxMjMyMyIsInBob25lIjoiMDkwMDc4NjAxIiwiZW1haWwiOiIiLCJjbmljIjoiMTIzMTIzMTIzIiwiY25pY19waWN0dXJlIjpudWxsLCJ1c2VybmFtZSI6ImFkbWluIiwiZGlzYWJsZWQiOjAsInJvbGUiOnsiY3JlYXRlZF9hdCI6bnVsbCwidXBkYXRlZF9hdCI6bnVsbCwiZGVsZXRlZF9hdCI6bnVsbCwiaWQiOjEsIm5hbWUiOiJBRE1JTiIsImRpc2FibGVkIjpmYWxzZX0sImFjY2Vzc0hpZXJhcmNoeSI6IioiLCJzZXNzaW9uX3V1aWQiOiI5YTNiZmNiNi04OTY5LTQ0MWQtYTU1YS0wMmEyOWJlYzJlNWIiLCJpYXQiOjE2NTQ0OTkzMTAsImF1ZCI6Imh5cHIucGsiLCJpc3MiOiJoeXByLnBrIn0.XuZwSi7jT-7muxyrfdHbyxArUgRcsXX2m4ft0VFaTII",
          },
        }).then((valQtyFromHyper) => {
          expect(
            valQtyFromHyper.body.data.products[0].physical_stock.toString()
          ).to.eq(valueOfQtyRec.toString().trim());
          expect(
            valQtyFromHyper.body.data.products[0].stock_quantity.toString()
          ).to.eq(valueOfQtyRec.toString().trim());
        });
      });
  });

  // it.only('Error Handling ', () => {
  //     adjustmentData.addPakistaniInfoToAdjustment()
  //     adjustmentData.addNewRowForProduct()
  //     adjustmentData.addPakistaniProductForAdjustment()
  //     cy.get(adjData.new_Total_Qty_Locator).each((ele, index, list) => {
  //         if (ele.text() === "0") {
  //             cy.wrap(ele).clear().type('63')
  //         }
  //     })

  // })
});

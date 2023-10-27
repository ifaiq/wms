/// <reference types="cypress" />
import { PurchaseOrderService } from "../../../support/PageObjects/purch-order-service.js";
import poLocators from "../../../fixtures/purch-order-locators.json";
import {
  openURL,
  enterUserCredentials,
  validatePopupMessage,
} from "../../../support/PageObjects/utilsObjects";

describe("Creating New RFQ for Pakistan", () => {
  const purchOrderService = new PurchaseOrderService();

  before(() => {
    openURL();
  });

  beforeEach(() => {
    enterUserCredentials();
    cy.wait(1000)
    cy.clickButton(poLocators.menu_Locator);
    cy.contains(poLocators.menu_Purchase_Locator).click();
    cy.clickButton(poLocators.click_Create_RFQ);
  });

  it("Save New RFQ without adding product ", () => {
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.savingDataRFQ();
    cy.get(poLocators.Heading_Locator).should(
      "have.text",
      "Edit RFQ"
    );
  });

  it("Save New RFQ with adding product with zero QTY ", () => {
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.savingDataRFQ();
    cy.get(poLocators.Heading_Locator).should(
      "have.text",
      "Edit RFQ"
    );
  });

  it("Save New RFQ with adding product with QTY ", () => {
    cy.intercept("GET", "**/purchase-orders/**").as("userInfo");
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.addPakistaniProductQty();
    purchOrderService.savingDataRFQ();
    cy.get(poLocators.Heading_Locator).should(
      "have.text",
      "Edit RFQ"
    );
    cy.wait("@userInfo");
    // Price per Unit
    cy.get(".ant-table-row > :nth-child(4) > div")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.purchaseOrder.products[0].price).to.eq(
            value.trim()
          );
        });
      });
    // MRP per Unit
    cy.get(".ant-table-row > :nth-child(5) > div")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.purchaseOrder.products[0].mrp).to.eq(
            value.trim()
          );
        });
      });
    // Subtotal
    cy.get(".ant-table-row > :nth-child(6)")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.purchaseOrder.subTotalWithoutTax).to.eq(
            value.trim()
          );
        });
      });
    // Grand Total
    cy.get(".ant-table-row > :nth-child(8)")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.purchaseOrder.totalWithTax).to.eq(
            value.trim()
          );
        });
      });
  });

  it("Clear the newly RFQ with adding product with QTY ", () => {
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.addPakistaniProductQty();
    purchOrderService.clearingDataRFQ();
    cy.get(poLocators.Heading_Locator).should(
      "have.text",
      "Create an RFQ"
    );
  });

  it("Confirm the newly RFQ with adding product with QTY (PO)", () => {
    cy.intercept("GET", "**/purchase-orders/**").as("userInfo");
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.addPakistaniProductQty();
    purchOrderService.savingDataRFQ();
    purchOrderService.confirmDataRFQ();
    cy.get(poLocators.Heading_Locator).should(
      "have.text",
      "Purchase Order"
    );
    cy.wait("@userInfo");

    // Compare Type of PO
    cy.get(":nth-child(1) > :nth-child(1) > .text-sm")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.purchaseOrder.type).to.eq(value.trim());
        });
      });

    // Compare Select Country
    cy.get(
      ":nth-child(2) > .justify-between > :nth-child(1) > :nth-child(2) > .text-sm"
    )
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.purchaseOrder.country).to.eq(value.trim());
        });
      });

    // Compare Select City
    cy.get(":nth-child(3) > .text-sm")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.purchaseOrder.businessUnit.name).to.eq(
            value.trim()
          );
        });
      });

    // Compare Select Warehouse
    cy.get(":nth-child(1) > :nth-child(4) > .text-sm")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.purchaseOrder.warehouse.name).to.eq(
            value.trim()
          );
        });
      });

    // Compare Select Vendor
    cy.get(":nth-child(2) > :nth-child(1) > .text-sm")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.purchaseOrder.vendor.name).to.eq(
            value.trim()
          );
        });
      });

    // Compare Currency
    cy.get(":nth-child(2) > :nth-child(4) > .text-sm")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect("PKR").to.eq(value.trim());
        });
      });

    // Compare Payment Type
    cy.get(":nth-child(3) > :nth-child(1) > .text-sm")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.purchaseOrder.payment).to.eq(value.trim());
        });
      });

    // Compare Payment Days
    cy.get(":nth-child(3) > :nth-child(2) > .text-sm")
      .invoke("text")
      .then((value) => {
        cy.get("@userInfo").should((xhr) => {
          expect(xhr.response.body.purchaseOrder.paymentDays).to.eq(
            value.trim()
          );
        });
      });
    //   end here
  });

  it("Cancel the newly RFQ with adding product with QTY (PO)", () => {
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.addPakistaniProductQty();
    purchOrderService.savingDataRFQ();
    purchOrderService.cancelDataRFQ();
    cy.get(poLocators.Heading_Locator).should(
      "have.text",
      "Cancelled RFQ"
    );
  });

  it("Unlock the newly RFQ with adding product with QTY ", () => {
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.addPakistaniProductQty();
    purchOrderService.savingDataRFQ();
    purchOrderService.confirmDataRFQ();
    purchOrderService.unlockRFQ();
    cy.get(poLocators.Heading_Locator).should(
      "have.text",
      "Edit Purchase Order"
    );
  });

  it("Lock the newly RFQ with adding product with QTY ", () => {
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.addPakistaniProductQty();
    purchOrderService.savingDataRFQ();
    purchOrderService.confirmDataRFQ();
    purchOrderService.unlockRFQ();
    purchOrderService.lockRFQ();
    cy.get(poLocators.Heading_Locator).should(
      "have.text",
      "Purchase Order"
    );
  });

  it("Moving to View Receipts to the newly RFQ ", () => {
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.addPakistaniProductQty();
    purchOrderService.savingDataRFQ();
    purchOrderService.confirmDataRFQ();
    purchOrderService.viewReciptsRFQ();
  });

  it("Cancel GRN ", () => {
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.addPakistaniProductQty();
    purchOrderService.savingDataRFQ();
    purchOrderService.confirmDataRFQ();
    purchOrderService.viewReciptsRFQ();
    purchOrderService.cancelGRN();
    cy.go(-2).wait(1000);
    cy.get("tr td:nth-child(4)")
      .invoke("text")
      .then((valueOfQtyRec) => {
        cy.request({
          method: "GET",
          url: "https://stage.retailo.me/product/getAllProducts",
          qs: {
            search: purchOrderService.productName,
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

  it("Confirm GRN without location", () => {
    purchOrderService.createPO();
    purchOrderService.confirmGRN();
    cy.wait(1000);
    validatePopupMessage("Please select a location before confirming GRN");
  });

  it("Confirm GRN with location", () => {
    purchOrderService.confirmGRNWithSubLocation();
    cy.go(-2).wait(2500);
    cy.get("tr td:nth-child(4)")
      .invoke("text")
      .then((valueOfQtyRec) => {
        cy.request({
          method: "GET",
          url: "https://stage.retailo.me/product/getAllProducts",
          qs: {
            search: purchOrderService.productName,
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

  it("Cancel Return Order ", () => {
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.addPakistaniProductQty();
    purchOrderService.savingDataRFQ();
    purchOrderService.confirmDataRFQ();
    purchOrderService.viewReciptsRFQ();
    purchOrderService.confirmGRN();
    purchOrderService.cancelReturnGRN();
    cy.go(-3).wait(1000);
    cy.get("tr td:nth-child(4)")
      .invoke("text")
      .then((valueOfQtyRec) => {
        cy.request({
          method: "GET",
          url: "https://stage.retailo.me/product/getAllProducts",
          qs: {
            search: purchOrderService.productName,
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

  it("Confirm Return Order ", () => {
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.addPakistaniProductQty();
    purchOrderService.savingDataRFQ();
    purchOrderService.confirmDataRFQ();
    purchOrderService.viewReciptsRFQ();
    purchOrderService.confirmGRN();
    purchOrderService.confirmReturnGRN();
    cy.go(-3).wait(1000);
    cy.get("tr td:nth-child(4)")
      .invoke("text")
      .then((valueOfQtyRec) => {
        cy.request({
          method: "GET",
          url: "https://stage.retailo.me/product/getAllProducts",
          qs: {
            search: purchOrderService.productName,
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

  it("Cancel Back Order", () => {
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.addPakistaniProductQty();
    purchOrderService.savingDataRFQ();
    purchOrderService.confirmDataRFQ();
    purchOrderService.viewReciptsRFQ();
    purchOrderService.cancelBackOrder();
    cy.go(-2).wait(1000);
    cy.get("tr td:nth-child(4)")
      .invoke("text")
      .then((valueOfQtyRec) => {
        cy.request({
          method: "GET",
          url: "https://stage.retailo.me/product/getAllProducts",
          qs: {
            search: purchOrderService.productName,
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

  it("Confirm Back Order", () => {
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.addPakistaniProductQty();
    purchOrderService.savingDataRFQ();
    purchOrderService.confirmDataRFQ();
    purchOrderService.viewReciptsRFQ();
    purchOrderService.confirmBackOrder();
    cy.go(-1).wait(1000);
    cy.get("tr td:nth-child(4)")
      .invoke("text")
      .then((valueOfQtyRec) => {
        cy.request({
          method: "GET",
          url: "https://stage.retailo.me/product/getAllProducts",
          qs: {
            search: purchOrderService.productName,
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

  it("Print button on Confirming RFQ", () => {
    cy.intercept("GET", "**/purchase-orders/download/**").as("userInfo");
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.addPakistaniProductQty();
    purchOrderService.savingDataRFQ();
    purchOrderService.confirmDataRFQ();
    purchOrderService.printButtonOnRFQ();
    cy.wait("@userInfo");
    cy.get("@userInfo").should((xhr) => {
      expect(xhr.response.statusCode.toString()).to.eq("200");
    });
  });

  it("Print button on GRN Screen", () => {
    cy.intercept("GET", "**/receipts/**").as("userInfo");
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.addPakistaniProductQty();
    purchOrderService.savingDataRFQ();
    purchOrderService.confirmDataRFQ();
    purchOrderService.viewReciptsRFQ();
    purchOrderService.moveToGRN();
    purchOrderService.printButtonOnRFQ();
    cy.wait("@userInfo");
    cy.get("@userInfo").should((xhr) => {
      expect(xhr.response.statusCode.toString()).to.eq("200");
    });
  });

  it("Print button on Confirming GRN", () => {
    cy.intercept("GET", "**/receipts/**").as("userInfo");
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.addPakistaniProductQty();
    purchOrderService.savingDataRFQ();
    purchOrderService.confirmDataRFQ();
    purchOrderService.viewReciptsRFQ();
    purchOrderService.confirmGRN();
    purchOrderService.printButtonOnRFQ();
    cy.wait("@userInfo");
    cy.get("@userInfo").should((xhr) => {
      expect(xhr.response.statusCode.toString()).to.eq("200");
    });
  });

  it("Upload file", () => {
    purchOrderService.addPakistaniInfoToRFQ();
    purchOrderService.addNewRowForProduct();
    purchOrderService.addPakistaniProductToRFQ();
    purchOrderService.addPakistaniProductQty();
    purchOrderService.savingDataRFQ();
    purchOrderService.confirmDataRFQ();
    purchOrderService.viewReciptsRFQ();
    cy.get("tr td:nth-child(5)").each((ele, index) => {
      if (ele.text().includes("READY")) {
        cy.wrap(ele).contains("READY").click().wait(1000);
        // cy.get(poLocators.all_Button_Locator).contains("Confirm").click().wait(1000)
      }
      const filepath = "laptop.png";
      cy.get("input[type = 'file']").attachFile(filepath);
    });
  });
});

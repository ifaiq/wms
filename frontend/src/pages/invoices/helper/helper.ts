import { INVOICE_STATUS, S_INV_KEYS } from 'src/constants/invoice';

const { QTY, PRC_PER_UNIT } = S_INV_KEYS;

export const getTotalWOTax = (product: TObject) => {
  const qty = Number(product[QTY]) || 0;
  const price = Number(product[PRC_PER_UNIT]) || 0;
  return Number(qty * price);
};

export const calculateTaxedAmount = (product: TObject) => {
  const { subTotalWithoutTax, grandTotalWithTax } = product;
  const result = Number(grandTotalWithTax) - Number(subTotalWithoutTax);
  return result.toFixed(2);
};

export const getInvoiceStatusObject = () => {
  const data = Object.entries(INVOICE_STATUS).map((item: Array<string>) => {
    return { id: item[0], name: item[1].replace('_', ' ') };
  });

  return data;
};

export const calculateInvoiceTotals = (lineItems: TArrayOfObjects) => {
  let totalWithoutTax = 0;
  let totalWithTax = 0;
  lineItems.forEach((lineItem) => {
    totalWithoutTax =
      Number(totalWithoutTax) + Number(lineItem.subTotalWithoutTax);
    totalWithTax = Number(totalWithTax) + Number(lineItem.grandTotalWithTax);
  });
  const totalTax = Number(totalWithTax) - Number(totalWithoutTax);
  return {
    totalDueWOTax: totalWithoutTax,
    totalTaxDue: totalTax,
    totalDueWTax: totalWithTax
  };
};

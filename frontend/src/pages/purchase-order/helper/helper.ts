import Decimal from 'decimal.js';
import { PO_STATUS } from 'src/constants/purchase-order';

export const handleProductCalculations = (product: TObject) => {
  const productQuantity = new Decimal(product.quantity || 0);
  const price = new Decimal(product.price || 0);
  const mrp = new Decimal(product.mrp || 0);
  const taxAmount = new Decimal(product.taxAmount || product?.tax || 0);

  let subtotal = new Decimal(0);
  let grandTotal = new Decimal(0);

  subtotal = Decimal.mul(productQuantity, price);
  grandTotal = taxAmount
    ? Decimal.sum(subtotal, Decimal.mul(taxAmount, productQuantity))
    : subtotal;

  product.price = price.toNumber();
  product.mrp = mrp.toNumber();
  product.taxAmount = taxAmount.toNumber();
  product.quantity = productQuantity.toNumber();
  product.subTotalWithoutTax = subtotal.toNumber();
  product.subTotalWithTax = grandTotal.toNumber();

  return product;
};

export const calculateTotalAmounts = (products: TArrayOfObjects) => {
  let subTotalWithoutTax = new Decimal(0);
  let totalTaxAmount = new Decimal(0);
  let totalWithTax = new Decimal(0);

  if (products.length > 0) {
    products.forEach((item: TObject) => {
      subTotalWithoutTax = Decimal.sum(
        subTotalWithoutTax,
        item?.subTotalWithoutTax
      );
      totalTaxAmount = Decimal.sum(totalTaxAmount, item?.taxAmount ?? 0);
      totalWithTax = Decimal.sum(totalWithTax, item?.subTotalWithTax);
    });
  }

  return {
    subTotalWithoutTax: subTotalWithoutTax.toNumber(),
    totalTaxAmount: totalTaxAmount.toNumber(),
    totalWithTax: totalWithTax.toNumber()
  };
};

export const setActiveStage = (stages: IStages[], status: string) =>
  stages.map((stage) => {
    if (stage.title.toLowerCase() === status.toLowerCase().replace('_', ' ')) {
      stage = { ...stage, status: 'process' };
    } else {
      stage = { ...stage, status: 'wait' };
    }

    return stage;
  });

export const getPOStatusObject = () => {
  const data = Object.entries(PO_STATUS).map((item: Array<string>) => {
    return { id: item[0], name: item[1].replace('_', ' ') };
  });

  return data;
};

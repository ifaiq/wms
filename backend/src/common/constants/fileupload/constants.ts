const MAX_FILE_SIZE = 20 * 1024 * 1024;

//Enum to check RFQ File format. All properties must be in lowercase
enum RFQFileCorrectFormat {
  sku = 'sku',
  name = 'name',
  quantity = 'quantity',
  price = 'price',
  mrp = 'mrp'
}

//Enum to check Adjustment ile format. All properties must be in lowercase
enum AdjustFileFormatForInitialCount {
  sku = 'sku',
  actualquantity = 'actualquantity'
}

enum TransferFileCorrectFormat {
  sku = 'sku',
  transferquantity = 'transferquantity'
}

enum AdjustmentFileCorrectFormat {
  sku = 'sku',
  differencequantity = 'differencequantity'
}

enum VendorUploadFileCorrectFormat {
  vendorname = 'vendorname',
  company = 'company',
  designation = 'designation',
  address = 'address',
  country = 'country',
  taxid = 'taxid',
  strn = 'strn',
  crnumber = 'crnumber',
  phone = 'phone',
  email = 'email',
  bankname = 'bankname',
  iban = 'iban',
  type = 'type'
}

enum BulkUploadPurchaseOrderFormat {
  srnumber = 'srnumber',
  warehouseid = 'warehouseid',
  vendorid = 'vendorid',
  currency = 'currency',
  paymenttype = 'paymenttype',
  paymentdays = 'paymentdays',
  skucode = 'skucode',
  skuname = 'skuname',
  quantityordered = 'quantityordered',
  priceperunit = 'priceperunit',
  mrp = 'mrp'
}

enum BulkUploadAdjustmentFormat {
  srnumber = 'srnumber',
  warehouseid = 'warehouseid',
  locationid = 'locationid',
  reasonid = 'reasonid',
  reason = 'reason',
  reasoncomment = 'reasoncomment',
  skucode = 'skucode',
  skuname = 'skuname',
  quantity = 'quantity',
  postingdate = 'postingdate'
}

enum BulkUploadTransferFormat {
  srnumber = 'srnumber',
  warehouseid = 'warehouseid',
  fromlocationid = 'fromlocationid',
  tolocationid = 'tolocationid',
  reasonid = 'reasonid',
  reason = 'reason',
  reasoncomment = 'reasoncomment',
  skucode = 'skucode',
  skuname = 'skuname',
  transferstock = 'transferstock'
}

export {
  MAX_FILE_SIZE,
  RFQFileCorrectFormat,
  AdjustmentFileCorrectFormat,
  VendorUploadFileCorrectFormat,
  TransferFileCorrectFormat,
  BulkUploadPurchaseOrderFormat,
  AdjustFileFormatForInitialCount,
  BulkUploadAdjustmentFormat,
  BulkUploadTransferFormat
};

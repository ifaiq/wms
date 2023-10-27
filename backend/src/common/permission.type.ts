export enum DecoratorTypes {
  Permission = 'permission'
}

export enum Permission {
  // Vendor
  CREATE_VENDOR = 'CREATE_VENDOR',
  CANCEL_VENDOR = 'CANCEL_VENDOR',
  EDIT_VENDOR = 'EDIT_VENDOR',
  CONFIRM_VENDOR = 'CONFIRM_VENDOR',
  LOCK_UNLOCK_VENDOR = 'LOCK_UNLOCK_VENDOR',
  STATUS_VENDOR = 'STATUS_VENDOR',
  // PO
  CREATE_PO = 'CREATE_PO',
  CANCEL_PO = 'CANCEL_PO',
  EDIT_PO = 'EDIT_PO',
  CONFIRM_PO = 'CONFIRM_PO',
  LOCK_UNLOCK_PO = 'LOCK_UNLOCK_PO',
  // GRN
  CANCEL_GRN = 'CANCEL_GRN',
  EDIT_GRN = 'EDIT_GRN',
  CONFIRM_GRN = 'CONFIRM_GRN',
  // Return
  CREATE_RETURN = 'CREATE_RETURN',
  CANCEL_RETURN = 'CANCEL_RETURN',
  EDIT_RETURN = 'EDIT_RETURN',
  CONFIRM_RETURN = 'CONFIRM_RETURN',
  // adjusment
  CREATE_ADJUSTMENT = 'CREATE_ADJUSTMENT',
  CANCEL_ADJUSTMENT = 'CANCEL_ADJUSTMENT',
  EDIT_ADJUSTMENT = 'EDIT_ADJUSTMENT',
  CONFIRM_ADJUSTMENT = 'CONFIRM_ADJUSTMENT',
  // Misc
  EDIT_PROD_DETAILS = 'EDIT_PROD_DETAILS',
  ADD_EDIT_PAYMENT = 'ADD_EDIT_PAYMENT',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  // transfers
  CREATE_TRANSFER = 'CREATE_TRANSFER',
  CANCEL_TRANSFER = 'CANCEL_TRANSFER',
  EDIT_TRANSFER = 'EDIT_TRANSFER',
  CONFIRM_TRANSFER = 'CONFIRM_TRANSFER',
  // location
  CREATE_LOCATION = 'CREATE_LOCATION',
  EDIT_LOCATION = 'EDIT_LOCATION',
  LOCATION_STATUS = 'LOCATION_STATUS',
  // invoices
  CREATE_INVOICE = 'CREATE_INVOICE',
  APPROVE_INVOICE = 'APPROVE_INVOICE'
}
import {
  Country,
  POStatus,
  PrismaClient,
  ReasonType,
  VendorStatus,
  VendorType,
  InvoiceDocumentTypes
} from '@prisma/client';
import { hash } from 'bcrypt';
import { saltLength } from '../src/auth/constants';
import { Permission } from '../src/common';
const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      password: await hash('password', saltLength),
      name: 'Joe Root',
      email: 'joeroot@gmail.com'
    },
    {
      password: await hash('password', saltLength),
      name: 'Mathew Wade',
      email: 'mathewwade@gmail.com'
    }
  ];

  await prisma.user.createMany({ data: users });

  const vendors = [
    {
      name: 'Nestle',
      type: VendorType.COMPANY,
      country: Country.PAK,
      taxID: '1111111-1',
      company: 'Nestle',
      address: 'Nestle Head Office Karachi',
      phone: '051-5582463',
      email: 'nestle@nestle.com',
      jobPosition: 'Warehouse Exective',
      bankAccounts: [
        {
          bank: 'ALLIED BANK LIMITED',
          accountNumber: '10021171'
        },
        {
          bank: 'HABIB BANK LIMITED',
          accountNumber: '111112107'
        }
      ],
      attachment: [],
      status: VendorStatus.LOCKED
    },
    {
      name: 'Engro',
      type: VendorType.COMPANY,
      country: Country.SAUDI,
      taxID: '1111111-1',
      company: 'Engro',
      address: 'Engro Head Office Jeddah',
      phone: '051-5582463',
      email: 'engro@engro.com',
      jobPosition: 'Warehouse Exective',
      bankAccounts: [
        {
          bank: 'ALLIED BANK LIMITED',
          accountNumber: '10021171'
        },
        {
          bank: 'HABIB BANK LIMITED',
          accountNumber: '111112107'
        }
      ],
      attachment: []
    }
  ];

  await prisma.vendor.createMany({ data: vendors });

  const purchaseOrder = [
    {
      country: Country.PAK,
      businessUnitId: 4,
      warehouseId: 13,
      purchaserId: 1,
      vendorId: 1,
      status: POStatus.IN_REVIEW,
      subTotalWithoutTax: 800,
      totalTaxAmount: 200,
      totalWithTax: 1000
    },
    {
      country: Country.PAK,
      businessUnitId: 4,
      warehouseId: 13,
      purchaserId: 1,
      vendorId: 1,
      status: POStatus.IN_REVIEW,
      subTotalWithoutTax: 800,
      totalTaxAmount: 200,
      totalWithTax: 1000
    }
  ];

  await prisma.purchaseOrder.createMany({ data: purchaseOrder });

  const products = [
    {
      productId: 1,
      poId: 1,
      sku: 'milkpack-001-1l',
      name: 'Milkpak',
      taxAmount: 7.5,
      subTotalWithoutTax: 500.0,
      subTotalWithTax: 537.5,
      quantity: 5,
      price: 100
    },
    {
      productId: 2,
      poId: 1,
      sku: 'milkpack-002-1.5l',
      name: 'Milkpak',
      taxAmount: 10,
      subTotalWithoutTax: 480.0,
      subTotalWithTax: 450.0,
      quantity: 3,
      price: 150
    },
    {
      productId: 1,
      poId: 2,
      sku: 'milkpack-001-1l',
      name: 'Milkpak',
      taxAmount: 7.5,
      subTotalWithoutTax: 500.0,
      subTotalWithTax: 537.5,
      quantity: 5,
      price: 100
    },
    {
      productId: 2,
      poId: 2,
      sku: 'milkpack-002-1.5l',
      name: 'Milkpak',
      taxAmount: 10,
      subTotalWithoutTax: 480.0,
      subTotalWithTax: 450.0,
      quantity: 3,
      price: 150
    }
  ];

  await prisma.purchaseOrderProduct.createMany({ data: products });

  const roles = [
    {
      name: 'superadmin',
      permissions: [...Object.values(Permission)],
      createdById: 1
    },
    {
      name: 'administrator',
      permissions: [
        Permission.CREATE_VENDOR,
        Permission.EDIT_VENDOR,
        Permission.CONFIRM_VENDOR,
        Permission.LOCK_UNLOCK_VENDOR
      ],
      createdById: 1
    }
  ];

  await prisma.role.createMany({ data: roles });

  const userRoles = [
    {
      userID: 1,
      roleID: 1
    },
    {
      userID: 2,
      roleID: 2
    }
  ];

  await prisma.userRole.createMany({ data: userRoles });

  const reasons = [
    {
      type: ReasonType.RETURN,
      reason: 'Damages'
    },
    {
      type: ReasonType.RETURN,
      reason: 'Projection'
    },
    {
      type: ReasonType.RETURN,
      reason: 'Return to Vendor'
    },
    {
      type: ReasonType.ADJUSTMENT,
      reason: 'Stock Count Adjustments'
    },
    {
      type: ReasonType.ADJUSTMENT,
      reason: 'Damages'
    },
    {
      type: ReasonType.ADJUSTMENT,
      reason: 'Pickshort'
    },
    {
      type: ReasonType.ADJUSTMENT,
      reason: 'Wrong GRN'
    },
    {
      type: ReasonType.ADJUSTMENT,
      reason: 'Expired Stock'
    },
    {
      type: ReasonType.ADJUSTMENT,
      reason: 'Wrong Batch Closure'
    },
    {
      type: ReasonType.ADJUSTMENT,
      reason: 'SKU Code change'
    },
    {
      type: ReasonType.ADJUSTMENT,
      reason: 'Other'
    },
    {
      type: ReasonType.ADJUSTMENT,
      reason: 'Initial Count'
    },
    {
      type: ReasonType.RETURN_IN,
      reason: 'Other'
    },
    {
      type: ReasonType.TRANSFER,
      reason: 'Expired Stock'
    },
    {
      type: ReasonType.TRANSFER,
      reason: 'Other'
    },
    {
      type: ReasonType.ADJUSTMENT,
      reason: 'INITIAL_COUNT'
    }
  ];

  await prisma.reason.createMany({ data: reasons });

  const locations = [
    {
      name: 'damages',
      country: Country.PAK,
      businessUnitId: 1,
      warehouseId: 1,
      warehouseName: 'Shah-Faisal',
      availableForSale: false,
      grnApplicable: false,
      returnApplicable: true,
      priority: 2,
      createdById: 1
    },
    {
      name: 'staging',
      country: Country.PAK,
      businessUnitId: 1,
      warehouseId: 1,
      warehouseName: 'Shah-Faisal',
      availableForSale: true,
      grnApplicable: true,
      returnApplicable: false,
      priority: 3,
      createdById: 1
    },
    {
      name: 'no damages',
      country: Country.PAK,
      businessUnitId: 1,
      warehouseId: 1,
      warehouseName: 'Shah-Faisal',
      availableForSale: false,
      grnApplicable: true,
      returnApplicable: false,
      priority: 3,
      createdById: 1
    }
  ];

  await prisma.location.createMany({ data: locations });

  const inventory = [
    {
      country: Country.PAK,
      businessUnitId: 1,
      warehouseId: 2,
      locationId: 1,
      createdById: 1,
      productId: 1,
      physicalQuantity: 5
    },
    {
      country: Country.PAK,
      businessUnitId: 1,
      warehouseId: 2,
      locationId: 2,
      createdById: 1,
      productId: 1,
      physicalQuantity: 3
    }
  ];

  await prisma.inventory.createMany({ data: inventory });

  const draftInvoice = {
    type: InvoiceDocumentTypes.SERVICE,
    createdById: 1,
    vendorId: 1,
    detail : {
      'type': InvoiceDocumentTypes.SERVICE
    }

  }
  await prisma.draftInvoice.create({ data: draftInvoice })
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

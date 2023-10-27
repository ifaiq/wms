import { Injectable } from '@nestjs/common';
import { PurchaseOrderService } from 'src/purchase-order/purchase-order.service';
import { VendorService } from 'src/vendor/vendor.service';
import { PrismaService } from 'prisma/prisma.service';
import { FetchReason, ReasonRequest } from './dto';
import { ReceiptService } from 'src/receipt/receipt.service';
import { AdjustmentService } from 'src/adjustment/adjustment.service';
import { OpensearchService } from 'src/opensearch/opensearch.service';
import {
  openSearchIndexKey,
  TRANSFERS,
  VendorUploadFileCorrectFormat
} from 'src/common/constants';
import { FileuploadService } from 'src/fileupload/fileupload.service';
import { VendorRequest } from 'src/vendor/dto';
import { Prisma, VendorStatus } from '.prisma/client';
import { extractVendorFromFileName } from 'src/common';
import { EventService } from 'src/event/event.service';
import { UserService } from 'src/user/user.service';
import { LocationService } from 'src/location/location.service';
import { TransferService } from 'src/transfer/transfer.service';
const { Vendor: vendorModel, Reason: reasonModel } = Prisma.ModelName;

@Injectable()
export class AdminService {
  constructor(
    private readonly vendorService: VendorService,
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly receiptService: ReceiptService,
    private readonly adjustmentService: AdjustmentService,
    private readonly prisma: PrismaService,
    private readonly openSearchService: OpensearchService,
    private readonly fileUploadService: FileuploadService,
    private readonly eventService: EventService,
    private readonly userService: UserService,
    private readonly locationService: LocationService,
    private readonly transferService: TransferService
  ) {
    if (process.env.REFRESH_SEARCH_INDEX === '1') {
      this.refreshOpenSearchIndex();
    }
  }

  async refreshOpenSearchIndex() {
    await this.refreshVendorOpenSearchIndex();
    await this.refreshPurchaseOrderOpenSearchIndex();
    await this.refreshUserServiceOpenSearchIndex();
    await this.refreshLocationOpenSearchIndex();
    await this.refreshInventoryMovementOpenSearchIndex();
  }

  async healthCheck() {
    await this.prisma.$queryRaw`SELECT 1`;
    return;
  }

  async addReason(data: ReasonRequest) {
    return await this.prisma.reason.create({ data });
  }

  async updateReason(id: number, data: ReasonRequest, userId: number) {
    const updatedReasonPromise = this.prisma.reason.update({
      where: { id },
      data
    });

    const reasonEventLog = await this.eventService.generateEvents(
      id,
      data,
      reasonModel,
      userId
    );
    const [updatedReason] = await this.prisma.$transaction([
      updatedReasonPromise,
      ...reasonEventLog
    ]);

    return updatedReason;
  }

  async deleteReason(id: number) {
    return await this.prisma.reason.delete({
      where: { id }
    });
  }

  async fetchReasonsByType({ type }: FetchReason) {
    return await this.prisma.reason.findMany({
      where: { type: type }
    });
  }

  async bulkUploadVendors(file: Express.Multer.File) {
    const csvData = this.fileUploadService.parseCSVData(
      file,
      VendorUploadFileCorrectFormat
    );
    const parsedData: VendorRequest[] = [];
    for (const data of csvData) {
      const vendor = {
        name: data.vendorname,
        type: data.type,
        country: data.country,
        company: data.company || null,
        taxID: data.taxid || null,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        jobPosition: data.designation || null,
        crNumber: data.crnumber || null,
        strn: data.strn || null,
        status: VendorStatus.LOCKED,
        bankAccounts: [
          {
            bank: data.bankname,
            accountNumber: data.iban
          }
        ]
      };
      parsedData.push(vendor);
    }
    return await this.vendorService.createVendorsInBulk(parsedData);
  }

  async uploadAttachment(userId: number, file: Express.Multer.File) {
    const { vendorName, entity } = extractVendorFromFileName(file.originalname);
    const vendor: any = await this.vendorService.fetchVendor(
      {
        name: vendorName
      },
      {
        id: true
      }
    );
    file.fieldname = entity;
    const { updatedPayload, path } =
      await this.fileUploadService.uploadAttachment(
        file,
        vendor?.id as number,
        vendorModel
      );
    if (updatedPayload) {
      await this.vendorService.updateVendor(
        userId,
        vendor?.id as number,
        updatedPayload as any,
        false
      );
      return { path };
    }
    return { success: false };
  }

  async refreshVendorOpenSearchIndex() {
    await this.vendorService.addVendorsInOpenSearch();
  }

  async refreshPurchaseOrderOpenSearchIndex() {
    await this.purchaseOrderService.addPurchaseOrdersInOpenSearch();
  }

  async refreshUserServiceOpenSearchIndex() {
    await this.userService.addUsersInOpenSearch();
  }

  async refreshLocationOpenSearchIndex() {
    await this.locationService.addLocationsInOpenSearch();
  }

  async refreshInventoryMovementOpenSearchIndex() {
    //  Since adjustment, transfers and receipts have the same index and adding in bulk deletes the previous index
    //  so we combine them and add from admin service
    const [adjustment, receipts, transfers] = await Promise.all([
      this.adjustmentService.addAdjustmentsInOpenSearch(),
      this.receiptService.addReceiptsInOpenSearch(),
      this.transferService.addTransfersInOpenSearch()
    ]);
    await this.openSearchService.addInBulk(
      TRANSFERS,
      [...adjustment, ...receipts, ...transfers],
      openSearchIndexKey.index
    );
  }
}

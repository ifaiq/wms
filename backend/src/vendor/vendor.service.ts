import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Vendor, VendorStatus } from '@prisma/client';
import { EventService } from '../event/event.service';

import { PrismaService } from '../../prisma/prisma.service';
import { VendorRequest, FilterVendorsRequest, VendorSearchDto } from './dto';
import { OpensearchService } from 'src/opensearch/opensearch.service';
import { VENDORS } from 'src/common/constants';
import { CreateEvent } from 'src/event/dto/create-event.dto';
import { fileAttachment } from 'src/fileupload/utils/types';
import { ValidationFailedException } from 'src/errors/exceptions';

const { Vendor: vendorModel } = Prisma.ModelName;
interface IUpdateVendor {
  vendor: Vendor;
  event: CreateEvent;
}
@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
    private readonly event: EventService,
    private openSearch: OpensearchService
  ) {}

  async createVendor(data: VendorRequest): Promise<Vendor> {
    const vendor = await this.prisma.vendor.create({ data });
    await this.openSearch.addDocumentById(VENDORS, vendor);
    return vendor;
  }

  async deleteVendor(id: number): Promise<Vendor> {
    const vendor = await this.prisma.vendor.delete({
      where: {
        id
      }
    });
    await this.openSearch.deleteDocumentById(VENDORS, String(id));
    return vendor;
  }

  async getVendor(id: number): Promise<Vendor | null> {
    const vendor = await this.prisma.vendor.findUnique({
      where: {
        id
      }
    });
    this.removeKeyFromAttachments(vendor);
    return vendor;
  }

  async fetchVendor(
    whereInput: Prisma.VendorWhereUniqueInput,
    filter: Prisma.VendorSelect
  ) {
    return await this.prisma.vendor.findUnique({
      where: whereInput,
      select: filter
    });
  }

  async getAttachment(
    id: number
  ): Promise<{ attachment: Prisma.JsonValue } | null> {
    return await this.prisma.vendor.findUnique({
      where: {
        id
      },
      select: {
        attachment: true
      }
    });
  }

  async getVendors(reqParams: FilterVendorsRequest): Promise<{
    vendors: Vendor[];
    total: number;
  }> {
    const { name, company, type, country, taxID } = reqParams;
    const where: Prisma.VendorWhereInput = {
      name: { contains: name },
      company: { contains: company },
      type,
      country,
      taxID
    };
    const [vendors, total] = await this.prisma.$transaction([
      this.prisma.vendor.findMany({
        skip: reqParams.skip,
        take: reqParams.take,
        where
      }),
      this.prisma.vendor.count({ where })
    ]);

    this.removeKeyFromAttachments(vendors);
    return {
      vendors,
      total
    };
  }

  async updateVendor(
    userId: number,
    id: number,
    data: VendorRequest,
    checkVendorStatus = true
  ): Promise<IUpdateVendor> {
    if (checkVendorStatus)
      await this.checkVendorStatus(id, VendorStatus.IN_REVIEW);
    const vendorEventLog = await this.event.generateEvents(
      id,
      data,
      vendorModel,
      userId
    );
    const [vendor, event] = await this.prisma.$transaction([
      this.prisma.vendor.update({
        where: {
          id
        },
        data
      }),
      ...vendorEventLog
    ]);
    this.removeKeyFromAttachments(vendor);
    await this.openSearch.updateDocumentById(VENDORS, vendor);
    return { vendor, event };
  }

  async changeVendorStatus(
    userId: number,
    id: number,
    status: VendorStatus
  ): Promise<IUpdateVendor> {
    const vendorEventLog = await this.event.generateEvents(
      id,
      { status },
      vendorModel,
      userId
    );
    const [vendor, event] = await this.prisma.$transaction([
      this.prisma.vendor.update({
        where: {
          id
        },
        data: {
          status
        }
      }),
      ...vendorEventLog
    ]);
    this.removeKeyFromAttachments(vendor);
    await this.openSearch.updateDocumentById(VENDORS, vendor);
    return { vendor, event };
  }

  async getVendorStatus(id: number) {
    return await this.prisma.vendor.findFirst({
      where: {
        id
      },
      select: {
        status: true
      }
    });
  }

  private removeKeyFromAttachments(vendors: Vendor[] | Vendor | null) {
    if (vendors === null) return;
    if (Array.isArray(vendors)) {
      vendors.forEach((vendor) => {
        const attachments = vendor.attachment as fileAttachment[];
        if (attachments) {
          attachments.forEach((attachment) => {
            if (attachment.key) delete attachment.key;
          });
        }
      });
    } else {
      const attachments = vendors.attachment as fileAttachment[];
      if (attachments) {
        attachments.forEach((attachment) => {
          if (attachment.key) delete attachment.key;
        });
      }
    }
  }

  async addVendorsInOpenSearch(): Promise<any> {
    const vendors = await this.prisma.vendor.findMany();
    await this.openSearch.addInBulk(VENDORS, vendors);
  }

  async searchVendor(reqParams: VendorSearchDto): Promise<any | null> {
    const { type, country, name, taxID, phone, email, status, skip, take } =
      reqParams;
    return await this.openSearch.searchVendors(
      { type, country },
      { name, taxID, phone, email, status, skip, take },
      VENDORS
    );
  }

  async checkVendorStatus(id: number, status: VendorStatus) {
    const vendor = await this.getVendorStatus(id);
    if (vendor === null) {
      throw new NotFoundException('Vendor');
    }
    if (vendor?.status !== status) {
      throw new ValidationFailedException([
        { property: `Error processing vendor. Invalid State` }
      ]);
    }
  }

  async createVendorsInBulk(data: VendorRequest[]) {
    const vendors = await this.prisma.vendor.createMany({
      data,
      skipDuplicates: true
    });
    await this.addVendorsInOpenSearch();
    return vendors;
  }
}

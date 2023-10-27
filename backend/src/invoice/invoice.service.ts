import { Injectable } from '@nestjs/common';
import { DraftInvoice } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { SearchInvoiceDto } from './dto/invoice-search.dto';
import {
  CreateInvoiceDraftDto,
  UpdateDraftInvoiceDto
} from './dto/invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async getAllInvoiceDrafts(): Promise<DraftInvoice[]> {
    return await this.prisma.draftInvoice.findMany();
  }
  async createInvoiceDraft(
    draftInvoiceData: CreateInvoiceDraftDto
  ): Promise<DraftInvoice> {
    const createdDraft = await this.prisma.draftInvoice.create({
      data: draftInvoiceData
    });
    return createdDraft;
  }
  async deleteDraftInvoice(id: string) {
    return await this.prisma.draftInvoice.delete({
      where: {
        id: id
      }
    });
  }
  async updateDraftInvoice(
    id: string,
    data: UpdateDraftInvoiceDto
  ): Promise<DraftInvoice> {
    return await this.prisma.draftInvoice.update({
      where: { id },
      data
    });
  }

  async searchInvoice(reqParams: SearchInvoiceDto): Promise<any | null> {
    const { skip, take, type, till, from, vendor } = reqParams;
    const resTotal = await this.prisma.draftInvoice.findMany({
      where: {
        type: type,
        createdAt: {
          gte: from,
          lte: till
        },
        vendor: {
          name: {
            in: vendor
          }
        }
      }
    });

    const total = resTotal.length;

    const res = await this.prisma.draftInvoice.findMany({
      where: {
        type: type,
        createdAt: {
          gte: from,
          lte: till
        },
        vendor: {
          name: {
            in: vendor
          }
        }
      },
      skip,
      take
    });
    return { invoices: [...res], total: total };
  }
}

import { Logger, Injectable } from '@nestjs/common';
import { InventoryRequest } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryRequestDto } from './dto';

@Injectable()
export class InventoryRequestService {
  private readonly logger = new Logger(InventoryRequestService.name);
  constructor(private prisma: PrismaService) {}

  async createInventoryRequest(
    data: InventoryRequestDto
  ): Promise<InventoryRequest> {
    const context = `${this.createInventoryRequest.name}`;
    this.logger.log(
      `context: ${context}, message: Creating inventory request with param: ${JSON.stringify(
        data
      )}`
    );
    return await this.prisma.inventoryRequest.create({ data });
  }
}

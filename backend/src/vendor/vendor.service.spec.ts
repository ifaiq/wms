import { Test, TestingModule } from '@nestjs/testing';
import { Country, Vendor, VendorType } from '@prisma/client';
import { VendorService } from './vendor.service';
import { EventModule } from '../event/event.module';
import { MonolithModule } from '../monolith/monolith.module';
import { OpensearchModule } from '../opensearch/opensearch.module';
import { FileuploadModule } from '../fileupload/fileupload.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { OpensearchService } from 'src/opensearch/opensearch.service';
import { VENDORS } from 'src/common/constants';

describe('VendorService', () => {
  let service: VendorService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MonolithModule,
        EventModule,
        OpensearchModule,
        FileuploadModule,
        PrismaModule
      ],
      providers: [VendorService]
    }).compile();

    service = module.get<VendorService>(VendorService);
    const opensearchService = module.get<OpensearchService>(OpensearchService);
    await opensearchService.createIndex(VENDORS);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  let createdVendor: Vendor;
  const userId = 1;
  const requestPayload = {
    name: 'test1',
    type: VendorType.INDIVIDUAL,
    country: Country.PAK,
    taxID: '123',
    company: 'test1',
    address: 'address1',
    phone: '5555555555',
    email: 'test1@test.com',
    jobPosition: 'Manager',
    crNumber: '1',
    bankAccounts: [
      {
        bank: 'ALI HUSSAIN RAJABALI (BROKERS)',
        accountNumber: '111112107'
      }
    ],
    strn: ''
  };
  describe('Vendor Creation', () => {
    it('creates a new vendor', async () => {
      createdVendor = await service.createVendor(requestPayload);
      expect(createdVendor.id).toBeDefined();
      expect(createdVendor).toMatchObject(requestPayload);
    });
  });
  describe('Vendor Retrieval', () => {
    it('get a vendor by id', async () => {
      const vendor = await service.getVendor(createdVendor.id);
      expect(vendor?.id).toEqual(createdVendor.id);
    });

    it('get all vendors by Country', async () => {
      const { vendors } = await service.getVendors({
        skip: 0,
        take: 10,
        country: Country.PAK
      });
      expect(vendors[0].country).toEqual(requestPayload.country);
    });
  });

  describe('Vendor Updation', () => {
    it('update a vendor by id', async () => {
      const updatedPaylod = { ...requestPayload, phone: '6666666666' };
      const { vendor } = await service.updateVendor(
        userId,
        createdVendor.id,
        updatedPaylod
      );
      expect(vendor.phone).toEqual(updatedPaylod.phone);
      createdVendor = vendor;
    });
  });
  describe('Vendor Deletion', () => {
    it('deletes a vendor', async () => {
      const deletedVendor = await service.deleteVendor(createdVendor.id);
      expect(deletedVendor.id).toBeDefined();
    });
  });
});

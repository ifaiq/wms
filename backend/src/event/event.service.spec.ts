import { Test, TestingModule } from '@nestjs/testing';
import { Country, User, Vendor, VendorType } from '@prisma/client';
import { VendorModule } from '../vendor/vendor.module';
import { VendorService } from '../vendor/vendor.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { EventService } from './event.service';
import { UserService } from '../user/user.service';
import { VENDORS } from 'src/common/constants';
import { OpensearchService } from 'src/opensearch/opensearch.service';
import { UserModule } from 'src/user/user.module';
import { OpensearchModule } from 'src/opensearch/opensearch.module';

describe('EventService', () => {
  let service: EventService;
  let vendorService: VendorService;
  let userService: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, VendorModule, UserModule, OpensearchModule],
      providers: [EventService]
    }).compile();

    service = module.get<EventService>(EventService);
    vendorService = module.get<VendorService>(VendorService);
    userService = module.get<UserService>(UserService);
    const opensearchService = module.get<OpensearchService>(OpensearchService);
    await opensearchService.createIndex(VENDORS);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  let createdVendor: Vendor;
  let createdUser: User;
  const requestPayload = {
    name: 'test_event',
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

  const userRequestPayLoad = {
    name: 'Test User',
    email: 'test-user-email@email.com',
    password: '123456789',
    roles: []
  };

  it('creates a new event for vendor', async () => {
    createdVendor = await vendorService.createVendor(requestPayload);
    createdUser = (await userService.createUser(userRequestPayLoad)) as User;
    requestPayload.email = 'new-email@new.com';
    const { vendor, event } = await vendorService.updateVendor(
      createdUser.id,
      createdVendor.id,
      requestPayload
    );
    expect(createdVendor.email).toEqual(event.oldValue);
    expect(vendor.email).toEqual(event.newValue);
    await vendorService.deleteVendor(createdVendor.id);
    await userService.deleteUser(createdUser.id);
  });
});

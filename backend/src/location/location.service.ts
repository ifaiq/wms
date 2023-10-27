import { Injectable } from '@nestjs/common';
import {
  AdjustmentStatus,
  Country,
  Location,
  Prisma,
  ReasonType,
  ReceiptStatus,
  TransferStatus
} from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { LOCATIONS, DUMP_LOCATION, REASON } from 'src/common/constants';
import { BadRequestException } from 'src/errors/exceptions';
import { EventService } from 'src/event/event.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { CreateProductDumpLocation } from 'src/monolith/entities';
import { MonolithService } from 'src/monolith/monolith.service';
import { OpensearchService } from 'src/opensearch/opensearch.service';
import {
  CreateLocation,
  EditLocation,
  EditLocationStatus,
  FetchLocationDto,
  SearchLocationDto
} from './dto';

const { Location: locationModel } = Prisma.ModelName;

@Injectable()
export class LocationService {
  constructor(
    private prisma: PrismaService,
    private eventService: EventService,
    private openSearch: OpensearchService,
    private monolithService: MonolithService,
    private inventoryService: InventoryService
  ) {}

  async getLocation(id: number) {
    const location = await this.prisma.location.findUnique({
      where: {
        id
      }
    });

    if (location?.name === DUMP_LOCATION) {
      throw new BadRequestException(`Not allowed to view Staging location`);
    }

    if (location) {
      return location;
    }

    throw new BadRequestException(`No location found for id: ${id}`);
  }

  async getLocationsByIds(
    ids: number[],
    allowStagingLocation: boolean,
    showDisabled = false
  ) {
    const whereFilter: Prisma.LocationWhereInput = {
      id: { in: ids },
      disabled: showDisabled
    };

    if (showDisabled) {
      delete whereFilter.disabled;
    }

    if (!allowStagingLocation) {
      whereFilter.NOT = {
        name: DUMP_LOCATION
      };
    }

    const locations = await this.prisma.location.findMany({
      where: whereFilter
    });

    if (locations) {
      return locations;
    }

    throw new BadRequestException(`No location found`);
  }

  async getLocationsByType(reqParams: FetchLocationDto) {
    const {
      country,
      businessUnitId,
      warehouseId,
      allowStagingLocation = false,
      showDisabled = false,
      ...data
    } = reqParams;

    const _businessUnitId = Number(businessUnitId);
    const _warehouseId = Number(warehouseId);

    let whereFilter: Prisma.LocationWhereInput = {
      country,
      businessUnitId: _businessUnitId,
      warehouseId: _warehouseId,
      disabled: showDisabled,
      ...data
    };

    if (showDisabled) {
      delete whereFilter.disabled;
    }

    if (!allowStagingLocation) {
      whereFilter = {
        ...whereFilter,
        NOT: {
          name: DUMP_LOCATION
        }
      };
    }

    //All locations except the locationId in query params
    if (reqParams?.excludeLocationId) {
      const { excludeLocationId, ...locationData } = data;
      whereFilter = {
        NOT: {
          id: excludeLocationId
        },
        country,
        businessUnitId: _businessUnitId,
        warehouseId: _warehouseId,
        ...locationData,
        disabled: false
      };
    }

    if (country && warehouseId && businessUnitId) {
      const locations = await this.prisma.location.findMany({
        where: whereFilter
      });
      return locations;
    }
    throw new BadRequestException(
      `Invalid country: ${country}, warehouseId : ${warehouseId} or businessUnitId: ${businessUnitId}`
    );
  }

  async createLocation(data: CreateLocation & { createdById: number }) {
    let ancestry: string | null = null;

    if (data.name === DUMP_LOCATION) {
      throw new BadRequestException(
        `Cannot create location with name: ${DUMP_LOCATION}`
      );
    }

    if (data.parentId) {
      const result = await this.prisma.location.findUnique({
        where: {
          id: data.parentId
        },
        select: {
          ancestry: true,
          returnApplicable: true,
          disabled: true
        }
      });

      if (result === null) {
        throw new BadRequestException(
          `No parent location with id ${data.parentId} exists`
        );
      }

      if (result.disabled === true) {
        throw new BadRequestException(`Parent cannot be a disabled location`);
      }

      if (result.returnApplicable !== data.returnApplicable) {
        throw new BadRequestException(
          `Cofiguration of parent doesn't match with provided configuration`
        );
      }
      ancestry = (result.ancestry || '') + data.parentId + '/';
    }

    const locationWithPriority = await this.prisma.location.findFirst({
      where: {
        country: data.country,
        businessUnitId: data.businessUnitId,
        warehouseId: data.warehouseId
      },
      select: {
        priority: true
      },
      orderBy: {
        priority: 'desc'
      },
      take: 1
    });

    const { name: warehouseName } = await this.monolithService.GetLocationById(
      data.warehouseId
    );

    const location = await this.prisma.location.create({
      data: {
        ...data,
        priority: (locationWithPriority?.priority || 0) + 1,
        ancestry,
        warehouseName
      }
    });

    await this.upsertLocationInOpenSearch(location.id);
    return location;
  }

  async updateLocation(id: number, locationData: EditLocation, userId: number) {
    const updates = [];

    updates.push(
      this.prisma.location.update({
        where: {
          id
        },
        data: {
          ...locationData
        }
      })
    );

    const events = await this.eventService.generateEvents(
      id,
      locationData,
      locationModel,
      userId
    );

    const updatedLocation = await this.prisma.$transaction([
      ...updates,
      ...events
    ]);

    await this.upsertLocationInOpenSearch(id, true);
    return updatedLocation[0] as Location;
  }

  async addLocationsInOpenSearch(): Promise<any> {
    const locations = await this.prisma.location.findMany({
      include: {
        parent: {
          select: {
            name: true
          }
        }
      },
      where: {
        NOT: {
          name: DUMP_LOCATION
        }
      }
    });
    await this.openSearch.addInBulk(LOCATIONS, locations);
  }

  async upsertLocationInOpenSearch(id: number, isUpdateOperation = false) {
    const locationWithChildren = await this.prisma.location.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            name: true
          }
        },
        children: {
          include: {
            parent: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (locationWithChildren !== null) {
      const { children, ...location } = locationWithChildren;
      if (isUpdateOperation) {
        const updatesinOpenSearch = [];
        for (const child of children) {
          updatesinOpenSearch.push(
            this.openSearch.updateDocumentById(LOCATIONS, child)
          );
        }
        updatesinOpenSearch.push(
          this.openSearch.updateDocumentById(LOCATIONS, location)
        );
        await Promise.all(updatesinOpenSearch);
        return;
      }
      await this.openSearch.addDocumentById(LOCATIONS, location);
    }
  }

  async searchLocations(reqParams: SearchLocationDto): Promise<any | null> {
    const { country, businessUnitId, warehouseId, skip, take } = reqParams;
    return await this.openSearch.searchLocations(
      { country, businessUnitId, warehouseId },
      { skip, take },
      LOCATIONS
    );
  }

  async getLocationByWhere(where: Prisma.LocationWhereUniqueInput) {
    const location = await this.prisma.location.findUnique({
      where
    });

    if (location) {
      return location;
    }

    return null;
  }

  async getLocationByWhereAndInclude(
    where: Prisma.LocationWhereUniqueInput,
    include: Prisma.LocationInclude
  ) {
    const location = await this.prisma.location.findUnique({
      where,
      include
    });

    if (location) {
      return location;
    }

    return null;
  }

  async createProductDumpLocationForWarehouse(
    productDumpLocation: CreateProductDumpLocation
  ) {
    const [{ name: warehouseName }, lowestPriortyLocationWithInWarehouse] =
      await Promise.all([
        this.monolithService.GetLocationById(productDumpLocation.warehouseId),
        this.prisma.location.findMany({
          where: {
            warehouseId: productDumpLocation.warehouseId
          },
          select: {
            priority: true
          },
          orderBy: {
            priority: 'desc'
          },
          take: 1
        })
      ]);

    const location = await this.prisma.location.create({
      data: {
        ...productDumpLocation,
        availableForSale: true,
        grnApplicable: false,
        returnApplicable: false,
        warehouseName,
        priority: (lowestPriortyLocationWithInWarehouse[0]?.priority || 0) + 1,
        name: DUMP_LOCATION
      }
    });
    //Uncomment the line below when you want to add dump location in open search
    // await this.upsertLocationInOpenSearch(location.id);
    await this.prisma.reason.create({
      data: {
        reason: REASON.INITIAL_COUNT,
        type: ReasonType.TRANSFER
      }
    });
    return location;
  }

  async getChildren(ancestry: string, select: Prisma.LocationSelect) {
    return await this.prisma.location.findMany({
      where: {
        ancestry: {
          startsWith: ancestry
        }
      },
      select
    });
  }

  async isLastLocationofConfig(
    config: {
      availableForSale: boolean;
      grnApplicable: boolean;
      returnApplicable: boolean;
    },
    locationData: {
      businessUnitId: number;
      warehouseId: number;
      country: Country;
    },
    ancestry: string
  ) {
    const { availableForSale, grnApplicable, returnApplicable } = config;
    const count = await this.prisma.location.count({
      where: {
        availableForSale,
        grnApplicable,
        returnApplicable,
        ...locationData,
        OR: [
          {
            ancestry: {
              not: {
                startsWith: ancestry
              }
            }
          },
          { ancestry: null }
        ],
        name: {
          not: DUMP_LOCATION
        },
        disabled: false
      }
    });

    return count < 2 ? true : false;
  }

  async AreLocationsInPendingDocuments(locationIds: Array<number>) {
    const receipt = await this.prisma.receipt.findFirst({
      where: {
        locationId: {
          in: locationIds
        },
        status: ReceiptStatus.READY
      }
    });

    if (receipt) {
      throw new BadRequestException(
        `Some receipt(s) are in READY state for this location or its children`
      );
    }

    const returnReceipt = await this.prisma.returnReceipt.findFirst({
      where: {
        OR: [
          {
            receipt: {
              locationId: {
                in: locationIds
              }
            }
          },
          {
            locationId: {
              in: locationIds
            }
          }
        ],
        status: ReceiptStatus.READY
      }
    });

    if (returnReceipt) {
      throw new BadRequestException(
        `Some receipt(s) are in READY state for this location or its children`
      );
    }

    const adjustment = await this.prisma.adjustment.findFirst({
      where: {
        locationId: {
          in: locationIds
        },
        status: AdjustmentStatus.READY
      }
    });

    if (adjustment) {
      throw new BadRequestException(
        `Some adjustment(s) are in READY state for this location or its children`
      );
    }

    const transfer = await this.prisma.transfer.findFirst({
      where: {
        OR: [
          {
            fromLocationId: {
              in: locationIds
            }
          },
          {
            toLocationId: {
              in: locationIds
            }
          }
        ],

        status: TransferStatus.READY
      }
    });

    if (transfer) {
      throw new BadRequestException(
        `Some transfer(s) are in READY state for this location or its children`
      );
    }
  }

  async updateStatus(id: number, data: EditLocationStatus, userId: number) {
    const { disabled } = data;
    const location: any = await this.getLocationByWhereAndInclude(
      { id },
      { parent: true }
    );
    if (!location) {
      throw new BadRequestException(`No location found for id: ${id}`);
    }

    if (disabled === location.disabled) {
      throw new BadRequestException(
        `Cannot enable/disable an already enabled/disabled location`
      );
    }

    if (!disabled) {
      if (location?.parent?.disabled) {
        throw new BadRequestException(`Parent of this location is disabled.`);
      }
      const events = await this.eventService.generateEvents(
        id,
        { disabled },
        locationModel,
        userId
      );

      const updateLocation = this.prisma.location.update({
        where: {
          id
        },
        data: {
          disabled
        }
      });

      const updates = await this.prisma.$transaction([
        updateLocation,
        ...events
      ]);
      return updates[0];
    }

    const config = {
      availableForSale: location.availableForSale,
      grnApplicable: location.grnApplicable,
      returnApplicable: location.returnApplicable
    };

    const locationData = {
      businessUnitId: location.businessUnitId,
      warehouseId: location.warehouseId,
      country: location.country
    };

    const ancestry = (location.ancestry || '') + id + '/';

    const isLastLocationOfType = await this.isLastLocationofConfig(
      config,
      locationData,
      ancestry
    );

    if (isLastLocationOfType) {
      throw new BadRequestException(
        `This location cannot be disabled since no other location of this configuration exists.`
      );
    }

    const select: Prisma.LocationSelect = {
      id: true
    };
    const childrenObjects: any = await this.getChildren(ancestry, select);

    const childrenIds: Array<number> = [];

    for (const child in childrenObjects) {
      childrenIds.push(childrenObjects[child].id);
    }

    const isInventoryEmpty = await this.inventoryService.isInventoryEmpty([
      id,
      ...childrenIds
    ]);

    if (isInventoryEmpty) {
      await this.AreLocationsInPendingDocuments([id, ...childrenIds]);
      const updatedLocation = this.prisma.location.updateMany({
        where: {
          id: {
            in: [id, ...childrenIds]
          }
        },
        data: {
          disabled
        }
      });

      const allEvents = [];
      for (const child of childrenIds) {
        const events = await this.eventService.generateEvents(
          child,
          { disabled },
          locationModel,
          userId
        );

        allEvents.push(...events);
      }

      await this.prisma.$transaction([updatedLocation, ...allEvents]);
      location.disabled = true;
      return location;
    } else {
      throw new BadRequestException(
        `Inventory is not empty for the selected location or its children locations`
      );
    }
  }

  async AreDiabledLocations(ids: Array<number>) {
    const locations = await this.prisma.location.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    for (const location of locations) {
      if (location?.disabled === true) {
        throw new BadRequestException(
          `Unabled to save the document with a disabled location`
        );
      }
    }
  }
}

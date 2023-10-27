import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { Permission } from 'src/auth/decorator';
import { Permission as Permissions } from '../common';
import { JwtAuthGuard, PermissionAuthGuard } from 'src/auth/guards';
import { LocationService } from './location.service';
import {
  CreateLocation,
  EditLocation,
  EditLocationStatus,
  FetchLocationDto,
  SearchLocationDto
} from './dto';
import { Location } from '@prisma/client';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';
import { redisLockTTL } from 'src/redis/constants';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    private readonly redisService: RedisService
  ) {}

  @Get('/search')
  async searchLocations(
    @Query() reqParams: SearchLocationDto
  ): Promise<Location[] | null> {
    return await this.locationService.searchLocations(reqParams);
  }

  @Get(':id')
  async getLocation(
    @Param('id', ParseIntPipe) id: number
  ): Promise<Location | null> {
    return await this.locationService.getLocation(id);
  }

  @Permission(Permissions.USER_MANAGEMENT, Permissions.CREATE_LOCATION)
  @UseGuards(PermissionAuthGuard)
  @Post()
  async createLocation(
    @Body() data: CreateLocation,
    @Req() req: Request
  ): Promise<Location | null> {
    const lockId = `createLocation:${data.warehouseId}`;
    const lock = await this.redisService.redlock.acquire(
      [lockId],
      redisLockTTL
    );
    const user: any = req.user;
    try {
      return await this.locationService.createLocation({
        ...data,
        createdById: user.id
      });
    } finally {
      await lock.release();
    }
  }

  @Permission(
    Permissions.USER_MANAGEMENT,
    Permissions.EDIT_LOCATION,
    Permissions.LOCATION_STATUS
  )
  @UseGuards(PermissionAuthGuard)
  @Put(':id')
  async updateLocation(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: EditLocation,
    @Req() req: Request
  ): Promise<Location> {
    const user: any = req.user;
    return await this.locationService.updateLocation(id, data, user.id);
  }

  @Permission(
    Permissions.USER_MANAGEMENT,
    Permissions.EDIT_LOCATION,
    Permissions.LOCATION_STATUS
  )
  @UseGuards(PermissionAuthGuard)
  @Put('/:id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: EditLocationStatus,
    @Req() req: Request
  ): Promise<Location> {
    const user: any = req.user;
    return await this.locationService.updateStatus(id, data, user.id);
  }

  @Get()
  async getLocationListByType(
    @Query() reqParams: FetchLocationDto
  ): Promise<Location[] | null> {
    return await this.locationService.getLocationsByType(reqParams);
  }
}

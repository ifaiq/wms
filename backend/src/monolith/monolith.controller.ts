import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MODULES_NAME } from 'src/common/constants';
import { BusinessUnit, Location } from './entities';
import { MonolithService } from './monolith.service';

@ApiTags(MODULES_NAME.MONOLITH)
@ApiBearerAuth()
@Controller('monolith')
export class MonolithController {
  constructor(private monolithService: MonolithService) {}

  @Get('/business-units/:countryCode')
  async fetchBusinessUnitsAgainstACountry(
    @Param('countryCode') countryCode: string
  ): Promise<BusinessUnit[] | null> {
    return await this.monolithService.GetBusinessUnits(countryCode);
  }

  @Get('/locations/:businessUnitId')
  async fetchLocationsAgainstABusinessUnit(
    @Param('businessUnitId', ParseIntPipe) businessUnitId: number
  ): Promise<Location[] | null> {
    return await this.monolithService.GetLocations(businessUnitId);
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards';
import { MonolithService } from 'src/monolith/monolith.service';

@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class CommonController {
  constructor(private readonly monolithService: MonolithService) {}

  @Get('/service-token')
  async getServiceToken(): Promise<any> {
    const token = await this.monolithService.getServiceToken();
    return { data: { token } };
  }
}

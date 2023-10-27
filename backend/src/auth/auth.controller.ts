import {
  Controller,
  Post,
  UseGuards,
  Req,
  Put,
  Get,
  Param,
  ParseIntPipe,
  Body
} from '@nestjs/common';
import { Request } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard, PermissionAuthGuard } from './guards';
import { Permission } from './decorator';
import { Permission as Permissions } from '../common';
import { AssignRoleRequest, RoleRequest, RoleResponse } from './dto/role.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { MODULES_NAME } from 'src/common/constants';
import { LoginDto } from './dto/login.dto';

@ApiTags(MODULES_NAME.AUTH)
@ApiBearerAuth()
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard, PermissionAuthGuard)
  @Permission(Permissions.USER_MANAGEMENT)
  @Get('roles/:id')
  async fetchRole(
    @Param('id', ParseIntPipe) id: number
  ): Promise<RoleResponse> {
    return this.authService.getRole(id);
  }

  @UseGuards(JwtAuthGuard, PermissionAuthGuard)
  @Permission(Permissions.USER_MANAGEMENT)
  @Get('roles')
  async fetchRoles() {
    return await this.authService.getRoles();
  }

  @UseGuards(JwtAuthGuard, PermissionAuthGuard)
  @Permission(Permissions.USER_MANAGEMENT)
  @Put('roles/:id')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RoleRequest,
    @Req() req: Request
  ): Promise<RoleResponse> {
    const user: any = req.user;
    return this.authService.updateRole(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard, PermissionAuthGuard)
  @Permission(Permissions.USER_MANAGEMENT)
  @Post('roles')
  async createRole(
    @Req() req: Request,
    @Body() dto: RoleRequest
  ): Promise<RoleResponse> {
    const user = req.user as any;
    return this.authService.createRole(user.id as number, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionAuthGuard)
  @Permission(Permissions.USER_MANAGEMENT)
  @Post('roles/assign')
  async assignRole(@Req() req: Request, @Body() dto: AssignRoleRequest) {
    return this.authService.assignRole(dto);
  }
}

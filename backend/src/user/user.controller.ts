import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req
} from '@nestjs/common';
import { Prisma, User, UserStatus } from '@prisma/client';
import { UseGuards } from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUser, SearchUserDto, UpdateUser } from './dto';
import { Permission } from '../auth/decorator';
import { Permission as Permissions } from '../common';
import { JwtAuthGuard, PermissionAuthGuard } from '../auth/guards';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MODULES_NAME } from 'src/common/constants';
import { Request } from 'express';

@ApiTags(MODULES_NAME.USER)
@ApiBearerAuth()
@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Example usage of JWT, Permission Gaurds
  @Permission(Permissions.USER_MANAGEMENT)
  @UseGuards(JwtAuthGuard, PermissionAuthGuard)
  @Post('/create')
  async createUser(@Body() data: CreateUser): Promise<User | null> {
    return await this.userService.createUser(data);
  }

  @Permission(Permissions.USER_MANAGEMENT)
  @UseGuards(JwtAuthGuard, PermissionAuthGuard)
  @Get('/search')
  async searchUsers(@Query() reqParams: SearchUserDto): Promise<User[] | null> {
    return await this.userService.searchUser(reqParams);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findByID(id);
  }

  @Permission(Permissions.USER_MANAGEMENT)
  @UseGuards(JwtAuthGuard, PermissionAuthGuard)
  @Put('/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUser,
    @Req() req: Request
  ): Promise<User | Prisma.BatchPayload> {
    const user: any = req.user;
    return await this.userService.updateUser(id, data, user.id);
  }

  @Permission(Permissions.USER_MANAGEMENT)
  @UseGuards(JwtAuthGuard, PermissionAuthGuard)
  @Put('/:id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: UserStatus },
    @Req() req: Request
  ): Promise<User | Prisma.BatchPayload> {
    const user: any = req.user;
    return await this.userService.updateUserStatus(id, body, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/permissions')
  async getPermissions(@Req() req: any): Promise<string[]> {
    return await this.userService.getUserPermissions(req.user.id);
  }
}

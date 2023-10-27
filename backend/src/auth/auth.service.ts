import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';

import { Permission } from '../common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignRoleRequest, RoleRequest, RoleResponse } from './dto/role.dto';
import { Prisma } from '@prisma/client';
import { EventService } from 'src/event/event.service';

const { Role: roleModel } = Prisma.ModelName;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private static roleSelect = {
    name: true,
    permissions: true,
    id: true
  };

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private eventService: EventService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    this.logger.log(`authenticating user with email: ${email}`);
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return null;
    }

    if (await compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const [userData, permissions] = await Promise.all([
      this.userService.findByID(user.id),
      this.userService.getUserPermissions(user.id)
    ]);
    return {
      access_token: accessToken,
      userData,
      permissions
    };
  }

  async getRole(id: number): Promise<RoleResponse> {
    const role = await this.prisma.role.findUnique({
      select: AuthService.roleSelect,
      where: { id }
    });
    if (role === null) {
      throw new NotFoundException();
    }

    return {
      ...role,
      permissions: role?.permissions as Permission[]
    };
  }

  async getRoles() {
    return await this.prisma.role.findMany({
      select: {
        id: true,
        name: true
      }
    });
  }

  async updateRole(
    id: number,
    data: RoleRequest,
    userId: number
  ): Promise<RoleResponse> {
    const rolePromise = this.prisma.role.update({
      where: { id },
      data
    });

    const roleEventLog = await this.eventService.generateEvents(
      id,
      data,
      roleModel,
      userId
    );
    const [role] = await this.prisma.$transaction([
      rolePromise,
      ...roleEventLog
    ]);

    return {
      id,
      permissions: role.permissions as Permission[],
      name: role.name
    };
  }

  async createRole(userId: number, data: RoleRequest): Promise<RoleResponse> {
    const role = await this.prisma.role.create({
      data: {
        ...data,
        createdBy: {
          connect: {
            id: userId
          }
        }
      }
    });

    return {
      id: role.id,
      permissions: role.permissions as Permission[],
      name: role.name
    };
  }

  async assignRole(data: AssignRoleRequest) {
    await this.prisma.userRole.create({
      select: {
        roleID: true,
        userID: true
      },
      data
    });
  }
}

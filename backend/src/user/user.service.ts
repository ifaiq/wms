import { Injectable } from '@nestjs/common';
import { Prisma, User, UserStatus } from '@prisma/client';
import { CreateUser, SearchUserDto, UpdateUser } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { hash } from 'bcrypt';
import { saltLength } from 'src/auth/constants';
import { AssignRoleRequest } from 'src/auth/dto/role.dto';
import { OpensearchService } from 'src/opensearch/opensearch.service';
import { USERS } from 'src/common/constants';
import { EventService } from 'src/event/event.service';
import { BadRequestException } from 'src/errors/exceptions';

const { User: userModel } = Prisma.ModelName;
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private openSearchService: OpensearchService,
    private eventService: EventService
  ) {}

  async createUser(userData: CreateUser): Promise<User | null> {
    const { roles, password, ...data } = userData;
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: await hash(password, saltLength),
        UserRole: {
          createMany: {
            data: roles.map((id) => ({ roleID: id }))
          }
        }
      }
    });
    await this.upsertUserInOpenSearch(user.id);
    return user;
  }

  async updateUser(
    id: number,
    user: UpdateUser,
    userId: number
  ): Promise<User | Prisma.BatchPayload> {
    if (Object.keys(user).length === 0) {
      throw new BadRequestException('Unable to process empty object');
    }
    const updates = [];
    const { roles, ...data } = user;
    if (data?.password) {
      data.password = await hash(data.password, saltLength);
    }
    updates.push(
      this.prisma.user.update({
        where: {
          id
        },
        data: {
          ...data
        }
      })
    );

    if (roles?.length && id !== userId) {
      updates.push(...(await this.getEditUserRolesPromises(id, roles)));
    }

    const events = await this.eventService.generateEvents(
      id,
      { ...data },
      userModel,
      userId
    );
    updates.push(...events);
    const [updatedUser] = await this.prisma.$transaction(updates);
    const { password: encryptedPassword, ...updateUserWithoutPassword } =
      updatedUser as User;
    await this.upsertUserInOpenSearch(updateUserWithoutPassword.id, true);
    return updateUserWithoutPassword as User;
  }

  async updateUserStatus(
    id: number,
    body: { status: UserStatus },
    userId: number
  ) {
    if (id === userId) {
      throw new BadRequestException(
        'A user cannot change status of his own account'
      );
    }
    const { status } = body;
    const events = await this.eventService.generateEvents(
      id,
      body,
      userModel,
      userId
    );
    const updatedUserPromise = this.prisma.user.update({
      where: {
        id
      },
      data: {
        status
      }
    });
    const [updatedUser] = await this.prisma.$transaction([
      updatedUserPromise,
      ...events
    ]);
    await this.upsertUserInOpenSearch(id, true);
    return updatedUser;
  }

  async findByID(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        UserRole: {
          select: {
            role: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getUserPermissions(id: number): Promise<string[]> {
    const result = await this.prisma.userRole.findMany({
      where: {
        userID: id
      },
      select: {
        role: {
          select: {
            permissions: true
          }
        }
      }
    });

    const permissions: string[] = [];
    result.forEach(({ role }) => {
      const permissionByRole = role.permissions as string[];
      permissionByRole.forEach((name) => {
        if (!permissions.includes(name)) permissions.push(name);
      });
    });

    return permissions;
  }

  async getUserRole(id: number): Promise<string | null | undefined> {
    const result = await this.prisma.userRole.findFirst({
      where: {
        userID: id
      },
      select: {
        role: {
          select: {
            name: true
          }
        }
      }
    });
    return result?.role.name;
  }

  async getUserRoles(
    id: number
  ): Promise<{ role: { id: number } }[] | null | undefined> {
    const result = await this.prisma.userRole.findMany({
      where: {
        userID: id
      },
      select: {
        role: {
          select: {
            id: true
          }
        }
      }
    });
    return result;
  }

  async getEditUserRolesPromises(id: number, roles: number[]) {
    const deleteRolesPromise = this.prisma.userRole.deleteMany({
      where: {
        roleID: {
          notIn: roles
        },
        userID: id
      }
    });

    const currentRoles = await this.getUserRoles(id);

    //Filter out roles that already exist for the requested user
    const newRoles = roles.filter((role) => {
      if (!currentRoles?.find((currentRole) => currentRole.role.id === role))
        return role;
    });

    const updatedPayload: AssignRoleRequest[] = newRoles.map(
      (role: number) => ({ roleID: role, userID: id })
    );

    const createRolesPromise = this.prisma.userRole.createMany({
      data: updatedPayload
    });

    return [deleteRolesPromise, createRolesPromise];
  }

  //Only to be used in tests
  async deleteUser(id: number): Promise<User> {
    await this.prisma.event.deleteMany({
      where: {
        updatedBy: id
      }
    });

    const user = await this.prisma.user.delete({
      where: {
        id
      }
    });

    return user;
  }

  async searchUser(reqParams: SearchUserDto): Promise<any | null> {
    const { email, name, skip, take } = reqParams;
    return await this.openSearchService.searchUsers(
      { email, name, skip, take },
      USERS
    );
  }

  async addUsersInOpenSearch(): Promise<any> {
    const users = await this.prisma.user.findMany({
      include: {
        UserRole: {
          select: {
            role: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    await this.openSearchService.addInBulk(USERS, users);
  }

  async upsertUserInOpenSearch(id: number, isUpdateOperation = false) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        UserRole: {
          select: {
            role: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    if (isUpdateOperation) {
      await this.openSearchService.updateDocumentById(USERS, user);
      return;
    }
    await this.openSearchService.addDocumentById(USERS, user);
  }
}

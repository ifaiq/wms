import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';
import { Observable } from 'rxjs';
import { UserService } from '../../user/user.service';
import { DecoratorTypes } from '../../common';

@Injectable()
export class PermissionAuthGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly reflector: Reflector
  ) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const permissions = this.reflector.getAllAndOverride<string[]>(
      DecoratorTypes.Permission,
      [context.getHandler(), context.getClass()]
    );
    const request = context.switchToHttp().getRequest();
    return this.validatePermission(request.user, permissions);
  }

  async validatePermission(
    user: User,
    definedPermissions: string[]
  ): Promise<boolean> {
    if (definedPermissions === undefined) return true;

    // TODO: we can get permissions from redis instead of making an API call every time.
    const userPermissions: string[] = await this.userService.getUserPermissions(
      user.id
    );

    for (const permission of definedPermissions) {
      if (userPermissions.includes(permission)) {
        return true;
      }
    }
    return false;
  }
}

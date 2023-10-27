import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { verifyServiceToken } from '@development-team20/auth-library/dist';

@Injectable()
export class externalAuth implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.header('Authorization');
    return this.validatePermission(token);
  }

  async validatePermission(token: string | undefined): Promise<boolean> {
    if (!token) {
      throw new UnauthorizedException('Authorization token is required');
    }
    try {
      await verifyServiceToken(token);
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid Request');
    }
  }
}

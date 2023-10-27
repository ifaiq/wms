import { SetMetadata } from '@nestjs/common';
import { DecoratorTypes, Permission as Permissions } from '../../common';

export const Permission = (...args: Permissions[]) =>
  SetMetadata(DecoratorTypes.Permission, args);

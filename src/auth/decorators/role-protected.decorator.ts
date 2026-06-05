import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../../roles/interfaces/valid-roles.interface';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidRoles[]) =>
  SetMetadata(META_ROLES, args);

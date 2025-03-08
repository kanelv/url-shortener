import { SetMetadata } from '@nestjs/common';
import { Role } from '../../domain/entities/enums';

/**
 * Use the @Roles() decorator in your controllers to define which roles are required for specific routes.
 * @param roles - The roles that are allowed to access the route.
 */
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

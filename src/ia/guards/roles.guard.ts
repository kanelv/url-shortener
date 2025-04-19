import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role, roleHierarchy } from '../../domain/entities/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private readonly logger = new Logger(RolesGuard.name);

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Get roles from the @Roles() decorator, if present
    let roles = this.reflector.get<Role[]>('roles', context.getHandler());

    // If no roles are set, default to guest role
    if (!roles) {
      roles = [Role.Guest];
    }
    this.logger.log(`roles: ${roles}`);

    const request = context.switchToHttp().getRequest();

    const user = request.user;
    this.logger.log(`user: ${JSON.stringify(user, null, 2)}`);

    const userRoles = user?.roles;
    this.logger.log(`userRoles: ${JSON.stringify(userRoles, null, 2)}`);

    // Check if any of the user's roles exist in the hierarchy of the required roles
    const hasAccess: boolean = roles.some((role) =>
      this.isRoleInHierarchy(user?.roles || [Role.Guest], role)
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have permission to access this resource'
      );
    }

    return hasAccess;
  }

  private isRoleInHierarchy(userRoles: Role[], requiredRole: Role): boolean {
    // Check if the user's roles include the required role or any higher role in the hierarchy
    return userRoles.some(
      (userRole) => roleHierarchy[userRole]?.includes(requiredRole)
    );
  }
}

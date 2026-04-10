import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const GLOBAL_ROLES_KEY = 'global_roles';

/**
 * Decorator to specify required global roles for a route
 * Usage: @GlobalRoles('blogger', 'admin', 'owner')
 */
export const GlobalRoles = (...roles: string[]) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(GLOBAL_ROLES_KEY, roles, descriptor?.value || target);
    return descriptor || target;
  };
};

/**
 * GlobalRolesGuard - Checks global_roles (platform-wide roles)
 * Use this for features that should NOT be based on organization/shop roles
 *
 * This guard checks for roles like 'blogger', 'admin', 'owner' in the user's
 * global_roles array, which is stored in user metadata.
 */
@Injectable()
export class GlobalRolesGuard implements CanActivate {
  private readonly logger = new Logger(GlobalRolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(GLOBAL_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Access denied. Not authenticated.');
    }

    // Get global roles from various possible locations in user object
    // The user object comes from JWT and might have different structures
    const globalRoles: string[] = this.extractGlobalRoles(user);

    this.logger.debug(`User ${user.userId || user.sub} has global roles: ${globalRoles.join(', ')}`);
    this.logger.debug(`Required roles: ${requiredRoles.join(', ')}`);

    const hasRole = requiredRoles.some((role) => {
      return globalRoles.some(userRole =>
        userRole.toLowerCase() === role.toLowerCase()
      );
    });

    if (!hasRole) {
      this.logger.warn(
        `User ${user.userId || user.sub} denied access. Required: ${requiredRoles.join(' or ')}, Has: ${globalRoles.join(', ') || 'none'}`
      );
      throw new ForbiddenException(
        `Access denied. You need the '${requiredRoles.join("' or '")}' role.`
      );
    }

    return true;
  }

  /**
   * Extract global roles from various possible locations in user object
   */
  private extractGlobalRoles(user: any): string[] {
    const roles: string[] = [];

    // Check direct global_roles array
    if (Array.isArray(user.globalRoles)) {
      roles.push(...user.globalRoles);
    }
    if (Array.isArray(user.global_roles)) {
      roles.push(...user.global_roles);
    }

    // Check in user_metadata
    if (user.user_metadata) {
      if (Array.isArray(user.user_metadata.global_roles)) {
        roles.push(...user.user_metadata.global_roles);
      }
      if (Array.isArray(user.user_metadata.globalRoles)) {
        roles.push(...user.user_metadata.globalRoles);
      }
    }

    // Check in raw_user_meta_data
    if (user.raw_user_meta_data) {
      if (Array.isArray(user.raw_user_meta_data.global_roles)) {
        roles.push(...user.raw_user_meta_data.global_roles);
      }
      if (Array.isArray(user.raw_user_meta_data.globalRoles)) {
        roles.push(...user.raw_user_meta_data.globalRoles);
      }
    }

    // Check in metadata
    if (user.metadata) {
      if (Array.isArray(user.metadata.global_roles)) {
        roles.push(...user.metadata.global_roles);
      }
      if (Array.isArray(user.metadata.globalRoles)) {
        roles.push(...user.metadata.globalRoles);
      }
    }

    // Also check single role field (some users might have a single role)
    const singleRole = user.role || user.globalRole || user.global_role;
    if (singleRole && typeof singleRole === 'string') {
      // Check if it's an admin-level role
      const adminRoles = ['admin', 'platform_admin', 'super_admin', 'owner'];
      if (adminRoles.includes(singleRole.toLowerCase())) {
        roles.push('admin');
        roles.push('owner');
      }
    }

    // Return unique roles, all lowercase for comparison
    return [...new Set(roles.map(r => r.toLowerCase()))];
  }
}

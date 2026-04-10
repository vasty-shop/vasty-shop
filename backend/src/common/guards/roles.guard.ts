import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator';
import { DatabaseService } from '../../modules/database/database.service';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private readonly db: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user ID from JWT payload (supports both 'sub' and 'userId')
    const userId = user.sub || user.userId;
    if (!userId) {
      throw new ForbiddenException('Invalid user token');
    }

    // Fetch user data from database auth to get roles
    let userRoles: UserRole[] = [UserRole.USER]; // Default role

    try {
      const userData = await this.db.getUserById(userId);

      if (userData) {
        // Get role directly from user.role (database stores role in auth.users table)
        const userRole = userData.role;

        if (userRole) {
          // Map user role string to UserRole enum
          const roleMapping: Record<string, UserRole> = {
            admin: UserRole.ADMIN,
            platform_admin: UserRole.ADMIN,
            super_admin: UserRole.ADMIN,
            vendor: UserRole.SHOP_OWNER,
            shop_owner: UserRole.SHOP_OWNER,
            shop_admin: UserRole.SHOP_ADMIN,
            shop_manager: UserRole.SHOP_MANAGER,
            shop_staff: UserRole.SHOP_STAFF,
            user: UserRole.USER,
            customer: UserRole.USER,
          };

          const mappedRole = roleMapping[userRole.toLowerCase()];
          if (mappedRole) {
            userRoles = [mappedRole];
          }
        }

        // Check for roles array in metadata (allows multiple roles)
        const rolesArray = userData.metadata?.roles;
        if (Array.isArray(rolesArray) && rolesArray.length > 0) {
          userRoles = rolesArray
            .map((r: string) => {
              const roleMapping: Record<string, UserRole> = {
                admin: UserRole.ADMIN,
                vendor: UserRole.SHOP_OWNER,
                shop_owner: UserRole.SHOP_OWNER,
                shop_admin: UserRole.SHOP_ADMIN,
                shop_manager: UserRole.SHOP_MANAGER,
                shop_staff: UserRole.SHOP_STAFF,
                user: UserRole.USER,
              };
              return roleMapping[r.toLowerCase()];
            })
            .filter(Boolean);
        }

        // Attach full user data to request for downstream use
        request.userData = userData;
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch user data for role check: ${error.message}`);
      // Continue with default USER role - don't block authentication
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      this.logger.warn(
        `User ${userId} denied access. Required roles: ${requiredRoles.join(', ')}, User roles: ${userRoles.join(', ')}`,
      );
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

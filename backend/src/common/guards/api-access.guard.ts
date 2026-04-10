import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionService } from '../../modules/subscription/subscription.service';

export const REQUIRES_API_ACCESS_KEY = 'requires_api_access';

/**
 * Decorator to mark endpoints that require API access (Business plan only)
 */
export const RequiresApiAccess = () => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(REQUIRES_API_ACCESS_KEY, true, descriptor.value);
    } else {
      Reflect.defineMetadata(REQUIRES_API_ACCESS_KEY, true, target);
    }
    return descriptor || target;
  };
};

/**
 * Guard that checks if user has API access based on their subscription plan
 * Only Business plan users have API access
 */
@Injectable()
export class ApiAccessGuard implements CanActivate {
  private readonly logger = new Logger(ApiAccessGuard.name);

  constructor(
    private reflector: Reflector,
    private subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if this route requires API access
    const requiresApiAccess = this.reflector.getAllAndOverride<boolean>(REQUIRES_API_ACCESS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If route doesn't require API access, allow through
    if (!requiresApiAccess) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user ID from JWT payload
    const userId = user.sub || user.userId;
    if (!userId) {
      throw new ForbiddenException('Invalid user token');
    }

    // Check if user has API access based on their plan
    const hasApiAccess = await this.subscriptionService.hasApiAccess(userId);

    if (!hasApiAccess) {
      this.logger.warn(`User ${userId} denied API access - requires Business plan`);
      throw new ForbiddenException(
        'API access requires a Business plan. Please upgrade your subscription to access this feature.'
      );
    }

    this.logger.debug(`User ${userId} granted API access`);
    return true;
  }
}

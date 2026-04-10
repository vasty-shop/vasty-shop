import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * Shop Access Guard
 * Ensures vendor has access to the requested shop
 * Expects shopId in request params or body
 */
@Injectable()
export class ShopAccessGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    // Get shopId from params or body
    const shopId = request.params.shopId || request.body.shopId;

    if (!shopId) {
      throw new ForbiddenException('Shop ID is required');
    }

    if (!userId) {
      throw new ForbiddenException('User authentication required');
    }

    // Verify vendor has access to this shop
    const hasAccess = await this.authService.verifyVendorShopAccess(userId, shopId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this shop');
    }

    return true;
  }
}

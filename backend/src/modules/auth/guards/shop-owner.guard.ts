import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EntityType } from '../../../database/schema';

/**
 * Shop Owner Guard
 * Ensures the authenticated user owns the shop they're trying to access
 * Used for vendor-only endpoints that require shop ownership verification
 */
@Injectable()
export class ShopOwnerGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    // Check if user is a vendor or has shop access
    // Users who created shops through customer flow might have role 'user'
    // We'll verify actual shop ownership below instead of blocking by role
    const allowedRoles = ['vendor', 'admin', 'user'];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    // Get shopId from header, params, body, or query
    const shopId =
      request.headers['x-shop-id'] || // From x-shop-id header (frontend sends this)
      request.params.shopId ||
      request.body?.shopId ||
      request.query?.shopId ||
      user.shopId; // From JWT token

    if (!shopId) {
      throw new ForbiddenException('Shop ID is required');
    }

    // Verify shop exists and user owns it
    try {
      const shop = await this.db.getEntity(
        EntityType.SHOP,
        shopId,
      );

      if (!shop) {
        throw new ForbiddenException('Shop not found');
      }

      // Debug: Log the values being compared
      console.log('[ShopOwnerGuard] Ownership check:', {
        shopId,
        'shop.owner_id': shop.owner_id,
        'shop.ownerId': shop.ownerId,
        'user.userId': user.userId,
        'user.sub': user.sub,
        'user.id': user.id,
      });

      // Check if user owns this shop (comparing with snake_case from DB)
      // Also check against user.sub and user.id for compatibility
      const shopOwnerId = shop.owner_id || shop.ownerId;
      const userId = user.userId || user.sub || user.id;

      if (shopOwnerId !== userId) {
        console.error('[ShopOwnerGuard] Ownership mismatch:', {
          shopOwnerId,
          userId,
          match: shopOwnerId === userId,
        });
        throw new ForbiddenException('You do not own this shop');
      }

      // Attach shop to request for later use
      request.shop = shop;

      return true;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new ForbiddenException('Unable to verify shop ownership');
    }
  }
}

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../modules/database/database.service';

/**
 * Guard to verify that the user owns the shop or is a team member with required permissions
 */
@Injectable()
export class ShopOwnerGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const shopId = request.params.shopId || request.body.shopId;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!shopId) {
      throw new ForbiddenException('Shop ID not provided');
    }

    // Get shop
    const shop = await this.db.getEntity('shops', shopId);

    if (!shop || shop.deleted_at) {
      throw new ForbiddenException('Shop not found');
    }

    // Check if user is the owner
    if (shop.owner_id === user.userId) {
      request.shop = shop;
      return true;
    }

    // Check if user is a team member with required permissions
    const teamMembersResult = await this.db.queryEntities('shop_team_members', {
      filters: {
        shop_id: shopId,
        user_id: user.userId,
        status: 'active',
      },
    });

    if (teamMembersResult.data && teamMembersResult.data.length > 0) {
      const member = teamMembersResult.data[0];
      // Owner, admin, and manager can perform most actions
      if (['owner', 'admin', 'manager'].includes(member.role)) {
        request.shop = shop;
        request.teamMember = member;
        return true;
      }
    }

    throw new ForbiddenException('You do not have permission to access this shop');
  }
}

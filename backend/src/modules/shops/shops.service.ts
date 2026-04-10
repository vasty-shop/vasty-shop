import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
  StreamableFile,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { EntityType, ShopEntity, ShopTeamMemberEntity } from '../../database/schema';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import {
  InviteTeamMemberDto,
  UpdateTeamMemberRoleDto,
  UpdateShopStatusDto,
  QueryShopsDto,
} from './dto/invite-team-member.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ShopsService {
  private readonly logger = new Logger(ShopsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  /**
   * Create a new shop
   * User becomes the owner automatically
   */
  async create(userId: string, createShopDto: CreateShopDto): Promise<ShopEntity> {
    this.logger.log(`[create] Creating shop for user: ${userId}, shop name: ${createShopDto.name}`);

    // Check store limit based on user's subscription
    const storeCheck = await this.subscriptionService.canCreateStore(userId);
    this.logger.log(`[create] Store limit check result: allowed=${storeCheck.allowed}, used=${storeCheck.used}/${storeCheck.limit}`);

    if (!storeCheck.allowed) {
      this.logger.warn(`[create] Store creation blocked for user ${userId}: ${storeCheck.reason}`);
      throw new ForbiddenException(storeCheck.reason || 'Store limit reached. Please upgrade your plan to create more stores.');
    }

    // Generate unique slug
    const slug = await this.generateUniqueSlug(createShopDto.name);

    // Check if user already has a shop with this name
    const existingShops = await this.db.queryEntities(EntityType.SHOP, {
      filters: { owner_id: userId, slug },
      limit: 1,
    });

    if (existingShops.data && existingShops.data.length > 0) {
      throw new ConflictException('You already have a shop with this name');
    }

    // Extract plan selection fields (not stored in shops table)
    const { selected_plan, billing_period, ...shopDtoWithoutPlan } = createShopDto;

    // Create shop data with language defaults
    const defaultLanguage = shopDtoWithoutPlan.default_language || 'en';
    const supportedLanguages = shopDtoWithoutPlan.supported_languages?.length
      ? shopDtoWithoutPlan.supported_languages
      : [defaultLanguage];

    // Ensure default language is in supported languages
    if (!supportedLanguages.includes(defaultLanguage)) {
      supportedLanguages.unshift(defaultLanguage);
    }

    const shopData: Partial<ShopEntity> = {
      ...shopDtoWithoutPlan,
      owner_id: userId,
      ownerId: userId, // Keep both for compatibility
      slug,
      status: 'pending',
      isVerified: false,
      defaultLanguage,
      supportedLanguages,
      totalSales: 0,
      totalOrders: 0,
      totalProducts: 0,
      rating: 0,
      totalReviews: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const shop = await this.db.createEntity(EntityType.SHOP, shopData);

    // Create owner as team member
    const teamMemberData: Partial<ShopTeamMemberEntity> = {
      shopId: shop.id,
      userId: userId,
      role: 'owner',
      permissions: ['*'], // Full permissions
      status: 'active',
      joinedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.db.createEntity(EntityType.SHOP_TEAM_MEMBER, teamMemberData);

    // If a paid plan was selected, create a trial subscription (2 months free)
    if (selected_plan && selected_plan !== 'free') {
      const billingPeriodValue = billing_period || 'yearly';
      this.logger.log(`[create] Creating trial subscription for plan: ${selected_plan}, billing: ${billingPeriodValue}`);
      try {
        await this.subscriptionService.createTrialSubscription(userId, shop.id, selected_plan, billingPeriodValue);
        this.logger.log(`[create] Trial subscription created successfully for shop: ${shop.id}`);
      } catch (error) {
        this.logger.error(`[create] Failed to create trial subscription: ${error.message}`);
        // Don't fail shop creation if subscription creation fails
      }
    }

    return shop;
  }

  /**
   * Find all active shops with filters and pagination
   */
  async findAll(query: QueryShopsDto) {
    const {
      status,
      is_verified,
      category,
      search,
      limit = 20,
      offset = 0,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = query;

    const filters: any = {};

    // Only show active shops by default for public listing
    if (!status) {
      filters.status = 'active';
    } else {
      filters.status = status;
    }

    if (is_verified !== undefined) {
      filters.is_verified = is_verified;
    }

    // Filter by category
    if (category) {
      filters.category_id = category;
    }

    // Handle search
    let queryOptions: any = {
      filters,
      limit: parseInt(limit as any),
      offset: parseInt(offset as any),
    };

    // Add sorting
    queryOptions.sort = {
      field: sort_by,
      order: sort_order,
    };

    // If search is provided, use text search
    if (search) {
      queryOptions.search = {
        fields: ['name', 'description', 'business_name'],
        query: search,
      };
    }

    const result = await this.db.queryEntities(EntityType.SHOP, queryOptions);

    // Get product counts for each shop
    if (result.data && result.data.length > 0) {
      const shopIds = result.data.map((shop: ShopEntity) => shop.id);

      // Query all published products for these shops
      const productsResult = await this.db.queryEntities(EntityType.PRODUCT, {
        filters: { status: 'published' },
        limit: 10000, // Get all products to count
      });

      // Count products per shop
      const productCountMap: Record<string, number> = {};
      if (productsResult.data) {
        productsResult.data.forEach((product: any) => {
          const shopId = product.shop_id || product.shopId;
          if (shopId && shopIds.includes(shopId)) {
            productCountMap[shopId] = (productCountMap[shopId] || 0) + 1;
          }
        });
      }

      // Add product count to each shop
      result.data = result.data.map((shop: ShopEntity) => ({
        ...shop,
        productCount: productCountMap[shop.id] || 0,
      }));
    }

    return result;
  }

  /**
   * Find current user's shops (shops they own or are members of)
   */
  async findMyShops(userId: string) {
    // Get shops where user is owner (use snake_case to match database column)
    const ownedShops = await this.db.queryEntities(EntityType.SHOP, {
      filters: { owner_id: userId },
    });

    // Get shops where user is a team member
    const teamMemberships = await this.db.queryEntities(
      EntityType.SHOP_TEAM_MEMBER,
      {
        filters: { userId: userId, status: 'active' },
      }
    );

    // Get details for shops where user is a team member
    const memberShopIds = teamMemberships.data
      ?.filter((tm: ShopTeamMemberEntity) => tm.role !== 'owner')
      .map((tm: ShopTeamMemberEntity) => tm.shopId) || [];

    let memberShops: any = { data: [], count: 0 };
    if (memberShopIds.length > 0) {
      // Get shop details for team memberships
      const shopPromises = memberShopIds.map((shopId: string) =>
        this.db.getEntity(EntityType.SHOP, shopId)
      );
      const shops = await Promise.all(shopPromises);
      memberShops = { data: shops.filter(Boolean), count: shops.length };
    }

    return {
      owned: ownedShops,
      member: memberShops,
      total: (ownedShops.count || 0) + (memberShops.count || 0),
    };
  }

  /**
   * Find one shop by ID
   */
  async findOne(id: string): Promise<ShopEntity> {
    const shop = await this.db.getEntity(EntityType.SHOP, id);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    return shop;
  }

  /**
   * Find shop by slug (SEO-friendly)
   */
  async findBySlug(slug: string): Promise<ShopEntity> {
    const shops = await this.db.queryEntities(EntityType.SHOP, {
      filters: { slug },
      limit: 1,
    });

    if (!shops.data || shops.data.length === 0) {
      throw new NotFoundException('Shop not found');
    }

    return shops.data[0];
  }

  /**
   * Find shop by subdomain (for storefront routing)
   * Looks up by subdomain field or falls back to slug
   */
  async findBySubdomain(subdomain: string): Promise<ShopEntity> {
    // First try to find by explicit subdomain field
    let shops = await this.db.queryEntities(EntityType.SHOP, {
      filters: { subdomain: subdomain.toLowerCase() },
      limit: 1,
    });

    // If not found, try by slug (subdomain often matches slug)
    if (!shops.data || shops.data.length === 0) {
      shops = await this.db.queryEntities(EntityType.SHOP, {
        filters: { slug: subdomain.toLowerCase() },
        limit: 1,
      });
    }

    if (!shops.data || shops.data.length === 0) {
      throw new NotFoundException('Shop not found');
    }

    const shop = shops.data[0];

    // Return shop data formatted for subdomain routing
    return {
      ...shop,
      isActive: shop.status === 'active',
    };
  }

  /**
   * Update shop (only owner or admin can update)
   */
  async update(
    id: string,
    userId: string,
    updateShopDto: UpdateShopDto,
  ): Promise<ShopEntity> {
    // Verify ownership or admin role
    await this.verifyOwnershipOrRole(id, userId, ['owner', 'admin']);

    // Get current shop to merge settings
    const currentShop = await this.findOne(id);

    // If name is being updated, regenerate slug
    let updateData: any = {
      ...updateShopDto,
      updatedAt: new Date().toISOString(),
    };

    if (updateShopDto.name) {
      updateData.slug = await this.generateUniqueSlug(updateShopDto.name, id);
    }

    // Merge settings with existing settings instead of replacing
    if (updateShopDto.settings) {
      updateData.settings = {
        ...(currentShop.settings || {}),
        ...updateShopDto.settings,
      };
      this.logger.log(`[ShopsService.update] Current shop settings: ${JSON.stringify(currentShop.settings)}`);
      this.logger.log(`[ShopsService.update] Incoming settings: ${JSON.stringify(updateShopDto.settings)}`);
      this.logger.log(`[ShopsService.update] Merged settings: ${JSON.stringify(updateData.settings)}`);
    }

    const result = await this.db.updateEntity(EntityType.SHOP, id, updateData);
    this.logger.log(`[ShopsService.update] Updated shop result settings: ${JSON.stringify(result?.settings)}`);
    return result;
  }

  /**
   * Update shop status (admin only)
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateShopStatusDto,
  ): Promise<ShopEntity> {
    const shop = await this.findOne(id);

    const updateData: any = {
      status: updateStatusDto.status,
      updatedAt: new Date().toISOString(),
    };

    // If status is being set to active and shop was pending, mark as verified
    if (updateStatusDto.status === 'active' && shop.status === 'pending') {
      updateData.isVerified = true;
      updateData.verifiedAt = new Date().toISOString();
    }

    return this.db.updateEntity(EntityType.SHOP, id, updateData);
  }

  /**
   * Soft delete shop (only owner can delete)
   */
  async remove(id: string, userId: string) {
    // Verify ownership
    await this.verifyOwnershipOrRole(id, userId, ['owner']);

    // Soft delete
    await this.db.updateEntity(EntityType.SHOP, id, {
      deletedAt: new Date().toISOString(),
      status: 'closed',
      updatedAt: new Date().toISOString(),
    });

    return { message: 'Shop deleted successfully' };
  }

  /**
   * Get shop statistics with dashboard data
   */
  async getStatistics(shopId: string, timeRange?: string) {
    const shop = await this.findOne(shopId);

    // Get real-time product count
    const products = await this.db.queryEntities(EntityType.PRODUCT, {
      filters: { shop_id: shopId, status: 'published' },
    });

    // Get all products for category distribution
    const allProducts = await this.db.queryEntities(EntityType.PRODUCT, {
      filters: { shop_id: shopId },
    });

    // Get orders count and calculate sales
    const orders = await this.db.queryEntities(EntityType.ORDER, {
      filters: { shop_id: shopId },
    });

    // Get delivery assignments to calculate actual delivery costs paid
    let deliveryAssignments: any[] = [];
    try {
      const assignmentsResult = await this.db.query_builder()
        .from('delivery_assignments')
        .select('*')
        .where('shop_id', shopId)
        .get();
      deliveryAssignments = assignmentsResult || [];
    } catch (e) {
      // Silently handle if delivery_assignments table doesn't exist
    }

    // Calculate total sales and order status breakdown
    let totalSales = 0;
    let totalDeliveryCosts = 0;
    let completedOrders = 0;
    let pendingOrders = 0;
    let processingOrders = 0;
    let cancelledOrders = 0;
    const ordersByDate: Record<string, { revenue: number; orders: number }> = {};
    const productSales: Record<string, { name: string; sales: number; revenue: number }> = {};

    if (orders.data) {
      orders.data.forEach((order: any) => {
        // Count by status
        switch (order.status) {
          case 'pending': pendingOrders++; break;
          case 'processing': processingOrders++; break;
          case 'completed': case 'delivered': completedOrders++; break;
          case 'cancelled': cancelledOrders++; break;
        }

        // Calculate revenue for paid/completed/delivered orders
        const isPaid = order.payment_status === 'paid';
        const isCompleted = order.status === 'completed' || order.status === 'delivered';
        const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

        if ((isPaid || isCompleted) && !isCancelled) {
          const orderTotal = parseFloat(order.total || 0);
          totalSales += orderTotal;

          // Group by date for chart data
          const orderDate = new Date(order.created_at || order.createdAt);
          const dayName = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
          if (!ordersByDate[dayName]) {
            ordersByDate[dayName] = { revenue: 0, orders: 0 };
          }
          ordersByDate[dayName].revenue += orderTotal;
          ordersByDate[dayName].orders += 1;

          // Track product sales
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              const productId = item.product_id || item.productId;
              const productName = item.product_name || item.productName || item.name || 'Unknown Product';
              const quantity = item.quantity || 1;
              const itemTotal = parseFloat(item.price || 0) * quantity;

              if (!productSales[productId]) {
                productSales[productId] = { name: productName, sales: 0, revenue: 0 };
              }
              productSales[productId].sales += quantity;
              productSales[productId].revenue += itemTotal;
            });
          }
        }
      });
    }

    // Calculate total delivery costs from delivery_assignments table
    // Only count assignments for completed/delivered orders
    const completedOrderIds = new Set(
      (orders.data || [])
        .filter((order: any) => {
          const isCompleted = order.status === 'completed' || order.status === 'delivered';
          const isCancelled = order.status === 'cancelled' || order.status === 'refunded';
          return isCompleted && !isCancelled;
        })
        .map((order: any) => order.id)
    );

    deliveryAssignments.forEach((assignment: any) => {
      // Only count delivery fees for completed/delivered orders
      if (completedOrderIds.has(assignment.order_id)) {
        const fee = parseFloat(assignment.delivery_fee || 0);
        totalDeliveryCosts += fee;
      }
    });

    // Build revenue chart data (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueData = days.map(day => ({
      name: day,
      revenue: ordersByDate[day]?.revenue || 0,
      orders: ordersByDate[day]?.orders || 0,
    }));

    // Build category distribution from products
    const categoryDistribution: Record<string, number> = {};
    if (allProducts.data) {
      allProducts.data.forEach((product: any) => {
        const category = product.category || 'Uncategorized';
        categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
      });
    }

    const categoryColors = ['#A855F7', '#EC4899', '#8B5CF6', '#D946EF', '#06B6D4', '#10B981'];
    const totalProductCount = allProducts.count || 1;
    const categoryData = Object.entries(categoryDistribution)
      .slice(0, 6)
      .map(([name, count], index) => ({
        name,
        value: Math.round((count / totalProductCount) * 100),
        color: categoryColors[index % categoryColors.length],
      }));

    // Build top products list
    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({
        id,
        name: data.name,
        sales: data.sales,
        revenue: data.revenue,
        trend: 0, // Would need historical data for trend calculation
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get recent orders
    const recentOrdersData = (orders.data || [])
      .slice(0, 5)
      .map((order: any) => ({
        id: order.id,
        orderNumber: order.order_number || order.orderNumber || `ORD-${order.id.slice(-6)}`,
        customer: order.customer_name || order.customerName || 'Customer',
        product: order.items?.[0]?.name || order.items?.[0]?.product_name || 'Product',
        amount: parseFloat(order.total || 0),
        status: order.status || 'pending',
        time: this.getRelativeTime(order.created_at || order.createdAt),
      }));

    // Get reviews for shop's products
    // Reviews don't have shop_id directly - they belong to products which belong to shops
    let reviews = { data: [], count: 0 };
    let averageRating = 0;

    // Get product IDs for this shop
    const productIds = (allProducts.data || []).map((p: any) => p.id);

    if (productIds.length > 0) {
      // Query reviews for the shop's products with approved status
      try {
        // First try to get all reviews (not just approved) to see what we have
        const allReviews = await this.db.queryEntities(EntityType.REVIEW, {
          filters: {},
        });
        console.log(`[ShopsService.getStatistics] Total reviews in DB: ${allReviews.count}, Product IDs for shop: ${productIds.length}`);

        reviews = await this.db.queryEntities(EntityType.REVIEW, {
          filters: { status: 'approved' },
        });
        console.log(`[ShopsService.getStatistics] Approved reviews: ${reviews.count}`);

        // Filter reviews to only include those for this shop's products
        // Check both snake_case and camelCase for compatibility
        if (reviews.data && reviews.data.length > 0) {
          reviews.data = reviews.data.filter((review: any) => {
            const reviewProductId = review.product_id || review.productId;
            return productIds.includes(reviewProductId);
          });
          reviews.count = reviews.data.length;

          // Calculate average rating
          const totalRating = reviews.data.reduce(
            (sum: number, review: any) => sum + (review.rating || 0),
            0
          );
          averageRating = reviews.count > 0 ? totalRating / reviews.count : 0;
        }
      } catch (reviewError) {
        console.warn('[ShopsService] Failed to fetch reviews:', reviewError);
        // Continue without reviews - non-critical for statistics
      }
    }

    // Get unique customers count from orders
    const uniqueCustomers = new Set(
      (orders.data || []).map((order: any) => order.user_id || order.userId)
    );

    return {
      // Basic stats
      shop_id: shopId,
      shop_name: shop.name,
      total_products: products.count || 0,
      total_orders: orders.count || 0,
      completed_orders: completedOrders,
      total_sales: totalSales.toFixed(2),
      average_order_value: completedOrders > 0
        ? (totalSales / completedOrders).toFixed(2)
        : '0.00',
      rating: averageRating.toFixed(2),
      total_reviews: reviews.count || 0,
      status: shop.status,
      is_verified: shop.isVerified,
      created_at: shop.createdAt,

      // Dashboard data (camelCase for frontend)
      revenue: {
        total: totalSales,
        change: 0, // Would need historical comparison
        data: revenueData,
      },
      orders: {
        total: orders.count || 0,
        change: 0,
        statusBreakdown: {
          pending: pendingOrders,
          processing: processingOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
        },
      },
      products: {
        total: allProducts.count || 0,
        active: products.count || 0,
        draft: (allProducts.count || 0) - (products.count || 0),
        outOfStock: 0, // Would need inventory check
      },
      customers: {
        total: uniqueCustomers.size,
        new: 0, // Would need date filter
        change: 0,
      },
      revenueData,
      categoryData,
      topProducts,
      recentOrders: recentOrdersData,

      // Earnings breakdown for vendor dashboard
      // Note: Platform fee is handled via subscription, not per-order commission
      earnings: {
        grossSales: totalSales,
        deliveryCosts: totalDeliveryCosts,
        netProfit: totalSales - totalDeliveryCosts,
      },
    };
  }

  /**
   * Get relative time string
   */
  private getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }

  /**
   * Get shop team members with user details
   */
  async getTeam(shopId: string, userId: string) {
    // Verify user has access to this shop
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin', 'manager', 'staff']);

    const teamMembers = await this.db.queryEntities(
      EntityType.SHOP_TEAM_MEMBER,
      {
        filters: { shop_id: shopId, is_active: true },
      }
    );

    // Fetch user details for each member
    const membersWithDetails = await Promise.all(
      (teamMembers.data || []).map(async (member: ShopTeamMemberEntity) => {
        let userDetails = {
          id: member.user_id,
          email: null as string | null,
          name: null as string | null,
          avatar: null as string | null,
        };

        try {
          // Only fetch user if user_id is defined
          if (member.user_id) {
            const user = await this.db.getUserById(member.user_id);
            if (user) {
              const metadata = (user as any).user_metadata || {};
              userDetails = {
                id: user.id,
                email: user.email || null,
                name: metadata.full_name || metadata.name || user.email?.split('@')[0] || null,
                avatar: metadata.avatar_url || (user as any).avatar_url || null,
              };
            }
          }
        } catch (error) {
          // User might not exist, continue with defaults
        }

        return {
          id: member.id,
          shopId: member.shop_id,
          userId: member.user_id,
          role: member.role,
          permissions: member.permissions || [],
          status: member.status,
          isActive: member.is_active,
          joinedAt: member.joined_at,
          invitedBy: member.invited_by,
          invitedAt: member.invited_at,
          createdAt: member.created_at,
          updatedAt: member.updated_at,
          user: userDetails,
        };
      })
    );

    return {
      data: membersWithDetails,
      count: membersWithDetails.length,
    };
  }

  /**
   * Invite team member
   */
  async inviteTeamMember(
    shopId: string,
    userId: string,
    inviteDto: InviteTeamMemberDto,
  ) {
    // Verify user is owner or admin
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin']);

    // Check if email is already a team member
    // Note: In a real system, you'd lookup user by email first
    // For now, we'll just create an invitation record
    const invitationData: Partial<ShopTeamMemberEntity> = {
      shopId: shopId,
      userId: inviteDto.email, // Temporary - should be actual user ID
      role: inviteDto.role,
      permissions: inviteDto.permissions || this.getDefaultPermissions(inviteDto.role),
      status: 'invited',
      invitedBy: userId,
      invitedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const invitation = await this.db.createEntity(
      EntityType.SHOP_TEAM_MEMBER,
      invitationData
    );

    // TODO: Send invitation email via notification service

    return {
      message: 'Team member invitation sent successfully',
      invitation,
    };
  }

  /**
   * Update team member role
   */
  async updateTeamMemberRole(
    shopId: string,
    memberId: string,
    userId: string,
    updateRoleDto: UpdateTeamMemberRoleDto,
  ) {
    // Verify user is owner or admin
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin']);

    // Get team member
    const teamMember = await this.db.getEntity(
      EntityType.SHOP_TEAM_MEMBER,
      memberId
    );

    if (!teamMember || teamMember.shopId !== shopId) {
      throw new NotFoundException('Team member not found');
    }

    // Cannot change owner role
    if (teamMember.role === 'owner') {
      throw new ForbiddenException('Cannot change owner role');
    }

    // Update role
    const updateData = {
      role: updateRoleDto.role,
      permissions: updateRoleDto.permissions || this.getDefaultPermissions(updateRoleDto.role),
      updatedAt: new Date().toISOString(),
    };

    return this.db.updateEntity(
      EntityType.SHOP_TEAM_MEMBER,
      memberId,
      updateData
    );
  }

  /**
   * Remove team member
   */
  async removeTeamMember(shopId: string, memberId: string, userId: string) {
    // Verify user is owner or admin
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin']);

    // Get team member
    const teamMember = await this.db.getEntity(
      EntityType.SHOP_TEAM_MEMBER,
      memberId
    );

    if (!teamMember || teamMember.shopId !== shopId) {
      throw new NotFoundException('Team member not found');
    }

    // Cannot remove owner
    if (teamMember.role === 'owner') {
      throw new ForbiddenException('Cannot remove shop owner');
    }

    // Delete team member
    await this.db.deleteEntity(EntityType.SHOP_TEAM_MEMBER, memberId);

    return { message: 'Team member removed successfully' };
  }

  /**
   * Verify ownership or specific role
   */
  async verifyOwnershipOrRole(
    shopId: string,
    userId: string,
    allowedRoles: string[]
  ): Promise<ShopTeamMemberEntity> {
    // Get shop to verify it exists
    const shop = await this.findOne(shopId);

    // Debug: Log ownership check values
    console.log('[verifyOwnershipOrRole] Checking ownership:', {
      shopId,
      userId,
      'shop.owner_id': shop.owner_id,
      'shop.ownerId': shop.ownerId,
      allowedRoles,
    });

    // Check if user is owner (check both camelCase and snake_case for compatibility)
    const shopOwnerId = shop.owner_id || shop.ownerId;
    console.log('[verifyOwnershipOrRole] Resolved shopOwnerId:', shopOwnerId, 'matches userId:', shopOwnerId === userId);

    if (shopOwnerId === userId && allowedRoles.includes('owner')) {
      // Return mock team member for owner
      return {
        id: 'owner',
        shopId: shopId,
        userId: userId,
        role: 'owner',
        permissions: ['*'],
        status: 'active',
        createdAt: shop.createdAt,
        updatedAt: shop.updatedAt,
      } as ShopTeamMemberEntity;
    }

    // Check team membership
    const teamMemberships = await this.db.queryEntities(
      EntityType.SHOP_TEAM_MEMBER,
      {
        filters: { shopId: shopId, userId: userId, status: 'active' },
        limit: 1,
      }
    );

    if (!teamMemberships.data || teamMemberships.data.length === 0) {
      throw new ForbiddenException('You do not have permission to access this shop');
    }

    const membership = teamMemberships.data[0];

    if (!allowedRoles.includes(membership.role)) {
      throw new ForbiddenException(
        `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      );
    }

    return membership;
  }

  /**
   * Generate unique slug from shop name
   */
  async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.db.queryEntities(EntityType.SHOP, {
        filters: { slug },
        limit: 1,
      });

      // If no shop with this slug exists, or it's the shop being updated
      if (!existing.data || existing.data.length === 0) {
        break;
      }

      if (excludeId && existing.data[0].id === excludeId) {
        break;
      }

      // Try next variation
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    return slug;
  }

  /**
   * Get shop customers aggregated from orders
   */
  async getCustomers(shopId: string, userId: string, query?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    // Verify user has access to this shop
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin', 'manager']);

    // Get all orders for this shop
    const allOrders = await this.db.queryEntities(EntityType.ORDER, {
      filters: {},
    });

    // Filter orders that contain items from this shop
    const shopOrders = (allOrders.data || []).filter((order: any) =>
      order.items?.some((item: any) => item.shopId === shopId)
    );

    // Aggregate customer data from orders
    const customerMap = new Map();

    for (const order of shopOrders) {
      const customerId = order.userId;

      // Skip if customerId is not defined
      if (!customerId) continue;

      if (!customerMap.has(customerId)) {
        // Get user data from database auth
        const userResponse: any = await this.db.getUserById(customerId);
        const userData = userResponse?.data?.user;

        // Calculate customer stats
        const customerOrders = shopOrders.filter((o: any) => o.userId === customerId);
        const totalSpent = customerOrders.reduce((sum: number, o: any) => {
          const shopItemsTotal = o.items
            ?.filter((item: any) => item.shopId === shopId)
            .reduce((itemSum: number, item: any) => itemSum + (item.subtotal || 0), 0) || 0;
          return sum + shopItemsTotal;
        }, 0);

        const lastOrder = customerOrders.sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        const firstOrder = customerOrders.sort((a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[0];

        // Determine customer status
        const daysSinceLastOrder = lastOrder
          ? Math.floor((Date.now() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        let status: 'active' | 'inactive' | 'vip' = 'active';
        if (daysSinceLastOrder > 90) {
          status = 'inactive';
        } else if (totalSpent > 5000 || customerOrders.length > 20) {
          status = 'vip';
        }

        customerMap.set(customerId, {
          id: customerId,
          name: userData?.user_metadata?.full_name || userData?.email?.split('@')[0] || 'Anonymous',
          email: userData?.email || 'N/A',
          phone: userData?.user_metadata?.phone || userData?.phone || 'N/A',
          avatar: userData?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.email || 'User')}`,
          totalOrders: customerOrders.length,
          totalSpent: parseFloat(totalSpent.toFixed(2)),
          averageOrderValue: parseFloat((totalSpent / customerOrders.length).toFixed(2)),
          lastOrderDate: lastOrder?.createdAt || null,
          customerSince: firstOrder?.createdAt || null,
          status,
          address: order.shippingAddress?.address || 'N/A',
          city: order.shippingAddress?.city || 'N/A',
          country: order.shippingAddress?.country || 'N/A',
        });
      }
    }

    let customers = Array.from(customerMap.values());

    // Apply search filter
    if (query?.search) {
      const searchLower = query.search.toLowerCase();
      customers = customers.filter((customer: any) =>
        customer.name?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (query?.status && query.status !== 'all') {
      customers = customers.filter((customer: any) => customer.status === query.status);
    }

    // Sort customers
    const sortBy = query?.sortBy || 'name';
    const sortOrder = query?.sortOrder || 'asc';
    customers.sort((a: any, b: any) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? (aVal || '').localeCompare(bVal || '')
          : (bVal || '').localeCompare(aVal || '');
      }

      if (sortBy === 'lastOrderDate' || sortBy === 'customerSince') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // Apply pagination
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const offset = (page - 1) * limit;
    const paginatedCustomers = customers.slice(offset, offset + limit);

    return {
      data: paginatedCustomers,
      total: customers.length,
      page,
      pages: Math.ceil(customers.length / limit),
      stats: {
        totalCustomers: customers.length,
        activeCustomers: customers.filter((c: any) => c.status === 'active').length,
        vipCustomers: customers.filter((c: any) => c.status === 'vip').length,
        inactiveCustomers: customers.filter((c: any) => c.status === 'inactive').length,
      },
    };
  }

  /**
   * Get default permissions for role
   */
  private getDefaultPermissions(role: string): string[] {
    const permissionMap: Record<string, string[]> = {
      owner: ['*'],
      admin: [
        'manage_shop',
        'manage_products',
        'manage_orders',
        'manage_team',
        'view_analytics',
        'manage_settings',
      ],
      manager: [
        'manage_products',
        'manage_orders',
        'view_analytics',
      ],
      staff: [
        'view_products',
        'view_orders',
        'update_order_status',
      ],
    };

    return permissionMap[role] || [];
  }

  // ==========================================
  // STRIPE CONNECT (Vendor Payouts)
  // ==========================================

  /**
   * Create Stripe Connect account for shop
   * Uses database SDK payment module
   */
  async createStripeConnectAccount(shopId: string, userId: string): Promise<any> {
    // Verify user is owner or admin
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin']);

    // Get shop details
    const shop = await this.findOne(shopId);

    // Check if shop already has a Stripe Connect account
    if (shop.stripeAccountId) {
      throw new BadRequestException('Shop already has a Stripe Connect account');
    }

    try {
      // Create Connect account via database
      const connectAccount = await this.db.createConnectAccount({
        email: shop.businessEmail,
        businessName: shop.name,
        country: shop.businessAddress?.country || 'US',
      });

      // Update shop with Stripe Connect info
      await this.db.updateEntity(EntityType.SHOP, shopId, {
        stripeAccountId: connectAccount.accountId,
        stripeConnectStatus: 'pending',
        stripeChargesEnabled: false,
        stripePayoutsEnabled: false,
        updatedAt: new Date().toISOString(),
      });

      return {
        accountId: connectAccount.accountId,
        status: 'pending',
        message: 'Stripe Connect account created. Complete onboarding to enable payouts.',
      };
    } catch (error) {
      throw new BadRequestException('Failed to create Stripe Connect account: ' + error.message);
    }
  }

  /**
   * Get Stripe Connect onboarding link
   * Uses database SDK payment module
   */
  async getStripeConnectOnboardingLink(shopId: string, userId: string): Promise<any> {
    // Verify user is owner or admin
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin']);

    // Get shop details
    const shop = await this.findOne(shopId);

    if (!shop.stripeAccountId) {
      throw new BadRequestException('Shop does not have a Stripe Connect account. Create one first.');
    }

    try {
      // Get onboarding link via database
      const onboardingLink = await this.db.getConnectOnboardingLink();

      return {
        url: onboardingLink.onboardingUrl,
      };
    } catch (error) {
      throw new BadRequestException('Failed to get onboarding link: ' + error.message);
    }
  }

  /**
   * Get Stripe Connect account status
   * Uses database SDK payment module
   */
  async getStripeConnectStatus(shopId: string, userId: string): Promise<any> {
    // Verify user is owner or admin
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin']);

    // Get shop details
    const shop = await this.findOne(shopId);

    if (!shop.stripeAccountId) {
      return {
        connected: false,
        status: 'not_connected',
        message: 'Shop has not set up Stripe Connect yet.',
      };
    }

    try {
      // Get account status via database
      const status = await this.db.getConnectAccountStatus();

      // Determine status string from onboardingComplete
      const statusString = status.onboardingComplete ? 'active' : 'pending';

      // Update shop with latest status
      await this.db.updateEntity(EntityType.SHOP, shopId, {
        stripeConnectStatus: statusString,
        stripeChargesEnabled: status.chargesEnabled,
        stripePayoutsEnabled: status.payoutsEnabled,
        updatedAt: new Date().toISOString(),
      });

      return {
        connected: true,
        accountId: shop.stripeAccountId,
        status: statusString,
        onboardingComplete: status.onboardingComplete,
        chargesEnabled: status.chargesEnabled,
        payoutsEnabled: status.payoutsEnabled,
        detailsSubmitted: status.detailsSubmitted,
      };
    } catch (error) {
      throw new BadRequestException('Failed to get account status: ' + error.message);
    }
  }

  /**
   * Get Stripe Connect dashboard link
   * Uses database SDK payment module
   */
  async getStripeConnectDashboardLink(shopId: string, userId: string): Promise<any> {
    // Verify user is owner or admin
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin']);

    // Get shop details
    const shop = await this.findOne(shopId);

    if (!shop.stripeAccountId) {
      throw new BadRequestException('Shop does not have a Stripe Connect account.');
    }

    try {
      // Get dashboard link via database
      const dashboardLink = await this.db.getConnectDashboardLink();

      return {
        url: dashboardLink.dashboardUrl,
      };
    } catch (error) {
      throw new BadRequestException('Failed to get dashboard link: ' + error.message);
    }
  }

  // ==========================================
  // STOREFRONT BUILDER METHODS
  // ==========================================

  /**
   * Get storefront configuration for a shop
   * Auto-migrates V1 configs to V2 structure
   */
  async getStorefrontConfig(shopId: string, userId: string): Promise<any> {
    // Verify user is owner, admin, or manager
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin', 'manager']);

    const shop = await this.findOne(shopId);
    let config = shop.storefrontConfig || {};

    // Check if migration to V2 is needed (V2 has version: 2 and pages object)
    if (config && Object.keys(config).length > 0 && config.version !== 2) {
      // V1 config detected - will be migrated on frontend
      // Frontend handles migration to preserve type safety
      config = {
        ...config,
        _needsMigration: true,
      };
    }

    return {
      config,
      published: shop.storefrontPublished || false,
      publishedAt: shop.storefrontPublishedAt || null,
      shopId: shop.id,
      shopName: shop.name,
      shopSlug: shop.slug,
    };
  }

  /**
   * Save storefront configuration for a shop
   */
  async saveStorefrontConfig(shopId: string, userId: string, config: any): Promise<any> {
    // Verify user is owner or admin
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin']);

    // Ensure the config is a valid object
    if (!config || typeof config !== 'object') {
      throw new BadRequestException('Invalid storefront configuration');
    }

    // Update the shop's storefront configuration
    await this.db.updateEntity(EntityType.SHOP, shopId, {
      storefrontConfig: config,
      updatedAt: new Date().toISOString(),
    });

    const updatedShop = await this.findOne(shopId);

    return {
      message: 'Storefront configuration saved successfully',
      config: updatedShop.storefrontConfig,
      published: updatedShop.storefrontPublished || false,
      publishedAt: updatedShop.storefrontPublishedAt || null,
    };
  }

  /**
   * Publish storefront for a shop
   */
  async publishStorefront(shopId: string, userId: string): Promise<any> {
    // Verify user is owner or admin
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin']);

    const shop = await this.findOne(shopId);

    // Check if storefront config exists
    if (!shop.storefrontConfig || Object.keys(shop.storefrontConfig).length === 0) {
      throw new BadRequestException('Cannot publish an empty storefront. Please configure your storefront first.');
    }

    // Update the shop to mark storefront as published
    const publishedAt = new Date().toISOString();
    await this.db.updateEntity(EntityType.SHOP, shopId, {
      storefrontPublished: true,
      storefrontPublishedAt: publishedAt,
      updatedAt: publishedAt,
    });

    return {
      message: 'Storefront published successfully',
      published: true,
      publishedAt: publishedAt,
      shopSlug: shop.slug,
      storefrontUrl: `/store/${shop.slug}`,
    };
  }

  /**
   * Unpublish storefront for a shop
   */
  async unpublishStorefront(shopId: string, userId: string): Promise<any> {
    // Verify user is owner or admin
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin']);

    // Update the shop to mark storefront as unpublished
    await this.db.updateEntity(EntityType.SHOP, shopId, {
      storefrontPublished: false,
      updatedAt: new Date().toISOString(),
    });

    return {
      message: 'Storefront unpublished successfully',
      published: false,
    };
  }

  // ==========================================
  // MOBILE APP BUILDER METHODS
  // ==========================================

  /**
   * Upload app icon/logo to storage
   */
  async uploadAppIcon(file: Express.Multer.File, shopId: string) {
    try {
      // Generate unique filename
      const fileName = `app-icon-${shopId}-${Date.now()}-${file.originalname}`;

      // Upload file to database storage using mobile-apps bucket
      const uploadResult = await /* TODO: use StorageService */ this.db.uploadFile(
        'mobile-apps',
        file.buffer,
        fileName,
        {
          contentType: file.mimetype,
          metadata: {
            shopId,
            originalName: file.originalname,
            type: 'app-icon'
          }
        }
      );

      console.log(`[uploadAppIcon] App icon uploaded successfully: ${uploadResult.url}`);

      return {
        success: true,
        url: uploadResult.url,
        fileName: fileName,
      };
    } catch (error) {
      console.error('[uploadAppIcon] Failed to upload app icon:', error);
      throw new BadRequestException('Failed to upload app icon');
    }
  }

  /**
   * Upload shop logo or banner image to storage
   */
  async uploadShopImage(file: Express.Multer.File, shopId: string, type: 'logo' | 'banner') {
    try {
      // Generate unique filename
      const fileName = `shop-${type}-${shopId}-${Date.now()}-${file.originalname}`;

      // Upload file to database storage using shop-images bucket
      const uploadResult = await /* TODO: use StorageService */ this.db.uploadFile(
        'shop-images',
        file.buffer,
        fileName,
        {
          contentType: file.mimetype,
          metadata: {
            shopId,
            originalName: file.originalname,
            type: type
          }
        }
      );

      console.log(`[uploadShopImage] Shop ${type} uploaded successfully: ${uploadResult.url}`);

      return {
        success: true,
        url: uploadResult.url,
        fileName: fileName,
      };
    } catch (error) {
      console.error(`[uploadShopImage] Failed to upload shop ${type}:`, error);
      throw new BadRequestException(`Failed to upload shop ${type}`);
    }
  }

  /**
   * Get mobile app configuration for a shop
   * @param appType - 'customer' or 'delivery'
   */
  async getMobileAppConfig(shopId: string, userId: string): Promise<any> {
    // Verify user is owner, admin, or manager
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin', 'manager']);

    const shop = await this.findOne(shopId);

    const config = shop.mobileAppConfig || shop.mobile_app_config || {};

    console.log('📱 Getting mobile app config from DB:', config);
    console.log('📦 App config from DB:', config.appConfig);

    // Ensure appConfig and appIcon are explicitly included
    const responseConfig = {
      ...config,
      appIcon: config.appIcon || undefined,
      appConfig: config.appConfig || undefined, // Explicitly include appConfig
    };

    return {
      config: responseConfig,
      published: shop.mobileAppPublished || shop.mobile_app_published || false,
      publishedAt: shop.mobileAppPublishedAt || shop.mobile_app_published_at || null,
      shopId: shop.id,
      shopName: shop.name,
      shopSlug: shop.slug,
    };
  }

  /**
   * Get all mobile app configurations for a shop
   * Note: Now returns single unified config (one app with multiple panels)
   */
  async getAllMobileAppConfigs(shopId: string, userId: string): Promise<any> {
    // Verify user is owner, admin, or manager
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin', 'manager']);

    const shop = await this.findOne(shopId);

    return {
      config: shop.mobileAppConfig || shop.mobile_app_config || {},
      published: shop.mobileAppPublished || shop.mobile_app_published || false,
      publishedAt: shop.mobileAppPublishedAt || shop.mobile_app_published_at || null,
      shopId: shop.id,
      shopName: shop.name,
      shopSlug: shop.slug,
    };
  }

  /**
   * Save mobile app configuration for a shop
   * @param appType - 'customer' or 'delivery'
   */
  async saveMobileAppConfig(shopId: string, userId: string, config: any): Promise<any> {
    // Verify user is owner or admin
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin']);

    // Ensure the config is a valid object
    if (!config || typeof config !== 'object') {
      throw new BadRequestException('Invalid mobile app configuration');
    }

    console.log('💾 Saving mobile app config:', JSON.stringify(config, null, 2));
    console.log('📦 App config in save:', config.appConfig);

    // Prepare update data
    const updateData = {
      mobileAppConfig: config,
      updatedAt: new Date().toISOString(),
    };

    // Update the shop's mobile app configuration
    await this.db.updateEntity(EntityType.SHOP, shopId, updateData);

    const updatedShop = await this.findOne(shopId);

    console.log('✅ Saved config from DB:', updatedShop.mobileAppConfig || updatedShop.mobile_app_config);
    console.log('📦 App config from DB:', (updatedShop.mobileAppConfig || updatedShop.mobile_app_config)?.appConfig);

    return {
      message: 'Mobile app configuration saved successfully',
      config: updatedShop.mobileAppConfig || updatedShop.mobile_app_config,
      published: updatedShop.mobileAppPublished || updatedShop.mobile_app_published || false,
      publishedAt: updatedShop.mobileAppPublishedAt || updatedShop.mobile_app_published_at || null,
    };
  }

  /**
   * Publish mobile app for a shop
   */
  async publishMobileApp(shopId: string, userId: string): Promise<any> {
    // Verify user is owner or admin
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin']);

    // Check if user has mobile app access based on their plan
    const hasMobileAccess = await this.subscriptionService.hasMobileAppAccess(userId);
    if (!hasMobileAccess) {
      throw new ForbiddenException('Mobile app publishing requires a Pro or Business plan. Please upgrade your subscription to access this feature.');
    }

    const shop = await this.findOne(shopId);

    // Check if mobile app config exists
    const appConfig = shop.mobileAppConfig || shop.mobile_app_config;

    if (!appConfig || Object.keys(appConfig).length === 0) {
      throw new BadRequestException('Cannot publish an empty app. Please configure your mobile app first.');
    }

    // Prepare update data
    const publishedAt = new Date().toISOString();
    const updateData = {
      mobileAppPublished: true,
      mobileAppPublishedAt: publishedAt,
      updatedAt: publishedAt,
    };

    await this.db.updateEntity(EntityType.SHOP, shopId, updateData);

    return {
      message: 'Mobile app published successfully',
      published: true,
      publishedAt: publishedAt,
      shopSlug: shop.slug,
    };
  }

  /**
   * Unpublish mobile app for a shop
   */
  async unpublishMobileApp(shopId: string, userId: string): Promise<any> {
    // Verify user is owner or admin
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin']);

    // Prepare update data
    const updateData = {
      mobileAppPublished: false,
      updatedAt: new Date().toISOString(),
    };

    await this.db.updateEntity(EntityType.SHOP, shopId, updateData);

    return {
      message: 'Mobile app unpublished successfully',
      published: false,
    };
  }

  /**
   * Get public mobile app configuration (for mobile app - no authentication required)
   * Returns latest config immediately (auto-updates when vendor saves changes)
   */
  async getPublicMobileConfig(shopId: string): Promise<any> {
    const shop = await this.db.getEntity(EntityType.SHOP, shopId);

    if (!shop) {
      throw new Error('Shop not found');
    }

    // Return config directly (no publish check - auto-updates when config is saved)
    const config = shop.mobileAppConfig || shop.mobile_app_config || {};

    // Always use fresh shop data for shopInfo (don't use saved config.shopInfo)
    // This ensures shopInfo is always up-to-date with current shop entity data
    const shopInfo = {
      id: shop.id,
      name: shop.name,
      logo: shop.logo || null,
      description: shop.description || null,
      category: shop.category || null,
      businessEmail: shop.businessEmail || shop.business_email || null,
    };

    // Get language settings from config or use defaults
    const defaultLanguage = config.defaultLanguage || config.features?.language || 'en';
    const supportedLanguages = config.supportedLanguages || ['en', 'es', 'fr', 'ja'];

    // Return minimal config structure
    return {
      data: {
        appIcon: config.appIcon || undefined,
        theme: config.theme || {},
        navigation: config.navigation || {},
        features: config.features || {},
        appConfig: config.appConfig || undefined, // Include app config for vendors
        shopInfo,
        defaultLanguage,
        supportedLanguages,
      },
    };
  }

  /**
   * Download mobile app with shop ID and app config injected into .env files
   */
  async downloadMobileApp(
    shopId: string,
    userId: string,
    appConfig?: {
      appName?: string;
      packageName?: string;
      versionCode?: string;
      versionName?: string;
    }
  ): Promise<any> {
    // Verify user is owner or admin
    await this.verifyOwnershipOrRole(shopId, userId, ['owner', 'admin']);

    // Check if user has mobile app access based on their plan
    // Skip check in development mode for testing
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (!isDevelopment) {
      const hasMobileAccess = await this.subscriptionService.hasMobileAppAccess(userId);
      if (!hasMobileAccess) {
        throw new ForbiddenException('Mobile app download requires a Pro or Business plan. Please upgrade your subscription to access this feature.');
      }
    }

    const mobileFolderPath = path.join(process.cwd(), '..', 'mobile');

    // Check if folder exists
    if (!fs.existsSync(mobileFolderPath)) {
      throw new NotFoundException('Mobile app folder not found');
    }

    // Create temporary copy with injected shop ID
    const tempDir = path.join(process.cwd(), 'temp', `mobile-${shopId}-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    // Copy mobile folder to temp directory
    this.copyFolderRecursiveSync(mobileFolderPath, tempDir);

    // Inject shop ID and app config into ALL .env* files in the mobile root
    const envComment = `# Your Shop ID - Make sure it's set here, otherwise the app cannot find your shop`;
    const mobileRootPath = path.join(tempDir, 'mobile');

    // Find all files starting with .env in the mobile root
    if (fs.existsSync(mobileRootPath)) {
      const files = fs.readdirSync(mobileRootPath);
      const envFiles = files.filter(file => file.startsWith('.env'));

      // Inject shop ID and app config into each .env file found
      envFiles.forEach(envFile => {
        const envFilePath = path.join(mobileRootPath, envFile);
        if (fs.lstatSync(envFilePath).isFile()) {
          this.updateEnvFile(envFilePath, shopId, appConfig, envComment);
          console.log(`✅ Injected shop ID and app config into ${envFile}`);
        }
      });

      console.log(`✅ Total .env files updated: ${envFiles.length}`);
    }

    return {
      message: 'Mobile app ready for download',
      shopId,
      tempPath: tempDir,
    };
  }

  /**
   * Helper: Update or create .env file with shop ID and app config
   */
  private updateEnvFile(
    filePath: string,
    shopId: string,
    appConfig?: {
      appName?: string;
      packageName?: string;
      versionCode?: string;
      versionName?: string;
    },
    comment?: string
  ): void {
    let content = '';

    // Read existing file if it exists
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf-8');
    }

    // Remove existing SHOP_ID and app config fields and their comments if present
    content = content.replace(/# Your Shop ID.*\n/g, '');
    content = content.replace(/SHOP_ID=.*/g, '');
    content = content.replace(/APP_NAME=.*/g, '');
    content = content.replace(/PACKAGE_NAME=.*/g, '');
    content = content.replace(/VERSION_CODE=.*/g, '');
    content = content.replace(/VERSION_NAME=.*/g, '');

    // Remove multiple consecutive empty lines
    content = content.replace(/\n{3,}/g, '\n\n');

    // Trim leading/trailing whitespace
    content = content.trim();

    // Build env config section
    let envConfig = '';
    if (comment) {
      envConfig += `${comment}\n`;
    }
    envConfig += `SHOP_ID=${shopId}\n`;

    // Add app config if provided
    if (appConfig) {
      if (appConfig.appName) {
        envConfig += `APP_NAME=${appConfig.appName}\n`;
      }
      if (appConfig.packageName) {
        envConfig += `PACKAGE_NAME=${appConfig.packageName}\n`;
      }
      if (appConfig.versionCode) {
        envConfig += `VERSION_CODE=${appConfig.versionCode}\n`;
      }
      if (appConfig.versionName) {
        envConfig += `VERSION_NAME="${appConfig.versionName}"\n`;
      }
    }

    // Add config at the top, followed by existing content
    const newContent = `${envConfig}\n${content}`;

    // Write back to file
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }

  /**
   * Helper: Recursively copy folder
   */
  private copyFolderRecursiveSync(source: string, target: string): void {
    const targetFolder = path.join(target, path.basename(source));

    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    if (fs.lstatSync(source).isDirectory()) {
      const files = fs.readdirSync(source);
      files.forEach((file) => {
        const curSource = path.join(source, file);
        if (fs.lstatSync(curSource).isDirectory()) {
          this.copyFolderRecursiveSync(curSource, targetFolder);
        } else {
          const targetFile = path.join(targetFolder, file);
          fs.copyFileSync(curSource, targetFile);
        }
      });
    }
  }
}

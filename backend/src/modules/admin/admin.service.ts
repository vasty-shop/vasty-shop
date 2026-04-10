import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EntityType } from '../../database/schema';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Get all shops with filters for admin
   */
  async getShops(params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, search, page = 1, limit = 10 } = params;

    try {
      const filters: any = {};

      // Filter by status
      if (status && status !== 'all') {
        filters.status = status;
      }

      // Search by name (will be handled client-side for now)
      // TODO: Add full-text search support

      const result = await this.db.queryEntities(EntityType.SHOP, {
        filters,
        limit,
        offset: (page - 1) * limit,
        sort: { created_at: 'desc' },
      });

      const shops = result.data || [];

      // Get owner details for each shop
      const shopsWithOwners = await Promise.all(
        shops.map(async (shop: any) => {
          let ownerEmail = '';
          let ownerName = '';

          try {
            // Try to get user info from database auth
            const userResult = await this.db.listUsers({ limit: 1 });
            const users = userResult?.users || [];
            const owner = users.find((u: any) => u.id === (shop.owner_id || shop.ownerId));

            if (owner) {
              ownerEmail = owner.email || '';
              const metadata = (owner as any).user_metadata || (owner as any).raw_user_meta_data || {};
              ownerName = metadata.name || metadata.full_name || '';
            }
          } catch (err) {
            this.logger.warn(`Could not fetch owner for shop ${shop.id}`);
          }

          return {
            id: shop.id,
            name: shop.name,
            slug: shop.slug,
            description: shop.description,
            logo: shop.logo,
            banner: shop.banner,
            status: shop.status,
            ownerId: shop.owner_id || shop.ownerId,
            ownerEmail,
            ownerName,
            businessName: shop.business_name || shop.businessName,
            businessEmail: shop.business_email || shop.businessEmail,
            businessPhone: shop.business_phone || shop.businessPhone,
            businessType: shop.business_type || shop.businessType,
            isVerified: shop.is_verified || shop.isVerified,
            createdAt: shop.created_at || shop.createdAt,
            updatedAt: shop.updated_at || shop.updatedAt,
            rejectionReason: shop.rejection_reason || shop.rejectionReason,
            totalProducts: shop.total_products || shop.totalProducts || 0,
            totalOrders: shop.total_orders || shop.totalOrders || 0,
            totalSales: shop.total_sales || shop.totalSales || 0,
            rating: shop.rating || 0,
          };
        }),
      );

      // Filter by search if provided (client-side filtering)
      let filteredShops = shopsWithOwners;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredShops = shopsWithOwners.filter(
          (shop) =>
            shop.name.toLowerCase().includes(searchLower) ||
            shop.ownerEmail.toLowerCase().includes(searchLower) ||
            shop.ownerName.toLowerCase().includes(searchLower),
        );
      }

      return {
        data: filteredShops,
        total: result.count || filteredShops.length,
        page,
        limit,
        totalPages: Math.ceil((result.count || filteredShops.length) / limit),
      };
    } catch (error) {
      this.logger.error('Failed to get shops for admin', error);
      throw new BadRequestException('Failed to get shops');
    }
  }

  /**
   * Get detailed shop information
   */
  async getShopDetails(shopId: string) {
    try {
      const shop = await this.db.getEntity(EntityType.SHOP, shopId);

      if (!shop) {
        throw new NotFoundException('Shop not found');
      }

      // Get owner details
      let ownerEmail = '';
      let ownerName = '';

      try {
        const userResult = await this.db.listUsers({ limit: 100 });
        const users = userResult?.users || [];
        const owner = users.find((u: any) => u.id === (shop.owner_id || shop.ownerId));

        if (owner) {
          ownerEmail = owner.email || '';
          const metadata = (owner as any).user_metadata || (owner as any).raw_user_meta_data || {};
          ownerName = metadata.name || metadata.full_name || '';
        }
      } catch (err) {
        this.logger.warn(`Could not fetch owner for shop ${shop.id}`);
      }

      // Get product count
      const productsResult = await this.db.queryEntities(
        EntityType.PRODUCT,
        {
          filters: { shopId: shopId },
          limit: 1000,
        },
      );

      // Get order count
      const ordersResult = await this.db.queryEntities(
        EntityType.ORDER,
        {
          filters: { shopId: shopId },
          limit: 1000,
        },
      );

      return {
        ...shop,
        ownerEmail,
        ownerName,
        productCount: productsResult.count || 0,
        orderCount: ordersResult.count || 0,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Failed to get shop details', error);
      throw new BadRequestException('Failed to get shop details');
    }
  }

  /**
   * Approve a pending shop
   */
  async approveShop(shopId: string) {
    try {
      this.logger.log(`Approving shop: ${shopId}`);

      const shop = await this.db.getEntity(EntityType.SHOP, shopId);
      this.logger.log(`Found shop: ${JSON.stringify(shop)}`);

      if (!shop) {
        throw new NotFoundException('Shop not found');
      }

      // Allow approving from any non-active status
      if (shop.status === 'active') {
        // Return success even if already active
        return {
          message: 'Shop is already active',
          shop: shop,
        };
      }

      const updatedShop = await this.db.updateEntity(
        EntityType.SHOP,
        shopId,
        {
          status: 'active',
          is_verified: true,
          verified_at: new Date().toISOString(),
          rejection_reason: null,
          updated_at: new Date().toISOString(),
        },
      );

      this.logger.log(`Shop ${shopId} approved successfully`);

      // TODO: Send notification email to shop owner

      return {
        message: 'Shop approved successfully',
        shop: updatedShop,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to approve shop ${shopId}:`, error);
      throw new BadRequestException(`Failed to approve shop: ${error.message}`);
    }
  }

  /**
   * Reject a pending shop
   */
  async rejectShop(shopId: string, reason: string) {
    try {
      this.logger.log(`Rejecting shop: ${shopId} with reason: ${reason}`);

      if (!reason || reason.trim() === '') {
        throw new BadRequestException('Rejection reason is required');
      }

      const shop = await this.db.getEntity(EntityType.SHOP, shopId);

      if (!shop) {
        throw new NotFoundException('Shop not found');
      }

      const updatedShop = await this.db.updateEntity(
        EntityType.SHOP,
        shopId,
        {
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
        },
      );

      this.logger.log(`Shop ${shopId} rejected successfully`);

      // TODO: Send notification email to shop owner

      return {
        message: 'Shop rejected',
        shop: updatedShop,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to reject shop ${shopId}:`, error);
      throw new BadRequestException(`Failed to reject shop: ${error.message}`);
    }
  }

  /**
   * Suspend an active shop
   */
  async suspendShop(shopId: string, reason: string) {
    try {
      const shop = await this.db.getEntity(EntityType.SHOP, shopId);

      if (!shop) {
        throw new NotFoundException('Shop not found');
      }

      if (shop.status !== 'active') {
        throw new BadRequestException('Only active shops can be suspended');
      }

      const updatedShop = await this.db.updateEntity(
        EntityType.SHOP,
        shopId,
        {
          status: 'suspended',
          suspension_reason: reason,
          suspended_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      );

      this.logger.log(`Shop ${shopId} suspended: ${reason}`);

      return {
        message: 'Shop suspended',
        shop: updatedShop,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error('Failed to suspend shop', error);
      throw new BadRequestException('Failed to suspend shop');
    }
  }

  /**
   * Reactivate a suspended shop
   */
  async activateShop(shopId: string) {
    try {
      const shop = await this.db.getEntity(EntityType.SHOP, shopId);

      if (!shop) {
        throw new NotFoundException('Shop not found');
      }

      const updatedShop = await this.db.updateEntity(
        EntityType.SHOP,
        shopId,
        {
          status: 'active',
          suspension_reason: null,
          suspended_at: null,
          updated_at: new Date().toISOString(),
        },
      );

      this.logger.log(`Shop ${shopId} reactivated`);

      return {
        message: 'Shop activated',
        shop: updatedShop,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error('Failed to activate shop', error);
      throw new BadRequestException('Failed to activate shop');
    }
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  /**
   * Get all users with filters for admin
   */
  async getUsers(params: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const { search, role, status, page = 1, limit = 15, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    try {
      // Get all users from database auth
      const userResult = await this.db.listUsers({ limit: 1000 });
      const rawUsers = userResult?.users || [];

      // Get all shops to determine which users are vendors
      let shopOwnerIds: Set<string> = new Set();
      try {
        const shopsResult = await this.db.queryEntities(EntityType.SHOP, { limit: 1000 });
        const shops = shopsResult.data || [];
        shops.forEach((shop: any) => {
          const ownerId = shop.owner_id || shop.ownerId;
          if (ownerId) shopOwnerIds.add(ownerId);
        });
      } catch (e) {
        this.logger.warn('Could not fetch shops for role detection');
      }

      // Get all orders to determine which users are customers
      let customerUserIds: Set<string> = new Set();
      try {
        const ordersResult = await this.db.queryEntities(EntityType.ORDER, { limit: 10000 });
        const orders = ordersResult.data || [];
        orders.forEach((order: any) => {
          const userId = order.user_id || order.userId;
          if (userId) customerUserIds.add(userId);
        });
      } catch (e) {
        this.logger.warn('Could not fetch orders for role detection');
      }

      // Transform users to expected format
      let users: any[] = rawUsers.map((user: any) => {
        // Check multiple possible metadata locations (database vs raw data)
        const userMetadata = user.user_metadata || user.raw_user_meta_data || {};
        const appMetadata = user.app_metadata || user.raw_app_meta_data || {};
        const directMetadata = user.metadata || {}; // Some SDKs use this

        // Check all possible locations for role
        const explicitRole =
          user.role ||  // Direct role on user
          directMetadata.role ||  // user.metadata.role
          userMetadata.role ||  // user.user_metadata.role
          appMetadata.role ||  // user.app_metadata.role
          directMetadata.user_role ||
          userMetadata.user_role ||
          appMetadata.user_role;

        // Debug log for role detection
        this.logger.debug(`User ${user.email}: user.role=${user.role}, directMetadata.role=${directMetadata.role}, userMetadata.role=${userMetadata.role}, appMetadata.role=${appMetadata.role}`);

        // Determine role priority: admin > delivery_man > vendor > customer > user
        let userRole = explicitRole;

        // If explicit role is admin or delivery_man, keep it
        if (userRole === 'admin' || userRole === 'delivery_man') {
          // Keep the explicit role
        }
        // If no explicit role or it's generic, determine from data
        else if (!userRole || userRole === 'user' || userRole === 'customer') {
          if (shopOwnerIds.has(user.id)) {
            userRole = 'vendor';
          } else if (customerUserIds.has(user.id)) {
            userRole = 'customer';
          } else {
            userRole = 'user';
          }
        }

        // Combine metadata for name/phone
        const combinedMetadata = { ...directMetadata, ...userMetadata };

        // database auth uses created_at, fallback to last_sign_in_at (created_at may not be returned by listUsers)
        const userCreatedAt = user.created_at || user.last_sign_in_at || user.email_confirmed_at;

        return {
          id: user.id,
          email: user.email,
          name: combinedMetadata.name || combinedMetadata.full_name || user.email?.split('@')[0] || 'User',
          phone: combinedMetadata.phone || '',
          role: userRole,
          isActive: !user.banned_until,
          isSuspended: !!user.banned_until,
          status: user.banned_until ? 'suspended' : 'active',
          createdAt: userCreatedAt,
          lastLoginAt: user.last_sign_in_at,
          emailVerified: !!user.email_confirmed_at,
          metadata: combinedMetadata,
          appMetadata, // Include for debugging
        };
      });

      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter((user: any) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      }

      // Filter by role
      if (role && role !== 'all') {
        users = users.filter((user: any) => user.role === role);
      }

      // Filter by status
      if (status && status !== 'all') {
        users = users.filter((user: any) => user.status === status);
      }

      // Sort
      users.sort((a: any, b: any) => {
        const aVal = a[sortBy] || '';
        const bVal = b[sortBy] || '';
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });

      // Calculate stats
      const stats = {
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.status === 'active').length,
        customers: users.filter((u: any) => u.role === 'customer').length,
        vendors: users.filter((u: any) => u.role === 'vendor').length,
        admins: users.filter((u: any) => u.role === 'admin').length,
        suspendedUsers: users.filter((u: any) => u.status === 'suspended').length,
      };

      // Paginate
      const startIndex = (page - 1) * limit;
      const paginatedUsers = users.slice(startIndex, startIndex + limit);

      return {
        data: paginatedUsers,
        total: users.length,
        page,
        limit,
        totalPages: Math.ceil(users.length / limit),
        stats,
      };
    } catch (error) {
      this.logger.error('Failed to get users for admin', error);
      throw new BadRequestException('Failed to get users');
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId: string) {
    try {
      const ordersResult = await this.db.queryEntities(EntityType.ORDER, {
        filters: { userId },
        limit: 100,
      });

      const orders = (ordersResult.data || []).map((order: any) => ({
        id: order.id,
        orderNumber: order.order_number || order.orderNumber || `ORD-${order.id.slice(0, 8)}`,
        total: order.total || order.total_amount || 0,
        status: order.status || 'pending',
        createdAt: order.created_at || order.createdAt,
      }));

      return { data: orders };
    } catch (error) {
      this.logger.error(`Failed to get orders for user ${userId}`, error);
      return { data: [] };
    }
  }

  /**
   * Get user shops
   */
  async getUserShops(userId: string) {
    try {
      const shopsResult = await this.db.queryEntities(EntityType.SHOP, {
        filters: { owner_id: userId },
        limit: 100,
      });

      const shops = (shopsResult.data || []).map((shop: any) => ({
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        status: shop.status,
      }));

      return { data: shops };
    } catch (error) {
      this.logger.error(`Failed to get shops for user ${userId}`, error);
      return { data: [] };
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: string) {
    try {
      // Update user metadata via database auth
      await this.db.updateUserMetadata(userId, { role });

      this.logger.log(`User ${userId} role updated to ${role}`);

      return { message: 'User role updated successfully', role };
    } catch (error) {
      this.logger.error(`Failed to update role for user ${userId}`, error);
      throw new BadRequestException('Failed to update user role');
    }
  }

  /**
   * Update user status (suspend/activate)
   */
  async updateUserStatus(userId: string, status: string) {
    try {
      if (status === 'suspended') {
        // Ban user for 100 years (effectively permanent)
        const banUntil = new Date();
        banUntil.setFullYear(banUntil.getFullYear() + 100);
        await this.db.banUser(userId, banUntil.toISOString());
      } else {
        // Unban user
        await this.db.unbanUser(userId);
      }

      this.logger.log(`User ${userId} status updated to ${status}`);

      return { message: `User ${status === 'suspended' ? 'suspended' : 'activated'} successfully` };
    } catch (error) {
      this.logger.error(`Failed to update status for user ${userId}`, error);
      throw new BadRequestException('Failed to update user status');
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string) {
    try {
      await this.db.deleteUser(userId);

      this.logger.log(`User ${userId} deleted`);

      return { message: 'User deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete user ${userId}`, error);
      throw new BadRequestException('Failed to delete user');
    }
  }

  /**
   * Bulk action on users
   */
  async bulkAction(userIds: string[], action: string) {
    const results = { success: 0, failed: 0 };

    for (const userId of userIds) {
      try {
        switch (action) {
          case 'suspend':
            await this.updateUserStatus(userId, 'suspended');
            break;
          case 'activate':
            await this.updateUserStatus(userId, 'active');
            break;
          case 'delete':
            await this.deleteUser(userId);
            break;
          default:
            throw new Error(`Unknown action: ${action}`);
        }
        results.success++;
      } catch (error) {
        results.failed++;
        this.logger.warn(`Failed to ${action} user ${userId}:`, error);
      }
    }

    return {
      message: `Bulk ${action} completed`,
      success: results.success,
      failed: results.failed,
    };
  }

  /**
   * Export users as CSV
   */
  async exportUsers(params: { role?: string; status?: string; search?: string }) {
    const usersResult = await this.getUsers({ ...params, limit: 10000 });
    const users = usersResult.data;

    // Generate CSV
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Created At'];
    const rows = users.map((user: any) => [
      user.id,
      user.name,
      user.email,
      user.phone || '',
      user.role,
      user.status,
      user.createdAt ? new Date(user.createdAt).toISOString() : '',
    ]);

    const csv = [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');

    return csv;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      // Get shop counts by status
      const allShops = await this.db.queryEntities(EntityType.SHOP, {
        limit: 1000,
      });

      const shops = allShops.data || [];

      const pendingShops = shops.filter((s: any) => s.status === 'pending').length;
      const activeShops = shops.filter((s: any) => s.status === 'active').length;
      const rejectedShops = shops.filter((s: any) => s.status === 'rejected').length;
      const suspendedShops = shops.filter((s: any) => s.status === 'suspended').length;

      // Get total products
      const products = await this.db.queryEntities(EntityType.PRODUCT, {
        limit: 1000,
      });

      // Get total orders
      const orders = await this.db.queryEntities(EntityType.ORDER, {
        limit: 1000,
      });

      // Get users count
      let totalUsers = 0;
      try {
        const userResult = await this.db.listUsers({ limit: 1000 }) as any;
        // Handle different response formats
        if (userResult?.total !== undefined) {
          totalUsers = userResult.total;
        } else if (userResult?.data?.length !== undefined) {
          totalUsers = userResult.data.length;
        } else if (Array.isArray(userResult)) {
          totalUsers = userResult.length;
        } else if (userResult?.users?.length !== undefined) {
          totalUsers = userResult.users.length;
        }
        this.logger.log(`Total users count: ${totalUsers}`);
      } catch (err: any) {
        this.logger.warn('Could not get user count:', err?.message);
      }

      return {
        shops: {
          total: shops.length,
          pending: pendingShops,
          active: activeShops,
          rejected: rejectedShops,
          suspended: suspendedShops,
        },
        products: {
          total: products.count || 0,
        },
        orders: {
          total: orders.count || 0,
        },
        users: {
          total: totalUsers,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get dashboard stats', error);
      throw new BadRequestException('Failed to get dashboard stats');
    }
  }

  /**
   * Get detailed dashboard statistics for admin dashboard page
   */
  async getDashboardStatsDetailed() {
    try {
      // Get basic stats
      const basicStats = await this.getDashboardStats();

      // Get orders for revenue calculation
      const ordersResult = await this.db.queryEntities(EntityType.ORDER, {
        limit: 1000,
      });
      const orders = ordersResult.data || [];

      // Calculate total revenue (parse as float to avoid string concatenation)
      const totalRevenue = orders.reduce((sum: number, order: any) => {
        const orderTotal = parseFloat(order.total) || parseFloat(order.total_amount) || 0;
        return sum + orderTotal;
      }, 0);

      // Calculate revenue overview for last 7 days
      const revenueOverview = this.calculateRevenueOverview(orders);

      // Get category distribution from shops
      const categoryDistribution = await this.getCategoryDistribution();

      return {
        totalUsers: basicStats.users.total,
        totalShops: basicStats.shops.total,
        totalOrders: basicStats.orders.total,
        totalRevenue,
        pendingShops: basicStats.shops.pending,
        activeShops: basicStats.shops.active,
        // Change percentages (would need historical data for real calculations)
        usersChange: 5.2,
        shopsChange: 12.5,
        ordersChange: 8.3,
        revenueChange: 15.7,
        // Chart data
        revenueOverview,
        categoryDistribution,
      };
    } catch (error) {
      this.logger.error('Failed to get detailed dashboard stats', error);
      throw new BadRequestException('Failed to get dashboard stats');
    }
  }

  /**
   * Calculate revenue overview for last 7 days
   */
  private calculateRevenueOverview(orders: any[]): { name: string; revenue: number; orders: number }[] {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7Days: { name: string; revenue: number; orders: number; date: string }[] = [];

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = dayNames[date.getDay()];
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push({ name: dayName, revenue: 0, orders: 0, date: dateStr });
    }

    // Aggregate orders by day
    for (const order of orders) {
      const orderDate = new Date(order.created_at || order.createdAt);
      const orderDateStr = orderDate.toISOString().split('T')[0];

      const dayData = last7Days.find(d => d.date === orderDateStr);
      if (dayData) {
        dayData.revenue += parseFloat(order.total) || 0;
        dayData.orders += 1;
      }
    }

    // Return without the date field
    return last7Days.map(({ name, revenue, orders }) => ({
      name,
      revenue: Math.round(revenue * 100) / 100,
      orders,
    }));
  }

  /**
   * Get category distribution from shops
   */
  private async getCategoryDistribution(): Promise<{ name: string; value: number; color: string }[]> {
    const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

    try {
      // Get all shops with their categories
      const shopsResult = await this.db.queryEntities(EntityType.SHOP, {
        limit: 1000,
      });
      const shops = shopsResult.data || [];

      // Count shops by category
      const categoryCount: Record<string, number> = {};
      for (const shop of shops) {
        const category = shop.category || shop.business_type || 'Other';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }

      // Convert to array and calculate percentages
      const totalShops = shops.length || 1;
      const categories = Object.entries(categoryCount)
        .map(([name, count], index) => ({
          name,
          value: Math.round((count / totalShops) * 100),
          color: colors[index % colors.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6 categories

      return categories.length > 0 ? categories : [
        { name: 'No Data', value: 100, color: '#9CA3AF' }
      ];
    } catch (error) {
      this.logger.warn('Failed to get category distribution:', error);
      return [{ name: 'No Data', value: 100, color: '#9CA3AF' }];
    }
  }

  /**
   * Get recent activity for admin dashboard
   */
  async getRecentActivity(limit: number = 10) {
    try {
      const activities: any[] = [];

      // Get recent orders
      const ordersResult = await this.db.queryEntities(EntityType.ORDER, {
        limit: 5,
        sort: { created_at: 'desc' },
      });

      const orders = ordersResult.data || [];
      orders.forEach((order: any) => {
        activities.push({
          id: order.id,
          type: 'order',
          title: `New Order #${order.order_number || order.id.slice(0, 8)}`,
          description: `Order placed for $${order.total || order.total_amount || 0}`,
          time: order.created_at || order.createdAt,
          timeAgo: this.getTimeAgo(order.created_at || order.createdAt),
          status: order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'failed' : 'pending',
        });
      });

      // Get recent shops
      const shopsResult = await this.db.queryEntities(EntityType.SHOP, {
        limit: 5,
        sort: { created_at: 'desc' },
      });

      const shops = shopsResult.data || [];
      shops.forEach((shop: any) => {
        activities.push({
          id: shop.id,
          type: 'shop',
          title: `New Shop Registration`,
          description: `${shop.name} registered`,
          time: shop.created_at || shop.createdAt,
          timeAgo: this.getTimeAgo(shop.created_at || shop.createdAt),
          status: shop.status === 'active' ? 'success' : shop.status === 'rejected' ? 'failed' : 'pending',
        });
      });

      // Sort by time and limit
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      return { data: activities.slice(0, limit) };
    } catch (error) {
      this.logger.error('Failed to get recent activity', error);
      return { data: [] };
    }
  }

  /**
   * Helper to get time ago string
   */
  private getTimeAgo(dateString: string): string {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }

  // ============================================
  // ANALYTICS
  // ============================================

  /**
   * Get analytics overview
   */
  async getAnalyticsOverview(dateRange?: string) {
    const stats = await this.getDashboardStatsDetailed();
    return stats;
  }

  /**
   * Get revenue data for charts
   */
  async getRevenueData(dateRange?: string, timeframe?: string) {
    try {
      const ordersResult = await this.db.queryEntities(EntityType.ORDER, {
        limit: 1000,
      });
      const orders = ordersResult.data || [];

      // Group by day for the last 7 days
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const revenueByDay: Record<string, number> = {};
      const ordersByDay: Record<string, number> = {};

      days.forEach(day => {
        revenueByDay[day] = 0;
        ordersByDay[day] = 0;
      });

      orders.forEach((order: any) => {
        const date = new Date(order.created_at || order.createdAt);
        const dayName = days[date.getDay()];
        revenueByDay[dayName] += order.total || order.total_amount || 0;
        ordersByDay[dayName]++;
      });

      return days.map(day => ({
        name: day,
        revenue: Math.round(revenueByDay[day]),
        orders: ordersByDay[day],
      }));
    } catch (error) {
      this.logger.error('Failed to get revenue data', error);
      return [];
    }
  }

  /**
   * Get orders data for charts
   */
  async getOrdersData(dateRange?: string, timeframe?: string) {
    try {
      const ordersResult = await this.db.queryEntities(EntityType.ORDER, {
        limit: 1000,
      });
      const orders = ordersResult.data || [];

      // Group by status
      const statusCounts: Record<string, number> = {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        completed: 0,
        cancelled: 0,
      };

      orders.forEach((order: any) => {
        const status = order.status || 'pending';
        if (statusCounts[status] !== undefined) {
          statusCounts[status]++;
        }
      });

      return Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
      }));
    } catch (error) {
      this.logger.error('Failed to get orders data', error);
      return [];
    }
  }

  /**
   * Get users data for charts
   */
  async getUsersData(dateRange?: string, timeframe?: string) {
    try {
      const userResult = await this.db.listUsers({ limit: 1000 });
      const users = userResult?.users || [];

      // Group by month for the last 6 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const usersByMonth: Record<string, number> = {};

      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        usersByMonth[months[date.getMonth()]] = 0;
      }

      users.forEach((user: any) => {
        const date = new Date(user.created_at);
        const monthName = months[date.getMonth()];
        if (usersByMonth[monthName] !== undefined) {
          usersByMonth[monthName]++;
        }
      });

      return Object.entries(usersByMonth).map(([month, count]) => ({
        name: month,
        users: count,
      }));
    } catch (error) {
      this.logger.error('Failed to get users data', error);
      return [];
    }
  }

  /**
   * Get categories data
   */
  async getCategoriesData(dateRange?: string) {
    try {
      const productsResult = await this.db.queryEntities(EntityType.PRODUCT, {
        limit: 1000,
      });
      const products = productsResult.data || [];

      // Group by category
      const categoryStats: Record<string, { count: number; sales: number }> = {};

      products.forEach((product: any) => {
        const category = product.category || 'Uncategorized';
        if (!categoryStats[category]) {
          categoryStats[category] = { count: 0, sales: 0 };
        }
        categoryStats[category].count++;
        categoryStats[category].sales += product.sold_count || 0;
      });

      const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

      return Object.entries(categoryStats)
        .slice(0, 7)
        .map(([name, data], index) => ({
          name,
          value: data.count,
          sales: data.sales,
          color: colors[index % colors.length],
        }));
    } catch (error) {
      this.logger.error('Failed to get categories data', error);
      return [];
    }
  }

  /**
   * Get top performing shops
   */
  async getTopShops(dateRange?: string, limit: number = 10) {
    try {
      const shopsResult = await this.db.queryEntities(EntityType.SHOP, {
        filters: { status: 'active' },
        limit: 100,
      });
      const shops = shopsResult.data || [];

      // Sort by total_sales or calculate from orders
      return shops
        .sort((a: any, b: any) => (b.total_sales || 0) - (a.total_sales || 0))
        .slice(0, limit)
        .map((shop: any, index: number) => ({
          rank: index + 1,
          id: shop.id,
          name: shop.name,
          logo: shop.logo,
          revenue: shop.total_sales || 0,
          orders: shop.total_orders || 0,
          rating: shop.rating || 0,
        }));
    } catch (error) {
      this.logger.error('Failed to get top shops', error);
      return [];
    }
  }

  /**
   * Get top selling products
   */
  async getTopProducts(dateRange?: string, limit: number = 10) {
    try {
      const productsResult = await this.db.queryEntities(EntityType.PRODUCT, {
        limit: 100,
      });
      const products = productsResult.data || [];

      return products
        .sort((a: any, b: any) => (b.sold_count || 0) - (a.sold_count || 0))
        .slice(0, limit)
        .map((product: any, index: number) => ({
          rank: index + 1,
          id: product.id,
          name: product.name,
          image: product.images?.[0] || '',
          price: product.price || 0,
          sold: product.sold_count || 0,
          revenue: (product.price || 0) * (product.sold_count || 0),
        }));
    } catch (error) {
      this.logger.error('Failed to get top products', error);
      return [];
    }
  }

  /**
   * Get top spending customers
   */
  async getTopCustomers(dateRange?: string, limit: number = 10) {
    try {
      const ordersResult = await this.db.queryEntities(EntityType.ORDER, {
        limit: 1000,
      });
      const orders = ordersResult.data || [];

      // Group orders by user
      const customerStats: Record<string, { total: number; orders: number; email: string }> = {};

      orders.forEach((order: any) => {
        const userId = order.user_id || order.userId;
        if (!userId) return;

        if (!customerStats[userId]) {
          customerStats[userId] = {
            total: 0,
            orders: 0,
            email: order.customer_email || order.customerEmail || 'Unknown',
          };
        }
        customerStats[userId].total += order.total || order.total_amount || 0;
        customerStats[userId].orders++;
      });

      return Object.entries(customerStats)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, limit)
        .map(([id, data], index) => ({
          rank: index + 1,
          id,
          email: data.email,
          totalSpent: data.total,
          orders: data.orders,
        }));
    } catch (error) {
      this.logger.error('Failed to get top customers', error);
      return [];
    }
  }

  // ============================================
  // SETTINGS
  // ============================================

  /**
   * Get platform settings
   */
  async getSettings() {
    try {
      // Try to get settings from database
      const settingsResult = await this.db.queryEntities('settings' as any, {
        limit: 1,
      });

      const dbSettings = settingsResult.data?.[0] || {};

      // Return settings in the nested format frontend expects
      return {
        general: {
          platformName: dbSettings.platformName || dbSettings.platform_name || 'Vasty Shop',
          platformLogo: dbSettings.platformLogo || dbSettings.platform_logo || '',
          supportEmail: dbSettings.supportEmail || dbSettings.support_email || 'support@vasty.shop',
          defaultCurrency: dbSettings.defaultCurrency || dbSettings.default_currency || 'USD',
          defaultLanguage: dbSettings.defaultLanguage || dbSettings.default_language || 'en',
        },
        commission: {
          platformCommissionRate: dbSettings.platformCommissionRate || dbSettings.platform_commission_rate || 10,
          minimumOrderAmount: dbSettings.minimumOrderAmount || dbSettings.minimum_order_amount || 0,
          freeShippingThreshold: dbSettings.freeShippingThreshold || dbSettings.free_shipping_threshold || 50,
        },
        shops: {
          autoApproveShops: dbSettings.autoApproveShops ?? dbSettings.auto_approve_shops ?? false,
          requiredDocuments: dbSettings.requiredDocuments || dbSettings.required_documents || [],
          maxProductsPerShop: dbSettings.maxProductsPerShop || dbSettings.max_products_per_shop || 1000,
          allowedCategories: dbSettings.allowedCategories || dbSettings.allowed_categories || [],
        },
        payment: {
          stripe: {
            enabled: dbSettings.stripeEnabled ?? dbSettings.stripe_enabled ?? true,
            status: dbSettings.stripeStatus || dbSettings.stripe_status || 'active',
          },
          paypal: {
            enabled: dbSettings.paypalEnabled ?? dbSettings.paypal_enabled ?? false,
            status: dbSettings.paypalStatus || dbSettings.paypal_status || 'inactive',
          },
          cod: {
            enabled: dbSettings.codEnabled ?? dbSettings.cod_enabled ?? true,
            status: dbSettings.codStatus || dbSettings.cod_status || 'active',
          },
        },
        notifications: {
          emailNotifications: dbSettings.emailNotifications ?? dbSettings.email_notifications ?? true,
          pushNotifications: dbSettings.pushNotifications ?? dbSettings.push_notifications ?? false,
          smsNotifications: dbSettings.smsNotifications ?? dbSettings.sms_notifications ?? false,
        },
        maintenance: {
          maintenanceMode: dbSettings.maintenanceMode ?? dbSettings.maintenance_mode ?? false,
          maintenanceMessage: dbSettings.maintenanceMessage || dbSettings.maintenance_message || '',
        },
        api: {
          webhookUrl: dbSettings.webhookUrl || dbSettings.webhook_url || '',
          apiKey: dbSettings.apiKey || dbSettings.api_key || 'fxz_' + Math.random().toString(36).substr(2, 24),
          apiVersion: 'v1',
          rateLimitPerMinute: dbSettings.rateLimitPerMinute || dbSettings.rate_limit_per_minute || 60,
        },
      };
    } catch (error) {
      this.logger.warn('Failed to get settings, returning defaults');
      return this.getDefaultSettings();
    }
  }

  /**
   * Get default settings
   */
  private getDefaultSettings() {
    return {
      general: {
        platformName: 'Vasty Shop',
        platformLogo: '',
        supportEmail: 'support@vasty.shop',
        defaultCurrency: 'USD',
        defaultLanguage: 'en',
      },
      commission: {
        platformCommissionRate: 10,
        minimumOrderAmount: 0,
        freeShippingThreshold: 50,
      },
      shops: {
        autoApproveShops: false,
        requiredDocuments: [],
        maxProductsPerShop: 1000,
        allowedCategories: [],
      },
      payment: {
        stripe: { enabled: true, status: 'active' },
        paypal: { enabled: false, status: 'inactive' },
        cod: { enabled: true, status: 'active' },
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: false,
      },
      maintenance: {
        maintenanceMode: false,
        maintenanceMessage: '',
      },
      api: {
        webhookUrl: '',
        apiKey: 'fxz_' + Math.random().toString(36).substr(2, 24),
        apiVersion: 'v1',
        rateLimitPerMinute: 60,
      },
    };
  }

  /**
   * Update platform settings
   */
  async updateSettings(settings: any) {
    try {
      // Flatten nested settings for database storage
      const flatSettings: any = {};

      if (settings.general) {
        flatSettings.platform_name = settings.general.platformName;
        flatSettings.platform_logo = settings.general.platformLogo;
        flatSettings.support_email = settings.general.supportEmail;
        flatSettings.default_currency = settings.general.defaultCurrency;
        flatSettings.default_language = settings.general.defaultLanguage;
      }

      if (settings.commission) {
        flatSettings.platform_commission_rate = settings.commission.platformCommissionRate;
        flatSettings.minimum_order_amount = settings.commission.minimumOrderAmount;
        flatSettings.free_shipping_threshold = settings.commission.freeShippingThreshold;
      }

      if (settings.shops) {
        flatSettings.auto_approve_shops = settings.shops.autoApproveShops;
        flatSettings.required_documents = settings.shops.requiredDocuments;
        flatSettings.max_products_per_shop = settings.shops.maxProductsPerShop;
        flatSettings.allowed_categories = settings.shops.allowedCategories;
      }

      if (settings.payment) {
        flatSettings.stripe_enabled = settings.payment.stripe?.enabled;
        flatSettings.stripe_status = settings.payment.stripe?.status;
        flatSettings.paypal_enabled = settings.payment.paypal?.enabled;
        flatSettings.paypal_status = settings.payment.paypal?.status;
        flatSettings.cod_enabled = settings.payment.cod?.enabled;
        flatSettings.cod_status = settings.payment.cod?.status;
      }

      if (settings.notifications) {
        flatSettings.email_notifications = settings.notifications.emailNotifications;
        flatSettings.push_notifications = settings.notifications.pushNotifications;
        flatSettings.sms_notifications = settings.notifications.smsNotifications;
      }

      if (settings.maintenance) {
        flatSettings.maintenance_mode = settings.maintenance.maintenanceMode;
        flatSettings.maintenance_message = settings.maintenance.maintenanceMessage;
      }

      if (settings.api) {
        flatSettings.webhook_url = settings.api.webhookUrl;
        flatSettings.rate_limit_per_minute = settings.api.rateLimitPerMinute;
      }

      // Remove undefined values
      Object.keys(flatSettings).forEach(key => {
        if (flatSettings[key] === undefined) {
          delete flatSettings[key];
        }
      });

      // Try to update existing settings or create new
      const existingResult = await this.db.queryEntities('settings' as any, {
        limit: 1,
      });

      if (existingResult.data && existingResult.data.length > 0) {
        await this.db.updateEntity('settings' as any, existingResult.data[0].id, {
          ...flatSettings,
          updated_at: new Date().toISOString(),
        });
      } else {
        await this.db.createEntity('settings' as any, {
          ...flatSettings,
          created_at: new Date().toISOString(),
        });
      }

      return { message: 'Settings updated successfully', settings };
    } catch (error) {
      this.logger.error('Failed to update settings', error);
      throw new BadRequestException('Failed to update settings');
    }
  }

  // ============================================
  // REPORTS
  // ============================================

  /**
   * Generate sales report
   */
  async generateSalesReport(params: { startDate?: string; endDate?: string }) {
    try {
      const filters: any = {};

      // Date filtering
      if (params.startDate) {
        filters.created_at = { $gte: params.startDate };
      }
      if (params.endDate) {
        if (filters.created_at) {
          filters.created_at.$lte = params.endDate;
        } else {
          filters.created_at = { $lte: params.endDate };
        }
      }

      // Fetch all orders
      const ordersResult = await this.db.queryEntities(EntityType.ORDER, {
        filters,
        sort: { created_at: 'desc' },
        limit: 10000,
      });

      const orders = ordersResult.data || [];

      // Calculate summary statistics
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0);
      const totalOrders = orders.length;
      const paidOrders = orders.filter((o: any) => (o.payment_status || o.paymentStatus) === 'paid');
      const pendingOrders = orders.filter((o: any) => (o.payment_status || o.paymentStatus) === 'pending');
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Payment method breakdown
      const paymentMethods: Record<string, { count: number; total: number }> = {};
      orders.forEach((order: any) => {
        const method = order.payment_method || order.paymentMethod || 'unknown';
        if (!paymentMethods[method]) {
          paymentMethods[method] = { count: 0, total: 0 };
        }
        paymentMethods[method].count++;
        paymentMethods[method].total += parseFloat(order.total) || 0;
      });

      // Order status breakdown
      const statusBreakdown: Record<string, number> = {};
      orders.forEach((order: any) => {
        const status = order.status || 'unknown';
        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
      });

      // Format orders for CSV
      const reportData = orders.map((order: any) => ({
        orderNumber: order.order_number || order.orderNumber || order.id,
        date: order.created_at || order.createdAt,
        customer: order.shipping_address?.name || 'N/A',
        total: parseFloat(order.total) || 0,
        paymentMethod: order.payment_method || order.paymentMethod || 'N/A',
        paymentStatus: order.payment_status || order.paymentStatus || 'pending',
        orderStatus: order.status || 'pending',
      }));

      return {
        summary: {
          totalRevenue,
          totalOrders,
          paidOrders: paidOrders.length,
          pendingOrders: pendingOrders.length,
          averageOrderValue,
          paymentMethods,
          statusBreakdown,
        },
        data: reportData,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to generate sales report', error);
      throw new BadRequestException('Failed to generate sales report');
    }
  }

  /**
   * Generate users report
   */
  async generateUsersReport(params: { startDate?: string; endDate?: string }) {
    try {
      // Get all users from auth
      const usersResult: any = await this.db.listUsers();
      const users = usersResult?.data?.users || usersResult?.users || [];

      // Filter by date if needed
      let filteredUsers = users;
      if (params.startDate) {
        filteredUsers = filteredUsers.filter((u: any) =>
          new Date(u.created_at) >= new Date(params.startDate)
        );
      }
      if (params.endDate) {
        filteredUsers = filteredUsers.filter((u: any) =>
          new Date(u.created_at) <= new Date(params.endDate)
        );
      }

      // Calculate summary
      const totalUsers = filteredUsers.length;
      const verifiedUsers = filteredUsers.filter((u: any) => u.email_confirmed_at).length;
      const unverifiedUsers = totalUsers - verifiedUsers;

      // Registration by date
      const registrationsByDate: Record<string, number> = {};
      filteredUsers.forEach((user: any) => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        registrationsByDate[date] = (registrationsByDate[date] || 0) + 1;
      });

      // Format users for report
      const reportData = filteredUsers.map((user: any) => ({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'N/A',
        verified: user.email_confirmed_at ? 'Yes' : 'No',
        registeredAt: user.created_at,
        lastSignIn: user.last_sign_in_at || 'Never',
      }));

      return {
        summary: {
          totalUsers,
          verifiedUsers,
          unverifiedUsers,
          registrationsByDate,
        },
        data: reportData,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to generate users report', error);
      throw new BadRequestException('Failed to generate users report');
    }
  }

  /**
   * Generate shops report
   */
  async generateShopsReport(params: { startDate?: string; endDate?: string }) {
    try {
      const filters: any = {};

      const shopsResult = await this.db.queryEntities(EntityType.SHOP, {
        filters,
        sort: { created_at: 'desc' },
        limit: 10000,
      });

      let shops = shopsResult.data || [];

      // Filter by date if needed
      if (params.startDate) {
        shops = shops.filter((s: any) =>
          new Date(s.created_at) >= new Date(params.startDate)
        );
      }
      if (params.endDate) {
        shops = shops.filter((s: any) =>
          new Date(s.created_at) <= new Date(params.endDate)
        );
      }

      // Calculate summary
      const totalShops = shops.length;
      const activeShops = shops.filter((s: any) => s.status === 'active').length;
      const pendingShops = shops.filter((s: any) => s.status === 'pending').length;
      const suspendedShops = shops.filter((s: any) => s.status === 'suspended').length;

      // Category breakdown
      const categoryBreakdown: Record<string, number> = {};
      shops.forEach((shop: any) => {
        const category = shop.category || 'Uncategorized';
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
      });

      // Format shops for report
      const reportData = shops.map((shop: any) => ({
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        status: shop.status,
        category: shop.category || 'N/A',
        createdAt: shop.created_at,
        productsCount: shop.products_count || 0,
      }));

      return {
        summary: {
          totalShops,
          activeShops,
          pendingShops,
          suspendedShops,
          categoryBreakdown,
        },
        data: reportData,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to generate shops report', error);
      throw new BadRequestException('Failed to generate shops report');
    }
  }

  /**
   * Generate products report
   */
  async generateProductsReport(params: { startDate?: string; endDate?: string }) {
    try {
      const filters: any = {};

      const productsResult = await this.db.queryEntities(EntityType.PRODUCT, {
        filters,
        sort: { created_at: 'desc' },
        limit: 10000,
      });

      let products = productsResult.data || [];

      // Filter by date if needed
      if (params.startDate) {
        products = products.filter((p: any) =>
          new Date(p.created_at) >= new Date(params.startDate)
        );
      }
      if (params.endDate) {
        products = products.filter((p: any) =>
          new Date(p.created_at) <= new Date(params.endDate)
        );
      }

      // Calculate summary
      const totalProducts = products.length;
      const activeProducts = products.filter((p: any) => p.status === 'active').length;
      const draftProducts = products.filter((p: any) => p.status === 'draft').length;
      const outOfStock = products.filter((p: any) => (p.stock || 0) === 0).length;
      const lowStock = products.filter((p: any) => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;

      // Total inventory value
      const inventoryValue = products.reduce((sum: number, p: any) =>
        sum + ((parseFloat(p.price) || 0) * (p.stock || 0)), 0);

      // Category breakdown
      const categoryBreakdown: Record<string, number> = {};
      products.forEach((product: any) => {
        const category = product.category_name || product.category || 'Uncategorized';
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
      });

      // Format products for report
      const reportData = products.map((product: any) => ({
        id: product.id,
        name: product.name,
        sku: product.sku || 'N/A',
        price: parseFloat(product.price) || 0,
        stock: product.stock || 0,
        status: product.status,
        category: product.category_name || product.category || 'N/A',
        createdAt: product.created_at,
      }));

      return {
        summary: {
          totalProducts,
          activeProducts,
          draftProducts,
          outOfStock,
          lowStock,
          inventoryValue,
          categoryBreakdown,
        },
        data: reportData,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to generate products report', error);
      throw new BadRequestException('Failed to generate products report');
    }
  }

  // ============================================
  // LOGO & FAVICON UPLOAD
  // ============================================

  /**
   * Upload platform logo
   */
  async uploadLogo(file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      const timestamp = Date.now();
      const extension = file.originalname.split('.').pop();
      const uniqueFileName = `logo-${timestamp}.${extension}`;

      // Upload to storage
      const uploadResult = await /* TODO: use StorageService */ this.db.uploadFile(
        'platform',
        file.buffer,
        uniqueFileName,
        { contentType: file.mimetype }
      );

      // Update settings with new logo URL
      const logoUrl = uploadResult?.url || uploadResult?.path || '';
      await this.updateSettings({ logoUrl });

      this.logger.log(`Logo uploaded: ${logoUrl}`);

      return {
        success: true,
        message: 'Logo uploaded successfully',
        data: { logoUrl },
      };
    } catch (error) {
      this.logger.error('Failed to upload logo', error);
      throw new BadRequestException('Failed to upload logo');
    }
  }

  /**
   * Upload platform favicon
   */
  async uploadFavicon(file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      const timestamp = Date.now();
      const extension = file.originalname.split('.').pop();
      const uniqueFileName = `favicon-${timestamp}.${extension}`;

      // Upload to storage
      const uploadResult = await /* TODO: use StorageService */ this.db.uploadFile(
        'platform',
        file.buffer,
        uniqueFileName,
        { contentType: file.mimetype }
      );

      // Update settings with new favicon URL
      const faviconUrl = uploadResult?.url || uploadResult?.path || '';
      await this.updateSettings({ faviconUrl });

      this.logger.log(`Favicon uploaded: ${faviconUrl}`);

      return {
        success: true,
        message: 'Favicon uploaded successfully',
        data: { faviconUrl },
      };
    } catch (error) {
      this.logger.error('Failed to upload favicon', error);
      throw new BadRequestException('Failed to upload favicon');
    }
  }
}

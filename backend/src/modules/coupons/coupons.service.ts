import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SubscriptionService } from '../subscription/subscription.service';
import {
  CreateCouponDto,
  UpdateCouponDto,
  ApplyCouponDto,
  QueryCouponsDto,
  CouponUsageDto,
  BulkCouponActionDto,
  CouponType,
  CouponScope,
  CouponStatus,
  ExpenseBearer,
} from './dto/coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    private readonly db: DatabaseService,
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
  ) {}

  // ============================================
  // COUPON CRUD
  // ============================================

  /**
   * Create a new coupon
   */
  async create(dto: CreateCouponDto, creatorId: string) {
    // Check if user has promotions access based on their plan (Pro+ required)
    const hasPromotionsAccess = await this.subscriptionService.hasPromotionsAccess(creatorId);
    if (!hasPromotionsAccess) {
      throw new ForbiddenException('Coupons and promotions require a Pro or Business plan. Please upgrade your subscription to access this feature.');
    }

    // Check if code already exists
    const existing = await this.db.query_builder()
      .from('coupons')
      .select('id')
      .where('code', dto.code.toUpperCase())
      .whereNull('deleted_at')
      .get();

    if (existing && existing.length > 0) {
      throw new ConflictException('Coupon code already exists');
    }

    // Validate based on type
    if (dto.type === CouponType.BUY_X_GET_Y) {
      if (!dto.buyQuantity || !dto.getQuantity) {
        throw new BadRequestException('Buy and Get quantities are required for Buy X Get Y coupon');
      }
    }

    const coupon = await this.db.createEntity('coupons', {
      code: dto.code.toUpperCase(),
      title: dto.title || dto.code,
      description: dto.description,
      type: dto.type,
      value: dto.value,
      max_discount: dto.maxDiscount,
      min_order_amount: dto.minOrderAmount || 0,
      scope: dto.scope,
      shop_id: dto.shopId,
      category_ids: dto.categoryIds || [],
      product_ids: dto.productIds || [],
      user_ids: dto.userIds || [],
      zone_ids: dto.zoneIds || [],
      start_date: dto.startDate || new Date(),
      expiry_date: dto.expiryDate,
      total_usage_limit: dto.totalUsageLimit,
      per_user_limit: dto.perUserLimit || 1,
      expense_bearer: dto.expenseBearer,
      platform_share_percent: dto.platformSharePercent || 50,
      is_active: dto.isActive !== false,
      status: CouponStatus.ACTIVE,
      total_usage: 0,
      total_discount_given: 0,
      // Buy X Get Y fields
      buy_quantity: dto.buyQuantity,
      get_quantity: dto.getQuantity,
      get_product_ids: dto.getProductIds || [],
      get_discount_percent: dto.getDiscountPercent || 100,
      created_by: creatorId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      data: this.transformCoupon(coupon),
      message: 'Coupon created successfully',
    };
  }

  /**
   * Get all coupons with filters
   */
  async findAll(query: QueryCouponsDto) {
    const { page = 1, limit = 20, type, scope, status, shopId, search, includeExpired } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.db.query_builder()
      .from('coupons')
      .select('*')
      .whereNull('deleted_at');

    if (type) {
      queryBuilder = queryBuilder.where('type', type);
    }

    if (scope) {
      queryBuilder = queryBuilder.where('scope', scope);
    }

    if (status) {
      queryBuilder = queryBuilder.where('status', status);
    }

    if (shopId) {
      queryBuilder = queryBuilder.where('shop_id', shopId);
    }

    if (!includeExpired) {
      queryBuilder = queryBuilder.where('expiry_date', '>=', new Date().toISOString());
    }

    if (search) {
      queryBuilder = queryBuilder.where('code', 'ILIKE', `%${search}%`);
    }

    const coupons = await queryBuilder
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .get();

    // Update status for expired coupons
    const now = new Date();
    for (const coupon of (coupons || [])) {
      if (new Date(coupon.expiry_date) < now && coupon.status === CouponStatus.ACTIVE) {
        await this.db.updateEntity('coupons', coupon.id, { status: CouponStatus.EXPIRED });
        coupon.status = CouponStatus.EXPIRED;
      }
    }

    return {
      data: (coupons || []).map((c: any) => this.transformCoupon(c)),
      total: coupons?.length || 0,
      page,
      limit,
    };
  }

  /**
   * Get coupon by ID
   */
  async findById(id: string) {
    const coupon = await this.db.getEntity('coupons', id);

    if (!coupon || coupon.deleted_at) {
      throw new NotFoundException('Coupon not found');
    }

    // Get usage statistics
    const usageStats = await this.db.query_builder()
      .from('coupon_usage')
      .select('*')
      .where('coupon_id', id)
      .get();

    return {
      data: {
        ...this.transformCoupon(coupon),
        usageStats: {
          totalUsages: usageStats?.length || 0,
          totalDiscountGiven: (usageStats || []).reduce((sum: number, u: any) => sum + (u.discount_amount || 0), 0),
          platformExpense: (usageStats || []).reduce((sum: number, u: any) => sum + (u.platform_expense || 0), 0),
          vendorExpense: (usageStats || []).reduce((sum: number, u: any) => sum + (u.vendor_expense || 0), 0),
        },
      },
    };
  }

  /**
   * Get coupon by code
   */
  async findByCode(code: string) {
    const coupons = await this.db.query_builder()
      .from('coupons')
      .select('*')
      .where('code', code.toUpperCase())
      .whereNull('deleted_at')
      .get();

    if (!coupons || coupons.length === 0) {
      throw new NotFoundException('Coupon not found');
    }

    return { data: this.transformCoupon(coupons[0]) };
  }

  /**
   * Update coupon
   */
  async update(id: string, dto: UpdateCouponDto) {
    const coupon = await this.db.getEntity('coupons', id);

    if (!coupon || coupon.deleted_at) {
      throw new NotFoundException('Coupon not found');
    }

    const updates: any = { updated_at: new Date() };

    if (dto.title) updates.title = dto.title;
    if (dto.description !== undefined) updates.description = dto.description;
    if (dto.value !== undefined) updates.value = dto.value;
    if (dto.maxDiscount !== undefined) updates.max_discount = dto.maxDiscount;
    if (dto.minOrderAmount !== undefined) updates.min_order_amount = dto.minOrderAmount;
    if (dto.expiryDate) updates.expiry_date = dto.expiryDate;
    if (dto.totalUsageLimit !== undefined) updates.total_usage_limit = dto.totalUsageLimit;
    if (dto.perUserLimit !== undefined) updates.per_user_limit = dto.perUserLimit;
    if (dto.isActive !== undefined) updates.is_active = dto.isActive;

    const updated = await this.db.updateEntity('coupons', id, updates);

    return {
      data: this.transformCoupon(updated),
      message: 'Coupon updated successfully',
    };
  }

  /**
   * Delete coupon (soft delete)
   */
  async delete(id: string) {
    const coupon = await this.db.getEntity('coupons', id);

    if (!coupon || coupon.deleted_at) {
      throw new NotFoundException('Coupon not found');
    }

    await this.db.updateEntity('coupons', id, {
      deleted_at: new Date(),
      status: CouponStatus.INACTIVE,
    });

    return { message: 'Coupon deleted successfully' };
  }

  /**
   * Bulk action on coupons
   */
  async bulkAction(dto: BulkCouponActionDto) {
    const results = { success: 0, failed: 0 };

    for (const couponId of dto.couponIds) {
      try {
        switch (dto.action) {
          case 'activate':
            await this.db.updateEntity('coupons', couponId, { is_active: true, status: CouponStatus.ACTIVE });
            break;
          case 'deactivate':
            await this.db.updateEntity('coupons', couponId, { is_active: false, status: CouponStatus.INACTIVE });
            break;
          case 'delete':
            await this.delete(couponId);
            break;
        }
        results.success++;
      } catch {
        results.failed++;
      }
    }

    return { data: results, message: `${results.success} coupons updated, ${results.failed} failed` };
  }

  // ============================================
  // COUPON APPLICATION
  // ============================================

  /**
   * Validate and apply coupon
   */
  async applyCoupon(dto: ApplyCouponDto, userId: string) {
    const coupons = await this.db.query_builder()
      .from('coupons')
      .select('*')
      .where('code', dto.code.toUpperCase())
      .where('is_active', true)
      .whereNull('deleted_at')
      .get();

    if (!coupons || coupons.length === 0) {
      throw new BadRequestException('Invalid coupon code');
    }

    const coupon = coupons[0];

    // Validate coupon
    const validation = await this.validateCoupon(coupon, dto, userId);
    if (!validation.valid) {
      throw new BadRequestException(validation.message);
    }

    // Calculate discount
    const discount = this.calculateDiscount(coupon, dto);

    return {
      data: {
        couponId: coupon.id,
        code: coupon.code,
        type: coupon.type,
        discount: discount.discountAmount,
        freeItems: discount.freeItems,
        applicableItems: discount.applicableItems,
        message: discount.message,
      },
    };
  }

  /**
   * Validate coupon for user and order
   */
  private async validateCoupon(coupon: any, dto: ApplyCouponDto, userId: string) {
    const now = new Date();

    // Check dates
    if (new Date(coupon.start_date) > now) {
      return { valid: false, message: 'Coupon is not yet active' };
    }

    if (new Date(coupon.expiry_date) < now) {
      return { valid: false, message: 'Coupon has expired' };
    }

    // Check status
    if (coupon.status === CouponStatus.EXPIRED) {
      return { valid: false, message: 'Coupon has expired' };
    }

    if (coupon.status === CouponStatus.DEPLETED) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    // Check total usage limit
    if (coupon.total_usage_limit && coupon.total_usage >= coupon.total_usage_limit) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    // Check per user limit
    const userUsage = await this.db.query_builder()
      .from('coupon_usage')
      .select('id')
      .where('coupon_id', coupon.id)
      .where('user_id', userId)
      .get();

    if (coupon.per_user_limit && (userUsage?.length || 0) >= coupon.per_user_limit) {
      return { valid: false, message: 'You have already used this coupon' };
    }

    // Check minimum order amount
    if (coupon.min_order_amount && dto.subtotal && dto.subtotal < coupon.min_order_amount) {
      return { valid: false, message: `Minimum order amount is ${coupon.min_order_amount}` };
    }

    // Check scope restrictions
    if (coupon.scope === CouponScope.SHOP && coupon.shop_id && dto.shopId !== coupon.shop_id) {
      return { valid: false, message: 'Coupon not valid for this shop' };
    }

    if (coupon.scope === CouponScope.USER && coupon.user_ids?.length > 0) {
      if (!coupon.user_ids.includes(userId)) {
        return { valid: false, message: 'Coupon not valid for your account' };
      }
    }

    if (coupon.scope === CouponScope.ZONE && coupon.zone_ids?.length > 0 && dto.zoneId) {
      if (!coupon.zone_ids.includes(dto.zoneId)) {
        return { valid: false, message: 'Coupon not valid in your zone' };
      }
    }

    // Check first order coupon
    if (coupon.type === CouponType.FIRST_ORDER) {
      const previousOrders = await this.db.query_builder()
        .from('orders')
        .select('id')
        .where('user_id', userId)
        .whereIn('status', ['completed', 'delivered'])
        .get();

      if (previousOrders && previousOrders.length > 0) {
        return { valid: false, message: 'Coupon valid for first order only' };
      }
    }

    return { valid: true, message: 'Coupon is valid' };
  }

  /**
   * Calculate discount amount
   */
  private calculateDiscount(coupon: any, dto: ApplyCouponDto) {
    const subtotal = dto.subtotal || 0;
    let discountAmount = 0;
    let freeItems: any[] = [];
    let applicableItems: string[] = [];
    let message = '';

    switch (coupon.type) {
      case CouponType.PERCENTAGE:
        discountAmount = (subtotal * coupon.value) / 100;
        if (coupon.max_discount && discountAmount > coupon.max_discount) {
          discountAmount = coupon.max_discount;
        }
        message = `${coupon.value}% off applied`;
        break;

      case CouponType.FIXED:
        discountAmount = coupon.value;
        if (discountAmount > subtotal) {
          discountAmount = subtotal;
        }
        message = `$${coupon.value} off applied`;
        break;

      case CouponType.FREE_SHIPPING:
        // Free shipping - discount is the shipping cost
        discountAmount = 0; // Handled separately in order
        message = 'Free shipping applied';
        break;

      case CouponType.BUY_X_GET_Y:
        // Check if buy quantity is met
        if (dto.items) {
          const relevantItems = dto.items.filter(item =>
            coupon.product_ids?.length === 0 ||
            coupon.product_ids.includes(item.productId)
          );

          const totalQuantity = relevantItems.reduce((sum, item) => sum + item.quantity, 0);

          if (totalQuantity >= coupon.buy_quantity) {
            // Calculate how many free items
            const sets = Math.floor(totalQuantity / coupon.buy_quantity);
            const freeQuantity = sets * coupon.get_quantity;

            if (coupon.get_product_ids?.length > 0) {
              freeItems = coupon.get_product_ids.map((pid: string) => ({
                productId: pid,
                quantity: freeQuantity,
                discountPercent: coupon.get_discount_percent,
              }));
            } else {
              // Get Y from same products
              const lowestPriceItem = relevantItems.sort((a, b) => a.price - b.price)[0];
              if (lowestPriceItem) {
                discountAmount = lowestPriceItem.price * freeQuantity * (coupon.get_discount_percent / 100);
              }
            }

            message = `Buy ${coupon.buy_quantity} Get ${coupon.get_quantity} applied`;
          }
        }
        break;

      case CouponType.FIRST_ORDER:
        discountAmount = coupon.value;
        if (coupon.max_discount && discountAmount > coupon.max_discount) {
          discountAmount = coupon.max_discount;
        }
        message = 'First order discount applied';
        break;
    }

    // Handle category/product scope for partial discounts
    if (coupon.scope === CouponScope.CATEGORY && coupon.category_ids?.length > 0 && dto.items) {
      const applicableTotal = dto.items
        .filter(item => coupon.category_ids.includes(item.categoryId))
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);

      if (coupon.type === CouponType.PERCENTAGE) {
        discountAmount = (applicableTotal * coupon.value) / 100;
        if (coupon.max_discount && discountAmount > coupon.max_discount) {
          discountAmount = coupon.max_discount;
        }
      }

      applicableItems = dto.items
        .filter(item => coupon.category_ids.includes(item.categoryId))
        .map(item => item.productId);
    }

    if (coupon.scope === CouponScope.PRODUCT && coupon.product_ids?.length > 0 && dto.items) {
      const applicableTotal = dto.items
        .filter(item => coupon.product_ids.includes(item.productId))
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);

      if (coupon.type === CouponType.PERCENTAGE) {
        discountAmount = (applicableTotal * coupon.value) / 100;
        if (coupon.max_discount && discountAmount > coupon.max_discount) {
          discountAmount = coupon.max_discount;
        }
      }

      applicableItems = coupon.product_ids;
    }

    return {
      discountAmount: Math.round(discountAmount * 100) / 100,
      freeItems,
      applicableItems,
      message,
    };
  }

  /**
   * Record coupon usage
   */
  async recordUsage(dto: CouponUsageDto, userId: string) {
    const coupon = await this.db.getEntity('coupons', dto.couponId);

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Calculate expense shares
    let platformExpense = 0;
    let vendorExpense = 0;

    switch (coupon.expense_bearer) {
      case ExpenseBearer.PLATFORM:
        platformExpense = dto.discountAmount;
        break;
      case ExpenseBearer.VENDOR:
        vendorExpense = dto.discountAmount;
        break;
      case ExpenseBearer.SHARED:
        platformExpense = (dto.discountAmount * (coupon.platform_share_percent || 50)) / 100;
        vendorExpense = dto.discountAmount - platformExpense;
        break;
    }

    // Record usage
    await this.db.createEntity('coupon_usage', {
      coupon_id: dto.couponId,
      user_id: userId,
      order_id: dto.orderId,
      discount_amount: dto.discountAmount,
      platform_expense: platformExpense,
      vendor_expense: vendorExpense,
      created_at: new Date(),
    });

    // Update coupon stats
    const newTotalUsage = (coupon.total_usage || 0) + 1;
    const newTotalDiscount = (coupon.total_discount_given || 0) + dto.discountAmount;

    const updates: any = {
      total_usage: newTotalUsage,
      total_discount_given: newTotalDiscount,
      updated_at: new Date(),
    };

    // Check if depleted
    if (coupon.total_usage_limit && newTotalUsage >= coupon.total_usage_limit) {
      updates.status = CouponStatus.DEPLETED;
    }

    await this.db.updateEntity('coupons', dto.couponId, updates);

    return {
      message: 'Coupon usage recorded',
      platformExpense,
      vendorExpense,
    };
  }

  // ============================================
  // PUBLIC COUPONS
  // ============================================

  /**
   * Get available coupons for user
   */
  async getAvailableCoupons(userId: string, shopId?: string, zoneId?: string) {
    const now = new Date();

    let queryBuilder = this.db.query_builder()
      .from('coupons')
      .select('*')
      .where('is_active', true)
      .where('status', CouponStatus.ACTIVE)
      .where('start_date', '<=', now.toISOString())
      .where('expiry_date', '>=', now.toISOString())
      .whereNull('deleted_at');

    const coupons = await queryBuilder.get();

    // Filter by scope and user eligibility
    const availableCoupons = [];

    for (const coupon of (coupons || [])) {
      // Check total usage limit
      if (coupon.total_usage_limit && coupon.total_usage >= coupon.total_usage_limit) {
        continue;
      }

      // Check per user limit
      const userUsage = await this.db.query_builder()
        .from('coupon_usage')
        .select('id')
        .where('coupon_id', coupon.id)
        .where('user_id', userId)
        .get();

      if (coupon.per_user_limit && (userUsage?.length || 0) >= coupon.per_user_limit) {
        continue;
      }

      // Check scope
      if (coupon.scope === CouponScope.SHOP && shopId && coupon.shop_id !== shopId) {
        continue;
      }

      if (coupon.scope === CouponScope.USER && coupon.user_ids?.length > 0) {
        if (!coupon.user_ids.includes(userId)) {
          continue;
        }
      }

      if (coupon.scope === CouponScope.ZONE && coupon.zone_ids?.length > 0 && zoneId) {
        if (!coupon.zone_ids.includes(zoneId)) {
          continue;
        }
      }

      availableCoupons.push(this.transformCoupon(coupon));
    }

    return { data: availableCoupons };
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get coupon statistics
   */
  async getStats(period?: string, shopId?: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get coupons
    let couponQuery = this.db.query_builder()
      .from('coupons')
      .select('*')
      .whereNull('deleted_at');

    if (shopId) {
      couponQuery = couponQuery.where('shop_id', shopId);
    }

    const coupons = await couponQuery.get();

    // Get usage in period
    let usageQuery = this.db.query_builder()
      .from('coupon_usage')
      .select('*')
      .where('created_at', '>=', startDate.toISOString());

    const usage = await usageQuery.get();

    const stats = {
      totalCoupons: coupons?.length || 0,
      activeCoupons: (coupons || []).filter((c: any) => c.status === CouponStatus.ACTIVE).length,
      expiredCoupons: (coupons || []).filter((c: any) => c.status === CouponStatus.EXPIRED).length,
      totalUsage: usage?.length || 0,
      totalDiscountGiven: (usage || []).reduce((sum: number, u: any) => sum + (u.discount_amount || 0), 0),
      platformExpense: (usage || []).reduce((sum: number, u: any) => sum + (u.platform_expense || 0), 0),
      vendorExpense: (usage || []).reduce((sum: number, u: any) => sum + (u.vendor_expense || 0), 0),
      topCoupons: this.getTopCoupons(coupons || [], usage || []),
    };

    return { data: stats };
  }

  private getTopCoupons(coupons: any[], usage: any[]) {
    const usageByCode: Record<string, number> = {};

    for (const u of usage) {
      const coupon = coupons.find(c => c.id === u.coupon_id);
      if (coupon) {
        usageByCode[coupon.code] = (usageByCode[coupon.code] || 0) + 1;
      }
    }

    return Object.entries(usageByCode)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([code, count]) => ({ code, usageCount: count }));
  }

  // ============================================
  // HELPERS
  // ============================================

  private transformCoupon(c: any) {
    return {
      id: c.id,
      code: c.code,
      title: c.title,
      description: c.description,
      type: c.type,
      value: c.value,
      maxDiscount: c.max_discount,
      minOrderAmount: c.min_order_amount,
      scope: c.scope,
      shopId: c.shop_id,
      categoryIds: c.category_ids,
      productIds: c.product_ids,
      userIds: c.user_ids,
      zoneIds: c.zone_ids,
      startDate: c.start_date,
      expiryDate: c.expiry_date,
      totalUsageLimit: c.total_usage_limit,
      perUserLimit: c.per_user_limit,
      expenseBearer: c.expense_bearer,
      platformSharePercent: c.platform_share_percent,
      isActive: c.is_active,
      status: c.status,
      totalUsage: c.total_usage,
      totalDiscountGiven: c.total_discount_given,
      buyQuantity: c.buy_quantity,
      getQuantity: c.get_quantity,
      getProductIds: c.get_product_ids,
      getDiscountPercent: c.get_discount_percent,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    };
  }
}

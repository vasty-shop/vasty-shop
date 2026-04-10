import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateFlashSaleDto,
  UpdateFlashSaleDto,
  FlashSaleProductDto,
  AddProductsToFlashSaleDto,
  UpdateFlashSaleProductDto,
  RemoveProductsFromFlashSaleDto,
  BulkUpdateProductsDto,
  FlashSaleFilterDto,
  FlashSaleProductFilterDto,
  SubscribeToFlashSaleDto,
  JoinWaitlistDto,
  ValidateFlashSalePurchaseDto,
  ReserveFlashSaleItemsDto,
  ReleaseReservationDto,
  FlashSaleAnalyticsDto,
  FlashSaleComparisonDto,
  ScheduleFlashSaleDto,
  ExtendFlashSaleDto,
  CloneFlashSaleDto,
  SetProgressiveDiscountDto,
  SetQuantityTiersDto,
  GrantEarlyAccessDto,
  CreateFlashSaleBundleDto,
  UpdateFlashSaleBundleDto,
  FlashSaleStatus,
  FlashSaleType,
  FlashSaleVisibility,
  NotificationType,
} from './dto/flash-sales.dto';

@Injectable()
export class FlashSalesService {
  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // FLASH SALE CRUD
  // ============================================

  async createFlashSale(dto: CreateFlashSaleDto, userId: string) {
    // Validate times
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const flashSale = await this.db.query_builder()
      .from('flash_sales')
      .insert({
        name: dto.name,
        description: dto.description,
        shop_id: dto.shopId,
        type: dto.type,
        start_time: dto.startTime,
        end_time: dto.endTime,
        visibility: dto.visibility || FlashSaleVisibility.PUBLIC,
        banner_image: dto.bannerImage,
        thumbnail_image: dto.thumbnailImage,
        background_color: dto.backgroundColor,
        text_color: dto.textColor,
        default_discount_percent: dto.defaultDiscountPercent,
        default_discount_amount: dto.defaultDiscountAmount,
        discount_distribution: dto.discountDistribution || 'uniform',
        min_purchase_amount: dto.minPurchaseAmount || 0,
        max_purchase_per_user: dto.maxPurchasePerUser,
        total_budget: dto.totalBudget,
        show_countdown: dto.showCountdown !== false,
        show_stock_level: dto.showStockLevel !== false,
        allow_early_access: dto.allowEarlyAccess || false,
        early_access_minutes: dto.earlyAccessMinutes || 30,
        category_ids: JSON.stringify(dto.categoryIds || []),
        notification_settings: JSON.stringify(dto.notifications || {}),
        rules: JSON.stringify(dto.rules || []),
        status: FlashSaleStatus.DRAFT,
        total_sold: 0,
        total_revenue: 0,
        total_discount_given: 0,
        created_by: userId,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    const flashSaleId = flashSale[0].id;

    // Add products if provided
    if (dto.products && dto.products.length > 0) {
      await this.addProductsToFlashSale({
        flashSaleId,
        products: dto.products,
      });
    }

    return this.getFlashSale(flashSaleId);
  }

  async getFlashSales(dto: FlashSaleFilterDto) {
    const now = new Date().toISOString();
    let query = this.db.query_builder()
      .from('flash_sales')
      .select('*');

    if (dto.search) {
      query = query.where('name', 'LIKE', `%${dto.search}%`);
    }
    if (dto.shopId) {
      query = query.where('shop_id', dto.shopId);
    }
    if (dto.status) {
      query = query.where('status', dto.status);
    }
    if (dto.type) {
      query = query.where('type', dto.type);
    }
    if (dto.startDate) {
      query = query.where('start_time', '>=', dto.startDate);
    }
    if (dto.endDate) {
      query = query.where('end_time', '<=', dto.endDate);
    }
    if (dto.activeOnly) {
      query = query
        .where('status', FlashSaleStatus.ACTIVE)
        .where('start_time', '<=', now)
        .where('end_time', '>', now);
    }
    if (dto.upcomingOnly) {
      query = query
        .where('start_time', '>', now)
        .whereIn('status', [FlashSaleStatus.SCHEDULED, FlashSaleStatus.DRAFT]);
    }

    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const offset = (page - 1) * limit;

    const flashSales = await query
      .orderBy('start_time', 'DESC')
      .limit(limit)
      .offset(offset)
      .get();

    return flashSales.map(this.formatFlashSale);
  }

  async getFlashSale(id: string) {
    const flashSales = await this.db.query_builder()
      .from('flash_sales')
      .select('*')
      .where('id', id)
      .get();

    if (flashSales.length === 0) {
      throw new NotFoundException('Flash sale not found');
    }

    const flashSale = this.formatFlashSale(flashSales[0]);

    // Get products
    flashSale.products = await this.getFlashSaleProducts(id, {});

    // Get bundles
    flashSale.bundles = await this.getFlashSaleBundles(id);

    return flashSale;
  }

  async getActiveFlashSales(shopId?: string) {
    const now = new Date().toISOString();
    let query = this.db.query_builder()
      .from('flash_sales')
      .select('*')
      .where('status', FlashSaleStatus.ACTIVE)
      .where('start_time', '<=', now)
      .where('end_time', '>', now);

    if (shopId) {
      query = query.where('shop_id', shopId);
    }

    const flashSales = await query.orderBy('end_time', 'ASC').get();

    return Promise.all(flashSales.map(async (fs: any) => {
      const formatted = this.formatFlashSale(fs);
      formatted.products = await this.getFlashSaleProducts(fs.id, { limit: 10, featuredOnly: true });
      return formatted;
    }));
  }

  async getUpcomingFlashSales(shopId?: string, limit: number = 5) {
    const now = new Date().toISOString();
    let query = this.db.query_builder()
      .from('flash_sales')
      .select('*')
      .where('start_time', '>', now)
      .whereIn('status', [FlashSaleStatus.SCHEDULED]);

    if (shopId) {
      query = query.where('shop_id', shopId);
    }

    const flashSales = await query
      .orderBy('start_time', 'ASC')
      .limit(limit)
      .get();

    return flashSales.map(this.formatFlashSale);
  }

  async updateFlashSale(id: string, dto: UpdateFlashSaleDto) {
    const flashSale = await this.getFlashSale(id);

    // Prevent updates to active sales for certain fields
    if (flashSale.status === FlashSaleStatus.ACTIVE) {
      if (dto.startTime) {
        throw new BadRequestException('Cannot change start time of active flash sale');
      }
    }

    const updateData: any = { updated_at: new Date().toISOString() };

    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.startTime) updateData.start_time = dto.startTime;
    if (dto.endTime) updateData.end_time = dto.endTime;
    if (dto.visibility) updateData.visibility = dto.visibility;
    if (dto.bannerImage !== undefined) updateData.banner_image = dto.bannerImage;
    if (dto.thumbnailImage !== undefined) updateData.thumbnail_image = dto.thumbnailImage;
    if (dto.backgroundColor) updateData.background_color = dto.backgroundColor;
    if (dto.textColor) updateData.text_color = dto.textColor;
    if (dto.defaultDiscountPercent !== undefined) updateData.default_discount_percent = dto.defaultDiscountPercent;
    if (dto.defaultDiscountAmount !== undefined) updateData.default_discount_amount = dto.defaultDiscountAmount;
    if (dto.minPurchaseAmount !== undefined) updateData.min_purchase_amount = dto.minPurchaseAmount;
    if (dto.maxPurchasePerUser !== undefined) updateData.max_purchase_per_user = dto.maxPurchasePerUser;
    if (dto.totalBudget !== undefined) updateData.total_budget = dto.totalBudget;
    if (dto.showCountdown !== undefined) updateData.show_countdown = dto.showCountdown;
    if (dto.showStockLevel !== undefined) updateData.show_stock_level = dto.showStockLevel;
    if (dto.status) updateData.status = dto.status;
    if (dto.notifications) updateData.notification_settings = JSON.stringify(dto.notifications);

    const result = await this.db.query_builder()
      .from('flash_sales')
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute();

    return this.formatFlashSale(result[0]);
  }

  async deleteFlashSale(id: string) {
    const flashSale = await this.getFlashSale(id);

    if (flashSale.status === FlashSaleStatus.ACTIVE) {
      throw new BadRequestException('Cannot delete active flash sale');
    }

    // Delete related data
    await this.db.query_builder()
      .from('flash_sale_products')
      .where('flash_sale_id', id)
      .delete()
      .execute();

    await this.db.query_builder()
      .from('flash_sale_bundles')
      .where('flash_sale_id', id)
      .delete()
      .execute();

    await this.db.query_builder()
      .from('flash_sales')
      .where('id', id)
      .delete()
      .execute();

    return { success: true };
  }

  // ============================================
  // STATUS MANAGEMENT
  // ============================================

  async activateFlashSale(id: string) {
    const flashSale = await this.getFlashSale(id);

    if (flashSale.status === FlashSaleStatus.ACTIVE) {
      throw new BadRequestException('Flash sale is already active');
    }

    if (!flashSale.products || flashSale.products.length === 0) {
      throw new BadRequestException('Cannot activate flash sale without products');
    }

    const result = await this.db.query_builder()
      .from('flash_sales')
      .where('id', id)
      .update({
        status: FlashSaleStatus.ACTIVE,
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    // Trigger notifications
    await this.triggerNotification(id, NotificationType.NOW_LIVE);

    return this.formatFlashSale(result[0]);
  }

  async pauseFlashSale(id: string) {
    const result = await this.db.query_builder()
      .from('flash_sales')
      .where('id', id)
      .update({
        status: FlashSaleStatus.PAUSED,
        paused_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.formatFlashSale(result[0]);
  }

  async resumeFlashSale(id: string) {
    const result = await this.db.query_builder()
      .from('flash_sales')
      .where('id', id)
      .update({
        status: FlashSaleStatus.ACTIVE,
        resumed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.formatFlashSale(result[0]);
  }

  async endFlashSale(id: string) {
    const result = await this.db.query_builder()
      .from('flash_sales')
      .where('id', id)
      .update({
        status: FlashSaleStatus.ENDED,
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.formatFlashSale(result[0]);
  }

  async cancelFlashSale(id: string, reason?: string) {
    const result = await this.db.query_builder()
      .from('flash_sales')
      .where('id', id)
      .update({
        status: FlashSaleStatus.CANCELLED,
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.formatFlashSale(result[0]);
  }

  // ============================================
  // PRODUCT MANAGEMENT
  // ============================================

  async addProductsToFlashSale(dto: AddProductsToFlashSaleDto) {
    const flashSale = await this.getFlashSale(dto.flashSaleId);

    const products = dto.products.map((p, index) => ({
      flash_sale_id: dto.flashSaleId,
      product_id: p.productId,
      variant_id: p.variantId,
      discount_percent: p.discountPercent || flashSale.defaultDiscountPercent,
      discount_amount: p.discountAmount || flashSale.defaultDiscountAmount,
      sale_price: p.salePrice,
      stock_limit: p.stockLimit,
      stock_sold: 0,
      max_per_user: p.maxPerUser,
      sort_order: p.sortOrder || index,
      featured: p.featured || false,
      is_active: true,
      created_at: new Date().toISOString(),
    }));

    await this.db.query_builder()
      .from('flash_sale_products')
      .insert(products)
      .execute();

    return this.getFlashSaleProducts(dto.flashSaleId, {});
  }

  async updateFlashSaleProduct(flashSaleId: string, productId: string, dto: UpdateFlashSaleProductDto) {
    const updateData: any = { updated_at: new Date().toISOString() };

    if (dto.discountPercent !== undefined) updateData.discount_percent = dto.discountPercent;
    if (dto.discountAmount !== undefined) updateData.discount_amount = dto.discountAmount;
    if (dto.salePrice !== undefined) updateData.sale_price = dto.salePrice;
    if (dto.stockLimit !== undefined) updateData.stock_limit = dto.stockLimit;
    if (dto.maxPerUser !== undefined) updateData.max_per_user = dto.maxPerUser;
    if (dto.sortOrder !== undefined) updateData.sort_order = dto.sortOrder;
    if (dto.featured !== undefined) updateData.featured = dto.featured;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const result = await this.db.query_builder()
      .from('flash_sale_products')
      .where('flash_sale_id', flashSaleId)
      .where('product_id', productId)
      .update(updateData)
      .returning('*')
      .execute();

    return result[0];
  }

  async removeProductsFromFlashSale(dto: RemoveProductsFromFlashSaleDto) {
    await this.db.query_builder()
      .from('flash_sale_products')
      .where('flash_sale_id', dto.flashSaleId)
      .whereIn('product_id', dto.productIds)
      .delete()
      .execute();

    return { success: true, removed: dto.productIds.length };
  }

  async bulkUpdateProducts(dto: BulkUpdateProductsDto) {
    const results = await Promise.all(
      dto.updates.map(u =>
        this.updateFlashSaleProduct(dto.flashSaleId, u.productId, u.data)
      )
    );

    return { updated: results.length };
  }

  async getFlashSaleProducts(flashSaleId: string, dto: FlashSaleProductFilterDto) {
    let query = this.db.query_builder()
      .from('flash_sale_products')
      .select('*')
      .where('flash_sale_id', flashSaleId)
      .where('is_active', true);

    if (dto.featuredOnly) {
      query = query.where('featured', true);
    }
    if (dto.inStock) {
      query = query.where('stock_limit', '>', 0);
    }

    const sortBy = dto.sortBy || 'sort_order';
    const sortOrder = dto.sortOrder || 'asc';
    query = query.orderBy(sortBy === 'sort_order' ? 'sort_order' : sortBy, sortOrder === 'asc' ? 'ASC' : 'DESC');

    if (dto.limit) {
      const page = dto.page || 1;
      const offset = (page - 1) * dto.limit;
      query = query.limit(dto.limit).offset(offset);
    }

    const flashSaleProducts = await query.get();

    // Get product details
    const productIds = flashSaleProducts.map((p: any) => p.product_id);
    if (productIds.length === 0) return [];

    const products = await this.db.query_builder()
      .from('products')
      .select('*')
      .whereIn('id', productIds)
      .get();

    const productMap = new Map(products.map((p: any) => [p.id, p]));

    return flashSaleProducts.map((fsp: any) => {
      const product = productMap.get(fsp.product_id);
      return this.formatFlashSaleProduct(fsp, product);
    });
  }

  // ============================================
  // SUBSCRIPTION & WAITLIST
  // ============================================

  async subscribeToFlashSale(dto: SubscribeToFlashSaleDto, userId: string) {
    const existing = await this.db.query_builder()
      .from('flash_sale_subscriptions')
      .select('id')
      .where('flash_sale_id', dto.flashSaleId)
      .where('user_id', userId)
      .get();

    if (existing.length > 0) {
      throw new ConflictException('Already subscribed to this flash sale');
    }

    await this.db.query_builder()
      .from('flash_sale_subscriptions')
      .insert({
        flash_sale_id: dto.flashSaleId,
        user_id: userId,
        notification_channels: JSON.stringify(dto.notificationChannels || ['push']),
        product_ids: JSON.stringify(dto.productIds || []),
        created_at: new Date().toISOString(),
      })
      .execute();

    return { success: true };
  }

  async unsubscribeFromFlashSale(flashSaleId: string, userId: string) {
    await this.db.query_builder()
      .from('flash_sale_subscriptions')
      .where('flash_sale_id', flashSaleId)
      .where('user_id', userId)
      .delete()
      .execute();

    return { success: true };
  }

  async joinWaitlist(dto: JoinWaitlistDto, userId: string) {
    const existing = await this.db.query_builder()
      .from('flash_sale_waitlist')
      .select('id')
      .where('flash_sale_id', dto.flashSaleId)
      .where('product_id', dto.productId)
      .where('user_id', userId)
      .get();

    if (existing.length > 0) {
      throw new ConflictException('Already on waitlist for this product');
    }

    const position = await this.db.query_builder()
      .from('flash_sale_waitlist')
      .select('id')
      .where('flash_sale_id', dto.flashSaleId)
      .where('product_id', dto.productId)
      .get();

    await this.db.query_builder()
      .from('flash_sale_waitlist')
      .insert({
        flash_sale_id: dto.flashSaleId,
        product_id: dto.productId,
        user_id: userId,
        quantity: dto.quantity || 1,
        position: position.length + 1,
        created_at: new Date().toISOString(),
      })
      .execute();

    return { success: true, position: position.length + 1 };
  }

  async leaveWaitlist(flashSaleId: string, productId: string, userId: string) {
    await this.db.query_builder()
      .from('flash_sale_waitlist')
      .where('flash_sale_id', flashSaleId)
      .where('product_id', productId)
      .where('user_id', userId)
      .delete()
      .execute();

    return { success: true };
  }

  // ============================================
  // PURCHASE VALIDATION & RESERVATION
  // ============================================

  async validatePurchase(dto: ValidateFlashSalePurchaseDto, userId: string) {
    const flashSale = await this.getFlashSale(dto.flashSaleId);
    const now = new Date();

    // Check if sale is active
    if (flashSale.status !== FlashSaleStatus.ACTIVE) {
      return { valid: false, error: 'Flash sale is not active' };
    }

    // Check timing
    const startTime = new Date(flashSale.startTime);
    const endTime = new Date(flashSale.endTime);

    if (now < startTime) {
      // Check early access
      const hasEarlyAccess = await this.checkEarlyAccess(dto.flashSaleId, userId);
      if (!hasEarlyAccess) {
        return { valid: false, error: 'Flash sale has not started yet' };
      }
    }

    if (now > endTime) {
      return { valid: false, error: 'Flash sale has ended' };
    }

    // Check user purchase limit
    if (flashSale.maxPurchasePerUser) {
      const userPurchases = await this.getUserPurchaseCount(dto.flashSaleId, userId);
      if (userPurchases >= flashSale.maxPurchasePerUser) {
        return { valid: false, error: 'Maximum purchase limit reached' };
      }
    }

    // Validate each item
    const itemValidations = await Promise.all(
      dto.items.map(item => this.validateItemPurchase(dto.flashSaleId, item, userId))
    );

    const invalidItems = itemValidations.filter(v => !v.valid);
    if (invalidItems.length > 0) {
      return { valid: false, error: 'Some items are invalid', invalidItems };
    }

    // Calculate total
    const total = itemValidations.reduce((sum, v) => sum + (v.subtotal || 0), 0);

    // Check minimum purchase
    if (flashSale.minPurchaseAmount && total < flashSale.minPurchaseAmount) {
      return {
        valid: false,
        error: `Minimum purchase amount is ${flashSale.minPurchaseAmount}`,
      };
    }

    return {
      valid: true,
      items: itemValidations,
      total,
      discountTotal: itemValidations.reduce((sum, v) => sum + (v.discount || 0), 0),
    };
  }

  private async validateItemPurchase(flashSaleId: string, item: any, userId: string) {
    const products = await this.db.query_builder()
      .from('flash_sale_products')
      .select('*')
      .where('flash_sale_id', flashSaleId)
      .where('product_id', item.productId)
      .where('is_active', true)
      .get();

    if (products.length === 0) {
      return { valid: false, error: 'Product not in flash sale', productId: item.productId };
    }

    const fsp = products[0];

    // Check stock
    if (fsp.stock_limit !== null) {
      const availableStock = fsp.stock_limit - fsp.stock_sold;
      if (item.quantity > availableStock) {
        return {
          valid: false,
          error: `Only ${availableStock} available`,
          productId: item.productId,
          availableStock,
        };
      }
    }

    // Check per-user limit
    if (fsp.max_per_user) {
      const userItemPurchases = await this.getUserItemPurchaseCount(flashSaleId, item.productId, userId);
      if (userItemPurchases + item.quantity > fsp.max_per_user) {
        return {
          valid: false,
          error: `Maximum ${fsp.max_per_user} per user`,
          productId: item.productId,
        };
      }
    }

    // Get product price
    const product = await this.db.query_builder()
      .from('products')
      .select('price')
      .where('id', item.productId)
      .get();

    const originalPrice = parseFloat(product[0]?.price || 0);
    let salePrice = fsp.sale_price;

    if (!salePrice) {
      if (fsp.discount_percent) {
        salePrice = originalPrice * (1 - fsp.discount_percent / 100);
      } else if (fsp.discount_amount) {
        salePrice = originalPrice - fsp.discount_amount;
      } else {
        salePrice = originalPrice;
      }
    }

    const subtotal = salePrice * item.quantity;
    const discount = (originalPrice - salePrice) * item.quantity;

    return {
      valid: true,
      productId: item.productId,
      originalPrice,
      salePrice,
      quantity: item.quantity,
      subtotal,
      discount,
    };
  }

  async reserveItems(dto: ReserveFlashSaleItemsDto, userId: string) {
    const validation = await this.validatePurchase({
      flashSaleId: dto.flashSaleId,
      items: dto.items,
    }, userId);

    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    const reservationMinutes = dto.reservationMinutes || 10;
    const expiresAt = new Date(Date.now() + reservationMinutes * 60 * 1000);

    const reservation = await this.db.query_builder()
      .from('flash_sale_reservations')
      .insert({
        flash_sale_id: dto.flashSaleId,
        user_id: userId,
        items: JSON.stringify(dto.items),
        expires_at: expiresAt.toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    // Update sold count temporarily
    for (const item of dto.items) {
      // Get current stock_sold value
      const currentStock = await this.db.query_builder()
        .from('flash_sale_products')
        .select('stock_sold')
        .where('flash_sale_id', dto.flashSaleId)
        .where('product_id', item.productId)
        .get();

      const newStockSold = (currentStock[0]?.stock_sold || 0) + item.quantity;

      await this.db.query_builder()
        .from('flash_sale_products')
        .where('flash_sale_id', dto.flashSaleId)
        .where('product_id', item.productId)
        .update({
          stock_sold: newStockSold,
        })
        .execute();
    }

    return {
      reservationId: reservation[0].id,
      expiresAt: expiresAt.toISOString(),
      items: validation.items,
      total: validation.total,
    };
  }

  async releaseReservation(dto: ReleaseReservationDto) {
    const reservations = await this.db.query_builder()
      .from('flash_sale_reservations')
      .select('*')
      .where('id', dto.reservationId)
      .where('status', 'active')
      .get();

    if (reservations.length === 0) {
      throw new NotFoundException('Reservation not found');
    }

    const reservation = reservations[0];
    const items = JSON.parse(reservation.items);

    // Restore stock
    for (const item of items) {
      // Get current stock_sold value
      const currentStock = await this.db.query_builder()
        .from('flash_sale_products')
        .select('stock_sold')
        .where('flash_sale_id', reservation.flash_sale_id)
        .where('product_id', item.productId)
        .get();

      const newStockSold = Math.max((currentStock[0]?.stock_sold || 0) - item.quantity, 0);

      await this.db.query_builder()
        .from('flash_sale_products')
        .where('flash_sale_id', reservation.flash_sale_id)
        .where('product_id', item.productId)
        .update({
          stock_sold: newStockSold,
        })
        .execute();
    }

    // Mark reservation as released
    await this.db.query_builder()
      .from('flash_sale_reservations')
      .where('id', dto.reservationId)
      .update({
        status: 'released',
        released_at: new Date().toISOString(),
      })
      .execute();

    return { success: true };
  }

  // ============================================
  // SCHEDULING
  // ============================================

  async scheduleFlashSale(dto: ScheduleFlashSaleDto) {
    const result = await this.db.query_builder()
      .from('flash_sales')
      .where('id', dto.flashSaleId)
      .update({
        start_time: dto.startTime,
        end_time: dto.endTime,
        status: FlashSaleStatus.SCHEDULED,
        auto_activate: dto.activateAutomatically !== false,
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.formatFlashSale(result[0]);
  }

  async extendFlashSale(dto: ExtendFlashSaleDto) {
    const flashSale = await this.getFlashSale(dto.flashSaleId);

    const newEndTime = new Date(dto.newEndTime);
    const currentEndTime = new Date(flashSale.endTime);

    if (newEndTime <= currentEndTime) {
      throw new BadRequestException('New end time must be after current end time');
    }

    const result = await this.db.query_builder()
      .from('flash_sales')
      .where('id', dto.flashSaleId)
      .update({
        end_time: dto.newEndTime,
        extension_reason: dto.reason,
        extended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    // Trigger notification
    await this.triggerNotification(dto.flashSaleId, NotificationType.ENDING_SOON);

    return this.formatFlashSale(result[0]);
  }

  async cloneFlashSale(dto: CloneFlashSaleDto, userId: string) {
    const source = await this.getFlashSale(dto.sourceFlashSaleId);

    const cloned = await this.createFlashSale({
      name: dto.name,
      description: source.description,
      shopId: source.shopId,
      type: source.type,
      startTime: dto.startTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: dto.endTime || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      visibility: source.visibility,
      bannerImage: source.bannerImage,
      thumbnailImage: source.thumbnailImage,
      backgroundColor: source.backgroundColor,
      textColor: source.textColor,
      defaultDiscountPercent: source.defaultDiscountPercent,
      defaultDiscountAmount: source.defaultDiscountAmount,
      minPurchaseAmount: source.minPurchaseAmount,
      maxPurchasePerUser: source.maxPurchasePerUser,
      showCountdown: source.showCountdown,
      showStockLevel: source.showStockLevel,
      products: dto.includeProducts ? source.products : undefined,
    }, userId);

    return cloned;
  }

  // ============================================
  // BUNDLES
  // ============================================

  async createBundle(dto: CreateFlashSaleBundleDto) {
    const bundle = await this.db.query_builder()
      .from('flash_sale_bundles')
      .insert({
        flash_sale_id: dto.flashSaleId,
        name: dto.name,
        products: JSON.stringify(dto.products),
        bundle_discount_percent: dto.bundleDiscountPercent,
        bundle_price: dto.bundlePrice,
        stock_limit: dto.stockLimit,
        stock_sold: 0,
        image: dto.image,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.formatBundle(bundle[0]);
  }

  async getFlashSaleBundles(flashSaleId: string) {
    const bundles = await this.db.query_builder()
      .from('flash_sale_bundles')
      .select('*')
      .where('flash_sale_id', flashSaleId)
      .where('is_active', true)
      .get();

    return bundles.map(this.formatBundle);
  }

  async updateBundle(bundleId: string, dto: UpdateFlashSaleBundleDto) {
    const updateData: any = { updated_at: new Date().toISOString() };

    if (dto.name) updateData.name = dto.name;
    if (dto.products) updateData.products = JSON.stringify(dto.products);
    if (dto.bundleDiscountPercent !== undefined) updateData.bundle_discount_percent = dto.bundleDiscountPercent;
    if (dto.bundlePrice !== undefined) updateData.bundle_price = dto.bundlePrice;
    if (dto.stockLimit !== undefined) updateData.stock_limit = dto.stockLimit;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const result = await this.db.query_builder()
      .from('flash_sale_bundles')
      .where('id', bundleId)
      .update(updateData)
      .returning('*')
      .execute();

    return this.formatBundle(result[0]);
  }

  async deleteBundle(bundleId: string) {
    await this.db.query_builder()
      .from('flash_sale_bundles')
      .where('id', bundleId)
      .delete()
      .execute();

    return { success: true };
  }

  // ============================================
  // EARLY ACCESS
  // ============================================

  async grantEarlyAccess(dto: GrantEarlyAccessDto) {
    const records = dto.userIds.map(userId => ({
      flash_sale_id: dto.flashSaleId,
      user_id: userId,
      early_access_minutes: dto.earlyAccessMinutes || 30,
      created_at: new Date().toISOString(),
    }));

    await this.db.query_builder()
      .from('flash_sale_early_access')
      .insert(records)
      .execute();

    return { success: true, granted: dto.userIds.length };
  }

  async revokeEarlyAccess(flashSaleId: string, userIds: string[]) {
    await this.db.query_builder()
      .from('flash_sale_early_access')
      .where('flash_sale_id', flashSaleId)
      .whereIn('user_id', userIds)
      .delete()
      .execute();

    return { success: true };
  }

  private async checkEarlyAccess(flashSaleId: string, userId: string): Promise<boolean> {
    const access = await this.db.query_builder()
      .from('flash_sale_early_access')
      .select('early_access_minutes')
      .where('flash_sale_id', flashSaleId)
      .where('user_id', userId)
      .get();

    if (access.length === 0) return false;

    const flashSale = await this.getFlashSale(flashSaleId);
    const startTime = new Date(flashSale.startTime);
    const earlyAccessStart = new Date(startTime.getTime() - access[0].early_access_minutes * 60 * 1000);

    return new Date() >= earlyAccessStart;
  }

  // ============================================
  // ANALYTICS
  // ============================================

  async getFlashSaleAnalytics(dto: FlashSaleAnalyticsDto) {
    const flashSale = await this.getFlashSale(dto.flashSaleId);

    // Get product stats
    const products = await this.db.query_builder()
      .from('flash_sale_products')
      .select('*')
      .where('flash_sale_id', dto.flashSaleId)
      .get();

    const totalProducts = products.length;
    const totalStockLimit = products.reduce((sum: number, p: any) => sum + (p.stock_limit || 0), 0);
    const totalSold = products.reduce((sum: number, p: any) => sum + (p.stock_sold || 0), 0);

    // Get subscriber count
    const subscribers = await this.db.query_builder()
      .from('flash_sale_subscriptions')
      .select('id')
      .where('flash_sale_id', dto.flashSaleId)
      .get();

    // Get unique buyers
    const purchases = await this.db.query_builder()
      .from('flash_sale_purchases')
      .select('user_id')
      .where('flash_sale_id', dto.flashSaleId)
      .get();

    const uniqueBuyers = new Set(purchases.map((p: any) => p.user_id)).size;

    return {
      flashSaleId: dto.flashSaleId,
      name: flashSale.name,
      status: flashSale.status,
      startTime: flashSale.startTime,
      endTime: flashSale.endTime,
      summary: {
        totalProducts,
        totalStockLimit,
        totalSold,
        soldPercentage: totalStockLimit > 0 ? (totalSold / totalStockLimit * 100).toFixed(2) : 0,
        totalRevenue: flashSale.totalRevenue,
        totalDiscountGiven: flashSale.totalDiscountGiven,
        subscribers: subscribers.length,
        uniqueBuyers,
      },
      topProducts: products
        .sort((a: any, b: any) => b.stock_sold - a.stock_sold)
        .slice(0, 10)
        .map((p: any) => ({
          productId: p.product_id,
          sold: p.stock_sold,
          stockLimit: p.stock_limit,
        })),
    };
  }

  async compareFlashSales(dto: FlashSaleComparisonDto) {
    const comparisons = await Promise.all(
      dto.flashSaleIds.map(id =>
        this.getFlashSaleAnalytics({ flashSaleId: id })
      )
    );

    return {
      flashSales: comparisons,
      metrics: dto.metrics || ['totalSold', 'totalRevenue', 'uniqueBuyers'],
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private async triggerNotification(flashSaleId: string, type: NotificationType) {
    // Get subscribers
    const subscribers = await this.db.query_builder()
      .from('flash_sale_subscriptions')
      .select('user_id', 'notification_channels')
      .where('flash_sale_id', flashSaleId)
      .get();

    // Queue notifications (would integrate with notifications module)
    // For now, just log
    console.log(`Triggering ${type} notification for ${subscribers.length} subscribers`);
  }

  private async getUserPurchaseCount(flashSaleId: string, userId: string): Promise<number> {
    const purchases = await this.db.query_builder()
      .from('flash_sale_purchases')
      .select('id')
      .where('flash_sale_id', flashSaleId)
      .where('user_id', userId)
      .get();

    return purchases.length;
  }

  private async getUserItemPurchaseCount(flashSaleId: string, productId: string, userId: string): Promise<number> {
    const purchases = await this.db.query_builder()
      .from('flash_sale_purchases')
      .select('quantity')
      .where('flash_sale_id', flashSaleId)
      .where('product_id', productId)
      .where('user_id', userId)
      .get();

    return purchases.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0);
  }

  private formatFlashSale(fs: any): any {
    if (!fs) return null;
    return {
      id: fs.id,
      name: fs.name,
      description: fs.description,
      shopId: fs.shop_id,
      type: fs.type,
      startTime: fs.start_time,
      endTime: fs.end_time,
      visibility: fs.visibility,
      bannerImage: fs.banner_image,
      thumbnailImage: fs.thumbnail_image,
      backgroundColor: fs.background_color,
      textColor: fs.text_color,
      defaultDiscountPercent: fs.default_discount_percent,
      defaultDiscountAmount: fs.default_discount_amount,
      discountDistribution: fs.discount_distribution,
      minPurchaseAmount: fs.min_purchase_amount,
      maxPurchasePerUser: fs.max_purchase_per_user,
      totalBudget: fs.total_budget,
      showCountdown: fs.show_countdown,
      showStockLevel: fs.show_stock_level,
      allowEarlyAccess: fs.allow_early_access,
      earlyAccessMinutes: fs.early_access_minutes,
      categoryIds: JSON.parse(fs.category_ids || '[]'),
      notificationSettings: JSON.parse(fs.notification_settings || '{}'),
      rules: JSON.parse(fs.rules || '[]'),
      status: fs.status,
      totalSold: fs.total_sold,
      totalRevenue: fs.total_revenue,
      totalDiscountGiven: fs.total_discount_given,
      createdAt: fs.created_at,
    };
  }

  private formatFlashSaleProduct(fsp: any, product: any): any {
    if (!fsp) return null;

    const originalPrice = parseFloat(product?.price || 0);
    let salePrice = fsp.sale_price;

    if (!salePrice) {
      if (fsp.discount_percent) {
        salePrice = originalPrice * (1 - fsp.discount_percent / 100);
      } else if (fsp.discount_amount) {
        salePrice = originalPrice - fsp.discount_amount;
      } else {
        salePrice = originalPrice;
      }
    }

    return {
      id: fsp.id,
      flashSaleId: fsp.flash_sale_id,
      productId: fsp.product_id,
      variantId: fsp.variant_id,
      discountPercent: fsp.discount_percent,
      discountAmount: fsp.discount_amount,
      originalPrice,
      salePrice: Number(salePrice.toFixed(2)),
      stockLimit: fsp.stock_limit,
      stockSold: fsp.stock_sold,
      stockRemaining: fsp.stock_limit ? fsp.stock_limit - fsp.stock_sold : null,
      maxPerUser: fsp.max_per_user,
      sortOrder: fsp.sort_order,
      featured: fsp.featured,
      product: product ? {
        name: product.name,
        slug: product.slug,
        image: product.image,
        images: JSON.parse(product.images || '[]'),
      } : null,
    };
  }

  private formatBundle(bundle: any): any {
    if (!bundle) return null;
    return {
      id: bundle.id,
      flashSaleId: bundle.flash_sale_id,
      name: bundle.name,
      products: JSON.parse(bundle.products || '[]'),
      bundleDiscountPercent: bundle.bundle_discount_percent,
      bundlePrice: bundle.bundle_price,
      stockLimit: bundle.stock_limit,
      stockSold: bundle.stock_sold,
      stockRemaining: bundle.stock_limit ? bundle.stock_limit - bundle.stock_sold : null,
      image: bundle.image,
      isActive: bundle.is_active,
      createdAt: bundle.created_at,
    };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateBannerDto,
  UpdateBannerDto,
  QueryBannersDto,
  CreateAdDto,
  UpdateAdDto,
  QueryAdsDto,
  AdPricingDto,
  RecordInteractionDto,
  BannerType,
  BannerPlacement,
  BannerStatus,
  AdType,
  AdStatus,
  BillingType,
} from './dto/banner.dto';

@Injectable()
export class BannersService {
  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // BANNERS
  // ============================================

  /**
   * Create a new banner
   */
  async createBanner(dto: CreateBannerDto, creatorId: string) {
    // Determine initial status
    let status = BannerStatus.DRAFT;
    if (dto.isActive) {
      const now = new Date();
      if (dto.startDate && new Date(dto.startDate) > now) {
        status = BannerStatus.SCHEDULED;
      } else if (dto.endDate && new Date(dto.endDate) < now) {
        status = BannerStatus.EXPIRED;
      } else {
        status = BannerStatus.ACTIVE;
      }
    }

    const banner = await this.db.createEntity('banners', {
      title: dto.title,
      subtitle: dto.subtitle,
      image_url: dto.imageUrl,
      mobile_image_url: dto.mobileImageUrl,
      type: dto.type,
      placement: dto.placement,
      click_url: dto.clickUrl,
      category_id: dto.categoryId,
      product_id: dto.productId,
      shop_id: dto.shopId,
      zone_ids: dto.zoneIds || [],
      start_date: dto.startDate || new Date(),
      end_date: dto.endDate,
      sort_order: dto.sortOrder || 0,
      is_active: dto.isActive !== false,
      status,
      background_color: dto.backgroundColor,
      text_color: dto.textColor,
      button_text: dto.buttonText,
      button_color: dto.buttonColor,
      impressions: 0,
      clicks: 0,
      created_by: creatorId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      data: this.transformBanner(banner),
      message: 'Banner created successfully',
    };
  }

  /**
   * Get all banners with filters
   */
  async getBanners(query: QueryBannersDto) {
    const { page = 1, limit = 20, type, placement, status, zoneId, includeExpired } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.db.query_builder()
      .from('banners')
      .select('*')
      .whereNull('deleted_at');

    if (type) {
      queryBuilder = queryBuilder.where('type', type);
    }

    if (placement) {
      queryBuilder = queryBuilder.where('placement', placement);
    }

    if (status) {
      queryBuilder = queryBuilder.where('status', status);
    }

    if (!includeExpired) {
      const now = new Date().toISOString();
      queryBuilder = queryBuilder.where('status', '!=', BannerStatus.EXPIRED);
    }

    const banners = await queryBuilder
      .orderBy('sort_order', 'ASC')
      .limit(limit)
      .offset(offset)
      .get();

    // Filter by zone if provided
    let filtered = banners || [];
    if (zoneId) {
      filtered = filtered.filter((b: any) =>
        b.zone_ids?.length === 0 || b.zone_ids?.includes(zoneId)
      );
    }

    // Update status for scheduled/expired
    for (const banner of filtered) {
      await this.updateBannerStatus(banner);
    }

    return {
      data: filtered.map((b: any) => this.transformBanner(b)),
      total: filtered.length,
      page,
      limit,
    };
  }

  /**
   * Get active banners for display (public)
   */
  async getActiveBanners(placement?: BannerPlacement, zoneId?: string) {
    const now = new Date().toISOString();

    let queryBuilder = this.db.query_builder()
      .from('banners')
      .select('*')
      .where('is_active', true)
      .where('status', BannerStatus.ACTIVE)
      .where('start_date', '<=', now)
      .whereNull('deleted_at');

    if (placement) {
      queryBuilder = queryBuilder.where('placement', placement);
    }

    const banners = await queryBuilder
      .orderBy('sort_order', 'ASC')
      .get();

    // Filter by zone
    let filtered = banners || [];
    if (zoneId) {
      filtered = filtered.filter((b: any) =>
        b.zone_ids?.length === 0 || b.zone_ids?.includes(zoneId)
      );
    }

    // Filter out expired
    filtered = filtered.filter((b: any) =>
      !b.end_date || new Date(b.end_date) >= new Date()
    );

    return { data: filtered.map((b: any) => this.transformBanner(b)) };
  }

  /**
   * Get banner by ID
   */
  async getBanner(id: string) {
    const banner = await this.db.getEntity('banners', id);

    if (!banner || banner.deleted_at) {
      throw new NotFoundException('Banner not found');
    }

    return { data: this.transformBanner(banner) };
  }

  /**
   * Update banner
   */
  async updateBanner(id: string, dto: UpdateBannerDto) {
    const banner = await this.db.getEntity('banners', id);

    if (!banner || banner.deleted_at) {
      throw new NotFoundException('Banner not found');
    }

    const updates: any = { updated_at: new Date() };

    if (dto.title) updates.title = dto.title;
    if (dto.subtitle !== undefined) updates.subtitle = dto.subtitle;
    if (dto.imageUrl) updates.image_url = dto.imageUrl;
    if (dto.mobileImageUrl !== undefined) updates.mobile_image_url = dto.mobileImageUrl;
    if (dto.clickUrl !== undefined) updates.click_url = dto.clickUrl;
    if (dto.startDate) updates.start_date = dto.startDate;
    if (dto.endDate !== undefined) updates.end_date = dto.endDate;
    if (dto.sortOrder !== undefined) updates.sort_order = dto.sortOrder;
    if (dto.isActive !== undefined) updates.is_active = dto.isActive;
    if (dto.status) updates.status = dto.status;

    const updated = await this.db.updateEntity('banners', id, updates);

    // Update status based on dates
    await this.updateBannerStatus(updated);

    return {
      data: this.transformBanner(updated),
      message: 'Banner updated successfully',
    };
  }

  /**
   * Delete banner (soft delete)
   */
  async deleteBanner(id: string) {
    const banner = await this.db.getEntity('banners', id);

    if (!banner || banner.deleted_at) {
      throw new NotFoundException('Banner not found');
    }

    await this.db.updateEntity('banners', id, {
      deleted_at: new Date(),
      is_active: false,
    });

    return { message: 'Banner deleted successfully' };
  }

  /**
   * Reorder banners
   */
  async reorderBanners(bannerIds: string[]) {
    for (let i = 0; i < bannerIds.length; i++) {
      await this.db.updateEntity('banners', bannerIds[i], {
        sort_order: i,
        updated_at: new Date(),
      });
    }

    return { message: 'Banners reordered' };
  }

  private async updateBannerStatus(banner: any) {
    const now = new Date();
    let newStatus = banner.status;

    if (banner.is_active) {
      if (banner.start_date && new Date(banner.start_date) > now) {
        newStatus = BannerStatus.SCHEDULED;
      } else if (banner.end_date && new Date(banner.end_date) < now) {
        newStatus = BannerStatus.EXPIRED;
      } else if (banner.status === BannerStatus.SCHEDULED) {
        newStatus = BannerStatus.ACTIVE;
      }
    }

    if (newStatus !== banner.status) {
      await this.db.updateEntity('banners', banner.id, { status: newStatus });
      banner.status = newStatus;
    }
  }

  // ============================================
  // PAID ADS
  // ============================================

  /**
   * Create a paid ad
   */
  async createAd(dto: CreateAdDto, vendorId: string) {
    // Calculate cost
    const pricing = await this.getAdPricing(dto.type, dto.billingType);
    if (!pricing) {
      throw new BadRequestException('Invalid ad type or billing type');
    }

    // Calculate total cost based on billing type
    let totalCost = dto.budget || 0;
    if (dto.billingType === BillingType.FLAT || dto.billingType === BillingType.DAILY) {
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      if (pricing.minDurationDays && days < pricing.minDurationDays) {
        throw new BadRequestException(`Minimum duration is ${pricing.minDurationDays} days`);
      }

      totalCost = dto.billingType === BillingType.DAILY ? pricing.price * days : pricing.price;
    }

    const ad = await this.db.createEntity('paid_ads', {
      vendor_id: vendorId,
      type: dto.type,
      title: dto.title,
      description: dto.description,
      image_url: dto.imageUrl,
      click_url: dto.clickUrl,
      shop_id: dto.shopId,
      product_ids: dto.productIds || [],
      zone_ids: dto.zoneIds || [],
      billing_type: dto.billingType,
      budget: dto.budget,
      daily_budget: dto.dailyBudget,
      total_cost: totalCost,
      spent: 0,
      start_date: dto.startDate,
      end_date: dto.endDate,
      status: AdStatus.PENDING,
      impressions: 0,
      clicks: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // TODO: Create payment intent for totalCost

    return {
      data: this.transformAd(ad),
      message: 'Ad created, pending approval',
      totalCost,
    };
  }

  /**
   * Get all ads
   */
  async getAds(query: QueryAdsDto) {
    const { page = 1, limit = 20, type, status, shopId } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.db.query_builder()
      .from('paid_ads')
      .select('*');

    if (type) {
      queryBuilder = queryBuilder.where('type', type);
    }

    if (status) {
      queryBuilder = queryBuilder.where('status', status);
    }

    if (shopId) {
      queryBuilder = queryBuilder.where('shop_id', shopId);
    }

    const ads = await queryBuilder
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .get();

    return {
      data: (ads || []).map((a: any) => this.transformAd(a)),
      page,
      limit,
    };
  }

  /**
   * Get vendor's ads
   */
  async getVendorAds(vendorId: string, status?: AdStatus) {
    let queryBuilder = this.db.query_builder()
      .from('paid_ads')
      .select('*')
      .where('vendor_id', vendorId);

    if (status) {
      queryBuilder = queryBuilder.where('status', status);
    }

    const ads = await queryBuilder
      .orderBy('created_at', 'DESC')
      .get();

    return { data: (ads || []).map((a: any) => this.transformAd(a)) };
  }

  /**
   * Get ad by ID
   */
  async getAd(id: string) {
    const ad = await this.db.getEntity('paid_ads', id);

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    return { data: this.transformAd(ad) };
  }

  /**
   * Update ad
   */
  async updateAd(id: string, dto: UpdateAdDto) {
    const ad = await this.db.getEntity('paid_ads', id);

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    const updates: any = { updated_at: new Date() };

    if (dto.title) updates.title = dto.title;
    if (dto.description !== undefined) updates.description = dto.description;
    if (dto.imageUrl) updates.image_url = dto.imageUrl;
    if (dto.budget !== undefined) updates.budget = dto.budget;
    if (dto.dailyBudget !== undefined) updates.daily_budget = dto.dailyBudget;
    if (dto.endDate) updates.end_date = dto.endDate;
    if (dto.status) updates.status = dto.status;

    const updated = await this.db.updateEntity('paid_ads', id, updates);

    return {
      data: this.transformAd(updated),
      message: 'Ad updated successfully',
    };
  }

  /**
   * Approve/Reject ad (admin)
   */
  async reviewAd(id: string, approved: boolean, reason?: string) {
    const ad = await this.db.getEntity('paid_ads', id);

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    const status = approved ? AdStatus.ACTIVE : AdStatus.REJECTED;

    await this.db.updateEntity('paid_ads', id, {
      status,
      review_reason: reason,
      reviewed_at: new Date(),
      updated_at: new Date(),
    });

    return {
      message: approved ? 'Ad approved' : 'Ad rejected',
    };
  }

  /**
   * Pause/Resume ad
   */
  async toggleAdStatus(id: string, vendorId: string) {
    const ad = await this.db.getEntity('paid_ads', id);

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    if (ad.vendor_id !== vendorId) {
      throw new BadRequestException('Not your ad');
    }

    const newStatus = ad.status === AdStatus.ACTIVE ? AdStatus.PAUSED : AdStatus.ACTIVE;

    await this.db.updateEntity('paid_ads', id, {
      status: newStatus,
      updated_at: new Date(),
    });

    return { message: `Ad ${newStatus === AdStatus.ACTIVE ? 'resumed' : 'paused'}` };
  }

  // ============================================
  // AD PRICING
  // ============================================

  /**
   * Get ad pricing
   */
  async getAdPricing(type?: AdType, billingType?: BillingType) {
    let queryBuilder = this.db.query_builder()
      .from('ad_pricing')
      .select('*')
      .where('is_active', true);

    if (type) {
      queryBuilder = queryBuilder.where('type', type);
    }

    if (billingType) {
      queryBuilder = queryBuilder.where('billing_type', billingType);
    }

    const pricing = await queryBuilder.get();

    if (type && billingType) {
      return pricing?.[0] || null;
    }

    return { data: pricing || [] };
  }

  /**
   * Set ad pricing (admin)
   */
  async setAdPricing(dto: AdPricingDto) {
    const existing = await this.db.query_builder()
      .from('ad_pricing')
      .select('id')
      .where('type', dto.type)
      .where('billing_type', dto.billingType)
      .get();

    if (existing && existing.length > 0) {
      const updated = await this.db.updateEntity('ad_pricing', existing[0].id, {
        price: dto.price,
        min_duration_days: dto.minDurationDays,
        is_active: dto.isActive !== false,
        updated_at: new Date(),
      });
      return { data: updated, message: 'Pricing updated' };
    }

    const created = await this.db.createEntity('ad_pricing', {
      type: dto.type,
      billing_type: dto.billingType,
      price: dto.price,
      min_duration_days: dto.minDurationDays,
      is_active: dto.isActive !== false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return { data: created, message: 'Pricing created' };
  }

  // ============================================
  // INTERACTIONS & ANALYTICS
  // ============================================

  /**
   * Record banner/ad interaction
   */
  async recordInteraction(dto: RecordInteractionDto, userId?: string) {
    const table = dto.entityType === 'banner' ? 'banners' : 'paid_ads';
    const entity = await this.db.getEntity(table, dto.entityId);

    if (!entity) {
      return; // Silently fail for tracking
    }

    // Update count
    const field = dto.interactionType === 'impression' ? 'impressions' : 'clicks';
    await this.db.updateEntity(table, dto.entityId, {
      [field]: (entity[field] || 0) + 1,
    });

    // Record detailed log
    await this.db.createEntity('banner_interactions', {
      entity_type: dto.entityType,
      entity_id: dto.entityId,
      interaction_type: dto.interactionType,
      user_id: userId,
      created_at: new Date(),
    });

    // For paid ads with CPC/CPM, update spent
    if (dto.entityType === 'ad') {
      const ad = entity;
      const pricing = await this.getAdPricing(ad.type, ad.billing_type);

      if (pricing) {
        let costIncrement = 0;

        if (ad.billing_type === BillingType.CPC && dto.interactionType === 'click') {
          costIncrement = pricing.price;
        } else if (ad.billing_type === BillingType.CPM && dto.interactionType === 'impression') {
          costIncrement = pricing.price / 1000;
        }

        if (costIncrement > 0) {
          const newSpent = (ad.spent || 0) + costIncrement;
          await this.db.updateEntity('paid_ads', dto.entityId, {
            spent: newSpent,
          });

          // Check budget limits
          if (ad.budget && newSpent >= ad.budget) {
            await this.db.updateEntity('paid_ads', dto.entityId, {
              status: AdStatus.PAUSED,
            });
          }
        }
      }
    }

    return { success: true };
  }

  /**
   * Get banner/ad statistics
   */
  async getStats(entityType: 'banner' | 'ad', entityId: string, period?: string) {
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
        startDate = new Date(0);
    }

    const interactions = await this.db.query_builder()
      .from('banner_interactions')
      .select('*')
      .where('entity_type', entityType)
      .where('entity_id', entityId)
      .where('created_at', '>=', startDate.toISOString())
      .get();

    const impressions = (interactions || []).filter((i: any) => i.interaction_type === 'impression').length;
    const clicks = (interactions || []).filter((i: any) => i.interaction_type === 'click').length;
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';

    return {
      data: {
        impressions,
        clicks,
        ctr: parseFloat(ctr),
        period: { start: startDate, end: now },
      },
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private transformBanner(b: any) {
    return {
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      imageUrl: b.image_url,
      mobileImageUrl: b.mobile_image_url,
      type: b.type,
      placement: b.placement,
      clickUrl: b.click_url,
      categoryId: b.category_id,
      productId: b.product_id,
      shopId: b.shop_id,
      zoneIds: b.zone_ids,
      startDate: b.start_date,
      endDate: b.end_date,
      sortOrder: b.sort_order,
      isActive: b.is_active,
      status: b.status,
      backgroundColor: b.background_color,
      textColor: b.text_color,
      buttonText: b.button_text,
      buttonColor: b.button_color,
      impressions: b.impressions,
      clicks: b.clicks,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    };
  }

  private transformAd(a: any) {
    return {
      id: a.id,
      vendorId: a.vendor_id,
      type: a.type,
      title: a.title,
      description: a.description,
      imageUrl: a.image_url,
      clickUrl: a.click_url,
      shopId: a.shop_id,
      productIds: a.product_ids,
      zoneIds: a.zone_ids,
      billingType: a.billing_type,
      budget: a.budget,
      dailyBudget: a.daily_budget,
      totalCost: a.total_cost,
      spent: a.spent,
      startDate: a.start_date,
      endDate: a.end_date,
      status: a.status,
      reviewReason: a.review_reason,
      reviewedAt: a.reviewed_at,
      impressions: a.impressions,
      clicks: a.clicks,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    };
  }
}

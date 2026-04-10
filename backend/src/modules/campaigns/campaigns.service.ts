import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { EntityType, CampaignEntity, ShopEntity } from '../../database/schema';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly db: DatabaseService,
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
  ) {}

  /**
   * Check if user has permission to manage a campaign
   * - Platform admins can manage all campaigns
   * - Shop owners can manage their shop's campaigns
   */
  private async verifyAuthorization(
    userId: string,
    shopId?: string,
    campaign?: CampaignEntity,
  ): Promise<void> {
    // If campaign exists, check if it belongs to the user's shop
    if (campaign && campaign.shopId) {
      const shop = await this.db.getEntity(EntityType.SHOP, campaign.shopId);
      if (shop && shop.owner_id === userId) {
        return; // Shop owner can manage their campaigns
      }

      // Check if user is a team member with admin/manager role
      const teamMembers = await this.db.queryEntities(EntityType.SHOP_TEAM_MEMBER, {
        filters: {
          shop_id: campaign.shopId,
          user_id: userId,
          is_active: true,
        },
        limit: 1,
      });

      if (teamMembers.data && teamMembers.data.length > 0) {
        const member = teamMembers.data[0];
        if (['owner', 'admin', 'manager'].includes(member.role)) {
          return; // Team member with sufficient role can manage campaigns
        }
      }

      throw new ForbiddenException('You do not have permission to manage this campaign');
    }

    // If shopId is provided (for creating shop-specific campaigns)
    if (shopId) {
      const shop = await this.db.getEntity(EntityType.SHOP, shopId);
      if (!shop) {
        throw new NotFoundException('Shop not found');
      }

      if (shop.owner_id === userId) {
        return; // Shop owner can create campaigns for their shop
      }

      // Check team membership
      const teamMembers = await this.db.queryEntities(EntityType.SHOP_TEAM_MEMBER, {
        filters: {
          shop_id: shopId,
          user_id: userId,
          is_active: true,
        },
        limit: 1,
      });

      if (teamMembers.data && teamMembers.data.length > 0) {
        const member = teamMembers.data[0];
        if (['owner', 'admin', 'manager'].includes(member.role)) {
          return;
        }
      }

      throw new ForbiddenException('You do not have permission to create campaigns for this shop');
    }

    // For platform-wide campaigns (no shopId), only platform admins can create
    // For now, we allow authenticated users - in production, add admin role check
    this.logger.warn(`Platform-wide campaign operation by user ${userId} - consider adding admin role check`);
  }

  /**
   * Create a new campaign
   */
  async createCampaign(
    createCampaignDto: CreateCampaignDto,
    user: any,
  ): Promise<CampaignEntity> {
    const userId = user.sub || user.userId;

    // Check if user has promotions access based on their plan (Pro+ required)
    const hasPromotionsAccess = await this.subscriptionService.hasPromotionsAccess(userId);
    if (!hasPromotionsAccess) {
      throw new ForbiddenException('Campaigns and promotions require a Pro or Business plan. Please upgrade your subscription to access this feature.');
    }

    // Authorization check - only shop owner/admin can create campaigns for a shop
    if (createCampaignDto.shopId) {
      await this.verifyAuthorization(userId, createCampaignDto.shopId);
    }

    // Validate dates
    if (new Date(createCampaignDto.startDate) >= new Date(createCampaignDto.endDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    const campaignData: Partial<CampaignEntity> = {
      ...createCampaignDto,
      slug: this.generateSlug(createCampaignDto.name),
      status: 'scheduled',
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      targetProducts: createCampaignDto.targetProducts || [],
      targetCategories: createCampaignDto.targetCategories || [],
      targetShops: createCampaignDto.targetShops || [],
      bannerImages: createCampaignDto.bannerImages || [],
      settings: createCampaignDto.settings || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.logger.log(`Campaign created by user ${userId}: ${createCampaignDto.name}`);

    return this.db.createEntity(EntityType.CAMPAIGN, campaignData);
  }

  /**
   * Get all campaigns with filters
   */
  async getCampaigns(query: any) {
    const { status, type, shopId, limit = 20, offset = 0 } = query;
    const filters: any = {};

    if (status) filters.status = status;
    if (type) filters.campaignType = type;
    if (shopId) filters.shopId = shopId;

    return this.db.queryEntities(EntityType.CAMPAIGN, {
      filters,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  }

  /**
   * Get active campaigns only
   */
  async getActiveCampaigns() {
    const now = new Date();

    // Fetch all active campaigns first, then filter by date in code
    // (DatabaseService doesn't support $lte/$gte operators for date comparison)
    const result = await this.db.queryEntities(EntityType.CAMPAIGN, {
      filters: {
        status: 'active',
      },
    });

    if (!result.data || result.data.length === 0) {
      return { data: [], total: 0 };
    }

    // Filter campaigns where now is between startDate and endDate
    const activeCampaigns = result.data.filter((campaign: CampaignEntity) => {
      const startDate = new Date(campaign.startDate);
      const endDate = new Date(campaign.endDate);
      return startDate <= now && endDate >= now;
    });

    return { data: activeCampaigns, total: activeCampaigns.length };
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(id: string): Promise<CampaignEntity> {
    const campaign = await this.db.getEntity(EntityType.CAMPAIGN, id);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  /**
   * Get campaign by slug
   */
  async getCampaignBySlug(slug: string): Promise<CampaignEntity> {
    const result = await this.db.queryEntities(EntityType.CAMPAIGN, {
      filters: { slug },
      limit: 1,
    });

    if (!result.data || result.data.length === 0) {
      throw new NotFoundException('Campaign not found');
    }

    return result.data[0];
  }

  /**
   * Update campaign
   */
  async updateCampaign(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
    user: any,
  ): Promise<CampaignEntity> {
    const userId = user.sub || user.userId;
    const campaign = await this.getCampaign(id);

    // Authorization check - only campaign owner/shop admin can update
    await this.verifyAuthorization(userId, undefined, campaign);

    // Validate dates if both are provided
    const startDate = updateCampaignDto.startDate || campaign.startDate;
    const endDate = updateCampaignDto.endDate || campaign.endDate;

    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    // Update slug if name changed
    const updateData: any = {
      ...updateCampaignDto,
      updatedAt: new Date().toISOString(),
    };

    if (updateCampaignDto.name) {
      updateData.slug = this.generateSlug(updateCampaignDto.name);
    }

    this.logger.log(`Campaign ${id} updated by user ${userId}`);

    return this.db.updateEntity(EntityType.CAMPAIGN, id, updateData);
  }

  /**
   * Change campaign status
   */
  async changeCampaignStatus(
    id: string,
    status: string,
    user: any,
  ): Promise<CampaignEntity> {
    const userId = user.sub || user.userId;
    const campaign = await this.getCampaign(id);

    // Authorization check
    await this.verifyAuthorization(userId, undefined, campaign);

    const validStatuses = ['draft', 'scheduled', 'active', 'ended', 'paused'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    this.logger.log(`Campaign ${id} status changed to ${status} by user ${userId}`);

    return this.db.updateEntity(EntityType.CAMPAIGN, id, {
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(id: string, user: any) {
    const userId = user.sub || user.userId;
    const campaign = await this.getCampaign(id);

    // Authorization check - only campaign owner/shop admin can delete
    await this.verifyAuthorization(userId, undefined, campaign);

    await this.db.deleteEntity(EntityType.CAMPAIGN, id);
    this.logger.log(`Campaign ${id} deleted by user ${userId}`);

    return { message: 'Campaign deleted successfully' };
  }

  /**
   * Track campaign impression
   */
  async trackImpression(id: string) {
    const campaign = await this.getCampaign(id);

    await this.db.updateEntity(EntityType.CAMPAIGN, id, {
      impressions: campaign.impressions + 1,
      updatedAt: new Date().toISOString(),
    });

    return { message: 'Impression tracked successfully' };
  }

  /**
   * Track campaign click
   */
  async trackClick(id: string) {
    const campaign = await this.getCampaign(id);

    await this.db.updateEntity(EntityType.CAMPAIGN, id, {
      clicks: campaign.clicks + 1,
      updatedAt: new Date().toISOString(),
    });

    return { message: 'Click tracked successfully' };
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(id: string, user: any) {
    const userId = user.sub || user.userId;
    const campaign = await this.getCampaign(id);

    // Authorization check - only campaign owner/shop admin can view analytics
    await this.verifyAuthorization(userId, undefined, campaign);

    // Calculate CTR (Click-Through Rate)
    const ctr = campaign.impressions > 0
      ? (campaign.clicks / campaign.impressions) * 100
      : 0;

    // Calculate conversion rate
    const conversionRate = campaign.clicks > 0
      ? (campaign.conversions / campaign.clicks) * 100
      : 0;

    // Calculate average order value
    const avgOrderValue = campaign.conversions > 0
      ? campaign.revenue / campaign.conversions
      : 0;

    // Calculate ROI (this would need campaign cost data)
    // TODO: Add campaign cost tracking for ROI calculation

    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      status: campaign.status,
      dateRange: {
        start: campaign.startDate,
        end: campaign.endDate,
      },
      metrics: {
        impressions: campaign.impressions,
        clicks: campaign.clicks,
        conversions: campaign.conversions,
        revenue: campaign.revenue,
        ctr: parseFloat(ctr.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      },
      targets: {
        products: campaign.targetProducts.length,
        categories: campaign.targetCategories.length,
        shops: campaign.targetShops.length,
      },
    };
  }

  /**
   * Track campaign conversion (called from order service)
   * TODO: This should be called when an order is placed with campaign attribution
   */
  async trackConversion(id: string, orderValue: number) {
    const campaign = await this.getCampaign(id);

    await this.db.updateEntity(EntityType.CAMPAIGN, id, {
      conversions: campaign.conversions + 1,
      revenue: campaign.revenue + orderValue,
      updatedAt: new Date().toISOString(),
    });

    return { message: 'Conversion tracked successfully' };
  }

  /**
   * Auto-activate scheduled campaigns
   * TODO: This should be called by a cron job
   */
  async autoActivateCampaigns() {
    const now = new Date();

    // Fetch all scheduled campaigns first
    const result = await this.db.queryEntities(EntityType.CAMPAIGN, {
      filters: {
        status: 'scheduled',
      },
    });

    if (!result.data || result.data.length === 0) {
      return { activated: 0 };
    }

    // Filter campaigns where startDate <= now
    const campaignsToActivate = result.data.filter((campaign: CampaignEntity) => {
      const startDate = new Date(campaign.startDate);
      return startDate <= now;
    });

    for (const campaign of campaignsToActivate) {
      await this.db.updateEntity(EntityType.CAMPAIGN, campaign.id, {
        status: 'active',
        updatedAt: new Date().toISOString(),
      });
    }

    return { activated: campaignsToActivate.length };
  }

  /**
   * Auto-end expired campaigns
   * TODO: This should be called by a cron job
   */
  async autoEndCampaigns() {
    const now = new Date();

    // Fetch all active campaigns first
    const result = await this.db.queryEntities(EntityType.CAMPAIGN, {
      filters: {
        status: 'active',
      },
    });

    if (!result.data || result.data.length === 0) {
      return { ended: 0 };
    }

    // Filter campaigns where endDate < now (expired)
    const campaignsToEnd = result.data.filter((campaign: CampaignEntity) => {
      const endDate = new Date(campaign.endDate);
      return endDate < now;
    });

    for (const campaign of campaignsToEnd) {
      await this.db.updateEntity(EntityType.CAMPAIGN, campaign.id, {
        status: 'ended',
        updatedAt: new Date().toISOString(),
      });
    }

    return { ended: campaignsToEnd.length };
  }

  /**
   * Generate URL-friendly slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { EntityType, OfferEntity } from '../../database/schema';
import { CreateOfferDto } from './dto/create-offer.dto';
import { ValidateCouponDto, ApplyCouponDto } from './dto/validate-coupon.dto';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class OffersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly currencyService: CurrencyService,
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
  ) {}

  /**
   * Create a new offer/coupon
   */
  async createOffer(
    createOfferDto: CreateOfferDto,
    user: any,
  ): Promise<OfferEntity> {
    const userId = user.sub || user.userId;

    // Check if user has promotions access based on their plan (Pro+ required)
    const hasPromotionsAccess = await this.subscriptionService.hasPromotionsAccess(userId);
    if (!hasPromotionsAccess) {
      throw new ForbiddenException('Offers and promotions require a Pro or Business plan. Please upgrade your subscription to access this feature.');
    }

    // Validate dates
    if (new Date(createOfferDto.validFrom) >= new Date(createOfferDto.validTo)) {
      throw new BadRequestException('Valid to date must be after valid from date');
    }

    // Check if code already exists
    const existing = await this.db.queryEntities(EntityType.OFFER, {
      filters: { code: createOfferDto.code.toUpperCase() },
      limit: 1,
    });

    if (existing.data && existing.data.length > 0) {
      throw new BadRequestException('Coupon code already exists');
    }

    const offerData: Partial<OfferEntity> = {
      ...createOfferDto,
      code: createOfferDto.code.toUpperCase(),
      status: 'active',
      currentUsage: 0,
      specificProducts: createOfferDto.specificProducts || [],
      specificCategories: createOfferDto.specificCategories || [],
      excludedProducts: createOfferDto.excludedProducts || [],
      userTypes: createOfferDto.userTypes || ['all'],
      firstOrderOnly: createOfferDto.firstOrderOnly || false,
      appliedTo: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.db.createEntity(EntityType.OFFER, offerData);
  }

  /**
   * Get all offers with filters
   */
  async getOffers(query: any) {
    const { status, type, shopId, limit = 20, offset = 0 } = query;
    const filters: any = {};

    if (status) filters.status = status;
    if (type) filters.type = type;
    if (shopId) filters.shopId = shopId;

    return this.db.queryEntities(EntityType.OFFER, {
      filters,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  }

  /**
   * Get active offers only
   */
  async getActiveOffers() {
    const now = new Date().toISOString();

    return this.db.queryEntities(EntityType.OFFER, {
      filters: {
        status: 'active',
        validFrom: { $lte: now },
        validTo: { $gte: now },
      },
    });
  }

  /**
   * Get offer by ID
   */
  async getOffer(id: string): Promise<OfferEntity> {
    const offer = await this.db.getEntity(EntityType.OFFER, id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  /**
   * Validate a coupon code
   */
  async validateCoupon(validateCouponDto: ValidateCouponDto) {
    const { code, cartSubtotal, productIds, categoryIds, userId, itemCount } = validateCouponDto;

    // Find the offer by code
    const result = await this.db.queryEntities(EntityType.OFFER, {
      filters: { code: code.toUpperCase() },
      limit: 1,
    });

    if (!result.data || result.data.length === 0) {
      throw new NotFoundException('Coupon code not found');
    }

    const offer = result.data[0];

    // Check if offer is active
    if (offer.status !== 'active') {
      throw new BadRequestException('This coupon is no longer active');
    }

    // Check date validity
    const now = new Date();
    const validFrom = new Date(offer.validFrom);
    const validTo = new Date(offer.validTo);

    if (now < validFrom) {
      throw new BadRequestException('This coupon is not yet valid');
    }

    if (now > validTo) {
      throw new BadRequestException('This coupon has expired');
    }

    // Check total usage limit
    if (offer.totalUsageLimit && offer.currentUsage >= offer.totalUsageLimit) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }

    // Check per-user limit
    // TODO: Implement per-user usage tracking from order history

    // Check minimum purchase
    if (offer.minPurchase && cartSubtotal < offer.minPurchase) {
      const formattedAmount = this.currencyService.formatCurrency(offer.minPurchase);
      throw new BadRequestException(
        `Minimum purchase of ${formattedAmount} required to use this coupon`,
      );
    }

    // Check minimum items
    if (offer.minItems && itemCount && itemCount < offer.minItems) {
      throw new BadRequestException(
        `Minimum ${offer.minItems} items required to use this coupon`,
      );
    }

    // Check specific products
    if (offer.specificProducts.length > 0) {
      const hasValidProduct = productIds?.some((id) =>
        offer.specificProducts.includes(id),
      );
      if (!hasValidProduct) {
        throw new BadRequestException(
          'This coupon is only valid for specific products',
        );
      }
    }

    // Check specific categories
    if (offer.specificCategories.length > 0) {
      const hasValidCategory = categoryIds?.some((id) =>
        offer.specificCategories.includes(id),
      );
      if (!hasValidCategory) {
        throw new BadRequestException(
          'This coupon is only valid for specific categories',
        );
      }
    }

    // Check excluded products
    if (offer.excludedProducts.length > 0) {
      const hasExcludedProduct = productIds?.some((id) =>
        offer.excludedProducts.includes(id),
      );
      if (hasExcludedProduct) {
        throw new BadRequestException(
          'This coupon cannot be applied to some products in your cart',
        );
      }
    }

    // Calculate discount
    const discount = this.calculateDiscount(offer, cartSubtotal);

    return {
      valid: true,
      offer: {
        id: offer.id,
        code: offer.code,
        name: offer.name,
        type: offer.type,
        value: offer.value,
      },
      discount: {
        amount: discount,
        type: offer.type,
        finalTotal: Math.max(0, cartSubtotal - discount),
      },
      message: 'Coupon is valid and can be applied',
    };
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon(applyCouponDto: ApplyCouponDto, user: any) {
    // Validate the coupon first
    const validation = await this.validateCoupon(applyCouponDto);

    // TODO: Apply the coupon to the cart in database
    // This would typically update the cart entity with the applied coupon

    return {
      ...validation,
      message: 'Coupon applied successfully',
      cartId: applyCouponDto.cartId,
    };
  }

  /**
   * Update offer
   */
  async updateOffer(
    id: string,
    updateOfferDto: Partial<CreateOfferDto>,
    user: any,
  ): Promise<OfferEntity> {
    const offer = await this.getOffer(id);

    // TODO: Add authorization check - only admin or offer owner can update

    // Validate dates if both are provided
    const validFrom = updateOfferDto.validFrom || offer.validFrom;
    const validTo = updateOfferDto.validTo || offer.validTo;

    if (new Date(validFrom) >= new Date(validTo)) {
      throw new BadRequestException('Valid to date must be after valid from date');
    }

    // Don't allow changing code if offer has been used
    if (updateOfferDto.code && offer.currentUsage > 0) {
      throw new BadRequestException('Cannot change code of an offer that has been used');
    }

    const updateData: any = {
      ...updateOfferDto,
      updatedAt: new Date().toISOString(),
    };

    if (updateOfferDto.code) {
      updateData.code = updateOfferDto.code.toUpperCase();
    }

    return this.db.updateEntity(EntityType.OFFER, id, updateData);
  }

  /**
   * Change offer status
   */
  async changeOfferStatus(
    id: string,
    status: string,
    user: any,
  ): Promise<OfferEntity> {
    const offer = await this.getOffer(id);

    // TODO: Add authorization check

    const validStatuses = ['active', 'expired', 'disabled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return this.db.updateEntity(EntityType.OFFER, id, {
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Delete offer
   */
  async deleteOffer(id: string, user: any) {
    const offer = await this.getOffer(id);

    // TODO: Add authorization check - only admin or offer owner can delete

    // Don't allow deleting offers that have been used
    if (offer.currentUsage > 0) {
      throw new BadRequestException('Cannot delete an offer that has been used. Disable it instead.');
    }

    await this.db.deleteEntity(EntityType.OFFER, id);
    return { message: 'Offer deleted successfully' };
  }

  /**
   * Track offer usage (called from order service)
   * TODO: This should be called when an order is placed with an offer
   */
  async trackOfferUsage(code: string, userId: string, orderValue: number) {
    const result = await this.db.queryEntities(EntityType.OFFER, {
      filters: { code: code.toUpperCase() },
      limit: 1,
    });

    if (!result.data || result.data.length === 0) {
      throw new NotFoundException('Offer not found');
    }

    const offer = result.data[0];

    await this.db.updateEntity(EntityType.OFFER, offer.id, {
      currentUsage: offer.currentUsage + 1,
      updatedAt: new Date().toISOString(),
    });

    return { message: 'Offer usage tracked successfully' };
  }

  /**
   * Auto-expire offers
   * TODO: This should be called by a cron job
   */
  async autoExpireOffers() {
    const now = new Date().toISOString();

    const result = await this.db.queryEntities(EntityType.OFFER, {
      filters: {
        status: 'active',
        validTo: { $lt: now },
      },
    });

    if (result.data && result.data.length > 0) {
      for (const offer of result.data) {
        await this.db.updateEntity(EntityType.OFFER, offer.id, {
          status: 'expired',
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return { expired: result.data?.length || 0 };
  }

  /**
   * Calculate discount amount
   */
  private calculateDiscount(offer: OfferEntity, cartSubtotal: number): number {
    let discount = 0;

    switch (offer.type) {
      case 'percentage':
        discount = (cartSubtotal * offer.value) / 100;
        break;
      case 'fixed':
        discount = offer.value;
        break;
      case 'free_shipping':
        // Free shipping discount would be handled separately
        discount = 0;
        break;
      default:
        discount = 0;
    }

    // Apply max discount cap if set
    if (offer.maxDiscount && discount > offer.maxDiscount) {
      discount = offer.maxDiscount;
    }

    // Ensure discount doesn't exceed cart total
    discount = Math.min(discount, cartSubtotal);

    return Math.round(discount * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Generate random coupon code
   * Helper method for generating unique coupon codes
   */
  async generateCouponCode(prefix: string = '', length: number = 8): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix;

    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Check if code exists
    const existing = await this.db.queryEntities(EntityType.OFFER, {
      filters: { code },
      limit: 1,
    });

    if (existing.data && existing.data.length > 0) {
      // If code exists, generate a new one recursively
      return this.generateCouponCode(prefix, length);
    }

    return code;
  }
}

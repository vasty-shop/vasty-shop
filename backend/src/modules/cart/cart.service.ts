import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EntityType, CartEntity, CartItem } from '../../database/schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { TaxService } from '../tax/tax.service';
import { DeliveryService } from '../delivery/delivery.service';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class CartService {
  constructor(
    private readonly db: DatabaseService,
    private readonly taxService: TaxService,
    private readonly deliveryService: DeliveryService,
    private readonly currencyService: CurrencyService,
  ) {}

  /**
   * Get or create cart for authenticated user
   */
  async getCart(userId: string): Promise<CartEntity> {
    // Try to find existing cart
    const carts = await this.db.queryEntities(EntityType.CART, {
      filters: { userId, sessionId: null },
    });

    if (carts.data && carts.data.length > 0) {
      return carts.data[0];
    }

    // Create new cart if none exists
    return this.createCart(userId);
  }

  /**
   * Get guest cart by session ID
   */
  async getGuestCart(sessionId: string): Promise<CartEntity> {
    const carts = await this.db.queryEntities(EntityType.CART, {
      filters: { sessionId, userId: null },
    });

    if (carts.data && carts.data.length > 0) {
      return carts.data[0];
    }

    // Create guest cart with 7-day expiration
    return this.createGuestCart(sessionId);
  }

  /**
   * Create cart for authenticated user
   */
  async createCart(userId: string): Promise<CartEntity> {
    const cartData: Partial<CartEntity> = {
      userId,
      items: [],
      appliedCoupons: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      expiresAt: this.getExpirationDate(30), // 30 days for authenticated users
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.db.createEntity(EntityType.CART, cartData);
  }

  /**
   * Create guest cart
   */
  async createGuestCart(sessionId: string): Promise<CartEntity> {
    const cartData: Partial<CartEntity> = {
      sessionId,
      items: [],
      appliedCoupons: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      expiresAt: this.getExpirationDate(7), // 7 days for guests
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.db.createEntity(EntityType.CART, cartData);
  }

  /**
   * Add product to cart
   */
  async addItem(
    userId: string | null,
    addToCartDto: AddToCartDto,
  ): Promise<CartEntity> {
    const { productId, quantity, variant, sessionId } = addToCartDto;

    // Get cart
    let cart: CartEntity;
    if (userId) {
      cart = await this.getCart(userId);
    } else if (sessionId) {
      cart = await this.getGuestCart(sessionId);
    } else {
      throw new BadRequestException('userId or sessionId required');
    }

    // Get product details
    const product = await this.db.getEntity(
      EntityType.PRODUCT,
      productId,
    );
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.status || product.status !== 'active') {
      throw new BadRequestException('Product is not available');
    }

    // Check inventory
    if (product.stock < quantity) {
      throw new UnprocessableEntityException(
        `Only ${product.stock} items available in stock`,
      );
    }

    // Get shop details
    const shop = await this.db.getEntity(
      EntityType.SHOP,
      product.shopId,
    );

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId === productId &&
        JSON.stringify(item.variant) === JSON.stringify(variant),
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (newQuantity > product.stock) {
        throw new UnprocessableEntityException(
          `Cannot add more items. Only ${product.stock} available`,
        );
      }

      if (newQuantity > 100) {
        throw new BadRequestException('Maximum 100 items per product allowed');
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].total =
        newQuantity * cart.items[existingItemIndex].price;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: this.generateId(),
        productId,
        variantId: variant ? JSON.stringify(variant) : undefined,
        variant,
        shopId: product.shopId,
        shopName: shop?.name || 'Unknown Shop',
        name: product.name,
        image: product.images?.[0]?.url || '',
        price: product.price,
        quantity,
        total: product.price * quantity,
      };
      cart.items.push(newItem);
    }

    // Recalculate totals
    await this.recalculateTotals(cart);

    // Update cart
    return this.db.updateEntity(EntityType.CART, cart.id, cart);
  }

  /**
   * Update cart item quantity
   */
  async updateItem(
    cartId: string,
    itemId: string,
    updateDto: UpdateCartItemDto,
  ): Promise<CartEntity> {
    const { quantity } = updateDto;

    const cart = await this.db.getEntity(EntityType.CART, cartId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) {
      throw new NotFoundException('Cart item not found');
    }

    const item = cart.items[itemIndex];

    // Verify inventory
    const product = await this.db.getEntity(
      EntityType.PRODUCT,
      item.productId,
    );
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new UnprocessableEntityException(
        `Only ${product.stock} items available`,
      );
    }

    if (quantity > 100) {
      throw new BadRequestException('Maximum 100 items per product allowed');
    }

    // Update item
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].total = quantity * item.price;

    await this.recalculateTotals(cart);

    return this.db.updateEntity(EntityType.CART, cart.id, cart);
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartId: string, itemId: string): Promise<CartEntity> {
    const cart = await this.db.getEntity(EntityType.CART, cartId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = cart.items.filter((item) => item.id !== itemId);

    await this.recalculateTotals(cart);

    return this.db.updateEntity(EntityType.CART, cart.id, cart);
  }

  /**
   * Clear entire cart
   */
  async clearCart(cartId: string): Promise<CartEntity> {
    const cart = await this.db.getEntity(EntityType.CART, cartId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = [];
    cart.appliedCoupons = [];
    cart.discount = 0;
    await this.recalculateTotals(cart);

    return this.db.updateEntity(EntityType.CART, cart.id, cart);
  }

  /**
   * Apply coupon code to cart
   */
  async applyCoupon(
    cartId: string,
    applyCouponDto: ApplyCouponDto,
  ): Promise<CartEntity> {
    const { code } = applyCouponDto;

    const cart = await this.db.getEntity(EntityType.CART, cartId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Check if coupon already applied
    if (cart.appliedCoupons && cart.appliedCoupons.some((c) => c.code === code)) {
      throw new BadRequestException('Coupon already applied');
    }

    // Validate coupon
    const coupon = await this.validateCoupon(code, cart);

    // Add coupon to cart
    if (!cart.appliedCoupons) {
      cart.appliedCoupons = [];
    }

    cart.appliedCoupons.push({
      code: coupon.code,
      discountType: coupon.discount?.type || 'fixed',
      discountValue: coupon.discount?.value || 0,
      minPurchase: coupon.minPurchase,
      maxDiscount: coupon.discount?.maxDiscount,
      appliedAt: new Date().toISOString(),
    });

    await this.recalculateTotals(cart);

    return this.db.updateEntity(EntityType.CART, cart.id, cart);
  }

  /**
   * Remove coupon from cart
   */
  async removeCoupon(cartId: string, code: string): Promise<CartEntity> {
    const cart = await this.db.getEntity(EntityType.CART, cartId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.appliedCoupons = (cart.appliedCoupons || []).filter((c) => c.code !== code);

    await this.recalculateTotals(cart);

    return this.db.updateEntity(EntityType.CART, cart.id, cart);
  }

  /**
   * Validate coupon code
   */
  async validateCoupon(code: string, cart: CartEntity): Promise<any> {
    const offers = await this.db.queryEntities(EntityType.OFFER, {
      filters: { code: code.toUpperCase(), status: 'active' },
    });

    if (!offers.data || offers.data.length === 0) {
      throw new NotFoundException('Invalid coupon code');
    }

    const coupon = offers.data[0];

    // Check expiration
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new BadRequestException('Coupon has expired');
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    // Check minimum purchase
    if (coupon.minPurchase && cart.subtotal < coupon.minPurchase) {
      const formattedAmount = this.currencyService.formatCurrency(coupon.minPurchase);
      throw new BadRequestException(
        `Minimum purchase of ${formattedAmount} required`,
      );
    }

    // Check start date
    if (coupon.startsAt && new Date(coupon.startsAt) > new Date()) {
      throw new BadRequestException('Coupon not yet valid');
    }

    return coupon;
  }

  /**
   * Merge guest cart with user cart after login
   */
  async mergeGuestCart(
    sessionId: string,
    userId: string,
  ): Promise<CartEntity> {
    const guestCarts = await this.db.queryEntities(
      EntityType.CART,
      {
        filters: { sessionId, userId: null },
      },
    );

    if (!guestCarts.data || guestCarts.data.length === 0) {
      return this.getCart(userId);
    }

    const guestCart = guestCarts.data[0];

    if (guestCart.items.length === 0) {
      // Delete empty guest cart
      await this.db.deleteEntity(EntityType.CART, guestCart.id);
      return this.getCart(userId);
    }

    const userCart = await this.getCart(userId);

    // Merge items
    for (const guestItem of guestCart.items) {
      const existingItemIndex = userCart.items.findIndex(
        (item) =>
          item.productId === guestItem.productId &&
          JSON.stringify(item.variant) === JSON.stringify(guestItem.variant),
      );

      if (existingItemIndex !== -1) {
        // Merge quantities
        const newQuantity =
          userCart.items[existingItemIndex].quantity + guestItem.quantity;

        // Check inventory
        const product = await this.db.getEntity(
          EntityType.PRODUCT,
          guestItem.productId,
        );
        if (product && newQuantity <= product.stock) {
          userCart.items[existingItemIndex].quantity = Math.min(
            newQuantity,
            100,
          );
          userCart.items[existingItemIndex].total =
            userCart.items[existingItemIndex].quantity *
            userCart.items[existingItemIndex].price;
        }
      } else {
        userCart.items.push(guestItem);
      }
    }

    // Merge coupons
    if (guestCart.appliedCoupons) {
      if (!userCart.appliedCoupons) {
        userCart.appliedCoupons = [];
      }
      for (const guestCoupon of guestCart.appliedCoupons) {
        if (!userCart.appliedCoupons.some((c) => c.code === guestCoupon.code)) {
          userCart.appliedCoupons.push(guestCoupon);
        }
      }
    }

    await this.recalculateTotals(userCart);

    // Delete guest cart
    await this.db.deleteEntity(EntityType.CART, guestCart.id);

    return this.db.updateEntity(EntityType.CART, userCart.id, userCart);
  }

  /**
   * Check inventory availability for all cart items
   */
  async checkInventory(cartId: string): Promise<{
    available: boolean;
    unavailableItems: Array<{
      productId: string;
      productName: string;
      requested: number;
      available: number;
    }>;
  }> {
    const cart = await this.db.getEntity(EntityType.CART, cartId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const unavailableItems = [];

    for (const item of cart.items) {
      const product = await this.db.getEntity(
        EntityType.PRODUCT,
        item.productId,
      );

      if (!product || product.status !== 'active') {
        unavailableItems.push({
          productId: item.productId,
          productName: item.name,
          requested: item.quantity,
          available: 0,
        });
      } else if (product.stock < item.quantity) {
        unavailableItems.push({
          productId: item.productId,
          productName: item.name,
          requested: item.quantity,
          available: product.stock,
        });
      }
    }

    return {
      available: unavailableItems.length === 0,
      unavailableItems,
    };
  }

  /**
   * Calculate cart totals
   */
  private async recalculateTotals(cart: CartEntity): Promise<void> {
    // Calculate subtotal
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);

    // Calculate discount from coupons
    let discount = 0;
    if (cart.appliedCoupons && cart.appliedCoupons.length > 0) {
      for (const coupon of cart.appliedCoupons) {
        discount += this.calculateDiscount(cart.subtotal, {
          type: coupon.discountType,
          value: coupon.discountValue,
          maxDiscount: coupon.maxDiscount,
        });
      }
    }

    discount = Math.min(discount, cart.subtotal); // Discount cannot exceed subtotal
    cart.discount = parseFloat(discount.toFixed(2));

    // Calculate tax using TaxService (default to US with 10% rate)
    // TODO: Get actual country/province from user address or cart metadata
    try {
      const taxResult = await this.taxService.calculateTax({
        countryCode: 'US', // Default to US, should be from user's address
        items: cart.items.map(item => ({
          itemId: item.id,
          itemName: item.name,
          unitPrice: item.price,
          quantity: item.quantity,
          category: 'STANDARD' as any, // Use STANDARD category for general items
        })),
        currency: 'USD',
      });
      cart.tax = parseFloat(taxResult.totalTax.toFixed(2));
    } catch (error) {
      // Fallback to 10% if tax service fails
      cart.tax = parseFloat(((cart.subtotal - discount) * 0.1).toFixed(2));
    }

    // Calculate shipping using DeliveryService (free for orders over threshold)
    const deliveryMethods = await this.deliveryService.getDeliveryMethods();
    const standardDelivery = deliveryMethods.find(m => m.type === 'standard');
    const freeShippingThreshold = 100;

    cart.shipping = cart.subtotal - discount >= freeShippingThreshold
      ? 0
      : (standardDelivery?.baseCost || 10);

    // Calculate total
    cart.total = parseFloat(
      (cart.subtotal - discount + cart.tax + cart.shipping).toFixed(2),
    );

    cart.updatedAt = new Date().toISOString();
  }

  /**
   * Calculate discount amount
   */
  private calculateDiscount(subtotal: number, discountConfig: any): number {
    if (discountConfig.type === 'percentage') {
      const discount = subtotal * (discountConfig.value / 100);
      return discountConfig.maxDiscount
        ? Math.min(discount, discountConfig.maxDiscount)
        : discount;
    } else if (discountConfig.type === 'fixed') {
      return discountConfig.value;
    }
    return 0;
  }

  /**
   * Get expiration date for cart
   */
  private getExpirationDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }

  /**
   * Generate unique item ID
   */
  private generateId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

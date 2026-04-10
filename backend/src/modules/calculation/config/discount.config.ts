/**
 * Discount Configuration
 *
 * This configuration file contains discount rules, coupon types,
 * and validation logic for applying discounts to orders.
 */

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
}

export enum DiscountScope {
  ORDER = 'ORDER', // Apply to entire order
  CATEGORY = 'CATEGORY', // Apply to specific categories
  PRODUCT = 'PRODUCT', // Apply to specific products
  SHIPPING = 'SHIPPING', // Apply to shipping only
}

export interface DiscountRule {
  type: DiscountType;
  value: number; // Percentage (0-100) or fixed amount
  scope: DiscountScope;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludeCategories?: string[];
  excludeProducts?: string[];
  stackable?: boolean; // Can be combined with other discounts
}

export interface CouponConfig {
  code: string;
  name: string;
  description: string;
  type: DiscountType;
  value: number;
  scope: DiscountScope;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  maxUsesPerUser?: number;
  expiresAt?: Date;
  applicableCategories?: string[];
  applicableProducts?: string[];
  stackable?: boolean;
  active: boolean;
}

/**
 * Predefined discount rules
 */
export const DISCOUNT_RULES = {
  // Volume discounts
  BULK_5: {
    type: DiscountType.PERCENTAGE,
    value: 5,
    scope: DiscountScope.ORDER,
    minOrderAmount: 100,
    stackable: true,
  },
  BULK_10: {
    type: DiscountType.PERCENTAGE,
    value: 10,
    scope: DiscountScope.ORDER,
    minOrderAmount: 250,
    stackable: true,
  },
  BULK_15: {
    type: DiscountType.PERCENTAGE,
    value: 15,
    scope: DiscountScope.ORDER,
    minOrderAmount: 500,
    stackable: true,
  },

  // Category-specific discounts
  ELECTRONICS_SALE: {
    type: DiscountType.PERCENTAGE,
    value: 20,
    scope: DiscountScope.CATEGORY,
    applicableCategories: ['ELECTRONICS'],
    stackable: false,
  },
  CLOTHING_SALE: {
    type: DiscountType.PERCENTAGE,
    value: 25,
    scope: DiscountScope.CATEGORY,
    applicableCategories: ['CLOTHING'],
    stackable: false,
  },

  // Free shipping
  FREE_SHIP_THRESHOLD: {
    type: DiscountType.FREE_SHIPPING,
    value: 0,
    scope: DiscountScope.SHIPPING,
    minOrderAmount: 50,
    stackable: true,
  },
};

/**
 * Sample coupon codes
 */
export const SAMPLE_COUPONS: Record<string, CouponConfig> = {
  WELCOME10: {
    code: 'WELCOME10',
    name: 'Welcome Discount',
    description: 'Get 10% off your first order',
    type: DiscountType.PERCENTAGE,
    value: 10,
    scope: DiscountScope.ORDER,
    minOrderAmount: 30,
    maxDiscountAmount: 50,
    maxUsesPerUser: 1,
    stackable: false,
    active: true,
  },
  SAVE20: {
    code: 'SAVE20',
    name: 'Save $20',
    description: 'Save $20 on orders over $100',
    type: DiscountType.FIXED_AMOUNT,
    value: 20,
    scope: DiscountScope.ORDER,
    minOrderAmount: 100,
    stackable: false,
    active: true,
  },
  FREESHIP: {
    code: 'FREESHIP',
    name: 'Free Shipping',
    description: 'Get free shipping on any order',
    type: DiscountType.FREE_SHIPPING,
    value: 0,
    scope: DiscountScope.SHIPPING,
    stackable: true,
    active: true,
  },
  SUMMER25: {
    code: 'SUMMER25',
    name: 'Summer Sale',
    description: '25% off all items',
    type: DiscountType.PERCENTAGE,
    value: 25,
    scope: DiscountScope.ORDER,
    maxDiscountAmount: 100,
    stackable: false,
    active: true,
  },
  ELECTRONICS15: {
    code: 'ELECTRONICS15',
    name: 'Electronics Discount',
    description: '15% off electronics',
    type: DiscountType.PERCENTAGE,
    value: 15,
    scope: DiscountScope.CATEGORY,
    applicableCategories: ['ELECTRONICS'],
    stackable: true,
    active: true,
  },
};

/**
 * Calculate percentage discount
 */
export function calculatePercentageDiscount(
  amount: number,
  percentage: number,
  maxDiscount?: number,
): number {
  const discount = (amount * percentage) / 100;
  if (maxDiscount && discount > maxDiscount) {
    return maxDiscount;
  }
  return discount;
}

/**
 * Calculate fixed amount discount
 */
export function calculateFixedDiscount(amount: number, fixedAmount: number): number {
  return Math.min(amount, fixedAmount);
}

/**
 * Validate coupon code
 */
export function validateCoupon(
  couponCode: string,
  orderAmount: number,
): { valid: boolean; message?: string; coupon?: CouponConfig } {
  const coupon = SAMPLE_COUPONS[couponCode.toUpperCase()];

  if (!coupon) {
    return {
      valid: false,
      message: 'Invalid coupon code',
    };
  }

  if (!coupon.active) {
    return {
      valid: false,
      message: 'This coupon is no longer active',
    };
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return {
      valid: false,
      message: 'This coupon has expired',
    };
  }

  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of ${coupon.minOrderAmount} required`,
    };
  }

  return {
    valid: true,
    coupon,
  };
}

/**
 * Apply discount based on rule
 */
export function applyDiscount(
  amount: number,
  discountRule: DiscountRule | CouponConfig,
): number {
  switch (discountRule.type) {
    case DiscountType.PERCENTAGE:
      return calculatePercentageDiscount(
        amount,
        discountRule.value,
        'maxDiscountAmount' in discountRule
          ? discountRule.maxDiscountAmount
          : undefined,
      );

    case DiscountType.FIXED_AMOUNT:
      return calculateFixedDiscount(amount, discountRule.value);

    case DiscountType.FREE_SHIPPING:
      // Free shipping discount is handled separately in shipping calculation
      return 0;

    default:
      return 0;
  }
}

/**
 * Check if item is eligible for discount
 */
export function isItemEligible(
  itemCategory: string,
  productId: string,
  discountRule: DiscountRule | CouponConfig,
): boolean {
  // Check scope
  if (discountRule.scope === DiscountScope.ORDER) {
    return true;
  }

  // Check category eligibility
  if (discountRule.scope === DiscountScope.CATEGORY) {
    if (
      discountRule.applicableCategories &&
      !discountRule.applicableCategories.includes(itemCategory)
    ) {
      return false;
    }

    if (
      'excludeCategories' in discountRule &&
      discountRule.excludeCategories &&
      discountRule.excludeCategories.includes(itemCategory)
    ) {
      return false;
    }
  }

  // Check product eligibility
  if (discountRule.scope === DiscountScope.PRODUCT) {
    if (
      discountRule.applicableProducts &&
      !discountRule.applicableProducts.includes(productId)
    ) {
      return false;
    }

    if (
      'excludeProducts' in discountRule &&
      discountRule.excludeProducts &&
      discountRule.excludeProducts.includes(productId)
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate total discount for items
 */
export function calculateItemsDiscount(
  items: Array<{
    productId: string;
    price: number;
    quantity: number;
    category: string;
  }>,
  discountRule: DiscountRule | CouponConfig,
): number {
  let eligibleAmount = 0;

  for (const item of items) {
    if (isItemEligible(item.category, item.productId, discountRule)) {
      eligibleAmount += item.price * item.quantity;
    }
  }

  return applyDiscount(eligibleAmount, discountRule);
}

/**
 * Check if discounts can be stacked
 */
export function canStackDiscounts(
  discount1: DiscountRule | CouponConfig,
  discount2: DiscountRule | CouponConfig,
): boolean {
  const stackable1 = 'stackable' in discount1 ? discount1.stackable : false;
  const stackable2 = 'stackable' in discount2 ? discount2.stackable : false;

  return stackable1 && stackable2;
}

/**
 * Apply multiple discounts with stacking rules
 */
export function applyMultipleDiscounts(
  amount: number,
  discounts: Array<DiscountRule | CouponConfig>,
): { totalDiscount: number; appliedDiscounts: Array<{ type: string; amount: number }> } {
  const appliedDiscounts: Array<{ type: string; amount: number }> = [];
  let remainingAmount = amount;
  let totalDiscount = 0;

  // Sort discounts: non-stackable first (apply the best one), then stackable
  const nonStackable = discounts.filter((d) => !('stackable' in d) || !d.stackable);
  const stackable = discounts.filter((d) => 'stackable' in d && d.stackable);

  // Apply best non-stackable discount
  if (nonStackable.length > 0) {
    let bestDiscount = 0;
    let bestDiscountRule = nonStackable[0];

    for (const discount of nonStackable) {
      const discountAmount = applyDiscount(amount, discount);
      if (discountAmount > bestDiscount) {
        bestDiscount = discountAmount;
        bestDiscountRule = discount;
      }
    }

    totalDiscount += bestDiscount;
    remainingAmount -= bestDiscount;
    appliedDiscounts.push({
      type: bestDiscountRule.type,
      amount: bestDiscount,
    });
  }

  // Apply stackable discounts
  for (const discount of stackable) {
    if (remainingAmount <= 0) break;

    const discountAmount = applyDiscount(remainingAmount, discount);
    totalDiscount += discountAmount;
    remainingAmount -= discountAmount;
    appliedDiscounts.push({
      type: discount.type,
      amount: discountAmount,
    });
  }

  return {
    totalDiscount,
    appliedDiscounts,
  };
}

/**
 * Get coupon by code
 */
export function getCouponByCode(code: string): CouponConfig | null {
  return SAMPLE_COUPONS[code.toUpperCase()] || null;
}

/**
 * Get all active coupons
 */
export function getActiveCoupons(): CouponConfig[] {
  return Object.values(SAMPLE_COUPONS).filter((coupon) => coupon.active);
}

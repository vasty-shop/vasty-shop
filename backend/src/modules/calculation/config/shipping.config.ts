/**
 * Shipping Configuration
 *
 * This configuration file contains shipping rates, methods, and rules
 * for different countries and delivery options.
 */

export enum ShippingMethod {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  OVERNIGHT = 'OVERNIGHT',
  PICKUP = 'PICKUP',
  ECONOMY = 'ECONOMY',
}

export interface ShippingRate {
  method: ShippingMethod;
  name: string;
  baseRate: number;
  perKgRate?: number;
  estimatedDays: string;
  description: string;
}

export interface CountryShippingConfig {
  countryCode: string;
  countryName: string;
  currency: string;
  rates: ShippingRate[];
  freeShippingThreshold?: number;
  weightLimit?: number; // Maximum weight in kg
}

export interface FreeShippingRule {
  minOrderAmount?: number;
  applicableMethods?: ShippingMethod[];
  applicableCountries?: string[];
  applicableCategories?: string[];
}

/**
 * Japan Shipping Configuration
 */
export const JAPAN_SHIPPING_CONFIG: CountryShippingConfig = {
  countryCode: 'JP',
  countryName: 'Japan',
  currency: 'JPY',
  freeShippingThreshold: 5000, // Free shipping over 5000 JPY
  weightLimit: 30, // 30kg max
  rates: [
    {
      method: ShippingMethod.STANDARD,
      name: 'Standard Delivery',
      baseRate: 500,
      perKgRate: 100,
      estimatedDays: '3-5 business days',
      description: 'Standard shipping via Japan Post',
    },
    {
      method: ShippingMethod.EXPRESS,
      name: 'Express Delivery',
      baseRate: 1000,
      perKgRate: 200,
      estimatedDays: '1-2 business days',
      description: 'Fast delivery via courier service',
    },
    {
      method: ShippingMethod.OVERNIGHT,
      name: 'Overnight Delivery',
      baseRate: 1500,
      perKgRate: 250,
      estimatedDays: 'Next business day',
      description: 'Next day delivery for urgent orders',
    },
    {
      method: ShippingMethod.PICKUP,
      name: 'Store Pickup',
      baseRate: 0,
      estimatedDays: '1-2 hours',
      description: 'Pick up from nearest store location',
    },
  ],
};

/**
 * Bangladesh Shipping Configuration
 */
export const BANGLADESH_SHIPPING_CONFIG: CountryShippingConfig = {
  countryCode: 'BD',
  countryName: 'Bangladesh',
  currency: 'BDT',
  freeShippingThreshold: 1000, // Free shipping over 1000 BDT
  weightLimit: 25, // 25kg max
  rates: [
    {
      method: ShippingMethod.ECONOMY,
      name: 'Economy Delivery',
      baseRate: 50,
      perKgRate: 20,
      estimatedDays: '5-7 business days',
      description: 'Affordable shipping option',
    },
    {
      method: ShippingMethod.STANDARD,
      name: 'Standard Delivery',
      baseRate: 80,
      perKgRate: 30,
      estimatedDays: '3-5 business days',
      description: 'Regular delivery service',
    },
    {
      method: ShippingMethod.EXPRESS,
      name: 'Express Delivery',
      baseRate: 150,
      perKgRate: 50,
      estimatedDays: '1-2 business days',
      description: 'Fast courier delivery',
    },
    {
      method: ShippingMethod.PICKUP,
      name: 'Store Pickup',
      baseRate: 0,
      estimatedDays: 'Same day',
      description: 'Pick up from store location',
    },
  ],
};

/**
 * Canada Shipping Configuration
 */
export const CANADA_SHIPPING_CONFIG: CountryShippingConfig = {
  countryCode: 'CA',
  countryName: 'Canada',
  currency: 'CAD',
  freeShippingThreshold: 75, // Free shipping over 75 CAD
  weightLimit: 30, // 30kg max
  rates: [
    {
      method: ShippingMethod.STANDARD,
      name: 'Standard Delivery',
      baseRate: 10,
      perKgRate: 2,
      estimatedDays: '5-7 business days',
      description: 'Canada Post regular parcel',
    },
    {
      method: ShippingMethod.EXPRESS,
      name: 'Express Delivery',
      baseRate: 20,
      perKgRate: 4,
      estimatedDays: '2-3 business days',
      description: 'Canada Post Xpresspost',
    },
    {
      method: ShippingMethod.OVERNIGHT,
      name: 'Overnight Delivery',
      baseRate: 35,
      perKgRate: 6,
      estimatedDays: 'Next business day',
      description: 'Priority overnight shipping',
    },
    {
      method: ShippingMethod.PICKUP,
      name: 'Store Pickup',
      baseRate: 0,
      estimatedDays: '1-2 hours',
      description: 'Pick up from store',
    },
  ],
};

/**
 * United States Shipping Configuration
 */
export const USA_SHIPPING_CONFIG: CountryShippingConfig = {
  countryCode: 'US',
  countryName: 'United States',
  currency: 'USD',
  freeShippingThreshold: 50, // Free shipping over 50 USD
  weightLimit: 30, // 30kg max
  rates: [
    {
      method: ShippingMethod.ECONOMY,
      name: 'Economy Delivery',
      baseRate: 5,
      perKgRate: 1.5,
      estimatedDays: '7-10 business days',
      description: 'USPS Ground Advantage',
    },
    {
      method: ShippingMethod.STANDARD,
      name: 'Standard Delivery',
      baseRate: 8,
      perKgRate: 2,
      estimatedDays: '3-5 business days',
      description: 'USPS Priority Mail',
    },
    {
      method: ShippingMethod.EXPRESS,
      name: 'Express Delivery',
      baseRate: 15,
      perKgRate: 3,
      estimatedDays: '1-2 business days',
      description: 'USPS Priority Mail Express',
    },
    {
      method: ShippingMethod.OVERNIGHT,
      name: 'Overnight Delivery',
      baseRate: 25,
      perKgRate: 5,
      estimatedDays: 'Next business day',
      description: 'FedEx/UPS Overnight',
    },
    {
      method: ShippingMethod.PICKUP,
      name: 'Store Pickup',
      baseRate: 0,
      estimatedDays: '2-4 hours',
      description: 'Pick up from store',
    },
  ],
};

/**
 * Default/International Shipping Configuration
 */
export const DEFAULT_SHIPPING_CONFIG: CountryShippingConfig = {
  countryCode: 'INTL',
  countryName: 'International',
  currency: 'USD',
  freeShippingThreshold: 100, // Free shipping over 100 USD
  weightLimit: 20, // 20kg max for international
  rates: [
    {
      method: ShippingMethod.STANDARD,
      name: 'International Standard',
      baseRate: 25,
      perKgRate: 8,
      estimatedDays: '10-20 business days',
      description: 'Standard international shipping',
    },
    {
      method: ShippingMethod.EXPRESS,
      name: 'International Express',
      baseRate: 50,
      perKgRate: 15,
      estimatedDays: '5-7 business days',
      description: 'Express international shipping',
    },
  ],
};

/**
 * Shipping Configuration Registry
 */
export const SHIPPING_CONFIG_REGISTRY: Record<string, CountryShippingConfig> = {
  JP: JAPAN_SHIPPING_CONFIG,
  BD: BANGLADESH_SHIPPING_CONFIG,
  CA: CANADA_SHIPPING_CONFIG,
  US: USA_SHIPPING_CONFIG,
  INTL: DEFAULT_SHIPPING_CONFIG,
};

/**
 * Free Shipping Rules
 */
export const FREE_SHIPPING_RULES: FreeShippingRule[] = [
  {
    // Free standard shipping for orders over threshold
    applicableMethods: [ShippingMethod.STANDARD],
  },
  {
    // Free pickup always available
    applicableMethods: [ShippingMethod.PICKUP],
  },
];

/**
 * Helper function to get shipping configuration for a country
 */
export function getShippingConfig(countryCode: string): CountryShippingConfig {
  return SHIPPING_CONFIG_REGISTRY[countryCode.toUpperCase()] || DEFAULT_SHIPPING_CONFIG;
}

/**
 * Helper function to get specific shipping rate
 */
export function getShippingRate(
  countryCode: string,
  method: ShippingMethod,
): ShippingRate | null {
  const config = getShippingConfig(countryCode);
  return config.rates.find((rate) => rate.method === method) || null;
}

/**
 * Helper function to check if shipping method is available for country
 */
export function isShippingMethodAvailable(
  countryCode: string,
  method: ShippingMethod,
): boolean {
  const config = getShippingConfig(countryCode);
  return config.rates.some((rate) => rate.method === method);
}

/**
 * Calculate shipping cost based on weight and method
 */
export function calculateShippingCost(
  countryCode: string,
  method: ShippingMethod,
  weight: number,
): number {
  const rate = getShippingRate(countryCode, method);

  if (!rate) {
    return 0;
  }

  // Pickup is always free
  if (method === ShippingMethod.PICKUP) {
    return 0;
  }

  // Base rate + weight-based rate
  const weightCost = rate.perKgRate ? rate.perKgRate * weight : 0;
  return rate.baseRate + weightCost;
}

/**
 * Check if order qualifies for free shipping
 */
export function qualifiesForFreeShipping(
  countryCode: string,
  method: ShippingMethod,
  orderAmount: number,
): boolean {
  const config = getShippingConfig(countryCode);

  // Pickup is always free
  if (method === ShippingMethod.PICKUP) {
    return true;
  }

  // Check if order amount meets threshold for standard shipping
  if (
    method === ShippingMethod.STANDARD &&
    config.freeShippingThreshold &&
    orderAmount >= config.freeShippingThreshold
  ) {
    return true;
  }

  return false;
}

/**
 * Get all available shipping methods for a country
 */
export function getAvailableShippingMethods(countryCode: string): ShippingRate[] {
  const config = getShippingConfig(countryCode);
  return config.rates;
}

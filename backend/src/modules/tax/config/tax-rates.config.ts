/**
 * Tax Rates Configuration
 *
 * This configuration file contains tax rates for supported countries:
 * - Japan (JP): Standard 10%, Reduced 8%
 * - Bangladesh (BD): Standard 15%, Category-based rates
 * - Canada (CA): Province-specific GST/HST/PST rates
 */

export enum TaxCategory {
  // Japan categories
  STANDARD = 'STANDARD',
  REDUCED = 'REDUCED',

  // Bangladesh categories
  ESSENTIAL_FOOD = 'ESSENTIAL_FOOD',
  LUXURY_GOODS = 'LUXURY_GOODS',
  ELECTRONICS = 'ELECTRONICS',
  CLOTHING = 'CLOTHING',
  SERVICES = 'SERVICES',
}

export interface TaxRate {
  rate: number;
  name: string;
  description?: string;
}

export interface CountryTaxConfig {
  countryCode: string;
  countryName: string;
  defaultRate: number;
  categoryRates?: Record<TaxCategory, number>;
  provinceRates?: Record<string, ProvinceTaxRate>;
}

export interface ProvinceTaxRate {
  provinceName: string;
  gst?: number; // Goods and Services Tax (Federal)
  pst?: number; // Provincial Sales Tax
  hst?: number; // Harmonized Sales Tax (Combined)
  totalRate: number;
  description?: string;
}

/**
 * Japan Tax Configuration
 * - Standard rate: 10% (消費税)
 * - Reduced rate: 8% (軽減税率) - Applied to food, beverages (excluding alcohol), newspapers
 */
export const JAPAN_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'JP',
  countryName: 'Japan',
  defaultRate: 10.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 10.0,
    [TaxCategory.REDUCED]: 8.0,
    [TaxCategory.ESSENTIAL_FOOD]: 8.0, // Food items (excluding dining out and alcohol)
    [TaxCategory.LUXURY_GOODS]: 10.0,
    [TaxCategory.ELECTRONICS]: 10.0,
    [TaxCategory.CLOTHING]: 10.0,
    [TaxCategory.SERVICES]: 10.0,
  },
};

/**
 * Bangladesh Tax Configuration
 * - Standard VAT: 15%
 * - Category-based rates vary from 0% to 15%
 */
export const BANGLADESH_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'BD',
  countryName: 'Bangladesh',
  defaultRate: 15.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 15.0,
    [TaxCategory.ESSENTIAL_FOOD]: 0.0, // Essential food items are VAT exempt
    [TaxCategory.LUXURY_GOODS]: 15.0,
    [TaxCategory.ELECTRONICS]: 15.0,
    [TaxCategory.CLOTHING]: 5.0, // Reduced rate for clothing
    [TaxCategory.SERVICES]: 15.0,
    [TaxCategory.REDUCED]: 5.0,
  },
};

/**
 * Canada Tax Configuration
 * Canada has a complex tax system with federal GST and provincial PST/HST
 * - GST: 5% (Federal, applies to most provinces)
 * - HST: Harmonized tax (combines federal and provincial) in some provinces
 * - PST: Provincial tax (separate from GST) in some provinces
 */
export const CANADA_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'CA',
  countryName: 'Canada',
  defaultRate: 5.0, // Federal GST only
  provinceRates: {
    // Atlantic Provinces (HST)
    NB: {
      provinceName: 'New Brunswick',
      hst: 15.0,
      totalRate: 15.0,
      description: 'Harmonized Sales Tax (HST)',
    },
    NL: {
      provinceName: 'Newfoundland and Labrador',
      hst: 15.0,
      totalRate: 15.0,
      description: 'Harmonized Sales Tax (HST)',
    },
    NS: {
      provinceName: 'Nova Scotia',
      hst: 15.0,
      totalRate: 15.0,
      description: 'Harmonized Sales Tax (HST)',
    },
    PE: {
      provinceName: 'Prince Edward Island',
      hst: 15.0,
      totalRate: 15.0,
      description: 'Harmonized Sales Tax (HST)',
    },

    // Ontario (HST)
    ON: {
      provinceName: 'Ontario',
      hst: 13.0,
      totalRate: 13.0,
      description: 'Harmonized Sales Tax (HST)',
    },

    // Western Provinces (GST + PST)
    BC: {
      provinceName: 'British Columbia',
      gst: 5.0,
      pst: 7.0,
      totalRate: 12.0,
      description: 'GST + PST',
    },
    MB: {
      provinceName: 'Manitoba',
      gst: 5.0,
      pst: 7.0,
      totalRate: 12.0,
      description: 'GST + PST',
    },
    SK: {
      provinceName: 'Saskatchewan',
      gst: 5.0,
      pst: 6.0,
      totalRate: 11.0,
      description: 'GST + PST',
    },

    // Quebec (GST + QST)
    QC: {
      provinceName: 'Quebec',
      gst: 5.0,
      pst: 9.975, // QST (Quebec Sales Tax)
      totalRate: 14.975,
      description: 'GST + QST',
    },

    // Territories and Alberta (GST only)
    AB: {
      provinceName: 'Alberta',
      gst: 5.0,
      totalRate: 5.0,
      description: 'GST only (no provincial tax)',
    },
    NT: {
      provinceName: 'Northwest Territories',
      gst: 5.0,
      totalRate: 5.0,
      description: 'GST only',
    },
    NU: {
      provinceName: 'Nunavut',
      gst: 5.0,
      totalRate: 5.0,
      description: 'GST only',
    },
    YT: {
      provinceName: 'Yukon',
      gst: 5.0,
      totalRate: 5.0,
      description: 'GST only',
    },
  },
};

/**
 * Master tax configuration registry
 */
export const TAX_CONFIG_REGISTRY: Record<string, CountryTaxConfig> = {
  JP: JAPAN_TAX_CONFIG,
  BD: BANGLADESH_TAX_CONFIG,
  CA: CANADA_TAX_CONFIG,
};

/**
 * Helper function to get tax configuration for a country
 */
export function getTaxConfig(countryCode: string): CountryTaxConfig | null {
  return TAX_CONFIG_REGISTRY[countryCode.toUpperCase()] || null;
}

/**
 * Helper function to check if a country code is supported
 */
export function isSupportedCountry(countryCode: string): boolean {
  return countryCode.toUpperCase() in TAX_CONFIG_REGISTRY;
}

/**
 * Get all supported country codes
 */
export function getSupportedCountries(): string[] {
  return Object.keys(TAX_CONFIG_REGISTRY);
}

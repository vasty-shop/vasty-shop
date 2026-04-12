/**
 * Tax Rates Configuration
 *
 * This configuration file contains tax rates for supported countries:
 * - Japan (JP): Standard 10%, Reduced 8%
 * - Bangladesh (BD): Standard 15%, Category-based rates
 * - Canada (CA): Province-specific GST/HST/PST rates
 * - United States (US): State-level sales tax (top 15 states)
 * - EU Countries: DE, FR, IT, ES, NL, BE, AT, IE, PT, PL, SE (standard + reduced VAT)
 * - United Kingdom (GB): 20% standard, 5% reduced, 0% zero-rated
 * - Australia (AU): 10% GST
 * - India (IN): 18% standard GST
 * - Brazil (BR): 18% ICMS average
 * - Singapore (SG): 9% GST
 * - South Korea (KR): 10% VAT
 * - Mexico (MX): 16% IVA
 */

/**
 * Tax display mode for price presentation.
 * Set via TAX_DISPLAY_MODE env var:
 * - 'inclusive': prices include tax (common in EU/UK/AU)
 * - 'exclusive': tax added at checkout (common in US/CA)
 */
export type TaxDisplayMode = 'inclusive' | 'exclusive';

export function getTaxDisplayMode(): TaxDisplayMode {
  const mode = process.env.TAX_DISPLAY_MODE?.toLowerCase();
  if (mode === 'inclusive') return 'inclusive';
  return 'exclusive'; // default
}

export enum TaxCategory {
  // General categories
  STANDARD = 'STANDARD',
  REDUCED = 'REDUCED',

  // Product categories
  ESSENTIAL_FOOD = 'ESSENTIAL_FOOD',
  LUXURY_GOODS = 'LUXURY_GOODS',
  ELECTRONICS = 'ELECTRONICS',
  CLOTHING = 'CLOTHING',
  SERVICES = 'SERVICES',
  DIGITAL_GOODS = 'DIGITAL_GOODS',
  CHILDRENS_CLOTHING = 'CHILDRENS_CLOTHING',
  MEDICAL = 'MEDICAL',
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
 * - Standard rate: 10%
 * - Reduced rate: 8% for food and beverages (excluding alcohol and dining out)
 */
export const JAPAN_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'JP',
  countryName: 'Japan',
  defaultRate: 10.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 10.0,
    [TaxCategory.REDUCED]: 8.0,
    [TaxCategory.ESSENTIAL_FOOD]: 8.0,
    [TaxCategory.LUXURY_GOODS]: 10.0,
    [TaxCategory.ELECTRONICS]: 10.0,
    [TaxCategory.CLOTHING]: 10.0,
    [TaxCategory.SERVICES]: 10.0,
    [TaxCategory.DIGITAL_GOODS]: 10.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 10.0,
    [TaxCategory.MEDICAL]: 10.0,
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
    [TaxCategory.ESSENTIAL_FOOD]: 0.0,
    [TaxCategory.LUXURY_GOODS]: 15.0,
    [TaxCategory.ELECTRONICS]: 15.0,
    [TaxCategory.CLOTHING]: 5.0,
    [TaxCategory.SERVICES]: 15.0,
    [TaxCategory.REDUCED]: 5.0,
    [TaxCategory.DIGITAL_GOODS]: 15.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 5.0,
    [TaxCategory.MEDICAL]: 0.0,
  },
};

/**
 * Canada Tax Configuration
 * Federal GST + provincial PST/HST.
 */
export const CANADA_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'CA',
  countryName: 'Canada',
  defaultRate: 5.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 5.0,
    [TaxCategory.ESSENTIAL_FOOD]: 0.0,
    [TaxCategory.REDUCED]: 0.0,
    [TaxCategory.LUXURY_GOODS]: 5.0,
    [TaxCategory.ELECTRONICS]: 5.0,
    [TaxCategory.CLOTHING]: 5.0,
    [TaxCategory.SERVICES]: 5.0,
    [TaxCategory.DIGITAL_GOODS]: 5.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 5.0,
    [TaxCategory.MEDICAL]: 0.0,
  },
  provinceRates: {
    NB: { provinceName: 'New Brunswick', hst: 15.0, totalRate: 15.0, description: 'Harmonized Sales Tax (HST)' },
    NL: { provinceName: 'Newfoundland and Labrador', hst: 15.0, totalRate: 15.0, description: 'Harmonized Sales Tax (HST)' },
    NS: { provinceName: 'Nova Scotia', hst: 15.0, totalRate: 15.0, description: 'Harmonized Sales Tax (HST)' },
    PE: { provinceName: 'Prince Edward Island', hst: 15.0, totalRate: 15.0, description: 'Harmonized Sales Tax (HST)' },
    ON: { provinceName: 'Ontario', hst: 13.0, totalRate: 13.0, description: 'Harmonized Sales Tax (HST)' },
    BC: { provinceName: 'British Columbia', gst: 5.0, pst: 7.0, totalRate: 12.0, description: 'GST + PST' },
    MB: { provinceName: 'Manitoba', gst: 5.0, pst: 7.0, totalRate: 12.0, description: 'GST + PST' },
    SK: { provinceName: 'Saskatchewan', gst: 5.0, pst: 6.0, totalRate: 11.0, description: 'GST + PST' },
    QC: { provinceName: 'Quebec', gst: 5.0, pst: 9.975, totalRate: 14.975, description: 'GST + QST' },
    AB: { provinceName: 'Alberta', gst: 5.0, totalRate: 5.0, description: 'GST only (no provincial tax)' },
    NT: { provinceName: 'Northwest Territories', gst: 5.0, totalRate: 5.0, description: 'GST only' },
    NU: { provinceName: 'Nunavut', gst: 5.0, totalRate: 5.0, description: 'GST only' },
    YT: { provinceName: 'Yukon', gst: 5.0, totalRate: 5.0, description: 'GST only' },
  },
};

// ─── United States ──────────────────────────────────────────────────────────────
/**
 * US Tax Configuration
 * State-level sales tax (simplified average rates for top 15 states).
 * No federal sales tax. Province-level entries represent states.
 */
export const US_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'US',
  countryName: 'United States',
  defaultRate: 0.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 0.0,
    [TaxCategory.ESSENTIAL_FOOD]: 0.0,
    [TaxCategory.REDUCED]: 0.0,
    [TaxCategory.LUXURY_GOODS]: 0.0,
    [TaxCategory.ELECTRONICS]: 0.0,
    [TaxCategory.CLOTHING]: 0.0,
    [TaxCategory.SERVICES]: 0.0,
    [TaxCategory.DIGITAL_GOODS]: 0.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 0.0,
    [TaxCategory.MEDICAL]: 0.0,
  },
  provinceRates: {
    CA: { provinceName: 'California', totalRate: 7.25, description: 'State sales tax' },
    NY: { provinceName: 'New York', totalRate: 8.0, description: 'State + city average' },
    TX: { provinceName: 'Texas', totalRate: 6.25, description: 'State sales tax' },
    FL: { provinceName: 'Florida', totalRate: 6.0, description: 'State sales tax' },
    IL: { provinceName: 'Illinois', totalRate: 6.25, description: 'State sales tax' },
    PA: { provinceName: 'Pennsylvania', totalRate: 6.0, description: 'State sales tax' },
    OH: { provinceName: 'Ohio', totalRate: 5.75, description: 'State sales tax' },
    GA: { provinceName: 'Georgia', totalRate: 4.0, description: 'State sales tax' },
    NC: { provinceName: 'North Carolina', totalRate: 4.75, description: 'State sales tax' },
    MI: { provinceName: 'Michigan', totalRate: 6.0, description: 'State sales tax' },
    NJ: { provinceName: 'New Jersey', totalRate: 6.625, description: 'State sales tax' },
    VA: { provinceName: 'Virginia', totalRate: 5.3, description: 'State sales tax' },
    WA: { provinceName: 'Washington', totalRate: 6.5, description: 'State sales tax' },
    AZ: { provinceName: 'Arizona', totalRate: 5.6, description: 'State TPT' },
    MA: { provinceName: 'Massachusetts', totalRate: 6.25, description: 'State sales tax' },
  },
};

// ─── European Union VAT ─────────────────────────────────────────────────────────

/** Germany: 19% standard / 7% reduced */
export const GERMANY_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'DE',
  countryName: 'Germany',
  defaultRate: 19.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 19.0,
    [TaxCategory.REDUCED]: 7.0,
    [TaxCategory.ESSENTIAL_FOOD]: 7.0,
    [TaxCategory.LUXURY_GOODS]: 19.0,
    [TaxCategory.ELECTRONICS]: 19.0,
    [TaxCategory.CLOTHING]: 19.0,
    [TaxCategory.SERVICES]: 19.0,
    [TaxCategory.DIGITAL_GOODS]: 19.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 19.0,
    [TaxCategory.MEDICAL]: 7.0,
  },
};

/** France: 20% standard / 5.5% reduced */
export const FRANCE_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'FR',
  countryName: 'France',
  defaultRate: 20.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 20.0,
    [TaxCategory.REDUCED]: 5.5,
    [TaxCategory.ESSENTIAL_FOOD]: 5.5,
    [TaxCategory.LUXURY_GOODS]: 20.0,
    [TaxCategory.ELECTRONICS]: 20.0,
    [TaxCategory.CLOTHING]: 20.0,
    [TaxCategory.SERVICES]: 20.0,
    [TaxCategory.DIGITAL_GOODS]: 20.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 20.0,
    [TaxCategory.MEDICAL]: 5.5,
  },
};

/** Italy: 22% standard / 4% reduced */
export const ITALY_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'IT',
  countryName: 'Italy',
  defaultRate: 22.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 22.0,
    [TaxCategory.REDUCED]: 4.0,
    [TaxCategory.ESSENTIAL_FOOD]: 4.0,
    [TaxCategory.LUXURY_GOODS]: 22.0,
    [TaxCategory.ELECTRONICS]: 22.0,
    [TaxCategory.CLOTHING]: 22.0,
    [TaxCategory.SERVICES]: 22.0,
    [TaxCategory.DIGITAL_GOODS]: 22.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 22.0,
    [TaxCategory.MEDICAL]: 4.0,
  },
};

/** Spain: 21% standard / 4% super-reduced */
export const SPAIN_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'ES',
  countryName: 'Spain',
  defaultRate: 21.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 21.0,
    [TaxCategory.REDUCED]: 4.0,
    [TaxCategory.ESSENTIAL_FOOD]: 4.0,
    [TaxCategory.LUXURY_GOODS]: 21.0,
    [TaxCategory.ELECTRONICS]: 21.0,
    [TaxCategory.CLOTHING]: 21.0,
    [TaxCategory.SERVICES]: 21.0,
    [TaxCategory.DIGITAL_GOODS]: 21.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 21.0,
    [TaxCategory.MEDICAL]: 4.0,
  },
};

/** Netherlands: 21% standard / 9% reduced */
export const NETHERLANDS_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'NL',
  countryName: 'Netherlands',
  defaultRate: 21.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 21.0,
    [TaxCategory.REDUCED]: 9.0,
    [TaxCategory.ESSENTIAL_FOOD]: 9.0,
    [TaxCategory.LUXURY_GOODS]: 21.0,
    [TaxCategory.ELECTRONICS]: 21.0,
    [TaxCategory.CLOTHING]: 21.0,
    [TaxCategory.SERVICES]: 21.0,
    [TaxCategory.DIGITAL_GOODS]: 21.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 21.0,
    [TaxCategory.MEDICAL]: 9.0,
  },
};

/** Belgium: 21% standard / 6% reduced */
export const BELGIUM_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'BE',
  countryName: 'Belgium',
  defaultRate: 21.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 21.0,
    [TaxCategory.REDUCED]: 6.0,
    [TaxCategory.ESSENTIAL_FOOD]: 6.0,
    [TaxCategory.LUXURY_GOODS]: 21.0,
    [TaxCategory.ELECTRONICS]: 21.0,
    [TaxCategory.CLOTHING]: 21.0,
    [TaxCategory.SERVICES]: 21.0,
    [TaxCategory.DIGITAL_GOODS]: 21.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 6.0,
    [TaxCategory.MEDICAL]: 6.0,
  },
};

/** Austria: 20% standard / 10% reduced */
export const AUSTRIA_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'AT',
  countryName: 'Austria',
  defaultRate: 20.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 20.0,
    [TaxCategory.REDUCED]: 10.0,
    [TaxCategory.ESSENTIAL_FOOD]: 10.0,
    [TaxCategory.LUXURY_GOODS]: 20.0,
    [TaxCategory.ELECTRONICS]: 20.0,
    [TaxCategory.CLOTHING]: 20.0,
    [TaxCategory.SERVICES]: 20.0,
    [TaxCategory.DIGITAL_GOODS]: 20.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 20.0,
    [TaxCategory.MEDICAL]: 10.0,
  },
};

/** Ireland: 23% standard / 13.5% reduced */
export const IRELAND_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'IE',
  countryName: 'Ireland',
  defaultRate: 23.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 23.0,
    [TaxCategory.REDUCED]: 13.5,
    [TaxCategory.ESSENTIAL_FOOD]: 0.0,
    [TaxCategory.LUXURY_GOODS]: 23.0,
    [TaxCategory.ELECTRONICS]: 23.0,
    [TaxCategory.CLOTHING]: 23.0,
    [TaxCategory.SERVICES]: 23.0,
    [TaxCategory.DIGITAL_GOODS]: 23.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 0.0,
    [TaxCategory.MEDICAL]: 0.0,
  },
};

/** Portugal: 23% standard / 6% reduced */
export const PORTUGAL_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'PT',
  countryName: 'Portugal',
  defaultRate: 23.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 23.0,
    [TaxCategory.REDUCED]: 6.0,
    [TaxCategory.ESSENTIAL_FOOD]: 6.0,
    [TaxCategory.LUXURY_GOODS]: 23.0,
    [TaxCategory.ELECTRONICS]: 23.0,
    [TaxCategory.CLOTHING]: 23.0,
    [TaxCategory.SERVICES]: 23.0,
    [TaxCategory.DIGITAL_GOODS]: 23.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 23.0,
    [TaxCategory.MEDICAL]: 6.0,
  },
};

/** Poland: 23% standard / 5% reduced */
export const POLAND_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'PL',
  countryName: 'Poland',
  defaultRate: 23.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 23.0,
    [TaxCategory.REDUCED]: 5.0,
    [TaxCategory.ESSENTIAL_FOOD]: 5.0,
    [TaxCategory.LUXURY_GOODS]: 23.0,
    [TaxCategory.ELECTRONICS]: 23.0,
    [TaxCategory.CLOTHING]: 23.0,
    [TaxCategory.SERVICES]: 23.0,
    [TaxCategory.DIGITAL_GOODS]: 23.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 5.0,
    [TaxCategory.MEDICAL]: 5.0,
  },
};

/** Sweden: 25% standard / 6% reduced */
export const SWEDEN_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'SE',
  countryName: 'Sweden',
  defaultRate: 25.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 25.0,
    [TaxCategory.REDUCED]: 6.0,
    [TaxCategory.ESSENTIAL_FOOD]: 12.0,
    [TaxCategory.LUXURY_GOODS]: 25.0,
    [TaxCategory.ELECTRONICS]: 25.0,
    [TaxCategory.CLOTHING]: 25.0,
    [TaxCategory.SERVICES]: 25.0,
    [TaxCategory.DIGITAL_GOODS]: 25.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 25.0,
    [TaxCategory.MEDICAL]: 0.0,
  },
};

// ─── United Kingdom ─────────────────────────────────────────────────────────────
/**
 * UK Tax Configuration
 * - Standard rate: 20%
 * - Reduced rate: 5% (domestic fuel, children's car seats)
 * - Zero-rated: 0% (food, children's clothing, books)
 */
export const UK_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'GB',
  countryName: 'United Kingdom',
  defaultRate: 20.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 20.0,
    [TaxCategory.REDUCED]: 5.0,
    [TaxCategory.ESSENTIAL_FOOD]: 0.0,
    [TaxCategory.LUXURY_GOODS]: 20.0,
    [TaxCategory.ELECTRONICS]: 20.0,
    [TaxCategory.CLOTHING]: 20.0,
    [TaxCategory.SERVICES]: 20.0,
    [TaxCategory.DIGITAL_GOODS]: 20.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 0.0,
    [TaxCategory.MEDICAL]: 0.0,
  },
};

// ─── Australia ───────────────────────────────────────────────────────────────────
/** Australia: 10% GST. Basic food and medical are GST-free. */
export const AUSTRALIA_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'AU',
  countryName: 'Australia',
  defaultRate: 10.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 10.0,
    [TaxCategory.REDUCED]: 0.0,
    [TaxCategory.ESSENTIAL_FOOD]: 0.0,
    [TaxCategory.LUXURY_GOODS]: 10.0,
    [TaxCategory.ELECTRONICS]: 10.0,
    [TaxCategory.CLOTHING]: 10.0,
    [TaxCategory.SERVICES]: 10.0,
    [TaxCategory.DIGITAL_GOODS]: 10.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 10.0,
    [TaxCategory.MEDICAL]: 0.0,
  },
};

// ─── India ───────────────────────────────────────────────────────────────────────
/**
 * India GST: Slabs 5%/12%/18%/28%. Simplified to 18% standard.
 */
export const INDIA_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'IN',
  countryName: 'India',
  defaultRate: 18.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 18.0,
    [TaxCategory.REDUCED]: 5.0,
    [TaxCategory.ESSENTIAL_FOOD]: 0.0,
    [TaxCategory.LUXURY_GOODS]: 28.0,
    [TaxCategory.ELECTRONICS]: 18.0,
    [TaxCategory.CLOTHING]: 5.0,
    [TaxCategory.SERVICES]: 18.0,
    [TaxCategory.DIGITAL_GOODS]: 18.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 5.0,
    [TaxCategory.MEDICAL]: 5.0,
  },
};

// ─── Brazil ──────────────────────────────────────────────────────────────────────
/** Brazil ICMS: varies by state, national average ~18% */
export const BRAZIL_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'BR',
  countryName: 'Brazil',
  defaultRate: 18.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 18.0,
    [TaxCategory.REDUCED]: 7.0,
    [TaxCategory.ESSENTIAL_FOOD]: 7.0,
    [TaxCategory.LUXURY_GOODS]: 25.0,
    [TaxCategory.ELECTRONICS]: 18.0,
    [TaxCategory.CLOTHING]: 18.0,
    [TaxCategory.SERVICES]: 18.0,
    [TaxCategory.DIGITAL_GOODS]: 18.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 18.0,
    [TaxCategory.MEDICAL]: 0.0,
  },
};

// ─── Singapore ───────────────────────────────────────────────────────────────────
/** Singapore: 9% GST (raised from 8% in 2024) */
export const SINGAPORE_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'SG',
  countryName: 'Singapore',
  defaultRate: 9.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 9.0,
    [TaxCategory.REDUCED]: 9.0,
    [TaxCategory.ESSENTIAL_FOOD]: 9.0,
    [TaxCategory.LUXURY_GOODS]: 9.0,
    [TaxCategory.ELECTRONICS]: 9.0,
    [TaxCategory.CLOTHING]: 9.0,
    [TaxCategory.SERVICES]: 9.0,
    [TaxCategory.DIGITAL_GOODS]: 9.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 9.0,
    [TaxCategory.MEDICAL]: 0.0,
  },
};

// ─── South Korea ─────────────────────────────────────────────────────────────────
/** South Korea: 10% VAT flat rate */
export const SOUTH_KOREA_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'KR',
  countryName: 'South Korea',
  defaultRate: 10.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 10.0,
    [TaxCategory.REDUCED]: 0.0,
    [TaxCategory.ESSENTIAL_FOOD]: 0.0,
    [TaxCategory.LUXURY_GOODS]: 10.0,
    [TaxCategory.ELECTRONICS]: 10.0,
    [TaxCategory.CLOTHING]: 10.0,
    [TaxCategory.SERVICES]: 10.0,
    [TaxCategory.DIGITAL_GOODS]: 10.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 10.0,
    [TaxCategory.MEDICAL]: 0.0,
  },
};

// ─── Mexico ──────────────────────────────────────────────────────────────────────
/** Mexico: 16% IVA. Food and medicine are 0%. */
export const MEXICO_TAX_CONFIG: CountryTaxConfig = {
  countryCode: 'MX',
  countryName: 'Mexico',
  defaultRate: 16.0,
  categoryRates: {
    [TaxCategory.STANDARD]: 16.0,
    [TaxCategory.REDUCED]: 0.0,
    [TaxCategory.ESSENTIAL_FOOD]: 0.0,
    [TaxCategory.LUXURY_GOODS]: 16.0,
    [TaxCategory.ELECTRONICS]: 16.0,
    [TaxCategory.CLOTHING]: 16.0,
    [TaxCategory.SERVICES]: 16.0,
    [TaxCategory.DIGITAL_GOODS]: 16.0,
    [TaxCategory.CHILDRENS_CLOTHING]: 16.0,
    [TaxCategory.MEDICAL]: 0.0,
  },
};

// ─── Registry ────────────────────────────────────────────────────────────────────

/**
 * Master tax configuration registry
 */
export const TAX_CONFIG_REGISTRY: Record<string, CountryTaxConfig> = {
  // Original countries
  JP: JAPAN_TAX_CONFIG,
  BD: BANGLADESH_TAX_CONFIG,
  CA: CANADA_TAX_CONFIG,

  // United States
  US: US_TAX_CONFIG,

  // EU countries
  DE: GERMANY_TAX_CONFIG,
  FR: FRANCE_TAX_CONFIG,
  IT: ITALY_TAX_CONFIG,
  ES: SPAIN_TAX_CONFIG,
  NL: NETHERLANDS_TAX_CONFIG,
  BE: BELGIUM_TAX_CONFIG,
  AT: AUSTRIA_TAX_CONFIG,
  IE: IRELAND_TAX_CONFIG,
  PT: PORTUGAL_TAX_CONFIG,
  PL: POLAND_TAX_CONFIG,
  SE: SWEDEN_TAX_CONFIG,

  // United Kingdom
  GB: UK_TAX_CONFIG,

  // Asia-Pacific
  AU: AUSTRALIA_TAX_CONFIG,
  IN: INDIA_TAX_CONFIG,
  SG: SINGAPORE_TAX_CONFIG,
  KR: SOUTH_KOREA_TAX_CONFIG,

  // Americas
  BR: BRAZIL_TAX_CONFIG,
  MX: MEXICO_TAX_CONFIG,
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

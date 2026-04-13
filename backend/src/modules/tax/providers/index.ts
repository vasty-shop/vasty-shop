/**
 * Tax provider factory.
 *
 * Reads TAX_PROVIDER from config and returns the matching provider.
 * Unknown values fall back to 'manual-rules' with a warning (NOT
 * 'none' like the other adapters) because tax is a hot-path checkout
 * operation where falling back to silent zero would hide broken
 * config. Manual-rules is the safest non-zero fallback — it uses
 * the existing hardcoded rates and doesn't call any external API.
 *
 * Shipped in this PR:
 *   manual-rules  — default, zero infra
 *   stripe-tax    — production default if already on Stripe
 *   taxjar        — US sales tax compliance
 *   none          — returns zero tax (doesn't throw)
 *
 * Planned (follow-up PRs):
 *   avalara       — enterprise global tax
 */
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { TaxProvider } from './tax-provider.interface';
import { ManualRulesTaxProvider } from './manual-rules.provider';
import { StripeTaxProvider } from './stripe-tax.provider';
import { TaxJarProvider } from './taxjar.provider';
import { NoneTaxProvider } from './none.provider';

const log = new Logger('TaxProviderFactory');

export function createTaxProvider(config: ConfigService): TaxProvider {
  const choice = (config.get<string>('TAX_PROVIDER') || 'manual-rules')
    .toLowerCase()
    .trim();

  switch (choice) {
    case 'manual-rules':
    case 'manual':
    case 'rules': {
      const p = new ManualRulesTaxProvider();
      log.log(
        `Selected tax provider: manual-rules (available=${p.isAvailable()})`,
      );
      return p;
    }
    case 'stripe-tax':
    case 'stripe': {
      const p = new StripeTaxProvider(config);
      log.log(
        `Selected tax provider: stripe-tax (available=${p.isAvailable()})`,
      );
      return p;
    }
    case 'taxjar': {
      const p = new TaxJarProvider(config);
      log.log(`Selected tax provider: taxjar (available=${p.isAvailable()})`);
      return p;
    }
    case 'avalara':
    case 'avatax': {
      log.warn(
        'TAX_PROVIDER="avalara" is planned but not yet implemented (see issue #23). Falling back to "manual-rules". Implemented providers: manual-rules, stripe-tax, taxjar, none.',
      );
      return new ManualRulesTaxProvider();
    }
    case 'none':
      return new NoneTaxProvider();
    default:
      log.warn(
        `Unknown TAX_PROVIDER="${choice}". Falling back to "manual-rules". Valid values: manual-rules, stripe-tax, taxjar, none.`,
      );
      return new ManualRulesTaxProvider();
  }
}

export * from './tax-provider.interface';
export { ManualRulesTaxProvider } from './manual-rules.provider';
export { StripeTaxProvider } from './stripe-tax.provider';
export { TaxJarProvider } from './taxjar.provider';
export { NoneTaxProvider } from './none.provider';

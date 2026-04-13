/**
 * Provider health service for vasty-shop.
 *
 * Reports the runtime status of each pluggable infrastructure concern
 * (storage, payments, ai, sms, email, push, search, shipping, tax, maps).
 * Consumed by `/api/v1/health/providers`, the setup wizard's "test
 * connection" step, and a future admin Integrations page.
 *
 * When an adapter PR lands, flip its `planned()` entry to a real factory
 * call. See the `storage` concern below for the pattern — its factory
 * (`createStorageProvider`) lives on the `feat/storage-adapter` branch
 * (PR #26). A 2-line follow-up will import it once that PR merges.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type ProviderStatus = 'ready' | 'skipped' | 'error' | 'planned';

export interface ProviderHealth {
  concern: string;
  label: string;
  provider: string;
  envVar: string;
  status: ProviderStatus;
  details: string;
  adapterImplemented: boolean;
  issue?: number;
}

@Injectable()
export class ProvidersHealthService {
  private readonly logger = new Logger(ProvidersHealthService.name);

  constructor(private readonly config: ConfigService) {}

  getAll(): ProviderHealth[] {
    return [
      // Storage: real adapter lives in PR #26. Until that merges on main,
      // use the legacy heuristic.
      this.planned({
        concern: 'storage',
        label: 'File storage',
        envVar: 'STORAGE_PROVIDER',
        currentHardcoded: 'r2',
        requiredEnvVars: ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'],
        issue: 14,
      }),
      this.planned({
        concern: 'payments',
        label: 'Payments + marketplace splits',
        envVar: 'PAYMENT_PROVIDER',
        currentHardcoded: 'stripe',
        requiredEnvVars: ['STRIPE_SECRET_KEY'],
        issue: 18,
      }),
      this.planned({
        concern: 'ai',
        label: 'AI / LLM',
        envVar: 'AI_PROVIDER',
        currentHardcoded: 'openai',
        requiredEnvVars: ['OPENAI_API_KEY'],
        issue: 15,
      }),
      this.planned({
        concern: 'sms',
        label: 'SMS (OTP, order updates)',
        envVar: 'SMS_PROVIDER',
        currentHardcoded: 'none',
        requiredEnvVars: [],
        issue: 19,
      }),
      this.planned({
        concern: 'email',
        label: 'Email (transactional)',
        envVar: 'EMAIL_PROVIDER',
        currentHardcoded: 'smtp',
        requiredEnvVars: ['SMTP_HOST'],
        issue: 20,
      }),
      this.planned({
        concern: 'push',
        label: 'Push notifications',
        envVar: 'PUSH_PROVIDER',
        currentHardcoded: 'none',
        requiredEnvVars: [],
        issue: 21,
      }),
      this.planned({
        concern: 'search',
        label: 'Product search',
        envVar: 'SEARCH_PROVIDER',
        currentHardcoded: 'qdrant',
        requiredEnvVars: ['QDRANT_URL'],
        issue: 22,
      }),
      this.planned({
        concern: 'shipping',
        label: 'Shipping & logistics',
        envVar: 'SHIPPING_PROVIDER',
        currentHardcoded: 'manual-zones',
        requiredEnvVars: [],
        issue: 16,
      }),
      this.planned({
        concern: 'tax',
        label: 'Tax calculation',
        envVar: 'TAX_PROVIDER',
        currentHardcoded: 'manual-rules',
        requiredEnvVars: [],
        issue: 23,
      }),
      this.planned({
        concern: 'maps',
        label: 'Maps (delivery zones)',
        envVar: 'MAPS_PROVIDER',
        currentHardcoded: 'google-maps',
        requiredEnvVars: [],
        issue: 17,
      }),
    ];
  }

  /**
   * Heuristic status resolver for concerns whose adapter pattern is still
   * planned. Reports 'planned' if the env vars for the current hardcoded
   * implementation look configured, and 'skipped' otherwise.
   */
  private planned(args: {
    concern: string;
    label: string;
    envVar: string;
    currentHardcoded: string;
    requiredEnvVars: string[];
    issue: number;
  }): ProviderHealth {
    const explicit = this.config.get<string>(args.envVar);
    const missing = args.requiredEnvVars.filter(
      (k) => !this.config.get<string>(k),
    );
    const selected = explicit || args.currentHardcoded;

    if (args.requiredEnvVars.length > 0 && missing.length > 0) {
      return {
        concern: args.concern,
        label: args.label,
        envVar: args.envVar,
        provider: selected,
        status: 'skipped',
        details: `adapter #${args.issue} not yet implemented; current stack needs ${missing.join(', ')}`,
        adapterImplemented: false,
        issue: args.issue,
      };
    }
    return {
      concern: args.concern,
      label: args.label,
      envVar: args.envVar,
      provider: selected,
      status: 'planned',
      details: `adapter #${args.issue} not yet implemented; current hardcoded stack (${args.currentHardcoded}) appears configured`,
      adapterImplemented: false,
      issue: args.issue,
    };
  }
}

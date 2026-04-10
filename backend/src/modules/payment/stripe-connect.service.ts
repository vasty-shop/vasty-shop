import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { DatabaseService } from '../database/database.service';
import { EntityType } from '../../database/schema';

export interface ConnectAccountStatus {
  accountId: string | null;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: Stripe.Account.Requirements | null;
  currentDeadline: number | null;
}

export interface CreateConnectAccountDto {
  businessName?: string;
  email?: string;
  country: string;
}

export interface VendorPayoutRecord {
  shopId: string;
  orderId?: string;
  amount: number;
  platformFee: number;
  currency: string;
  stripeTransferId?: string;
  stripePayoutId?: string;
  stripeBalanceTransactionId?: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';
  estimatedArrival?: string;
  paidAt?: string;
  failureCode?: string;
  failureMessage?: string;
  metadata?: Record<string, any>;
  description?: string;
}

@Injectable()
export class StripeConnectService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeConnectService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
      });
      this.logger.log('Stripe Connect client initialized');
    } else {
      this.logger.warn('Stripe secret key not configured. Stripe Connect will be unavailable.');
    }
  }

  /**
   * Helper to get shop Stripe fields (handles both camelCase and snake_case)
   * Database may return snake_case but code expects camelCase
   */
  private getShopStripeFields(shop: any): {
    stripeAccountId: string | null;
    stripeChargesEnabled: boolean;
    stripePayoutsEnabled: boolean;
    stripeConnectStatus: string | null;
  } {
    return {
      stripeAccountId: shop?.stripeAccountId || shop?.stripe_account_id || null,
      stripeChargesEnabled: shop?.stripeChargesEnabled ?? shop?.stripe_charges_enabled ?? false,
      stripePayoutsEnabled: shop?.stripePayoutsEnabled ?? shop?.stripe_payouts_enabled ?? false,
      stripeConnectStatus: shop?.stripeConnectStatus || shop?.stripe_connect_status || null,
    };
  }

  /**
   * Create a Stripe Connect Express account for a vendor/shop
   * @param shopId - The shop ID
   * @param dto - Account creation details
   * @param returnUrl - URL to redirect after onboarding (e.g., frontend URL)
   * @returns Onboarding URL and account ID
   */
  async createConnectAccount(
    shopId: string,
    dto: CreateConnectAccountDto,
    returnUrl: string,
  ): Promise<{ accountId: string; onboardingUrl: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    // Get the shop to verify it exists and check if it already has a connect account
    const shop = await this.db.getEntity(EntityType.SHOP, shopId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    // If shop already has a connected account, check its status
    if (shop.stripeAccountId) {
      try {
        const account = await this.stripe.accounts.retrieve(shop.stripeAccountId);

        // If account exists and onboarding is complete, return error
        if (account.details_submitted) {
          throw new BadRequestException('Shop already has a connected Stripe account');
        }

        // If onboarding is not complete, return a new onboarding link
        const accountLink = await this.stripe.accountLinks.create({
          account: shop.stripeAccountId,
          refresh_url: `${returnUrl}?refresh=true`,
          return_url: `${returnUrl}?success=true`,
          type: 'account_onboarding',
        });

        return {
          accountId: shop.stripeAccountId,
          onboardingUrl: accountLink.url,
        };
      } catch (error) {
        // If account retrieval fails, it might have been deleted - clear shop data and create a new one
        this.logger.warn(`Failed to retrieve existing account ${shop.stripeAccountId}: ${error.message}`);
        this.logger.log(`Clearing old Stripe data for shop ${shopId}`);

        // Clear old Stripe data from shop
        await this.db.updateEntity(EntityType.SHOP, shopId, {
          stripeAccountId: null,
          stripeConnectStatus: null,
          stripeChargesEnabled: false,
          stripePayoutsEnabled: false,
          stripeRequirements: {},
          stripeVerificationDeadline: null,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    try {
      // Create Express account
      // Platform is in Japan, so Connect accounts default to Japan
      const account = await this.stripe.accounts.create({
        type: 'express',
        country: dto.country || 'JP',
        email: dto.email || shop.businessEmail || undefined,
        business_profile: {
          name: dto.businessName || shop.businessName || shop.name,
          url: shop.storefrontPublished ? `https://${shop.slug}.vasty.shop` : undefined,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          shopId: shopId,
          shopName: shop.name,
          platform: 'vasty-shop',
        },
      });

      // Create account onboarding link
      const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${returnUrl}?refresh=true`,
        return_url: `${returnUrl}?success=true`,
        type: 'account_onboarding',
      });

      // Update shop with Stripe Connect details
      await this.db.updateEntity(EntityType.SHOP, shopId, {
        stripeAccountId: account.id,
        stripeConnectStatus: 'pending',
        stripeChargesEnabled: false,
        stripePayoutsEnabled: false,
        stripeRequirements: account.requirements || {},
        stripeVerificationDeadline: account.requirements?.current_deadline
          ? new Date(account.requirements.current_deadline * 1000).toISOString()
          : null,
        updatedAt: new Date().toISOString(),
      });

      this.logger.log(`Created Stripe Connect account ${account.id} for shop ${shopId}`);

      return {
        accountId: account.id,
        onboardingUrl: accountLink.url,
      };
    } catch (error) {
      this.logger.error(`Failed to create Connect account: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create Stripe Connect account: ${error.message}`);
    }
  }

  /**
   * Get onboarding link for an existing Connect account (for incomplete onboarding)
   * @param shopId - The shop ID
   * @param returnUrl - URL to redirect after onboarding
   * @returns Onboarding URL
   */
  async getOnboardingLink(shopId: string, returnUrl: string): Promise<{ onboardingUrl: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const shop = await this.db.getEntity(EntityType.SHOP, shopId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    if (!shop.stripeAccountId) {
      throw new BadRequestException('Shop does not have a Stripe Connect account. Please create one first.');
    }

    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: shop.stripeAccountId,
        refresh_url: `${returnUrl}?refresh=true`,
        return_url: `${returnUrl}?success=true`,
        type: 'account_onboarding',
      });

      return { onboardingUrl: accountLink.url };
    } catch (error) {
      this.logger.error(`Failed to get onboarding link: ${error.message}`);
      throw new BadRequestException(`Failed to get onboarding link: ${error.message}`);
    }
  }

  /**
   * Get the status of a shop's Connect account
   * @param shopId - The shop ID
   * @returns Account status details
   */
  async getAccountStatus(shopId: string): Promise<ConnectAccountStatus> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const shop = await this.db.getEntity(EntityType.SHOP, shopId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    if (!shop.stripeAccountId) {
      return {
        accountId: null,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        requirements: null,
        currentDeadline: null,
      };
    }

    try {
      const account = await this.stripe.accounts.retrieve(shop.stripeAccountId);

      // Update shop with latest status
      const connectStatus = this.determineConnectStatus(account);
      await this.db.updateEntity(EntityType.SHOP, shopId, {
        stripeConnectStatus: connectStatus,
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
        stripeRequirements: account.requirements || {},
        stripeVerificationDeadline: account.requirements?.current_deadline
          ? new Date(account.requirements.current_deadline * 1000).toISOString()
          : null,
        updatedAt: new Date().toISOString(),
      });

      return {
        accountId: account.id,
        onboardingComplete: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        requirements: account.requirements,
        currentDeadline: account.requirements?.current_deadline || null,
      };
    } catch (error) {
      this.logger.error(`Failed to get account status: ${error.message}`);
      throw new BadRequestException(`Failed to get account status: ${error.message}`);
    }
  }

  /**
   * Get Stripe Express Dashboard login link for a vendor
   * @param shopId - The shop ID
   * @returns Dashboard login URL
   */
  async getDashboardLink(shopId: string): Promise<{ url: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const shop = await this.db.getEntity(EntityType.SHOP, shopId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    if (!shop.stripeAccountId) {
      throw new BadRequestException('Shop does not have a Stripe Connect account');
    }

    try {
      const loginLink = await this.stripe.accounts.createLoginLink(shop.stripeAccountId);
      return { url: loginLink.url };
    } catch (error) {
      this.logger.error(`Failed to get dashboard link: ${error.message}`);
      throw new BadRequestException(`Failed to get dashboard link: ${error.message}`);
    }
  }

  /**
   * Disconnect/delete a Connect account from a shop
   * @param shopId - The shop ID
   */
  async disconnectAccount(shopId: string): Promise<{ success: boolean }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const shop = await this.db.getEntity(EntityType.SHOP, shopId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    // Try to delete the connected account if it exists
    if (shop.stripeAccountId) {
      try {
        await this.stripe.accounts.del(shop.stripeAccountId);
        this.logger.log(`Deleted Stripe account ${shop.stripeAccountId}`);
      } catch (error) {
        // Account might already be deleted, that's OK
        this.logger.warn(`Could not delete Stripe account (may already be deleted): ${error.message}`);
      }
    }

    // Always update shop to remove Stripe Connect details
    await this.db.updateEntity(EntityType.SHOP, shopId, {
      stripeAccountId: null,
      stripeConnectStatus: null,
      stripeChargesEnabled: false,
      stripePayoutsEnabled: false,
      stripeRequirements: {},
      stripeVerificationDeadline: null,
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Disconnected Stripe account for shop ${shopId}`);

    return { success: true };
  }

  /**
   * Create a payment intent with destination charge to vendor's connected account
   * This is used when a customer pays - the funds go to the vendor with a platform fee
   * @param amount - Payment amount in dollars
   * @param currency - Currency code
   * @param shopId - The shop ID (vendor receiving the payment)
   * @param orderId - The order ID
   * @param platformFeePercent - Platform fee percentage (default 10%)
   * @returns Payment intent with client secret
   */
  async createConnectedPaymentIntent(
    amount: number,
    currency: string,
    shopId: string,
    orderId: string,
    platformFeePercent: number = 1,
  ): Promise<{ clientSecret: string; paymentIntentId: string; platformFee: number; vendorAmount: number }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const shop = await this.db.getEntity(EntityType.SHOP, shopId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    if (!shop.stripeAccountId || !shop.stripeChargesEnabled) {
      throw new BadRequestException('Shop is not set up to receive payments via Stripe Connect');
    }

    const amountInCents = Math.round(amount * 100);
    const platformFee = Math.round(amountInCents * (platformFeePercent / 100));
    const vendorAmount = amountInCents - platformFee;

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        payment_method_types: ['card'],
        application_fee_amount: platformFee,
        transfer_data: {
          destination: shop.stripeAccountId,
        },
        metadata: {
          shopId,
          orderId,
          platform: 'vasty-shop',
          platformFee: platformFee.toString(),
          vendorAmount: vendorAmount.toString(),
        },
      });

      this.logger.log(`Created connected payment intent ${paymentIntent.id} for shop ${shopId}`);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        platformFee: platformFee / 100,
        vendorAmount: vendorAmount / 100,
      };
    } catch (error) {
      this.logger.error(`Failed to create connected payment intent: ${error.message}`);
      throw new BadRequestException(`Failed to create payment: ${error.message}`);
    }
  }

  /**
   * Create a Stripe Checkout Session with destination charge to vendor's connected account
   * This redirects the customer to Stripe's hosted checkout page (more reliable than embedded Elements)
   * @param amount - Payment amount in dollars
   * @param currency - Currency code
   * @param shopId - The shop ID (vendor receiving the payment)
   * @param orderId - The order ID
   * @param orderNumber - The order number for display
   * @param lineItems - Items being purchased (for display on checkout page)
   * @param successUrl - URL to redirect after successful payment
   * @param cancelUrl - URL to redirect if payment is cancelled
   * @param platformFeePercent - Platform fee percentage (default 1%)
   * @returns Checkout session URL and ID
   */
  async createConnectedCheckoutSession(
    amount: number,
    currency: string,
    shopId: string,
    orderId: string,
    orderNumber: string,
    lineItems: Array<{ name: string; quantity: number; price: number; image?: string }>,
    successUrl: string,
    cancelUrl: string,
    platformFeePercent: number = 1,
  ): Promise<{ checkoutUrl: string; sessionId: string; platformFee: number; vendorAmount: number }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const shop = await this.db.getEntity(EntityType.SHOP, shopId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    // Use helper to handle both camelCase and snake_case field names
    const { stripeAccountId, stripeChargesEnabled } = this.getShopStripeFields(shop);

    this.logger.log(`[createConnectedCheckoutSession] Shop ${shopId} Stripe fields:`, {
      stripeAccountId,
      stripeChargesEnabled,
    });

    if (!stripeAccountId || !stripeChargesEnabled) {
      throw new BadRequestException('Shop is not set up to receive payments via Stripe Connect');
    }

    // Zero-decimal currencies (like JPY) don't need multiplication by 100
    const isZeroDecimalCurrency = ['JPY', 'KRW', 'VND', 'BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'KMF', 'PYG', 'RWF', 'UGX', 'VUV', 'XAF', 'XOF', 'XPF'].includes(currency.toUpperCase());
    const multiplier = isZeroDecimalCurrency ? 1 : 100;

    const amountInSmallestUnit = Math.round(amount * multiplier);
    const platformFee = Math.round(amountInSmallestUnit * (platformFeePercent / 100));
    const vendorAmount = amountInSmallestUnit - platformFee;

    try {
      // Create line items for Stripe Checkout
      const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = lineItems.map(item => ({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: Math.round(item.price * multiplier),
        },
        quantity: item.quantity,
      }));

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: stripeLineItems,
        payment_intent_data: {
          application_fee_amount: platformFee,
          transfer_data: {
            destination: stripeAccountId,
          },
          metadata: {
            shopId,
            orderId,
            orderNumber,
            platform: 'vasty-shop',
            platformFee: platformFee.toString(),
            vendorAmount: vendorAmount.toString(),
          },
        },
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          shopId,
          orderId,
          orderNumber,
          platform: 'vasty-shop',
        },
      });

      this.logger.log(`Created Stripe Checkout Session ${session.id} for shop ${shopId}, order ${orderId}`);

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
        platformFee: platformFee / multiplier,
        vendorAmount: vendorAmount / multiplier,
      };
    } catch (error) {
      this.logger.error(`Failed to create checkout session: ${error.message}`);
      throw new BadRequestException(`Failed to create checkout session: ${error.message}`);
    }
  }

  /**
   * Verify a completed checkout session and retrieve payment details
   * @param sessionId - The Stripe checkout session ID
   * @returns Payment details
   */
  async verifyCheckoutSession(sessionId: string): Promise<{
    success: boolean;
    paymentIntentId: string | null;
    orderId: string | null;
    shopId: string | null;
    amountPaid: number;
    currency: string;
  }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      // Handle zero-decimal currencies correctly
      const currency = (session.currency || 'usd').toUpperCase();
      const isZeroDecimal = this.isZeroDecimalCurrency(currency);
      const amountPaid = isZeroDecimal
        ? (session.amount_total || 0)
        : (session.amount_total || 0) / 100;

      return {
        success: session.payment_status === 'paid',
        paymentIntentId: session.payment_intent as string || null,
        orderId: session.metadata?.orderId || null,
        shopId: session.metadata?.shopId || null,
        amountPaid,
        currency,
      };
    } catch (error) {
      this.logger.error(`Failed to verify checkout session: ${error.message}`);
      throw new BadRequestException(`Failed to verify checkout session: ${error.message}`);
    }
  }

  /**
   * Update payment intent metadata with order details
   * @param paymentIntentId - The Stripe payment intent ID
   * @param metadata - Additional metadata to add
   */
  async updatePaymentIntentMetadata(
    paymentIntentId: string,
    metadata: Record<string, string>,
  ): Promise<void> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      await this.stripe.paymentIntents.update(paymentIntentId, {
        metadata,
      });
      this.logger.log(`Updated payment intent ${paymentIntentId} with metadata`);
    } catch (error) {
      this.logger.error(`Failed to update payment intent metadata: ${error.message}`);
      throw new BadRequestException(`Failed to update payment: ${error.message}`);
    }
  }

  /**
   * Get vendor payout/transfer history
   * @param shopId - The shop ID
   * @param limit - Number of records to return
   * @returns List of payouts
   */
  async getPayoutHistory(shopId: string, limit: number = 50): Promise<any[]> {
    const shop = await this.db.getEntity(EntityType.SHOP, shopId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    try {
      const result = await this.db.queryEntities('vendor_payouts', {
        filters: { shopId },
        sort: { createdAt: 'DESC' },
        limit,
      });

      return result.data || [];
    } catch (error) {
      this.logger.error(`Failed to get payout history: ${error.message}`);
      return [];
    }
  }

  /**
   * Record a vendor payout in the database
   * @param data - Payout data
   * @returns Created payout record
   */
  async recordPayout(data: VendorPayoutRecord): Promise<any> {
    try {
      return await this.db.createEntity('vendor_payouts', {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Failed to record payout: ${error.message}`);
      throw new BadRequestException(`Failed to record payout: ${error.message}`);
    }
  }

  /**
   * Check if a currency is a zero-decimal currency (no cents/subunits)
   * @param currency - Currency code
   * @returns True if zero-decimal currency
   */
  private isZeroDecimalCurrency(currency: string): boolean {
    const zeroDecimalCurrencies = [
      'JPY', 'KRW', 'VND', 'BIF', 'CLP', 'DJF', 'GNF', 'ISK',
      'KMF', 'PYG', 'RWF', 'UGX', 'VUV', 'XAF', 'XOF', 'XPF'
    ];
    return zeroDecimalCurrencies.includes(currency.toUpperCase());
  }

  /**
   * Get vendor balance (funds available in their connected account)
   * @param shopId - The shop ID
   * @returns Balance details with all currency balances
   */
  async getVendorBalance(shopId: string): Promise<{ available: number; pending: number; currency: string; allBalances?: any[] }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const shop = await this.db.getEntity(EntityType.SHOP, shopId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    // Use helper to handle both camelCase and snake_case field names
    const { stripeAccountId } = this.getShopStripeFields(shop);

    if (!stripeAccountId) {
      throw new BadRequestException('Shop does not have a Stripe Connect account');
    }

    try {
      const balance = await this.stripe.balance.retrieve({
        stripeAccount: stripeAccountId,
      });

      this.logger.log(`[getVendorBalance] Raw balance for shop ${shopId}:`, JSON.stringify(balance, null, 2));

      // Get all available balances (combine all currencies)
      let totalAvailable = 0;
      let totalPending = 0;
      let primaryCurrency = 'USD';
      const allBalances: any[] = [];

      // Process available balances
      if (balance.available && balance.available.length > 0) {
        for (const bal of balance.available) {
          const currency = bal.currency.toUpperCase();
          const isZeroDecimal = this.isZeroDecimalCurrency(currency);
          const amount = isZeroDecimal ? bal.amount : bal.amount / 100;

          allBalances.push({
            type: 'available',
            currency,
            amount,
            raw: bal.amount,
          });

          // Use the first currency as primary, or prefer JPY if present (platform currency)
          if (currency === 'JPY' || (primaryCurrency === 'USD' && balance.available.indexOf(bal) === 0)) {
            primaryCurrency = currency;
          }
        }
      }

      // Process pending balances
      if (balance.pending && balance.pending.length > 0) {
        for (const bal of balance.pending) {
          const currency = bal.currency.toUpperCase();
          const isZeroDecimal = this.isZeroDecimalCurrency(currency);
          const amount = isZeroDecimal ? bal.amount : bal.amount / 100;

          allBalances.push({
            type: 'pending',
            currency,
            amount,
            raw: bal.amount,
          });
        }
      }

      // Calculate totals for primary currency
      const availableInPrimary = allBalances
        .filter(b => b.type === 'available' && b.currency === primaryCurrency)
        .reduce((sum, b) => sum + b.amount, 0);

      const pendingInPrimary = allBalances
        .filter(b => b.type === 'pending' && b.currency === primaryCurrency)
        .reduce((sum, b) => sum + b.amount, 0);

      // If no balance in primary currency, sum all available balances
      totalAvailable = availableInPrimary || allBalances
        .filter(b => b.type === 'available')
        .reduce((sum, b) => sum + b.amount, 0);

      totalPending = pendingInPrimary || allBalances
        .filter(b => b.type === 'pending')
        .reduce((sum, b) => sum + b.amount, 0);

      this.logger.log(`[getVendorBalance] Processed balance - available: ${totalAvailable}, pending: ${totalPending}, currency: ${primaryCurrency}`);

      return {
        available: totalAvailable,
        pending: totalPending,
        currency: primaryCurrency,
        allBalances,
      };
    } catch (error) {
      this.logger.error(`Failed to get vendor balance: ${error.message}`);
      throw new BadRequestException(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Get recent transfers to a vendor's connected account
   * @param shopId - The shop ID
   * @param limit - Number of records to return
   * @returns List of transfers
   */
  async getVendorTransfers(shopId: string, limit: number = 20): Promise<any[]> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const shop = await this.db.getEntity(EntityType.SHOP, shopId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    // Use helper to handle both camelCase and snake_case field names
    const { stripeAccountId } = this.getShopStripeFields(shop);

    if (!stripeAccountId) {
      return [];
    }

    try {
      const transfers = await this.stripe.transfers.list({
        destination: stripeAccountId,
        limit,
      });

      this.logger.log(`[getVendorTransfers] Found ${transfers.data.length} transfers for shop ${shopId}`);

      return transfers.data.map(transfer => {
        const currency = transfer.currency.toUpperCase();
        const isZeroDecimal = this.isZeroDecimalCurrency(currency);
        const amount = isZeroDecimal ? transfer.amount : transfer.amount / 100;

        return {
          id: transfer.id,
          amount,
          currency,
          created: new Date(transfer.created * 1000).toISOString(),
          description: transfer.description,
          metadata: transfer.metadata,
          reversed: transfer.reversed,
          balanceTransaction: transfer.balance_transaction,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to get vendor transfers: ${error.message}`);
      return [];
    }
  }

  /**
   * Handle Stripe Connect webhook events
   * @param event - Stripe event object
   */
  async handleConnectWebhook(event: Stripe.Event): Promise<void> {
    this.logger.log(`Handling Connect webhook: ${event.type}`);

    switch (event.type) {
      case 'account.updated':
        await this.handleAccountUpdated(event.data.object as Stripe.Account);
        break;
      case 'account.application.authorized':
        this.logger.log('Account authorized');
        break;
      case 'account.application.deauthorized':
        // For deauthorized events, we need to look up the shop by account ID
        const deauthApp = event.data.object as Stripe.Application;
        this.logger.log(`Account deauthorized: ${deauthApp.id}`);
        break;
      case 'transfer.created':
        await this.handleTransferCreated(event.data.object as Stripe.Transfer);
        break;
      case 'transfer.reversed':
        await this.handleTransferFailed(event.data.object as Stripe.Transfer);
        break;
      case 'payout.created':
      case 'payout.paid':
      case 'payout.failed':
        await this.handlePayoutEvent(event.type, event.data.object as Stripe.Payout);
        break;
      default:
        this.logger.log(`Unhandled Connect event: ${event.type}`);
    }
  }

  // Private helper methods

  private determineConnectStatus(account: Stripe.Account): string {
    if (!account.details_submitted) {
      return 'pending';
    }
    if (account.charges_enabled && account.payouts_enabled) {
      return 'connected';
    }
    if (account.requirements?.disabled_reason) {
      return 'rejected';
    }
    if (account.requirements?.currently_due?.length > 0) {
      return 'verification_required';
    }
    return 'restricted';
  }

  private async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    const shopId = account.metadata?.shopId;
    if (!shopId) {
      this.logger.warn(`Account ${account.id} has no shopId in metadata`);
      return;
    }

    try {
      const connectStatus = this.determineConnectStatus(account);

      await this.db.updateEntity(EntityType.SHOP, shopId, {
        stripeConnectStatus: connectStatus,
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
        stripeRequirements: account.requirements || {},
        stripeVerificationDeadline: account.requirements?.current_deadline
          ? new Date(account.requirements.current_deadline * 1000).toISOString()
          : null,
        updatedAt: new Date().toISOString(),
      });

      this.logger.log(`Updated account status for shop ${shopId}: ${connectStatus}`);
    } catch (error) {
      this.logger.error(`Failed to handle account update: ${error.message}`);
    }
  }

  private async handleAccountDeauthorized(account: Stripe.Account): Promise<void> {
    const shopId = account.metadata?.shopId;
    if (!shopId) {
      this.logger.warn(`Deauthorized account has no shopId in metadata`);
      return;
    }

    try {
      await this.db.updateEntity(EntityType.SHOP, shopId, {
        stripeAccountId: null,
        stripeConnectStatus: null,
        stripeChargesEnabled: false,
        stripePayoutsEnabled: false,
        stripeRequirements: {},
        stripeVerificationDeadline: null,
        updatedAt: new Date().toISOString(),
      });

      this.logger.log(`Account deauthorized for shop ${shopId}`);
    } catch (error) {
      this.logger.error(`Failed to handle account deauthorization: ${error.message}`);
    }
  }

  private async handleTransferCreated(transfer: Stripe.Transfer): Promise<void> {
    const shopId = transfer.metadata?.shopId;
    const orderId = transfer.metadata?.orderId;

    if (!shopId) {
      this.logger.warn(`Transfer ${transfer.id} has no shopId in metadata`);
      return;
    }

    try {
      // Handle zero-decimal currencies correctly
      const currency = transfer.currency.toUpperCase();
      const isZeroDecimal = this.isZeroDecimalCurrency(currency);
      const amount = isZeroDecimal ? transfer.amount : transfer.amount / 100;

      await this.recordPayout({
        shopId,
        orderId,
        amount,
        platformFee: 0, // Platform fee is in the payment intent
        currency,
        stripeTransferId: transfer.id,
        stripeBalanceTransactionId: transfer.balance_transaction as string,
        status: 'processing',
        metadata: transfer.metadata,
        description: transfer.description || 'Payment transfer',
      });

      this.logger.log(`Recorded transfer ${transfer.id} for shop ${shopId}, amount: ${amount} ${currency}`);
    } catch (error) {
      this.logger.error(`Failed to record transfer: ${error.message}`);
    }
  }

  private async handleTransferPaid(transfer: Stripe.Transfer): Promise<void> {
    try {
      const payouts = await this.db.queryEntities('vendor_payouts', {
        filters: { stripeTransferId: transfer.id },
      });

      if (payouts.data && payouts.data.length > 0) {
        await this.db.updateEntity('vendor_payouts', payouts.data[0].id, {
          status: 'paid',
          paidAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error(`Failed to update transfer status: ${error.message}`);
    }
  }

  private async handleTransferFailed(transfer: Stripe.Transfer): Promise<void> {
    try {
      const payouts = await this.db.queryEntities('vendor_payouts', {
        filters: { stripeTransferId: transfer.id },
      });

      if (payouts.data && payouts.data.length > 0) {
        await this.db.updateEntity('vendor_payouts', payouts.data[0].id, {
          status: 'failed',
          failureMessage: 'Transfer failed',
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error(`Failed to update failed transfer: ${error.message}`);
    }
  }

  private async handlePayoutEvent(eventType: string, payout: Stripe.Payout): Promise<void> {
    // Payouts are from Stripe to vendor's bank account
    // We can track these if needed but they're handled by Stripe automatically
    this.logger.log(`Payout event ${eventType}: ${payout.id}`);
  }

  // ============================================
  // DELIVERY MAN STRIPE CONNECT METHODS
  // ============================================
  // Note: Uses settings.stripe JSONB field instead of dedicated columns
  // to avoid database migration requirements

  /**
   * Helper to get Stripe data from delivery man's settings field
   */
  private getDeliveryManStripeData(deliveryMan: any): {
    accountId: string | null;
    connectStatus: string | null;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    requirements: any;
    verificationDeadline: string | null;
  } {
    const settings = deliveryMan.settings || {};
    const stripe = settings.stripe || {};
    return {
      accountId: stripe.accountId || null,
      connectStatus: stripe.connectStatus || null,
      chargesEnabled: stripe.chargesEnabled || false,
      payoutsEnabled: stripe.payoutsEnabled || false,
      requirements: stripe.requirements || null,
      verificationDeadline: stripe.verificationDeadline || null,
    };
  }

  /**
   * Helper to update Stripe data in delivery man's settings field
   */
  private async updateDeliveryManStripeData(
    deliveryManId: string,
    deliveryMan: any,
    stripeData: {
      accountId?: string | null;
      connectStatus?: string | null;
      chargesEnabled?: boolean;
      payoutsEnabled?: boolean;
      requirements?: any;
      verificationDeadline?: string | null;
    },
  ): Promise<void> {
    const currentSettings = deliveryMan.settings || {};
    const currentStripe = currentSettings.stripe || {};

    const updatedSettings = {
      ...currentSettings,
      stripe: {
        ...currentStripe,
        ...stripeData,
      },
    };

    await this.db.updateEntity('delivery_men', deliveryManId, {
      settings: updatedSettings,
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Create a Stripe Connect Express account for a delivery man
   * @param deliveryManId - The delivery man ID
   * @param dto - Account creation details
   * @param returnUrl - URL to redirect after onboarding
   * @returns Onboarding URL and account ID
   */
  async createDeliveryManConnectAccount(
    deliveryManId: string,
    dto: CreateConnectAccountDto,
    returnUrl: string,
  ): Promise<{ accountId: string; onboardingUrl: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const deliveryMan = await this.db.getEntity('delivery_men', deliveryManId);
    if (!deliveryMan) {
      throw new NotFoundException('Delivery man not found');
    }

    // Get Stripe data from settings
    const stripeData = this.getDeliveryManStripeData(deliveryMan);

    // If already has a connected account, check its status
    if (stripeData.accountId) {
      try {
        const account = await this.stripe.accounts.retrieve(stripeData.accountId);

        if (account.details_submitted) {
          throw new BadRequestException('Delivery man already has a connected Stripe account');
        }

        // Return new onboarding link for incomplete setup
        const accountLink = await this.stripe.accountLinks.create({
          account: stripeData.accountId,
          refresh_url: `${returnUrl}?refresh=true`,
          return_url: `${returnUrl}?success=true`,
          type: 'account_onboarding',
        });

        return {
          accountId: stripeData.accountId,
          onboardingUrl: accountLink.url,
        };
      } catch (error) {
        this.logger.warn(`Failed to retrieve existing account ${stripeData.accountId}: ${error.message}`);

        // Clear old Stripe data
        await this.updateDeliveryManStripeData(deliveryManId, deliveryMan, {
          accountId: null,
          connectStatus: null,
          chargesEnabled: false,
          payoutsEnabled: false,
          requirements: null,
          verificationDeadline: null,
        });
        // Refresh deliveryMan data
        deliveryMan.settings = { ...(deliveryMan.settings || {}), stripe: {} };
      }
    }

    try {
      // Create Express account for delivery man
      const account = await this.stripe.accounts.create({
        type: 'express',
        country: dto.country || 'US',
        email: dto.email || deliveryMan.email || undefined,
        business_profile: {
          name: dto.businessName || deliveryMan.name,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          deliveryManId: deliveryManId,
          deliveryManName: deliveryMan.name,
          platform: 'database-delivery',
          entityType: 'delivery_man',
        },
      });

      // Create onboarding link
      const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${returnUrl}?refresh=true`,
        return_url: `${returnUrl}?success=true`,
        type: 'account_onboarding',
      });

      // Update delivery man with Stripe Connect details in settings
      await this.updateDeliveryManStripeData(deliveryManId, deliveryMan, {
        accountId: account.id,
        connectStatus: 'pending',
        chargesEnabled: false,
        payoutsEnabled: false,
        requirements: account.requirements || {},
        verificationDeadline: account.requirements?.current_deadline
          ? new Date(account.requirements.current_deadline * 1000).toISOString()
          : null,
      });

      this.logger.log(`Created Stripe Connect account ${account.id} for delivery man ${deliveryManId}`);

      return {
        accountId: account.id,
        onboardingUrl: accountLink.url,
      };
    } catch (error) {
      this.logger.error(`Failed to create delivery man Connect account: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create Stripe Connect account: ${error.message}`);
    }
  }

  /**
   * Get onboarding link for a delivery man's existing Connect account
   * @param deliveryManId - The delivery man ID
   * @param returnUrl - URL to redirect after onboarding
   * @returns Onboarding URL
   */
  async getDeliveryManOnboardingLink(deliveryManId: string, returnUrl: string): Promise<{ onboardingUrl: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const deliveryMan = await this.db.getEntity('delivery_men', deliveryManId);
    if (!deliveryMan) {
      throw new NotFoundException('Delivery man not found');
    }

    const stripeData = this.getDeliveryManStripeData(deliveryMan);

    if (!stripeData.accountId) {
      throw new BadRequestException('Delivery man does not have a Stripe Connect account. Please create one first.');
    }

    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: stripeData.accountId,
        refresh_url: `${returnUrl}?refresh=true`,
        return_url: `${returnUrl}?success=true`,
        type: 'account_onboarding',
      });

      return { onboardingUrl: accountLink.url };
    } catch (error) {
      this.logger.error(`Failed to get delivery man onboarding link: ${error.message}`);
      throw new BadRequestException(`Failed to get onboarding link: ${error.message}`);
    }
  }

  /**
   * Get the status of a delivery man's Connect account
   * @param deliveryManId - The delivery man ID
   * @returns Account status details
   */
  async getDeliveryManAccountStatus(deliveryManId: string): Promise<ConnectAccountStatus> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const deliveryMan = await this.db.getEntity('delivery_men', deliveryManId);
    if (!deliveryMan) {
      throw new NotFoundException('Delivery man not found');
    }

    const stripeData = this.getDeliveryManStripeData(deliveryMan);

    if (!stripeData.accountId) {
      return {
        accountId: null,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        requirements: null,
        currentDeadline: null,
      };
    }

    try {
      const account = await this.stripe.accounts.retrieve(stripeData.accountId);

      // Update delivery man with latest status in settings
      const connectStatus = this.determineConnectStatus(account);
      await this.updateDeliveryManStripeData(deliveryManId, deliveryMan, {
        connectStatus,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirements: account.requirements || {},
        verificationDeadline: account.requirements?.current_deadline
          ? new Date(account.requirements.current_deadline * 1000).toISOString()
          : null,
      });

      return {
        accountId: account.id,
        onboardingComplete: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        requirements: account.requirements,
        currentDeadline: account.requirements?.current_deadline || null,
      };
    } catch (error) {
      this.logger.error(`Failed to get delivery man account status: ${error.message}`);
      throw new BadRequestException(`Failed to get account status: ${error.message}`);
    }
  }

  /**
   * Get Stripe Express Dashboard login link for a delivery man
   * @param deliveryManId - The delivery man ID
   * @returns Dashboard login URL
   */
  async getDeliveryManDashboardLink(deliveryManId: string): Promise<{ url: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const deliveryMan = await this.db.getEntity('delivery_men', deliveryManId);
    if (!deliveryMan) {
      throw new NotFoundException('Delivery man not found');
    }

    const stripeData = this.getDeliveryManStripeData(deliveryMan);

    if (!stripeData.accountId) {
      throw new BadRequestException('Delivery man does not have a Stripe Connect account');
    }

    try {
      const loginLink = await this.stripe.accounts.createLoginLink(stripeData.accountId);
      return { url: loginLink.url };
    } catch (error) {
      this.logger.error(`Failed to get delivery man dashboard link: ${error.message}`);
      throw new BadRequestException(`Failed to get dashboard link: ${error.message}`);
    }
  }

  /**
   * Disconnect/delete a Connect account from a delivery man
   * @param deliveryManId - The delivery man ID
   */
  async disconnectDeliveryManAccount(deliveryManId: string): Promise<{ success: boolean }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const deliveryMan = await this.db.getEntity('delivery_men', deliveryManId);
    if (!deliveryMan) {
      throw new NotFoundException('Delivery man not found');
    }

    const stripeData = this.getDeliveryManStripeData(deliveryMan);

    // Try to delete the connected account if it exists
    if (stripeData.accountId) {
      try {
        await this.stripe.accounts.del(stripeData.accountId);
        this.logger.log(`Deleted Stripe account ${stripeData.accountId}`);
      } catch (error) {
        this.logger.warn(`Could not delete Stripe account (may already be deleted): ${error.message}`);
      }
    }

    // Update delivery man to remove Stripe Connect details from settings
    await this.updateDeliveryManStripeData(deliveryManId, deliveryMan, {
      accountId: null,
      connectStatus: null,
      chargesEnabled: false,
      payoutsEnabled: false,
      requirements: null,
      verificationDeadline: null,
    });

    this.logger.log(`Disconnected Stripe account for delivery man ${deliveryManId}`);

    return { success: true };
  }

  /**
   * Get delivery man balance (funds available in their connected account)
   * @param deliveryManId - The delivery man ID
   * @returns Balance details
   */
  async getDeliveryManBalance(deliveryManId: string): Promise<{ available: number; pending: number; currency: string; allBalances?: any[] }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const deliveryMan = await this.db.getEntity('delivery_men', deliveryManId);
    if (!deliveryMan) {
      throw new NotFoundException('Delivery man not found');
    }

    const stripeData = this.getDeliveryManStripeData(deliveryMan);

    if (!stripeData.accountId) {
      throw new BadRequestException('Delivery man does not have a Stripe Connect account');
    }

    try {
      const balance = await this.stripe.balance.retrieve({
        stripeAccount: stripeData.accountId,
      });

      this.logger.log(`[getDeliveryManBalance] Raw balance for delivery man ${deliveryManId}:`, JSON.stringify(balance, null, 2));

      // Get all available balances (combine all currencies)
      let totalAvailable = 0;
      let totalPending = 0;
      let primaryCurrency = 'USD';
      const allBalances: any[] = [];

      // Process available balances
      if (balance.available && balance.available.length > 0) {
        for (const bal of balance.available) {
          const currency = bal.currency.toUpperCase();
          const isZeroDecimal = this.isZeroDecimalCurrency(currency);
          const amount = isZeroDecimal ? bal.amount : bal.amount / 100;

          allBalances.push({
            type: 'available',
            currency,
            amount,
            raw: bal.amount,
          });

          // Use the first currency as primary
          if (balance.available.indexOf(bal) === 0) {
            primaryCurrency = currency;
          }
        }
      }

      // Process pending balances
      if (balance.pending && balance.pending.length > 0) {
        for (const bal of balance.pending) {
          const currency = bal.currency.toUpperCase();
          const isZeroDecimal = this.isZeroDecimalCurrency(currency);
          const amount = isZeroDecimal ? bal.amount : bal.amount / 100;

          allBalances.push({
            type: 'pending',
            currency,
            amount,
            raw: bal.amount,
          });
        }
      }

      // Calculate totals for primary currency
      const availableInPrimary = allBalances
        .filter(b => b.type === 'available' && b.currency === primaryCurrency)
        .reduce((sum, b) => sum + b.amount, 0);

      const pendingInPrimary = allBalances
        .filter(b => b.type === 'pending' && b.currency === primaryCurrency)
        .reduce((sum, b) => sum + b.amount, 0);

      // If no balance in primary currency, sum all available balances
      totalAvailable = availableInPrimary || allBalances
        .filter(b => b.type === 'available')
        .reduce((sum, b) => sum + b.amount, 0);

      totalPending = pendingInPrimary || allBalances
        .filter(b => b.type === 'pending')
        .reduce((sum, b) => sum + b.amount, 0);

      this.logger.log(`[getDeliveryManBalance] Processed balance - available: ${totalAvailable}, pending: ${totalPending}, currency: ${primaryCurrency}`);

      return {
        available: totalAvailable,
        pending: totalPending,
        currency: primaryCurrency,
        allBalances,
      };
    } catch (error) {
      this.logger.error(`Failed to get delivery man balance: ${error.message}`);
      throw new BadRequestException(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Get recent transfers to a delivery man's connected account
   * @param deliveryManId - The delivery man ID
   * @param limit - Number of records to return
   * @returns List of transfers
   */
  async getDeliveryManTransfers(deliveryManId: string, limit: number = 20): Promise<any[]> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const deliveryMan = await this.db.getEntity('delivery_men', deliveryManId);
    if (!deliveryMan) {
      throw new NotFoundException('Delivery man not found');
    }

    const stripeData = this.getDeliveryManStripeData(deliveryMan);

    if (!stripeData.accountId) {
      return [];
    }

    try {
      const transfers = await this.stripe.transfers.list({
        destination: stripeData.accountId,
        limit,
      });

      this.logger.log(`[getDeliveryManTransfers] Found ${transfers.data.length} transfers for delivery man ${deliveryManId}`);

      return transfers.data.map(transfer => {
        const currency = transfer.currency.toUpperCase();
        const isZeroDecimal = this.isZeroDecimalCurrency(currency);
        const amount = isZeroDecimal ? transfer.amount : transfer.amount / 100;

        return {
          id: transfer.id,
          amount,
          currency,
          created: new Date(transfer.created * 1000).toISOString(),
          description: transfer.description,
          metadata: transfer.metadata,
          reversed: transfer.reversed,
          balanceTransaction: transfer.balance_transaction,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to get delivery man transfers: ${error.message}`);
      return [];
    }
  }

  /**
   * Initiate a payout/transfer to delivery man's connected account
   * This transfers funds from platform to delivery man's Stripe account
   * @param deliveryManId - The delivery man ID
   * @param amount - Amount to transfer in dollars
   * @param currency - Currency code (default: USD)
   * @param description - Transfer description
   * @returns Transfer details
   */
  async initiateDeliveryManPayout(
    deliveryManId: string,
    amount: number,
    currency: string = 'USD',
    description?: string,
  ): Promise<{ transferId: string; amount: number; status: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const deliveryMan = await this.db.getEntity('delivery_men', deliveryManId);
    if (!deliveryMan) {
      throw new NotFoundException('Delivery man not found');
    }

    const stripeData = this.getDeliveryManStripeData(deliveryMan);

    if (!stripeData.accountId) {
      throw new BadRequestException('Delivery man does not have a Stripe Connect account');
    }

    if (!stripeData.payoutsEnabled) {
      throw new BadRequestException('Delivery man account is not enabled for payouts. Please complete onboarding.');
    }

    const amountInCents = Math.round(amount * 100);

    try {
      const transfer = await this.stripe.transfers.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        destination: stripeData.accountId,
        description: description || `Earnings payout for ${deliveryMan.name}`,
        metadata: {
          deliveryManId,
          deliveryManName: deliveryMan.name,
          platform: 'database-delivery',
        },
      });

      this.logger.log(`Created transfer ${transfer.id} for delivery man ${deliveryManId}`);

      // Record the withdrawal in delivery_man_withdrawals
      try {
        await this.db.createEntity('delivery_man_withdrawals', {
          delivery_man_id: deliveryManId,
          amount,
          payment_method: 'stripe',
          payment_details: {
            stripeTransferId: transfer.id,
            stripeAccountId: stripeData.accountId,
          },
          status: 'completed',
          processed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      } catch (recordError) {
        this.logger.warn(`Failed to record withdrawal: ${recordError.message}`);
      }

      // Update delivery man's pending earnings
      const currentPending = Number(deliveryMan.pending_earnings) || 0;
      await this.db.updateEntity('delivery_men', deliveryManId, {
        pending_earnings: Math.max(0, currentPending - amount),
        withdrawn_earnings: (Number(deliveryMan.withdrawn_earnings) || 0) + amount,
        updated_at: new Date().toISOString(),
      });

      return {
        transferId: transfer.id,
        amount: transfer.amount / 100,
        status: 'completed',
      };
    } catch (error) {
      this.logger.error(`Failed to initiate delivery man payout: ${error.message}`);
      throw new BadRequestException(`Failed to initiate payout: ${error.message}`);
    }
  }

  /**
   * Get supported countries for Stripe Connect (applies to all entity types)
   * @returns List of supported countries
   */
  getSupportedCountries(): Array<{ code: string; name: string; flag: string }> {
    return [
      { code: 'US', name: 'United States', flag: '🇺🇸' },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦' },
      { code: 'AU', name: 'Australia', flag: '🇦🇺' },
      { code: 'JP', name: 'Japan', flag: '🇯🇵' },
      { code: 'DE', name: 'Germany', flag: '🇩🇪' },
      { code: 'FR', name: 'France', flag: '🇫🇷' },
      { code: 'IT', name: 'Italy', flag: '🇮🇹' },
      { code: 'ES', name: 'Spain', flag: '🇪🇸' },
      { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
      { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
      { code: 'AT', name: 'Austria', flag: '🇦🇹' },
      { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
      { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
      { code: 'NO', name: 'Norway', flag: '🇳🇴' },
      { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
      { code: 'FI', name: 'Finland', flag: '🇫🇮' },
      { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
      { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
      { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
      { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
      { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
      { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
      { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
      { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
      { code: 'IN', name: 'India', flag: '🇮🇳' },
      { code: 'PL', name: 'Poland', flag: '🇵🇱' },
      { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
      { code: 'GR', name: 'Greece', flag: '🇬🇷' },
      { code: 'RO', name: 'Romania', flag: '🇷🇴' },
    ];
  }
}

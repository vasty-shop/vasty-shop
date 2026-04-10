import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import Stripe from 'stripe';
import {
  DisbursementStatus,
  DisbursementMethod,
  DisbursementSchedule,
  SetupPaymentMethodDto,
  UpdatePaymentMethodDto,
  SetDisbursementSettingsDto,
  RequestDisbursementDto,
  ProcessDisbursementDto,
  GetDisbursementsDto,
  CreateStripeConnectAccountDto,
} from './dto/disbursement.dto';

@Injectable()
export class DisbursementService {
  private readonly logger = new Logger(DisbursementService.name);
  private stripe: Stripe;

  constructor(private readonly db: DatabaseService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  // ============================================
  // PAYMENT METHOD MANAGEMENT
  // ============================================

  /**
   * Get payment methods for shop
   */
  async getPaymentMethods(shopId: string): Promise<any[]> {
    const methods = await /* TODO: replace client call */ this.db.client.query
      .from('vendor_payment_methods')
      .select('*')
      .where('shop_id', shopId)
      .where('is_active', true)
      .orderBy('is_default', 'DESC')
      .get();

    return (methods || []).map(this.transformPaymentMethod);
  }

  /**
   * Setup payment method
   */
  async setupPaymentMethod(dto: SetupPaymentMethodDto): Promise<any> {
    let details: any = {};

    switch (dto.method) {
      case DisbursementMethod.BANK_TRANSFER:
        if (!dto.bankAccount) {
          throw new BadRequestException('Bank account details required');
        }
        details = {
          accountHolderName: dto.bankAccount.accountHolderName,
          bankName: dto.bankAccount.bankName,
          accountNumber: this.maskAccountNumber(dto.bankAccount.accountNumber),
          routingNumber: dto.bankAccount.routingNumber,
          swiftCode: dto.bankAccount.swiftCode,
          iban: dto.bankAccount.iban,
        };
        break;

      case DisbursementMethod.PAYPAL:
        if (!dto.paypalEmail) {
          throw new BadRequestException('PayPal email required');
        }
        details = { email: dto.paypalEmail };
        break;

      case DisbursementMethod.STRIPE_CONNECT:
        if (!dto.stripeAccountId) {
          throw new BadRequestException('Stripe account ID required');
        }
        details = { accountId: dto.stripeAccountId };
        break;

      case DisbursementMethod.WALLET:
        details = { type: 'internal_wallet' };
        break;
    }

    // If setting as default, unset current default
    if (dto.isDefault !== false) {
      await /* TODO: replace client call */ this.db.client.query
        .from('vendor_payment_methods')
        .where('shop_id', dto.shopId)
        .where('is_default', true)
        .update({ is_default: false })
        .execute();
    }

    const result = await /* TODO: replace client call */ this.db.client.query
      .from('vendor_payment_methods')
      .insert({
        shop_id: dto.shopId,
        method: dto.method,
        details: JSON.stringify(details),
        is_default: dto.isDefault !== false,
        is_active: true,
        is_verified: dto.method === DisbursementMethod.WALLET,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformPaymentMethod(result[0]);
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(methodId: string, dto: UpdatePaymentMethodDto): Promise<any> {
    const methods = await /* TODO: replace client call */ this.db.client.query
      .from('vendor_payment_methods')
      .select('*')
      .where('id', methodId)
      .get();

    if (!methods || methods.length === 0) {
      throw new NotFoundException('Payment method not found');
    }

    const method = methods[0];
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.bankAccount) {
      updateData.details = JSON.stringify({
        ...JSON.parse(method.details),
        ...dto.bankAccount,
        accountNumber: this.maskAccountNumber(dto.bankAccount.accountNumber),
      });
    }

    if (dto.paypalEmail) {
      updateData.details = JSON.stringify({ email: dto.paypalEmail });
    }

    if (dto.isDefault !== undefined) {
      if (dto.isDefault) {
        await /* TODO: replace client call */ this.db.client.query
          .from('vendor_payment_methods')
          .where('shop_id', method.shop_id)
          .where('is_default', true)
          .update({ is_default: false })
          .execute();
      }
      updateData.is_default = dto.isDefault;
    }

    if (dto.isActive !== undefined) {
      updateData.is_active = dto.isActive;
    }

    await /* TODO: replace client call */ this.db.client.query
      .from('vendor_payment_methods')
      .where('id', methodId)
      .update(updateData)
      .execute();

    const updated = await /* TODO: replace client call */ this.db.client.query
      .from('vendor_payment_methods')
      .select('*')
      .where('id', methodId)
      .get();

    return this.transformPaymentMethod(updated[0]);
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(methodId: string): Promise<void> {
    await /* TODO: replace client call */ this.db.client.query
      .from('vendor_payment_methods')
      .where('id', methodId)
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  // ============================================
  // DISBURSEMENT SETTINGS
  // ============================================

  /**
   * Get disbursement settings
   */
  async getSettings(shopId: string): Promise<any> {
    const settings = await /* TODO: replace client call */ this.db.client.query
      .from('vendor_disbursement_settings')
      .select('*')
      .where('shop_id', shopId)
      .get();

    if (!settings || settings.length === 0) {
      return this.getDefaultSettings(shopId);
    }

    return this.transformSettings(settings[0]);
  }

  /**
   * Set disbursement settings
   */
  async setSettings(dto: SetDisbursementSettingsDto): Promise<any> {
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('vendor_disbursement_settings')
      .select('id')
      .where('shop_id', dto.shopId)
      .get();

    const settingsData = {
      shop_id: dto.shopId,
      schedule: dto.schedule,
      minimum_amount: dto.minimumAmount || 50,
      hold_period_days: dto.holdPeriodDays || 7,
      weekly_day: dto.weeklyDay ?? null,
      monthly_day: dto.monthlyDay ?? null,
      auto_disburse: dto.autoDisburse ?? true,
      next_scheduled_date: this.calculateNextScheduledDate(dto.schedule, dto.weeklyDay, dto.monthlyDay),
      updated_at: new Date().toISOString(),
    };

    if (existing && existing.length > 0) {
      await /* TODO: replace client call */ this.db.client.query
        .from('vendor_disbursement_settings')
        .where('id', existing[0].id)
        .update(settingsData)
        .execute();
    } else {
      await /* TODO: replace client call */ this.db.client.query
        .from('vendor_disbursement_settings')
        .insert({
          ...settingsData,
          created_at: new Date().toISOString(),
        })
        .execute();
    }

    return this.getSettings(dto.shopId);
  }

  // ============================================
  // BALANCE & EARNINGS
  // ============================================

  /**
   * Get vendor balance
   */
  async getBalance(shopId: string): Promise<any> {
    // Get completed orders earnings
    const ordersQuery = await /* TODO: replace client call */ this.db.client.query
      .from('orders')
      .select('*')
      .where('shop_id', shopId)
      .where('status', 'delivered')
      .get();

    const orders = ordersQuery || [];
    const totalEarnings = orders.reduce((sum: number, o: any) => sum + parseFloat(o.vendor_amount || o.total), 0);

    // Get completed disbursements
    const disbursementsQuery = await /* TODO: replace client call */ this.db.client.query
      .from('disbursements')
      .select('*')
      .where('shop_id', shopId)
      .where('status', DisbursementStatus.COMPLETED)
      .get();

    const totalWithdrawn = (disbursementsQuery || []).reduce(
      (sum: number, d: any) => sum + parseFloat(d.net_amount),
      0,
    );

    // Get pending disbursements
    const pendingQuery = await /* TODO: replace client call */ this.db.client.query
      .from('disbursements')
      .select('*')
      .where('shop_id', shopId)
      .whereIn('status', [DisbursementStatus.PENDING, DisbursementStatus.PROCESSING])
      .get();

    const pending = (pendingQuery || []).reduce(
      (sum: number, d: any) => sum + parseFloat(d.amount),
      0,
    );

    // Get on-hold amount
    const settings = await this.getSettings(shopId);
    const holdDays = settings.holdPeriodDays || 7;
    const holdDate = new Date(Date.now() - holdDays * 24 * 60 * 60 * 1000).toISOString();

    const recentOrders = orders.filter((o: any) => o.delivered_at > holdDate);
    const onHold = recentOrders.reduce(
      (sum: number, o: any) => sum + parseFloat(o.vendor_amount || o.total),
      0,
    );

    const available = totalEarnings - totalWithdrawn - pending - onHold;

    return {
      available: Math.max(0, Math.round(available * 100) / 100),
      pending: Math.round(pending * 100) / 100,
      onHold: Math.round(onHold * 100) / 100,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
      currency: 'USD',
    };
  }

  // ============================================
  // DISBURSEMENT REQUESTS
  // ============================================

  /**
   * Request disbursement
   */
  async requestDisbursement(dto: RequestDisbursementDto): Promise<any> {
    const balance = await this.getBalance(dto.shopId);
    const amount = dto.amount || balance.available;

    if (amount <= 0) {
      throw new BadRequestException('No available balance to withdraw');
    }

    if (amount > balance.available) {
      throw new BadRequestException(`Insufficient balance. Available: ${balance.available}`);
    }

    // Get payment method
    let paymentMethod: any = null;
    if (dto.paymentMethodId) {
      const methods = await /* TODO: replace client call */ this.db.client.query
        .from('vendor_payment_methods')
        .select('*')
        .where('id', dto.paymentMethodId)
        .where('is_active', true)
        .get();

      if (!methods || methods.length === 0) {
        throw new BadRequestException('Payment method not found');
      }
      paymentMethod = methods[0];
    } else {
      const methods = await this.getPaymentMethods(dto.shopId);
      paymentMethod = methods.find((m: any) => m.isDefault) || methods[0];
    }

    if (!paymentMethod) {
      throw new BadRequestException('No payment method configured');
    }

    // Calculate fee (platform fee for disbursement)
    const feeRate = 0.01; // 1% fee
    const fee = Math.round(amount * feeRate * 100) / 100;
    const netAmount = amount - fee;

    const result = await /* TODO: replace client call */ this.db.client.query
      .from('disbursements')
      .insert({
        shop_id: dto.shopId,
        amount,
        fee,
        net_amount: netAmount,
        currency: 'USD',
        status: DisbursementStatus.PENDING,
        method: paymentMethod.method,
        payment_method_id: paymentMethod.id,
        note: dto.note || null,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformDisbursement(result[0]);
  }

  /**
   * Get disbursements
   */
  async getDisbursements(dto: GetDisbursementsDto): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('disbursements')
      .select('*');

    if (dto.shopId) {
      query = query.where('shop_id', dto.shopId);
    }

    if (dto.status) {
      query = query.where('status', dto.status);
    }

    if (dto.startDate) {
      query = query.where('created_at', '>=', dto.startDate);
    }

    if (dto.endDate) {
      query = query.where('created_at', '<=', dto.endDate);
    }

    const disbursements = await query
      .orderBy('created_at', 'DESC')
      .limit(dto.limit || 50)
      .offset(dto.offset || 0)
      .get();

    return (disbursements || []).map(this.transformDisbursement);
  }

  /**
   * Get single disbursement
   */
  async getDisbursement(disbursementId: string): Promise<any> {
    const disbursements = await /* TODO: replace client call */ this.db.client.query
      .from('disbursements')
      .select('*')
      .where('id', disbursementId)
      .get();

    if (!disbursements || disbursements.length === 0) {
      throw new NotFoundException('Disbursement not found');
    }

    return this.transformDisbursement(disbursements[0]);
  }

  /**
   * Process disbursement (Admin)
   */
  async processDisbursement(dto: ProcessDisbursementDto): Promise<any> {
    const disbursement = await this.getDisbursement(dto.disbursementId);

    if (disbursement.status !== DisbursementStatus.PENDING) {
      throw new BadRequestException(`Cannot process disbursement in ${disbursement.status} status`);
    }

    let newStatus: DisbursementStatus;
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    switch (dto.action) {
      case 'approve':
        newStatus = DisbursementStatus.PROCESSING;
        // In production, initiate actual transfer here
        // For now, mark as completed immediately
        newStatus = DisbursementStatus.COMPLETED;
        updateData.processed_at = new Date().toISOString();
        updateData.external_reference = dto.externalReference || `TXN_${Date.now()}`;
        break;

      case 'reject':
        newStatus = DisbursementStatus.FAILED;
        updateData.failure_reason = dto.reason || 'Rejected by admin';
        break;

      case 'hold':
        newStatus = DisbursementStatus.ON_HOLD;
        updateData.hold_reason = dto.reason;
        break;

      default:
        throw new BadRequestException('Invalid action');
    }

    updateData.status = newStatus;

    await /* TODO: replace client call */ this.db.client.query
      .from('disbursements')
      .where('id', dto.disbursementId)
      .update(updateData)
      .execute();

    return this.getDisbursement(dto.disbursementId);
  }

  /**
   * Cancel disbursement (Vendor - only pending)
   */
  async cancelDisbursement(disbursementId: string, shopId: string): Promise<void> {
    const disbursement = await this.getDisbursement(disbursementId);

    if (disbursement.shopId !== shopId) {
      throw new BadRequestException('Unauthorized');
    }

    if (disbursement.status !== DisbursementStatus.PENDING) {
      throw new BadRequestException('Can only cancel pending disbursements');
    }

    await /* TODO: replace client call */ this.db.client.query
      .from('disbursements')
      .where('id', disbursementId)
      .update({
        status: DisbursementStatus.CANCELLED,
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  // ============================================
  // STRIPE CONNECT
  // ============================================

  /**
   * Create Stripe Connect account
   */
  async createStripeConnectAccount(dto: CreateStripeConnectAccountDto): Promise<any> {
    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        country: dto.country || 'US',
        email: dto.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          shop_id: dto.shopId,
        },
      });

      // Create account link for onboarding
      const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.FRONTEND_URL}/vendor/settings/payments?refresh=true`,
        return_url: `${process.env.FRONTEND_URL}/vendor/settings/payments?success=true`,
        type: 'account_onboarding',
      });

      // Save payment method
      await this.setupPaymentMethod({
        shopId: dto.shopId,
        method: DisbursementMethod.STRIPE_CONNECT,
        stripeAccountId: account.id,
        isDefault: true,
      });

      return {
        accountId: account.id,
        onboardingUrl: accountLink.url,
        isOnboarded: false,
      };
    } catch (error) {
      this.logger.error('Stripe Connect error:', error);
      throw new BadRequestException('Failed to create Stripe Connect account');
    }
  }

  /**
   * Get Stripe Connect account status
   */
  async getStripeConnectStatus(shopId: string): Promise<any> {
    const methods = await this.getPaymentMethods(shopId);
    const stripeMethod = methods.find((m: any) => m.method === DisbursementMethod.STRIPE_CONNECT);

    if (!stripeMethod) {
      return { isConnected: false };
    }

    try {
      const account = await this.stripe.accounts.retrieve(stripeMethod.details.accountId);

      return {
        isConnected: true,
        accountId: account.id,
        isOnboarded: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      };
    } catch (error) {
      return { isConnected: false, error: 'Account not found' };
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  private maskAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 4) return '****';
    return '****' + accountNumber.slice(-4);
  }

  private calculateNextScheduledDate(
    schedule: DisbursementSchedule,
    weeklyDay?: number,
    monthlyDay?: number,
  ): string | null {
    const now = new Date();

    switch (schedule) {
      case DisbursementSchedule.DAILY:
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.toISOString();

      case DisbursementSchedule.WEEKLY:
        const nextWeekly = new Date(now);
        const targetDay = weeklyDay ?? 1; // Default Monday
        const daysUntil = (targetDay - now.getDay() + 7) % 7 || 7;
        nextWeekly.setDate(nextWeekly.getDate() + daysUntil);
        nextWeekly.setHours(0, 0, 0, 0);
        return nextWeekly.toISOString();

      case DisbursementSchedule.BIWEEKLY:
        const nextBiweekly = new Date(now);
        nextBiweekly.setDate(nextBiweekly.getDate() + 14);
        nextBiweekly.setHours(0, 0, 0, 0);
        return nextBiweekly.toISOString();

      case DisbursementSchedule.MONTHLY:
        const nextMonthly = new Date(now);
        const targetMonthDay = monthlyDay ?? 1;
        nextMonthly.setMonth(nextMonthly.getMonth() + 1);
        nextMonthly.setDate(targetMonthDay);
        nextMonthly.setHours(0, 0, 0, 0);
        return nextMonthly.toISOString();

      case DisbursementSchedule.ON_DEMAND:
        return null;

      default:
        return null;
    }
  }

  private getDefaultSettings(shopId: string): any {
    return {
      shopId,
      schedule: DisbursementSchedule.WEEKLY,
      minimumAmount: 50,
      holdPeriodDays: 7,
      weeklyDay: 1, // Monday
      monthlyDay: null,
      autoDisburse: true,
      nextScheduledDate: null,
    };
  }

  private transformPaymentMethod(method: any): any {
    return {
      id: method.id,
      shopId: method.shop_id,
      method: method.method,
      details: typeof method.details === 'string' ? JSON.parse(method.details) : method.details,
      isDefault: method.is_default,
      isActive: method.is_active,
      isVerified: method.is_verified,
      createdAt: method.created_at,
      updatedAt: method.updated_at,
    };
  }

  private transformSettings(settings: any): any {
    return {
      shopId: settings.shop_id,
      schedule: settings.schedule,
      minimumAmount: parseFloat(settings.minimum_amount) || 50,
      holdPeriodDays: settings.hold_period_days || 7,
      weeklyDay: settings.weekly_day,
      monthlyDay: settings.monthly_day,
      autoDisburse: settings.auto_disburse,
      nextScheduledDate: settings.next_scheduled_date,
    };
  }

  private transformDisbursement(d: any): any {
    return {
      id: d.id,
      shopId: d.shop_id,
      amount: parseFloat(d.amount),
      fee: parseFloat(d.fee),
      netAmount: parseFloat(d.net_amount),
      currency: d.currency,
      status: d.status,
      method: d.method,
      paymentMethodId: d.payment_method_id,
      externalReference: d.external_reference,
      note: d.note,
      failureReason: d.failure_reason,
      holdReason: d.hold_reason,
      processedAt: d.processed_at,
      createdAt: d.created_at,
    };
  }
}

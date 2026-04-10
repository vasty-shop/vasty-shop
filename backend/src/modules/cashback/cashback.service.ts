import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { WalletService } from '../wallet/wallet.service';
import { TransactionType } from '../wallet/dto/wallet.dto';
import {
  CashbackType,
  CashbackAppliesTo,
  CashbackUserType,
  CashbackStatus,
  CreateCashbackRuleDto,
  UpdateCashbackRuleDto,
  GetCashbackHistoryDto,
} from './dto/cashback.dto';

@Injectable()
export class CashbackService {
  private readonly logger = new Logger(CashbackService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly walletService: WalletService,
  ) {}

  // ============================================
  // RULE MANAGEMENT
  // ============================================

  /**
   * Get all cashback rules
   */
  async getRules(includeInactive: boolean = false): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('cashback_rules')
      .select('*');

    if (!includeInactive) {
      query = query.where('is_active', true);
    }

    const rules = await query.orderBy('priority', 'DESC').get();
    return (rules || []).map(this.transformRule);
  }

  /**
   * Get rule by ID
   */
  async getRule(ruleId: string): Promise<any> {
    const rules = await /* TODO: replace client call */ this.db.client.query
      .from('cashback_rules')
      .select('*')
      .where('id', ruleId)
      .get();

    if (!rules || rules.length === 0) {
      throw new NotFoundException('Cashback rule not found');
    }

    return this.transformRule(rules[0]);
  }

  /**
   * Create cashback rule
   */
  async createRule(dto: CreateCashbackRuleDto): Promise<any> {
    const rule = await /* TODO: replace client call */ this.db.client.query
      .from('cashback_rules')
      .insert({
        name: dto.name,
        description: dto.description || null,
        type: dto.type,
        value: dto.value,
        max_cashback: dto.maxCashback || null,
        min_order_amount: dto.minOrderAmount || 0,
        applies_to: dto.appliesTo || CashbackAppliesTo.ALL,
        category_ids: JSON.stringify(dto.categoryIds || []),
        product_ids: JSON.stringify(dto.productIds || []),
        shop_ids: JSON.stringify(dto.shopIds || []),
        user_type: dto.userType || CashbackUserType.ALL,
        loyalty_tiers: JSON.stringify(dto.loyaltyTiers || []),
        start_date: dto.startDate || null,
        end_date: dto.endDate || null,
        usage_limit: dto.usageLimit || null,
        usage_count: 0,
        per_user_limit: dto.perUserLimit || null,
        is_active: true,
        priority: dto.priority || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformRule(rule[0]);
  }

  /**
   * Update cashback rule
   */
  async updateRule(ruleId: string, dto: UpdateCashbackRuleDto): Promise<any> {
    await this.getRule(ruleId); // Verify exists

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.value !== undefined) updateData.value = dto.value;
    if (dto.maxCashback !== undefined) updateData.max_cashback = dto.maxCashback;
    if (dto.minOrderAmount !== undefined) updateData.min_order_amount = dto.minOrderAmount;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
    if (dto.startDate !== undefined) updateData.start_date = dto.startDate;
    if (dto.endDate !== undefined) updateData.end_date = dto.endDate;
    if (dto.usageLimit !== undefined) updateData.usage_limit = dto.usageLimit;
    if (dto.priority !== undefined) updateData.priority = dto.priority;

    await /* TODO: replace client call */ this.db.client.query
      .from('cashback_rules')
      .where('id', ruleId)
      .update(updateData)
      .execute();

    return this.getRule(ruleId);
  }

  /**
   * Delete cashback rule
   */
  async deleteRule(ruleId: string): Promise<void> {
    await this.getRule(ruleId); // Verify exists

    await /* TODO: replace client call */ this.db.client.query
      .from('cashback_rules')
      .where('id', ruleId)
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  // ============================================
  // CASHBACK CALCULATION & PROCESSING
  // ============================================

  /**
   * Calculate cashback for an order
   */
  async calculateCashback(
    userId: string,
    orderAmount: number,
    shopId?: string,
    categoryIds?: string[],
    productIds?: string[],
  ): Promise<{ amount: number; rule: any | null }> {
    const now = new Date().toISOString();

    // Get active rules sorted by priority
    const rules = await /* TODO: replace client call */ this.db.client.query
      .from('cashback_rules')
      .select('*')
      .where('is_active', true)
      .orderBy('priority', 'DESC')
      .get();

    if (!rules || rules.length === 0) {
      return { amount: 0, rule: null };
    }

    // Check user order count for first_order rules
    const userOrders = await /* TODO: replace client call */ this.db.client.query
      .from('orders')
      .select('id')
      .where('user_id', userId)
      .get();
    const isFirstOrder = !userOrders || userOrders.length === 0;

    // Get user's loyalty tier
    let userTier: string | null = null;
    try {
      const loyaltyAccount = await /* TODO: replace client call */ this.db.client.query
        .from('loyalty_points')
        .select('tier')
        .where('user_id', userId)
        .get();
      if (loyaltyAccount && loyaltyAccount.length > 0) {
        userTier = loyaltyAccount[0].tier;
      }
    } catch (e) {
      // Loyalty not enabled or user doesn't have account
    }

    // Find best matching rule
    for (const rule of rules) {
      // Check validity period
      if (rule.start_date && new Date(rule.start_date) > new Date(now)) continue;
      if (rule.end_date && new Date(rule.end_date) < new Date(now)) continue;

      // Check usage limit
      if (rule.usage_limit && rule.usage_count >= rule.usage_limit) continue;

      // Check minimum order amount
      if (orderAmount < parseFloat(rule.min_order_amount)) continue;

      // Check applies_to
      const appliesTo = rule.applies_to;
      if (appliesTo === CashbackAppliesTo.FIRST_ORDER && !isFirstOrder) continue;
      if (appliesTo === CashbackAppliesTo.SHOP && shopId) {
        const ruleShopIds = typeof rule.shop_ids === 'string' ? JSON.parse(rule.shop_ids) : rule.shop_ids;
        if (!ruleShopIds.includes(shopId)) continue;
      }
      if (appliesTo === CashbackAppliesTo.CATEGORY && categoryIds) {
        const ruleCategoryIds = typeof rule.category_ids === 'string' ? JSON.parse(rule.category_ids) : rule.category_ids;
        const hasMatch = categoryIds.some(c => ruleCategoryIds.includes(c));
        if (!hasMatch) continue;
      }

      // Check user type
      const userType = rule.user_type;
      if (userType === CashbackUserType.NEW && !isFirstOrder) continue;
      if (userType === CashbackUserType.EXISTING && isFirstOrder) continue;
      if (userType === CashbackUserType.TIER_SPECIFIC && userTier) {
        const ruleTiers = typeof rule.loyalty_tiers === 'string' ? JSON.parse(rule.loyalty_tiers) : rule.loyalty_tiers;
        if (!ruleTiers.includes(userTier)) continue;
      }

      // Calculate cashback amount
      let cashbackAmount: number;
      if (rule.type === CashbackType.PERCENTAGE) {
        cashbackAmount = orderAmount * (parseFloat(rule.value) / 100);
        if (rule.max_cashback) {
          cashbackAmount = Math.min(cashbackAmount, parseFloat(rule.max_cashback));
        }
      } else {
        cashbackAmount = parseFloat(rule.value);
      }

      return { amount: cashbackAmount, rule: this.transformRule(rule) };
    }

    return { amount: 0, rule: null };
  }

  /**
   * Create pending cashback for an order
   */
  async createPendingCashback(
    userId: string,
    orderId: string,
    orderAmount: number,
    shopId?: string,
    categoryIds?: string[],
    productIds?: string[],
  ): Promise<any | null> {
    const { amount, rule } = await this.calculateCashback(userId, orderAmount, shopId, categoryIds, productIds);

    if (amount <= 0 || !rule) {
      return null;
    }

    // Create pending cashback transaction
    const transaction = await /* TODO: replace client call */ this.db.client.query
      .from('cashback_transactions')
      .insert({
        user_id: userId,
        order_id: orderId,
        rule_id: rule.id,
        order_amount: orderAmount,
        cashback_amount: amount,
        cashback_type: rule.type,
        cashback_value: rule.value,
        status: CashbackStatus.PENDING,
        expires_at: this.getCashbackExpiryDate(),
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    // Increment rule usage count
    await /* TODO: replace client call */ this.db.client.query
      .from('cashback_rules')
      .where('id', rule.id)
      .update({
        usage_count: rule.usageCount + 1,
        updated_at: new Date().toISOString(),
      })
      .execute();

    return this.transformTransaction(transaction[0]);
  }

  /**
   * Credit pending cashback to wallet (called when order is delivered)
   */
  async creditCashback(orderId: string): Promise<any | null> {
    // Find pending cashback
    const transactions = await /* TODO: replace client call */ this.db.client.query
      .from('cashback_transactions')
      .select('*')
      .where('order_id', orderId)
      .where('status', CashbackStatus.PENDING)
      .get();

    if (!transactions || transactions.length === 0) {
      return null;
    }

    const transaction = transactions[0];

    // Credit to wallet
    const walletResult = await this.walletService.creditWallet(
      transaction.user_id,
      parseFloat(transaction.cashback_amount),
      TransactionType.CASHBACK,
      'cashback',
      transaction.id,
      `Cashback for order #${orderId}`,
    );

    // Update transaction status
    await /* TODO: replace client call */ this.db.client.query
      .from('cashback_transactions')
      .where('id', transaction.id)
      .update({
        status: CashbackStatus.CREDITED,
        credited_at: new Date().toISOString(),
        wallet_transaction_id: walletResult.transactionId,
      })
      .execute();

    return {
      success: true,
      cashbackAmount: parseFloat(transaction.cashback_amount),
      walletTransactionId: walletResult.transactionId,
    };
  }

  /**
   * Cancel pending cashback (called when order is cancelled/refunded)
   */
  async cancelCashback(orderId: string): Promise<void> {
    await /* TODO: replace client call */ this.db.client.query
      .from('cashback_transactions')
      .where('order_id', orderId)
      .where('status', CashbackStatus.PENDING)
      .update({
        status: CashbackStatus.CANCELLED,
      })
      .execute();
  }

  /**
   * Get user's cashback history
   */
  async getUserCashbackHistory(userId: string, dto: GetCashbackHistoryDto): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('cashback_transactions')
      .select('*')
      .where('user_id', userId);

    if (dto.status) {
      query = query.where('status', dto.status);
    }

    if (dto.startDate) {
      query = query.where('created_at', '>=', dto.startDate);
    }

    if (dto.endDate) {
      query = query.where('created_at', '<=', dto.endDate);
    }

    const transactions = await query
      .orderBy('created_at', 'DESC')
      .limit(dto.limit || 20)
      .offset(dto.offset || 0)
      .get();

    return (transactions || []).map(this.transformTransaction);
  }

  /**
   * Get user's total cashback earned
   */
  async getUserTotalCashback(userId: string): Promise<{ total: number; pending: number; credited: number }> {
    const transactions = await /* TODO: replace client call */ this.db.client.query
      .from('cashback_transactions')
      .select('*')
      .where('user_id', userId)
      .get();

    const all = transactions || [];

    return {
      total: all.reduce((sum: number, t: any) => sum + (parseFloat(t.cashback_amount) || 0), 0),
      pending: all
        .filter((t: any) => t.status === CashbackStatus.PENDING)
        .reduce((sum: number, t: any) => sum + (parseFloat(t.cashback_amount) || 0), 0),
      credited: all
        .filter((t: any) => t.status === CashbackStatus.CREDITED)
        .reduce((sum: number, t: any) => sum + (parseFloat(t.cashback_amount) || 0), 0),
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private getCashbackExpiryDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days to credit
    return date.toISOString();
  }

  private transformRule(rule: any): any {
    return {
      id: rule.id,
      name: rule.name,
      description: rule.description,
      type: rule.type,
      value: parseFloat(rule.value) || 0,
      maxCashback: rule.max_cashback ? parseFloat(rule.max_cashback) : null,
      minOrderAmount: parseFloat(rule.min_order_amount) || 0,
      appliesTo: rule.applies_to,
      categoryIds: typeof rule.category_ids === 'string' ? JSON.parse(rule.category_ids) : rule.category_ids,
      productIds: typeof rule.product_ids === 'string' ? JSON.parse(rule.product_ids) : rule.product_ids,
      shopIds: typeof rule.shop_ids === 'string' ? JSON.parse(rule.shop_ids) : rule.shop_ids,
      userType: rule.user_type,
      loyaltyTiers: typeof rule.loyalty_tiers === 'string' ? JSON.parse(rule.loyalty_tiers) : rule.loyalty_tiers,
      startDate: rule.start_date,
      endDate: rule.end_date,
      usageLimit: rule.usage_limit,
      usageCount: rule.usage_count || 0,
      perUserLimit: rule.per_user_limit,
      isActive: rule.is_active,
      priority: rule.priority || 0,
      createdAt: rule.created_at,
    };
  }

  private transformTransaction(transaction: any): any {
    return {
      id: transaction.id,
      userId: transaction.user_id,
      orderId: transaction.order_id,
      ruleId: transaction.rule_id,
      orderAmount: parseFloat(transaction.order_amount) || 0,
      cashbackAmount: parseFloat(transaction.cashback_amount) || 0,
      cashbackType: transaction.cashback_type,
      cashbackValue: parseFloat(transaction.cashback_value) || 0,
      status: transaction.status,
      creditedAt: transaction.credited_at,
      walletTransactionId: transaction.wallet_transaction_id,
      expiresAt: transaction.expires_at,
      createdAt: transaction.created_at,
    };
  }
}

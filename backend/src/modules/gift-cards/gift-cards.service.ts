import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  GiftCardStatus,
  GiftCardType,
  GiftCardTransactionType,
  CreateGiftCardTemplateDto,
  UpdateGiftCardTemplateDto,
  PurchaseGiftCardDto,
  RedeemGiftCardDto,
  TransferGiftCardDto,
  TopUpGiftCardDto,
  GetGiftCardsDto,
} from './dto/gift-cards.dto';

@Injectable()
export class GiftCardsService {
  private readonly logger = new Logger(GiftCardsService.name);

  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // TEMPLATE MANAGEMENT
  // ============================================

  /**
   * Get all gift card templates
   */
  async getTemplates(includeInactive = false): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('gift_card_templates')
      .select('*');

    if (!includeInactive) {
      query = query.where('is_active', true);
    }

    const templates = await query.orderBy('name', 'ASC').get();
    return (templates || []).map(this.transformTemplate);
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<any> {
    const templates = await /* TODO: replace client call */ this.db.client.query
      .from('gift_card_templates')
      .select('*')
      .where('id', templateId)
      .get();

    if (!templates || templates.length === 0) {
      throw new NotFoundException('Gift card template not found');
    }

    return this.transformTemplate(templates[0]);
  }

  /**
   * Create template
   */
  async createTemplate(dto: CreateGiftCardTemplateDto): Promise<any> {
    const result = await /* TODO: replace client call */ this.db.client.query
      .from('gift_card_templates')
      .insert({
        name: dto.name,
        description: dto.description || null,
        preset_amounts: JSON.stringify(dto.presetAmounts),
        allow_custom_amount: dto.allowCustomAmount ?? true,
        min_amount: dto.minAmount || null,
        max_amount: dto.maxAmount || null,
        validity_days: dto.validityDays || null,
        design_image: dto.designImage || null,
        type: dto.type || GiftCardType.DIGITAL,
        is_active: dto.isActive !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformTemplate(result[0]);
  }

  /**
   * Update template
   */
  async updateTemplate(templateId: string, dto: UpdateGiftCardTemplateDto): Promise<any> {
    await this.getTemplate(templateId);

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.presetAmounts !== undefined) updateData.preset_amounts = JSON.stringify(dto.presetAmounts);
    if (dto.allowCustomAmount !== undefined) updateData.allow_custom_amount = dto.allowCustomAmount;
    if (dto.minAmount !== undefined) updateData.min_amount = dto.minAmount;
    if (dto.maxAmount !== undefined) updateData.max_amount = dto.maxAmount;
    if (dto.validityDays !== undefined) updateData.validity_days = dto.validityDays;
    if (dto.designImage !== undefined) updateData.design_image = dto.designImage;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    await /* TODO: replace client call */ this.db.client.query
      .from('gift_card_templates')
      .where('id', templateId)
      .update(updateData)
      .execute();

    return this.getTemplate(templateId);
  }

  /**
   * Delete template (soft delete)
   */
  async deleteTemplate(templateId: string): Promise<void> {
    await /* TODO: replace client call */ this.db.client.query
      .from('gift_card_templates')
      .where('id', templateId)
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  // ============================================
  // GIFT CARD PURCHASE
  // ============================================

  /**
   * Purchase gift cards
   */
  async purchaseGiftCards(userId: string, dto: PurchaseGiftCardDto): Promise<any> {
    let template: any = null;
    let validityDays: number | null = null;

    if (dto.templateId) {
      template = await this.getTemplate(dto.templateId);
      validityDays = template.validityDays;

      // Validate amount against template
      if (!template.allowCustomAmount && !template.presetAmounts.includes(dto.amount)) {
        throw new BadRequestException('Invalid amount for this template');
      }

      if (template.minAmount && dto.amount < template.minAmount) {
        throw new BadRequestException(`Minimum amount is ${template.minAmount}`);
      }

      if (template.maxAmount && dto.amount > template.maxAmount) {
        throw new BadRequestException(`Maximum amount is ${template.maxAmount}`);
      }
    }

    const giftCards: any[] = [];
    const totalAmount = dto.amount * dto.quantity;

    // Calculate expiry date
    const expiresAt = validityDays
      ? new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Create gift cards
    for (let i = 0; i < dto.quantity; i++) {
      const code = this.generateGiftCardCode();

      const result = await /* TODO: replace client call */ this.db.client.query
        .from('gift_cards')
        .insert({
          code,
          template_id: dto.templateId || null,
          initial_amount: dto.amount,
          current_balance: dto.amount,
          currency: 'USD',
          status: GiftCardStatus.ACTIVE,
          type: template?.type || GiftCardType.DIGITAL,
          purchased_by: userId,
          recipient_email: dto.recipientEmail || null,
          recipient_name: dto.recipientName || null,
          message: dto.message || null,
          delivery_date: dto.deliveryDate || null,
          expires_at: expiresAt,
          created_at: new Date().toISOString(),
        })
        .returning('*')
        .execute();

      const giftCard = this.transformGiftCard(result[0]);
      giftCards.push(giftCard);

      // Create transaction record
      await this.createTransaction(giftCard.id, {
        type: GiftCardTransactionType.PURCHASE,
        amount: dto.amount,
        balanceAfter: dto.amount,
        userId,
        note: 'Gift card purchased',
      });
    }

    // TODO: Create order for payment processing
    // TODO: Send email to recipient if deliveryDate is set

    return {
      success: true,
      orderId: `GC_${Date.now()}`,
      giftCards,
      totalAmount,
    };
  }

  // ============================================
  // GIFT CARD OPERATIONS
  // ============================================

  /**
   * Get gift card by code
   */
  async getGiftCardByCode(code: string): Promise<any> {
    const cards = await /* TODO: replace client call */ this.db.client.query
      .from('gift_cards')
      .select('*')
      .where('code', code.toUpperCase())
      .get();

    if (!cards || cards.length === 0) {
      throw new NotFoundException('Gift card not found');
    }

    return this.transformGiftCard(cards[0]);
  }

  /**
   * Check gift card balance
   */
  async checkBalance(code: string): Promise<any> {
    const card = await this.getGiftCardByCode(code);

    let isValid = card.status === GiftCardStatus.ACTIVE && card.currentBalance > 0;
    let message = 'Gift card is valid';

    if (card.status === GiftCardStatus.EXPIRED || (card.expiresAt && new Date(card.expiresAt) < new Date())) {
      isValid = false;
      message = 'Gift card has expired';
    } else if (card.status === GiftCardStatus.USED) {
      isValid = false;
      message = 'Gift card has been fully used';
    } else if (card.status === GiftCardStatus.CANCELLED) {
      isValid = false;
      message = 'Gift card has been cancelled';
    } else if (card.currentBalance <= 0) {
      isValid = false;
      message = 'Gift card has no remaining balance';
    }

    return {
      code: card.code,
      currentBalance: card.currentBalance,
      currency: card.currency,
      status: card.status,
      expiresAt: card.expiresAt,
      isValid,
      message,
    };
  }

  /**
   * Redeem gift card
   */
  async redeemGiftCard(userId: string, dto: RedeemGiftCardDto): Promise<any> {
    const card = await this.getGiftCardByCode(dto.code);

    // Validate card
    if (card.status !== GiftCardStatus.ACTIVE) {
      throw new BadRequestException(`Gift card is ${card.status}`);
    }

    if (card.expiresAt && new Date(card.expiresAt) < new Date()) {
      throw new BadRequestException('Gift card has expired');
    }

    const redeemAmount = dto.amount || card.currentBalance;

    if (redeemAmount > card.currentBalance) {
      throw new BadRequestException(`Insufficient balance. Available: ${card.currentBalance}`);
    }

    const newBalance = card.currentBalance - redeemAmount;
    const newStatus = newBalance <= 0 ? GiftCardStatus.USED : GiftCardStatus.ACTIVE;

    // Update gift card
    await /* TODO: replace client call */ this.db.client.query
      .from('gift_cards')
      .where('id', card.id)
      .update({
        current_balance: newBalance,
        status: newStatus,
        redeemed_by: userId,
        redeemed_at: newStatus === GiftCardStatus.USED ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Create transaction
    await this.createTransaction(card.id, {
      type: GiftCardTransactionType.REDEMPTION,
      amount: -redeemAmount,
      balanceAfter: newBalance,
      userId,
      orderId: dto.orderId,
      note: dto.orderId ? `Redeemed for order ${dto.orderId}` : 'Redeemed',
    });

    return {
      success: true,
      amountRedeemed: redeemAmount,
      remainingBalance: newBalance,
      status: newStatus,
    };
  }

  /**
   * Transfer gift card to another user
   */
  async transferGiftCard(userId: string, dto: TransferGiftCardDto): Promise<any> {
    const card = await this.getGiftCardByCode(dto.code);

    if (card.status !== GiftCardStatus.ACTIVE) {
      throw new BadRequestException(`Gift card is ${card.status}`);
    }

    if (card.currentBalance <= 0) {
      throw new BadRequestException('Gift card has no balance to transfer');
    }

    // Update gift card
    await /* TODO: replace client call */ this.db.client.query
      .from('gift_cards')
      .where('id', card.id)
      .update({
        recipient_email: dto.recipientEmail,
        message: dto.message || card.message,
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Create transaction
    await this.createTransaction(card.id, {
      type: GiftCardTransactionType.TRANSFER,
      amount: 0,
      balanceAfter: card.currentBalance,
      userId,
      note: `Transferred to ${dto.recipientEmail}`,
    });

    // TODO: Send email to new recipient

    return {
      success: true,
      message: `Gift card transferred to ${dto.recipientEmail}`,
    };
  }

  /**
   * Top up gift card
   */
  async topUpGiftCard(userId: string, dto: TopUpGiftCardDto): Promise<any> {
    const card = await this.getGiftCardByCode(dto.code);

    if (card.status === GiftCardStatus.CANCELLED) {
      throw new BadRequestException('Cannot top up a cancelled gift card');
    }

    const newBalance = card.currentBalance + dto.amount;
    const newStatus = GiftCardStatus.ACTIVE; // Reactivate if was used

    // Update gift card
    await /* TODO: replace client call */ this.db.client.query
      .from('gift_cards')
      .where('id', card.id)
      .update({
        current_balance: newBalance,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Create transaction
    await this.createTransaction(card.id, {
      type: GiftCardTransactionType.TOP_UP,
      amount: dto.amount,
      balanceAfter: newBalance,
      userId,
      note: 'Balance topped up',
    });

    return {
      success: true,
      amountAdded: dto.amount,
      newBalance,
    };
  }

  // ============================================
  // GIFT CARD QUERIES
  // ============================================

  /**
   * Get user's gift cards
   */
  async getUserGiftCards(userId: string, status?: GiftCardStatus): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('gift_cards')
      .select('*')
      .where('purchased_by', userId);

    if (status) {
      query = query.where('status', status);
    }

    const cards = await query.orderBy('created_at', 'DESC').get();
    return (cards || []).map(this.transformGiftCard);
  }

  /**
   * Get all gift cards (Admin)
   */
  async getGiftCards(dto: GetGiftCardsDto): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('gift_cards')
      .select('*');

    if (dto.userId) {
      query = query.where('purchased_by', dto.userId);
    }

    if (dto.status) {
      query = query.where('status', dto.status);
    }

    if (dto.code) {
      query = query.where('code', dto.code.toUpperCase());
    }

    const cards = await query
      .orderBy('created_at', 'DESC')
      .limit(dto.limit || 50)
      .offset(dto.offset || 0)
      .get();

    return (cards || []).map(this.transformGiftCard);
  }

  /**
   * Get gift card transactions
   */
  async getTransactions(giftCardId: string): Promise<any[]> {
    const transactions = await /* TODO: replace client call */ this.db.client.query
      .from('gift_card_transactions')
      .select('*')
      .where('gift_card_id', giftCardId)
      .orderBy('created_at', 'DESC')
      .get();

    return (transactions || []).map(this.transformTransaction);
  }

  // ============================================
  // ADMIN OPERATIONS
  // ============================================

  /**
   * Cancel gift card (Admin)
   */
  async cancelGiftCard(giftCardId: string, reason?: string): Promise<any> {
    const cards = await /* TODO: replace client call */ this.db.client.query
      .from('gift_cards')
      .select('*')
      .where('id', giftCardId)
      .get();

    if (!cards || cards.length === 0) {
      throw new NotFoundException('Gift card not found');
    }

    const card = cards[0];

    if (card.status === GiftCardStatus.CANCELLED) {
      throw new BadRequestException('Gift card already cancelled');
    }

    await /* TODO: replace client call */ this.db.client.query
      .from('gift_cards')
      .where('id', giftCardId)
      .update({
        status: GiftCardStatus.CANCELLED,
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Create transaction
    await this.createTransaction(giftCardId, {
      type: GiftCardTransactionType.REFUND,
      amount: -parseFloat(card.current_balance),
      balanceAfter: 0,
      note: reason || 'Gift card cancelled by admin',
    });

    return { success: true, message: 'Gift card cancelled' };
  }

  /**
   * Get gift card statistics (Admin)
   */
  async getStatistics(): Promise<any> {
    const allCards = await /* TODO: replace client call */ this.db.client.query
      .from('gift_cards')
      .select('*')
      .get();

    const cards = allCards || [];

    const totalIssued = cards.reduce((sum: number, c: any) => sum + parseFloat(c.initial_amount), 0);
    const totalRedeemed = cards
      .filter((c: any) => c.status === GiftCardStatus.USED || c.redeemed_at)
      .reduce((sum: number, c: any) => sum + (parseFloat(c.initial_amount) - parseFloat(c.current_balance)), 0);
    const totalOutstanding = cards
      .filter((c: any) => c.status === GiftCardStatus.ACTIVE)
      .reduce((sum: number, c: any) => sum + parseFloat(c.current_balance), 0);

    return {
      totalCards: cards.length,
      activeCards: cards.filter((c: any) => c.status === GiftCardStatus.ACTIVE).length,
      usedCards: cards.filter((c: any) => c.status === GiftCardStatus.USED).length,
      expiredCards: cards.filter((c: any) => c.status === GiftCardStatus.EXPIRED).length,
      cancelledCards: cards.filter((c: any) => c.status === GiftCardStatus.CANCELLED).length,
      totalIssued: Math.round(totalIssued * 100) / 100,
      totalRedeemed: Math.round(totalRedeemed * 100) / 100,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      currency: 'USD',
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private generateGiftCardCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private async createTransaction(giftCardId: string, data: {
    type: GiftCardTransactionType;
    amount: number;
    balanceAfter: number;
    userId?: string;
    orderId?: string;
    note?: string;
  }): Promise<void> {
    await /* TODO: replace client call */ this.db.client.query
      .from('gift_card_transactions')
      .insert({
        gift_card_id: giftCardId,
        type: data.type,
        amount: data.amount,
        balance_after: data.balanceAfter,
        user_id: data.userId || null,
        order_id: data.orderId || null,
        note: data.note || null,
        created_at: new Date().toISOString(),
      })
      .execute();
  }

  private transformTemplate(t: any): any {
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      presetAmounts: typeof t.preset_amounts === 'string' ? JSON.parse(t.preset_amounts) : t.preset_amounts,
      allowCustomAmount: t.allow_custom_amount,
      minAmount: t.min_amount ? parseFloat(t.min_amount) : null,
      maxAmount: t.max_amount ? parseFloat(t.max_amount) : null,
      validityDays: t.validity_days,
      designImage: t.design_image,
      type: t.type,
      isActive: t.is_active,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    };
  }

  private transformGiftCard(card: any): any {
    return {
      id: card.id,
      code: card.code,
      templateId: card.template_id,
      initialAmount: parseFloat(card.initial_amount),
      currentBalance: parseFloat(card.current_balance),
      currency: card.currency,
      status: card.status,
      type: card.type,
      purchasedBy: card.purchased_by,
      redeemedBy: card.redeemed_by,
      recipientEmail: card.recipient_email,
      recipientName: card.recipient_name,
      message: card.message,
      deliveryDate: card.delivery_date,
      expiresAt: card.expires_at,
      redeemedAt: card.redeemed_at,
      createdAt: card.created_at,
    };
  }

  private transformTransaction(t: any): any {
    return {
      id: t.id,
      giftCardId: t.gift_card_id,
      type: t.type,
      amount: parseFloat(t.amount),
      balanceAfter: parseFloat(t.balance_after),
      userId: t.user_id,
      orderId: t.order_id,
      note: t.note,
      createdAt: t.created_at,
    };
  }
}

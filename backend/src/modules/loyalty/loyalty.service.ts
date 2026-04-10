import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  LoyaltyTransactionType,
  LoyaltyTier,
  RedeemPointsDto,
  GetLoyaltyTransactionsDto,
} from './dto/loyalty.dto';

export interface TierConfig {
  name: string;
  slug: string;
  minPoints: number;
  multiplier: number;
  benefits: string[];
}

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  // Default tier configuration
  private readonly defaultTiers: TierConfig[] = [
    { name: 'Bronze', slug: 'bronze', minPoints: 0, multiplier: 1, benefits: ['1 point per $1 spent'] },
    { name: 'Silver', slug: 'silver', minPoints: 500, multiplier: 1.25, benefits: ['1.25x points', '5% bonus on purchases'] },
    { name: 'Gold', slug: 'gold', minPoints: 2000, multiplier: 1.5, benefits: ['1.5x points', '10% bonus', 'Free shipping'] },
    { name: 'Platinum', slug: 'platinum', minPoints: 5000, multiplier: 2, benefits: ['2x points', '15% bonus', 'Free shipping', 'Priority support'] },
  ];

  // Points conversion: 100 points = $1 discount
  private readonly pointsPerDollar = 100;

  constructor(private readonly db: DatabaseService) {}

  /**
   * Get or create loyalty account for user
   */
  async getOrCreateLoyaltyAccount(userId: string): Promise<any> {
    // Try to find existing account
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('loyalty_points')
      .select('*')
      .where('user_id', userId)
      .get();

    if (existing && existing.length > 0) {
      return this.transformLoyaltyAccount(existing[0]);
    }

    // Create new account
    const newAccount = await /* TODO: replace client call */ this.db.client.query
      .from('loyalty_points')
      .insert({
        user_id: userId,
        points_balance: 0,
        points_earned: 0,
        points_redeemed: 0,
        points_expired: 0,
        tier: LoyaltyTier.BRONZE,
        tier_progress: 0,
        lifetime_points: 0,
        lifetime_value: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformLoyaltyAccount(newAccount[0]);
  }

  /**
   * Get loyalty points balance
   */
  async getPointsBalance(userId: string): Promise<any> {
    const account = await this.getOrCreateLoyaltyAccount(userId);
    const tiers = await this.getTiers();
    const currentTierIndex = tiers.findIndex(t => t.slug === account.tier);
    const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;

    return {
      pointsBalance: account.pointsBalance,
      tier: account.tier,
      tierName: tiers[currentTierIndex]?.name || 'Bronze',
      multiplier: tiers[currentTierIndex]?.multiplier || 1,
      nextTier: nextTier?.name || null,
      pointsToNextTier: nextTier ? Math.max(0, nextTier.minPoints - account.lifetimePoints) : 0,
      benefits: tiers[currentTierIndex]?.benefits || [],
    };
  }

  /**
   * Award points for a purchase
   */
  async awardPointsForPurchase(userId: string, orderId: string, orderAmount: number): Promise<any> {
    const account = await this.getOrCreateLoyaltyAccount(userId);
    const tiers = await this.getTiers();
    const currentTier = tiers.find(t => t.slug === account.tier) || this.defaultTiers[0];

    // Calculate points: 1 point per $1, multiplied by tier multiplier
    const basePoints = Math.floor(orderAmount);
    const earnedPoints = Math.floor(basePoints * currentTier.multiplier);

    const pointsBefore = account.pointsBalance;
    const pointsAfter = pointsBefore + earnedPoints;
    const newLifetimePoints = account.lifetimePoints + earnedPoints;

    // Update account
    await /* TODO: replace client call */ this.db.client.query
      .from('loyalty_points')
      .where('user_id', userId)
      .update({
        points_balance: pointsAfter,
        points_earned: account.pointsEarned + earnedPoints,
        lifetime_points: newLifetimePoints,
        lifetime_value: account.lifetimeValue + orderAmount,
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Check for tier upgrade
    await this.checkAndUpdateTier(userId, newLifetimePoints);

    // Create transaction record
    await /* TODO: replace client call */ this.db.client.query
      .from('loyalty_transactions')
      .insert({
        user_id: userId,
        type: LoyaltyTransactionType.EARN,
        points: earnedPoints,
        points_before: pointsBefore,
        points_after: pointsAfter,
        reference_type: 'order',
        reference_id: orderId,
        description: `Earned ${earnedPoints} points for order #${orderId}`,
        expires_at: this.getPointsExpiryDate(),
        created_at: new Date().toISOString(),
      })
      .execute();

    return {
      success: true,
      pointsEarned: earnedPoints,
      newBalance: pointsAfter,
      multiplier: currentTier.multiplier,
    };
  }

  /**
   * Redeem points for discount
   */
  async redeemPoints(userId: string, dto: RedeemPointsDto): Promise<any> {
    const { points, orderId } = dto;

    const account = await this.getOrCreateLoyaltyAccount(userId);

    if (account.pointsBalance < points) {
      throw new BadRequestException('Insufficient points balance');
    }

    const discountAmount = points / this.pointsPerDollar;
    const pointsBefore = account.pointsBalance;
    const pointsAfter = pointsBefore - points;

    // Update account
    await /* TODO: replace client call */ this.db.client.query
      .from('loyalty_points')
      .where('user_id', userId)
      .update({
        points_balance: pointsAfter,
        points_redeemed: account.pointsRedeemed + points,
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Create transaction record
    await /* TODO: replace client call */ this.db.client.query
      .from('loyalty_transactions')
      .insert({
        user_id: userId,
        type: LoyaltyTransactionType.REDEEM,
        points: -points,
        points_before: pointsBefore,
        points_after: pointsAfter,
        reference_type: orderId ? 'order' : 'redemption',
        reference_id: orderId || null,
        description: `Redeemed ${points} points for $${discountAmount.toFixed(2)} discount`,
        created_at: new Date().toISOString(),
      })
      .execute();

    return {
      success: true,
      pointsRedeemed: points,
      discountAmount,
      newBalance: pointsAfter,
    };
  }

  /**
   * Award bonus points (promotions, referrals, etc.)
   */
  async awardBonusPoints(
    userId: string,
    points: number,
    reason: string,
    referenceType?: string,
    referenceId?: string,
  ): Promise<any> {
    const account = await this.getOrCreateLoyaltyAccount(userId);
    const pointsBefore = account.pointsBalance;
    const pointsAfter = pointsBefore + points;
    const newLifetimePoints = account.lifetimePoints + points;

    // Update account
    await /* TODO: replace client call */ this.db.client.query
      .from('loyalty_points')
      .where('user_id', userId)
      .update({
        points_balance: pointsAfter,
        points_earned: account.pointsEarned + points,
        lifetime_points: newLifetimePoints,
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Check for tier upgrade
    await this.checkAndUpdateTier(userId, newLifetimePoints);

    // Create transaction record
    await /* TODO: replace client call */ this.db.client.query
      .from('loyalty_transactions')
      .insert({
        user_id: userId,
        type: LoyaltyTransactionType.BONUS,
        points,
        points_before: pointsBefore,
        points_after: pointsAfter,
        reference_type: referenceType || 'bonus',
        reference_id: referenceId,
        description: reason,
        expires_at: this.getPointsExpiryDate(),
        created_at: new Date().toISOString(),
      })
      .execute();

    return {
      success: true,
      pointsAwarded: points,
      newBalance: pointsAfter,
    };
  }

  /**
   * Get transaction history
   */
  async getTransactions(userId: string, dto: GetLoyaltyTransactionsDto): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('loyalty_transactions')
      .select('*')
      .where('user_id', userId);

    if (dto.type) {
      query = query.where('type', dto.type);
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
   * Get loyalty tiers
   */
  async getTiers(): Promise<TierConfig[]> {
    const dbTiers = await /* TODO: replace client call */ this.db.client.query
      .from('loyalty_tiers')
      .select('*')
      .where('is_active', true)
      .orderBy('min_points', 'ASC')
      .get();

    if (!dbTiers || dbTiers.length === 0) {
      return this.defaultTiers;
    }

    return dbTiers.map((t: any) => ({
      name: t.name,
      slug: t.slug,
      minPoints: t.min_points,
      multiplier: parseFloat(t.multiplier) || 1,
      benefits: typeof t.benefits === 'string' ? JSON.parse(t.benefits) : t.benefits,
      icon: t.icon,
      color: t.color,
    }));
  }

  /**
   * Admin: Adjust points
   */
  async adminAdjustPoints(
    adminUserId: string,
    targetUserId: string,
    points: number,
    reason: string,
  ): Promise<any> {
    const account = await this.getOrCreateLoyaltyAccount(targetUserId);
    const pointsBefore = account.pointsBalance;
    const pointsAfter = pointsBefore + points;

    if (pointsAfter < 0) {
      throw new BadRequestException('Adjustment would result in negative balance');
    }

    // Update account
    await /* TODO: replace client call */ this.db.client.query
      .from('loyalty_points')
      .where('user_id', targetUserId)
      .update({
        points_balance: pointsAfter,
        points_earned: points > 0 ? account.pointsEarned + points : account.pointsEarned,
        lifetime_points: points > 0 ? account.lifetimePoints + points : account.lifetimePoints,
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Create transaction record
    await /* TODO: replace client call */ this.db.client.query
      .from('loyalty_transactions')
      .insert({
        user_id: targetUserId,
        type: LoyaltyTransactionType.ADJUSTMENT,
        points,
        points_before: pointsBefore,
        points_after: pointsAfter,
        reference_type: 'admin',
        description: `Admin adjustment: ${reason}`,
        created_at: new Date().toISOString(),
      })
      .execute();

    return {
      success: true,
      previousBalance: pointsBefore,
      newBalance: pointsAfter,
      adjustment: points,
    };
  }

  /**
   * Calculate discount value for points
   */
  getPointsValue(points: number): number {
    return points / this.pointsPerDollar;
  }

  /**
   * Calculate points needed for discount
   */
  getPointsForDiscount(discountAmount: number): number {
    return Math.ceil(discountAmount * this.pointsPerDollar);
  }

  /**
   * Check and update user tier based on lifetime points
   */
  private async checkAndUpdateTier(userId: string, lifetimePoints: number): Promise<void> {
    const tiers = await this.getTiers();

    // Find highest eligible tier
    let newTier = tiers[0];
    for (const tier of tiers) {
      if (lifetimePoints >= tier.minPoints) {
        newTier = tier;
      }
    }

    // Update tier if changed
    await /* TODO: replace client call */ this.db.client.query
      .from('loyalty_points')
      .where('user_id', userId)
      .update({
        tier: newTier.slug,
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  /**
   * Get points expiry date (1 year from now)
   */
  private getPointsExpiryDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString();
  }

  /**
   * Transform loyalty account from DB
   */
  private transformLoyaltyAccount(account: any): any {
    return {
      id: account.id,
      userId: account.user_id,
      pointsBalance: parseInt(account.points_balance) || 0,
      pointsEarned: parseInt(account.points_earned) || 0,
      pointsRedeemed: parseInt(account.points_redeemed) || 0,
      pointsExpired: parseInt(account.points_expired) || 0,
      tier: account.tier,
      tierProgress: parseInt(account.tier_progress) || 0,
      lifetimePoints: parseInt(account.lifetime_points) || 0,
      lifetimeValue: parseFloat(account.lifetime_value) || 0,
      createdAt: account.created_at,
      updatedAt: account.updated_at,
    };
  }

  /**
   * Transform transaction from DB
   */
  private transformTransaction(transaction: any): any {
    return {
      id: transaction.id,
      type: transaction.type,
      points: parseInt(transaction.points) || 0,
      pointsBefore: parseInt(transaction.points_before) || 0,
      pointsAfter: parseInt(transaction.points_after) || 0,
      referenceType: transaction.reference_type,
      referenceId: transaction.reference_id,
      description: transaction.description,
      expiresAt: transaction.expires_at,
      createdAt: transaction.created_at,
    };
  }
}

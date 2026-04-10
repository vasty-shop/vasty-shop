import { Injectable, Logger, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { WalletService } from '../wallet/wallet.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { TransactionType } from '../wallet/dto/wallet.dto';
import {
  ReferralRewardType,
  ReferralStatus,
  ReferralTrigger,
  UpdateReferralConfigDto,
  GetReferralsDto,
} from './dto/referral.dto';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly walletService: WalletService,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  // ============================================
  // CONFIGURATION
  // ============================================

  /**
   * Get referral program configuration
   */
  async getConfig(): Promise<any> {
    const configs = await /* TODO: replace client call */ this.db.client.query
      .from('referral_config')
      .select('*')
      .limit(1)
      .get();

    if (!configs || configs.length === 0) {
      // Return default config
      return this.getDefaultConfig();
    }

    return this.transformConfig(configs[0]);
  }

  /**
   * Update referral program configuration (Admin)
   */
  async updateConfig(dto: UpdateReferralConfigDto): Promise<any> {
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('referral_config')
      .select('id')
      .limit(1)
      .get();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.isEnabled !== undefined) updateData.is_active = dto.isEnabled;
    if (dto.referrerRewardType !== undefined) updateData.referrer_reward_type = dto.referrerRewardType;
    if (dto.referrerRewardValue !== undefined) updateData.referrer_reward_value = dto.referrerRewardValue;
    if (dto.referrerMaxReward !== undefined) updateData.referrer_max_reward = dto.referrerMaxReward;
    if (dto.refereeRewardType !== undefined) updateData.referee_reward_type = dto.refereeRewardType;
    if (dto.refereeRewardValue !== undefined) updateData.referee_reward_value = dto.refereeRewardValue;
    if (dto.refereeMaxReward !== undefined) updateData.referee_max_reward = dto.refereeMaxReward;
    if (dto.rewardTrigger !== undefined) updateData.reward_trigger = dto.rewardTrigger;
    if (dto.minOrderAmount !== undefined) updateData.min_order_amount = dto.minOrderAmount;
    if (dto.expiryDays !== undefined) updateData.expiry_days = dto.expiryDays;
    if (dto.maxReferralsPerUser !== undefined) updateData.max_referrals_per_user = dto.maxReferralsPerUser;
    if (dto.allowSelfReferral !== undefined) updateData.allow_self_referral = dto.allowSelfReferral;
    if (dto.requireEmailVerification !== undefined) updateData.require_email_verification = dto.requireEmailVerification;
    if (dto.codePrefix !== undefined) updateData.code_prefix = dto.codePrefix;
    if (dto.codeLength !== undefined) updateData.code_length = dto.codeLength;

    if (existing && existing.length > 0) {
      await /* TODO: replace client call */ this.db.client.query
        .from('referral_config')
        .where('id', existing[0].id)
        .update(updateData)
        .execute();
    } else {
      // Create new config
      await /* TODO: replace client call */ this.db.client.query
        .from('referral_config')
        .insert({
          ...this.getDefaultConfigData(),
          ...updateData,
          created_at: new Date().toISOString(),
        })
        .execute();
    }

    return this.getConfig();
  }

  // ============================================
  // REFERRAL CODE MANAGEMENT
  // ============================================

  /**
   * Get or create user's referral code
   */
  async getUserReferralCode(userId: string): Promise<any> {
    // Check if user has existing code
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('referral_codes')
      .select('*')
      .where('user_id', userId)
      .where('is_active', true)
      .get();

    if (existing && existing.length > 0) {
      return this.transformCode(existing[0]);
    }

    // Generate new code
    return this.createReferralCode(userId);
  }

  /**
   * Create a referral code for user
   */
  async createReferralCode(userId: string, customCode?: string): Promise<any> {
    const config = await this.getConfig();

    // Check max referrals limit
    if (config.maxReferralsPerUser > 0) {
      const existingCodes = await /* TODO: replace client call */ this.db.client.query
        .from('referral_codes')
        .select('id')
        .where('user_id', userId)
        .get();

      if (existingCodes && existingCodes.length >= config.maxReferralsPerUser) {
        throw new BadRequestException('Maximum referral codes limit reached');
      }
    }

    let code: string;
    if (customCode) {
      // Validate custom code
      if (!/^[A-Za-z0-9]{4,16}$/.test(customCode)) {
        throw new BadRequestException('Custom code must be 4-16 alphanumeric characters');
      }

      // Check uniqueness
      const exists = await /* TODO: replace client call */ this.db.client.query
        .from('referral_codes')
        .select('id')
        .where('code', customCode.toUpperCase())
        .get();

      if (exists && exists.length > 0) {
        throw new ConflictException('This referral code is already taken');
      }

      code = customCode.toUpperCase();
    } else {
      code = await this.generateUniqueCode(config.codePrefix, config.codeLength);
    }

    const result = await /* TODO: replace client call */ this.db.client.query
      .from('referral_codes')
      .insert({
        user_id: userId,
        code,
        is_custom: !!customCode,
        usage_count: 0,
        max_usages: null,
        is_active: true,
        expires_at: config.expiryDays > 0
          ? this.addDays(new Date(), config.expiryDays).toISOString()
          : null,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformCode(result[0]);
  }

  /**
   * Validate and apply referral code (for new users)
   */
  async applyReferralCode(refereeId: string, code: string): Promise<any> {
    const config = await this.getConfig();

    if (!config.isEnabled) {
      throw new BadRequestException('Referral program is currently disabled');
    }

    // Find the code
    const codes = await /* TODO: replace client call */ this.db.client.query
      .from('referral_codes')
      .select('*')
      .where('code', code.toUpperCase())
      .where('is_active', true)
      .get();

    if (!codes || codes.length === 0) {
      throw new NotFoundException('Invalid referral code');
    }

    const referralCode = codes[0];

    // Check if code has expired
    if (referralCode.expires_at && new Date(referralCode.expires_at) < new Date()) {
      throw new BadRequestException('This referral code has expired');
    }

    // Check if code has reached max usages
    if (referralCode.max_usages && referralCode.usage_count >= referralCode.max_usages) {
      throw new BadRequestException('This referral code has reached its usage limit');
    }

    // Check self-referral
    if (!config.allowSelfReferral && referralCode.user_id === refereeId) {
      throw new BadRequestException('You cannot use your own referral code');
    }

    // Check if user already used a referral code
    const existingReferral = await /* TODO: replace client call */ this.db.client.query
      .from('referrals')
      .select('id')
      .where('referee_id', refereeId)
      .get();

    if (existingReferral && existingReferral.length > 0) {
      throw new BadRequestException('You have already used a referral code');
    }

    // Create referral record
    const referral = await /* TODO: replace client call */ this.db.client.query
      .from('referrals')
      .insert({
        referrer_id: referralCode.user_id,
        referee_id: refereeId,
        code_id: referralCode.id,
        status: ReferralStatus.PENDING,
        referrer_reward_type: config.referrerRewardType,
        referrer_reward_value: config.referrerRewardValue,
        referee_reward_type: config.refereeRewardType,
        referee_reward_value: config.refereeRewardValue,
        expires_at: config.expiryDays > 0
          ? this.addDays(new Date(), config.expiryDays).toISOString()
          : null,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    // Increment usage count
    await /* TODO: replace client call */ this.db.client.query
      .from('referral_codes')
      .where('id', referralCode.id)
      .update({
        usage_count: referralCode.usage_count + 1,
      })
      .execute();

    // If trigger is registration, process rewards immediately
    if (config.rewardTrigger === ReferralTrigger.REGISTRATION) {
      await this.processReferralRewards(referral[0].id);
    }

    return {
      success: true,
      message: config.rewardTrigger === ReferralTrigger.REGISTRATION
        ? 'Referral applied! Rewards have been credited.'
        : `Referral applied! Complete ${config.rewardTrigger === ReferralTrigger.FIRST_ORDER ? 'your first order' : 'a qualifying order'} to earn rewards.`,
      referral: this.transformReferral(referral[0]),
    };
  }

  /**
   * Process referral when order is completed
   */
  async processOrderReferral(userId: string, orderId: string, orderAmount: number): Promise<void> {
    const config = await this.getConfig();

    if (!config.isEnabled) return;

    // Find pending referral for this user
    const referrals = await /* TODO: replace client call */ this.db.client.query
      .from('referrals')
      .select('*')
      .where('referee_id', userId)
      .where('status', ReferralStatus.PENDING)
      .get();

    if (!referrals || referrals.length === 0) return;

    const referral = referrals[0];

    // Check expiry
    if (referral.expires_at && new Date(referral.expires_at) < new Date()) {
      await this.updateReferralStatus(referral.id, ReferralStatus.EXPIRED);
      return;
    }

    // Check trigger conditions
    let shouldProcess = false;

    if (config.rewardTrigger === ReferralTrigger.FIRST_ORDER) {
      // Check if this is user's first completed order
      const orderCount = await /* TODO: replace client call */ this.db.client.query
        .from('orders')
        .select('id')
        .where('user_id', userId)
        .where('status', 'delivered')
        .get();

      shouldProcess = !orderCount || orderCount.length <= 1;
    } else if (config.rewardTrigger === ReferralTrigger.ORDER_COMPLETED) {
      shouldProcess = true;
    } else if (config.rewardTrigger === ReferralTrigger.MINIMUM_SPEND) {
      shouldProcess = orderAmount >= config.minOrderAmount;
    }

    if (shouldProcess) {
      // Update referral with qualifying order
      await /* TODO: replace client call */ this.db.client.query
        .from('referrals')
        .where('id', referral.id)
        .update({
          status: ReferralStatus.QUALIFIED,
          qualifying_order_id: orderId,
          qualifying_order_amount: orderAmount,
          qualified_at: new Date().toISOString(),
        })
        .execute();

      // Process rewards
      await this.processReferralRewards(referral.id);
    }
  }

  /**
   * Process and distribute referral rewards
   */
  async processReferralRewards(referralId: string): Promise<void> {
    const referrals = await /* TODO: replace client call */ this.db.client.query
      .from('referrals')
      .select('*')
      .where('id', referralId)
      .get();

    if (!referrals || referrals.length === 0) return;

    const referral = referrals[0];
    const config = await this.getConfig();

    let referrerRewardAmount = 0;
    let refereeRewardAmount = 0;

    // Calculate and distribute referrer reward
    if (referral.referrer_reward_type && referral.referrer_reward_value > 0) {
      referrerRewardAmount = this.calculateReward(
        referral.referrer_reward_type,
        referral.referrer_reward_value,
        referral.qualifying_order_amount || 0,
        config.referrerMaxReward,
      );

      if (referrerRewardAmount > 0) {
        await this.distributeReward(
          referral.referrer_id,
          referral.referrer_reward_type,
          referrerRewardAmount,
          `Referral reward for inviting a friend`,
          referralId,
        );
      }
    }

    // Calculate and distribute referee reward
    if (referral.referee_reward_type && referral.referee_reward_value > 0) {
      refereeRewardAmount = this.calculateReward(
        referral.referee_reward_type,
        referral.referee_reward_value,
        referral.qualifying_order_amount || 0,
        config.refereeMaxReward,
      );

      if (refereeRewardAmount > 0) {
        await this.distributeReward(
          referral.referee_id,
          referral.referee_reward_type,
          refereeRewardAmount,
          `Welcome reward from referral`,
          referralId,
        );
      }
    }

    // Update referral as rewarded
    await /* TODO: replace client call */ this.db.client.query
      .from('referrals')
      .where('id', referralId)
      .update({
        status: ReferralStatus.REWARDED,
        referrer_reward_amount: referrerRewardAmount,
        referee_reward_amount: refereeRewardAmount,
        rewarded_at: new Date().toISOString(),
      })
      .execute();

    this.logger.log(`Referral ${referralId} rewards processed: Referrer=$${referrerRewardAmount}, Referee=$${refereeRewardAmount}`);
  }

  // ============================================
  // USER QUERIES
  // ============================================

  /**
   * Get user's referral stats
   */
  async getUserReferralStats(userId: string): Promise<any> {
    const code = await this.getUserReferralCode(userId);

    const referrals = await /* TODO: replace client call */ this.db.client.query
      .from('referrals')
      .select('*')
      .where('referrer_id', userId)
      .get();

    const all = referrals || [];

    const pending = all.filter((r: any) => r.status === ReferralStatus.PENDING);
    const qualified = all.filter((r: any) => r.status === ReferralStatus.QUALIFIED);
    const rewarded = all.filter((r: any) => r.status === ReferralStatus.REWARDED);

    const totalEarned = rewarded.reduce(
      (sum: number, r: any) => sum + (parseFloat(r.referrer_reward_amount) || 0),
      0,
    );

    const pendingEarnings = [...pending, ...qualified].reduce(
      (sum: number, r: any) => sum + (parseFloat(r.referrer_reward_value) || 0),
      0,
    );

    return {
      totalReferrals: all.length,
      pendingReferrals: pending.length,
      qualifiedReferrals: qualified.length,
      rewardedReferrals: rewarded.length,
      totalEarned,
      pendingEarnings,
      referralCode: code.code,
    };
  }

  /**
   * Get user's referrals list
   */
  async getUserReferrals(userId: string, dto: GetReferralsDto): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('referrals')
      .select('*')
      .where('referrer_id', userId);

    if (dto.status) {
      query = query.where('status', dto.status);
    }

    if (dto.startDate) {
      query = query.where('created_at', '>=', dto.startDate);
    }

    if (dto.endDate) {
      query = query.where('created_at', '<=', dto.endDate);
    }

    const referrals = await query
      .orderBy('created_at', 'DESC')
      .limit(dto.limit || 20)
      .offset(dto.offset || 0)
      .get();

    return (referrals || []).map(this.transformReferral);
  }

  /**
   * Get user's referral code info
   */
  async getReferralCodeInfo(code: string): Promise<any> {
    const config = await this.getConfig();

    const codes = await /* TODO: replace client call */ this.db.client.query
      .from('referral_codes')
      .select('*')
      .where('code', code.toUpperCase())
      .where('is_active', true)
      .get();

    if (!codes || codes.length === 0) {
      throw new NotFoundException('Invalid referral code');
    }

    const referralCode = codes[0];

    // Check validity
    const isExpired = referralCode.expires_at && new Date(referralCode.expires_at) < new Date();
    const isMaxedOut = referralCode.max_usages && referralCode.usage_count >= referralCode.max_usages;

    return {
      code: referralCode.code,
      isValid: !isExpired && !isMaxedOut && config.isEnabled,
      isExpired,
      isMaxedOut,
      refereeRewardType: config.refereeRewardType,
      refereeRewardValue: config.refereeRewardValue,
      rewardDescription: this.getRewardDescription(config.refereeRewardType, config.refereeRewardValue),
    };
  }

  // ============================================
  // ADMIN
  // ============================================

  /**
   * Get all referrals (Admin)
   */
  async getAllReferrals(dto: GetReferralsDto): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('referrals')
      .select('*');

    if (dto.status) {
      query = query.where('status', dto.status);
    }

    if (dto.startDate) {
      query = query.where('created_at', '>=', dto.startDate);
    }

    if (dto.endDate) {
      query = query.where('created_at', '<=', dto.endDate);
    }

    const referrals = await query
      .orderBy('created_at', 'DESC')
      .limit(dto.limit || 50)
      .offset(dto.offset || 0)
      .get();

    return (referrals || []).map(this.transformReferral);
  }

  /**
   * Get referral program stats (Admin)
   */
  async getProgramStats(): Promise<any> {
    const referrals = await /* TODO: replace client call */ this.db.client.query
      .from('referrals')
      .select('*')
      .get();

    const all = referrals || [];
    const rewarded = all.filter((r: any) => r.status === ReferralStatus.REWARDED);

    const totalReferrerRewards = rewarded.reduce(
      (sum: number, r: any) => sum + (parseFloat(r.referrer_reward_amount) || 0),
      0,
    );

    const totalRefereeRewards = rewarded.reduce(
      (sum: number, r: any) => sum + (parseFloat(r.referee_reward_amount) || 0),
      0,
    );

    // Get unique referrers
    const uniqueReferrers = new Set(all.map((r: any) => r.referrer_id)).size;

    return {
      totalReferrals: all.length,
      pendingReferrals: all.filter((r: any) => r.status === ReferralStatus.PENDING).length,
      qualifiedReferrals: all.filter((r: any) => r.status === ReferralStatus.QUALIFIED).length,
      rewardedReferrals: rewarded.length,
      expiredReferrals: all.filter((r: any) => r.status === ReferralStatus.EXPIRED).length,
      cancelledReferrals: all.filter((r: any) => r.status === ReferralStatus.CANCELLED).length,
      conversionRate: all.length > 0 ? (rewarded.length / all.length * 100).toFixed(2) : 0,
      totalRewardsDistributed: totalReferrerRewards + totalRefereeRewards,
      totalReferrerRewards,
      totalRefereeRewards,
      uniqueReferrers,
      averageRewardPerReferral: rewarded.length > 0
        ? ((totalReferrerRewards + totalRefereeRewards) / rewarded.length).toFixed(2)
        : 0,
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private async generateUniqueCode(prefix: string, length: number): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      let code = prefix || '';
      const remainingLength = length - code.length;

      for (let i = 0; i < remainingLength; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      // Check uniqueness
      const exists = await /* TODO: replace client call */ this.db.client.query
        .from('referral_codes')
        .select('id')
        .where('code', code)
        .get();

      if (!exists || exists.length === 0) {
        return code;
      }

      attempts++;
    }

    throw new Error('Failed to generate unique referral code');
  }

  private calculateReward(
    type: ReferralRewardType,
    value: number,
    orderAmount: number,
    maxReward: number | null,
  ): number {
    let reward: number;

    if (type === ReferralRewardType.PERCENTAGE) {
      reward = orderAmount * (value / 100);
    } else {
      reward = value;
    }

    if (maxReward && reward > maxReward) {
      reward = maxReward;
    }

    return Math.round(reward * 100) / 100; // Round to 2 decimal places
  }

  private async distributeReward(
    userId: string,
    type: ReferralRewardType,
    amount: number,
    description: string,
    referralId: string,
  ): Promise<void> {
    if (type === ReferralRewardType.POINTS) {
      // Add loyalty points
      await this.loyaltyService.awardBonusPoints(
        userId,
        Math.round(amount),
        description,
        'referral',
        referralId,
      );
    } else {
      // Add to wallet
      await this.walletService.creditWallet(
        userId,
        amount,
        TransactionType.REFERRAL,
        'referral',
        referralId,
        description,
      );
    }
  }

  private async updateReferralStatus(referralId: string, status: ReferralStatus): Promise<void> {
    await /* TODO: replace client call */ this.db.client.query
      .from('referrals')
      .where('id', referralId)
      .update({ status })
      .execute();
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private getRewardDescription(type: ReferralRewardType, value: number): string {
    switch (type) {
      case ReferralRewardType.FIXED:
        return `$${value} wallet credit`;
      case ReferralRewardType.PERCENTAGE:
        return `${value}% of order value`;
      case ReferralRewardType.POINTS:
        return `${value} loyalty points`;
      default:
        return '';
    }
  }

  private getDefaultConfig(): any {
    return {
      isEnabled: true,
      referrerRewardType: ReferralRewardType.FIXED,
      referrerRewardValue: 10,
      referrerMaxReward: null,
      refereeRewardType: ReferralRewardType.FIXED,
      refereeRewardValue: 5,
      refereeMaxReward: null,
      rewardTrigger: ReferralTrigger.FIRST_ORDER,
      minOrderAmount: 0,
      expiryDays: 30,
      maxReferralsPerUser: 0,
      allowSelfReferral: false,
      requireEmailVerification: true,
      codePrefix: '',
      codeLength: 8,
    };
  }

  private getDefaultConfigData(): any {
    return {
      is_active: true,
      referrer_reward_type: ReferralRewardType.FIXED,
      referrer_reward_value: 10,
      referrer_max_reward: null,
      referee_reward_type: ReferralRewardType.FIXED,
      referee_reward_value: 5,
      referee_max_reward: null,
      reward_trigger: ReferralTrigger.FIRST_ORDER,
      min_order_amount: 0,
      expiry_days: 30,
      max_referrals_per_user: 0,
      allow_self_referral: false,
      require_email_verification: true,
      code_prefix: '',
      code_length: 8,
    };
  }

  private transformConfig(config: any): any {
    return {
      isEnabled: config.is_active,
      referrerRewardType: config.referrer_reward_type,
      referrerRewardValue: parseFloat(config.referrer_reward_value) || 0,
      referrerMaxReward: config.referrer_max_reward ? parseFloat(config.referrer_max_reward) : null,
      refereeRewardType: config.referee_reward_type,
      refereeRewardValue: parseFloat(config.referee_reward_value) || 0,
      refereeMaxReward: config.referee_max_reward ? parseFloat(config.referee_max_reward) : null,
      rewardTrigger: config.reward_trigger,
      minOrderAmount: parseFloat(config.min_order_amount) || 0,
      expiryDays: config.expiry_days || 30,
      maxReferralsPerUser: config.max_referrals_per_user || 0,
      allowSelfReferral: config.allow_self_referral,
      requireEmailVerification: config.require_email_verification,
      codePrefix: config.code_prefix || '',
      codeLength: config.code_length || 8,
    };
  }

  private transformCode(code: any): any {
    return {
      id: code.id,
      code: code.code,
      isCustom: code.is_custom,
      usageCount: code.usage_count || 0,
      maxUsages: code.max_usages,
      isActive: code.is_active,
      createdAt: code.created_at,
      expiresAt: code.expires_at,
    };
  }

  private transformReferral(referral: any): any {
    return {
      id: referral.id,
      referrerId: referral.referrer_id,
      refereeId: referral.referee_id,
      codeId: referral.code_id,
      status: referral.status,
      referrerRewardType: referral.referrer_reward_type,
      referrerRewardValue: parseFloat(referral.referrer_reward_value) || 0,
      referrerRewardAmount: referral.referrer_reward_amount ? parseFloat(referral.referrer_reward_amount) : null,
      refereeRewardType: referral.referee_reward_type,
      refereeRewardValue: parseFloat(referral.referee_reward_value) || 0,
      refereeRewardAmount: referral.referee_reward_amount ? parseFloat(referral.referee_reward_amount) : null,
      qualifyingOrderId: referral.qualifying_order_id,
      qualifyingOrderAmount: referral.qualifying_order_amount ? parseFloat(referral.qualifying_order_amount) : null,
      expiresAt: referral.expires_at,
      qualifiedAt: referral.qualified_at,
      rewardedAt: referral.rewarded_at,
      createdAt: referral.created_at,
    };
  }
}

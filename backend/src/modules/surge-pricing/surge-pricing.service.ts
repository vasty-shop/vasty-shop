import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateSurgeRuleDto,
  UpdateSurgeRuleDto,
  ConfigureDemandSurgeDto,
  CalculateSurgeDto,
  GetSurgeRulesDto,
  SurgeType,
  SurgeAppliesTo,
  DayOfWeek,
} from './dto/surge-pricing.dto';

@Injectable()
export class SurgePricingService {
  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // SURGE RULE CRUD
  // ============================================

  async createSurgeRule(dto: CreateSurgeRuleDto) {
    const result = await /* TODO: replace client call */ this.db.client.query
      .from('surge_rules')
      .insert({
        name: dto.name,
        description: dto.description || null,
        type: dto.type,
        applies_to: dto.appliesTo,
        multiplier: dto.multiplier,
        fixed_amount: dto.fixedAmount || null,
        max_surge_amount: dto.maxSurgeAmount || null,
        time_windows: dto.timeWindows ? JSON.stringify(dto.timeWindows) : null,
        zone_ids: dto.zoneIds ? JSON.stringify(dto.zoneIds) : null,
        shop_ids: dto.shopIds ? JSON.stringify(dto.shopIds) : null,
        category_ids: dto.categoryIds ? JSON.stringify(dto.categoryIds) : null,
        product_ids: dto.productIds ? JSON.stringify(dto.productIds) : null,
        start_date: dto.startDate || null,
        end_date: dto.endDate || null,
        priority: dto.priority || 0,
        is_active: dto.isActive !== false,
      })
      .returning('*')
      .execute();

    return {
      data: this.transformRule(result[0]),
      message: 'Surge rule created successfully',
    };
  }

  async getSurgeRules(query: GetSurgeRulesDto) {
    let builder = /* TODO: replace client call */ this.db.client.query
      .from('surge_rules')
      .select('*');

    if (query.type) {
      builder = builder.where('type', query.type);
    }

    if (query.appliesTo) {
      builder = builder.where('applies_to', query.appliesTo);
    }

    if (query.activeOnly) {
      builder = builder.where('is_active', true);
    }

    if (query.shopId) {
      // Check if shopId is in the JSON array or if shop_ids is null (platform-wide)
      builder = builder.where('shop_ids', 'IS', null);
    }

    const rules = await builder
      .orderBy('priority', 'DESC')
      .orderBy('created_at', 'DESC')
      .limit(query.limit || 50)
      .offset(query.offset || 0)
      .get();

    return {
      data: rules.map((rule: any) => this.transformRule(rule)),
      total: rules.length,
    };
  }

  async getSurgeRule(id: string) {
    const rules = await /* TODO: replace client call */ this.db.client.query
      .from('surge_rules')
      .select('*')
      .where('id', id)
      .get();

    if (!rules.length) {
      throw new NotFoundException('Surge rule not found');
    }

    return { data: this.transformRule(rules[0]) };
  }

  async updateSurgeRule(id: string, dto: UpdateSurgeRuleDto) {
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.multiplier !== undefined) updateData.multiplier = dto.multiplier;
    if (dto.fixedAmount !== undefined) updateData.fixed_amount = dto.fixedAmount;
    if (dto.maxSurgeAmount !== undefined) updateData.max_surge_amount = dto.maxSurgeAmount;
    if (dto.timeWindows !== undefined) updateData.time_windows = JSON.stringify(dto.timeWindows);
    if (dto.zoneIds !== undefined) updateData.zone_ids = JSON.stringify(dto.zoneIds);
    if (dto.shopIds !== undefined) updateData.shop_ids = JSON.stringify(dto.shopIds);
    if (dto.startDate !== undefined) updateData.start_date = dto.startDate;
    if (dto.endDate !== undefined) updateData.end_date = dto.endDate;
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const result = await /* TODO: replace client call */ this.db.client.query
      .from('surge_rules')
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute() as unknown as any[];

    if (!result.length) {
      throw new NotFoundException('Surge rule not found');
    }

    return {
      data: this.transformRule(result[0]),
      message: 'Surge rule updated successfully',
    };
  }

  async deleteSurgeRule(id: string) {
    const result = await /* TODO: replace client call */ this.db.client.query
      .from('surge_rules')
      .where('id', id)
      .delete()
      .execute();

    return { message: 'Surge rule deleted successfully' };
  }

  async toggleSurgeRule(id: string) {
    const rules = await /* TODO: replace client call */ this.db.client.query
      .from('surge_rules')
      .select('is_active')
      .where('id', id)
      .get();

    if (!rules.length) {
      throw new NotFoundException('Surge rule not found');
    }

    const result = await /* TODO: replace client call */ this.db.client.query
      .from('surge_rules')
      .where('id', id)
      .update({
        is_active: !rules[0].is_active,
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return {
      data: this.transformRule(result[0]),
      message: `Surge rule ${result[0].is_active ? 'activated' : 'deactivated'}`,
    };
  }

  // ============================================
  // DEMAND-BASED SURGE CONFIGURATION
  // ============================================

  async configureDemandSurge(dto: ConfigureDemandSurgeDto) {
    const configKey = dto.shopId
      ? `demand_surge_shop_${dto.shopId}`
      : dto.zoneId
        ? `demand_surge_zone_${dto.zoneId}`
        : 'demand_surge_platform';

    const config = {
      shopId: dto.shopId || null,
      zoneId: dto.zoneId || null,
      thresholds: [
        { orders: dto.threshold1, multiplier: dto.multiplier1 },
        dto.threshold2 ? { orders: dto.threshold2, multiplier: dto.multiplier2 } : null,
        dto.threshold3 ? { orders: dto.threshold3, multiplier: dto.multiplier3 } : null,
      ].filter(Boolean),
      timeWindowMinutes: dto.timeWindowMinutes || 30,
    };

    // Store in surge_demand_config table
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('surge_demand_config')
      .select('id')
      .where('config_key', configKey)
      .get();

    if (existing.length) {
      await /* TODO: replace client call */ this.db.client.query
        .from('surge_demand_config')
        .where('config_key', configKey)
        .update({
          config: JSON.stringify(config),
          updated_at: new Date().toISOString(),
        })
        .execute();
    } else {
      await /* TODO: replace client call */ this.db.client.query
        .from('surge_demand_config')
        .insert({
          config_key: configKey,
          shop_id: dto.shopId || null,
          zone_id: dto.zoneId || null,
          config: JSON.stringify(config),
        })
        .execute();
    }

    return {
      data: config,
      message: 'Demand surge configuration saved',
    };
  }

  async getDemandSurgeConfig(shopId?: string, zoneId?: string) {
    const configKey = shopId
      ? `demand_surge_shop_${shopId}`
      : zoneId
        ? `demand_surge_zone_${zoneId}`
        : 'demand_surge_platform';

    const configs = await /* TODO: replace client call */ this.db.client.query
      .from('surge_demand_config')
      .select('*')
      .where('config_key', configKey)
      .get();

    if (!configs.length) {
      return {
        data: {
          shopId: shopId || null,
          zoneId: zoneId || null,
          thresholds: [],
          timeWindowMinutes: 30,
        },
      };
    }

    const config = typeof configs[0].config === 'string'
      ? JSON.parse(configs[0].config)
      : configs[0].config;

    return { data: config };
  }

  // ============================================
  // SURGE CALCULATION
  // ============================================

  async calculateSurge(dto: CalculateSurgeDto) {
    const checkTime = dto.datetime ? new Date(dto.datetime) : new Date();
    const appliedRules: { id: string; name: string; type: string; multiplier: number }[] = [];
    let totalMultiplier = 1;

    // Get all active rules that could apply
    let builder = /* TODO: replace client call */ this.db.client.query
      .from('surge_rules')
      .select('*')
      .where('is_active', true);

    const rules = await builder
      .orderBy('priority', 'DESC')
      .get();

    for (const rule of rules) {
      const applies = await this.checkRuleApplies(rule, dto, checkTime);
      if (applies) {
        appliedRules.push({
          id: rule.id,
          name: rule.name,
          type: rule.type,
          multiplier: rule.multiplier,
        });
        totalMultiplier *= rule.multiplier;
      }
    }

    // Check demand-based surge
    const demandMultiplier = await this.calculateDemandSurge(dto.shopId, dto.zoneId);
    if (demandMultiplier > 1) {
      appliedRules.push({
        id: 'demand',
        name: 'Demand Surge',
        type: SurgeType.DEMAND_BASED,
        multiplier: demandMultiplier,
      });
      totalMultiplier *= demandMultiplier;
    }

    // Calculate final amounts
    let surgeAmount = dto.baseAmount * (totalMultiplier - 1);

    // Apply max surge cap if any rule has it
    const maxCap = Math.min(
      ...rules
        .filter((r: any) => r.max_surge_amount && appliedRules.find(ar => ar.id === r.id))
        .map((r: any) => r.max_surge_amount)
        .concat([Infinity])
    );

    if (surgeAmount > maxCap) {
      surgeAmount = maxCap;
    }

    const finalAmount = dto.baseAmount + surgeAmount;

    return {
      data: {
        baseAmount: dto.baseAmount,
        surgeMultiplier: totalMultiplier,
        surgeAmount: Math.round(surgeAmount * 100) / 100,
        finalAmount: Math.round(finalAmount * 100) / 100,
        appliedRules,
        surgeActive: totalMultiplier > 1,
        message: totalMultiplier > 1
          ? `${Math.round((totalMultiplier - 1) * 100)}% surge pricing applied`
          : 'No surge pricing active',
      },
    };
  }

  private async checkRuleApplies(
    rule: any,
    dto: CalculateSurgeDto,
    checkTime: Date
  ): Promise<boolean> {
    // Check applies_to type match
    if (rule.applies_to !== SurgeAppliesTo.ALL && rule.applies_to !== dto.type) {
      return false;
    }

    // Check shop scope
    if (rule.shop_ids) {
      const shopIds = typeof rule.shop_ids === 'string' ? JSON.parse(rule.shop_ids) : rule.shop_ids;
      if (dto.shopId && !shopIds.includes(dto.shopId)) {
        return false;
      }
    }

    // Check zone scope
    if (rule.zone_ids) {
      const zoneIds = typeof rule.zone_ids === 'string' ? JSON.parse(rule.zone_ids) : rule.zone_ids;
      if (dto.zoneId && !zoneIds.includes(dto.zoneId)) {
        return false;
      }
    }

    // Check category scope
    if (rule.category_ids) {
      const categoryIds = typeof rule.category_ids === 'string' ? JSON.parse(rule.category_ids) : rule.category_ids;
      if (dto.categoryId && !categoryIds.includes(dto.categoryId)) {
        return false;
      }
    }

    // Check product scope
    if (rule.product_ids) {
      const productIds = typeof rule.product_ids === 'string' ? JSON.parse(rule.product_ids) : rule.product_ids;
      if (dto.productId && !productIds.includes(dto.productId)) {
        return false;
      }
    }

    // Check date range for event-based
    if (rule.type === SurgeType.EVENT_BASED) {
      if (rule.start_date && checkTime < new Date(rule.start_date)) {
        return false;
      }
      if (rule.end_date && checkTime > new Date(rule.end_date)) {
        return false;
      }
    }

    // Check time windows for time-based
    if (rule.type === SurgeType.TIME_BASED && rule.time_windows) {
      const timeWindows = typeof rule.time_windows === 'string'
        ? JSON.parse(rule.time_windows)
        : rule.time_windows;

      const dayOfWeek = checkTime.getDay();
      const timeStr = `${checkTime.getHours().toString().padStart(2, '0')}:${checkTime.getMinutes().toString().padStart(2, '0')}`;

      const inTimeWindow = timeWindows.some((window: any) => {
        if (!window.days.includes(dayOfWeek)) return false;
        return timeStr >= window.startTime && timeStr <= window.endTime;
      });

      if (!inTimeWindow) return false;
    }

    return true;
  }

  private async calculateDemandSurge(shopId?: string, zoneId?: string): Promise<number> {
    // Get demand config
    const configKey = shopId
      ? `demand_surge_shop_${shopId}`
      : zoneId
        ? `demand_surge_zone_${zoneId}`
        : 'demand_surge_platform';

    const configs = await /* TODO: replace client call */ this.db.client.query
      .from('surge_demand_config')
      .select('config')
      .where('config_key', configKey)
      .get();

    if (!configs.length) return 1;

    const config = typeof configs[0].config === 'string'
      ? JSON.parse(configs[0].config)
      : configs[0].config;

    // Count orders in time window
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - (config.timeWindowMinutes || 30));

    let orderBuilder = /* TODO: replace client call */ this.db.client.query
      .from('orders')
      .select('id')
      .where('created_at', '>=', windowStart.toISOString());

    if (shopId) {
      orderBuilder = orderBuilder.where('shop_id', shopId);
    }

    const orders = await orderBuilder.get();
    const orderCount = orders.length;

    // Find applicable threshold
    const thresholds = config.thresholds || [];
    let multiplier = 1;

    for (const threshold of thresholds.sort((a: any, b: any) => b.orders - a.orders)) {
      if (orderCount >= threshold.orders) {
        multiplier = threshold.multiplier;
        break;
      }
    }

    return multiplier;
  }

  // ============================================
  // DEMAND LEVEL
  // ============================================

  async getCurrentDemandLevel(shopId?: string, zoneId?: string) {
    const configKey = shopId
      ? `demand_surge_shop_${shopId}`
      : zoneId
        ? `demand_surge_zone_${zoneId}`
        : 'demand_surge_platform';

    const configs = await /* TODO: replace client call */ this.db.client.query
      .from('surge_demand_config')
      .select('config')
      .where('config_key', configKey)
      .get();

    const config = configs.length
      ? (typeof configs[0].config === 'string' ? JSON.parse(configs[0].config) : configs[0].config)
      : { thresholds: [], timeWindowMinutes: 30 };

    // Count orders
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - (config.timeWindowMinutes || 30));

    let orderBuilder = /* TODO: replace client call */ this.db.client.query
      .from('orders')
      .select('id')
      .where('created_at', '>=', windowStart.toISOString());

    if (shopId) {
      orderBuilder = orderBuilder.where('shop_id', shopId);
    }

    const orders = await orderBuilder.get();
    const orderCount = orders.length;

    const thresholds = config.thresholds || [];
    let surgeLevel = 0;
    let currentMultiplier = 1;
    let nextThreshold: number | null = null;
    let nextMultiplier: number | null = null;

    const sortedThresholds = [...thresholds].sort((a: any, b: any) => a.orders - b.orders);

    for (let i = 0; i < sortedThresholds.length; i++) {
      if (orderCount >= sortedThresholds[i].orders) {
        surgeLevel = i + 1;
        currentMultiplier = sortedThresholds[i].multiplier;
        if (i < sortedThresholds.length - 1) {
          nextThreshold = sortedThresholds[i + 1].orders;
          nextMultiplier = sortedThresholds[i + 1].multiplier;
        }
      } else {
        nextThreshold = sortedThresholds[i].orders;
        nextMultiplier = sortedThresholds[i].multiplier;
        break;
      }
    }

    return {
      data: {
        currentOrderCount: orderCount,
        timeWindowMinutes: config.timeWindowMinutes || 30,
        surgeLevel,
        currentMultiplier,
        nextThreshold,
        nextMultiplier,
      },
    };
  }

  // ============================================
  // STATISTICS
  // ============================================

  async getSurgeStats(shopId?: string, startDate?: string, endDate?: string) {
    let rulesBuilder = /* TODO: replace client call */ this.db.client.query
      .from('surge_rules')
      .select('*');

    if (shopId) {
      // Platform-wide or shop-specific
      rulesBuilder = rulesBuilder.where('shop_ids', 'IS', null);
    }

    const rules = await rulesBuilder.get();

    const totalRules = rules.length;
    const activeRules = rules.filter((r: any) => r.is_active).length;
    const avgMultiplier = rules.length
      ? rules.reduce((sum: number, r: any) => sum + r.multiplier, 0) / rules.length
      : 1;

    // Count orders with surge
    const ordersWithSurge = await /* TODO: replace client call */ this.db.client.query
      .from('orders')
      .select('id', 'surge_amount')
      .where('surge_amount', '>', 0)
      .get();

    const totalSurgeRevenue = ordersWithSurge.reduce(
      (sum: number, o: any) => sum + (o.surge_amount || 0),
      0
    );

    // Group by type
    const surgeByType = Object.values(SurgeType).map(type => {
      const typeRules = rules.filter((r: any) => r.type === type);
      return {
        type,
        count: typeRules.length,
        avgMultiplier: typeRules.length
          ? typeRules.reduce((sum: number, r: any) => sum + r.multiplier, 0) / typeRules.length
          : 0,
      };
    });

    return {
      data: {
        totalRules,
        activeRules,
        averageMultiplier: Math.round(avgMultiplier * 100) / 100,
        totalSurgeRevenue: Math.round(totalSurgeRevenue * 100) / 100,
        orderCountWithSurge: ordersWithSurge.length,
        surgeByType,
      },
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private transformRule(rule: any) {
    return {
      id: rule.id,
      name: rule.name,
      description: rule.description,
      type: rule.type,
      appliesTo: rule.applies_to,
      multiplier: rule.multiplier,
      fixedAmount: rule.fixed_amount,
      maxSurgeAmount: rule.max_surge_amount,
      timeWindows: rule.time_windows
        ? (typeof rule.time_windows === 'string' ? JSON.parse(rule.time_windows) : rule.time_windows)
        : null,
      zoneIds: rule.zone_ids
        ? (typeof rule.zone_ids === 'string' ? JSON.parse(rule.zone_ids) : rule.zone_ids)
        : null,
      shopIds: rule.shop_ids
        ? (typeof rule.shop_ids === 'string' ? JSON.parse(rule.shop_ids) : rule.shop_ids)
        : null,
      categoryIds: rule.category_ids
        ? (typeof rule.category_ids === 'string' ? JSON.parse(rule.category_ids) : rule.category_ids)
        : null,
      productIds: rule.product_ids
        ? (typeof rule.product_ids === 'string' ? JSON.parse(rule.product_ids) : rule.product_ids)
        : null,
      startDate: rule.start_date,
      endDate: rule.end_date,
      priority: rule.priority,
      isActive: rule.is_active,
      createdAt: rule.created_at,
    };
  }
}

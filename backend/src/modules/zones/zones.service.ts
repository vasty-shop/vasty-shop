import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  ZoneType,
  DeliveryType,
  CreateZoneDto,
  UpdateZoneDto,
  CreateDeliveryOptionDto,
  UpdateDeliveryOptionDto,
  AssignZoneToShopDto,
  CheckDeliveryAvailabilityDto,
  CalculateDeliveryFeeDto,
  CoordinateDto,
} from './dto/zones.dto';

@Injectable()
export class ZonesService {
  private readonly logger = new Logger(ZonesService.name);

  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // ZONE MANAGEMENT
  // ============================================

  /**
   * Get all zones (optionally filtered by shopId)
   */
  async getZones(includeInactive = false, shopId?: string): Promise<any[]> {
    try {
      let query = /* TODO: replace client call */ this.db.client.query
        .from('delivery_zones')
        .select('*');

      if (!includeInactive) {
        query = query.where('is_active', true);
      }

      // Filter by shop_id if provided
      if (shopId) {
        query = query.where('shop_id', shopId);
      }

      const zones = await query.orderBy('sort_order', 'ASC').orderBy('name', 'ASC').get();
      return (zones || []).map(this.transformZone);
    } catch (error: any) {
      this.logger.error(`Failed to get zones: ${error.message}`);
      // Return empty array if table doesn't exist
      if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get zone by ID
   */
  async getZone(zoneId: string): Promise<any> {
    const zones = await /* TODO: replace client call */ this.db.client.query
      .from('delivery_zones')
      .select('*')
      .where('id', zoneId)
      .get();

    if (!zones || zones.length === 0) {
      throw new NotFoundException('Delivery zone not found');
    }

    return this.transformZone(zones[0]);
  }

  /**
   * Create zone
   */
  async createZone(dto: CreateZoneDto): Promise<any> {
    const zoneId = require('crypto').randomUUID();

    await /* TODO: replace client call */ this.db.client.query
      .from('delivery_zones')
      .insert({
        id: zoneId,
        shop_id: dto.shopId || null,
        name: dto.name,
        description: dto.description || null,
        type: dto.type,
        coordinates: dto.coordinates ? JSON.stringify(dto.coordinates) : null,
        center: dto.center ? JSON.stringify(dto.center) : null,
        radius: dto.radius || null,
        city: dto.city || null,
        postal_codes: dto.postalCodes ? JSON.stringify(dto.postalCodes) : null,
        country: dto.country || null,
        state: dto.state || null,
        is_active: dto.isActive !== false,
        sort_order: dto.sortOrder || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Fetch the created zone
    return this.getZone(zoneId);
  }

  /**
   * Update zone
   */
  async updateZone(zoneId: string, dto: UpdateZoneDto): Promise<any> {
    await this.getZone(zoneId);

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.coordinates !== undefined) updateData.coordinates = JSON.stringify(dto.coordinates);
    if (dto.center !== undefined) updateData.center = JSON.stringify(dto.center);
    if (dto.radius !== undefined) updateData.radius = dto.radius;
    if (dto.postalCodes !== undefined) updateData.postal_codes = JSON.stringify(dto.postalCodes);
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
    if (dto.sortOrder !== undefined) updateData.sort_order = dto.sortOrder;

    await /* TODO: replace client call */ this.db.client.query
      .from('delivery_zones')
      .where('id', zoneId)
      .update(updateData)
      .execute();

    return this.getZone(zoneId);
  }

  /**
   * Delete zone
   */
  async deleteZone(zoneId: string): Promise<void> {
    await this.getZone(zoneId);

    await /* TODO: replace client call */ this.db.client.query
      .from('delivery_zones')
      .where('id', zoneId)
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  // ============================================
  // DELIVERY OPTIONS
  // ============================================

  /**
   * Get delivery options for a zone
   */
  async getDeliveryOptions(zoneId: string, includeInactive = false): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('zone_delivery_options')
      .select('*')
      .where('zone_id', zoneId);

    if (!includeInactive) {
      query = query.where('is_active', true);
    }

    const options = await query.orderBy('delivery_type', 'ASC').get();
    return (options || []).map(this.transformDeliveryOption);
  }

  /**
   * Create delivery option
   */
  async createDeliveryOption(dto: CreateDeliveryOptionDto): Promise<any> {
    await this.getZone(dto.zoneId); // Verify zone exists

    const result = await /* TODO: replace client call */ this.db.client.query
      .from('zone_delivery_options')
      .insert({
        zone_id: dto.zoneId,
        delivery_type: dto.deliveryType,
        name: dto.name,
        description: dto.description || null,
        base_fee: dto.baseFee,
        per_km_fee: dto.perKmFee || null,
        free_delivery_minimum: dto.freeDeliveryMinimum || null,
        min_delivery_time: dto.minDeliveryTime || null,
        max_delivery_time: dto.maxDeliveryTime || null,
        is_active: dto.isActive !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformDeliveryOption(result[0]);
  }

  /**
   * Update delivery option
   */
  async updateDeliveryOption(optionId: string, dto: UpdateDeliveryOptionDto): Promise<any> {
    const options = await /* TODO: replace client call */ this.db.client.query
      .from('zone_delivery_options')
      .select('*')
      .where('id', optionId)
      .get();

    if (!options || options.length === 0) {
      throw new NotFoundException('Delivery option not found');
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.baseFee !== undefined) updateData.base_fee = dto.baseFee;
    if (dto.perKmFee !== undefined) updateData.per_km_fee = dto.perKmFee;
    if (dto.freeDeliveryMinimum !== undefined) updateData.free_delivery_minimum = dto.freeDeliveryMinimum;
    if (dto.minDeliveryTime !== undefined) updateData.min_delivery_time = dto.minDeliveryTime;
    if (dto.maxDeliveryTime !== undefined) updateData.max_delivery_time = dto.maxDeliveryTime;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    await /* TODO: replace client call */ this.db.client.query
      .from('zone_delivery_options')
      .where('id', optionId)
      .update(updateData)
      .execute();

    const updated = await /* TODO: replace client call */ this.db.client.query
      .from('zone_delivery_options')
      .select('*')
      .where('id', optionId)
      .get();

    return this.transformDeliveryOption(updated[0]);
  }

  /**
   * Delete delivery option
   */
  async deleteDeliveryOption(optionId: string): Promise<void> {
    await /* TODO: replace client call */ this.db.client.query
      .from('zone_delivery_options')
      .where('id', optionId)
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  // ============================================
  // SHOP ZONE ASSIGNMENTS
  // ============================================

  /**
   * Assign zone to shop
   */
  async assignZoneToShop(dto: AssignZoneToShopDto): Promise<any> {
    await this.getZone(dto.zoneId);

    // Check if already assigned
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('shop_zones')
      .select('id')
      .where('shop_id', dto.shopId)
      .where('zone_id', dto.zoneId)
      .get();

    if (existing && existing.length > 0) {
      // Update existing
      await /* TODO: replace client call */ this.db.client.query
        .from('shop_zones')
        .where('id', existing[0].id)
        .update({
          base_fee_override: dto.baseFeeOverride || null,
          min_delivery_time_override: dto.minDeliveryTimeOverride || null,
          max_delivery_time_override: dto.maxDeliveryTimeOverride || null,
          updated_at: new Date().toISOString(),
        })
        .execute();

      return this.getShopZone(dto.shopId, dto.zoneId);
    }

    const result = await /* TODO: replace client call */ this.db.client.query
      .from('shop_zones')
      .insert({
        shop_id: dto.shopId,
        zone_id: dto.zoneId,
        base_fee_override: dto.baseFeeOverride || null,
        min_delivery_time_override: dto.minDeliveryTimeOverride || null,
        max_delivery_time_override: dto.maxDeliveryTimeOverride || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformShopZone(result[0]);
  }

  /**
   * Get zones for shop
   */
  async getShopZones(shopId: string): Promise<any[]> {
    const shopZones = await /* TODO: replace client call */ this.db.client.query
      .from('shop_zones')
      .select('*')
      .where('shop_id', shopId)
      .where('is_active', true)
      .get();

    const results = await Promise.all(
      (shopZones || []).map(async (sz: any) => {
        const zone = await this.getZone(sz.zone_id);
        return {
          ...this.transformShopZone(sz),
          zone,
        };
      }),
    );

    return results;
  }

  /**
   * Get specific shop zone
   */
  async getShopZone(shopId: string, zoneId: string): Promise<any> {
    const shopZones = await /* TODO: replace client call */ this.db.client.query
      .from('shop_zones')
      .select('*')
      .where('shop_id', shopId)
      .where('zone_id', zoneId)
      .get();

    if (!shopZones || shopZones.length === 0) {
      return null;
    }

    const zone = await this.getZone(zoneId);
    return {
      ...this.transformShopZone(shopZones[0]),
      zone,
    };
  }

  /**
   * Remove zone from shop
   */
  async removeZoneFromShop(shopId: string, zoneId: string): Promise<void> {
    await /* TODO: replace client call */ this.db.client.query
      .from('shop_zones')
      .where('shop_id', shopId)
      .where('zone_id', zoneId)
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  // ============================================
  // DELIVERY AVAILABILITY & FEES
  // ============================================

  /**
   * Check delivery availability
   */
  async checkDeliveryAvailability(dto: CheckDeliveryAvailabilityDto): Promise<any> {
    const zones = await this.getZones();

    // Find matching zone
    let matchingZone: any = null;

    for (const zone of zones) {
      if (this.isLocationInZone(dto.location, dto.postalCode, zone)) {
        matchingZone = zone;
        break;
      }
    }

    if (!matchingZone) {
      return {
        available: false,
        zone: null,
        deliveryOptions: [],
        message: 'Delivery is not available in your area',
      };
    }

    // Get delivery options for zone
    let deliveryOptions = await this.getDeliveryOptions(matchingZone.id);

    // If shop specified, check shop zone and apply overrides
    if (dto.shopId) {
      const shopZone = await this.getShopZone(dto.shopId, matchingZone.id);
      if (!shopZone) {
        return {
          available: false,
          zone: matchingZone,
          deliveryOptions: [],
          message: 'This shop does not deliver to your area',
        };
      }

      // Apply shop overrides
      deliveryOptions = deliveryOptions.map((opt: any) => ({
        ...opt,
        baseFee: shopZone.baseFeeOverride ?? opt.baseFee,
        minDeliveryTime: shopZone.minDeliveryTimeOverride ?? opt.minDeliveryTime,
        maxDeliveryTime: shopZone.maxDeliveryTimeOverride ?? opt.maxDeliveryTime,
      }));
    }

    return {
      available: true,
      zone: matchingZone,
      deliveryOptions,
      message: 'Delivery available',
    };
  }

  /**
   * Calculate delivery fee
   */
  async calculateDeliveryFee(dto: CalculateDeliveryFeeDto): Promise<any> {
    const zone = await this.getZone(dto.zoneId);
    const options = await this.getDeliveryOptions(dto.zoneId);

    const option = options.find((o: any) => o.deliveryType === dto.deliveryType);
    if (!option) {
      throw new BadRequestException('Delivery option not available for this zone');
    }

    let baseFee = option.baseFee;
    let minTime = option.minDeliveryTime;
    let maxTime = option.maxDeliveryTime;

    // Apply shop overrides if specified
    if (dto.shopId) {
      const shopZone = await this.getShopZone(dto.shopId, dto.zoneId);
      if (shopZone) {
        baseFee = shopZone.baseFeeOverride ?? baseFee;
        minTime = shopZone.minDeliveryTimeOverride ?? minTime;
        maxTime = shopZone.maxDeliveryTimeOverride ?? maxTime;
      }
    }

    // Calculate distance fee
    let distanceFee = 0;
    if (option.perKmFee && dto.distance) {
      distanceFee = option.perKmFee * dto.distance;
    }

    // Check free delivery
    const freeDelivery = option.freeDeliveryMinimum
      ? dto.orderAmount >= option.freeDeliveryMinimum
      : false;

    const totalFee = freeDelivery ? 0 : baseFee + distanceFee;

    // Format estimated time
    let estimatedTime = '';
    if (minTime && maxTime) {
      estimatedTime = `${minTime}-${maxTime} min`;
    } else if (minTime) {
      estimatedTime = `From ${minTime} min`;
    } else if (maxTime) {
      estimatedTime = `Up to ${maxTime} min`;
    }

    return {
      baseFee,
      distanceFee: Math.round(distanceFee * 100) / 100,
      totalFee: Math.round(totalFee * 100) / 100,
      freeDelivery,
      freeDeliveryMinimum: option.freeDeliveryMinimum,
      estimatedTime,
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private isLocationInZone(location: CoordinateDto, postalCode: string | undefined, zone: any): boolean {
    switch (zone.type) {
      case ZoneType.POLYGON:
        return this.isPointInPolygon(location, zone.coordinates || []);

      case ZoneType.CIRCLE:
        if (!zone.center || !zone.radius) return false;
        const distance = this.calculateDistance(location, zone.center);
        return distance <= zone.radius;

      case ZoneType.CITY:
        // City matching would require geocoding
        // For now, return false (implement with Google Maps API)
        return false;

      case ZoneType.POSTAL_CODE:
        if (!postalCode || !zone.postalCodes) return false;
        return zone.postalCodes.includes(postalCode);

      default:
        return false;
    }
  }

  private isPointInPolygon(point: CoordinateDto, polygon: CoordinateDto[]): boolean {
    if (polygon.length < 3) return false;

    let inside = false;
    const x = point.lng;
    const y = point.lat;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng;
      const yi = polygon[i].lat;
      const xj = polygon[j].lng;
      const yj = polygon[j].lat;

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }

    return inside;
  }

  private calculateDistance(point1: CoordinateDto, point2: CoordinateDto): number {
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLon = this.toRad(point2.lng - point1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) *
        Math.cos(this.toRad(point2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private transformZone(zone: any): any {
    return {
      id: zone.id,
      shopId: zone.shop_id,
      name: zone.name,
      description: zone.description,
      type: zone.type,
      coordinates: zone.coordinates ? (typeof zone.coordinates === 'string' ? JSON.parse(zone.coordinates) : zone.coordinates) : null,
      center: zone.center ? (typeof zone.center === 'string' ? JSON.parse(zone.center) : zone.center) : null,
      radius: zone.radius,
      city: zone.city,
      postalCodes: zone.postal_codes ? (typeof zone.postal_codes === 'string' ? JSON.parse(zone.postal_codes) : zone.postal_codes) : null,
      country: zone.country,
      state: zone.state,
      isActive: zone.is_active,
      sortOrder: zone.sort_order || 0,
      createdAt: zone.created_at,
      updatedAt: zone.updated_at,
    };
  }

  private transformDeliveryOption(opt: any): any {
    return {
      id: opt.id,
      zoneId: opt.zone_id,
      deliveryType: opt.delivery_type,
      name: opt.name,
      description: opt.description,
      baseFee: parseFloat(opt.base_fee) || 0,
      perKmFee: opt.per_km_fee ? parseFloat(opt.per_km_fee) : null,
      freeDeliveryMinimum: opt.free_delivery_minimum ? parseFloat(opt.free_delivery_minimum) : null,
      minDeliveryTime: opt.min_delivery_time,
      maxDeliveryTime: opt.max_delivery_time,
      isActive: opt.is_active,
      createdAt: opt.created_at,
      updatedAt: opt.updated_at,
    };
  }

  private transformShopZone(sz: any): any {
    return {
      id: sz.id,
      shopId: sz.shop_id,
      zoneId: sz.zone_id,
      baseFeeOverride: sz.base_fee_override ? parseFloat(sz.base_fee_override) : null,
      minDeliveryTimeOverride: sz.min_delivery_time_override,
      maxDeliveryTimeOverride: sz.max_delivery_time_override,
      isActive: sz.is_active,
      createdAt: sz.created_at,
      updatedAt: sz.updated_at,
    };
  }
}

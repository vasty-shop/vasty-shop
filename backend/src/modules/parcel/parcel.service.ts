import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateParcelDto,
  UpdateParcelStatusDto,
  CalculateShippingDto,
  ConfigureParcelCategoryDto,
  ConfigureDeliveryTypeDto,
  QueryParcelsDto,
  BulkStatusUpdateDto,
  ParcelStatus,
  ParcelCategory,
  DeliveryType,
} from './dto/parcel.dto';

@Injectable()
export class ParcelService {
  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // PARCEL CRUD
  // ============================================

  /**
   * Create a new parcel shipment
   */
  async create(dto: CreateParcelDto, userId: string) {
    // Generate tracking number
    const trackingNumber = this.generateTrackingNumber();

    // Calculate shipping cost
    const shippingCost = await this.calculateShipping({
      origin: {
        postalCode: dto.senderAddress.postalCode,
        lat: dto.senderAddress.lat,
        lng: dto.senderAddress.lng,
      },
      destination: {
        postalCode: dto.receiverAddress.postalCode,
        lat: dto.receiverAddress.lat,
        lng: dto.receiverAddress.lng,
      },
      weight: dto.weight,
      dimensions: dto.dimensions,
      category: dto.category,
    });

    // Get delivery type config for estimated delivery
    const deliveryTypeConfig = await this.getDeliveryTypeConfig(dto.deliveryType);
    const estimatedDeliveryHours = deliveryTypeConfig?.estimatedHours || 48;

    // Calculate final price with delivery type multiplier
    const priceMultiplier = deliveryTypeConfig?.priceMultiplier || 1;
    const additionalFee = deliveryTypeConfig?.additionalFee || 0;
    const finalShippingCost = Math.round((shippingCost.totalCost * priceMultiplier + additionalFee) * 100) / 100;

    // Calculate insurance if required
    let insuranceCost = 0;
    if (dto.insuranceRequired && dto.declaredValue) {
      insuranceCost = Math.round(dto.declaredValue * 0.02 * 100) / 100; // 2% of declared value
    }

    const totalCost = finalShippingCost + insuranceCost + (dto.codAmount || 0);

    // Estimate delivery date
    const estimatedDelivery = new Date();
    estimatedDelivery.setHours(estimatedDelivery.getHours() + estimatedDeliveryHours);

    const parcel = await this.db.createEntity('parcels', {
      user_id: userId,
      tracking_number: trackingNumber,
      sender_address: dto.senderAddress,
      receiver_address: dto.receiverAddress,
      category: dto.category,
      description: dto.description,
      weight: dto.weight,
      dimensions: dto.dimensions,
      declared_value: dto.declaredValue,
      delivery_type: dto.deliveryType,
      scheduled_pickup_time: dto.scheduledPickupTime,
      scheduled_delivery_time: dto.scheduledDeliveryTime,
      payment_method: dto.paymentMethod,
      cod_amount: dto.codAmount,
      special_instructions: dto.specialInstructions,
      is_fragile: dto.isFragile || false,
      requires_signature: dto.requiresSignature || false,
      insurance_required: dto.insuranceRequired || false,
      shipping_cost: finalShippingCost,
      insurance_cost: insuranceCost,
      total_cost: totalCost,
      status: ParcelStatus.PENDING,
      estimated_delivery: estimatedDelivery,
      status_history: [{
        status: ParcelStatus.PENDING,
        timestamp: new Date(),
        note: 'Parcel created',
      }],
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      data: this.transformParcel(parcel),
      message: 'Parcel created successfully',
    };
  }

  /**
   * Get all parcels with filters
   */
  async findAll(query: QueryParcelsDto) {
    const { page = 1, limit = 20, status, category, userId, deliveryManId, trackingNumber, startDate, endDate } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.db.query_builder()
      .from('parcels')
      .select('*')
      .whereNull('deleted_at');

    if (status) {
      queryBuilder = queryBuilder.where('status', status);
    }

    if (category) {
      queryBuilder = queryBuilder.where('category', category);
    }

    if (userId) {
      queryBuilder = queryBuilder.where('user_id', userId);
    }

    if (deliveryManId) {
      queryBuilder = queryBuilder.where('delivery_man_id', deliveryManId);
    }

    if (trackingNumber) {
      queryBuilder = queryBuilder.where('tracking_number', 'ILIKE', `%${trackingNumber}%`);
    }

    if (startDate) {
      queryBuilder = queryBuilder.where('created_at', '>=', startDate);
    }

    if (endDate) {
      queryBuilder = queryBuilder.where('created_at', '<=', endDate);
    }

    const parcels = await queryBuilder
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .get();

    return {
      data: (parcels || []).map((p: any) => this.transformParcel(p)),
      total: parcels?.length || 0,
      page,
      limit,
    };
  }

  /**
   * Get parcel by ID
   */
  async findById(id: string) {
    const parcel = await this.db.getEntity('parcels', id);

    if (!parcel || parcel.deleted_at) {
      throw new NotFoundException('Parcel not found');
    }

    return { data: this.transformParcel(parcel) };
  }

  /**
   * Track parcel by tracking number (public)
   */
  async trackByNumber(trackingNumber: string) {
    const parcels = await this.db.query_builder()
      .from('parcels')
      .select('*')
      .where('tracking_number', trackingNumber)
      .whereNull('deleted_at')
      .get();

    if (!parcels || parcels.length === 0) {
      throw new NotFoundException('Parcel not found');
    }

    const parcel = parcels[0];

    // Return limited public info
    return {
      data: {
        trackingNumber: parcel.tracking_number,
        status: parcel.status,
        category: parcel.category,
        deliveryType: parcel.delivery_type,
        estimatedDelivery: parcel.estimated_delivery,
        statusHistory: parcel.status_history || [],
        currentLocation: parcel.current_location,
        senderCity: parcel.sender_address?.city,
        receiverCity: parcel.receiver_address?.city,
        deliveredAt: parcel.delivered_at,
      },
    };
  }

  /**
   * Update parcel status
   */
  async updateStatus(id: string, dto: UpdateParcelStatusDto) {
    const parcel = await this.db.getEntity('parcels', id);

    if (!parcel || parcel.deleted_at) {
      throw new NotFoundException('Parcel not found');
    }

    // Validate status transition
    if (!this.isValidStatusTransition(parcel.status, dto.status)) {
      throw new BadRequestException(`Cannot transition from ${parcel.status} to ${dto.status}`);
    }

    const statusHistory = parcel.status_history || [];
    statusHistory.push({
      status: dto.status,
      timestamp: new Date(),
      note: dto.note,
      location: dto.location,
      proofImageUrl: dto.proofImageUrl,
      signatureUrl: dto.signatureUrl,
      recipientName: dto.recipientName,
    });

    const updates: any = {
      status: dto.status,
      status_history: statusHistory,
      updated_at: new Date(),
    };

    if (dto.location) {
      updates.current_location = dto.location;
    }

    if (dto.status === ParcelStatus.PICKED_UP) {
      updates.picked_up_at = new Date();
    }

    if (dto.status === ParcelStatus.DELIVERED) {
      updates.delivered_at = new Date();
      updates.delivery_proof_url = dto.proofImageUrl;
      updates.signature_url = dto.signatureUrl;
      updates.recipient_name = dto.recipientName;
    }

    if (dto.status === ParcelStatus.CANCELLED || dto.status === ParcelStatus.RETURNED) {
      updates.cancelled_at = new Date();
      updates.cancellation_reason = dto.note;
    }

    const updated = await this.db.updateEntity('parcels', id, updates);

    // TODO: Send notification to user about status change

    return {
      data: this.transformParcel(updated),
      message: `Status updated to ${dto.status}`,
    };
  }

  /**
   * Bulk update parcel status
   */
  async bulkUpdateStatus(dto: BulkStatusUpdateDto) {
    const results = {
      success: [] as string[],
      failed: [] as { id: string; reason: string }[],
    };

    for (const parcelId of dto.parcelIds) {
      try {
        await this.updateStatus(parcelId, { status: dto.status, note: dto.note });
        results.success.push(parcelId);
      } catch (error) {
        results.failed.push({ id: parcelId, reason: (error as Error).message });
      }
    }

    return {
      data: results,
      message: `Updated ${results.success.length} parcels, ${results.failed.length} failed`,
    };
  }

  /**
   * Cancel parcel
   */
  async cancel(id: string, reason: string, userId: string) {
    const parcel = await this.db.getEntity('parcels', id);

    if (!parcel || parcel.deleted_at) {
      throw new NotFoundException('Parcel not found');
    }

    if (parcel.user_id !== userId) {
      throw new BadRequestException('Not authorized to cancel this parcel');
    }

    // Can only cancel if not yet picked up
    if (![ParcelStatus.PENDING, ParcelStatus.CONFIRMED].includes(parcel.status)) {
      throw new BadRequestException('Cannot cancel parcel after pickup');
    }

    return this.updateStatus(id, {
      status: ParcelStatus.CANCELLED,
      note: reason,
    });
  }

  // ============================================
  // SHIPPING CALCULATION
  // ============================================

  /**
   * Calculate shipping cost
   */
  async calculateShipping(dto: CalculateShippingDto) {
    // Get category config
    const categoryConfig = await this.getCategoryConfig(dto.category || ParcelCategory.SMALL_PACKAGE);

    // Calculate distance
    let distance = 10; // Default 10km
    if (dto.origin.lat && dto.origin.lng && dto.destination.lat && dto.destination.lng) {
      distance = this.calculateDistance(
        dto.origin.lat,
        dto.origin.lng,
        dto.destination.lat,
        dto.destination.lng,
      );
    }

    // Base price
    const basePrice = categoryConfig?.basePrice || 5;

    // Weight-based price
    const weight = dto.weight || 1;
    const pricePerKg = categoryConfig?.pricePerKg || 2;
    const weightPrice = weight * pricePerKg;

    // Distance-based price
    const pricePerKm = categoryConfig?.pricePerKm || 0.5;
    const distancePrice = distance * pricePerKm;

    // Calculate dimensional weight (for large packages)
    let dimensionalWeight = 0;
    if (dto.dimensions) {
      dimensionalWeight = (dto.dimensions.length * dto.dimensions.width * dto.dimensions.height) / 5000;
    }

    // Use the greater of actual weight or dimensional weight
    const chargeableWeight = Math.max(weight, dimensionalWeight);
    const finalWeightPrice = chargeableWeight * pricePerKg;

    const totalCost = Math.round((basePrice + finalWeightPrice + distancePrice) * 100) / 100;

    // Get available delivery types with prices
    const deliveryOptions = await this.getDeliveryOptions(totalCost);

    return {
      basePrice,
      weightPrice: finalWeightPrice,
      distancePrice,
      totalCost,
      distance: Math.round(distance * 10) / 10,
      chargeableWeight: Math.round(chargeableWeight * 10) / 10,
      deliveryOptions,
    };
  }

  /**
   * Get delivery options with calculated prices
   */
  private async getDeliveryOptions(baseCost: number) {
    const deliveryTypes = await this.db.query_builder()
      .from('parcel_delivery_types')
      .select('*')
      .where('is_available', true)
      .get();

    const defaults = [
      { type: DeliveryType.STANDARD, name: 'Standard Delivery', estimatedHours: 48, multiplier: 1, fee: 0 },
      { type: DeliveryType.EXPRESS, name: 'Express Delivery', estimatedHours: 24, multiplier: 1.5, fee: 5 },
      { type: DeliveryType.SAME_DAY, name: 'Same Day Delivery', estimatedHours: 6, multiplier: 2, fee: 10 },
      { type: DeliveryType.NEXT_DAY, name: 'Next Day Delivery', estimatedHours: 18, multiplier: 1.3, fee: 3 },
    ];

    const options = deliveryTypes?.length > 0
      ? deliveryTypes.map((dt: any) => ({
          type: dt.delivery_type,
          name: dt.name,
          estimatedHours: dt.estimated_hours,
          price: Math.round((baseCost * (dt.price_multiplier || 1) + (dt.additional_fee || 0)) * 100) / 100,
        }))
      : defaults.map(d => ({
          type: d.type,
          name: d.name,
          estimatedHours: d.estimatedHours,
          price: Math.round((baseCost * d.multiplier + d.fee) * 100) / 100,
        }));

    return options;
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  /**
   * Configure parcel category
   */
  async configureCategory(dto: ConfigureParcelCategoryDto) {
    // Check if category config exists
    const existing = await this.db.query_builder()
      .from('parcel_categories')
      .select('id')
      .where('category', dto.category)
      .get();

    if (existing && existing.length > 0) {
      // Update existing
      const updated = await this.db.updateEntity('parcel_categories', existing[0].id, {
        name: dto.name,
        description: dto.description,
        base_price: dto.basePrice,
        price_per_kg: dto.pricePerKg,
        price_per_km: dto.pricePerKm,
        max_weight: dto.maxWeight,
        max_dimensions: dto.maxDimensions,
        is_active: dto.isActive !== false,
        updated_at: new Date(),
      });

      return { data: updated, message: 'Category updated' };
    }

    // Create new
    const created = await this.db.createEntity('parcel_categories', {
      category: dto.category,
      name: dto.name,
      description: dto.description,
      base_price: dto.basePrice || 5,
      price_per_kg: dto.pricePerKg || 2,
      price_per_km: dto.pricePerKm || 0.5,
      max_weight: dto.maxWeight || 50,
      max_dimensions: dto.maxDimensions || { length: 100, width: 100, height: 100 },
      is_active: dto.isActive !== false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return { data: created, message: 'Category created' };
  }

  /**
   * Get category configuration
   */
  async getCategoryConfig(category: ParcelCategory) {
    const configs = await this.db.query_builder()
      .from('parcel_categories')
      .select('*')
      .where('category', category)
      .where('is_active', true)
      .get();

    if (configs && configs.length > 0) {
      return configs[0];
    }

    // Return defaults
    return {
      category,
      name: category,
      basePrice: 5,
      pricePerKg: 2,
      pricePerKm: 0.5,
      maxWeight: 50,
    };
  }

  /**
   * Get all category configurations
   */
  async getAllCategories() {
    const categories = await this.db.query_builder()
      .from('parcel_categories')
      .select('*')
      .get();

    return { data: categories || [] };
  }

  /**
   * Configure delivery type
   */
  async configureDeliveryType(dto: ConfigureDeliveryTypeDto) {
    const existing = await this.db.query_builder()
      .from('parcel_delivery_types')
      .select('id')
      .where('delivery_type', dto.deliveryType)
      .get();

    if (existing && existing.length > 0) {
      const updated = await this.db.updateEntity('parcel_delivery_types', existing[0].id, {
        name: dto.name,
        description: dto.description,
        estimated_hours: dto.estimatedHours,
        price_multiplier: dto.priceMultiplier,
        additional_fee: dto.additionalFee,
        is_available: dto.isAvailable !== false,
        available_hours: dto.availableHours,
        updated_at: new Date(),
      });

      return { data: updated, message: 'Delivery type updated' };
    }

    const created = await this.db.createEntity('parcel_delivery_types', {
      delivery_type: dto.deliveryType,
      name: dto.name,
      description: dto.description,
      estimated_hours: dto.estimatedHours || 48,
      price_multiplier: dto.priceMultiplier || 1,
      additional_fee: dto.additionalFee || 0,
      is_available: dto.isAvailable !== false,
      available_hours: dto.availableHours || '00:00-23:59',
      created_at: new Date(),
      updated_at: new Date(),
    });

    return { data: created, message: 'Delivery type created' };
  }

  /**
   * Get delivery type config
   */
  async getDeliveryTypeConfig(deliveryType: DeliveryType) {
    const configs = await this.db.query_builder()
      .from('parcel_delivery_types')
      .select('*')
      .where('delivery_type', deliveryType)
      .where('is_available', true)
      .get();

    if (configs && configs.length > 0) {
      return configs[0];
    }

    // Return defaults
    const defaults: Record<DeliveryType, any> = {
      [DeliveryType.STANDARD]: { estimatedHours: 48, priceMultiplier: 1, additionalFee: 0 },
      [DeliveryType.EXPRESS]: { estimatedHours: 24, priceMultiplier: 1.5, additionalFee: 5 },
      [DeliveryType.SAME_DAY]: { estimatedHours: 6, priceMultiplier: 2, additionalFee: 10 },
      [DeliveryType.NEXT_DAY]: { estimatedHours: 18, priceMultiplier: 1.3, additionalFee: 3 },
      [DeliveryType.SCHEDULED]: { estimatedHours: 72, priceMultiplier: 1, additionalFee: 0 },
    };

    return defaults[deliveryType];
  }

  /**
   * Get all delivery types
   */
  async getAllDeliveryTypes() {
    const types = await this.db.query_builder()
      .from('parcel_delivery_types')
      .select('*')
      .get();

    return { data: types || [] };
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get parcel statistics
   */
  async getStats(period?: string, zoneId?: string) {
    // Get period dates
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Default to month
    }

    // Get parcels in period
    const parcels = await this.db.query_builder()
      .from('parcels')
      .select('*')
      .where('created_at', '>=', startDate.toISOString())
      .whereNull('deleted_at')
      .get();

    const parcelList = parcels || [];

    // Calculate stats
    const stats = {
      total: parcelList.length,
      pending: parcelList.filter((p: any) => p.status === ParcelStatus.PENDING).length,
      inTransit: parcelList.filter((p: any) => [ParcelStatus.PICKED_UP, ParcelStatus.IN_TRANSIT, ParcelStatus.OUT_FOR_DELIVERY].includes(p.status)).length,
      delivered: parcelList.filter((p: any) => p.status === ParcelStatus.DELIVERED).length,
      cancelled: parcelList.filter((p: any) => p.status === ParcelStatus.CANCELLED).length,
      returned: parcelList.filter((p: any) => p.status === ParcelStatus.RETURNED).length,
      totalRevenue: parcelList.reduce((sum: number, p: any) => sum + (p.total_cost || 0), 0),
      averageDeliveryTime: this.calculateAverageDeliveryTime(parcelList),
      byCategory: this.groupByCategory(parcelList),
      byDeliveryType: this.groupByDeliveryType(parcelList),
    };

    return { data: stats };
  }

  private calculateAverageDeliveryTime(parcels: any[]): number {
    const delivered = parcels.filter(p => p.status === ParcelStatus.DELIVERED && p.delivered_at && p.created_at);
    if (delivered.length === 0) return 0;

    const totalHours = delivered.reduce((sum: number, p: any) => {
      const created = new Date(p.created_at);
      const deliveredAt = new Date(p.delivered_at);
      const hours = (deliveredAt.getTime() - created.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    return Math.round(totalHours / delivered.length);
  }

  private groupByCategory(parcels: any[]): Record<string, number> {
    return parcels.reduce((acc: Record<string, number>, p: any) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
  }

  private groupByDeliveryType(parcels: any[]): Record<string, number> {
    return parcels.reduce((acc: Record<string, number>, p: any) => {
      acc[p.delivery_type] = (acc[p.delivery_type] || 0) + 1;
      return acc;
    }, {});
  }

  // ============================================
  // HELPERS
  // ============================================

  private transformParcel(parcel: any) {
    return {
      id: parcel.id,
      userId: parcel.user_id,
      trackingNumber: parcel.tracking_number,
      senderAddress: parcel.sender_address,
      receiverAddress: parcel.receiver_address,
      category: parcel.category,
      description: parcel.description,
      weight: parcel.weight,
      dimensions: parcel.dimensions,
      declaredValue: parcel.declared_value,
      deliveryType: parcel.delivery_type,
      scheduledPickupTime: parcel.scheduled_pickup_time,
      scheduledDeliveryTime: parcel.scheduled_delivery_time,
      paymentMethod: parcel.payment_method,
      codAmount: parcel.cod_amount,
      specialInstructions: parcel.special_instructions,
      isFragile: parcel.is_fragile,
      requiresSignature: parcel.requires_signature,
      insuranceRequired: parcel.insurance_required,
      shippingCost: parcel.shipping_cost,
      insuranceCost: parcel.insurance_cost,
      totalCost: parcel.total_cost,
      status: parcel.status,
      estimatedDelivery: parcel.estimated_delivery,
      statusHistory: parcel.status_history,
      currentLocation: parcel.current_location,
      deliveryManId: parcel.delivery_man_id,
      pickedUpAt: parcel.picked_up_at,
      deliveredAt: parcel.delivered_at,
      deliveryProofUrl: parcel.delivery_proof_url,
      signatureUrl: parcel.signature_url,
      recipientName: parcel.recipient_name,
      createdAt: parcel.created_at,
      updatedAt: parcel.updated_at,
    };
  }

  private generateTrackingNumber(): string {
    const prefix = 'FLX';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  private isValidStatusTransition(current: ParcelStatus, next: ParcelStatus): boolean {
    const validTransitions: Record<ParcelStatus, ParcelStatus[]> = {
      [ParcelStatus.PENDING]: [ParcelStatus.CONFIRMED, ParcelStatus.CANCELLED],
      [ParcelStatus.CONFIRMED]: [ParcelStatus.PICKED_UP, ParcelStatus.CANCELLED],
      [ParcelStatus.PICKED_UP]: [ParcelStatus.IN_TRANSIT, ParcelStatus.RETURNED],
      [ParcelStatus.IN_TRANSIT]: [ParcelStatus.OUT_FOR_DELIVERY, ParcelStatus.RETURNED],
      [ParcelStatus.OUT_FOR_DELIVERY]: [ParcelStatus.DELIVERED, ParcelStatus.FAILED, ParcelStatus.RETURNED],
      [ParcelStatus.DELIVERED]: [],
      [ParcelStatus.CANCELLED]: [],
      [ParcelStatus.RETURNED]: [],
      [ParcelStatus.FAILED]: [ParcelStatus.OUT_FOR_DELIVERY, ParcelStatus.RETURNED],
    };

    return validTransitions[current]?.includes(next) || false;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

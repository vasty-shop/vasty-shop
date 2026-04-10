import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  EntityType,
  DeliveryAddressEntity,
  DeliveryTrackingEntity,
  DeliveryStatus,
  OrderEntity,
} from '../../database/schema';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { CalculateDeliveryCostDto } from './dto/calculate-cost.dto';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // DELIVERY ADDRESSES
  // ============================================

  /**
   * Create a new delivery address
   */
  async createAddress(
    userId: string,
    createAddressDto: CreateAddressDto,
  ): Promise<DeliveryAddressEntity> {
    try {
      // If setting as default, unset other default addresses
      if (createAddressDto.isDefault) {
        await this.unsetDefaultAddresses(userId);
      }

      const addressData: Partial<DeliveryAddressEntity> = {
        userId,
        ...createAddressDto,
        addressType: createAddressDto.addressType || 'home',
        isDefault: createAddressDto.isDefault || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const address = await this.db.createEntity(
        EntityType.DELIVERY_ADDRESS,
        addressData,
      );

      this.logger.log(`Address created for user ${userId}: ${address.id}`);

      return address;
    } catch (error) {
      this.logger.error('Failed to create address', error);
      throw new BadRequestException('Failed to create address');
    }
  }

  /**
   * Get all addresses for a user
   */
  async getUserAddresses(userId: string): Promise<DeliveryAddressEntity[]> {
    try {
      const result = await this.db.queryEntities(EntityType.DELIVERY_ADDRESS, {
        filters: { userId, deletedAt: null },
      });

      return result.data || [];
    } catch (error) {
      this.logger.error('Failed to get user addresses', error);
      return [];
    }
  }

  /**
   * Get a single address
   */
  async getAddress(id: string, userId: string): Promise<DeliveryAddressEntity> {
    try {
      const address = await this.db.getEntity(EntityType.DELIVERY_ADDRESS, id);

      if (!address || address.userId !== userId) {
        throw new NotFoundException('Address not found');
      }

      return address;
    } catch (error) {
      throw new NotFoundException('Address not found');
    }
  }

  /**
   * Update an address
   */
  async updateAddress(
    id: string,
    updateAddressDto: UpdateAddressDto,
    userId: string,
  ): Promise<DeliveryAddressEntity> {
    try {
      // Verify ownership
      const address = await this.getAddress(id, userId);

      // If setting as default, unset other default addresses
      if (updateAddressDto.isDefault) {
        await this.unsetDefaultAddresses(userId);
      }

      const updateData: Partial<DeliveryAddressEntity> = {
        ...updateAddressDto,
        updatedAt: new Date().toISOString(),
      };

      const updatedAddress = await this.db.updateEntity(
        EntityType.DELIVERY_ADDRESS,
        id,
        updateData,
      );

      this.logger.log(`Address updated: ${id}`);

      return updatedAddress;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to update address', error);
      throw new BadRequestException('Failed to update address');
    }
  }

  /**
   * Delete an address (soft delete)
   */
  async deleteAddress(id: string, userId: string): Promise<{ message: string }> {
    try {
      // Verify ownership
      await this.getAddress(id, userId);

      await this.db.updateEntity(EntityType.DELIVERY_ADDRESS, id, {
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      this.logger.log(`Address deleted: ${id}`);

      return { message: 'Address deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to delete address', error);
      throw new BadRequestException('Failed to delete address');
    }
  }

  /**
   * Set address as default
   */
  async setDefaultAddress(id: string, userId: string): Promise<DeliveryAddressEntity> {
    try {
      // Verify ownership
      await this.getAddress(id, userId);

      // Unset other default addresses
      await this.unsetDefaultAddresses(userId);

      // Set this address as default
      const updatedAddress = await this.db.updateEntity(
        EntityType.DELIVERY_ADDRESS,
        id,
        {
          isDefault: true,
          updatedAt: new Date().toISOString(),
        },
      );

      this.logger.log(`Default address set: ${id} for user ${userId}`);

      return updatedAddress;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to set default address', error);
      throw new BadRequestException('Failed to set default address');
    }
  }

  // ============================================
  // DELIVERY TRACKING
  // ============================================

  /**
   * Create tracking record for an order
   */
  async createTracking(createTrackingDto: CreateTrackingDto): Promise<DeliveryTrackingEntity> {
    try {
      const trackingNumber = this.generateTrackingNumber();

      const trackingData: Partial<DeliveryTrackingEntity> = {
        orderId: createTrackingDto.orderId,
        shopId: createTrackingDto.shopId,
        trackingNumber,
        carrier: createTrackingDto.carrier,
        deliveryMethod: createTrackingDto.deliveryMethod,
        currentStatus: DeliveryStatus.PENDING,
        statusHistory: [
          {
            status: DeliveryStatus.PENDING,
            message: 'Order is being prepared',
            timestamp: new Date().toISOString(),
          },
        ],
        estimatedDeliveryDate: createTrackingDto.estimatedDeliveryDate,
        deliveryNotes: createTrackingDto.deliveryNotes,
        signatureRequired: createTrackingDto.signatureRequired || false,
        deliveryAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const tracking = await this.db.createEntity(
        EntityType.DELIVERY_TRACKING,
        trackingData,
      );

      this.logger.log(`Tracking created: ${trackingNumber} for order ${createTrackingDto.orderId}`);

      // TODO: Send order shipped notification

      return tracking;
    } catch (error) {
      this.logger.error('Failed to create tracking', error);
      throw new BadRequestException('Failed to create tracking');
    }
  }

  /**
   * Update tracking status
   */
  async updateTrackingStatus(
    id: string,
    status: string,
    note?: string,
    location?: string,
  ): Promise<DeliveryTrackingEntity> {
    try {
      const tracking = await this.db.getEntity(EntityType.DELIVERY_TRACKING, id);

      if (!tracking) {
        throw new NotFoundException('Tracking not found');
      }

      // Add to status history
      const historyEntry = {
        status,
        message: note || `Status updated to ${status}`,
        location,
        timestamp: new Date().toISOString(),
      };

      const statusHistory = [...(tracking.statusHistory || []), historyEntry];

      const updateData: Partial<DeliveryTrackingEntity> = {
        currentStatus: status as DeliveryStatus,
        statusHistory,
        updatedAt: new Date().toISOString(),
      };

      // Set actual delivery date if delivered
      if (status === DeliveryStatus.DELIVERED && !tracking.actualDeliveryDate) {
        updateData.actualDeliveryDate = new Date().toISOString();
      }

      // Increment attempts if failed
      if (status === DeliveryStatus.FAILED) {
        updateData.deliveryAttempts = (tracking.deliveryAttempts || 0) + 1;
        updateData.failedReason = note;
      }

      const updatedTracking = await this.db.updateEntity(
        EntityType.DELIVERY_TRACKING,
        id,
        updateData,
      );

      this.logger.log(`Tracking status updated: ${tracking.trackingNumber} - ${status}`);

      // TODO: Send delivery status notification

      return updatedTracking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to update tracking status', error);
      throw new BadRequestException('Failed to update tracking status');
    }
  }

  /**
   * Get tracking by order number (public endpoint)
   */
  async trackByOrderNumber(orderNumber: string) {
    try {
      // First get the order
      const orders = await this.db.queryEntities(EntityType.ORDER, {
        filters: { orderNumber },
      });

      if (!orders.data || orders.data.length === 0) {
        throw new NotFoundException('Order not found');
      }

      const order = orders.data[0] as OrderEntity;

      // Get tracking for this order
      const trackings = await this.db.queryEntities(EntityType.DELIVERY_TRACKING, {
        filters: { orderId: order.id },
      });

      if (!trackings.data || trackings.data.length === 0) {
        throw new NotFoundException('Tracking information not available yet');
      }

      const tracking = trackings.data[0] as DeliveryTrackingEntity;

      return {
        orderNumber,
        trackingNumber: tracking.trackingNumber,
        carrier: tracking.carrier,
        deliveryMethod: tracking.deliveryMethod,
        currentStatus: tracking.currentStatus,
        statusHistory: tracking.statusHistory,
        estimatedDeliveryDate: tracking.estimatedDeliveryDate,
        actualDeliveryDate: tracking.actualDeliveryDate,
        deliveryAttempts: tracking.deliveryAttempts,
        lastUpdate: tracking.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to track order', error);
      throw new NotFoundException('Tracking information not found');
    }
  }

  /**
   * Get tracking by order ID
   */
  async getTrackingByOrderId(orderId: string): Promise<DeliveryTrackingEntity> {
    try {
      const result = await this.db.queryEntities(EntityType.DELIVERY_TRACKING, {
        filters: { orderId },
      });

      if (!result.data || result.data.length === 0) {
        throw new NotFoundException('Tracking not found for this order');
      }

      return result.data[0];
    } catch (error) {
      throw new NotFoundException('Tracking not found');
    }
  }

  /**
   * Add a delivery note
   */
  async addDeliveryNote(id: string, note: string): Promise<DeliveryTrackingEntity> {
    try {
      const tracking = await this.db.getEntity(EntityType.DELIVERY_TRACKING, id);

      if (!tracking) {
        throw new NotFoundException('Tracking not found');
      }

      const existingNotes = tracking.deliveryNotes || '';
      const updatedNotes = existingNotes
        ? `${existingNotes}\n[${new Date().toISOString()}] ${note}`
        : `[${new Date().toISOString()}] ${note}`;

      const updatedTracking = await this.db.updateEntity(
        EntityType.DELIVERY_TRACKING,
        id,
        {
          deliveryNotes: updatedNotes,
          updatedAt: new Date().toISOString(),
        },
      );

      this.logger.log(`Note added to tracking: ${tracking.trackingNumber}`);

      return updatedTracking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to add delivery note', error);
      throw new BadRequestException('Failed to add delivery note');
    }
  }

  // ============================================
  // DELIVERY METHODS & COST
  // ============================================

  /**
   * Get available delivery methods for a shop
   */
  async getDeliveryMethods(shopId?: string) {
    try {
      const filters: any = { deleted_at: null };
      if (shopId) {
        filters.shop_id = shopId;
      }

      const result = await this.db.queryEntities(EntityType.DELIVERY_METHOD, {
        filters,
        sort: { created_at: 'asc' },
      });

      const methods = result.data || [];

      // Transform snake_case to camelCase for frontend
      return methods.map((m: any) => this.transformDeliveryMethod(m));
    } catch (error) {
      this.logger.error('Failed to get delivery methods', error);
      return [];
    }
  }

  /**
   * Transform delivery method from snake_case to camelCase
   */
  private transformDeliveryMethod(m: any) {
    return {
      id: m.id,
      shopId: m.shop_id,
      type: m.type,
      name: m.name,
      description: m.description,
      baseCost: m.base_cost,
      costPerKg: m.cost_per_kg,
      freeShippingThreshold: m.free_shipping_threshold,
      estimatedDays: m.estimated_days,
      cutoffTime: m.cutoff_time,
      carrier: m.carrier,
      trackingEnabled: m.tracking_enabled,
      zones: m.zones,
      isActive: m.is_active,
      sortOrder: m.sort_order,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    };
  }

  /**
   * Create a delivery method
   */
  async createDeliveryMethod(shopId: string, data: any) {
    try {
      const methodData = {
        shop_id: shopId,
        name: data.name,
        type: data.type,
        description: data.description || null,
        base_cost: data.baseCost || 0,
        estimated_days: data.estimatedDays || null,
        carrier: data.carrier || null,
        tracking_enabled: data.trackingEnabled ?? true,
        zones: data.zones || ['domestic'],
        is_active: true,
        sort_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const method = await this.db.createEntity(
        EntityType.DELIVERY_METHOD,
        methodData,
      );

      this.logger.log(`Delivery method created: ${method.id} for shop ${shopId}`);
      return this.transformDeliveryMethod(method);
    } catch (error) {
      this.logger.error('Failed to create delivery method', error);
      throw new BadRequestException('Failed to create delivery method');
    }
  }

  /**
   * Update a delivery method
   */
  async updateDeliveryMethod(id: string, shopId: string, data: any) {
    try {
      const method = await this.db.getEntity(EntityType.DELIVERY_METHOD, id);

      if (!method || method.shop_id !== shopId) {
        throw new NotFoundException('Delivery method not found');
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.baseCost !== undefined) updateData.base_cost = data.baseCost;
      if (data.estimatedDays !== undefined) updateData.estimated_days = data.estimatedDays;
      if (data.carrier !== undefined) updateData.carrier = data.carrier;
      if (data.trackingEnabled !== undefined) updateData.tracking_enabled = data.trackingEnabled;
      if (data.zones !== undefined) updateData.zones = data.zones;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;

      const updated = await this.db.updateEntity(
        EntityType.DELIVERY_METHOD,
        id,
        updateData,
      );

      this.logger.log(`Delivery method updated: ${id}`);
      return this.transformDeliveryMethod(updated);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Failed to update delivery method', error);
      throw new BadRequestException('Failed to update delivery method');
    }
  }

  /**
   * Delete a delivery method
   */
  async deleteDeliveryMethod(id: string, shopId: string) {
    try {
      const method = await this.db.getEntity(EntityType.DELIVERY_METHOD, id);

      if (!method || method.shop_id !== shopId) {
        throw new NotFoundException('Delivery method not found');
      }

      await this.db.updateEntity(EntityType.DELIVERY_METHOD, id, {
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      this.logger.log(`Delivery method deleted: ${id}`);
      return { message: 'Delivery method deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Failed to delete delivery method', error);
      throw new BadRequestException('Failed to delete delivery method');
    }
  }

  /**
   * Toggle delivery method active status
   */
  async toggleDeliveryMethod(id: string, shopId: string) {
    try {
      const method = await this.db.getEntity(EntityType.DELIVERY_METHOD, id);

      if (!method || method.shop_id !== shopId) {
        throw new NotFoundException('Delivery method not found');
      }

      const updated = await this.db.updateEntity(EntityType.DELIVERY_METHOD, id, {
        is_active: !method.is_active,
        updated_at: new Date().toISOString(),
      });

      this.logger.log(`Delivery method toggled: ${id} - now ${!method.is_active ? 'active' : 'inactive'}`);
      return this.transformDeliveryMethod(updated);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Failed to toggle delivery method', error);
      throw new BadRequestException('Failed to toggle delivery method');
    }
  }

  /**
   * Calculate delivery cost
   */
  async calculateDeliveryCost(calculateCostDto: CalculateDeliveryCostDto) {
    try {
      const { addressId, items, deliveryMethod } = calculateCostDto;

      // Get address details
      const address = await this.db.getEntity(EntityType.DELIVERY_ADDRESS, addressId);

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      // Get delivery methods
      const methods = await this.getDeliveryMethods();
      const method = methods.find((m) => m.type === (deliveryMethod || 'standard'));

      if (!method) {
        throw new BadRequestException('Invalid delivery method');
      }

      // Calculate base cost
      let baseCost = method.baseCost;

      // Calculate total weight
      const totalWeight = items.reduce((sum, item) => {
        return sum + (item.weight || 0) * item.quantity;
      }, 0);

      // Add weight-based cost (e.g., $1 per kg over 5kg)
      if (totalWeight > 5) {
        baseCost += (totalWeight - 5) * 1;
      }

      // TODO: Add distance-based pricing
      // TODO: Add zone-based pricing
      // TODO: Add promotional discounts

      return {
        deliveryMethod: method.type,
        methodName: method.name,
        baseCost: method.baseCost,
        weightCost: totalWeight > 5 ? (totalWeight - 5) * 1 : 0,
        totalCost: baseCost,
        estimatedDays: method.estimatedDays,
        totalWeight,
        address: {
          city: address.city,
          state: address.state,
          country: address.country,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Failed to calculate delivery cost', error);
      throw new BadRequestException('Failed to calculate delivery cost');
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Unset all default addresses for a user
   */
  private async unsetDefaultAddresses(userId: string): Promise<void> {
    try {
      const addresses = await this.getUserAddresses(userId);
      const defaultAddresses = addresses.filter((addr) => addr.isDefault);

      for (const address of defaultAddresses) {
        await this.db.updateEntity(EntityType.DELIVERY_ADDRESS, address.id, {
          isDefault: false,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error('Failed to unset default addresses', error);
    }
  }

  /**
   * Generate a unique tracking number
   */
  private generateTrackingNumber(): string {
    const prefix = 'FLX';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }
  // ============================================
  // SHIPPING ZONES
  // ============================================

  /**
   * Get shipping zones for a shop
   */
  async getShippingZones(shopId: string): Promise<any[]> {
    try {
      const result = await this.db
        .query()
        .from('shipping_zones')
        .select('*')
        .where('shop_id', shopId)
        .get();
      return result || [];
    } catch (error) {
      this.logger.warn(`Shipping zones table may not exist: ${error.message}`);
      return [];
    }
  }

  /**
   * Create shipping zone
   */
  async createShippingZone(shopId: string, data: any): Promise<any> {
    const zoneData = {
      shop_id: shopId,
      name: data.name,
      countries: data.countries || [],
      regions: data.regions || [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await this.db
      .query()
      .from('shipping_zones')
      .insert(zoneData)
      .returning('*')
      .execute();

    return result[0] || result;
  }

  /**
   * Update shipping zone
   */
  async updateShippingZone(id: string, shopId: string, data: any): Promise<any> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.countries !== undefined) updateData.countries = data.countries;
    if (data.regions !== undefined) updateData.regions = data.regions;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const result = await this.db
      .query()
      .from('shipping_zones')
      .where('id', id)
      .where('shop_id', shopId)
      .update(updateData)
      .returning('*')
      .execute();

    return result[0] || result;
  }

  /**
   * Delete shipping zone
   */
  async deleteShippingZone(id: string, shopId: string): Promise<{ success: boolean }> {
    await this.db
      .query()
      .from('shipping_zones')
      .where('id', id)
      .where('shop_id', shopId)
      .delete()
      .execute();

    return { success: true };
  }
}

/* TODO: Future enhancements
 * - Integrate with real carrier APIs (FedEx, UPS, USPS, DHL)
 * - Real-time tracking updates from carriers
 * - Automated delivery notifications via email/SMS
 * - Delivery route optimization
 * - Proof of delivery photo upload
 * - Digital signature capture
 * - Address validation and geocoding
 * - Distance-based pricing calculation
 * - Zone-based delivery pricing
 * - Delivery time slot selection
 * - Recurring delivery schedules
 * - Delivery preferences management
 * - Failed delivery retry logic
 * - Return shipping management
 */

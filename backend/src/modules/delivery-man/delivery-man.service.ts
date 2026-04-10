import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  RegisterDeliveryManDto,
  UpdateDeliveryManDto,
  UpdateDeliveryManStatusDto,
  UpdateAvailabilityDto,
  UpdateLocationDto,
  AssignOrderDto,
  AcceptOrderDto,
  RejectOrderDto,
  CompleteDeliveryDto,
  ConfigureDeliveryManSettingsDto,
  DeliveryManReviewDto,
  WithdrawEarningsDto,
  QueryDeliveryMenDto,
  DeliveryManStatus,
  DeliveryManAvailability,
  DeliveryManType,
} from './dto/delivery-man.dto';

@Injectable()
export class DeliveryManService {
  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // REGISTRATION & MANAGEMENT
  // ============================================

  /**
   * Register a new delivery man (self or admin)
   */
  async register(dto: RegisterDeliveryManDto, userId?: string) {
    // Check if email already exists in delivery_men
    const existing = await this.db.query_builder()
      .from('delivery_men')
      .select('id')
      .where('email', dto.email)
      .whereNull('deleted_at')
      .get();

    if (existing && existing.length > 0) {
      throw new ConflictException('Email already registered as delivery man');
    }

    let authUserId = userId;

    // If password is provided, create a database auth user account
    if (dto.password && !userId) {
      try {
        console.log('[DeliveryManService] Creating auth user for delivery man:', dto.email);
        // Pass role directly to database (not in metadata)
        const authResult = await this.db.signUp(
          dto.email,
          dto.password,
          dto.name,
          'delivery_man', // Role passed directly
          {
            phone: dto.phone,
            registeredBy: 'vendor',
          }
        );
        authUserId = authResult?.user?.id || authResult?.id;
        console.log('[DeliveryManService] Created auth user with ID:', authUserId);
      } catch (authError: any) {
        console.error('[DeliveryManService] Failed to create auth user:', authError.message);
        // If user already exists in auth, try to get their ID
        if (authError.message?.includes('already exists') || authError.message?.includes('duplicate')) {
          throw new ConflictException('A user with this email already exists. Please use a different email.');
        }
        throw new BadRequestException('Failed to create user account: ' + authError.message);
      }
    }

    // Get settings to check if approval required
    const settings = await this.getSettings();
    const requireApproval = settings?.requireApproval !== false;

    const deliveryMan = await this.db.createEntity('delivery_men', {
      user_id: authUserId || null,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      type: dto.type || DeliveryManType.FREELANCER,
      vehicle_type: dto.vehicleType,
      vehicle_number: dto.vehicleNumber,
      image_url: dto.imageUrl,
      identity_type: dto.identityType,
      identity_number: dto.identityNumber,
      identity_images: dto.identityImages || [],
      zone_id: dto.zoneId,
      address: dto.address || {},
      status: requireApproval ? DeliveryManStatus.PENDING : DeliveryManStatus.ACTIVE,
      availability: DeliveryManAvailability.ONLINE,
      current_location: null,
      rating: 0,
      total_reviews: 0,
      total_deliveries: 0,
      total_earnings: 0,
      pending_earnings: 0,
      cash_in_hand: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      data: this.transformDeliveryMan(deliveryMan),
      message: requireApproval
        ? 'Registration submitted for approval. Delivery person can login with their email and password.'
        : 'Registration successful. Delivery person can login with their email and password.',
    };
  }

  /**
   * Sync delivery men from database auth users with delivery_man role
   * Creates delivery_men records for auth users that don't have one yet
   */
  async syncDeliveryMenFromAuth() {
    try {
      // Get all users with delivery_man role from database auth
      const usersResponse: any = await this.db.listUsers();
      const allUsers = usersResponse?.users || usersResponse?.data?.users || [];

      // Filter users with delivery_man role (role is stored directly in user.role)
      const deliveryManUsers = allUsers.filter((user: any) => {
        return user.role === 'delivery_man';
      });

      console.log(`[DeliveryManService] Found ${deliveryManUsers.length} users with delivery_man role`);

      // Get existing delivery men by user_id (include id and status for activation)
      const existingDeliveryMen = await this.db.query_builder()
        .from('delivery_men')
        .select('id', 'user_id', 'email', 'status', 'phone')
        .whereNull('deleted_at')
        .get();

      // Create maps for existing delivery men
      const existingByUserId = new Map((existingDeliveryMen || []).map((dm: any) => [dm.user_id, dm]));
      const existingByEmail = new Map((existingDeliveryMen || []).map((dm: any) => [dm.email?.toLowerCase(), dm]));

      let created = 0;
      let updated = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const user of deliveryManUsers) {
        const userId = user.id;
        const email = user.email?.toLowerCase();

        // Check if already exists
        const existingByUserIdMatch = existingByUserId.get(userId);
        const existingByEmailMatch = existingByEmail.get(email);
        const existing = existingByUserIdMatch || existingByEmailMatch;

        if (existing) {
          // Get phone from auth user metadata
          const authPhone = user.user_metadata?.phone || user.phone || '';

          // If exists but pending, activate them. Also update phone if missing.
          if (existing.status === 'pending' || (!existing.phone && authPhone)) {
            try {
              const updates: any = {
                user_id: userId, // Ensure user_id is linked
                updated_at: new Date(),
              };

              // Activate if pending
              if (existing.status === 'pending') {
                updates.status = DeliveryManStatus.ACTIVE;
              }

              // Update phone if missing
              if (!existing.phone && authPhone) {
                updates.phone = authPhone;
              }

              await this.db.updateEntity('delivery_men', existing.id, updates);
              updated++;
              console.log(`[DeliveryManService] Updated delivery man: ${email} (status: ${updates.status || existing.status}, phone: ${updates.phone || existing.phone})`);
            } catch (err: any) {
              errors.push(`Failed to update ${email}: ${err.message}`);
            }
          } else {
            skipped++;
          }
          continue;
        }

        try {
          // Create delivery_men record
          await this.db.createEntity('delivery_men', {
            user_id: userId,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Delivery Partner',
            email: user.email,
            phone: user.user_metadata?.phone || user.phone || '',
            type: DeliveryManType.FREELANCER,
            status: DeliveryManStatus.ACTIVE, // Auto-activate since they already have the role
            availability: DeliveryManAvailability.ONLINE,
            current_location: null,
            rating: 0,
            total_reviews: 0,
            total_deliveries: 0,
            total_earnings: 0,
            pending_earnings: 0,
            cash_in_hand: 0,
            created_at: new Date(),
            updated_at: new Date(),
          });
          created++;
          console.log(`[DeliveryManService] Created delivery_men record for user ${email}`);
        } catch (err: any) {
          errors.push(`Failed to create record for ${email}: ${err.message}`);
        }
      }

      return {
        success: true,
        message: `Synced delivery men: ${created} created, ${updated} updated, ${skipped} skipped`,
        data: {
          totalAuthUsers: deliveryManUsers.length,
          created,
          updated,
          skipped,
          errors: errors.length > 0 ? errors : undefined,
        },
      };
    } catch (error: any) {
      console.error('[DeliveryManService] Failed to sync delivery men from auth:', error);
      throw new BadRequestException('Failed to sync delivery men from auth: ' + error.message);
    }
  }

  /**
   * Get all delivery men with filters
   */
  async findAll(query: QueryDeliveryMenDto) {
    const { page = 1, limit = 20, status, availability, type, zoneId, search } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.db.query_builder()
      .from('delivery_men')
      .select('*')
      .whereNull('deleted_at');

    if (status) {
      queryBuilder = queryBuilder.where('status', status);
    }

    if (availability) {
      queryBuilder = queryBuilder.where('availability', availability);
    }

    if (type) {
      queryBuilder = queryBuilder.where('type', type);
    }

    if (zoneId) {
      queryBuilder = queryBuilder.where('zone_id', zoneId);
    }

    if (search) {
      queryBuilder = queryBuilder.where('name', 'ILIKE', `%${search}%`);
    }

    const deliveryMen = await queryBuilder
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .get();

    // Get total count
    const countQuery = this.db.query_builder()
      .from('delivery_men')
      .select('id')
      .whereNull('deleted_at');
    const allRecords = await countQuery.get();
    const totalCount = allRecords?.length || 0;

    return {
      data: (deliveryMen || []).map((dm: any) => this.transformDeliveryMan(dm)),
      total: totalCount,
      page,
      limit,
    };
  }

  /**
   * Find delivery man by user ID
   */
  async findByUserId(userId: string) {
    const result = await this.db.query_builder()
      .from('delivery_men')
      .select('*')
      .where('user_id', userId)
      .whereNull('deleted_at')
      .get();

    if (!result || result.length === 0) {
      return null;
    }

    return this.transformDeliveryMan(result[0]);
  }

  /**
   * Find delivery man by email
   */
  async findByEmail(email: string) {
    const result = await this.db.query_builder()
      .from('delivery_men')
      .select('*')
      .where('email', email)
      .whereNull('deleted_at')
      .get();

    if (!result || result.length === 0) {
      return null;
    }

    return this.transformDeliveryMan(result[0]);
  }

  /**
   * Link delivery man to auth user
   */
  async linkToUser(deliveryManId: string, userId: string) {
    await this.db.updateEntity('delivery_men', deliveryManId, {
      user_id: userId,
      updated_at: new Date(),
    });
  }

  /**
   * Get delivery man by ID
   */
  async findById(id: string) {
    const deliveryMan = await this.db.getEntity('delivery_men', id);

    if (!deliveryMan || deliveryMan.deleted_at) {
      throw new NotFoundException('Delivery man not found');
    }

    // Get recent deliveries (may fail if table doesn't exist)
    let recentDeliveries = [];
    try {
      recentDeliveries = await this.db.query_builder()
        .from('delivery_assignments')
        .select('*')
        .where('delivery_man_id', id)
        .orderBy('created_at', 'DESC')
        .limit(10)
        .get() || [];
    } catch (e) {
      console.log('[DeliveryManService] delivery_assignments query failed in findById');
    }

    // Get reviews (may fail if table doesn't exist)
    let reviews = [];
    try {
      reviews = await this.db.query_builder()
        .from('delivery_man_reviews')
        .select('*')
        .where('delivery_man_id', id)
        .orderBy('created_at', 'DESC')
        .limit(5)
        .get() || [];
    } catch (e) {
      console.log('[DeliveryManService] delivery_man_reviews query failed in findById');
    }

    return {
      data: {
        ...this.transformDeliveryMan(deliveryMan),
        recentDeliveries,
        recentReviews: reviews,
      },
    };
  }

  /**
   * Update delivery man profile
   */
  async update(id: string, dto: UpdateDeliveryManDto, requesterId: string) {
    const deliveryMan = await this.db.getEntity('delivery_men', id);

    if (!deliveryMan || deliveryMan.deleted_at) {
      throw new NotFoundException('Delivery man not found');
    }

    // Only the delivery man or admin can update
    if (deliveryMan.user_id && deliveryMan.user_id !== requesterId) {
      // Check if requester is admin - for now allow
    }

    const updates: any = { updated_at: new Date() };

    if (dto.name) updates.name = dto.name;
    if (dto.phone) updates.phone = dto.phone;
    if (dto.type) updates.type = dto.type;
    if (dto.vehicleType) updates.vehicle_type = dto.vehicleType;
    if (dto.vehicleNumber) updates.vehicle_number = dto.vehicleNumber;
    if (dto.imageUrl) updates.image_url = dto.imageUrl;
    if (dto.zoneId) updates.zone_id = dto.zoneId;
    if (dto.minDeliveryDistance !== undefined) updates.min_delivery_distance = dto.minDeliveryDistance;
    if (dto.maxDeliveryDistance !== undefined) updates.max_delivery_distance = dto.maxDeliveryDistance;
    if (dto.address) updates.address = dto.address;

    const updated = await this.db.updateEntity('delivery_men', id, updates);

    return {
      data: this.transformDeliveryMan(updated),
      message: 'Profile updated successfully',
    };
  }

  /**
   * Update delivery man status (admin)
   */
  async updateStatus(id: string, dto: UpdateDeliveryManStatusDto) {
    const deliveryMan = await this.db.getEntity('delivery_men', id);

    if (!deliveryMan || deliveryMan.deleted_at) {
      throw new NotFoundException('Delivery man not found');
    }

    const updated = await this.db.updateEntity('delivery_men', id, {
      status: dto.status,
      status_reason: dto.reason,
      status_updated_at: new Date(),
      updated_at: new Date(),
    });

    // TODO: Send notification to delivery man about status change

    return {
      data: this.transformDeliveryMan(updated),
      message: `Status updated to ${dto.status}`,
    };
  }

  /**
   * Delete delivery man (soft delete)
   */
  async delete(id: string) {
    const deliveryMan = await this.db.getEntity('delivery_men', id);

    if (!deliveryMan || deliveryMan.deleted_at) {
      throw new NotFoundException('Delivery man not found');
    }

    // Check for active deliveries
    const activeDeliveries = await this.db.query_builder()
      .from('delivery_assignments')
      .select('id')
      .where('delivery_man_id', id)
      .whereIn('status', ['assigned', 'picked_up', 'on_the_way'])
      .get();

    if (activeDeliveries && activeDeliveries.length > 0) {
      throw new BadRequestException('Cannot delete delivery man with active deliveries');
    }

    await this.db.updateEntity('delivery_men', id, {
      deleted_at: new Date(),
      status: DeliveryManStatus.INACTIVE,
    });

    return { message: 'Delivery man deleted successfully' };
  }

  // ============================================
  // AVAILABILITY & LOCATION
  // ============================================

  /**
   * Update availability status
   */
  async updateAvailability(id: string, dto: UpdateAvailabilityDto) {
    const deliveryMan = await this.db.getEntity('delivery_men', id);

    if (!deliveryMan || deliveryMan.deleted_at) {
      throw new NotFoundException('Delivery man not found');
    }

    if (deliveryMan.status !== DeliveryManStatus.ACTIVE) {
      throw new BadRequestException('Account is not active');
    }

    const updates: any = {
      availability: dto.availability,
      updated_at: new Date(),
    };

    if (dto.location) {
      updates.current_location = {
        lat: dto.location.lat,
        lng: dto.location.lng,
        updated_at: new Date(),
      };
    }

    const updated = await this.db.updateEntity('delivery_men', id, updates);

    return {
      data: this.transformDeliveryMan(updated),
      message: `Now ${dto.availability}`,
    };
  }

  /**
   * Update current location (real-time tracking)
   */
  async updateLocation(id: string, dto: UpdateLocationDto) {
    const deliveryMan = await this.db.getEntity('delivery_men', id);

    if (!deliveryMan || deliveryMan.deleted_at) {
      throw new NotFoundException('Delivery man not found');
    }

    const updated = await this.db.updateEntity('delivery_men', id, {
      current_location: {
        lat: dto.lat,
        lng: dto.lng,
        heading: dto.heading,
        speed: dto.speed,
        updated_at: new Date(),
      },
      updated_at: new Date(),
    });

    // Also update any active delivery tracking
    const activeAssignment = await this.db.query_builder()
      .from('delivery_assignments')
      .select('id')
      .where('delivery_man_id', id)
      .whereIn('status', ['picked_up', 'on_the_way'])
      .get();

    if (activeAssignment && activeAssignment.length > 0) {
      // Log location for tracking history
      await this.db.createEntity('delivery_location_logs', {
        delivery_man_id: id,
        assignment_id: activeAssignment[0].id,
        lat: dto.lat,
        lng: dto.lng,
        heading: dto.heading,
        speed: dto.speed,
        created_at: new Date(),
      });
    }

    return { success: true };
  }

  /**
   * Get available delivery men near a location
   */
  async findNearby(lat: number, lng: number, radiusKm: number = 5, zoneId?: string) {
    // Get all online, active delivery men
    let queryBuilder = this.db.query_builder()
      .from('delivery_men')
      .select('*')
      .where('status', DeliveryManStatus.ACTIVE)
      .where('availability', DeliveryManAvailability.ONLINE)
      .whereNull('deleted_at');

    if (zoneId) {
      queryBuilder = queryBuilder.where('zone_id', zoneId);
    }

    const deliveryMen = await queryBuilder.get();

    // Filter by distance using Haversine formula
    const nearby = (deliveryMen || []).filter((dm: any) => {
      if (!dm.current_location?.lat || !dm.current_location?.lng) return false;

      const distance = this.calculateDistance(
        lat,
        lng,
        dm.current_location.lat,
        dm.current_location.lng
      );

      return distance <= radiusKm;
    }).map((dm: any) => ({
      ...this.transformDeliveryMan(dm),
      distance: this.calculateDistance(lat, lng, dm.current_location.lat, dm.current_location.lng),
    })).sort((a: any, b: any) => a.distance - b.distance);

    return { data: nearby };
  }

  // ============================================
  // ORDER MANAGEMENT
  // ============================================

  /**
   * Assign order to delivery man (admin/system)
   */
  async assignOrder(dto: AssignOrderDto) {
    console.log('[DeliveryManService] assignOrder called with:', JSON.stringify(dto));

    const deliveryMan = await this.db.getEntity('delivery_men', dto.deliveryManId);
    console.log('[DeliveryManService] Found delivery man:', deliveryMan?.id, deliveryMan?.name, 'status:', deliveryMan?.status);

    if (!deliveryMan || deliveryMan.deleted_at) {
      throw new NotFoundException('Delivery man not found');
    }

    // Allow assignment to pending delivery men for flexibility
    if (deliveryMan.status !== DeliveryManStatus.ACTIVE && deliveryMan.status !== 'pending') {
      throw new BadRequestException('Delivery man is not active or pending');
    }

    // Check order exists - handle both UUID and order number (FLX-YYYY-XXXXX)
    let order: any = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.orderId);

    if (isUuid) {
      order = await this.db.getEntity('orders', dto.orderId);
    } else {
      // Look up by order number
      console.log('[DeliveryManService] Looking up order by number:', dto.orderId);
      const orders = await this.db.query_builder()
        .from('orders')
        .select('*')
        .where('order_number', dto.orderId)
        .get();
      order = orders?.[0];
    }

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    console.log('[DeliveryManService] Found order:', order.id, order.order_number);

    // Get shop info for pickup address
    let shop = null;
    if (order.shop_id) {
      try {
        shop = await this.db.getEntity('shops', order.shop_id);
      } catch (e) {
        console.log('[DeliveryManService] Could not fetch shop for order');
      }
    }

    // Prepare pickup and delivery addresses
    const shippingAddress = order.shipping_address || order.shippingAddress || {};
    const pickupAddress = {
      shopName: shop?.name || 'Store',
      address: shop?.address || 'Pickup location',
      contactPhone: shop?.phone || '',
      contactName: shop?.ownerName || 'Store Manager',
    };
    const deliveryAddress = {
      customerName: shippingAddress.full_name || shippingAddress.fullName || shippingAddress.name || 'Customer',
      address: [
        shippingAddress.address || shippingAddress.street,
        shippingAddress.city,
        shippingAddress.state,
        shippingAddress.postal_code || shippingAddress.postalCode,
      ].filter(Boolean).join(', ') || 'Delivery address',
      customerPhone: shippingAddress.phone || '',
    };

    // Create assignment with addresses (use actual order UUID, not order number)
    const actualOrderId = order.id;
    const deliveryFee = dto.deliveryFee ?? order.delivery_fee ?? order.deliveryFee ?? 5.00;
    console.log('[DeliveryManService] Creating assignment for order:', actualOrderId, 'delivery_man_id:', dto.deliveryManId, 'delivery_fee:', deliveryFee);
    const assignment = await this.db.createEntity('delivery_assignments', {
      order_id: actualOrderId,
      delivery_man_id: dto.deliveryManId,
      shop_id: order.shop_id,
      status: 'assigned',
      assigned_at: new Date(),
      pickup_address: pickupAddress,
      delivery_address: deliveryAddress,
      delivery_fee: deliveryFee,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Also update the order with the delivery fee for tracking
    try {
      await this.db.updateEntity('orders', actualOrderId, {
        delivery_fee: deliveryFee,
        delivery_man_id: dto.deliveryManId,
        updated_at: new Date(),
      });
    } catch (e) {
      console.log('[DeliveryManService] Could not update order with delivery fee:', e.message);
    }
    console.log('[DeliveryManService] Assignment created:', assignment?.id);

    // Delivery man stays ONLINE until they accept the order
    // Status will change to ON_DELIVERY when they accept

    // TODO: Send notification to delivery man

    return {
      data: assignment,
      message: 'Order assigned successfully',
    };
  }

  /**
   * Accept order assignment (delivery man)
   */
  async acceptOrder(deliveryManId: string, dto: AcceptOrderDto) {
    try {
      console.log('[DeliveryManService] acceptOrder called:', { deliveryManId, orderId: dto.orderId });

      const assignment = await this.db.query_builder()
        .from('delivery_assignments')
        .select('*')
        .where('order_id', dto.orderId)
        .where('delivery_man_id', deliveryManId)
        .where('status', 'assigned')
        .get();

      console.log('[DeliveryManService] Found assignments:', assignment?.length || 0);

      if (!assignment || assignment.length === 0) {
        throw new NotFoundException('Assignment not found');
      }

      console.log('[DeliveryManService] Updating assignment:', assignment[0].id);
      const updated = await this.db.updateEntity('delivery_assignments', assignment[0].id, {
        status: 'accepted',
        status_updated_at: new Date(),
        updated_at: new Date(),
      });

      // Update delivery man availability to ON_DELIVERY
      await this.db.updateEntity('delivery_men', deliveryManId, {
        availability: DeliveryManAvailability.ON_DELIVERY,
        updated_at: new Date(),
      });

      console.log('[DeliveryManService] Assignment updated successfully');
      return {
        data: updated,
        message: 'Order accepted',
      };
    } catch (error: any) {
      console.error('[DeliveryManService] acceptOrder error:', error.message);
      throw error;
    }
  }

  /**
   * Reject order assignment (delivery man)
   */
  async rejectOrder(deliveryManId: string, dto: RejectOrderDto) {
    const assignment = await this.db.query_builder()
      .from('delivery_assignments')
      .select('*')
      .where('order_id', dto.orderId)
      .where('delivery_man_id', deliveryManId)
      .where('status', 'assigned')
      .get();

    if (!assignment || assignment.length === 0) {
      throw new NotFoundException('Assignment not found');
    }

    await this.db.updateEntity('delivery_assignments', assignment[0].id, {
      status: 'rejected',
      status_updated_at: new Date(),
      rejection_reason: dto.reason,
      updated_at: new Date(),
    });

    // Update delivery man availability back to online
    await this.db.updateEntity('delivery_men', deliveryManId, {
      availability: DeliveryManAvailability.ONLINE,
      updated_at: new Date(),
    });

    // TODO: Auto-assign to another delivery man or notify admin

    return { message: 'Order rejected' };
  }

  /**
   * Mark order as picked up
   */
  async markPickedUp(deliveryManId: string, orderId: string) {
    const assignment = await this.db.query_builder()
      .from('delivery_assignments')
      .select('*')
      .where('order_id', orderId)
      .where('delivery_man_id', deliveryManId)
      .where('status', 'accepted')
      .get();

    if (!assignment || assignment.length === 0) {
      throw new NotFoundException('Assignment not found');
    }

    const updated = await this.db.updateEntity('delivery_assignments', assignment[0].id, {
      status: 'picked_up',
      picked_up_at: new Date(),
      updated_at: new Date(),
    });

    // Update order status
    await this.db.updateEntity('orders', orderId, {
      status: 'out_for_delivery',
      updated_at: new Date(),
    });

    return {
      data: updated,
      message: 'Order picked up',
    };
  }

  /**
   * Mark order as on the way
   */
  async markOnTheWay(deliveryManId: string, orderId: string) {
    const assignment = await this.db.query_builder()
      .from('delivery_assignments')
      .select('*')
      .where('order_id', orderId)
      .where('delivery_man_id', deliveryManId)
      .where('status', 'picked_up')
      .get();

    if (!assignment || assignment.length === 0) {
      throw new NotFoundException('Assignment not found');
    }

    const updated = await this.db.updateEntity('delivery_assignments', assignment[0].id, {
      status: 'on_the_way',
      updated_at: new Date(),
    });

    return {
      data: updated,
      message: 'On the way to customer',
    };
  }

  /**
   * Complete delivery
   */
  async completeDelivery(deliveryManId: string, dto: CompleteDeliveryDto) {
    const assignment = await this.db.query_builder()
      .from('delivery_assignments')
      .select('*')
      .where('order_id', dto.orderId)
      .where('delivery_man_id', deliveryManId)
      .whereIn('status', ['picked_up', 'on_the_way'])
      .get();

    if (!assignment || assignment.length === 0) {
      throw new NotFoundException('Assignment not found');
    }

    // Get delivery fee and tip from assignment (more reliable than order)
    const assignmentDeliveryFee = Number(assignment[0].delivery_fee) || 0;
    const assignmentTip = Number(assignment[0].tip) || 0;

    // Complete assignment
    await this.db.updateEntity('delivery_assignments', assignment[0].id, {
      status: 'delivered',
      delivered_at: new Date(),
      status_updated_at: new Date(),
      proof_of_delivery: {
        image_url: dto.proofImageUrl,
        signature_url: dto.signatureUrl,
        recipient_name: dto.recipientName,
      },
      notes: dto.notes,
      updated_at: new Date(),
    });

    // Update order status
    const order = await this.db.getEntity('orders', dto.orderId);
    await this.db.updateEntity('orders', dto.orderId, {
      status: 'delivered',
      delivered_at: new Date(),
      updated_at: new Date(),
    });

    // Calculate earnings from assignment's delivery_fee + tip
    const deliveryFee = assignmentDeliveryFee || Number(order?.delivery_fee) || 5.00;
    const tip = assignmentTip;

    // Get settings for commission
    const settings = await this.getSettings();
    const commissionPercent = settings?.defaultCommissionPercent || 80;
    // Earnings = (delivery_fee * commission%) + full tip
    const earnings = ((deliveryFee * commissionPercent) / 100) + tip;

    console.log('[DeliveryManService] completeDelivery - deliveryFee:', deliveryFee, 'tip:', tip, 'earnings:', earnings);

    // Update delivery man earnings
    const deliveryMan = await this.db.getEntity('delivery_men', deliveryManId);
    await this.db.updateEntity('delivery_men', deliveryManId, {
      total_deliveries: (deliveryMan.total_deliveries || 0) + 1,
      total_earnings: (deliveryMan.total_earnings || 0) + earnings,
      pending_earnings: (deliveryMan.pending_earnings || 0) + earnings,
      cash_in_hand: order?.payment_method === 'cash'
        ? (deliveryMan.cash_in_hand || 0) + (order?.total || 0)
        : deliveryMan.cash_in_hand,
      availability: DeliveryManAvailability.ONLINE,
      updated_at: new Date(),
    });

    return {
      message: 'Delivery completed successfully',
      earnings,
    };
  }

  /**
   * Get assigned orders for delivery man
   */
  async getMyOrders(deliveryManId: string, status?: string) {
    try {
      console.log(`[DeliveryManService] getMyOrders called with deliveryManId=${deliveryManId}, status=${status}`);

      let queryBuilder = this.db.query_builder()
        .from('delivery_assignments')
        .select('*')
        .where('delivery_man_id', deliveryManId);

      if (status) {
        // Handle comma-separated status values (e.g., "ASSIGNED,ACCEPTED,PICKED_UP")
        const statuses = status.split(',').map(s => s.trim().toLowerCase());
        console.log(`[DeliveryManService] Filtering by statuses:`, statuses);
        if (statuses.length === 1) {
          queryBuilder = queryBuilder.where('status', statuses[0]);
        } else {
          queryBuilder = queryBuilder.whereIn('status', statuses);
        }
      }
      // If no status provided, return ALL orders (no filter)

      const assignments = await queryBuilder
        .orderBy('created_at', 'DESC')
        .get();

      console.log(`[DeliveryManService] Found ${assignments?.length || 0} assignments`);

      // Fetch order details and format for frontend
      const ordersWithDetails = await Promise.all(
        (assignments || []).map(async (a: any) => {
          try {
            const order = await this.db.getEntity('orders', a.order_id);
            console.log('[DeliveryManService] Order shipping_address:', JSON.stringify(order?.shipping_address));
            console.log('[DeliveryManService] Assignment delivery_address:', JSON.stringify(a.delivery_address));

            // Parse delivery_address if it's a string
            let assignmentDeliveryAddress = a.delivery_address;
            if (typeof a.delivery_address === 'string') {
              try {
                assignmentDeliveryAddress = JSON.parse(a.delivery_address);
              } catch (e) {
                assignmentDeliveryAddress = {};
              }
            }

            // Parse pickup_address if it's a string
            let assignmentPickupAddress = a.pickup_address;
            if (typeof a.pickup_address === 'string') {
              try {
                assignmentPickupAddress = JSON.parse(a.pickup_address);
              } catch (e) {
                assignmentPickupAddress = {};
              }
            }

            const shippingAddress = order?.shipping_address || order?.shippingAddress || {};

            // Get shop info for pickup address
            let shop = null;
            if (order?.shop_id || a.shop_id) {
              try {
                shop = await this.db.getEntity('shops', order?.shop_id || a.shop_id);
              } catch (e) {
                console.log('[DeliveryManService] Could not fetch shop');
              }
            }

            // Format response for frontend
            return {
              id: a.id,
              orderId: a.order_id,
              orderNumber: order?.order_number || order?.orderNumber || `ORD-${a.order_id?.slice(0, 8)}`,
              status: a.status?.toUpperCase() || 'ASSIGNED',
              deliveryFee: a.delivery_fee || order?.delivery_fee || order?.deliveryFee || 5.00,
              tip: a.tip || 0,
              distance: a.estimated_distance || null,
              estimatedTime: a.estimated_duration || null,
              notes: a.note || order?.notes || order?.deliveryNotes || '',
              assignedAt: a.assigned_at,
              pickedUpAt: a.picked_up_at,
              deliveredAt: a.delivered_at,
              pickupAddress: (assignmentPickupAddress && Object.keys(assignmentPickupAddress).length > 0)
                ? assignmentPickupAddress
                : {
                    shopName: shop?.name || order?.shopName || 'Store',
                    address: shop?.address || order?.pickupAddress || 'Pickup location',
                    contactPhone: shop?.phone || order?.shopPhone || '',
                  },
              deliveryAddress: (assignmentDeliveryAddress && Object.keys(assignmentDeliveryAddress).length > 0 && assignmentDeliveryAddress.customerName)
                ? assignmentDeliveryAddress
                : {
                    customerName: shippingAddress.full_name || shippingAddress.fullName || shippingAddress.name || order?.customer?.name || 'Customer',
                    address: [
                      shippingAddress.address || shippingAddress.street,
                      shippingAddress.city,
                      shippingAddress.state,
                      shippingAddress.postal_code || shippingAddress.postalCode,
                    ].filter(Boolean).join(', ') || 'Delivery address',
                    customerPhone: shippingAddress.phone || order?.customer?.phone || '',
                  },
              order: order, // Keep original order for reference
            };
          } catch (orderErr) {
            console.log(`[DeliveryManService] Failed to fetch order ${a.order_id}:`, orderErr);
            return {
              id: a.id,
              orderId: a.order_id,
              orderNumber: `ORD-${a.order_id?.slice(0, 8)}`,
              status: a.status?.toUpperCase() || 'ASSIGNED',
              deliveryFee: a.delivery_fee || 5.00,
              tip: a.tip || 0,
              notes: a.note || '',
              assignedAt: a.assigned_at,
              pickedUpAt: a.picked_up_at,
              deliveredAt: a.delivered_at,
              pickupAddress: a.pickup_address || { shopName: 'Store', address: 'Pickup location' },
              deliveryAddress: a.delivery_address || { customerName: 'Customer', address: 'Delivery address' },
            };
          }
        })
      );

      return { data: ordersWithDetails };
    } catch (error: any) {
      console.error(`[DeliveryManService] getMyOrders error:`, error);
      // Return empty data instead of throwing, since the table might not exist yet
      return { data: [], message: 'No orders found or table not initialized' };
    }
  }

  /**
   * Get delivery history
   */
  async getDeliveryHistory(deliveryManId: string, page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;

      const assignments = await this.db.query_builder()
        .from('delivery_assignments')
        .select('*')
        .where('delivery_man_id', deliveryManId)
        .where('status', 'delivered')
        .orderBy('delivered_at', 'DESC')
        .limit(limit)
        .offset(offset)
        .get();

      console.log('[DeliveryManService] getDeliveryHistory - found', assignments?.length || 0, 'assignments');
      if (assignments?.length > 0) {
        console.log('[DeliveryManService] First assignment delivery_fee:', assignments[0].delivery_fee);
      }

      // Transform assignments to include proper fields
      const transformedAssignments = await Promise.all(
        (assignments || []).map(async (a: any) => {
          // Get order details
          let order = null;
          try {
            order = await this.db.getEntity('orders', a.order_id);
          } catch (e) {
            // Order might not exist
          }

          // Parse JSON fields if needed
          let pickupAddress = a.pickup_address;
          let deliveryAddress = a.delivery_address;

          if (typeof pickupAddress === 'string') {
            try { pickupAddress = JSON.parse(pickupAddress); } catch (e) { pickupAddress = {}; }
          }
          if (typeof deliveryAddress === 'string') {
            try { deliveryAddress = JSON.parse(deliveryAddress); } catch (e) { deliveryAddress = {}; }
          }

          return {
            id: a.id,
            orderId: a.order_id,
            orderNumber: order?.order_number || a.order_id?.slice(-8)?.toUpperCase(),
            status: a.status,
            deliveryFee: Number(a.delivery_fee) || 5.00,
            tip: Number(a.tip) || 0,
            pickupAddress: pickupAddress || {},
            deliveryAddress: deliveryAddress || {},
            assignedAt: a.assigned_at,
            acceptedAt: a.status_updated_at,
            pickedUpAt: a.picked_up_at,
            deliveredAt: a.delivered_at,
            distance: a.estimated_distance,
            duration: a.estimated_duration,
            notes: a.notes,
          };
        })
      );

      return {
        data: transformedAssignments,
        page,
        limit,
        total: transformedAssignments.length,
      };
    } catch (error: any) {
      console.error('[DeliveryManService] getDeliveryHistory error:', error.message);
      return { data: [], page, limit };
    }
  }

  // ============================================
  // EARNINGS & WITHDRAWALS
  // ============================================

  /**
   * Recalculate and sync earnings from completed deliveries
   */
  async syncEarnings(deliveryManId: string) {
    const deliveryMan = await this.db.getEntity('delivery_men', deliveryManId);
    if (!deliveryMan) {
      throw new NotFoundException('Delivery man not found');
    }

    // Get all completed deliveries
    const completedDeliveries = await this.db.query_builder()
      .from('delivery_assignments')
      .select('*')
      .where('delivery_man_id', deliveryManId)
      .where('status', 'delivered')
      .get() || [];

    // Calculate total earnings from all completed deliveries
    let totalEarnings = 0;
    let totalCashInHand = 0;

    for (const d of completedDeliveries) {
      const deliveryFee = Number(d.delivery_fee) || 0;
      const tip = Number(d.tip) || 0;
      totalEarnings += deliveryFee + tip;

      // Check if order was cash payment
      if (d.order_id) {
        try {
          const order = await this.db.getEntity('orders', d.order_id);
          if (order?.payment_method === 'cash') {
            totalCashInHand += Number(order.total) || 0;
          }
        } catch (e) {
          // Order might not exist
        }
      }
    }

    // Get total withdrawals (count pending and completed, not rejected)
    let totalWithdrawals = 0;
    try {
      const withdrawals = await this.db.query_builder()
        .from('delivery_man_withdrawals')
        .select('*')
        .where('delivery_man_id', deliveryManId)
        .get() || [];

      // Count pending and completed withdrawals (not rejected)
      totalWithdrawals = withdrawals
        .filter((w: any) => w.status !== 'rejected')
        .reduce((sum: number, w: any) => sum + (Number(w.amount) || 0), 0);
    } catch (e) {
      console.log('[DeliveryManService] Could not fetch withdrawals');
    }

    // Calculate pending earnings (total - withdrawn)
    const pendingEarnings = Math.max(0, totalEarnings - totalWithdrawals);

    // Update delivery man record
    console.log('[DeliveryManService] syncEarnings - updating delivery_men with:', {
      total_deliveries: completedDeliveries.length,
      total_earnings: totalEarnings,
      pending_earnings: pendingEarnings,
      cash_in_hand: totalCashInHand,
    });

    try {
      const updateResult = await this.db.updateEntity('delivery_men', deliveryManId, {
        total_deliveries: completedDeliveries.length,
        total_earnings: totalEarnings,
        pending_earnings: pendingEarnings,
        cash_in_hand: totalCashInHand,
        updated_at: new Date(),
      });
      console.log('[DeliveryManService] syncEarnings - update result:', JSON.stringify(updateResult));
    } catch (updateError: any) {
      console.error('[DeliveryManService] syncEarnings - update failed:', updateError.message);
    }

    console.log('[DeliveryManService] syncEarnings - totalDeliveries:', completedDeliveries.length, 'totalEarnings:', totalEarnings, 'pendingEarnings:', pendingEarnings);

    return {
      data: {
        totalDeliveries: completedDeliveries.length,
        totalEarnings,
        pendingEarnings,
        cashInHand: totalCashInHand,
        totalWithdrawals,
      },
      message: 'Earnings synced successfully',
    };
  }

  /**
   * Get earnings summary
   */
  async getEarnings(deliveryManId: string, period?: string) {
    try {
      const deliveryMan = await this.db.getEntity('delivery_men', deliveryManId);

      if (!deliveryMan) {
        throw new NotFoundException('Delivery man not found');
      }

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
          startDate = new Date(0); // All time
      }

      // Get deliveries in period (may fail if table doesn't exist)
      let deliveries = [];
      let periodEarnings = 0;
      let periodTips = 0;
      let periodDeliveryFees = 0;
      try {
        deliveries = await this.db.query_builder()
          .from('delivery_assignments')
          .select('*')
          .where('delivery_man_id', deliveryManId)
          .where('status', 'delivered')
          .where('delivered_at', '>=', startDate.toISOString())
          .orderBy('delivered_at', 'DESC')
          .get() || [];

        // Calculate earnings from delivery_fee and tip (not the earnings field which isn't set)
        deliveries.forEach((d: any) => {
          const deliveryFee = Number(d.delivery_fee) || 0;
          const tip = Number(d.tip) || 0;
          periodDeliveryFees += deliveryFee;
          periodTips += tip;
          periodEarnings += deliveryFee + tip;
        });
      } catch (e) {
        console.log('[DeliveryManService] delivery_assignments query failed, using defaults');
      }

      // Get withdrawals
      let withdrawals = [];
      try {
        withdrawals = await this.db.query_builder()
          .from('delivery_man_withdrawals')
          .select('*')
          .where('delivery_man_id', deliveryManId)
          .orderBy('created_at', 'DESC')
          .limit(10)
          .get() || [];
      } catch (e) {
        console.log('[DeliveryManService] delivery_man_withdrawals query failed, using defaults');
      }

      // Get recent completed deliveries for transaction list
      const recentDeliveries = deliveries.slice(0, 20).map((d: any) => ({
        id: d.id,
        orderId: d.order_id,
        deliveryFee: Number(d.delivery_fee) || 0,
        tip: Number(d.tip) || 0,
        total: (Number(d.delivery_fee) || 0) + (Number(d.tip) || 0),
        deliveredAt: d.delivered_at,
        status: 'completed',
      }));

      // Handle both snake_case and camelCase field names from database
      const dbTotalEarnings = Number(deliveryMan.total_earnings ?? deliveryMan.totalEarnings ?? 0);
      const dbPendingEarnings = Number(deliveryMan.pending_earnings ?? deliveryMan.pendingEarnings ?? 0);
      const dbCashInHand = Number(deliveryMan.cash_in_hand ?? deliveryMan.cashInHand ?? 0);

      // Use calculated periodEarnings as fallback if database values are 0
      const totalEarningsValue = dbTotalEarnings > 0 ? dbTotalEarnings : periodEarnings;
      const pendingEarningsValue = dbPendingEarnings > 0 ? dbPendingEarnings : periodEarnings;

      console.log('[DeliveryManService] getEarnings - dbPendingEarnings:', dbPendingEarnings, 'periodEarnings:', periodEarnings);

      return {
        data: {
          totalEarnings: totalEarningsValue,
          pendingEarnings: pendingEarningsValue,
          cashInHand: dbCashInHand,
          periodEarnings,
          periodDeliveryFees,
          periodTips,
          periodDeliveries: deliveries?.length || 0,
          recentWithdrawals: withdrawals,
          recentDeliveries,
        },
      };
    } catch (error: any) {
      console.error('[DeliveryManService] getEarnings error:', error.message);
      return {
        data: {
          totalEarnings: 0,
          pendingEarnings: 0,
          cashInHand: 0,
          periodEarnings: 0,
          periodDeliveryFees: 0,
          periodTips: 0,
          periodDeliveries: 0,
          recentWithdrawals: [],
          recentDeliveries: [],
        },
      };
    }
  }

  /**
   * Request withdrawal
   */
  async requestWithdrawal(deliveryManId: string, dto: WithdrawEarningsDto) {
    const deliveryMan = await this.db.getEntity('delivery_men', deliveryManId);

    if (!deliveryMan) {
      throw new NotFoundException('Delivery man not found');
    }

    // Handle both snake_case and camelCase field names, and convert string to number
    const pendingEarnings = Number(
      deliveryMan.pending_earnings ?? deliveryMan.pendingEarnings ?? 0
    );

    console.log('[DeliveryManService] requestWithdrawal - deliveryMan:', JSON.stringify(deliveryMan));
    console.log('[DeliveryManService] requestWithdrawal - pendingEarnings:', pendingEarnings, 'requested:', dto.amount);

    if (dto.amount > pendingEarnings) {
      throw new BadRequestException(`Insufficient balance. Available: ${pendingEarnings}, Requested: ${dto.amount}`);
    }

    // All withdrawals are auto-completed - shop owner handles payment manually
    const isCashWithdrawal = dto.paymentMethod === 'cash';

    const withdrawal = await this.db.createEntity('delivery_man_withdrawals', {
      delivery_man_id: deliveryManId,
      amount: dto.amount,
      payment_method: dto.paymentMethod,
      payment_details: dto.paymentDetails,
      status: 'completed',
      processed_at: new Date(),
      created_at: new Date(),
    });

    // Deduct from pending earnings
    await this.db.updateEntity('delivery_men', deliveryManId, {
      pending_earnings: pendingEarnings - dto.amount,
      // For cash, also deduct from cash_in_hand
      ...(isCashWithdrawal && {
        cash_in_hand: Math.max(0, Number(deliveryMan.cash_in_hand ?? deliveryMan.cashInHand ?? 0) - dto.amount),
      }),
      updated_at: new Date(),
    });

    return {
      data: withdrawal,
      message: 'Withdrawal completed successfully',
    };
  }

  // ============================================
  // REVIEWS & RATINGS
  // ============================================

  /**
   * Add review for delivery man
   */
  async addReview(dto: DeliveryManReviewDto, customerId: string) {
    // Get the delivery assignment for this order
    const assignment = await this.db.query_builder()
      .from('delivery_assignments')
      .select('*')
      .where('order_id', dto.orderId)
      .where('status', 'delivered')
      .get();

    if (!assignment || assignment.length === 0) {
      throw new NotFoundException('Delivery not found');
    }

    const deliveryManId = assignment[0].delivery_man_id;

    // Check if already reviewed
    const existingReview = await this.db.query_builder()
      .from('delivery_man_reviews')
      .select('id')
      .where('order_id', dto.orderId)
      .where('customer_id', customerId)
      .get();

    if (existingReview && existingReview.length > 0) {
      throw new ConflictException('Already reviewed this delivery');
    }

    // Create review
    const review = await this.db.createEntity('delivery_man_reviews', {
      delivery_man_id: deliveryManId,
      customer_id: customerId,
      order_id: dto.orderId,
      rating: dto.rating,
      comment: dto.comment,
      created_at: new Date(),
    });

    // Update delivery man rating
    const deliveryMan = await this.db.getEntity('delivery_men', deliveryManId);
    const newTotalReviews = (deliveryMan.total_reviews || 0) + 1;
    const newRating = ((deliveryMan.rating || 0) * (deliveryMan.total_reviews || 0) + dto.rating) / newTotalReviews;

    await this.db.updateEntity('delivery_men', deliveryManId, {
      rating: Math.round(newRating * 10) / 10,
      total_reviews: newTotalReviews,
      updated_at: new Date(),
    });

    return {
      data: review,
      message: 'Review submitted',
    };
  }

  /**
   * Get reviews for delivery man
   */
  async getReviews(deliveryManId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const reviews = await this.db.query_builder()
      .from('delivery_man_reviews')
      .select('*')
      .where('delivery_man_id', deliveryManId)
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .get();

    return {
      data: reviews || [],
      page,
      limit,
    };
  }

  // ============================================
  // SETTINGS & CONFIGURATION
  // ============================================

  /**
   * Get delivery man settings
   */
  async getSettings() {
    const settings = await this.db.query_builder()
      .from('platform_settings')
      .select('*')
      .where('key', 'delivery_man_settings')
      .get();

    if (settings && settings.length > 0) {
      return settings[0].value;
    }

    return {
      allowSelfRegistration: true,
      requireApproval: true,
      defaultCommissionPercent: 80,
      fixedCommissionAmount: 0,
      minCashInHand: 500,
      autoAssign: true,
      maxAutoAssignDistance: 5,
      acceptanceTimeout: 60,
    };
  }

  /**
   * Update delivery man settings (admin)
   */
  async updateSettings(dto: ConfigureDeliveryManSettingsDto) {
    const currentSettings = await this.getSettings();
    const newSettings = { ...currentSettings, ...dto };

    // Check if settings exist
    const existing = await this.db.query_builder()
      .from('platform_settings')
      .select('id')
      .where('key', 'delivery_man_settings')
      .get();

    if (existing && existing.length > 0) {
      await this.db.updateEntity('platform_settings', existing[0].id, {
        value: newSettings,
        updated_at: new Date(),
      });
    } else {
      await this.db.createEntity('platform_settings', {
        key: 'delivery_man_settings',
        value: newSettings,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    return {
      data: newSettings,
      message: 'Settings updated',
    };
  }

  // ============================================
  // DISPATCH OVERVIEW (Admin)
  // ============================================

  /**
   * Get dispatch overview for admin
   */
  async getDispatchOverview(zoneId?: string) {
    // Get delivery men stats
    let dmQuery = this.db.query_builder()
      .from('delivery_men')
      .select('*')
      .where('status', DeliveryManStatus.ACTIVE)
      .whereNull('deleted_at');

    if (zoneId) {
      dmQuery = dmQuery.where('zone_id', zoneId);
    }

    const deliveryMen = await dmQuery.get();

    const online = (deliveryMen || []).filter((dm: any) => dm.availability === DeliveryManAvailability.ONLINE);
    const onDelivery = (deliveryMen || []).filter((dm: any) => dm.availability === DeliveryManAvailability.ON_DELIVERY);

    // Get order stats
    const unassignedOrders = await this.db.query_builder()
      .from('orders')
      .select('id')
      .whereIn('status', ['confirmed', 'preparing'])
      .whereNull('delivery_man_id')
      .get();

    const activeDeliveries = await this.db.query_builder()
      .from('delivery_assignments')
      .select('*')
      .whereIn('status', ['assigned', 'accepted', 'picked_up', 'on_the_way'])
      .get();

    return {
      data: {
        deliveryMen: {
          total: deliveryMen?.length || 0,
          online: online.length,
          onDelivery: onDelivery.length,
        },
        orders: {
          unassigned: unassignedOrders?.length || 0,
          inProgress: activeDeliveries?.length || 0,
        },
        activeDeliveries: (activeDeliveries || []).map((a: any) => ({
          ...a,
          deliveryMan: deliveryMen?.find((dm: any) => dm.id === a.delivery_man_id),
        })),
        availableDeliveryMen: online.map((dm: any) => this.transformDeliveryMan(dm)),
      },
    };
  }

  // ============================================
  // PREFERRED ZONES
  // ============================================

  /**
   * Get preferred zones for delivery man
   */
  async getPreferredZones(deliveryManId: string) {
    try {
      const zones = await this.db.query_builder()
        .from('delivery_man_zones')
        .select('*')
        .where('delivery_man_id', deliveryManId)
        .where('is_active', true)
        .get() || [];

      return {
        data: zones.map((z: any) => ({
          id: z.id,
          zoneId: z.zone_id,
          isPrimary: z.is_primary,
          createdAt: z.created_at,
        })),
      };
    } catch (error: any) {
      console.log('[DeliveryManService] getPreferredZones error:', error.message);
      // If table doesn't exist, return empty array
      return { data: [] };
    }
  }

  /**
   * Update preferred zones for delivery man
   */
  async updatePreferredZones(deliveryManId: string, zoneIds: string[]) {
    const deliveryMan = await this.db.getEntity('delivery_men', deliveryManId);
    if (!deliveryMan) {
      throw new NotFoundException('Delivery man not found');
    }

    try {
      // Get current preferred zones
      const currentZones = await this.db.query_builder()
        .from('delivery_man_zones')
        .select('*')
        .where('delivery_man_id', deliveryManId)
        .get() || [];

      const currentZoneIds = currentZones.map((z: any) => z.zone_id);

      // Zones to add (in zoneIds but not in currentZoneIds)
      const zonesToAdd = zoneIds.filter(id => !currentZoneIds.includes(id));

      // Zones to remove (in currentZoneIds but not in zoneIds)
      const zonesToRemove = currentZoneIds.filter((id: string) => !zoneIds.includes(id));

      // Add new zones
      for (const zoneId of zonesToAdd) {
        await this.db.createEntity('delivery_man_zones', {
          delivery_man_id: deliveryManId,
          zone_id: zoneId,
          is_primary: zoneIds.indexOf(zoneId) === 0, // First zone is primary
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      // Deactivate removed zones
      for (const zoneId of zonesToRemove) {
        const zoneRecord = currentZones.find((z: any) => z.zone_id === zoneId);
        if (zoneRecord) {
          await this.db.updateEntity('delivery_man_zones', zoneRecord.id, {
            is_active: false,
            updated_at: new Date(),
          });
        }
      }

      // Update primary zone if needed
      if (zoneIds.length > 0) {
        // Set primary zone to be the first one in the list
        const allActiveZones = await this.db.query_builder()
          .from('delivery_man_zones')
          .select('*')
          .where('delivery_man_id', deliveryManId)
          .where('is_active', true)
          .get() || [];

        for (const z of allActiveZones) {
          const isPrimary = z.zone_id === zoneIds[0];
          if (z.is_primary !== isPrimary) {
            await this.db.updateEntity('delivery_man_zones', z.id, {
              is_primary: isPrimary,
              updated_at: new Date(),
            });
          }
        }

        // Also update the legacy zone_id field to the primary zone
        await this.db.updateEntity('delivery_men', deliveryManId, {
          zone_id: zoneIds[0],
          updated_at: new Date(),
        });
      }

      console.log('[DeliveryManService] updatePreferredZones - added:', zonesToAdd.length, 'removed:', zonesToRemove.length);

      return {
        data: { zoneIds },
        message: 'Preferred zones updated successfully',
      };
    } catch (error: any) {
      console.error('[DeliveryManService] updatePreferredZones error:', error.message);
      throw new BadRequestException('Failed to update preferred zones: ' + error.message);
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  private transformDeliveryMan(dm: any) {
    // Split name into firstName and lastName
    const nameParts = (dm.name || '').split(' ');
    const firstName = dm.first_name || nameParts[0] || '';
    const lastName = dm.last_name || nameParts.slice(1).join(' ') || '';

    return {
      id: dm.id,
      userId: dm.user_id,
      name: dm.name,
      firstName,
      lastName,
      email: dm.email,
      phone: dm.phone,
      type: dm.type,
      vehicleType: dm.vehicle_type,
      vehicleNumber: dm.vehicle_number,
      avatar: dm.image_url,
      imageUrl: dm.image_url,
      identityType: dm.identity_type,
      identityNumber: dm.identity_number,
      zoneId: dm.zone_id,
      address: dm.address,
      status: dm.status,
      statusReason: dm.status_reason,
      availability: dm.availability || 'ONLINE',
      currentLocation: dm.current_location,
      rating: Number(dm.rating) || 0,
      totalReviews: Number(dm.total_reviews) || 0,
      totalDeliveries: Number(dm.total_deliveries) || 0,
      completedDeliveries: Number(dm.completed_deliveries) || 0,
      totalEarnings: Number(dm.total_earnings) || 0,
      pendingEarnings: Number(dm.pending_earnings) || 0,
      cashInHand: Number(dm.cash_in_hand) || 0,
      minDeliveryDistance: dm.min_delivery_distance,
      maxDeliveryDistance: dm.max_delivery_distance,
      createdAt: dm.created_at,
      updatedAt: dm.updated_at,
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

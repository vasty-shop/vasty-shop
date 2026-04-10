import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnprocessableEntityException,
  Logger,
  Inject,
  forwardRef,
  Optional,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EntityType, OrderEntity, NotificationType } from '../../database/schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AddOrderNoteDto } from './dto/add-order-note.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { CurrencyService } from '../currency/currency.service';
import { StripeConnectService } from '../payment/stripe-connect.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly db: DatabaseService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
    private readonly currencyService: CurrencyService,
    @Optional()
    private readonly stripeConnectService?: StripeConnectService,
  ) {}

  /**
   * Create order from cart
   */
  async create(userId: string, createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    const { cartId, shippingAddress, paymentMethod, customerNote } = createOrderDto;

    // Get cart
    const cart = await this.db.getEntity(EntityType.CART, cartId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (cart.userId !== userId) {
      throw new ForbiddenException('This cart does not belong to you');
    }

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Check inventory for all items
    const unavailableItems = [];
    for (const item of cart.items) {
      const product = await this.db.getEntity(
        EntityType.PRODUCT,
        item.productId,
      );

      if (!product || product.status !== 'active') {
        unavailableItems.push(item.name);
      } else if (product.stock < item.quantity) {
        unavailableItems.push(
          `${item.name} (only ${product.stock} available)`,
        );
      }
    }

    if (unavailableItems.length > 0) {
      throw new UnprocessableEntityException({
        message: 'Some items are no longer available',
        unavailableItems,
      });
    }

    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    // Create order items
    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      productName: item.name,
      productImage: item.image,
      variant: item.variant,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.total,
      shopId: item.shopId,
      shopName: item.shopName,
    }));

    // Get shopId from first cart item (for single-shop orders)
    // For multi-vendor marketplaces, orders might need to be split by shop
    const shopId = cart.items[0]?.shopId || orderItems[0]?.shopId;
    if (!shopId) {
      throw new BadRequestException('Unable to determine shop for order');
    }

    // Check if this is a credit card payment and shop has Stripe Connect
    let stripePaymentData: {
      checkoutUrl?: string;
      sessionId?: string;
      stripeConnectEnabled?: boolean;
      platformFee?: number;
      vendorAmount?: number;
      useCheckoutSession?: boolean;
    } | null = null;

    // For credit card payments, check if vendor has Stripe Connect enabled
    this.logger.log(`[Create Order] Payment method: ${paymentMethod}, StripeConnectService available: ${!!this.stripeConnectService}`);
    this.logger.log(`[Create Order] ShopId: ${shopId}`);

    // We'll create the checkout session AFTER the order is created (need order ID)
    let shouldCreateCheckoutSession = false;
    if (paymentMethod === 'credit_card' && this.stripeConnectService) {
      try {
        const shop = await this.db.getEntity(EntityType.SHOP, shopId);

        // Handle both camelCase and snake_case field names (database may return snake_case)
        const stripeAccountId = shop?.stripeAccountId || shop?.stripe_account_id;
        const stripeChargesEnabled = shop?.stripeChargesEnabled ?? shop?.stripe_charges_enabled;
        const stripeConnectStatus = shop?.stripeConnectStatus || shop?.stripe_connect_status;

        this.logger.log(`[Create Order] Shop fetched:`, JSON.stringify({
          id: shop?.id,
          name: shop?.name,
          stripeAccountId,
          stripeChargesEnabled,
          stripeConnectStatus,
          rawFields: {
            stripeAccountId: shop?.stripeAccountId,
            stripe_account_id: shop?.stripe_account_id,
            stripeChargesEnabled: shop?.stripeChargesEnabled,
            stripe_charges_enabled: shop?.stripe_charges_enabled,
          }
        }, null, 2));

        if (shop && stripeAccountId && stripeChargesEnabled) {
          shouldCreateCheckoutSession = true;
          this.logger.log(`[Create Order] Will create Stripe Checkout Session after order is created`);
        } else {
          this.logger.warn(`[Create Order] Stripe Connect not enabled for shop. stripeAccountId: ${stripeAccountId}, stripeChargesEnabled: ${stripeChargesEnabled}`);
        }
      } catch (stripeError) {
        this.logger.error(`Failed to check Stripe Connect status: ${stripeError.message}`);
      }
    } else {
      this.logger.log(`[Create Order] Skipping Stripe - paymentMethod: ${paymentMethod}, stripeConnectService: ${!!this.stripeConnectService}`);
    }

    // Determine initial payment status
    // - COD: always pending
    // - Credit card with Stripe Connect: pending until payment confirmed via Stripe Checkout
    // - Credit card without Connect: paid (legacy behavior)
    let initialPaymentStatus = 'pending';
    if (paymentMethod === 'cash_on_delivery') {
      initialPaymentStatus = 'pending';
    } else if (shouldCreateCheckoutSession) {
      initialPaymentStatus = 'pending'; // Will be updated when Stripe Checkout completes
    } else {
      initialPaymentStatus = 'paid'; // Legacy: mark as paid immediately
    }

    // Create order - Note: Stripe Connect columns are optional
    // If the columns don't exist in DB yet, the order will still be created
    // and Stripe Connect data will be included in the response for frontend
    const orderData: Partial<OrderEntity> = {
      orderNumber,
      userId,
      shopId,
      items: orderItems,
      shippingAddress,
      billingAddress: shippingAddress, // Use shipping address as billing address by default
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      status: 'pending',
      subtotal: cart.subtotal,
      discount: cart.discount,
      tax: cart.tax,
      shippingCost: cart.shipping || 0,
      total: cart.total,
      appliedCoupons: cart.appliedCoupons || [],
      customerNote,
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Order placed successfully',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Note: Stripe Connect columns (stripe_payment_intent_id, stripe_connect_enabled,
    // platform_fee, vendor_amount) will be stored after the columns are added to DB.
    // For now, Stripe payment data is returned in the response for frontend to use.

    const order = await this.db.createEntity(EntityType.ORDER, orderData);

    // Create Stripe Checkout Session for credit card payments with Stripe Connect
    if (shouldCreateCheckoutSession && this.stripeConnectService) {
      try {
        // Get frontend URL for redirect URLs
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5186';

        // Prepare line items for Stripe Checkout
        const lineItems = orderItems.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
          image: item.productImage,
        }));

        // Use USD as platform currency
        const currency = 'USD';

        const checkoutResult = await this.stripeConnectService.createConnectedCheckoutSession(
          cart.total,
          currency,
          shopId,
          order.id,
          orderNumber,
          lineItems,
          `${frontendUrl}/checkout/confirmation`,
          `${frontendUrl}/checkout?canceled=true`,
          1, // 1% platform fee
        );

        stripePaymentData = {
          checkoutUrl: checkoutResult.checkoutUrl,
          sessionId: checkoutResult.sessionId,
          stripeConnectEnabled: true,
          platformFee: checkoutResult.platformFee,
          vendorAmount: checkoutResult.vendorAmount,
          useCheckoutSession: true,
        };

        this.logger.log(`[Create Order] Stripe Checkout Session created: ${checkoutResult.sessionId}`);
        this.logger.log(`[Create Order] Checkout URL: ${checkoutResult.checkoutUrl}`);
      } catch (stripeError) {
        this.logger.error(`Failed to create Stripe Checkout Session: ${stripeError.message}`);
        this.logger.error(`[Create Order] Stripe error stack:`, stripeError.stack);
        // Order is still created, but payment will need to be retried
        // The order can be paid later from the order details page
      }
    }

    this.logger.log(`[Create Order] shouldCreateCheckoutSession: ${shouldCreateCheckoutSession}, stripePaymentData: ${JSON.stringify(stripePaymentData)}`);


    // Add Stripe payment data to order response for frontend
    // Create a new object to ensure stripePayment is included in serialization
    let orderResponse = { ...order };
    if (stripePaymentData) {
      orderResponse = { ...order, stripePayment: stripePaymentData };
      this.logger.log(`[Create Order] Stripe payment data attached to order response:`, JSON.stringify(stripePaymentData, null, 2));
    } else {
      this.logger.log(`[Create Order] No Stripe payment data - shop may not have Stripe Connect enabled or payment method is not credit_card`);
    }

    // Lock inventory for ordered items
    await this.lockInventory(cart.items);

    // Clear cart after successful order
    await this.clearCart(cartId);

    // Send order created notification to CUSTOMER (database + WebSocket + email)
    try {
      await this.notificationsService.sendOrderNotification(
        order.id,
        NotificationType.ORDER_CREATED,
      );
    } catch (notificationError) {
      this.logger.error('Failed to send order created notification to customer', notificationError);
      // Don't fail order creation if notification fails
    }

    // Send notification to VENDOR(s) about new order
    try {
      await this.notificationsService.sendVendorOrderNotification(
        order.id,
        NotificationType.ORDER_CREATED,
      );
    } catch (vendorNotificationError) {
      this.logger.error('Failed to send order notification to vendor', vendorNotificationError);
      // Don't fail order creation if vendor notification fails
    }

    return orderResponse;
  }

  /**
   * Confirm payment for an order (after Stripe Checkout Session completes)
   * Can be called with either a session ID (for Checkout Sessions) or payment intent ID (legacy)
   */
  async confirmPayment(
    userId: string,
    orderId: string,
    paymentIntentId: string,
    sessionId?: string,
  ): Promise<OrderEntity> {
    this.logger.log(`[Confirm Payment] Called for order ${orderId} with paymentIntentId ${paymentIntentId}, sessionId ${sessionId}`);

    // If sessionId is provided, verify the checkout session first
    if (sessionId && this.stripeConnectService) {
      try {
        const sessionResult = await this.stripeConnectService.verifyCheckoutSession(sessionId);
        this.logger.log(`[Confirm Payment] Session verification result:`, sessionResult);

        if (!sessionResult.success) {
          throw new BadRequestException('Payment was not completed. Please try again.');
        }

        // Use the payment intent ID from the session
        if (sessionResult.paymentIntentId) {
          paymentIntentId = sessionResult.paymentIntentId;
        }

        // Verify the order ID matches
        if (sessionResult.orderId && sessionResult.orderId !== orderId) {
          throw new BadRequestException('Session does not match this order');
        }
      } catch (error) {
        this.logger.error(`[Confirm Payment] Session verification failed: ${error.message}`);
        throw new BadRequestException(`Payment verification failed: ${error.message}`);
      }
    }

    const order = await this.db.getEntity(EntityType.ORDER, orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    // If order is already paid, just return it
    if (order.paymentStatus === 'paid') {
      this.logger.log(`[Confirm Payment] Order ${orderId} is already paid`);
      return order;
    }

    // Update order payment status
    const updatedOrder = await this.db.updateEntity(EntityType.ORDER, orderId, {
      paymentStatus: 'paid',
      paidAt: new Date().toISOString(),
      transactionId: paymentIntentId, // Store payment intent ID in existing transactionId field
      timeline: [
        ...(order.timeline || []),
        {
          status: 'payment_confirmed',
          timestamp: new Date().toISOString(),
          note: 'Payment confirmed via Stripe Checkout',
        },
      ],
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`[Confirm Payment] Payment confirmed for order ${orderId}`);

    return updatedOrder;
  }

  /**
   * Get all orders for a user with pagination and filters
   * If shopId is provided, returns orders containing items from that shop (vendor mode)
   */
  async findAll(
    userId: string,
    filters?: {
      status?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      shopId?: string;
    },
  ): Promise<{ data: OrderEntity[]; total: number; page: number; pages: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    let queryFilters: any = {};

    // SECURITY: Always filter by userId for customer-facing endpoints
    // The shopId filter is ADDITIONAL, not a replacement for userId
    // Vendor-only endpoints should use findAllForShop() instead

    // Always filter by userId (customer's own orders)
    queryFilters.userId = userId;

    if (filters?.status) {
      queryFilters.status = filters.status;
    }

    // If shopId is provided, we're viewing orders from a specific shop
    // but still only the current user's orders
    if (filters?.shopId) {
      this.logger.log(`Fetching user ${userId} orders for shop: ${filters.shopId}, status: ${filters.status || 'all'}`);
    }

    const result = await this.db.queryEntities(EntityType.ORDER, {
      filters: queryFilters,
      sort: { created_at: 'desc' }, // Use snake_case for database query - latest first
      limit: limit,
      offset: offset,
    });

    let ordersData = result.data || [];

    // If filtering by shop, filter orders containing items from this shop
    // This is for customer-facing pages (e.g., storefront orders page)
    if (filters?.shopId) {
      ordersData = ordersData.filter((order) =>
        order.items?.some((item) => item.shopId === filters.shopId),
      );
      this.logger.log(`User ${userId} has ${ordersData.length} orders for shop ${filters.shopId}`);
    }

    // Normalize orders to ensure camelCase fields
    ordersData = ordersData.map((order) => this.normalizeOrderData(order));

    return {
      data: ordersData,
      total: result.count || ordersData.length,
      page,
      pages: Math.ceil((result.count || ordersData.length) / limit),
    };
  }

  /**
   * Get all orders for a shop (vendor mode - shop owner only)
   * This shows ALL orders containing items from the shop, regardless of customer
   */
  async findAllForShop(
    shopId: string,
    filters?: {
      status?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<{ data: OrderEntity[]; total: number; page: number; pages: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 100;

    let queryFilters: any = {};

    if (filters?.status) {
      queryFilters.status = filters.status;
    }

    this.logger.log(`[Vendor] Fetching all orders for shop: ${shopId}, status: ${filters?.status || 'all'}`);

    // Get all orders (we'll filter by shop items)
    const result = await this.db.queryEntities(EntityType.ORDER, {
      filters: queryFilters,
      sort: { created_at: 'desc' }, // Use snake_case for database query
      limit: 1000,
      offset: 0,
    });

    let ordersData = result.data || [];

    // Filter orders containing items from this shop
    ordersData = ordersData.filter((order) =>
      order.items?.some((item) => item.shopId === shopId),
    );

    this.logger.log(`[Vendor] Found ${ordersData.length} orders for shop ${shopId}`);

    // Enrich orders with customer information
    ordersData = await this.enrichOrdersWithCustomerInfo(ordersData);

    // Normalize orders to ensure camelCase fields
    ordersData = ordersData.map((order) => this.normalizeOrderData(order));

    // Sort by createdAt descending (latest first) after normalization
    ordersData.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
      const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
      return dateB - dateA; // Descending order (latest first)
    });

    // Apply pagination after filtering and sorting
    const total = ordersData.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    ordersData = ordersData.slice(startIndex, endIndex);

    return {
      data: ordersData,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all orders for admin (no user/shop filtering)
   */
  async findAllAdmin(
    filters?: {
      status?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<{ data: OrderEntity[]; total: number; page: number; pages: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 100;
    const offset = (page - 1) * limit;

    const queryFilters: any = {};

    if (filters?.status) {
      queryFilters.status = filters.status;
    }

    this.logger.log(`[Admin] Fetching all orders, status: ${filters?.status || 'all'}`);

    const result = await this.db.queryEntities(EntityType.ORDER, {
      filters: queryFilters,
      sort: { created_at: 'desc' }, // Use snake_case for database query - latest first
      limit,
      offset,
    });

    let ordersData = result.data || [];

    // Enrich orders with customer and shop information
    ordersData = await this.enrichOrdersWithCustomerInfo(ordersData);
    ordersData = await this.enrichOrdersWithShopInfo(ordersData);

    // Normalize orders to ensure camelCase fields
    ordersData = ordersData.map((order) => this.normalizeOrderData(order));

    this.logger.log(`[Admin] Found ${ordersData.length} orders`);

    return {
      data: ordersData,
      total: result.count || 0,
      page,
      pages: Math.ceil((result.count || 0) / limit),
    };
  }

  /**
   * Enrich orders with shop information
   */
  private async enrichOrdersWithShopInfo(orders: OrderEntity[]): Promise<OrderEntity[]> {
    const enrichedOrders = await Promise.all(
      orders.map(async (order: any) => {
        try {
          // Handle both snake_case and camelCase field names
          const shopId = order.shop_id || order.shopId;

          if (shopId) {
            const shop = await this.db.getEntity(EntityType.SHOP, shopId);
            if (shop) {
              return {
                ...order,
                shopName: shop.name || 'Unknown Shop',
                shop: {
                  id: shop.id,
                  name: shop.name || 'Unknown Shop',
                  slug: shop.slug,
                },
              };
            }
          }
        } catch (error) {
          this.logger.warn(`Failed to fetch shop for order ${order.id}:`, error);
        }
        return order;
      }),
    );
    return enrichedOrders;
  }

  /**
   * Enrich orders with customer information
   */
  private async enrichOrdersWithCustomerInfo(orders: OrderEntity[]): Promise<OrderEntity[]> {
    const enrichedOrders = await Promise.all(
      orders.map(async (order: any) => {
        try {
          // Handle both snake_case and camelCase field names
          const userId = order.user_id || order.userId;

          if (!userId) {
            return order;
          }

          // Fetch customer details from Supabase Auth
          const userResponse: any = await this.db.getUserById(userId);
          // Handle different response formats from Supabase
          const customer = userResponse?.data?.user || userResponse?.user || userResponse;

          if (customer && customer.email) {
            // Add customer info to order
            return {
              ...order,
              customer: {
                name: customer.user_metadata?.full_name ||
                      customer.user_metadata?.name ||
                      customer.raw_user_meta_data?.full_name ||
                      customer.email?.split('@')[0] ||
                      'Unknown',
                email: customer.email || 'N/A',
                firstName: customer.user_metadata?.first_name || customer.firstName,
                lastName: customer.user_metadata?.last_name || customer.lastName,
                avatar: customer.user_metadata?.avatar_url || customer.avatar,
                phone: customer.phone,
              },
            };
          }
        } catch (error) {
          this.logger.warn(`Failed to fetch customer for order ${order.id}:`, error);
        }

        return order;
      }),
    );

    return enrichedOrders;
  }

  /**
   * Get payment transactions for admin
   */
  async getAdminPaymentTransactions(
    filters?: {
      status?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: any[]; total: number; stats: any }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 100;
    const offset = (page - 1) * limit;

    // Derive payment transactions from orders
    const queryFilters: any = {};

    // Map payment status filter (use snake_case for database query)
    if (filters?.status && filters.status !== 'all') {
      if (filters.status === 'completed') {
        queryFilters.payment_status = 'paid';
      } else if (filters.status === 'pending') {
        queryFilters.payment_status = 'pending';
      } else if (filters.status === 'failed') {
        queryFilters.payment_status = 'failed';
      } else if (filters.status === 'refunded') {
        queryFilters.payment_status = 'refunded';
      }
    }

    const result = await this.db.queryEntities(EntityType.ORDER, {
      filters: queryFilters,
      sort: { created_at: 'desc' },
      limit,
      offset,
    });

    const orders = result.data || [];

    // Calculate stats from all orders (not just paginated)
    const allOrdersResult = await this.db.queryEntities(EntityType.ORDER, {
      filters: {},
    });
    const allOrders = allOrdersResult.data || [];

    // Helper to get payment status from order (handles both snake_case and camelCase)
    const getPaymentStatus = (o: any) => o.payment_status || o.paymentStatus || 'pending';
    const getTotal = (o: any) => parseFloat(o.total) || 0;

    const stats = {
      totalRevenue: allOrders
        .filter((o: any) => getPaymentStatus(o) === 'paid')
        .reduce((sum: number, o: any) => sum + getTotal(o), 0),
      pendingPayouts: allOrders
        .filter((o: any) => getPaymentStatus(o) === 'pending')
        .reduce((sum: number, o: any) => sum + getTotal(o), 0),
      completedTransactions: allOrders.filter((o: any) => getPaymentStatus(o) === 'paid').length,
      refundedAmount: allOrders
        .filter((o: any) => getPaymentStatus(o) === 'refunded')
        .reduce((sum: number, o: any) => sum + getTotal(o), 0),
    };

    // Enrich with customer info
    const enrichedOrders = await this.enrichOrdersWithCustomerInfo(orders);

    // Transform orders to payment transactions format
    const transactions = enrichedOrders.map((order: any) => {
      const paymentStatus = order.payment_status || order.paymentStatus || 'pending';
      const paymentMethod = order.payment_method || order.paymentMethod || 'unknown';
      const orderNumber = order.order_number || order.orderNumber;
      const shippingAddress = order.shipping_address || order.shippingAddress;
      const createdAt = order.created_at || order.createdAt;
      const userId = order.user_id || order.userId;

      return {
        id: order.id,
        transactionId: `TXN-${orderNumber?.replace('FLX-', '') || order.id.slice(0, 8).toUpperCase()}`,
        orderId: order.id,
        orderNumber: orderNumber || `ORD-${order.id.slice(0, 8)}`,
        customerId: userId,
        customerName: order.customer?.name || shippingAddress?.name || 'Unknown Customer',
        customerEmail: order.customer?.email || 'N/A',
        amount: parseFloat(order.total) || 0,
        currency: order.currency || 'USD',
        status: this.mapPaymentStatus(paymentStatus),
        paymentMethod: this.formatPaymentMethod(paymentMethod),
        createdAt: createdAt,
      };
    });

    return {
      data: transactions,
      total: result.count || 0,
      stats,
    };
  }

  private mapPaymentStatus(paymentStatus: string): 'completed' | 'pending' | 'failed' | 'refunded' {
    switch (paymentStatus) {
      case 'paid':
        return 'completed';
      case 'pending':
        return 'pending';
      case 'failed':
        return 'failed';
      case 'refunded':
        return 'refunded';
      default:
        return 'pending';
    }
  }

  private formatPaymentMethod(method: string): string {
    const methodMap: Record<string, string> = {
      stripe: 'Credit Card',
      card: 'Credit Card',
      paypal: 'PayPal',
      cod: 'Cash on Delivery',
      wallet: 'Wallet',
      bank_transfer: 'Bank Transfer',
    };
    return methodMap[method?.toLowerCase()] || method || 'Unknown';
  }

  /**
   * Get single order by ID
   */
  async findOne(id: string, userId: string): Promise<OrderEntity> {
    const order = await this.db.getEntity(EntityType.ORDER, id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify ownership
    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return this.normalizeOrderData(order);
  }

  /**
   * Get order by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<OrderEntity> {
    const result = await this.db.queryEntities(EntityType.ORDER, {
      filters: { orderNumber },
    });

    if (!result.data || result.data.length === 0) {
      throw new NotFoundException('Order not found');
    }

    return this.normalizeOrderData(result.data[0]);
  }

  /**
   * Track order by tracking number, order number, or order ID
   */
  async trackOrder(trackingNumber: string): Promise<any> {
    // Try to find by tracking number first
    let result = await this.db.queryEntities(EntityType.ORDER, {
      filters: { trackingNumber },
    });

    // If not found by tracking number, try order number
    if (!result.data || result.data.length === 0) {
      result = await this.db.queryEntities(EntityType.ORDER, {
        filters: { orderNumber: trackingNumber },
      });
    }

    // If still not found, try by order ID (fallback for mobile app compatibility)
    if (!result.data || result.data.length === 0) {
      try {
        const orderById = await this.db.getEntity(EntityType.ORDER, trackingNumber);
        if (orderById) {
          result = { data: [orderById], count: 1 };
        }
      } catch (e) {
        // Not found by ID either, continue to error
      }
    }

    if (!result.data || result.data.length === 0) {
      throw new NotFoundException('Order not found with this tracking number');
    }

    const order = result.data[0];

    // Fetch delivery assignment and delivery man info
    let deliveryMan = null;
    let deliveryAssignment = null;
    try {
      const assignments = await this.db.query_builder()
        .from('delivery_assignments')
        .select('*')
        .where('order_id', order.id)
        .get();

      if (assignments && assignments.length > 0) {
        deliveryAssignment = assignments[0];
        // Fetch delivery man details
        const deliveryManData = await this.db.getEntity('delivery_men', deliveryAssignment.delivery_man_id);

        if (deliveryManData) {
          // Split name into firstName and lastName
          const nameParts = (deliveryManData.name || '').split(' ');
          const firstName = deliveryManData.first_name || nameParts[0] || '';
          const lastName = deliveryManData.last_name || nameParts.slice(1).join(' ') || '';

          deliveryMan = {
            id: deliveryManData.id,
            name: deliveryManData.name,
            firstName,
            lastName,
            phone: deliveryManData.phone,
            avatar: deliveryManData.image_url,
            rating: Number(deliveryManData.rating) || 0,
            totalDeliveries: Number(deliveryManData.total_deliveries) || 0,
            vehicleType: deliveryManData.vehicle_type,
            vehicleNumber: deliveryManData.vehicle_number,
            currentLocation: deliveryManData.current_location,
            status: deliveryAssignment.status,
            assignedAt: deliveryAssignment.assigned_at,
            pickedUpAt: deliveryAssignment.picked_up_at,
            deliveredAt: deliveryAssignment.delivered_at,
          };
        }
      }
    } catch (error) {
      this.logger.warn('Failed to fetch delivery man info:', error.message);
    }

    // Fetch product details for items
    const itemsWithProducts = await Promise.all(
      (order.items || []).map(async (item: any) => {
        try {
          if (item.productId) {
            const product = await this.db.getEntity(EntityType.PRODUCT, item.productId);
            return {
              ...item,
              product: product ? {
                id: product.id,
                name: product.name,
                images: product.images || [],
                brand: product.brand,
              } : null,
            };
          }
        } catch (e) {
          // Product might be deleted
        }
        return item;
      })
    );

    // Build dynamic timeline from order events + delivery assignment events
    let timeline: any[] = [];

    // 1. Order Placed - always add this first
    timeline.push({
      status: 'order_placed',
      title: 'Order Placed',
      description: 'Your order has been placed successfully',
      timestamp: order.createdAt || order.created_at,
      location: 'Online',
    });

    // 2. Check order timeline for vendor confirmation/processing
    const orderTimeline = order.timeline || [];
    for (const event of orderTimeline) {
      if (event.status === 'processing' || event.status === 'confirmed') {
        timeline.push({
          status: event.status,
          title: event.status === 'confirmed' ? 'Order Confirmed' : 'Order Processing',
          description: event.note || 'Vendor has confirmed your order',
          timestamp: event.timestamp,
          location: 'Store',
        });
      }
    }

    // If order status is processing/confirmed but no timeline entry, add it
    if (['processing', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'].includes(order.status)) {
      const hasProcessingEvent = timeline.some(e => e.status === 'processing' || e.status === 'confirmed');
      if (!hasProcessingEvent) {
        timeline.push({
          status: 'confirmed',
          title: 'Order Confirmed',
          description: 'Vendor has confirmed your order',
          timestamp: order.confirmedAt || order.updatedAt || order.createdAt,
          location: 'Store',
        });
      }
    }

    // 3. Delivery Assignment Events (from delivery_assignments table)
    // Simplified to 5 stages: Order Placed → Confirmed → Assigned → Shipped → Delivered
    if (deliveryAssignment) {
      const deliveryManName = deliveryMan?.name || 'Delivery Partner';

      // Assigned to Delivery Partner (stage 3)
      if (deliveryAssignment.assigned_at) {
        timeline.push({
          status: 'assigned',
          title: 'Assigned to Delivery',
          description: `Order assigned to ${deliveryManName}`,
          timestamp: deliveryAssignment.assigned_at,
          location: 'Dispatch Center',
        });
      }

      // Shipped - combines picked_up, on_the_way, out_for_delivery (stage 4)
      if (deliveryAssignment.picked_up_at || ['picked_up', 'on_the_way', 'out_for_delivery', 'delivered'].includes(deliveryAssignment.status)) {
        const shippedAt = deliveryAssignment.picked_up_at || deliveryAssignment.status_updated_at;
        if (shippedAt) {
          timeline.push({
            status: 'shipped',
            title: 'Shipped',
            description: `${deliveryManName} is delivering your order`,
            timestamp: shippedAt,
            location: order.shippingAddress?.city || 'On the way',
          });
        }
      }

      // Delivered (stage 5)
      if (deliveryAssignment.delivered_at) {
        timeline.push({
          status: 'delivered',
          title: 'Delivered',
          description: `Your order has been delivered by ${deliveryManName}`,
          timestamp: deliveryAssignment.delivered_at,
          location: order.shippingAddress?.city || 'Delivery Address',
        });
      }
    } else {
      // No delivery assignment yet - check order status for shipped/delivered events
      if (['shipped', 'out_for_delivery', 'delivered'].includes(order.status)) {
        timeline.push({
          status: 'shipped',
          title: 'Shipped',
          description: order.trackingNumber ? `Tracking: ${order.trackingNumber}` : 'Package has been shipped',
          timestamp: order.shippedAt || order.updatedAt,
          location: order.carrier || 'Shipping Center',
        });
      }

      if (order.status === 'delivered') {
        timeline.push({
          status: 'delivered',
          title: 'Delivered',
          description: 'Package has been delivered',
          timestamp: order.deliveredAt || order.updatedAt,
          location: order.shippingAddress?.city || 'Delivery Address',
        });
      }
    }

    // Remove duplicate events - keep only one event per status (keep the earliest timestamp)
    const statusMap = new Map<string, any>();
    for (const event of timeline) {
      const existingEvent = statusMap.get(event.status);
      if (!existingEvent) {
        statusMap.set(event.status, event);
      } else {
        // Keep the event with the earliest timestamp
        const existingTime = new Date(existingEvent.timestamp).getTime();
        const newTime = new Date(event.timestamp).getTime();
        if (newTime < existingTime) {
          statusMap.set(event.status, event);
        }
      }
    }
    const uniqueTimeline = Array.from(statusMap.values());

    // Sort timeline by timestamp (oldest first for proper timeline display)
    uniqueTimeline.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Ensure camelCase fields are returned (handle potential snake_case from database)
    return {
      ...order,
      // Ensure orderNumber is in camelCase
      orderNumber: order.orderNumber || order.order_number,
      trackingNumber: order.trackingNumber || order.tracking_number,
      createdAt: order.createdAt || order.created_at,
      updatedAt: order.updatedAt || order.updated_at,
      shippingAddress: order.shippingAddress || order.shipping_address,
      paymentMethod: order.paymentMethod || order.payment_method,
      paymentStatus: order.paymentStatus || order.payment_status,
      items: itemsWithProducts,
      timeline: uniqueTimeline,
      deliveryMan,
    };
  }

  /**
   * Get status title for display
   */
  private getStatusTitle(status: string): string {
    const titles: Record<string, string> = {
      pending: 'Order Pending',
      order_placed: 'Order Placed',
      processing: 'Order Processing',
      confirmed: 'Order Confirmed',
      shipped: 'Order Shipped',
      in_transit: 'In Transit',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Order Cancelled',
    };
    return titles[status] || status;
  }

  /**
   * Normalize order data to ensure camelCase fields
   */
  private normalizeOrderData(order: any): any {
    const status = (order.status || '').toLowerCase();

    // Order can be cancelled only when pending (before vendor accepts)
    const cancellableStatuses = ['pending', 'order_placed'];
    const canCancel = cancellableStatuses.includes(status);

    // Order can be returned only when delivered
    const canReturn = status === 'delivered';

    return {
      ...order,
      orderNumber: order.orderNumber || order.order_number,
      trackingNumber: order.trackingNumber || order.tracking_number,
      createdAt: order.createdAt || order.created_at,
      updatedAt: order.updatedAt || order.updated_at,
      shippingAddress: order.shippingAddress || order.shipping_address,
      paymentMethod: order.paymentMethod || order.payment_method,
      paymentStatus: order.paymentStatus || order.payment_status,
      shippingCost: order.shippingCost || order.shipping_cost,
      canCancel,
      canReturn,
    };
  }

  /**
   * Generate unique order number (FLX-YYYY-XXXXX)
   */
  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `FLX-${year}-${random}`;
  }

  /**
   * Update order status (shop owner only)
   */
  async updateStatus(
    orderId: string,
    updateDto: UpdateOrderStatusDto,
    shopId: string,
  ): Promise<OrderEntity> {
    const { status, trackingNumber, carrier, deliveryMethod, deliveryManName, statusNote, estimatedDelivery } = updateDto;

    const order = await this.db.getEntity(EntityType.ORDER, orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify shop ownership - check order's shopId or items' shopId
    const isOrderOwner = order.shopId === shopId;
    const hasShopItems = order.items?.some((item) => item.shopId === shopId);

    this.logger.debug(`[updateStatus] Order shopId: ${order.shopId}, Request shopId: ${shopId}, isOrderOwner: ${isOrderOwner}, hasShopItems: ${hasShopItems}`);

    if (!isOrderOwner && !hasShopItems) {
      throw new ForbiddenException('You do not have access to this order');
    }

    // Only validate and update status if provided
    if (status) {
      // Validate status transition
      this.validateStatusTransition(order.status, status);
      order.status = status;
    }

    // Update order timestamp
    order.updatedAt = new Date().toISOString();

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (carrier) {
      order.carrier = carrier;
    }

    if (estimatedDelivery) {
      order.estimatedDelivery = estimatedDelivery;
    }

    if (deliveryMethod) {
      order.deliveryMethod = deliveryMethod;
    }

    if (deliveryManName) {
      order.deliveryManName = deliveryManName;
    }

    // Add to timeline only if status changed or tracking info added
    if (status || trackingNumber) {
      if (!order.timeline) {
        order.timeline = [];
      }

      order.timeline.push({
        status: status || order.status,
        timestamp: new Date().toISOString(),
        note: statusNote || (trackingNumber ? `Tracking added: ${trackingNumber}` : this.getDefaultStatusNote(status || order.status)),
        updatedBy: shopId,
      });
    }

    // Handle inventory for cancellations
    if (status === 'cancelled') {
      await this.releaseInventory(order.items);
    }

    // Update the order in database
    const updatedOrder = await this.db.updateEntity(EntityType.ORDER, orderId, order);

    // Send appropriate notification based on status
    try {
      let notificationType: NotificationType | null = null;

      switch (status) {
        case 'shipped':
          notificationType = NotificationType.ORDER_SHIPPED;
          break;
        case 'delivered':
          notificationType = NotificationType.ORDER_DELIVERED;
          break;
        case 'cancelled':
          notificationType = NotificationType.ORDER_CANCELLED;
          break;
        case 'processing':
        case 'pending':
          notificationType = NotificationType.ORDER_UPDATED;
          break;
      }

      if (notificationType) {
        await this.notificationsService.sendOrderNotification(orderId, notificationType);
      }
    } catch (notificationError) {
      this.logger.error('Failed to send order status notification', notificationError);
      // Don't fail order update if notification fails
    }

    return updatedOrder;
  }

  /**
   * Cancel order (customer only)
   */
  async cancel(orderId: string, userId: string): Promise<OrderEntity> {
    const order = await this.db.getEntity(EntityType.ORDER, orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    // Only allow cancellation for pending orders (before vendor accepts)
    // Once vendor accepts (status becomes 'confirmed' or 'processing'), customer cannot cancel
    const cancellableStatuses = ['pending', 'order_placed'];
    if (!cancellableStatuses.includes(order.status?.toLowerCase())) {
      throw new BadRequestException(
        `Cannot cancel order. Order has already been accepted by the vendor. Current status: ${order.status}`,
      );
    }

    // Update status
    order.status = 'cancelled';
    order.updatedAt = new Date().toISOString();

    if (!order.timeline) {
      order.timeline = [];
    }

    order.timeline.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      note: 'Cancelled by customer',
    });

    // Release inventory
    await this.releaseInventory(order.items);

    // Update order in database
    const updatedOrder = await this.db.updateEntity(EntityType.ORDER, orderId, order);

    // Send order cancelled notification (database + WebSocket + email)
    try {
      await this.notificationsService.sendOrderNotification(
        orderId,
        NotificationType.ORDER_CANCELLED,
      );
    } catch (notificationError) {
      this.logger.error('Failed to send order cancellation notification', notificationError);
      // Don't fail cancellation if notification fails
    }

    return updatedOrder;
  }

  /**
   * Add note to order
   */
  async addNote(
    orderId: string,
    addNoteDto: AddOrderNoteDto,
    userId: string,
    isShopOwner = false,
  ): Promise<OrderEntity> {
    const { note, isInternal } = addNoteDto;

    const order = await this.db.getEntity(EntityType.ORDER, orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify access
    if (!isShopOwner && order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    if (!order.notes) {
      order.notes = [];
    }

    order.notes.push({
      note,
      isInternal: isInternal || false,
      addedBy: userId,
      addedByType: isShopOwner ? 'shop' : 'customer',
      createdAt: new Date().toISOString(),
    });

    order.updatedAt = new Date().toISOString();

    return this.db.updateEntity(EntityType.ORDER, orderId, order);
  }

  /**
   * Request refund
   */
  async refund(
    orderId: string,
    amount: number,
    reason: string,
    userId: string,
  ): Promise<OrderEntity> {
    const order = await this.db.getEntity(EntityType.ORDER, orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    if (order.status !== 'delivered') {
      throw new BadRequestException('Can only refund delivered orders');
    }

    if (amount > order.total) {
      throw new BadRequestException('Refund amount cannot exceed order total');
    }

    // Update order
    order.refundAmount = amount;
    order.refundReason = reason;
    order.refundStatus = 'requested';
    order.refundRequestedAt = new Date().toISOString();
    order.status = 'refund_requested';
    order.updatedAt = new Date().toISOString();

    if (!order.timeline) {
      order.timeline = [];
    }

    order.timeline.push({
      status: 'refund_requested',
      timestamp: new Date().toISOString(),
      note: `Refund requested: ${this.currencyService.formatCurrency(amount)} - ${reason}`,
    });

    return this.db.updateEntity(EntityType.ORDER, orderId, order);
  }

  /**
   * Get order statistics for shop
   */
  async getStatistics(shopId: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
  }> {
    // Query all orders containing items from this shop
    const allOrders = await this.db.queryEntities(EntityType.ORDER, {
      filters: {},
    });

    const shopOrders = (allOrders.data || []).filter((order) =>
      order.items.some((item) => item.shopId === shopId),
    );

    const totalRevenue = shopOrders.reduce((sum, order) => {
      const shopItemsTotal = order.items
        .filter((item) => item.shopId === shopId)
        .reduce((itemSum, item) => itemSum + item.subtotal, 0);
      return sum + shopItemsTotal;
    }, 0);

    return {
      totalOrders: shopOrders.length,
      totalRevenue,
      pendingOrders: shopOrders.filter((o) => o.status === 'pending').length,
      processingOrders: shopOrders.filter((o) => o.status === 'processing').length,
      shippedOrders: shopOrders.filter((o) => o.status === 'shipped').length,
      deliveredOrders: shopOrders.filter((o) => o.status === 'delivered').length,
      cancelledOrders: shopOrders.filter((o) => o.status === 'cancelled').length,
    };
  }

  /**
   * Calculate order timeline
   */
  calculateOrderTimeline(order: OrderEntity): any[] {
    return order.timeline || [];
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: ['refund_requested'],
      cancelled: [],
      refunded: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot change status from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  /**
   * Get default status note
   */
  private getDefaultStatusNote(status: string): string {
    const notes: Record<string, string> = {
      pending: 'Order is pending confirmation',
      processing: 'Order is being processed',
      shipped: 'Order has been shipped',
      delivered: 'Order has been delivered',
      cancelled: 'Order has been cancelled',
      refunded: 'Order has been refunded',
    };

    return notes[status] || `Order status changed to ${status}`;
  }

  /**
   * Lock inventory for ordered items
   */
  private async lockInventory(items: any[]): Promise<void> {
    for (const item of items) {
      const product = await this.db.getEntity(
        EntityType.PRODUCT,
        item.productId,
      );

      if (product) {
        product.stock -= item.quantity;
        product.updatedAt = new Date().toISOString();

        await this.db.updateEntity(
          EntityType.PRODUCT,
          item.productId,
          product,
        );
      }
    }
  }

  /**
   * Release inventory (on cancellation)
   */
  private async releaseInventory(items: any[]): Promise<void> {
    for (const item of items) {
      const product = await this.db.getEntity(
        EntityType.PRODUCT,
        item.productId,
      );

      if (product) {
        product.stock += item.quantity;
        product.updatedAt = new Date().toISOString();

        await this.db.updateEntity(
          EntityType.PRODUCT,
          item.productId,
          product,
        );
      }
    }
  }

  /**
   * Clear cart after order
   */
  private async clearCart(cartId: string): Promise<void> {
    const cart = await this.db.getEntity(EntityType.CART, cartId);

    if (cart) {
      // Only update fields that exist in the carts table
      const updateData: any = {
        items: [],
        subtotal: 0,
        discount: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        updatedAt: new Date().toISOString(),
      };

      // Only include appliedCoupons if it exists in the cart
      if ('appliedCoupons' in cart) {
        updateData.appliedCoupons = [];
      }

      await this.db.updateEntity(EntityType.CART, cartId, updateData);
    }
  }

  /**
   * Get delivery location for an order - for live tracking by customers
   */
  async getDeliveryLocation(orderId: string) {
    try {
      console.log('[OrdersService] getDeliveryLocation called with orderId:', orderId);

      let order = null;

      // Check if orderId is a valid UUID format
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

      if (isUUID) {
        // Try to find by order ID (UUID)
        order = await this.db.getEntity(EntityType.ORDER, orderId);
      }

      // If not found or not UUID, try to find by orderNumber
      if (!order) {
        const ordersResult = await this.db.queryEntities(EntityType.ORDER, {
          filters: [{ column: 'order_number', operator: 'eq', value: orderId }],
        });
        const orders = ordersResult?.data || ordersResult || [];
        order = Array.isArray(orders) && orders.length > 0 ? orders[0] : null;
      }

      if (!order) {
        console.log('[OrdersService] Order not found:', orderId);
        throw new NotFoundException('Order not found');
      }

      console.log('[OrdersService] Found order:', order.id);

      // Check if order has a delivery assignment
      const assignmentsResult = await this.db.queryEntities('delivery_assignments', {
        filters: [{ column: 'order_id', operator: 'eq', value: order.id }],
      });
      const deliveryAssignments = assignmentsResult?.data || assignmentsResult || [];

    if (!deliveryAssignments || !Array.isArray(deliveryAssignments) || deliveryAssignments.length === 0) {
      return {
        data: null,
        message: 'No delivery assigned to this order yet',
      };
    }

    const assignment = deliveryAssignments[0];
    const deliveryManId = assignment.deliveryManId || assignment.delivery_man_id;

    if (!deliveryManId) {
      return {
        data: null,
        message: 'Delivery person not assigned',
      };
    }

    // Get delivery person's current location
    const deliveryMan = await this.db.getEntity('delivery_men', deliveryManId);

    if (!deliveryMan) {
      return {
        data: null,
        message: 'Delivery person not found',
      };
    }

    // Get location from database (snake_case) or camelCase
    const locationData = deliveryMan.current_location || deliveryMan.currentLocation || deliveryMan.location;

    console.log('[OrdersService] getDeliveryLocation - deliveryMan:', {
      id: deliveryMan.id,
      name: deliveryMan.name,
      current_location: deliveryMan.current_location,
      currentLocation: deliveryMan.currentLocation,
    });

    // Return location data
    return {
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber || order.order_number,
        deliveryManId: deliveryMan.id,
        deliveryMan: {
          name: deliveryMan.name || deliveryMan.first_name || deliveryMan.firstName,
          phone: deliveryMan.phone,
          vehicleType: deliveryMan.vehicle_type || deliveryMan.vehicleType,
          imageUrl: deliveryMan.image_url || deliveryMan.imageUrl || deliveryMan.avatar,
        },
        location: locationData ? {
          lat: locationData.lat || locationData.latitude,
          lng: locationData.lng || locationData.longitude,
          heading: locationData.heading,
          speed: locationData.speed,
          timestamp: deliveryMan.location_updated_at || deliveryMan.locationUpdatedAt || deliveryMan.updated_at || deliveryMan.updatedAt,
        } : null,
        status: assignment.status,
        eta: assignment.eta,
      },
    };
    } catch (error) {
      console.error('[OrdersService] getDeliveryLocation error:', error);
      throw error;
    }
  }
}

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreatePOSOrderDto,
  UpdatePOSOrderDto,
  RefundPOSOrderDto,
  OpenSessionDto,
  CloseSessionDto,
  CashDrawerDto,
  QueryPOSOrdersDto,
  POSSettingsDto,
  HoldOrderDto,
  QuickProductDto,
  POSOrderStatus,
  POSPaymentMethod,
  POSSessionStatus,
} from './dto/pos.dto';

@Injectable()
export class POSService {
  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  /**
   * Open a new POS session
   */
  async openSession(dto: OpenSessionDto, userId: string) {
    // Check if there's already an open session for this shop/user
    const existingSession = await this.db.query_builder()
      .from('pos_sessions')
      .select('*')
      .where('shop_id', dto.shopId)
      .where('user_id', userId)
      .where('status', POSSessionStatus.OPEN)
      .get();

    if (existingSession && existingSession.length > 0) {
      throw new BadRequestException('You already have an open session');
    }

    const session = await this.db.createEntity('pos_sessions', {
      shop_id: dto.shopId,
      user_id: userId,
      status: POSSessionStatus.OPEN,
      opening_cash: dto.openingCash,
      current_cash: dto.openingCash,
      total_sales: 0,
      total_orders: 0,
      cash_sales: 0,
      card_sales: 0,
      mobile_sales: 0,
      refunds: 0,
      note: dto.note,
      opened_at: new Date(),
      created_at: new Date(),
    });

    return {
      data: this.transformSession(session),
      message: 'Session opened successfully',
    };
  }

  /**
   * Close current session
   */
  async closeSession(sessionId: string, dto: CloseSessionDto, userId: string) {
    const session = await this.db.getEntity('pos_sessions', sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.user_id !== userId) {
      throw new ForbiddenException('Not your session');
    }

    if (session.status === POSSessionStatus.CLOSED) {
      throw new BadRequestException('Session already closed');
    }

    // Calculate expected cash
    const expectedCash = session.opening_cash + session.cash_sales - session.refunds;
    const cashDifference = dto.closingCash - expectedCash;

    const updated = await this.db.updateEntity('pos_sessions', sessionId, {
      status: POSSessionStatus.CLOSED,
      closing_cash: dto.closingCash,
      expected_cash: expectedCash,
      cash_difference: cashDifference,
      card_sales_reported: dto.cardSales,
      mobile_sales_reported: dto.mobileSales,
      note: dto.note || session.note,
      closed_at: new Date(),
    });

    return {
      data: {
        ...this.transformSession(updated),
        expectedCash,
        cashDifference,
      },
      message: 'Session closed successfully',
    };
  }

  /**
   * Get current open session
   */
  async getCurrentSession(shopId: string, userId: string) {
    const sessions = await this.db.query_builder()
      .from('pos_sessions')
      .select('*')
      .where('shop_id', shopId)
      .where('user_id', userId)
      .where('status', POSSessionStatus.OPEN)
      .get();

    if (!sessions || sessions.length === 0) {
      return { data: null, message: 'No open session' };
    }

    return { data: this.transformSession(sessions[0]) };
  }

  /**
   * Get session history
   */
  async getSessionHistory(shopId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const sessions = await this.db.query_builder()
      .from('pos_sessions')
      .select('*')
      .where('shop_id', shopId)
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .get();

    return {
      data: (sessions || []).map((s: any) => this.transformSession(s)),
      page,
      limit,
    };
  }

  /**
   * Cash drawer operation
   */
  async cashDrawerOperation(sessionId: string, dto: CashDrawerDto, userId: string) {
    const session = await this.db.getEntity('pos_sessions', sessionId);

    if (!session || session.status !== POSSessionStatus.OPEN) {
      throw new BadRequestException('No open session');
    }

    if (session.user_id !== userId) {
      throw new ForbiddenException('Not your session');
    }

    if (dto.type === 'remove' && dto.amount > session.current_cash) {
      throw new BadRequestException('Insufficient cash in drawer');
    }

    const newCash = dto.type === 'add'
      ? session.current_cash + dto.amount
      : session.current_cash - dto.amount;

    // Record the operation
    await this.db.createEntity('pos_cash_operations', {
      session_id: sessionId,
      user_id: userId,
      type: dto.type,
      amount: dto.amount,
      reason: dto.reason,
      balance_before: session.current_cash,
      balance_after: newCash,
      created_at: new Date(),
    });

    // Update session cash
    await this.db.updateEntity('pos_sessions', sessionId, {
      current_cash: newCash,
    });

    return {
      message: `Cash ${dto.type === 'add' ? 'added to' : 'removed from'} drawer`,
      currentCash: newCash,
    };
  }

  // ============================================
  // ORDER MANAGEMENT
  // ============================================

  /**
   * Create a POS order
   */
  async createOrder(dto: CreatePOSOrderDto, userId: string) {
    // Get settings
    const settings = await this.getSettings(dto.shopId);

    // Check for session if required
    let sessionId = null;
    if (settings.requireSession) {
      const session = await this.getCurrentSession(dto.shopId, userId);
      if (!session.data) {
        throw new BadRequestException('Please open a session first');
      }
      sessionId = session.data.id;
    }

    // Calculate order totals
    let subtotal = 0;
    let itemDiscounts = 0;
    const orderItems = [];

    for (const item of dto.items) {
      const product = await this.db.getEntity('products', item.productId);
      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }

      const unitPrice = item.unitPrice || product.price;
      const itemSubtotal = unitPrice * item.quantity;

      // Calculate item discount
      let itemDiscount = 0;
      if (item.discountPercent) {
        itemDiscount = (itemSubtotal * item.discountPercent) / 100;
      } else if (item.discountAmount) {
        itemDiscount = item.discountAmount;
      }

      subtotal += itemSubtotal;
      itemDiscounts += itemDiscount;

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        subtotal: itemSubtotal,
        discount: itemDiscount,
        total: itemSubtotal - itemDiscount,
        note: item.note,
      });
    }

    // Calculate order discount
    let orderDiscount = 0;
    if (dto.orderDiscountPercent) {
      orderDiscount = ((subtotal - itemDiscounts) * dto.orderDiscountPercent) / 100;
    } else if (dto.orderDiscountAmount) {
      orderDiscount = dto.orderDiscountAmount;
    }

    // Apply coupon if provided
    let couponDiscount = 0;
    if (dto.couponCode) {
      // TODO: Integrate with coupons service
    }

    const totalDiscount = itemDiscounts + orderDiscount + couponDiscount;
    const taxableAmount = subtotal - totalDiscount;
    const taxRate = dto.taxRate || settings.defaultTaxRate || 0;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const grandTotal = taxableAmount + taxAmount;

    // Generate order number
    const orderNumber = this.generateOrderNumber();

    // Calculate change
    const change = dto.paymentMethod === POSPaymentMethod.CASH && dto.cashReceived
      ? dto.cashReceived - grandTotal
      : 0;

    // Create order
    const order = await this.db.createEntity('pos_orders', {
      shop_id: dto.shopId,
      session_id: sessionId,
      user_id: userId,
      order_number: orderNumber,
      customer_id: dto.customerId,
      customer_name: dto.customerName,
      customer_phone: dto.customerPhone,
      customer_email: dto.customerEmail,
      items: orderItems,
      subtotal,
      item_discounts: itemDiscounts,
      order_discount: orderDiscount,
      coupon_code: dto.couponCode,
      coupon_discount: couponDiscount,
      total_discount: totalDiscount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      grand_total: grandTotal,
      payment_method: dto.paymentMethod,
      split_payment: dto.splitPayment,
      cash_received: dto.cashReceived,
      change,
      status: POSOrderStatus.COMPLETED,
      note: dto.note,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Update session if exists
    if (sessionId) {
      const session = await this.db.getEntity('pos_sessions', sessionId);
      const updates: any = {
        total_sales: (session.total_sales || 0) + grandTotal,
        total_orders: (session.total_orders || 0) + 1,
      };

      if (dto.paymentMethod === POSPaymentMethod.CASH) {
        updates.cash_sales = (session.cash_sales || 0) + grandTotal;
        updates.current_cash = (session.current_cash || 0) + grandTotal;
      } else if (dto.paymentMethod === POSPaymentMethod.CARD) {
        updates.card_sales = (session.card_sales || 0) + grandTotal;
      } else if (dto.paymentMethod === POSPaymentMethod.MOBILE) {
        updates.mobile_sales = (session.mobile_sales || 0) + grandTotal;
      } else if (dto.paymentMethod === POSPaymentMethod.SPLIT && dto.splitPayment) {
        updates.cash_sales = (session.cash_sales || 0) + dto.splitPayment.cash;
        updates.card_sales = (session.card_sales || 0) + dto.splitPayment.card;
        updates.current_cash = (session.current_cash || 0) + dto.splitPayment.cash;
        if (dto.splitPayment.mobile) {
          updates.mobile_sales = (session.mobile_sales || 0) + dto.splitPayment.mobile;
        }
      }

      await this.db.updateEntity('pos_sessions', sessionId, updates);
    }

    // Update inventory
    for (const item of orderItems) {
      await this.updateInventory(item.productId, -item.quantity, dto.shopId);
    }

    return {
      data: this.transformOrder(order),
      message: 'Order created successfully',
    };
  }

  /**
   * Get POS orders
   */
  async getOrders(query: QueryPOSOrdersDto) {
    const { page = 1, limit = 20, shopId, sessionId, status, paymentMethod, startDate, endDate, search } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.db.query_builder()
      .from('pos_orders')
      .select('*');

    if (shopId) {
      queryBuilder = queryBuilder.where('shop_id', shopId);
    }

    if (sessionId) {
      queryBuilder = queryBuilder.where('session_id', sessionId);
    }

    if (status) {
      queryBuilder = queryBuilder.where('status', status);
    }

    if (paymentMethod) {
      queryBuilder = queryBuilder.where('payment_method', paymentMethod);
    }

    if (startDate) {
      queryBuilder = queryBuilder.where('created_at', '>=', startDate);
    }

    if (endDate) {
      queryBuilder = queryBuilder.where('created_at', '<=', endDate);
    }

    if (search) {
      queryBuilder = queryBuilder.where('order_number', 'ILIKE', `%${search}%`);
    }

    const orders = await queryBuilder
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .get();

    return {
      data: (orders || []).map((o: any) => this.transformOrder(o)),
      page,
      limit,
    };
  }

  /**
   * Get order by ID
   */
  async getOrder(id: string) {
    const order = await this.db.getEntity('pos_orders', id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return { data: this.transformOrder(order) };
  }

  /**
   * Refund order
   */
  async refundOrder(id: string, dto: RefundPOSOrderDto, userId: string) {
    const order = await this.db.getEntity('pos_orders', id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === POSOrderStatus.REFUNDED) {
      throw new BadRequestException('Order already refunded');
    }

    if (order.status === POSOrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot refund cancelled order');
    }

    // Calculate refund amount
    let refundAmount = dto.refundAmount || order.grand_total;

    if (dto.items && dto.items.length > 0) {
      // Partial refund by items
      refundAmount = 0;
      for (const refundItem of dto.items) {
        const orderItem = order.items.find((i: any) => i.productId === refundItem.productId);
        if (orderItem) {
          const itemRefund = (orderItem.total / orderItem.quantity) * refundItem.quantity;
          refundAmount += itemRefund;

          // Return inventory
          await this.updateInventory(refundItem.productId, refundItem.quantity, order.shop_id);
        }
      }
    } else {
      // Full refund - return all inventory
      for (const item of order.items) {
        await this.updateInventory(item.productId, item.quantity, order.shop_id);
      }
    }

    // Update order
    await this.db.updateEntity('pos_orders', id, {
      status: POSOrderStatus.REFUNDED,
      refund_amount: refundAmount,
      refund_reason: dto.reason,
      refunded_by: userId,
      refunded_at: new Date(),
      updated_at: new Date(),
    });

    // Update session if exists
    if (order.session_id) {
      const session = await this.db.getEntity('pos_sessions', order.session_id);
      if (session && session.status === POSSessionStatus.OPEN) {
        await this.db.updateEntity('pos_sessions', order.session_id, {
          refunds: (session.refunds || 0) + refundAmount,
          current_cash: order.payment_method === POSPaymentMethod.CASH
            ? (session.current_cash || 0) - refundAmount
            : session.current_cash,
        });
      }
    }

    // Add to wallet if requested
    if (dto.refundToWallet && order.customer_id) {
      // TODO: Integrate with wallet service
    }

    return {
      message: 'Order refunded successfully',
      refundAmount,
    };
  }

  // ============================================
  // HOLD ORDERS
  // ============================================

  /**
   * Hold an order for later
   */
  async holdOrder(dto: HoldOrderDto, userId: string) {
    const holdOrder = await this.db.createEntity('pos_hold_orders', {
      shop_id: dto.shopId,
      user_id: userId,
      items: dto.items,
      customer_name: dto.customerName,
      note: dto.note,
      created_at: new Date(),
    });

    return {
      data: holdOrder,
      message: 'Order held',
    };
  }

  /**
   * Get held orders
   */
  async getHeldOrders(shopId: string) {
    const orders = await this.db.query_builder()
      .from('pos_hold_orders')
      .select('*')
      .where('shop_id', shopId)
      .orderBy('created_at', 'DESC')
      .get();

    return { data: orders || [] };
  }

  /**
   * Delete held order
   */
  async deleteHeldOrder(id: string) {
    await this.db.query_builder()
      .from('pos_hold_orders')
      .where('id', id)
      .delete()
      .execute();

    return { message: 'Held order deleted' };
  }

  // ============================================
  // QUICK PRODUCTS
  // ============================================

  /**
   * Create a quick product (for POS-only items)
   */
  async createQuickProduct(dto: QuickProductDto) {
    const product = await this.db.createEntity('pos_quick_products', {
      shop_id: dto.shopId,
      name: dto.name,
      price: dto.price,
      barcode: dto.barcode,
      category_id: dto.categoryId,
      created_at: new Date(),
    });

    return { data: product, message: 'Quick product created' };
  }

  /**
   * Get quick products
   */
  async getQuickProducts(shopId: string) {
    const products = await this.db.query_builder()
      .from('pos_quick_products')
      .select('*')
      .where('shop_id', shopId)
      .get();

    return { data: products || [] };
  }

  /**
   * Search products for POS (including barcode)
   */
  async searchProducts(shopId: string, query: string) {
    // Search regular products
    const products = await this.db.query_builder()
      .from('products')
      .select('*')
      .where('shop_id', shopId)
      .where('status', 'active')
      .get();

    // Search quick products
    const quickProducts = await this.db.query_builder()
      .from('pos_quick_products')
      .select('*')
      .where('shop_id', shopId)
      .get();

    // Filter by search
    const queryLower = query.toLowerCase();
    const matchedProducts = (products || []).filter((p: any) =>
      p.name?.toLowerCase().includes(queryLower) ||
      p.sku?.toLowerCase().includes(queryLower) ||
      p.barcode === query
    );

    const matchedQuick = (quickProducts || []).filter((p: any) =>
      p.name?.toLowerCase().includes(queryLower) ||
      p.barcode === query
    );

    return {
      data: {
        products: matchedProducts.slice(0, 20),
        quickProducts: matchedQuick.slice(0, 10),
      },
    };
  }

  // ============================================
  // SETTINGS
  // ============================================

  /**
   * Get POS settings
   */
  async getSettings(shopId: string) {
    const settings = await this.db.query_builder()
      .from('pos_settings')
      .select('*')
      .where('shop_id', shopId)
      .get();

    if (settings && settings.length > 0) {
      return settings[0];
    }

    return {
      shopId,
      enabled: false,
      defaultTaxRate: 0,
      receiptHeader: '',
      receiptFooter: '',
      autoPrintReceipt: false,
      allowDiscountWithoutApproval: false,
      maxDiscountPercent: 100,
      requireSession: true,
    };
  }

  /**
   * Update POS settings
   */
  async updateSettings(shopId: string, dto: POSSettingsDto) {
    const existing = await this.db.query_builder()
      .from('pos_settings')
      .select('id')
      .where('shop_id', shopId)
      .get();

    if (existing && existing.length > 0) {
      const updated = await this.db.updateEntity('pos_settings', existing[0].id, {
        ...dto,
        updated_at: new Date(),
      });
      return { data: updated, message: 'Settings updated' };
    }

    const created = await this.db.createEntity('pos_settings', {
      shop_id: shopId,
      ...dto,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return { data: created, message: 'Settings created' };
  }

  // ============================================
  // REPORTS
  // ============================================

  /**
   * Get POS reports
   */
  async getReports(shopId: string, period?: string, startDate?: string, endDate?: string) {
    let start: Date;
    let end: Date = new Date();

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      const now = new Date();
      switch (period) {
        case 'today':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    // Get orders in period
    const orders = await this.db.query_builder()
      .from('pos_orders')
      .select('*')
      .where('shop_id', shopId)
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString())
      .get();

    const orderList = orders || [];

    // Calculate stats
    const completedOrders = orderList.filter((o: any) => o.status === POSOrderStatus.COMPLETED);
    const refundedOrders = orderList.filter((o: any) => o.status === POSOrderStatus.REFUNDED);

    const totalSales = completedOrders.reduce((sum: number, o: any) => sum + (o.grand_total || 0), 0);
    const totalRefunds = refundedOrders.reduce((sum: number, o: any) => sum + (o.refund_amount || 0), 0);
    const totalDiscount = completedOrders.reduce((sum: number, o: any) => sum + (o.total_discount || 0), 0);
    const totalTax = completedOrders.reduce((sum: number, o: any) => sum + (o.tax_amount || 0), 0);

    // Payment breakdown
    const paymentBreakdown = {
      cash: completedOrders.filter((o: any) => o.payment_method === POSPaymentMethod.CASH)
        .reduce((sum: number, o: any) => sum + (o.grand_total || 0), 0),
      card: completedOrders.filter((o: any) => o.payment_method === POSPaymentMethod.CARD)
        .reduce((sum: number, o: any) => sum + (o.grand_total || 0), 0),
      mobile: completedOrders.filter((o: any) => o.payment_method === POSPaymentMethod.MOBILE)
        .reduce((sum: number, o: any) => sum + (o.grand_total || 0), 0),
      split: completedOrders.filter((o: any) => o.payment_method === POSPaymentMethod.SPLIT)
        .reduce((sum: number, o: any) => sum + (o.grand_total || 0), 0),
    };

    // Top products
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const order of completedOrders) {
      for (const item of (order.items || [])) {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.total;
      }
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      data: {
        period: { start, end },
        summary: {
          totalOrders: completedOrders.length,
          totalSales,
          totalRefunds,
          netSales: totalSales - totalRefunds,
          totalDiscount,
          totalTax,
          averageOrderValue: completedOrders.length > 0 ? totalSales / completedOrders.length : 0,
        },
        paymentBreakdown,
        topProducts,
        orderCount: {
          completed: completedOrders.length,
          refunded: refundedOrders.length,
          cancelled: orderList.filter((o: any) => o.status === POSOrderStatus.CANCELLED).length,
        },
      },
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private transformSession(s: any) {
    return {
      id: s.id,
      shopId: s.shop_id,
      userId: s.user_id,
      status: s.status,
      openingCash: s.opening_cash,
      currentCash: s.current_cash,
      closingCash: s.closing_cash,
      expectedCash: s.expected_cash,
      cashDifference: s.cash_difference,
      totalSales: s.total_sales,
      totalOrders: s.total_orders,
      cashSales: s.cash_sales,
      cardSales: s.card_sales,
      mobileSales: s.mobile_sales,
      refunds: s.refunds,
      note: s.note,
      openedAt: s.opened_at,
      closedAt: s.closed_at,
      createdAt: s.created_at,
    };
  }

  private transformOrder(o: any) {
    return {
      id: o.id,
      shopId: o.shop_id,
      sessionId: o.session_id,
      userId: o.user_id,
      orderNumber: o.order_number,
      customerId: o.customer_id,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      customerEmail: o.customer_email,
      items: o.items,
      subtotal: o.subtotal,
      itemDiscounts: o.item_discounts,
      orderDiscount: o.order_discount,
      couponCode: o.coupon_code,
      couponDiscount: o.coupon_discount,
      totalDiscount: o.total_discount,
      taxRate: o.tax_rate,
      taxAmount: o.tax_amount,
      grandTotal: o.grand_total,
      paymentMethod: o.payment_method,
      splitPayment: o.split_payment,
      cashReceived: o.cash_received,
      change: o.change,
      status: o.status,
      refundAmount: o.refund_amount,
      refundReason: o.refund_reason,
      note: o.note,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
    };
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `POS-${dateStr}-${random}`;
  }

  private async updateInventory(productId: string, quantityChange: number, shopId: string) {
    const product = await this.db.getEntity('products', productId);
    if (product) {
      const newStock = (product.stock || 0) + quantityChange;
      await this.db.updateEntity('products', productId, {
        stock: Math.max(0, newStock),
        updated_at: new Date(),
      });
    }
  }
}

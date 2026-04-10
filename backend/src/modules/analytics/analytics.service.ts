import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  ReportFilterDto,
  ReportPeriod,
  ReportType,
  ExportFormat,
  DashboardOverviewDto,
  TransactionReportDto,
  OrderReportDto,
  ItemReportDto,
  StoreReportDto,
  CustomerReportDto,
  DeliveryReportDto,
  ExpenseReportDto,
  TaxReportDto,
  RevenueReportDto,
  PerformanceReportDto,
  ExportReportDto,
  CreateScheduledReportDto,
  UpdateScheduledReportDto,
  CreateCustomReportDto,
  CreateGoalDto,
  UpdateGoalDto,
  CreateAlertDto,
  UpdateAlertDto,
  ComparePeriodsDto,
  CompareShopsDto,
  CohortAnalysisDto,
  FunnelAnalysisDto,
  SaveDashboardLayoutDto,
} from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // HELPER METHODS
  // ============================================

  private getDateRange(period: ReportPeriod, startDate?: string, endDate?: string): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);

    switch (period) {
      case ReportPeriod.TODAY:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case ReportPeriod.YESTERDAY:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case ReportPeriod.THIS_WEEK:
        const dayOfWeek = now.getDay();
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        break;
      case ReportPeriod.LAST_WEEK:
        const lastWeekDay = now.getDay();
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - lastWeekDay - 7);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - lastWeekDay);
        break;
      case ReportPeriod.THIS_MONTH:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case ReportPeriod.LAST_MONTH:
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case ReportPeriod.THIS_QUARTER:
        const currentQuarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
      case ReportPeriod.LAST_QUARTER:
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
        const lastQuarterYear = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
        const adjustedQuarter = lastQuarter < 0 ? 3 : lastQuarter;
        start = new Date(lastQuarterYear, adjustedQuarter * 3, 1);
        end = new Date(lastQuarterYear, (adjustedQuarter + 1) * 3, 1);
        break;
      case ReportPeriod.THIS_YEAR:
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case ReportPeriod.LAST_YEAR:
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear(), 0, 1);
        break;
      case ReportPeriod.CUSTOM:
        if (!startDate || !endDate) {
          throw new BadRequestException('Custom period requires startDate and endDate');
        }
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { start, end };
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(2));
  }

  private async getComparisonPeriod(start: Date, end: Date): Promise<{ start: Date; end: Date }> {
    const duration = end.getTime() - start.getTime();
    return {
      start: new Date(start.getTime() - duration),
      end: new Date(start.getTime()),
    };
  }

  // ============================================
  // DASHBOARD OVERVIEW
  // ============================================

  async getDashboardOverview(dto: DashboardOverviewDto, userId?: string) {
    const { start, end } = this.getDateRange(dto.period || ReportPeriod.THIS_MONTH, dto.startDate, dto.endDate);
    const comparison = await this.getComparisonPeriod(start, end);

    // Get current period stats
    const [
      currentOrders,
      currentRevenue,
      currentCustomers,
      currentProducts,
      previousOrders,
      previousRevenue,
    ] = await Promise.all([
      this.getOrderCount(start, end, dto.shopId),
      this.getTotalRevenue(start, end, dto.shopId),
      this.getNewCustomerCount(start, end),
      this.getActiveProductCount(dto.shopId),
      this.getOrderCount(comparison.start, comparison.end, dto.shopId),
      this.getTotalRevenue(comparison.start, comparison.end, dto.shopId),
    ]);

    // Get additional metrics
    const [
      ordersByStatus,
      topProducts,
      topShops,
      recentOrders,
      salesTrend,
    ] = await Promise.all([
      this.getOrdersByStatus(start, end, dto.shopId),
      this.getTopProducts(start, end, dto.shopId, 5),
      this.getTopShops(start, end, 5),
      this.getRecentOrders(dto.shopId, 10),
      this.getSalesTrend(start, end, dto.shopId, 'day'),
    ]);

    return {
      summary: {
        totalOrders: currentOrders,
        ordersChange: this.calculatePercentageChange(currentOrders, previousOrders),
        totalRevenue: currentRevenue,
        revenueChange: this.calculatePercentageChange(currentRevenue, previousRevenue),
        newCustomers: currentCustomers,
        activeProducts: currentProducts,
        averageOrderValue: currentOrders > 0 ? Number((currentRevenue / currentOrders).toFixed(2)) : 0,
      },
      ordersByStatus,
      topProducts,
      topShops,
      recentOrders,
      salesTrend,
      period: { start: start.toISOString(), end: end.toISOString() },
    };
  }

  async getVendorDashboard(shopId: string, dto: DashboardOverviewDto) {
    const { start, end } = this.getDateRange(dto.period || ReportPeriod.THIS_MONTH, dto.startDate, dto.endDate);
    const comparison = await this.getComparisonPeriod(start, end);

    const [
      currentOrders,
      currentRevenue,
      previousOrders,
      previousRevenue,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      averageRating,
      topProducts,
      salesTrend,
      ordersByStatus,
    ] = await Promise.all([
      this.getOrderCount(start, end, shopId),
      this.getTotalRevenue(start, end, shopId),
      this.getOrderCount(comparison.start, comparison.end, shopId),
      this.getTotalRevenue(comparison.start, comparison.end, shopId),
      this.getPendingOrderCount(shopId),
      this.getShopProductCount(shopId),
      this.getLowStockProductCount(shopId),
      this.getShopAverageRating(shopId),
      this.getTopProducts(start, end, shopId, 10),
      this.getSalesTrend(start, end, shopId, 'day'),
      this.getOrdersByStatus(start, end, shopId),
    ]);

    return {
      summary: {
        totalOrders: currentOrders,
        ordersChange: this.calculatePercentageChange(currentOrders, previousOrders),
        totalRevenue: currentRevenue,
        revenueChange: this.calculatePercentageChange(currentRevenue, previousRevenue),
        pendingOrders,
        totalProducts,
        lowStockProducts,
        averageRating,
        averageOrderValue: currentOrders > 0 ? Number((currentRevenue / currentOrders).toFixed(2)) : 0,
      },
      topProducts,
      salesTrend,
      ordersByStatus,
      period: { start: start.toISOString(), end: end.toISOString() },
    };
  }

  // ============================================
  // TRANSACTION REPORTS
  // ============================================

  async getTransactionReport(dto: TransactionReportDto) {
    const { start, end } = this.getDateRange(dto.period || ReportPeriod.THIS_MONTH, dto.startDate, dto.endDate);

    let query = this.db.query_builder()
      .from('transactions')
      .select('*')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString());

    if (dto.shopId) {
      query = query.where('shop_id', dto.shopId);
    }
    if (dto.transactionType) {
      query = query.where('type', dto.transactionType);
    }
    if (dto.transactionStatus) {
      query = query.where('status', dto.transactionStatus);
    }

    const transactions = await query.orderBy('created_at', 'DESC').get();

    // Calculate summary
    const summary = {
      totalTransactions: transactions.length,
      totalAmount: transactions.reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0),
      byType: {} as Record<string, { count: number; amount: number }>,
      byStatus: {} as Record<string, { count: number; amount: number }>,
    };

    transactions.forEach((t: any) => {
      const type = t.type || 'unknown';
      const status = t.status || 'unknown';
      const amount = parseFloat(t.amount) || 0;

      if (!summary.byType[type]) summary.byType[type] = { count: 0, amount: 0 };
      summary.byType[type].count++;
      summary.byType[type].amount += amount;

      if (!summary.byStatus[status]) summary.byStatus[status] = { count: 0, amount: 0 };
      summary.byStatus[status].count++;
      summary.byStatus[status].amount += amount;
    });

    return {
      summary,
      transactions: transactions.slice(0, dto.limit || 100),
      period: { start: start.toISOString(), end: end.toISOString() },
    };
  }

  // ============================================
  // ORDER REPORTS
  // ============================================

  async getOrderReport(dto: OrderReportDto) {
    const { start, end } = this.getDateRange(dto.period || ReportPeriod.THIS_MONTH, dto.startDate, dto.endDate);

    let query = this.db.query_builder()
      .from('orders')
      .select('*')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString());

    if (dto.shopId) {
      query = query.where('shop_id', dto.shopId);
    }
    if (dto.orderStatuses && dto.orderStatuses.length > 0) {
      query = query.whereIn('status', dto.orderStatuses);
    }
    if (dto.zoneId) {
      query = query.where('zone_id', dto.zoneId);
    }
    if (dto.paymentMethod) {
      query = query.where('payment_method', dto.paymentMethod);
    }

    const orders = await query.orderBy('created_at', 'DESC').get();

    // Calculate summary
    const summary = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0),
      averageOrderValue: 0,
      byStatus: {} as Record<string, number>,
      byPaymentMethod: {} as Record<string, number>,
      totalTax: 0,
      totalDeliveryFees: 0,
      totalDiscount: 0,
    };

    orders.forEach((o: any) => {
      const status = o.status || 'unknown';
      const paymentMethod = o.payment_method || 'unknown';

      if (!summary.byStatus[status]) summary.byStatus[status] = 0;
      summary.byStatus[status]++;

      if (!summary.byPaymentMethod[paymentMethod]) summary.byPaymentMethod[paymentMethod] = 0;
      summary.byPaymentMethod[paymentMethod]++;

      if (dto.includeTax) {
        summary.totalTax += parseFloat(o.tax) || 0;
      }
      if (dto.includeDelivery) {
        summary.totalDeliveryFees += parseFloat(o.delivery_fee) || 0;
      }
      summary.totalDiscount += parseFloat(o.discount) || 0;
    });

    summary.averageOrderValue = summary.totalOrders > 0
      ? Number((summary.totalRevenue / summary.totalOrders).toFixed(2))
      : 0;

    // Group by date if requested
    let groupedData = null;
    if (dto.groupBy) {
      groupedData = this.groupOrdersByPeriod(orders, dto.groupBy);
    }

    return {
      summary,
      orders: orders.slice(0, dto.limit || 100),
      groupedData,
      period: { start: start.toISOString(), end: end.toISOString() },
    };
  }

  private groupOrdersByPeriod(orders: any[], groupBy: string): Record<string, any> {
    const grouped: Record<string, { count: number; revenue: number }> = {};

    orders.forEach((order: any) => {
      const date = new Date(order.created_at);
      let key: string;

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `Week of ${weekStart.toISOString().split('T')[0]}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = String(date.getFullYear());
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped[key]) grouped[key] = { count: 0, revenue: 0 };
      grouped[key].count++;
      grouped[key].revenue += parseFloat(order.total) || 0;
    });

    return grouped;
  }

  // ============================================
  // ITEM/PRODUCT REPORTS
  // ============================================

  async getItemReport(dto: ItemReportDto) {
    const { start, end } = this.getDateRange(dto.period || ReportPeriod.THIS_MONTH, dto.startDate, dto.endDate);

    // Get products with sales data
    let query = this.db.query_builder()
      .from('products')
      .select('*');

    if (dto.shopId) {
      query = query.where('shop_id', dto.shopId);
    }
    if (dto.categoryId) {
      query = query.where('category_id', dto.categoryId);
    }
    if (dto.lowStockOnly) {
      const threshold = dto.stockThreshold || 10;
      query = query.where('stock', '<=', threshold);
    }

    const products = await query.get();

    // Get order items for sales data
    const orderItems = await this.db.query_builder()
      .from('order_items')
      .select('product_id', 'quantity', 'price', 'total')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString())
      .get();

    // Aggregate sales by product
    const salesByProduct: Record<string, { quantity: number; revenue: number; orders: number }> = {};
    orderItems.forEach((item: any) => {
      const productId = item.product_id;
      if (!salesByProduct[productId]) {
        salesByProduct[productId] = { quantity: 0, revenue: 0, orders: 0 };
      }
      salesByProduct[productId].quantity += parseInt(item.quantity) || 0;
      salesByProduct[productId].revenue += parseFloat(item.total) || 0;
      salesByProduct[productId].orders++;
    });

    // Combine product data with sales
    const productReport = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category_id,
      shop: p.shop_id,
      stock: p.stock,
      price: p.price,
      sales: salesByProduct[p.id] || { quantity: 0, revenue: 0, orders: 0 },
    }));

    // Sort by requested field
    const sortField = dto.sortBy || 'sales';
    const sortOrder = dto.sortOrder || 'desc';
    productReport.sort((a: any, b: any) => {
      let aVal, bVal;
      if (sortField === 'sales' || sortField === 'revenue') {
        aVal = a.sales.revenue;
        bVal = b.sales.revenue;
      } else if (sortField === 'quantity') {
        aVal = a.sales.quantity;
        bVal = b.sales.quantity;
      } else {
        aVal = a[sortField];
        bVal = b[sortField];
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // Calculate summary
    const summary = {
      totalProducts: products.length,
      totalSalesQuantity: Object.values(salesByProduct).reduce((sum, s) => sum + s.quantity, 0),
      totalSalesRevenue: Object.values(salesByProduct).reduce((sum, s) => sum + s.revenue, 0),
      lowStockCount: products.filter((p: any) => (p.stock || 0) <= (dto.stockThreshold || 10)).length,
      outOfStockCount: products.filter((p: any) => (p.stock || 0) === 0).length,
    };

    return {
      summary,
      products: productReport.slice(0, dto.limit || 100),
      period: { start: start.toISOString(), end: end.toISOString() },
    };
  }

  async getLowStockReport(shopId?: string, threshold: number = 10) {
    let query = this.db.query_builder()
      .from('products')
      .select('*')
      .where('stock', '<=', threshold)
      .orderBy('stock', 'ASC');

    if (shopId) {
      query = query.where('shop_id', shopId);
    }

    const products = await query.get();

    return {
      totalCount: products.length,
      products,
      threshold,
    };
  }

  // ============================================
  // STORE REPORTS
  // ============================================

  async getStoreReport(dto: StoreReportDto) {
    const { start, end } = this.getDateRange(dto.period || ReportPeriod.THIS_MONTH, dto.startDate, dto.endDate);

    let query = this.db.query_builder()
      .from('shops')
      .select('*');

    if (dto.activeOnly) {
      query = query.where('status', 'active');
    }
    if (dto.zoneId) {
      query = query.where('zone_id', dto.zoneId);
    }

    const shops = await query.get();

    // Get order data for each shop
    const orderData = await this.db.query_builder()
      .from('orders')
      .select('shop_id', 'total', 'status')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString())
      .get();

    // Aggregate by shop
    const shopStats: Record<string, { orders: number; revenue: number; completed: number }> = {};
    orderData.forEach((order: any) => {
      const shopId = order.shop_id;
      if (!shopStats[shopId]) {
        shopStats[shopId] = { orders: 0, revenue: 0, completed: 0 };
      }
      shopStats[shopId].orders++;
      shopStats[shopId].revenue += parseFloat(order.total) || 0;
      if (order.status === 'delivered' || order.status === 'completed') {
        shopStats[shopId].completed++;
      }
    });

    // Combine shop data with stats
    const shopReport = shops.map((s: any) => ({
      id: s.id,
      name: s.name,
      logo: s.logo,
      status: s.status,
      rating: s.rating,
      zone: s.zone_id,
      stats: shopStats[s.id] || { orders: 0, revenue: 0, completed: 0 },
    }));

    // Sort
    const sortField = dto.sortBy || 'revenue';
    const sortOrder = dto.sortOrder || 'desc';
    shopReport.sort((a: any, b: any) => {
      let aVal, bVal;
      if (sortField === 'revenue' || sortField === 'orders') {
        aVal = a.stats[sortField];
        bVal = b.stats[sortField];
      } else {
        aVal = a[sortField];
        bVal = b[sortField];
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // Summary
    const summary = {
      totalShops: shops.length,
      activeShops: shops.filter((s: any) => s.status === 'active').length,
      totalOrders: Object.values(shopStats).reduce((sum, s) => sum + s.orders, 0),
      totalRevenue: Object.values(shopStats).reduce((sum, s) => sum + s.revenue, 0),
    };

    return {
      summary,
      shops: shopReport.slice(0, dto.limit || 100),
      period: { start: start.toISOString(), end: end.toISOString() },
    };
  }

  // ============================================
  // CUSTOMER REPORTS
  // ============================================

  async getCustomerReport(dto: CustomerReportDto) {
    const { start, end } = this.getDateRange(dto.period || ReportPeriod.THIS_MONTH, dto.startDate, dto.endDate);

    // Get customers (users with orders)
    const orderData = await this.db.query_builder()
      .from('orders')
      .select('user_id', 'total', 'created_at')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString())
      .get();

    // Aggregate by customer
    const customerStats: Record<string, { orders: number; spent: number; lastOrder: string }> = {};
    orderData.forEach((order: any) => {
      const customerId = order.user_id;
      if (!customerStats[customerId]) {
        customerStats[customerId] = { orders: 0, spent: 0, lastOrder: order.created_at };
      }
      customerStats[customerId].orders++;
      customerStats[customerId].spent += parseFloat(order.total) || 0;
      if (order.created_at > customerStats[customerId].lastOrder) {
        customerStats[customerId].lastOrder = order.created_at;
      }
    });

    // Convert to array and filter
    let customerReport = Object.entries(customerStats).map(([userId, stats]) => ({
      userId,
      ...stats,
      averageOrderValue: stats.orders > 0 ? Number((stats.spent / stats.orders).toFixed(2)) : 0,
    }));

    if (dto.minOrders) {
      customerReport = customerReport.filter(c => c.orders >= dto.minOrders!);
    }
    if (dto.minSpent) {
      customerReport = customerReport.filter(c => c.spent >= dto.minSpent!);
    }

    // Sort
    const sortField = dto.sortBy || 'spent';
    const sortOrder = dto.sortOrder || 'desc';
    customerReport.sort((a: any, b: any) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // Summary
    const summary = {
      totalCustomers: customerReport.length,
      totalOrders: customerReport.reduce((sum, c) => sum + c.orders, 0),
      totalRevenue: customerReport.reduce((sum, c) => sum + c.spent, 0),
      averageOrdersPerCustomer: customerReport.length > 0
        ? Number((customerReport.reduce((sum, c) => sum + c.orders, 0) / customerReport.length).toFixed(2))
        : 0,
      averageSpentPerCustomer: customerReport.length > 0
        ? Number((customerReport.reduce((sum, c) => sum + c.spent, 0) / customerReport.length).toFixed(2))
        : 0,
    };

    return {
      summary,
      customers: customerReport.slice(0, dto.limit || 100),
      period: { start: start.toISOString(), end: end.toISOString() },
    };
  }

  // ============================================
  // DELIVERY REPORTS
  // ============================================

  async getDeliveryReport(dto: DeliveryReportDto) {
    const { start, end } = this.getDateRange(dto.period || ReportPeriod.THIS_MONTH, dto.startDate, dto.endDate);

    // Get delivery men
    let dmQuery = this.db.query_builder()
      .from('delivery_men')
      .select('*');

    if (dto.deliveryManId) {
      dmQuery = dmQuery.where('id', dto.deliveryManId);
    }

    const deliveryMen = await dmQuery.get();

    // Get delivery assignments
    const assignments = await this.db.query_builder()
      .from('delivery_assignments')
      .select('*')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString())
      .get();

    // Aggregate by delivery man
    const dmStats: Record<string, { deliveries: number; completed: number; earnings: number }> = {};
    assignments.forEach((a: any) => {
      const dmId = a.delivery_man_id;
      if (!dmStats[dmId]) {
        dmStats[dmId] = { deliveries: 0, completed: 0, earnings: 0 };
      }
      dmStats[dmId].deliveries++;
      if (a.status === 'delivered') {
        dmStats[dmId].completed++;
        dmStats[dmId].earnings += parseFloat(a.delivery_fee) || 0;
      }
    });

    // Combine
    const deliveryReport = deliveryMen.map((dm: any) => ({
      id: dm.id,
      name: `${dm.first_name} ${dm.last_name}`,
      phone: dm.phone,
      status: dm.status,
      vehicleType: dm.vehicle_type,
      rating: dm.rating,
      stats: dmStats[dm.id] || { deliveries: 0, completed: 0, earnings: 0 },
      completionRate: dmStats[dm.id]
        ? Number(((dmStats[dm.id].completed / dmStats[dm.id].deliveries) * 100).toFixed(2))
        : 0,
    }));

    // Summary
    const summary = {
      totalDeliveryMen: deliveryMen.length,
      activeDeliveryMen: deliveryMen.filter((dm: any) => dm.status === 'active').length,
      totalDeliveries: Object.values(dmStats).reduce((sum, s) => sum + s.deliveries, 0),
      completedDeliveries: Object.values(dmStats).reduce((sum, s) => sum + s.completed, 0),
      totalEarnings: Object.values(dmStats).reduce((sum, s) => sum + s.earnings, 0),
      averageCompletionRate: deliveryReport.length > 0
        ? Number((deliveryReport.reduce((sum, d) => sum + d.completionRate, 0) / deliveryReport.length).toFixed(2))
        : 0,
    };

    return {
      summary,
      deliveryMen: deliveryReport.slice(0, dto.limit || 100),
      period: { start: start.toISOString(), end: end.toISOString() },
    };
  }

  // ============================================
  // EXPENSE REPORTS
  // ============================================

  async getExpenseReport(dto: ExpenseReportDto) {
    const { start, end } = this.getDateRange(dto.period || ReportPeriod.THIS_MONTH, dto.startDate, dto.endDate);

    let query = this.db.query_builder()
      .from('expenses')
      .select('*')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString());

    if (dto.shopId) {
      query = query.where('shop_id', dto.shopId);
    }
    if (dto.expenseCategory) {
      query = query.where('category', dto.expenseCategory);
    }
    if (dto.expenseType) {
      query = query.where('type', dto.expenseType);
    }

    const expenses = await query.orderBy('created_at', 'DESC').get();

    // Group by category
    const byCategory: Record<string, number> = {};
    const byType: Record<string, number> = {};

    expenses.forEach((e: any) => {
      const category = e.category || 'uncategorized';
      const type = e.type || 'other';
      const amount = parseFloat(e.amount) || 0;

      if (!byCategory[category]) byCategory[category] = 0;
      byCategory[category] += amount;

      if (!byType[type]) byType[type] = 0;
      byType[type] += amount;
    });

    // Summary
    const summary = {
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum: number, e: any) => sum + (parseFloat(e.amount) || 0), 0),
      byCategory,
      byType,
    };

    return {
      summary,
      expenses: expenses.slice(0, dto.limit || 100),
      period: { start: start.toISOString(), end: end.toISOString() },
    };
  }

  // ============================================
  // TAX REPORTS
  // ============================================

  async getTaxReport(dto: TaxReportDto) {
    const { start, end } = this.getDateRange(dto.period || ReportPeriod.THIS_MONTH, dto.startDate, dto.endDate);

    // Get orders with tax data
    let query = this.db.query_builder()
      .from('orders')
      .select('id', 'shop_id', 'tax', 'subtotal', 'total', 'created_at')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString());

    if (dto.shopId) {
      query = query.where('shop_id', dto.shopId);
    }

    const orders = await query.get();

    // Calculate tax totals
    const totalTax = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.tax) || 0), 0);
    const totalSubtotal = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.subtotal) || 0), 0);

    // Group by shop
    const taxByShop: Record<string, { tax: number; orders: number }> = {};
    orders.forEach((o: any) => {
      const shopId = o.shop_id || 'platform';
      if (!taxByShop[shopId]) taxByShop[shopId] = { tax: 0, orders: 0 };
      taxByShop[shopId].tax += parseFloat(o.tax) || 0;
      taxByShop[shopId].orders++;
    });

    // Summary
    const summary = {
      totalOrders: orders.length,
      totalSubtotal,
      totalTax,
      effectiveTaxRate: totalSubtotal > 0 ? Number(((totalTax / totalSubtotal) * 100).toFixed(2)) : 0,
      taxByShop,
    };

    return {
      summary,
      period: { start: start.toISOString(), end: end.toISOString() },
    };
  }

  // ============================================
  // REVENUE REPORTS
  // ============================================

  async getRevenueReport(dto: RevenueReportDto) {
    const { start, end } = this.getDateRange(dto.period || ReportPeriod.THIS_MONTH, dto.startDate, dto.endDate);

    // Get orders
    let orderQuery = this.db.query_builder()
      .from('orders')
      .select('*')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString());

    if (dto.shopId) {
      orderQuery = orderQuery.where('shop_id', dto.shopId);
    }

    const orders = await orderQuery.get();

    // Calculate revenue components
    let grossRevenue = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let totalDeliveryFees = 0;
    let totalRefunds = 0;
    let totalCommissions = 0;

    orders.forEach((o: any) => {
      grossRevenue += parseFloat(o.subtotal) || 0;
      totalDiscount += parseFloat(o.discount) || 0;
      totalTax += parseFloat(o.tax) || 0;
      totalDeliveryFees += parseFloat(o.delivery_fee) || 0;
      totalCommissions += parseFloat(o.platform_commission) || 0;
    });

    // Get refunds if requested
    if (dto.includeRefunds) {
      const refunds = await this.db.query_builder()
        .from('refunds')
        .select('amount')
        .where('created_at', '>=', start.toISOString())
        .where('created_at', '<=', end.toISOString())
        .where('status', 'completed')
        .get();

      totalRefunds = refunds.reduce((sum: number, r: any) => sum + (parseFloat(r.amount) || 0), 0);
    }

    const netRevenue = grossRevenue - totalDiscount - totalRefunds;

    // Group by date
    const revenueByDate = this.groupOrdersByPeriod(orders, dto.groupBy || 'day');

    // Summary
    const summary = {
      grossRevenue,
      totalDiscount,
      totalTax,
      totalDeliveryFees,
      totalRefunds,
      totalCommissions,
      netRevenue,
      orderCount: orders.length,
      averageOrderValue: orders.length > 0 ? Number((grossRevenue / orders.length).toFixed(2)) : 0,
    };

    return {
      summary,
      revenueByDate,
      period: { start: start.toISOString(), end: end.toISOString() },
    };
  }

  // ============================================
  // PERFORMANCE REPORTS
  // ============================================

  async getPerformanceReport(dto: PerformanceReportDto) {
    const { start, end } = this.getDateRange(dto.period || ReportPeriod.THIS_MONTH, dto.startDate, dto.endDate);
    const comparison = await this.getComparisonPeriod(start, end);

    // Get current period metrics
    const [currentOrders, previousOrders] = await Promise.all([
      this.db.query_builder()
        .from('orders')
        .select('*')
        .where('created_at', '>=', start.toISOString())
        .where('created_at', '<=', end.toISOString())
        .get(),
      this.db.query_builder()
        .from('orders')
        .select('*')
        .where('created_at', '>=', comparison.start.toISOString())
        .where('created_at', '<=', comparison.end.toISOString())
        .get(),
    ]);

    // Calculate metrics
    const currentRevenue = currentOrders.reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0);
    const previousRevenue = previousOrders.reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0);

    const currentAOV = currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0;
    const previousAOV = previousOrders.length > 0 ? previousRevenue / previousOrders.length : 0;

    const completedCurrent = currentOrders.filter((o: any) => o.status === 'delivered' || o.status === 'completed').length;
    const completedPrevious = previousOrders.filter((o: any) => o.status === 'delivered' || o.status === 'completed').length;

    const conversionRate = currentOrders.length > 0 ? (completedCurrent / currentOrders.length) * 100 : 0;
    const previousConversionRate = previousOrders.length > 0 ? (completedPrevious / previousOrders.length) * 100 : 0;

    return {
      metrics: {
        orders: {
          current: currentOrders.length,
          previous: previousOrders.length,
          change: this.calculatePercentageChange(currentOrders.length, previousOrders.length),
        },
        revenue: {
          current: Number(currentRevenue.toFixed(2)),
          previous: Number(previousRevenue.toFixed(2)),
          change: this.calculatePercentageChange(currentRevenue, previousRevenue),
        },
        averageOrderValue: {
          current: Number(currentAOV.toFixed(2)),
          previous: Number(previousAOV.toFixed(2)),
          change: this.calculatePercentageChange(currentAOV, previousAOV),
        },
        completionRate: {
          current: Number(conversionRate.toFixed(2)),
          previous: Number(previousConversionRate.toFixed(2)),
          change: this.calculatePercentageChange(conversionRate, previousConversionRate),
        },
      },
      period: {
        current: { start: start.toISOString(), end: end.toISOString() },
        comparison: { start: comparison.start.toISOString(), end: comparison.end.toISOString() },
      },
    };
  }

  // ============================================
  // EXPORT FUNCTIONALITY
  // ============================================

  async exportReport(dto: ExportReportDto) {
    let reportData: any;

    // Get report data based on type
    switch (dto.reportType) {
      case ReportType.TRANSACTION:
        reportData = await this.getTransactionReport(dto as any);
        break;
      case ReportType.ORDER:
        reportData = await this.getOrderReport(dto as any);
        break;
      case ReportType.ITEM:
        reportData = await this.getItemReport(dto as any);
        break;
      case ReportType.STORE:
        reportData = await this.getStoreReport(dto as any);
        break;
      case ReportType.CUSTOMER:
        reportData = await this.getCustomerReport(dto as any);
        break;
      case ReportType.DELIVERY:
        reportData = await this.getDeliveryReport(dto as any);
        break;
      case ReportType.EXPENSE:
        reportData = await this.getExpenseReport(dto as any);
        break;
      case ReportType.TAX:
        reportData = await this.getTaxReport(dto as any);
        break;
      case ReportType.REVENUE:
        reportData = await this.getRevenueReport(dto as any);
        break;
      case ReportType.PERFORMANCE:
        reportData = await this.getPerformanceReport(dto as any);
        break;
      default:
        throw new BadRequestException(`Unknown report type: ${dto.reportType}`);
    }

    // Format based on export format
    switch (dto.format) {
      case ExportFormat.JSON:
        return {
          data: reportData,
          contentType: 'application/json',
          fileName: `${dto.fileName || dto.reportType}_report_${Date.now()}.json`,
        };

      case ExportFormat.CSV:
        const csvData = this.convertToCSV(reportData, dto.columns);
        return {
          data: csvData,
          contentType: 'text/csv',
          fileName: `${dto.fileName || dto.reportType}_report_${Date.now()}.csv`,
        };

      case ExportFormat.EXCEL:
        // Return data for Excel processing (would use a library like xlsx in production)
        return {
          data: reportData,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          fileName: `${dto.fileName || dto.reportType}_report_${Date.now()}.xlsx`,
          needsProcessing: true,
        };

      case ExportFormat.PDF:
        // Return data for PDF processing (would use a library like pdfkit in production)
        return {
          data: reportData,
          contentType: 'application/pdf',
          fileName: `${dto.fileName || dto.reportType}_report_${Date.now()}.pdf`,
          needsProcessing: true,
        };

      default:
        return { data: reportData, contentType: 'application/json' };
    }
  }

  private convertToCSV(data: any, columns?: string[]): string {
    const items = data.transactions || data.orders || data.products || data.shops ||
                  data.customers || data.deliveryMen || data.expenses || [];

    if (items.length === 0) return '';

    const headers = columns || Object.keys(items[0]);
    const csvRows = [headers.join(',')];

    items.forEach((item: any) => {
      const values = headers.map((h: string) => {
        const val = item[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val).includes(',') ? `"${val}"` : val;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  // ============================================
  // SCHEDULED REPORTS
  // ============================================

  async createScheduledReport(dto: CreateScheduledReportDto, userId: string) {
    const report = await this.db.query_builder()
      .from('scheduled_reports')
      .insert({
        name: dto.name,
        report_type: dto.reportType,
        format: dto.format,
        schedule: dto.schedule,
        recipients: JSON.stringify(dto.recipients),
        filters: JSON.stringify(dto.filters || {}),
        is_active: dto.isActive !== false,
        created_by: userId,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return report[0];
  }

  async getScheduledReports(userId?: string) {
    let query = this.db.query_builder()
      .from('scheduled_reports')
      .select('*');

    if (userId) {
      query = query.where('created_by', userId);
    }

    return query.orderBy('created_at', 'DESC').get();
  }

  async updateScheduledReport(id: string, dto: UpdateScheduledReportDto) {
    const updateData: any = { updated_at: new Date().toISOString() };

    if (dto.name) updateData.name = dto.name;
    if (dto.schedule) updateData.schedule = dto.schedule;
    if (dto.recipients) updateData.recipients = JSON.stringify(dto.recipients);
    if (dto.filters) updateData.filters = JSON.stringify(dto.filters);
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const result = await this.db.query_builder()
      .from('scheduled_reports')
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute();

    return result[0];
  }

  async deleteScheduledReport(id: string) {
    await this.db.query_builder()
      .from('scheduled_reports')
      .where('id', id)
      .delete()
      .execute();

    return { success: true };
  }

  // ============================================
  // GOALS/KPIs
  // ============================================

  async createGoal(dto: CreateGoalDto, userId: string) {
    const { start, end } = this.getDateRange(dto.period, dto.startDate, dto.endDate);

    const goal = await this.db.query_builder()
      .from('analytics_goals')
      .insert({
        name: dto.name,
        metric: dto.metric,
        target_value: dto.targetValue,
        current_value: 0,
        period: dto.period,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        shop_id: dto.shopId,
        notify_on_completion: dto.notifyOnCompletion || false,
        warning_threshold: dto.warningThreshold || 80,
        status: 'active',
        created_by: userId,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return goal[0];
  }

  async getGoals(shopId?: string, userId?: string) {
    let query = this.db.query_builder()
      .from('analytics_goals')
      .select('*');

    if (shopId) {
      query = query.where('shop_id', shopId);
    }
    if (userId) {
      query = query.where('created_by', userId);
    }

    const goals = await query.orderBy('created_at', 'DESC').get();

    // Calculate current progress for each goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal: any) => {
        const currentValue = await this.getMetricValue(
          goal.metric,
          new Date(goal.start_date),
          new Date(goal.end_date),
          goal.shop_id
        );
        const progress = goal.target_value > 0
          ? Number(((currentValue / goal.target_value) * 100).toFixed(2))
          : 0;

        return {
          ...goal,
          currentValue,
          progress,
          isCompleted: currentValue >= goal.target_value,
          isWarning: progress >= goal.warning_threshold && progress < 100,
        };
      })
    );

    return goalsWithProgress;
  }

  async updateGoal(id: string, dto: UpdateGoalDto) {
    const updateData: any = { updated_at: new Date().toISOString() };

    if (dto.name) updateData.name = dto.name;
    if (dto.targetValue) updateData.target_value = dto.targetValue;
    if (dto.notifyOnCompletion !== undefined) updateData.notify_on_completion = dto.notifyOnCompletion;
    if (dto.warningThreshold) updateData.warning_threshold = dto.warningThreshold;

    const result = await this.db.query_builder()
      .from('analytics_goals')
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute();

    return result[0];
  }

  async deleteGoal(id: string) {
    await this.db.query_builder()
      .from('analytics_goals')
      .where('id', id)
      .delete()
      .execute();

    return { success: true };
  }

  // ============================================
  // ALERTS
  // ============================================

  async createAlert(dto: CreateAlertDto, userId: string) {
    const alert = await this.db.query_builder()
      .from('analytics_alerts')
      .insert({
        name: dto.name,
        metric: dto.metric,
        condition: dto.condition,
        threshold: dto.threshold,
        shop_id: dto.shopId,
        notification_channels: JSON.stringify(dto.notificationChannels),
        webhook_url: dto.webhookUrl,
        is_active: dto.isActive !== false,
        cooldown_minutes: dto.cooldownMinutes || 60,
        last_triggered_at: null,
        created_by: userId,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return alert[0];
  }

  async getAlerts(shopId?: string, userId?: string) {
    let query = this.db.query_builder()
      .from('analytics_alerts')
      .select('*');

    if (shopId) {
      query = query.where('shop_id', shopId);
    }
    if (userId) {
      query = query.where('created_by', userId);
    }

    return query.orderBy('created_at', 'DESC').get();
  }

  async updateAlert(id: string, dto: UpdateAlertDto) {
    const updateData: any = { updated_at: new Date().toISOString() };

    if (dto.name) updateData.name = dto.name;
    if (dto.threshold) updateData.threshold = dto.threshold;
    if (dto.notificationChannels) updateData.notification_channels = JSON.stringify(dto.notificationChannels);
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
    if (dto.cooldownMinutes) updateData.cooldown_minutes = dto.cooldownMinutes;

    const result = await this.db.query_builder()
      .from('analytics_alerts')
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute();

    return result[0];
  }

  async deleteAlert(id: string) {
    await this.db.query_builder()
      .from('analytics_alerts')
      .where('id', id)
      .delete()
      .execute();

    return { success: true };
  }

  // ============================================
  // COMPARISON REPORTS
  // ============================================

  async comparePeriods(dto: ComparePeriodsDto) {
    const period1Data = await this.getPeriodMetrics(
      new Date(dto.period1Start),
      new Date(dto.period1End),
      dto.shopId,
      dto.metrics
    );

    const period2Data = await this.getPeriodMetrics(
      new Date(dto.period2Start),
      new Date(dto.period2End),
      dto.shopId,
      dto.metrics
    );

    const comparison: Record<string, any> = {};

    Object.keys(period1Data).forEach(metric => {
      comparison[metric] = {
        period1: period1Data[metric],
        period2: period2Data[metric],
        change: this.calculatePercentageChange(period1Data[metric], period2Data[metric]),
        trend: period1Data[metric] > period2Data[metric] ? 'up' :
               period1Data[metric] < period2Data[metric] ? 'down' : 'stable',
      };
    });

    return {
      comparison,
      periods: {
        period1: { start: dto.period1Start, end: dto.period1End },
        period2: { start: dto.period2Start, end: dto.period2End },
      },
    };
  }

  async compareShops(dto: CompareShopsDto) {
    const { start, end } = this.getDateRange(dto.period || ReportPeriod.THIS_MONTH, dto.startDate, dto.endDate);

    const shopComparisons = await Promise.all(
      dto.shopIds.map(async (shopId) => {
        const metrics = await this.getPeriodMetrics(start, end, shopId, dto.metrics);
        const shop = await this.db.query_builder()
          .from('shops')
          .select('id', 'name', 'logo')
          .where('id', shopId)
          .get();

        return {
          shop: shop[0] || { id: shopId, name: 'Unknown' },
          metrics,
        };
      })
    );

    return {
      shops: shopComparisons,
      period: { start: start.toISOString(), end: end.toISOString() },
    };
  }

  // ============================================
  // COHORT & FUNNEL ANALYSIS
  // ============================================

  async getCohortAnalysis(dto: CohortAnalysisDto) {
    const { start, end } = this.getDateRange(dto.period || ReportPeriod.THIS_YEAR, dto.startDate, dto.endDate);

    // This is a simplified cohort analysis
    // In production, you'd want more sophisticated queries
    const orders = await this.db.query_builder()
      .from('orders')
      .select('user_id', 'total', 'created_at')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString())
      .orderBy('created_at', 'ASC')
      .get();

    // Group by user's first order month
    const cohorts: Record<string, Record<string, any>> = {};
    const userFirstOrder: Record<string, string> = {};

    orders.forEach((order: any) => {
      const userId = order.user_id;
      const orderDate = new Date(order.created_at);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;

      if (!userFirstOrder[userId]) {
        userFirstOrder[userId] = monthKey;
      }

      const cohortMonth = userFirstOrder[userId];
      if (!cohorts[cohortMonth]) cohorts[cohortMonth] = {};
      if (!cohorts[cohortMonth][monthKey]) {
        cohorts[cohortMonth][monthKey] = { users: new Set(), revenue: 0, orders: 0 };
      }

      cohorts[cohortMonth][monthKey].users.add(userId);
      cohorts[cohortMonth][monthKey].revenue += parseFloat(order.total) || 0;
      cohorts[cohortMonth][monthKey].orders++;
    });

    // Convert Sets to counts
    Object.keys(cohorts).forEach(cohortMonth => {
      Object.keys(cohorts[cohortMonth]).forEach(month => {
        cohorts[cohortMonth][month].userCount = cohorts[cohortMonth][month].users.size;
        delete cohorts[cohortMonth][month].users;
      });
    });

    return {
      cohorts,
      metric: dto.metric,
      granularity: dto.granularity || 'month',
      period: { start: start.toISOString(), end: end.toISOString() },
    };
  }

  async getFunnelAnalysis(dto: FunnelAnalysisDto) {
    // Simplified funnel analysis based on order status progression
    const { start, end } = this.getDateRange(dto.period || ReportPeriod.THIS_MONTH, dto.startDate, dto.endDate);

    // Example: cart -> checkout -> order -> delivered
    const funnelSteps = dto.steps || ['cart_created', 'checkout_started', 'order_placed', 'order_delivered'];

    // Get counts for each step
    const stepCounts = await Promise.all(
      funnelSteps.map(async (step) => {
        let count = 0;

        switch (step) {
          case 'cart_created':
          case 'view_product':
            // Estimate from sessions or carts
            const carts = await this.db.query_builder()
              .from('carts')
              .select('id')
              .where('created_at', '>=', start.toISOString())
              .where('created_at', '<=', end.toISOString())
              .get();
            count = carts.length;
            break;

          case 'checkout_started':
          case 'add_to_cart':
            const checkouts = await this.db.query_builder()
              .from('orders')
              .select('id')
              .where('created_at', '>=', start.toISOString())
              .where('created_at', '<=', end.toISOString())
              .get();
            count = checkouts.length;
            break;

          case 'order_placed':
          case 'purchase':
            const orders = await this.db.query_builder()
              .from('orders')
              .select('id')
              .where('created_at', '>=', start.toISOString())
              .where('created_at', '<=', end.toISOString())
              .whereIn('status', ['pending', 'confirmed', 'processing', 'delivered', 'completed'])
              .get();
            count = orders.length;
            break;

          case 'order_delivered':
            const delivered = await this.db.query_builder()
              .from('orders')
              .select('id')
              .where('created_at', '>=', start.toISOString())
              .where('created_at', '<=', end.toISOString())
              .whereIn('status', ['delivered', 'completed'])
              .get();
            count = delivered.length;
            break;

          default:
            count = 0;
        }

        return { step, count };
      })
    );

    // Calculate conversion rates
    const funnel = stepCounts.map((step, index) => {
      const previousCount = index > 0 ? stepCounts[index - 1].count : step.count;
      const conversionRate = previousCount > 0 ? (step.count / previousCount) * 100 : 0;
      const overallRate = stepCounts[0].count > 0 ? (step.count / stepCounts[0].count) * 100 : 0;

      return {
        ...step,
        conversionRate: Number(conversionRate.toFixed(2)),
        overallRate: Number(overallRate.toFixed(2)),
        dropoff: index > 0 ? previousCount - step.count : 0,
      };
    });

    return {
      funnel,
      period: { start: start.toISOString(), end: end.toISOString() },
    };
  }

  // ============================================
  // DASHBOARD LAYOUT
  // ============================================

  async saveDashboardLayout(dto: SaveDashboardLayoutDto, userId: string) {
    // Check if layout exists
    const existing = await this.db.query_builder()
      .from('dashboard_layouts')
      .select('id')
      .where('user_id', userId)
      .where('name', dto.layoutName || 'default')
      .get();

    if (existing.length > 0) {
      // Update existing
      const result = await this.db.query_builder()
        .from('dashboard_layouts')
        .where('id', existing[0].id)
        .update({
          widgets: JSON.stringify(dto.widgets),
          is_default: dto.isDefault || false,
          updated_at: new Date().toISOString(),
        })
        .returning('*')
        .execute();

      return result[0];
    } else {
      // Create new
      const result = await this.db.query_builder()
        .from('dashboard_layouts')
        .insert({
          user_id: userId,
          name: dto.layoutName || 'default',
          widgets: JSON.stringify(dto.widgets),
          is_default: dto.isDefault || false,
          created_at: new Date().toISOString(),
        })
        .returning('*')
        .execute();

      return result[0];
    }
  }

  async getDashboardLayout(userId: string, layoutName?: string) {
    let query = this.db.query_builder()
      .from('dashboard_layouts')
      .select('*')
      .where('user_id', userId);

    if (layoutName) {
      query = query.where('name', layoutName);
    } else {
      query = query.where('is_default', true);
    }

    const layouts = await query.get();

    if (layouts.length === 0) {
      // Return default layout
      return {
        widgets: [
          { widgetId: 'revenue', widgetType: 'stat', chartType: 'line' },
          { widgetId: 'orders', widgetType: 'stat', chartType: 'bar' },
          { widgetId: 'customers', widgetType: 'stat' },
          { widgetId: 'topProducts', widgetType: 'table' },
          { widgetId: 'salesTrend', widgetType: 'chart', chartType: 'area' },
          { widgetId: 'ordersByStatus', widgetType: 'chart', chartType: 'pie' },
        ],
        isDefault: true,
      };
    }

    const layout = layouts[0];
    return {
      ...layout,
      widgets: JSON.parse(layout.widgets || '[]'),
    };
  }

  // ============================================
  // HELPER METHODS FOR METRICS
  // ============================================

  private async getOrderCount(start: Date, end: Date, shopId?: string): Promise<number> {
    let query = this.db.query_builder()
      .from('orders')
      .select('id')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString());

    if (shopId) {
      query = query.where('shop_id', shopId);
    }

    const orders = await query.get();
    return orders.length;
  }

  private async getTotalRevenue(start: Date, end: Date, shopId?: string): Promise<number> {
    let query = this.db.query_builder()
      .from('orders')
      .select('total')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString());

    if (shopId) {
      query = query.where('shop_id', shopId);
    }

    const orders = await query.get();
    return orders.reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0);
  }

  private async getNewCustomerCount(start: Date, end: Date): Promise<number> {
    const orders = await this.db.query_builder()
      .from('orders')
      .select('user_id')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString())
      .get();

    const uniqueUsers = new Set(orders.map((o: any) => o.user_id));
    return uniqueUsers.size;
  }

  private async getActiveProductCount(shopId?: string): Promise<number> {
    let query = this.db.query_builder()
      .from('products')
      .select('id')
      .where('status', 'active');

    if (shopId) {
      query = query.where('shop_id', shopId);
    }

    const products = await query.get();
    return products.length;
  }

  private async getPendingOrderCount(shopId?: string): Promise<number> {
    let query = this.db.query_builder()
      .from('orders')
      .select('id')
      .whereIn('status', ['pending', 'confirmed', 'processing']);

    if (shopId) {
      query = query.where('shop_id', shopId);
    }

    const orders = await query.get();
    return orders.length;
  }

  private async getShopProductCount(shopId: string): Promise<number> {
    const products = await this.db.query_builder()
      .from('products')
      .select('id')
      .where('shop_id', shopId)
      .get();

    return products.length;
  }

  private async getLowStockProductCount(shopId: string, threshold: number = 10): Promise<number> {
    const products = await this.db.query_builder()
      .from('products')
      .select('id')
      .where('shop_id', shopId)
      .where('stock', '<=', threshold)
      .get();

    return products.length;
  }

  private async getShopAverageRating(shopId: string): Promise<number> {
    const shop = await this.db.query_builder()
      .from('shops')
      .select('rating')
      .where('id', shopId)
      .get();

    return shop[0]?.rating || 0;
  }

  private async getOrdersByStatus(start: Date, end: Date, shopId?: string): Promise<Record<string, number>> {
    let query = this.db.query_builder()
      .from('orders')
      .select('status')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString());

    if (shopId) {
      query = query.where('shop_id', shopId);
    }

    const orders = await query.get();
    const byStatus: Record<string, number> = {};

    orders.forEach((o: any) => {
      const status = o.status || 'unknown';
      if (!byStatus[status]) byStatus[status] = 0;
      byStatus[status]++;
    });

    return byStatus;
  }

  private async getTopProducts(start: Date, end: Date, shopId?: string, limit: number = 5): Promise<any[]> {
    let query = this.db.query_builder()
      .from('order_items')
      .select('product_id', 'quantity', 'total')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString());

    if (shopId) {
      query = query.where('shop_id', shopId);
    }

    const items = await query.get();

    // Aggregate by product
    const productStats: Record<string, { quantity: number; revenue: number }> = {};
    items.forEach((item: any) => {
      const productId = item.product_id;
      if (!productStats[productId]) {
        productStats[productId] = { quantity: 0, revenue: 0 };
      }
      productStats[productId].quantity += parseInt(item.quantity) || 0;
      productStats[productId].revenue += parseFloat(item.total) || 0;
    });

    // Sort and limit
    const sortedProducts = Object.entries(productStats)
      .map(([productId, stats]) => ({ productId, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    // Get product details
    const productIds = sortedProducts.map(p => p.productId);
    if (productIds.length === 0) return [];

    const products = await this.db.query_builder()
      .from('products')
      .select('id', 'name', 'price', 'image')
      .whereIn('id', productIds)
      .get();

    const productMap = new Map(products.map((p: any) => [p.id, p]));

    return sortedProducts.map(p => ({
      ...p,
      product: productMap.get(p.productId) || { id: p.productId, name: 'Unknown' },
    }));
  }

  private async getTopShops(start: Date, end: Date, limit: number = 5): Promise<any[]> {
    const orders = await this.db.query_builder()
      .from('orders')
      .select('shop_id', 'total')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString())
      .get();

    // Aggregate by shop
    const shopStats: Record<string, { orders: number; revenue: number }> = {};
    orders.forEach((order: any) => {
      const shopId = order.shop_id;
      if (!shopStats[shopId]) {
        shopStats[shopId] = { orders: 0, revenue: 0 };
      }
      shopStats[shopId].orders++;
      shopStats[shopId].revenue += parseFloat(order.total) || 0;
    });

    // Sort and limit
    const sortedShops = Object.entries(shopStats)
      .map(([shopId, stats]) => ({ shopId, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    // Get shop details
    const shopIds = sortedShops.map(s => s.shopId);
    if (shopIds.length === 0) return [];

    const shops = await this.db.query_builder()
      .from('shops')
      .select('id', 'name', 'logo', 'rating')
      .whereIn('id', shopIds)
      .get();

    const shopMap = new Map(shops.map((s: any) => [s.id, s]));

    return sortedShops.map(s => ({
      ...s,
      shop: shopMap.get(s.shopId) || { id: s.shopId, name: 'Unknown' },
    }));
  }

  private async getRecentOrders(shopId?: string, limit: number = 10): Promise<any[]> {
    let query = this.db.query_builder()
      .from('orders')
      .select('*')
      .orderBy('created_at', 'DESC')
      .limit(limit);

    if (shopId) {
      query = query.where('shop_id', shopId);
    }

    return query.get();
  }

  private async getSalesTrend(start: Date, end: Date, shopId?: string, granularity: string = 'day'): Promise<any[]> {
    let query = this.db.query_builder()
      .from('orders')
      .select('created_at', 'total')
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString())
      .orderBy('created_at', 'ASC');

    if (shopId) {
      query = query.where('shop_id', shopId);
    }

    const orders = await query.get();

    // Group by granularity
    const trend: Record<string, { orders: number; revenue: number }> = {};

    orders.forEach((order: any) => {
      const date = new Date(order.created_at);
      let key: string;

      switch (granularity) {
        case 'hour':
          key = `${date.toISOString().split('T')[0]} ${String(date.getHours()).padStart(2, '0')}:00`;
          break;
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!trend[key]) trend[key] = { orders: 0, revenue: 0 };
      trend[key].orders++;
      trend[key].revenue += parseFloat(order.total) || 0;
    });

    return Object.entries(trend).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  private async getMetricValue(metric: string, start: Date, end: Date, shopId?: string): Promise<number> {
    switch (metric) {
      case 'revenue':
        return this.getTotalRevenue(start, end, shopId);
      case 'orders':
        return this.getOrderCount(start, end, shopId);
      case 'customers':
        return this.getNewCustomerCount(start, end);
      case 'products':
        return this.getActiveProductCount(shopId);
      default:
        return 0;
    }
  }

  private async getPeriodMetrics(start: Date, end: Date, shopId?: string, metrics?: string[]): Promise<Record<string, number>> {
    const defaultMetrics = metrics || ['revenue', 'orders', 'customers', 'averageOrderValue'];
    const result: Record<string, number> = {};

    for (const metric of defaultMetrics) {
      switch (metric) {
        case 'revenue':
          result.revenue = await this.getTotalRevenue(start, end, shopId);
          break;
        case 'orders':
          result.orders = await this.getOrderCount(start, end, shopId);
          break;
        case 'customers':
          result.customers = await this.getNewCustomerCount(start, end);
          break;
        case 'averageOrderValue':
          const rev = await this.getTotalRevenue(start, end, shopId);
          const ord = await this.getOrderCount(start, end, shopId);
          result.averageOrderValue = ord > 0 ? Number((rev / ord).toFixed(2)) : 0;
          break;
      }
    }

    return result;
  }
}

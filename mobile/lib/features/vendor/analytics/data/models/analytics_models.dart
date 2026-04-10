// Helper function to safely parse double from String or num
double _parseDouble(dynamic value) {
  if (value == null) return 0.0;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0.0;
  return 0.0;
}

// Helper function to safely parse int from String or num
int _parseInt(dynamic value) {
  if (value == null) return 0;
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value) ?? 0;
  return 0;
}

// Revenue Data Point
class RevenueDataPoint {
  final String name;
  final double revenue;
  final int orders;

  RevenueDataPoint({
    required this.name,
    required this.revenue,
    required this.orders,
  });

  factory RevenueDataPoint.fromJson(Map<String, dynamic> json) {
    return RevenueDataPoint(
      name: json['name'] ?? '',
      revenue: _parseDouble(json['revenue']),
      orders: _parseInt(json['orders']),
    );
  }
}

// Category Data
class CategoryData {
  final String name;
  final double value;
  final String color;

  CategoryData({
    required this.name,
    required this.value,
    required this.color,
  });

  factory CategoryData.fromJson(Map<String, dynamic> json) {
    return CategoryData(
      name: json['name'] ?? '',
      value: _parseDouble(json['value']),
      color: json['color'] ?? '#06B6D4',
    );
  }
}

// Top Product
class TopProduct {
  final String id;
  final String name;
  final int sales;
  final double revenue;
  final double trend;

  TopProduct({
    required this.id,
    required this.name,
    required this.sales,
    required this.revenue,
    required this.trend,
  });

  factory TopProduct.fromJson(Map<String, dynamic> json) {
    return TopProduct(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      sales: _parseInt(json['sales']),
      revenue: _parseDouble(json['revenue']),
      trend: _parseDouble(json['trend']),
    );
  }

  String get formattedRevenue => '\$${revenue.toStringAsFixed(2)}';
}

// Order Status Breakdown
class OrderStatusBreakdown {
  final int pending;
  final int processing;
  final int completed;
  final int cancelled;

  OrderStatusBreakdown({
    required this.pending,
    required this.processing,
    required this.completed,
    required this.cancelled,
  });

  factory OrderStatusBreakdown.fromJson(Map<String, dynamic> json) {
    return OrderStatusBreakdown(
      pending: _parseInt(json['pending']),
      processing: _parseInt(json['processing']),
      completed: _parseInt(json['completed']),
      cancelled: _parseInt(json['cancelled']),
    );
  }

  int get total => pending + processing + completed + cancelled;
}

// Analytics Data Model
class VendorAnalytics {
  final String shopId;
  final String shopName;
  final int totalProducts;
  final int totalOrders;
  final int completedOrders;
  final double totalSales;
  final double averageOrderValue;
  final double rating;
  final int totalReviews;
  final String status;
  final bool isVerified;
  final DateTime createdAt;

  // Revenue
  final double revenueTotal;
  final double revenueChange;
  final List<RevenueDataPoint> revenueData;

  // Orders
  final int ordersTotal;
  final double ordersChange;
  final OrderStatusBreakdown? statusBreakdown;

  // Products
  final int productsTotal;
  final int productsActive;
  final int productsDraft;
  final int productsOutOfStock;

  // Customers
  final int customersTotal;
  final int customersNew;
  final double customersChange;

  // Charts data
  final List<CategoryData> categoryData;
  final List<TopProduct> topProducts;

  // Earnings
  final double grossSales;
  final double deliveryCosts;
  final double netProfit;

  VendorAnalytics({
    required this.shopId,
    required this.shopName,
    required this.totalProducts,
    required this.totalOrders,
    required this.completedOrders,
    required this.totalSales,
    required this.averageOrderValue,
    required this.rating,
    required this.totalReviews,
    required this.status,
    required this.isVerified,
    required this.createdAt,
    required this.revenueTotal,
    this.revenueChange = 0,
    this.revenueData = const [],
    required this.ordersTotal,
    this.ordersChange = 0,
    this.statusBreakdown,
    required this.productsTotal,
    this.productsActive = 0,
    this.productsDraft = 0,
    this.productsOutOfStock = 0,
    required this.customersTotal,
    this.customersNew = 0,
    this.customersChange = 0,
    this.categoryData = const [],
    this.topProducts = const [],
    required this.grossSales,
    this.deliveryCosts = 0,
    required this.netProfit,
  });

  factory VendorAnalytics.fromJson(Map<String, dynamic> json) {
    // Parse revenue data
    List<RevenueDataPoint> revenueDataList = [];
    if (json['revenueData'] != null) {
      revenueDataList = (json['revenueData'] as List)
          .map((item) => RevenueDataPoint.fromJson(item))
          .toList();
    } else if (json['revenue'] != null && json['revenue']['data'] != null) {
      revenueDataList = (json['revenue']['data'] as List)
          .map((item) => RevenueDataPoint.fromJson(item))
          .toList();
    }

    // Parse category data
    List<CategoryData> categoryDataList = [];
    if (json['categoryData'] != null) {
      categoryDataList = (json['categoryData'] as List)
          .map((item) => CategoryData.fromJson(item))
          .toList();
    }

    // Parse top products
    List<TopProduct> topProductsList = [];
    if (json['topProducts'] != null) {
      topProductsList = (json['topProducts'] as List)
          .map((item) => TopProduct.fromJson(item))
          .toList();
    }

    // Parse status breakdown
    OrderStatusBreakdown? statusBreakdown;
    if (json['orders'] != null && json['orders']['statusBreakdown'] != null) {
      statusBreakdown = OrderStatusBreakdown.fromJson(json['orders']['statusBreakdown']);
    }

    // Parse earnings
    final earnings = json['earnings'] ?? {};

    return VendorAnalytics(
      shopId: json['shopId'] ?? json['shop_id'] ?? '',
      shopName: json['shopName'] ?? json['shop_name'] ?? '',
      totalProducts: _parseInt(json['totalProducts'] ?? json['total_products']),
      totalOrders: _parseInt(json['totalOrders'] ?? json['total_orders']),
      completedOrders: _parseInt(json['completedOrders'] ?? json['completed_orders']),
      totalSales: _parseDouble(json['totalSales'] ?? json['total_sales']),
      averageOrderValue: _parseDouble(json['averageOrderValue'] ?? json['average_order_value']),
      rating: _parseDouble(json['rating']),
      totalReviews: _parseInt(json['totalReviews'] ?? json['total_reviews']),
      status: json['status'] ?? 'active',
      isVerified: json['isVerified'] ?? json['is_verified'] ?? false,
      createdAt: DateTime.parse(json['createdAt'] ?? json['created_at'] ?? DateTime.now().toIso8601String()),
      revenueTotal: json['revenue'] != null
          ? _parseDouble(json['revenue']['total'])
          : _parseDouble(json['totalSales'] ?? json['total_sales']),
      revenueChange: json['revenue'] != null ? _parseDouble(json['revenue']['change']) : 0,
      revenueData: revenueDataList,
      ordersTotal: json['orders'] != null
          ? _parseInt(json['orders']['total'])
          : _parseInt(json['totalOrders'] ?? json['total_orders']),
      ordersChange: json['orders'] != null ? _parseDouble(json['orders']['change']) : 0,
      statusBreakdown: statusBreakdown,
      productsTotal: json['products'] != null
          ? _parseInt(json['products']['total'])
          : _parseInt(json['totalProducts'] ?? json['total_products']),
      productsActive: json['products'] != null ? _parseInt(json['products']['active']) : 0,
      productsDraft: json['products'] != null ? _parseInt(json['products']['draft']) : 0,
      productsOutOfStock: json['products'] != null ? _parseInt(json['products']['outOfStock']) : 0,
      customersTotal: json['customers'] != null ? _parseInt(json['customers']['total']) : 0,
      customersNew: json['customers'] != null ? _parseInt(json['customers']['new']) : 0,
      customersChange: json['customers'] != null ? _parseDouble(json['customers']['change']) : 0,
      categoryData: categoryDataList,
      topProducts: topProductsList,
      grossSales: _parseDouble(earnings['grossSales']),
      deliveryCosts: _parseDouble(earnings['deliveryCosts']),
      netProfit: _parseDouble(earnings['netProfit']),
    );
  }

  String get formattedTotalSales => '\$${totalSales.toStringAsFixed(2)}';
  String get formattedAverageOrderValue => '\$${averageOrderValue.toStringAsFixed(2)}';
  String get formattedGrossSales => '\$${grossSales.toStringAsFixed(2)}';
  String get formattedDeliveryCosts => '\$${deliveryCosts.toStringAsFixed(2)}';
  String get formattedNetProfit => '\$${netProfit.toStringAsFixed(2)}';
  String get formattedRating => rating.toStringAsFixed(1);

  double get profitMargin => grossSales > 0 ? (netProfit / grossSales) * 100 : 0;
  String get formattedProfitMargin => '${profitMargin.toStringAsFixed(1)}%';
}

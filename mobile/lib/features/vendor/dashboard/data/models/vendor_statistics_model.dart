class Earnings {
  final double grossSales;
  final double deliveryCosts;
  final double netProfit;

  Earnings({
    required this.grossSales,
    required this.deliveryCosts,
    required this.netProfit,
  });

  factory Earnings.fromJson(Map<String, dynamic> json) {
    return Earnings(
      grossSales: (json['grossSales'] ?? 0).toDouble(),
      deliveryCosts: (json['deliveryCosts'] ?? 0).toDouble(),
      netProfit: (json['netProfit'] ?? 0).toDouble(),
    );
  }

  String get formattedGrossSales => '\$${grossSales.toStringAsFixed(2)}';
  String get formattedDeliveryCosts => '\$${deliveryCosts.toStringAsFixed(2)}';
  String get formattedNetProfit => '\$${netProfit.toStringAsFixed(2)}';
}

class VendorStatistics {
  final Revenue revenue;
  final Orders orders;
  final Products products;
  final Customers customers;
  final Performance? performance;
  final Earnings? earnings;
  final List<RecentOrder>? recentOrders;

  VendorStatistics({
    required this.revenue,
    required this.orders,
    required this.products,
    required this.customers,
    this.performance,
    this.earnings,
    this.recentOrders,
  });

  factory VendorStatistics.fromJson(Map<String, dynamic> json) {
    // Parse earnings from backend - used for earnings breakdown
    final earningsData = json['earnings'] as Map<String, dynamic>?;

    return VendorStatistics(
      revenue: Revenue.fromJson(json['revenue'] ?? {}, earningsData),
      orders: Orders.fromJson(json['orders'] ?? {}),
      products: Products.fromJson(json['products'] ?? {}),
      customers: Customers.fromJson(json['customers'] ?? {}),
      performance: json['performance'] != null
          ? Performance.fromJson(json['performance'])
          : null,
      earnings: earningsData != null ? Earnings.fromJson(earningsData) : null,
      recentOrders: json['recentOrders'] != null
          ? (json['recentOrders'] as List)
              .map((item) => RecentOrder.fromJson(item))
              .toList()
          : null,
    );
  }
}

class RecentOrder {
  final String id;
  final String orderNumber;
  final String customer;
  final double amount;
  final String status;
  final String? time;

  RecentOrder({
    required this.id,
    required this.orderNumber,
    required this.customer,
    required this.amount,
    required this.status,
    this.time,
  });

  factory RecentOrder.fromJson(Map<String, dynamic> json) {
    return RecentOrder(
      id: json['id'] ?? '',
      orderNumber: json['orderNumber'] ?? '',
      customer: json['customer'] ?? 'Customer',
      amount: (json['amount'] ?? 0).toDouble(),
      status: json['status'] ?? 'pending',
      time: json['time'],
    );
  }
}

class Revenue {
  final double total;
  final double? change;
  final double? grossSales;
  final double? deliveryCosts;
  final double? netProfit;
  final double? profitMargin;

  Revenue({
    required this.total,
    this.change,
    this.grossSales,
    this.deliveryCosts,
    this.netProfit,
    this.profitMargin,
  });

  /// Parse revenue data from backend response
  /// The backend returns earnings in a separate 'earnings' field:
  /// { revenue: { total, change }, earnings: { grossSales, deliveryCosts, netProfit } }
  factory Revenue.fromJson(Map<String, dynamic> json, [Map<String, dynamic>? earningsJson]) {
    final earnings = earningsJson ?? {};
    final total = (json['total'] ?? 0).toDouble();

    return Revenue(
      total: total,
      change: json['change']?.toDouble(),
      // Use earnings data from separate field, fallback to revenue field, then total
      grossSales: earnings['grossSales']?.toDouble() ?? json['grossSales']?.toDouble() ?? total,
      deliveryCosts: earnings['deliveryCosts']?.toDouble() ?? json['deliveryCosts']?.toDouble() ?? 0,
      netProfit: earnings['netProfit']?.toDouble() ?? json['netProfit']?.toDouble() ?? total,
      profitMargin: json['profitMargin']?.toDouble(),
    );
  }

  String get formattedTotal => '\$${total.toStringAsFixed(2)}';
  String get formattedGrossSales => '\$${(grossSales ?? 0).toStringAsFixed(2)}';
  String get formattedDeliveryCosts => '\$${(deliveryCosts ?? 0).toStringAsFixed(2)}';
  String get formattedNetProfit => '\$${(netProfit ?? 0).toStringAsFixed(2)}';
  String get formattedProfitMargin => '${((profitMargin ?? 0) * 100).toStringAsFixed(1)}%';
}

class Orders {
  final int total;
  final double? change;
  final int? pending;
  final int? processing;
  final int? shipped;
  final int? delivered;
  final int? cancelled;
  final int? completed;

  Orders({
    required this.total,
    this.change,
    this.pending,
    this.processing,
    this.shipped,
    this.delivered,
    this.cancelled,
    this.completed,
  });

  factory Orders.fromJson(Map<String, dynamic> json) {
    return Orders(
      total: json['total'] ?? 0,
      change: json['change']?.toDouble(),
      pending: json['pending'],
      processing: json['processing'],
      shipped: json['shipped'],
      delivered: json['delivered'],
      cancelled: json['cancelled'],
      completed: json['completed'],
    );
  }
}

class Products {
  final int total;
  final int? active;
  final int? draft;
  final int? outOfStock;
  final List<TopProduct>? topProducts;

  Products({
    required this.total,
    this.active,
    this.draft,
    this.outOfStock,
    this.topProducts,
  });

  factory Products.fromJson(Map<String, dynamic> json) {
    return Products(
      total: json['total'] ?? 0,
      active: json['active'],
      draft: json['draft'],
      outOfStock: json['outOfStock'],
      topProducts: json['topProducts'] != null
          ? (json['topProducts'] as List)
              .map((item) => TopProduct.fromJson(item))
              .toList()
          : null,
    );
  }
}

class TopProduct {
  final String id;
  final String name;
  final int sales;
  final double revenue;
  final double? change;
  final String? image;

  TopProduct({
    required this.id,
    required this.name,
    required this.sales,
    required this.revenue,
    this.change,
    this.image,
  });

  factory TopProduct.fromJson(Map<String, dynamic> json) {
    return TopProduct(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      sales: json['sales'] ?? 0,
      revenue: (json['revenue'] ?? 0).toDouble(),
      change: json['change']?.toDouble(),
      image: json['image'],
    );
  }

  String get formattedRevenue => '\$${revenue.toStringAsFixed(2)}';
}

class Customers {
  final int total;
  final double? change;
  final int? newThisMonth;

  Customers({
    required this.total,
    this.change,
    this.newThisMonth,
  });

  factory Customers.fromJson(Map<String, dynamic> json) {
    return Customers(
      total: json['total'] ?? 0,
      change: json['change']?.toDouble(),
      newThisMonth: json['newThisMonth'],
    );
  }
}

class Performance {
  final double? averageOrderValue;
  final double? conversionRate;
  final int? storeViews;
  final double? rating;

  Performance({
    this.averageOrderValue,
    this.conversionRate,
    this.storeViews,
    this.rating,
  });

  factory Performance.fromJson(Map<String, dynamic> json) {
    return Performance(
      averageOrderValue: json['averageOrderValue']?.toDouble(),
      conversionRate: json['conversionRate']?.toDouble(),
      storeViews: json['storeViews'],
      rating: json['rating']?.toDouble(),
    );
  }

  String get formattedAOV => '\$${(averageOrderValue ?? 0).toStringAsFixed(2)}';
  String get formattedConversion => '${((conversionRate ?? 0) * 100).toStringAsFixed(1)}%';
  String get formattedRating => (rating ?? 0).toStringAsFixed(1);
}

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

/// Offer type enum
enum OfferType {
  percentage,
  fixed,
  freeShipping,
  bogo;

  String get displayName {
    switch (this) {
      case OfferType.percentage:
        return 'Percentage Off';
      case OfferType.fixed:
        return 'Fixed Amount';
      case OfferType.freeShipping:
        return 'Free Shipping';
      case OfferType.bogo:
        return 'Buy One Get One';
    }
  }

  static OfferType fromString(String? value) {
    switch (value?.toLowerCase()) {
      case 'percentage':
        return OfferType.percentage;
      case 'fixed':
        return OfferType.fixed;
      case 'free_shipping':
      case 'freeshipping':
        return OfferType.freeShipping;
      case 'bogo':
        return OfferType.bogo;
      default:
        return OfferType.percentage;
    }
  }

  String toApiString() {
    switch (this) {
      case OfferType.percentage:
        return 'percentage';
      case OfferType.fixed:
        return 'fixed';
      case OfferType.freeShipping:
        return 'free_shipping';
      case OfferType.bogo:
        return 'bogo';
    }
  }
}

/// Offer status enum
enum OfferStatus {
  active,
  scheduled,
  expired,
  disabled;

  String get displayName {
    switch (this) {
      case OfferStatus.active:
        return 'Active';
      case OfferStatus.scheduled:
        return 'Scheduled';
      case OfferStatus.expired:
        return 'Expired';
      case OfferStatus.disabled:
        return 'Disabled';
    }
  }

  static OfferStatus fromString(String? value) {
    switch (value?.toLowerCase()) {
      case 'active':
        return OfferStatus.active;
      case 'scheduled':
        return OfferStatus.scheduled;
      case 'expired':
        return OfferStatus.expired;
      case 'disabled':
      case 'inactive':
        return OfferStatus.disabled;
      default:
        return OfferStatus.active;
    }
  }
}

/// Offer model
class Offer {
  final String id;
  final String name;
  final String code;
  final OfferType type;
  final double discountValue;
  final double minPurchase;
  final DateTime startDate;
  final DateTime endDate;
  final int usageLimit;
  final int usedCount;
  final int perCustomerLimit;
  final OfferStatus status;
  final List<String> products;
  final List<String> categories;

  Offer({
    required this.id,
    required this.name,
    required this.code,
    required this.type,
    required this.discountValue,
    required this.minPurchase,
    required this.startDate,
    required this.endDate,
    required this.usageLimit,
    required this.usedCount,
    required this.perCustomerLimit,
    required this.status,
    required this.products,
    required this.categories,
  });

  factory Offer.fromJson(Map<String, dynamic> json) {
    // Parse products
    List<String> productsList = [];
    if (json['products'] != null) {
      productsList = (json['products'] as List).map((e) => e.toString()).toList();
    } else if (json['applicableProducts'] != null) {
      productsList = (json['applicableProducts'] as List).map((e) => e.toString()).toList();
    } else if (json['specificProducts'] != null) {
      productsList = (json['specificProducts'] as List).map((e) => e.toString()).toList();
    }

    // Parse categories
    List<String> categoriesList = [];
    if (json['categories'] != null) {
      categoriesList = (json['categories'] as List).map((e) => e.toString()).toList();
    } else if (json['applicableCategories'] != null) {
      categoriesList = (json['applicableCategories'] as List).map((e) => e.toString()).toList();
    } else if (json['specificCategories'] != null) {
      categoriesList = (json['specificCategories'] as List).map((e) => e.toString()).toList();
    }

    return Offer(
      id: json['id'] ?? '',
      name: json['name'] ?? json['title'] ?? '',
      code: json['code'] ?? '',
      type: OfferType.fromString(json['type'] ?? json['discountType']),
      discountValue: _parseDouble(json['discountValue'] ?? json['value']),
      minPurchase: _parseDouble(json['minPurchase'] ?? json['minimumPurchase']),
      startDate: DateTime.tryParse(json['startDate'] ?? json['validFrom'] ?? '') ?? DateTime.now(),
      endDate: DateTime.tryParse(json['endDate'] ?? json['validTo'] ?? '') ?? DateTime.now().add(const Duration(days: 30)),
      usageLimit: _parseInt(json['usageLimit'] ?? json['maxUses'] ?? json['totalUsageLimit']),
      usedCount: _parseInt(json['usedCount'] ?? json['uses']),
      perCustomerLimit: _parseInt(json['perCustomerLimit'] ?? json['maxUsesPerCustomer'] ?? json['perUserLimit']) == 0
          ? 1
          : _parseInt(json['perCustomerLimit'] ?? json['maxUsesPerCustomer'] ?? json['perUserLimit']),
      status: OfferStatus.fromString(json['status']),
      products: productsList,
      categories: categoriesList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'code': code.toUpperCase(),
      'name': name,
      'type': type.toApiString(),
      'value': discountValue,
      'minPurchase': minPurchase,
      'validFrom': startDate.toIso8601String(),
      'validTo': endDate.toIso8601String(),
      'totalUsageLimit': usageLimit > 0 ? usageLimit : null,
      'perUserLimit': perCustomerLimit,
      'specificProducts': products,
      'specificCategories': categories,
    };
  }

  Offer copyWith({
    String? id,
    String? name,
    String? code,
    OfferType? type,
    double? discountValue,
    double? minPurchase,
    DateTime? startDate,
    DateTime? endDate,
    int? usageLimit,
    int? usedCount,
    int? perCustomerLimit,
    OfferStatus? status,
    List<String>? products,
    List<String>? categories,
  }) {
    return Offer(
      id: id ?? this.id,
      name: name ?? this.name,
      code: code ?? this.code,
      type: type ?? this.type,
      discountValue: discountValue ?? this.discountValue,
      minPurchase: minPurchase ?? this.minPurchase,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      usageLimit: usageLimit ?? this.usageLimit,
      usedCount: usedCount ?? this.usedCount,
      perCustomerLimit: perCustomerLimit ?? this.perCustomerLimit,
      status: status ?? this.status,
      products: products ?? this.products,
      categories: categories ?? this.categories,
    );
  }

  /// Get remaining uses
  int get remainingUses => usageLimit > 0 ? usageLimit - usedCount : -1; // -1 means unlimited

  /// Get usage percentage
  double get usagePercentage => usageLimit > 0 ? (usedCount / usageLimit) * 100 : 0;

  /// Get formatted discount
  String get formattedDiscount {
    switch (type) {
      case OfferType.percentage:
        return '${discountValue.toStringAsFixed(0)}%';
      case OfferType.fixed:
        return '\$${discountValue.toStringAsFixed(2)}';
      case OfferType.freeShipping:
        return 'FREE';
      case OfferType.bogo:
        return 'BOGO';
    }
  }

  /// Check if offer is currently active
  bool get isCurrentlyActive {
    final now = DateTime.now();
    return status == OfferStatus.active &&
        now.isAfter(startDate) &&
        now.isBefore(endDate);
  }
}

/// Offer statistics
class OfferStatistics {
  final int activeOffers;
  final int totalUsage;
  final double revenueImpact;
  final double conversionRate;

  OfferStatistics({
    required this.activeOffers,
    required this.totalUsage,
    required this.revenueImpact,
    required this.conversionRate,
  });

  factory OfferStatistics.empty() {
    return OfferStatistics(
      activeOffers: 0,
      totalUsage: 0,
      revenueImpact: 0,
      conversionRate: 0,
    );
  }

  factory OfferStatistics.fromOffers(List<Offer> offers) {
    final activeCount = offers.where((o) => o.status == OfferStatus.active).length;
    final totalUsed = offers.fold<int>(0, (sum, o) => sum + o.usedCount);
    final avgDiscount = offers.isNotEmpty
        ? offers.fold<double>(0, (sum, o) => sum + o.discountValue) / offers.length
        : 0;
    final estimatedRevenue = (totalUsed * avgDiscount * 0.5).roundToDouble();

    return OfferStatistics(
      activeOffers: activeCount,
      totalUsage: totalUsed,
      revenueImpact: estimatedRevenue,
      conversionRate: offers.isNotEmpty ? (totalUsed / (offers.length * 100) * 3.8) : 0,
    );
  }
}

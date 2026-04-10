/// Plan tier enum
enum PlanTier {
  free,
  starter,
  pro,
  business;

  String get displayName {
    switch (this) {
      case PlanTier.free:
        return 'Free';
      case PlanTier.starter:
        return 'Starter';
      case PlanTier.pro:
        return 'Pro';
      case PlanTier.business:
        return 'Business';
    }
  }

  static PlanTier fromString(String? value) {
    switch (value?.toLowerCase()) {
      case 'free':
        return PlanTier.free;
      case 'starter':
        return PlanTier.starter;
      case 'pro':
        return PlanTier.pro;
      case 'business':
        return PlanTier.business;
      default:
        return PlanTier.free;
    }
  }

  String toApiString() => name;
}

/// Billing interval enum
enum BillingInterval {
  month,
  year;

  String get displayName {
    switch (this) {
      case BillingInterval.month:
        return 'Monthly';
      case BillingInterval.year:
        return 'Yearly';
    }
  }

  static BillingInterval fromString(String? value) {
    switch (value?.toLowerCase()) {
      case 'month':
      case 'monthly':
        return BillingInterval.month;
      case 'year':
      case 'yearly':
        return BillingInterval.year;
      default:
        return BillingInterval.month;
    }
  }
}

/// Subscription status enum
enum SubscriptionStatus {
  active,
  canceled,
  pastDue,
  trialing;

  String get displayName {
    switch (this) {
      case SubscriptionStatus.active:
        return 'Active';
      case SubscriptionStatus.canceled:
        return 'Canceled';
      case SubscriptionStatus.pastDue:
        return 'Past Due';
      case SubscriptionStatus.trialing:
        return 'Trial';
    }
  }

  static SubscriptionStatus fromString(String? value) {
    switch (value?.toLowerCase()) {
      case 'active':
        return SubscriptionStatus.active;
      case 'canceled':
        return SubscriptionStatus.canceled;
      case 'past_due':
      case 'pastdue':
        return SubscriptionStatus.pastDue;
      case 'trialing':
      case 'trial':
        return SubscriptionStatus.trialing;
      default:
        return SubscriptionStatus.active;
    }
  }
}

/// Invoice status enum
enum InvoiceStatus {
  paid,
  pending,
  failed;

  String get displayName {
    switch (this) {
      case InvoiceStatus.paid:
        return 'Paid';
      case InvoiceStatus.pending:
        return 'Pending';
      case InvoiceStatus.failed:
        return 'Failed';
    }
  }

  static InvoiceStatus fromString(String? value) {
    switch (value?.toLowerCase()) {
      case 'paid':
        return InvoiceStatus.paid;
      case 'pending':
      case 'open':
        return InvoiceStatus.pending;
      case 'failed':
      case 'uncollectible':
        return InvoiceStatus.failed;
      default:
        return InvoiceStatus.pending;
    }
  }
}

/// Plan features model
class PlanFeatures {
  final int stores;
  final int products;
  final int teamMembers;
  final bool customDomain;
  final bool premiumThemes;
  final String analytics;
  final bool mobileApp;
  final bool apiAccess;
  final bool whiteLabel;
  final bool promotions;
  final bool prioritySupport;

  const PlanFeatures({
    required this.stores,
    required this.products,
    required this.teamMembers,
    required this.customDomain,
    required this.premiumThemes,
    required this.analytics,
    required this.mobileApp,
    required this.apiAccess,
    required this.whiteLabel,
    required this.promotions,
    required this.prioritySupport,
  });

  static PlanFeatures forPlan(PlanTier tier) {
    switch (tier) {
      case PlanTier.free:
        return const PlanFeatures(
          stores: 1,
          products: 10,
          teamMembers: 1,
          customDomain: false,
          premiumThemes: false,
          analytics: 'none',
          mobileApp: false,
          apiAccess: false,
          whiteLabel: false,
          promotions: false,
          prioritySupport: false,
        );
      case PlanTier.starter:
        return const PlanFeatures(
          stores: 2,
          products: -1, // Unlimited
          teamMembers: 2,
          customDomain: true,
          premiumThemes: true,
          analytics: 'basic',
          mobileApp: false,
          apiAccess: false,
          whiteLabel: false,
          promotions: false,
          prioritySupport: false,
        );
      case PlanTier.pro:
        return const PlanFeatures(
          stores: 5,
          products: -1, // Unlimited
          teamMembers: 5,
          customDomain: true,
          premiumThemes: true,
          analytics: 'advanced',
          mobileApp: true,
          apiAccess: false,
          whiteLabel: false,
          promotions: true,
          prioritySupport: true,
        );
      case PlanTier.business:
        return const PlanFeatures(
          stores: -1, // Unlimited
          products: -1, // Unlimited
          teamMembers: 15,
          customDomain: true,
          premiumThemes: true,
          analytics: 'full',
          mobileApp: true,
          apiAccess: true,
          whiteLabel: true,
          promotions: true,
          prioritySupport: true,
        );
    }
  }

  String get storesDisplay => stores == -1 ? 'Unlimited' : '$stores';
  String get productsDisplay => products == -1 ? 'Unlimited' : '$products';
  String get teamMembersDisplay => '$teamMembers';
}

/// Subscription model
class Subscription {
  final String id;
  final String? userId;
  final PlanTier plan;
  final BillingInterval interval;
  final SubscriptionStatus status;
  final DateTime? currentPeriodStart;
  final DateTime? currentPeriodEnd;
  final bool cancelAtPeriodEnd;
  final String? stripeCustomerId;
  final String? stripeSubscriptionId;
  final DateTime? trialEnd;
  final DateTime createdAt;
  final DateTime updatedAt;

  Subscription({
    required this.id,
    this.userId,
    required this.plan,
    required this.interval,
    required this.status,
    this.currentPeriodStart,
    this.currentPeriodEnd,
    this.cancelAtPeriodEnd = false,
    this.stripeCustomerId,
    this.stripeSubscriptionId,
    this.trialEnd,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      id: json['id'] ?? '',
      userId: json['userId'],
      plan: PlanTier.fromString(json['plan']),
      interval: BillingInterval.fromString(json['interval']),
      status: SubscriptionStatus.fromString(json['status']),
      currentPeriodStart: json['currentPeriodStart'] != null
          ? DateTime.tryParse(json['currentPeriodStart'])
          : null,
      currentPeriodEnd: json['currentPeriodEnd'] != null
          ? DateTime.tryParse(json['currentPeriodEnd'])
          : null,
      cancelAtPeriodEnd: json['cancelAtPeriodEnd'] ?? false,
      stripeCustomerId: json['stripeCustomerId'],
      stripeSubscriptionId: json['stripeSubscriptionId'],
      trialEnd: json['trialEnd'] != null
          ? DateTime.tryParse(json['trialEnd'])
          : null,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
    );
  }

  factory Subscription.empty() {
    return Subscription(
      id: 'default',
      plan: PlanTier.free,
      interval: BillingInterval.month,
      status: SubscriptionStatus.active,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
  }

  bool get isActive => status == SubscriptionStatus.active;
  bool get isTrial => status == SubscriptionStatus.trialing;
  bool get isCanceled => status == SubscriptionStatus.canceled || cancelAtPeriodEnd;
  bool get isPastDue => status == SubscriptionStatus.pastDue;
  bool get isFree => plan == PlanTier.free;

  PlanFeatures get features => PlanFeatures.forPlan(plan);
}

/// Plan model
class Plan {
  final String id;
  final String name;
  final String description;
  final String? stripePriceId;
  final String? stripePriceIdYearly;
  final int price; // In cents
  final int yearlyPrice; // In cents
  final String currency;
  final List<String> features;
  final bool isPopular;

  Plan({
    required this.id,
    required this.name,
    required this.description,
    this.stripePriceId,
    this.stripePriceIdYearly,
    required this.price,
    required this.yearlyPrice,
    this.currency = 'USD',
    required this.features,
    this.isPopular = false,
  });

  factory Plan.fromJson(Map<String, dynamic> json) {
    return Plan(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      stripePriceId: json['stripePriceId'],
      stripePriceIdYearly: json['stripePriceIdYearly'],
      price: json['price'] ?? 0,
      yearlyPrice: json['yearlyPrice'] ?? 0,
      currency: json['currency'] ?? 'USD',
      features: json['features'] != null
          ? List<String>.from(json['features'])
          : [],
      isPopular: json['isPopular'] ?? false,
    );
  }

  PlanTier get tier => PlanTier.fromString(id);

  String get formattedPrice {
    final amount = price / 100;
    return '\$${amount.toStringAsFixed(amount.truncateToDouble() == amount ? 0 : 2)}';
  }

  String get formattedYearlyPrice {
    final amount = yearlyPrice / 100;
    return '\$${amount.toStringAsFixed(amount.truncateToDouble() == amount ? 0 : 2)}';
  }

  String get formattedMonthlyFromYearly {
    final amount = (yearlyPrice / 12) / 100;
    return '\$${amount.toStringAsFixed(2)}';
  }

  int get yearlySavings => (price * 12) - yearlyPrice;

  String get formattedYearlySavings {
    final amount = yearlySavings / 100;
    return '\$${amount.toStringAsFixed(0)}';
  }

  static List<Plan> getDefaultPlans() {
    return [
      Plan(
        id: 'free',
        name: 'Free',
        description: 'Perfect for getting started',
        price: 0,
        yearlyPrice: 0,
        features: [
          '1 Store',
          '10 Products',
          '1 Team Member',
          'Basic Support',
        ],
      ),
      Plan(
        id: 'starter',
        name: 'Starter',
        description: 'For growing businesses',
        price: 1999, // $19.99
        yearlyPrice: 19990, // $199.90 (2 months free)
        features: [
          '2 Stores',
          'Unlimited Products',
          '2 Team Members',
          'Custom Domain',
          'Premium Themes',
          'Basic Analytics',
        ],
      ),
      Plan(
        id: 'pro',
        name: 'Pro',
        description: 'For established businesses',
        price: 4999, // $49.99
        yearlyPrice: 49990, // $499.90
        features: [
          '5 Stores',
          'Unlimited Products',
          '5 Team Members',
          'Custom Domain',
          'Premium Themes',
          'Advanced Analytics',
          'Mobile App Access',
          'Promotions & Discounts',
          'Priority Support',
        ],
        isPopular: true,
      ),
      Plan(
        id: 'business',
        name: 'Business',
        description: 'For large scale operations',
        price: 9999, // $99.99
        yearlyPrice: 99990, // $999.90
        features: [
          'Unlimited Stores',
          'Unlimited Products',
          '15 Team Members',
          'Custom Domain',
          'Premium Themes',
          'Full Analytics',
          'Mobile App Access',
          'API Access',
          'White Label',
          'Promotions & Discounts',
          'Priority Support',
        ],
      ),
    ];
  }
}

/// Invoice model
class Invoice {
  final String id;
  final DateTime date;
  final int amount; // In cents
  final InvoiceStatus status;
  final String? invoiceUrl;
  final String? receiptUrl;
  final String? description;
  final String currency;

  Invoice({
    required this.id,
    required this.date,
    required this.amount,
    required this.status,
    this.invoiceUrl,
    this.receiptUrl,
    this.description,
    this.currency = 'USD',
  });

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id'] ?? '',
      date: DateTime.tryParse(json['date'] ?? '') ?? DateTime.now(),
      amount: json['amount'] ?? 0,
      status: InvoiceStatus.fromString(json['status']),
      invoiceUrl: json['invoiceUrl'],
      receiptUrl: json['receiptUrl'],
      description: json['description'],
      currency: json['currency'] ?? 'USD',
    );
  }

  String get formattedAmount {
    final amt = amount / 100;
    return '\$${amt.toStringAsFixed(2)}';
  }
}

/// Payment method model
class PaymentMethod {
  final String id;
  final String type;
  final String? brand;
  final String? last4;
  final int? expiryMonth;
  final int? expiryYear;
  final bool isDefault;

  PaymentMethod({
    required this.id,
    required this.type,
    this.brand,
    this.last4,
    this.expiryMonth,
    this.expiryYear,
    this.isDefault = false,
  });

  factory PaymentMethod.fromJson(Map<String, dynamic> json) {
    return PaymentMethod(
      id: json['id'] ?? '',
      type: json['type'] ?? 'card',
      brand: json['brand'],
      last4: json['last4'],
      expiryMonth: json['expiryMonth'],
      expiryYear: json['expiryYear'],
      isDefault: json['isDefault'] ?? false,
    );
  }

  String get displayBrand {
    if (brand == null) return 'Card';
    switch (brand!.toLowerCase()) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'Mastercard';
      case 'amex':
        return 'American Express';
      case 'discover':
        return 'Discover';
      default:
        return brand!;
    }
  }

  String get expiryDisplay {
    if (expiryMonth == null || expiryYear == null) return '';
    return '${expiryMonth.toString().padLeft(2, '0')}/${expiryYear.toString().substring(2)}';
  }
}

/// Usage model
class BillingUsage {
  final PlanTier plan;
  final int storesUsed;
  final int storesLimit;
  final int productsUsed;
  final int productsLimit;

  BillingUsage({
    required this.plan,
    required this.storesUsed,
    required this.storesLimit,
    required this.productsUsed,
    required this.productsLimit,
  });

  factory BillingUsage.fromJson(Map<String, dynamic> json) {
    return BillingUsage(
      plan: PlanTier.fromString(json['plan']),
      storesUsed: json['stores']?['used'] ?? 0,
      storesLimit: json['stores']?['limit'] ?? 1,
      productsUsed: json['products']?['used'] ?? 0,
      productsLimit: json['products']?['limit'] ?? 10,
    );
  }

  factory BillingUsage.empty() {
    return BillingUsage(
      plan: PlanTier.free,
      storesUsed: 0,
      storesLimit: 1,
      productsUsed: 0,
      productsLimit: 10,
    );
  }

  bool get hasUnlimitedStores => storesLimit == -1;
  bool get hasUnlimitedProducts => productsLimit == -1;

  double get storesPercentage =>
      hasUnlimitedStores ? 0 : (storesUsed / storesLimit).clamp(0, 1);
  double get productsPercentage =>
      hasUnlimitedProducts ? 0 : (productsUsed / productsLimit).clamp(0, 1);
}

/// Checkout session response
class CheckoutSession {
  final String sessionId;
  final String url;

  CheckoutSession({
    required this.sessionId,
    required this.url,
  });

  factory CheckoutSession.fromJson(Map<String, dynamic> json) {
    return CheckoutSession(
      sessionId: json['sessionId'] ?? '',
      url: json['url'] ?? '',
    );
  }
}

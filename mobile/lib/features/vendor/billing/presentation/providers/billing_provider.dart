import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/billing_models.dart';
import '../../data/repositories/billing_repository.dart';

/// Billing state
class BillingState {
  final Subscription subscription;
  final List<Plan> plans;
  final List<Invoice> invoices;
  final List<PaymentMethod> paymentMethods;
  final BillingUsage usage;
  final BillingInterval selectedInterval;
  final bool isLoading;
  final String? error;

  BillingState({
    Subscription? subscription,
    this.plans = const [],
    this.invoices = const [],
    this.paymentMethods = const [],
    BillingUsage? usage,
    this.selectedInterval = BillingInterval.month,
    this.isLoading = false,
    this.error,
  })  : subscription = subscription ?? Subscription.empty(),
        usage = usage ?? BillingUsage.empty();

  BillingState copyWith({
    Subscription? subscription,
    List<Plan>? plans,
    List<Invoice>? invoices,
    List<PaymentMethod>? paymentMethods,
    BillingUsage? usage,
    BillingInterval? selectedInterval,
    bool? isLoading,
    String? error,
  }) {
    return BillingState(
      subscription: subscription ?? this.subscription,
      plans: plans ?? this.plans,
      invoices: invoices ?? this.invoices,
      paymentMethods: paymentMethods ?? this.paymentMethods,
      usage: usage ?? this.usage,
      selectedInterval: selectedInterval ?? this.selectedInterval,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  /// Get price for a plan based on selected interval
  String getPriceForPlan(Plan plan) {
    if (selectedInterval == BillingInterval.year) {
      return plan.formattedMonthlyFromYearly;
    }
    return plan.formattedPrice;
  }

  /// Check if a plan is the current plan
  bool isCurrentPlan(Plan plan) {
    return subscription.plan == plan.tier;
  }

  /// Check if user can upgrade to a plan
  bool canUpgradeTo(Plan plan) {
    if (plan.tier == PlanTier.free) return false;
    return subscription.plan.index < plan.tier.index;
  }

  /// Check if user can downgrade to a plan
  bool canDowngradeTo(Plan plan) {
    return subscription.plan.index > plan.tier.index;
  }
}

/// Billing notifier
class BillingNotifier extends StateNotifier<BillingState> {
  final BillingRepository _repository;

  BillingNotifier(this._repository) : super(BillingState());

  /// Load all billing data
  Future<void> loadBilling() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      debugPrint('Loading billing data...');

      // Load all data in parallel
      final results = await Future.wait([
        _repository.getSubscription(),
        _repository.getPlans(),
        _repository.getInvoices(),
        _repository.getPaymentMethods(),
        _repository.getUsage(),
      ]);

      final subscription = results[0] as Subscription;
      final plans = results[1] as List<Plan>;
      final invoices = results[2] as List<Invoice>;
      final paymentMethods = results[3] as List<PaymentMethod>;
      final usage = results[4] as BillingUsage;

      state = BillingState(
        subscription: subscription,
        plans: plans,
        invoices: invoices,
        paymentMethods: paymentMethods,
        usage: usage,
        selectedInterval: subscription.interval,
        isLoading: false,
      );

      debugPrint('Billing loaded: ${subscription.plan.displayName} plan');
    } catch (e) {
      debugPrint('Error loading billing: $e');
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Set billing interval
  void setInterval(BillingInterval interval) {
    state = state.copyWith(selectedInterval: interval);
  }

  /// Create checkout session for plan upgrade
  Future<CheckoutSession?> createCheckout(Plan plan) async {
    try {
      debugPrint('Creating checkout for: ${plan.name}');

      final priceId = state.selectedInterval == BillingInterval.year
          ? plan.stripePriceIdYearly
          : plan.stripePriceId;

      if (priceId == null) {
        debugPrint('No price ID for plan: ${plan.name}');
        return null;
      }

      final session = await _repository.createCheckout(priceId);
      return session;
    } catch (e) {
      debugPrint('Error creating checkout: $e');
      return null;
    }
  }

  /// Cancel subscription
  Future<bool> cancelSubscription({String? reason}) async {
    try {
      debugPrint('Cancelling subscription...');
      final subscription = await _repository.cancelSubscription(reason: reason);

      state = state.copyWith(subscription: subscription);
      return true;
    } catch (e) {
      debugPrint('Error cancelling subscription: $e');
      return false;
    }
  }

  /// Resume subscription
  Future<bool> resumeSubscription() async {
    try {
      debugPrint('Resuming subscription...');
      final subscription = await _repository.resumeSubscription();

      state = state.copyWith(subscription: subscription);
      return true;
    } catch (e) {
      debugPrint('Error resuming subscription: $e');
      return false;
    }
  }

  /// Create setup session for adding payment method
  Future<CheckoutSession?> createSetupSession() async {
    try {
      debugPrint('Creating setup session...');
      final session = await _repository.createSetupSession();
      return session;
    } catch (e) {
      debugPrint('Error creating setup session: $e');
      return null;
    }
  }

  /// Delete payment method
  Future<bool> deletePaymentMethod(String paymentMethodId) async {
    try {
      debugPrint('Deleting payment method: $paymentMethodId');
      await _repository.deletePaymentMethod(paymentMethodId);

      // Update local state
      final updatedMethods = state.paymentMethods
          .where((m) => m.id != paymentMethodId)
          .toList();
      state = state.copyWith(paymentMethods: updatedMethods);

      return true;
    } catch (e) {
      debugPrint('Error deleting payment method: $e');
      return false;
    }
  }

  /// Refresh billing data
  Future<void> refresh() async {
    await loadBilling();
  }
}

/// Provider
final billingProvider = StateNotifierProvider<BillingNotifier, BillingState>(
  (ref) => BillingNotifier(BillingRepository()),
);

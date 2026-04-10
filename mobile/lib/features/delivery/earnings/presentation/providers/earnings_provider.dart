import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../orders/data/models/delivery_order_model.dart';
import '../../../orders/data/repositories/delivery_repository.dart';


/// State for delivery earnings
class EarningsState {
  final DeliveryEarnings? earnings;
  final bool isLoading;
  final String? error;

  EarningsState({
    this.earnings,
    this.isLoading = false,
    this.error,
  });

  EarningsState copyWith({
    DeliveryEarnings? earnings,
    bool? isLoading,
    String? error,
  }) {
    return EarningsState(
      earnings: earnings ?? this.earnings,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Earnings Notifier
class EarningsNotifier extends StateNotifier<EarningsState> {
  final DeliveryRepository _repository;

  EarningsNotifier(this._repository) : super(EarningsState());

  /// Load earnings
  Future<void> loadEarnings() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // Fetch earnings for all periods
      final todayEarnings = await _repository.getEarnings(period: 'today');
      final weekEarnings = await _repository.getEarnings(period: 'week');
      final monthEarnings = await _repository.getEarnings(period: 'month');
      final allTimeEarnings = await _repository.getEarnings(); // No period = all time

      // Combine all data into one earnings object
      final combinedEarnings = DeliveryEarnings(
        totalEarnings: allTimeEarnings.totalEarnings,
        todayEarnings: todayEarnings.todayEarnings,
        weekEarnings: weekEarnings.weekEarnings,
        monthEarnings: monthEarnings.monthEarnings,
        totalDeliveries: allTimeEarnings.totalDeliveries,
        todayDeliveries: todayEarnings.todayDeliveries,
        weekDeliveries: weekEarnings.weekDeliveries,
        monthDeliveries: monthEarnings.monthDeliveries,
        averageRating: allTimeEarnings.averageRating,
        totalRatings: allTimeEarnings.totalRatings,
      );

      state = EarningsState(
        earnings: combinedEarnings,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Refresh earnings
  Future<void> refresh() async {
    await loadEarnings();
  }

  /// Request withdrawal
  Future<void> requestWithdrawal({
    required double amount,
    required String paymentMethod,
    required Map<String, dynamic> paymentDetails,
  }) async {
    try {
      await _repository.requestWithdrawal(
        amount: amount,
        paymentMethod: paymentMethod,
        paymentDetails: paymentDetails,
      );
      // Refresh earnings after withdrawal
      await loadEarnings();
    } catch (e) {
      rethrow;
    }
  }
}

/// Provider for earnings
final earningsProvider =
    StateNotifierProvider<EarningsNotifier, EarningsState>((ref) {
  return EarningsNotifier(DeliveryRepository());
});

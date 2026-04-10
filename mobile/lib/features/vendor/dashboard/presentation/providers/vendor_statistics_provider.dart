import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/vendor_statistics_model.dart';
import '../../data/repositories/vendor_statistics_repository.dart';

// State class
class VendorStatisticsState {
  final VendorStatistics? statistics;
  final bool isLoading;
  final String? error;

  VendorStatisticsState({
    this.statistics,
    this.isLoading = false,
    this.error,
  });

  VendorStatisticsState copyWith({
    VendorStatistics? statistics,
    bool? isLoading,
    String? error,
  }) {
    return VendorStatisticsState(
      statistics: statistics ?? this.statistics,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Notifier class
class VendorStatisticsNotifier extends StateNotifier<VendorStatisticsState> {
  final VendorStatisticsRepository _repository;

  VendorStatisticsNotifier(this._repository) : super(VendorStatisticsState());

  Future<void> loadStatistics({String? timeRange}) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      debugPrint('📊 Loading vendor statistics...');
      final statistics = await _repository.getStatistics(timeRange: timeRange);

      state = VendorStatisticsState(
        statistics: statistics,
        isLoading: false,
      );

      debugPrint('✅ Statistics loaded successfully');
    } catch (e) {
      debugPrint('❌ Error loading statistics: $e');
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> refresh({String? timeRange}) async {
    await loadStatistics(timeRange: timeRange);
  }
}

// Provider
final vendorStatisticsProvider =
    StateNotifierProvider<VendorStatisticsNotifier, VendorStatisticsState>(
  (ref) => VendorStatisticsNotifier(VendorStatisticsRepository()),
);

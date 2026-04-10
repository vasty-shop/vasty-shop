import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/analytics_models.dart';
import '../../data/repositories/analytics_repository.dart';

// Analytics State
class AnalyticsState {
  final VendorAnalytics? analytics;
  final bool isLoading;
  final String? error;
  final String selectedTimeRange;

  AnalyticsState({
    this.analytics,
    this.isLoading = false,
    this.error,
    this.selectedTimeRange = '6m',
  });

  AnalyticsState copyWith({
    VendorAnalytics? analytics,
    bool? isLoading,
    String? error,
    String? selectedTimeRange,
  }) {
    return AnalyticsState(
      analytics: analytics ?? this.analytics,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      selectedTimeRange: selectedTimeRange ?? this.selectedTimeRange,
    );
  }
}

// Analytics Notifier
class AnalyticsNotifier extends StateNotifier<AnalyticsState> {
  final AnalyticsRepository _repository;

  AnalyticsNotifier(this._repository) : super(AnalyticsState());

  /// Load analytics data
  Future<void> loadAnalytics({String? timeRange}) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      debugPrint('📊 Loading analytics...');
      final analytics = await _repository.getAnalytics(
        timeRange: timeRange ?? state.selectedTimeRange,
      );

      state = AnalyticsState(
        analytics: analytics,
        isLoading: false,
        selectedTimeRange: timeRange ?? state.selectedTimeRange,
      );

      debugPrint('✅ Analytics loaded successfully');
    } catch (e) {
      debugPrint('❌ Error loading analytics: $e');
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Change time range
  void setTimeRange(String timeRange) {
    if (timeRange != state.selectedTimeRange) {
      state = state.copyWith(selectedTimeRange: timeRange);
      loadAnalytics(timeRange: timeRange);
    }
  }

  /// Refresh analytics
  Future<void> refresh() async {
    await loadAnalytics();
  }
}

// Provider
final analyticsProvider =
    StateNotifierProvider<AnalyticsNotifier, AnalyticsState>(
  (ref) => AnalyticsNotifier(AnalyticsRepository()),
);

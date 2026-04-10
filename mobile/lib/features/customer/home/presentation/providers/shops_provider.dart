import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../features/auth/data/models/shop_model.dart';
import '../../../../../shared/repositories/shop_repository.dart';
import 'shop_selection_provider.dart';

/// Shops State
class ShopsState {
  final List<ShopModel> shops;
  final bool isLoading;
  final String? error;
  final bool hasMore;
  final int currentPage;

  ShopsState({
    this.shops = const [],
    this.isLoading = false,
    this.error,
    this.hasMore = true,
    this.currentPage = 1,
  });

  ShopsState copyWith({
    List<ShopModel>? shops,
    bool? isLoading,
    String? error,
    bool? hasMore,
    int? currentPage,
  }) {
    return ShopsState(
      shops: shops ?? this.shops,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      hasMore: hasMore ?? this.hasMore,
      currentPage: currentPage ?? this.currentPage,
    );
  }
}

/// Shops Notifier
class ShopsNotifier extends StateNotifier<ShopsState> {
  final ShopRepository _repository;
  final Ref _ref;

  ShopsNotifier(this._repository, this._ref) : super(ShopsState());

  /// Load shops
  Future<void> loadShops({bool refresh = false}) async {
    if (state.isLoading) return;

    if (refresh) {
      state = ShopsState(isLoading: true);
    } else {
      state = state.copyWith(isLoading: true, error: null);
    }

    try {
      final shops = await _repository.getShops(
        page: refresh ? 1 : state.currentPage,
        limit: 20,
        status: 'active', // Only show active shops
      );

      if (refresh) {
        state = ShopsState(
          shops: shops,
          isLoading: false,
          hasMore: shops.length >= 20,
          currentPage: 1,
        );

        // Auto-select first shop if no shop is selected
        final selectedShop = _ref.read(shopSelectionProvider).selectedShop;
        if (selectedShop == null && shops.isNotEmpty) {
          _ref.read(shopSelectionProvider.notifier).selectShop(shops.first);
        }
      } else {
        state = state.copyWith(
          shops: [...state.shops, ...shops],
          isLoading: false,
          hasMore: shops.length >= 20,
          currentPage: state.currentPage + 1,
        );
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Search shops
  Future<void> searchShops(String query) async {
    state = ShopsState(isLoading: true);

    try {
      final shops = await _repository.getShops(
        search: query,
        status: 'active',
        limit: 100,
      );

      state = ShopsState(
        shops: shops,
        isLoading: false,
        hasMore: false,
      );
    } catch (e) {
      state = ShopsState(isLoading: false, error: e.toString());
    }
  }
}

/// Shops Provider
final shopsProvider =
    StateNotifierProvider<ShopsNotifier, ShopsState>((ref) {
  final repository = ShopRepository();
  return ShopsNotifier(repository, ref);
});

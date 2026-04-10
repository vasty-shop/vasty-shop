import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../../features/auth/data/models/shop_model.dart';
import '../../../../../features/auth/presentation/providers/auth_provider.dart' show sharedPreferencesProvider;

/// Shop Selection State
class ShopSelectionState {
  final ShopModel? selectedShop;
  final bool isLoading;
  final String? error;

  ShopSelectionState({
    this.selectedShop,
    this.isLoading = false,
    this.error,
  });

  ShopSelectionState copyWith({
    ShopModel? selectedShop,
    bool? isLoading,
    String? error,
  }) {
    return ShopSelectionState(
      selectedShop: selectedShop ?? this.selectedShop,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Shop Selection Notifier
class ShopSelectionNotifier extends StateNotifier<ShopSelectionState> {
  final SharedPreferences _prefs;
  static const String _selectedShopIdKey = 'selected_shop_id';

  ShopSelectionNotifier(this._prefs) : super(ShopSelectionState()) {
    _loadSelectedShop();
  }

  /// Load selected shop from storage
  Future<void> _loadSelectedShop() async {
    final shopId = _prefs.getString(_selectedShopIdKey);
    if (shopId != null) {
      // Shop will be loaded when shops list is fetched
      // This just indicates that user had a selection
    }
  }

  /// Select a shop
  Future<void> selectShop(ShopModel shop) async {
    state = state.copyWith(selectedShop: shop, error: null);
    await _prefs.setString(_selectedShopIdKey, shop.id);
  }

  /// Clear shop selection
  Future<void> clearSelection() async {
    state = ShopSelectionState();
    await _prefs.remove(_selectedShopIdKey);
  }

  /// Get selected shop ID from storage
  String? getStoredShopId() {
    return _prefs.getString(_selectedShopIdKey);
  }
}

/// Shop Selection Provider
final shopSelectionProvider =
    StateNotifierProvider<ShopSelectionNotifier, ShopSelectionState>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return ShopSelectionNotifier(prefs);
});

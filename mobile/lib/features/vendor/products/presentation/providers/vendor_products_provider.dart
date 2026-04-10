import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../shared/models/product_model.dart';
import '../../../../../shared/repositories/product_repository.dart';
import '../../../../auth/presentation/providers/auth_provider.dart';


import 'package:easy_localization/easy_localization.dart';// Vendor Products State
class VendorProductsState {
  final List<ProductModel> products;
  final List<ProductModel> allProducts; // All products for client-side filtering
  final bool isLoading;
  final String? error;
  final bool hasMore;
  final int currentPage;
  final String searchQuery;
  final String statusFilter; // 'all', 'active', 'draft', 'out_of_stock'
  final String stockFilter; // 'all', 'in_stock', 'low_stock', 'out_of_stock'

  VendorProductsState({
    this.products = const [],
    this.allProducts = const [],
    this.isLoading = false,
    this.error,
    this.hasMore = true,
    this.currentPage = 1,
    this.searchQuery = '',
    this.statusFilter = 'all',
    this.stockFilter = 'all',
  });

  VendorProductsState copyWith({
    List<ProductModel>? products,
    List<ProductModel>? allProducts,
    bool? isLoading,
    String? error,
    bool? hasMore,
    int? currentPage,
    String? searchQuery,
    String? statusFilter,
    String? stockFilter,
  }) {
    return VendorProductsState(
      products: products ?? this.products,
      allProducts: allProducts ?? this.allProducts,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      hasMore: hasMore ?? this.hasMore,
      currentPage: currentPage ?? this.currentPage,
      searchQuery: searchQuery ?? this.searchQuery,
      statusFilter: statusFilter ?? this.statusFilter,
      stockFilter: stockFilter ?? this.stockFilter,
    );
  }

  bool get hasActiveFilters => statusFilter != 'all' || stockFilter != 'all';
}

// Vendor Products Notifier
class VendorProductsNotifier extends StateNotifier<VendorProductsState> {
  final ProductRepository _repository;
  final Ref _ref;

  VendorProductsNotifier(this._repository, this._ref)
      : super(VendorProductsState());

  Future<void> loadVendorProducts({bool refresh = false}) async {
    if (state.isLoading) return;

    // Get shop ID from auth state
    final authState = _ref.read(authProvider);
    final shopId = authState.user?.metadata?['shopId'] as String?;

    if (shopId == null) {
      state = state.copyWith(
        isLoading: false,
        error: 'Shop not found. Please login again.',
      );
      return;
    }

    if (refresh) {
      state = VendorProductsState(isLoading: true);
    } else {
      state = state.copyWith(isLoading: true, error: null);
    }

    try {
      final products = await _repository.getVendorProducts(
        shopId: shopId,
        page: refresh ? 1 : state.currentPage,
        limit: 100,
      );

      if (refresh) {
        state = VendorProductsState(
          products: products,
          allProducts: products, // Store all products for filtering
          isLoading: false,
          hasMore: products.length >= 100,
          currentPage: 1,
        );
      } else {
        final allProducts = [...state.allProducts, ...products];
        state = state.copyWith(
          products: allProducts,
          allProducts: allProducts,
          isLoading: false,
          hasMore: products.length >= 100,
          currentPage: state.currentPage + 1,
        );
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Search products using client-side filtering
  void searchVendorProducts(String query) {
    final searchQuery = query.toLowerCase().trim();
    state = state.copyWith(searchQuery: searchQuery);
    _applyFilters();
  }

  /// Clear search and show all products
  void clearSearch() {
    state = state.copyWith(
      searchQuery: '',
    );
    _applyFilters();
  }

  /// Apply filters (status and stock)
  void applyFilters({String? status, String? stock}) {
    state = state.copyWith(
      statusFilter: status ?? state.statusFilter,
      stockFilter: stock ?? state.stockFilter,
    );
    _applyFilters();
  }

  /// Clear all filters
  void clearFilters() {
    state = state.copyWith(
      statusFilter: 'all',
      stockFilter: 'all',
      searchQuery: '',
    );
    _applyFilters();
  }

  /// Internal method to apply all filters
  void _applyFilters() {
    var filtered = state.allProducts.toList();

    // Apply search filter
    if (state.searchQuery.isNotEmpty) {
      final query = state.searchQuery.toLowerCase();
      filtered = filtered.where((product) {
        final name = product.name.toLowerCase();
        final brand = product.brand.toLowerCase();
        final description = (product.description ?? '').toLowerCase();
        return name.contains(query) ||
               brand.contains(query) ||
               description.contains(query);
      }).toList();
    }

    // Apply status filter
    if (state.statusFilter != 'all') {
      filtered = filtered.where((product) {
        final status = product.status?.toLowerCase() ?? '';
        switch (state.statusFilter) {
          case 'active':
            return status == 'active' || status == 'published';
          case 'draft':
            return status == 'draft';
          case 'out_of_stock':
            return !product.isInStock;
          default:
            return true;
        }
      }).toList();
    }

    // Apply stock filter
    if (state.stockFilter != 'all') {
      filtered = filtered.where((product) {
        final stock = product.stock ?? 0;
        switch (state.stockFilter) {
          case 'in_stock':
            return stock > 10;
          case 'low_stock':
            return stock > 0 && stock <= 10;
          case 'out_of_stock':
            return stock == 0;
          default:
            return true;
        }
      }).toList();
    }

    state = state.copyWith(products: filtered);
  }

  Future<void> filterByStatus(String status) async {
    final authState = _ref.read(authProvider);
    final shopId = authState.user?.metadata?['shopId'] as String?;

    if (shopId == null) {
      state = state.copyWith(
        isLoading: false,
        error: 'Shop not found. Please login again.',
      );
      return;
    }

    state = VendorProductsState(isLoading: true);

    try {
      final products = await _repository.getVendorProducts(
        shopId: shopId,
        status: status,
        limit: 100,
      );

      state = VendorProductsState(
        products: products,
        isLoading: false,
        hasMore: false,
      );
    } catch (e) {
      state = VendorProductsState(isLoading: false, error: e.toString());
    }
  }
}

// Vendor Products Provider
final vendorProductsProvider =
    StateNotifierProvider<VendorProductsNotifier, VendorProductsState>((ref) {
  final repository = ProductRepository();
  return VendorProductsNotifier(repository, ref);
});

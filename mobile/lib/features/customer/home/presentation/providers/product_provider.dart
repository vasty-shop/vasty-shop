import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_constants.dart';
import '../../../../../shared/models/product_model.dart';
import '../../../../../shared/repositories/product_repository.dart';

// Product Repository Provider
final productRepositoryProvider = Provider<ProductRepository>((ref) {
  return ProductRepository();
});

// Filter State
class ProductFilterState {
  final double? minPrice;
  final double? maxPrice;
  final String sortBy;
  final String? search;
  final String? category;

  const ProductFilterState({
    this.minPrice,
    this.maxPrice,
    this.sortBy = 'relevance',
    this.search,
    this.category,
  });

  ProductFilterState copyWith({
    double? minPrice,
    double? maxPrice,
    String? sortBy,
    String? search,
    String? category,
    bool clearMinPrice = false,
    bool clearMaxPrice = false,
    bool clearSearch = false,
    bool clearCategory = false,
  }) {
    return ProductFilterState(
      minPrice: clearMinPrice ? null : (minPrice ?? this.minPrice),
      maxPrice: clearMaxPrice ? null : (maxPrice ?? this.maxPrice),
      sortBy: sortBy ?? this.sortBy,
      search: clearSearch ? null : (search ?? this.search),
      category: clearCategory ? null : (category ?? this.category),
    );
  }

  bool get hasActiveFilters =>
      minPrice != null || maxPrice != null || sortBy != 'relevance';
}

// Products State
class ProductsState {
  final List<ProductModel> products;
  final bool isLoading;
  final String? error;
  final bool hasMore;
  final int currentPage;
  final ProductFilterState filters;

  ProductsState({
    this.products = const [],
    this.isLoading = false,
    this.error,
    this.hasMore = true,
    this.currentPage = 1,
    this.filters = const ProductFilterState(),
  });

  ProductsState copyWith({
    List<ProductModel>? products,
    bool? isLoading,
    String? error,
    bool? hasMore,
    int? currentPage,
    ProductFilterState? filters,
  }) {
    return ProductsState(
      products: products ?? this.products,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      hasMore: hasMore ?? this.hasMore,
      currentPage: currentPage ?? this.currentPage,
      filters: filters ?? this.filters,
    );
  }
}

// Products Notifier
class ProductsNotifier extends StateNotifier<ProductsState> {
  final ProductRepository _repository;

  ProductsNotifier(this._repository) : super(ProductsState());

  Future<void> loadProducts({bool refresh = false}) async {
    if (state.isLoading) return;

    final filters = refresh ? const ProductFilterState() : state.filters;

    if (refresh) {
      state = ProductsState(isLoading: true, filters: filters);
    } else {
      state = state.copyWith(isLoading: true, error: null);
    }

    try {
      final products = await _repository.getProducts(
        page: refresh ? 1 : state.currentPage,
        limit: 20,
        shopId: AppConstants.shopId,
        search: filters.search,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy != 'relevance' ? filters.sortBy : null,
      );

      if (refresh) {
        state = ProductsState(
          products: products,
          isLoading: false,
          hasMore: products.length >= 20,
          currentPage: 1,
          filters: filters,
        );
      } else {
        state = state.copyWith(
          products: [...state.products, ...products],
          isLoading: false,
          hasMore: products.length >= 20,
          currentPage: state.currentPage + 1,
        );
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> searchProducts(String query) async {
    final newFilters = state.filters.copyWith(search: query, clearCategory: true);
    state = ProductsState(isLoading: true, filters: newFilters);

    try {
      var products = await _repository.getProducts(
        search: query,
        shopId: AppConstants.shopId,
        minPrice: newFilters.minPrice,
        maxPrice: newFilters.maxPrice,
        sortBy: newFilters.sortBy != 'relevance' ? newFilters.sortBy : null,
      );

      // Client-side filtering as backup
      products = _applyClientSideFilters(products, newFilters);

      state = ProductsState(
        products: products,
        isLoading: false,
        hasMore: false,
        filters: newFilters,
      );
    } catch (e) {
      state = ProductsState(isLoading: false, error: e.toString(), filters: newFilters);
    }
  }

  Future<void> loadProductsByCategory(String category) async {
    final newFilters = state.filters.copyWith(category: category, clearSearch: true);
    state = ProductsState(isLoading: true, filters: newFilters);

    try {
      var products = await _repository.getProducts(
        category: category,
        shopId: AppConstants.shopId,
        minPrice: newFilters.minPrice,
        maxPrice: newFilters.maxPrice,
        sortBy: newFilters.sortBy != 'relevance' ? newFilters.sortBy : null,
      );

      // Client-side filtering as backup
      products = _applyClientSideFilters(products, newFilters);

      state = ProductsState(
        products: products,
        isLoading: false,
        hasMore: products.length >= 20,
        filters: newFilters,
      );
    } catch (e) {
      state = ProductsState(isLoading: false, error: e.toString(), filters: newFilters);
    }
  }

  Future<void> applyFilters({
    double? minPrice,
    double? maxPrice,
    String? sortBy,
  }) async {
    final newFilters = state.filters.copyWith(
      minPrice: minPrice,
      maxPrice: maxPrice,
      sortBy: sortBy,
      clearMinPrice: minPrice == null && state.filters.minPrice != null,
      clearMaxPrice: maxPrice == null && state.filters.maxPrice != null,
    );

    state = ProductsState(isLoading: true, filters: newFilters);

    try {
      var products = await _repository.getProducts(
        shopId: AppConstants.shopId,
        search: newFilters.search,
        category: newFilters.category,
        minPrice: newFilters.minPrice,
        maxPrice: newFilters.maxPrice,
        sortBy: newFilters.sortBy != 'relevance' ? newFilters.sortBy : null,
      );

      // Client-side filtering as backup (in case backend doesn't support it)
      products = _applyClientSideFilters(products, newFilters);

      state = ProductsState(
        products: products,
        isLoading: false,
        hasMore: products.length >= 20,
        filters: newFilters,
      );
    } catch (e) {
      state = ProductsState(isLoading: false, error: e.toString(), filters: newFilters);
    }
  }

  /// Apply client-side filtering and sorting as backup
  List<ProductModel> _applyClientSideFilters(
    List<ProductModel> products,
    ProductFilterState filters,
  ) {
    var filtered = products.toList();

    // Client-side price filter
    if (filters.minPrice != null || filters.maxPrice != null) {
      filtered = filtered.where((p) {
        final price = p.salePrice ?? p.price;
        if (filters.minPrice != null && price < filters.minPrice!) return false;
        if (filters.maxPrice != null && price > filters.maxPrice!) return false;
        return true;
      }).toList();
    }

    // Client-side sorting
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) {
          final priceA = a.salePrice ?? a.price;
          final priceB = b.salePrice ?? b.price;
          return priceA.compareTo(priceB);
        });
        break;
      case 'price_high':
        filtered.sort((a, b) {
          final priceA = a.salePrice ?? a.price;
          final priceB = b.salePrice ?? b.price;
          return priceB.compareTo(priceA);
        });
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating.compareTo(a.rating));
        break;
      case 'newest':
        filtered.sort((a, b) {
          final dateA = DateTime.tryParse(a.createdAt ?? '') ?? DateTime(1970);
          final dateB = DateTime.tryParse(b.createdAt ?? '') ?? DateTime(1970);
          return dateB.compareTo(dateA);
        });
        break;
    }

    return filtered;
  }

  void clearFilters() {
    loadProducts(refresh: true);
  }

  void clearSearch() {
    if (state.filters.search != null) {
      final newFilters = state.filters.copyWith(clearSearch: true);
      state = state.copyWith(filters: newFilters);
      loadProducts(refresh: true);
    }
  }
}

// Products Provider
final productsProvider =
    StateNotifierProvider<ProductsNotifier, ProductsState>((ref) {
  return ProductsNotifier(ref.watch(productRepositoryProvider));
});

// Featured Products Provider
final featuredProductsProvider = FutureProvider<List<ProductModel>>((ref) async {
  final repository = ref.watch(productRepositoryProvider);
  return repository.getFeaturedProducts(shopId: AppConstants.shopId);
});

// New Products Provider
final newProductsProvider = FutureProvider<List<ProductModel>>((ref) async {
  final repository = ref.watch(productRepositoryProvider);
  return repository.getNewProducts(shopId: AppConstants.shopId);
});

// Product Detail Provider
final productDetailProvider =
    FutureProvider.family<ProductModel, String>((ref, productId) async {
  final repository = ref.watch(productRepositoryProvider);
  return repository.getProductById(productId);
});

// Categories Provider
final categoriesProvider = FutureProvider<List<CategoryModel>>((ref) async {
  final repository = ref.watch(productRepositoryProvider);
  return repository.getCategories();
});

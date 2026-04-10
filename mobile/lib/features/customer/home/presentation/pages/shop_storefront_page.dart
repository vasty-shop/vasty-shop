import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:badges/badges.dart' as badges;
import '../../../../../features/auth/data/models/shop_model.dart';
import '../../../../../shared/widgets/product_card.dart';
import '../../../../../shared/models/product_model.dart';
import '../../../../../shared/repositories/product_repository.dart';
import '../../../cart/presentation/providers/cart_provider.dart';
import '../../../cart/presentation/pages/cart_page.dart';
import '../../../products/presentation/pages/product_detail_page.dart';


import 'package:easy_localization/easy_localization.dart';class ShopStorefrontPage extends ConsumerStatefulWidget {
  final ShopModel shop;

  const ShopStorefrontPage({
    super.key,
    required this.shop,
  });

  @override
  ConsumerState<ShopStorefrontPage> createState() => _ShopStorefrontPageState();
}

class _ShopStorefrontPageState extends ConsumerState<ShopStorefrontPage> {
  final _searchController = TextEditingController();
  List<ProductModel> _products = [];
  bool _isLoading = false;
  String? _error;
  int _currentPage = 1;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    debugPrint('🏪 Shop Storefront Page opened for: ${widget.shop.name} (ID: ${widget.shop.id})');
    // Load products with refresh flag to ensure it starts loading
    _loadProducts(refresh: true);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadProducts({bool refresh = false}) async {
    if (_isLoading && !refresh) return;

    setState(() {
      if (refresh) {
        _isLoading = true;
        _currentPage = 1;
        _products = [];
      } else {
        _isLoading = true;
      }
      _error = null;
    });

    try {
      final repository = ProductRepository();

      // Debug: Log API call
      debugPrint('🔍 Loading products for shop: ${widget.shop.id} (${widget.shop.name})');
      debugPrint('📄 Page: $_currentPage, Limit: 20');

      final products = await repository.getProducts(
        page: _currentPage,
        limit: 20,
        shopId: widget.shop.id,
      );

      // Debug: Log response
      debugPrint('✅ Received ${products.length} products');
      if (products.isNotEmpty) {
        debugPrint('📦 First product: ${products.first.name}');
      }

      setState(() {
        if (refresh) {
          _products = products;
        } else {
          _products.addAll(products);
        }
        _isLoading = false;
        _hasMore = products.length >= 20;
        if (products.isNotEmpty) {
          _currentPage++;
        }
      });
    } catch (e) {
      // Debug: Log error
      debugPrint('❌ Error loading products: $e');

      setState(() {
        _isLoading = false;
        _error = e.toString();
      });
    }
  }

  Future<void> _searchProducts(String query) async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final repository = ProductRepository();
      final products = await repository.getProducts(
        search: query,
        shopId: widget.shop.id,
      );

      setState(() {
        _products = products;
        _isLoading = false;
        _hasMore = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: CustomScrollView(
        slivers: [
          // Shop Header
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: theme.colorScheme.primary,
            flexibleSpace: FlexibleSpaceBar(
              background: _buildShopHeader(theme),
            ),
            actions: [
              // Cart Icon
              badges.Badge(
                badgeContent: Consumer(
                  builder: (context, ref, child) {
                    final itemCount = ref.watch(cartItemCountProvider);
                    return Text(
                      '$itemCount',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    );
                  },
                ),
                showBadge: ref.watch(cartItemCountProvider) > 0,
                badgeStyle: badges.BadgeStyle(
                  badgeColor: theme.colorScheme.error,
                ),
                child: IconButton(
                  icon: const Icon(Icons.shopping_cart_outlined),
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const CartPage()),
                    );
                  },
                ),
              ),
            ],
          ),

          // Search Bar
          SliverToBoxAdapter(
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search products in this shop...',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            _searchController.clear();
                            _loadProducts(refresh: true);
                          },
                        )
                      : null,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: Colors.grey.shade50,
                ),
                onSubmitted: (value) {
                  if (value.isNotEmpty) {
                    _searchProducts(value);
                  } else {
                    _loadProducts(refresh: true);
                  }
                },
                onChanged: (value) {
                  setState(() {});
                },
              ),
            ),
          ),

          // Products Grid
          _buildProductsGrid(theme),
        ],
      ),
    );
  }

  Widget _buildShopHeader(ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            theme.colorScheme.primary,
            theme.colorScheme.primary.withValues(alpha: 0.8),
          ],
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  // Shop Logo
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.2),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: widget.shop.logo != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: CachedNetworkImage(
                              imageUrl: widget.shop.logo!,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => const Center(
                                child: CircularProgressIndicator(strokeWidth: 2),
                              ),
                              errorWidget: (context, url, error) => Icon(
                                Icons.store,
                                size: 40,
                                color: Colors.grey.shade400,
                              ),
                            ),
                          )
                        : Icon(
                            Icons.store,
                            size: 40,
                            color: Colors.grey.shade400,
                          ),
                  ),
                  const SizedBox(width: 16),

                  // Shop Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                widget.shop.name,
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (widget.shop.isVerified == true)
                              Container(
                                margin: const EdgeInsets.only(left: 8),
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  Icons.verified,
                                  size: 20,
                                  color: theme.colorScheme.primary,
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '@${widget.shop.slug}',
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProductsGrid(ThemeData theme) {
    if (_products.isEmpty && _isLoading) {
      return const SliverFillRemaining(
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (_products.isEmpty && _error != null) {
      return SliverFillRemaining(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 64, color: Colors.red),
                const SizedBox(height: 16),
                const Text(
                  'Error loading products',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _error!,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey.shade600),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => _loadProducts(refresh: true),
                  child: Text('common.retry'.tr()),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (_products.isEmpty) {
      return SliverFillRemaining(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.inventory_outlined,
                  size: 100,
                  color: Colors.grey.shade300,
                ),
                const SizedBox(height: 24),
                const Text(
                  'No products available',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'This shop has no products yet',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey.shade600,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.all(16),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.65,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            if (index >= _products.length) {
              // Load more indicator
              if (_hasMore && !_isLoading) {
                _loadProducts();
              }
              return _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : const SizedBox.shrink();
            }

            final product = _products[index];
            return ProductCard(
              product: product,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => ProductDetailPage(
                      productId: product.id,
                    ),
                  ),
                );
              },
              onAddToCart: () async {
                await ref.read(cartProvider.notifier).addToCart(
                      productId: product.id,
                      quantity: 1,
                    );
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Added to cart!'),
                      backgroundColor: Colors.green,
                      duration: Duration(seconds: 1),
                    ),
                  );
                }
              },
            );
          },
          childCount: _products.length + (_hasMore ? 1 : 0),
        ),
      ),
    );
  }
}

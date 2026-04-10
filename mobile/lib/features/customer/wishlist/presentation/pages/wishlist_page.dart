import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/wishlist_provider.dart';
import '../../../cart/presentation/providers/cart_provider.dart';
import '../../../products/presentation/pages/product_detail_page.dart';
import '../../../../../features/auth/presentation/providers/auth_provider.dart';
import '../../../../../core/routing/app_router.dart';


import 'package:easy_localization/easy_localization.dart';class WishlistPage extends ConsumerStatefulWidget {
  final bool showAppBar;

  const WishlistPage({super.key, this.showAppBar = true});

  @override
  ConsumerState<WishlistPage> createState() => _WishlistPageState();
}

class _WishlistPageState extends ConsumerState<WishlistPage> {
  final Set<String> _selectedItems = {};
  bool _isSelectionMode = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final wishlistState = ref.watch(wishlistProvider);
    final wishlistNotifier = ref.read(wishlistProvider.notifier);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: widget.showAppBar
          ? AppBar(
              backgroundColor: Colors.white,
              elevation: 0,
              title: Text(
                _isSelectionMode
                    ? '${'common.selected'.tr()}: ${_selectedItems.length}'
                    : '${'wishlist.myWishlist'.tr()} (${wishlistState.totalItems})',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              actions: [
                if (!_isSelectionMode && wishlistState.items.isNotEmpty)
                  IconButton(
                    icon: const Icon(Icons.checklist),
                    tooltip: 'common.select'.tr(),
                    onPressed: () => setState(() => _isSelectionMode = true),
                  )
                else if (_isSelectionMode) ...[
                  TextButton(
                    onPressed: () {
                      setState(() {
                        _selectedItems.clear();
                        _isSelectionMode = false;
                      });
                    },
                    child: Text('common.cancel'.tr()),
                  ),
                ],
                if (wishlistState.items.isNotEmpty && !_isSelectionMode)
                  PopupMenuButton<String>(
                    onSelected: (value) {
                      if (value == 'clear') {
                        _showClearConfirmation(wishlistNotifier);
                      }
                    },
                    itemBuilder: (context) => [
                      PopupMenuItem(
                        value: 'clear',
                        child: Row(
                          children: [
                            const Icon(Icons.delete_sweep, color: Colors.red),
                            const SizedBox(width: 12),
                            Text('wishlist.removeAll'.tr()),
                          ],
                        ),
                      ),
                    ],
                  ),
              ],
            )
          : null,
      body: wishlistState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : wishlistState.items.isEmpty
              ? _buildEmptyState(theme)
              : _buildWishlistContent(theme, wishlistState, wishlistNotifier),
      bottomNavigationBar: _isSelectionMode && _selectedItems.isNotEmpty
          ? _buildSelectionActions(theme, wishlistNotifier)
          : null,
    );
  }

  Widget _buildEmptyState(ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.favorite_border,
              size: 100,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 24),
            Text(
              'wishlist.emptyWishlist'.tr(),
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade700,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'wishlist.addProducts'.tr(),
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () {
                // Navigate back to home page for shopping
                if (Navigator.canPop(context)) {
                  Navigator.pop(context);
                } else {
                  // If can't pop, navigate to customer home
                  AppRouter.navigateToCustomerHome(context);
                }
              },
              icon: const Icon(Icons.shopping_bag),
              label: Text('orders.noOrdersMessage'.tr()),
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.colorScheme.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWishlistContent(
    ThemeData theme,
    WishlistState wishlistState,
    WishlistNotifier wishlistNotifier,
  ) {
    return RefreshIndicator(
      onRefresh: () => wishlistNotifier.loadWishlist(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: wishlistState.items.length,
        itemBuilder: (context, index) {
          final item = wishlistState.items[index];
          final product = item.product;
          final isSelected = _selectedItems.contains(product.id);
          final hasPriceDrop =
              (product.salePrice ?? product.price) < item.priceAtAdd;

          return Card(
            elevation: 0,
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(
                color: isSelected
                    ? theme.colorScheme.primary
                    : Colors.grey.shade200,
                width: isSelected ? 2 : 1,
              ),
            ),
            child: InkWell(
              onTap: () {
                if (_isSelectionMode) {
                  setState(() {
                    if (isSelected) {
                      _selectedItems.remove(product.id);
                    } else {
                      _selectedItems.add(product.id);
                    }
                  });
                } else {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => ProductDetailPage(productId: product.id),
                    ),
                  );
                }
              },
              onLongPress: () {
                if (!_isSelectionMode) {
                  setState(() {
                    _isSelectionMode = true;
                    _selectedItems.add(product.id);
                  });
                }
              },
              borderRadius: BorderRadius.circular(16),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Selection checkbox
                    if (_isSelectionMode)
                      Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: Checkbox(
                          value: isSelected,
                          onChanged: (value) {
                            setState(() {
                              if (value == true) {
                                _selectedItems.add(product.id);
                              } else {
                                _selectedItems.remove(product.id);
                              }
                            });
                          },
                          activeColor: theme.colorScheme.primary,
                        ),
                      ),

                    // Product Image
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: CachedNetworkImage(
                        imageUrl: product.images.isNotEmpty
                            ? product.images.first
                            : '',
                        width: 100,
                        height: 100,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: Colors.grey.shade200,
                          child: const Center(
                            child: CircularProgressIndicator(),
                          ),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: Colors.grey.shade200,
                          child: const Icon(Icons.image, size: 40),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Product Details
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Product Name
                          Text(
                            product.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 8),

                          // Price
                          Row(
                            children: [
                              if (product.salePrice != null) ...[
                                Text(
                                  '\$${product.salePrice!.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: theme.colorScheme.primary,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  '\$${product.price.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    fontSize: 14,
                                    decoration: TextDecoration.lineThrough,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              ] else
                                Text(
                                  '\$${product.price.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: theme.colorScheme.primary,
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 8),

                          // Price Drop Badge
                          if (hasPriceDrop)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.green.shade100,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.trending_down,
                                    size: 14,
                                    color: Colors.green.shade700,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    'wishlist.priceDropped'.tr(),
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.green.shade700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          const SizedBox(height: 8),

                          // Actions
                          Row(
                            children: [
                              // Add to Cart
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: () => _addToCart(product),
                                  icon: const Icon(Icons.shopping_cart, size: 16),
                                  label: Text('common.addToCart'.tr()),
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 8,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),

                              // Remove
                              IconButton(
                                onPressed: () =>
                                    _removeItem(product.id, wishlistNotifier),
                                icon: const Icon(Icons.delete_outline),
                                color: Colors.red,
                                tooltip: 'cart.remove'.tr(),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSelectionActions(ThemeData theme, WishlistNotifier wishlistNotifier) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.shade300,
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => _removeSelected(wishlistNotifier),
                icon: const Icon(Icons.delete_outline, color: Colors.red),
                label: Text(
                  'common.delete'.tr(),
                  style: const TextStyle(color: Colors.red),
                ),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  side: const BorderSide(color: Colors.red),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () => _addSelectedToCart(),
                icon: const Icon(Icons.shopping_cart),
                label: Text('common.addToCart'.tr()),
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.colorScheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _addToCart(dynamic product) async {
    try {
      final success = await ref.read(cartProvider.notifier).addToCart(
        productId: product.id,
        quantity: 1,
      );
      if (mounted && success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('products.addedToCart'.tr()),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${'errors.somethingWentWrong'.tr()}: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _removeItem(String productId, WishlistNotifier wishlistNotifier) async {
    try {
      await wishlistNotifier.removeItem(productId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('products.removedFromWishlist'.tr()),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${'errors.somethingWentWrong'.tr()}: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _removeSelected(WishlistNotifier wishlistNotifier) async {
    try {
      for (final productId in _selectedItems) {
        await wishlistNotifier.removeItem(productId);
      }
      if (mounted) {
        setState(() {
          _selectedItems.clear();
          _isSelectionMode = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('products.removedFromWishlist'.tr()),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${'errors.somethingWentWrong'.tr()}: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _addSelectedToCart() async {
    final wishlistState = ref.read(wishlistProvider);
    final selectedProducts = wishlistState.items
        .where((item) => _selectedItems.contains(item.product.id))
        .map((item) => item.product)
        .toList();

    try {
      for (final product in selectedProducts) {
        await ref.read(cartProvider.notifier).addToCart(
          productId: product.id,
          quantity: 1,
        );
      }

      if (mounted) {
        setState(() {
          _selectedItems.clear();
          _isSelectionMode = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('products.addedToCart'.tr()),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${'errors.somethingWentWrong'.tr()}: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _showClearConfirmation(WishlistNotifier wishlistNotifier) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('wishlist.removeAll'.tr()),
        content: Text('cart.clearAll'.tr()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('common.cancel'.tr()),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await wishlistNotifier.clearWishlist();
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('messages.success'.tr()),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('${'errors.somethingWentWrong'.tr()}: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text('common.clear'.tr()),
          ),
        ],
      ),
    );
  }

}

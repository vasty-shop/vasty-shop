import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:badges/badges.dart' as badges;
import 'package:easy_localization/easy_localization.dart';
import '../providers/product_provider.dart';
import '../../../../../shared/widgets/product_card.dart';
import '../../../../../core/routing/app_router.dart';
import '../../../../../core/constants/app_constants.dart';
import '../../../../../core/config/mobile_config_service.dart';
import '../../../../../features/auth/presentation/providers/auth_provider.dart';
import '../../../../../features/vendor/home/presentation/pages/vendor_home_page.dart';
import '../../../../../features/delivery/dashboard/presentation/pages/delivery_home_page.dart';
import '../../../../../features/notifications/presentation/widgets/notification_bell.dart';
import '../../../cart/presentation/providers/cart_provider.dart';
import '../../../cart/presentation/pages/cart_page.dart';
import '../../../wishlist/presentation/pages/wishlist_page.dart';
import '../../../products/presentation/pages/product_detail_page.dart';
import '../../../orders/presentation/pages/orders_page.dart';
import '../../../profile/presentation/pages/customer_profile_page.dart';

class CustomerHomePage extends ConsumerStatefulWidget {
  const CustomerHomePage({super.key});

  @override
  ConsumerState<CustomerHomePage> createState() => _CustomerHomePageState();
}

class _CustomerHomePageState extends ConsumerState<CustomerHomePage> {
  final _searchController = TextEditingController();
  int _selectedBottomNavIndex = 0;

  @override
  void initState() {
    super.initState();
    // Load products on init
    Future.microtask(() {
      ref.read(productsProvider.notifier).loadProducts(refresh: true);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onBottomNavTap(int index) {
    final authState = ref.read(authProvider);
    final isGuest = authState.isGuestMode || authState.user == null;

    // If guest tries to access Orders, prompt to login
    if (isGuest && index == 3) {
      _showLoginPrompt();
      return;
    }

    // Haptic feedback if enabled in config
    final configAsync = ref.read(mobileConfigProvider);
    configAsync.whenData((config) {
      if (config.navigation.hapticFeedback) {
        HapticFeedback.selectionClick();
      }
    });

    setState(() {
      _selectedBottomNavIndex = index;
    });
  }

  void _showLoginPrompt() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('auth.loginRequired'.tr()),
        content: Text('auth.pleaseLoginToViewOrders'.tr()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('common.cancel'.tr()),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              AppRouter.navigateToLogin(context);
            },
            child: Text('auth.login'.tr()),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final theme = Theme.of(context);
    final isVendor = user?.metadata?['shopId'] != null;
    final isDeliveryPartner = user?.isDeliveryMan ?? false;

    // Get navigation config from API
    final configAsync = ref.watch(mobileConfigProvider);
    final navigationConfig = configAsync.maybeWhen(
      data: (config) {
        // Debug logging
        debugPrint('🔧 Navigation Config: showLabels=${config.navigation.showLabels}, hapticFeedback=${config.navigation.hapticFeedback}');
        return config.navigation;
      },
      orElse: () => null,
    );

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            Icon(Icons.shopping_bag_rounded, color: theme.colorScheme.primary),
            const SizedBox(width: 8),
            Text(
              AppConstants.appName,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [
          // Cart with badge
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
          const NotificationBell(),
        ],
      ),
      drawer: _buildDrawer(context, user, isVendor, isDeliveryPartner, theme),
      body: _selectedBottomNavIndex == 0
          ? _buildHomePage(theme)
          : _selectedBottomNavIndex == 1
              ? const WishlistPage(showAppBar: false)
              : _selectedBottomNavIndex == 2
                  ? const CartPage(showAppBar: false)
                  : const OrdersPage(showAppBar: false),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedBottomNavIndex,
        onTap: _onBottomNavTap,
        selectedItemColor: theme.colorScheme.primary,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        showSelectedLabels: navigationConfig?.showLabels ?? true,
        showUnselectedLabels: navigationConfig?.showLabels ?? true,
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.home),
            label: 'nav.home'.tr(),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.favorite_outline),
            label: 'nav.wishlist'.tr(),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.shopping_cart_outlined),
            label: 'nav.cart'.tr(),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.receipt_long),
            label: 'nav.orders'.tr(),
          ),
        ],
      ),
    );
  }

  Widget _buildHomePage(ThemeData theme) {
    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(productsProvider.notifier).loadProducts(refresh: true);
      },
      child: CustomScrollView(
        slivers: [
          // Search Bar
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'products.searchProducts'.tr(),
                        prefixIcon: const Icon(Icons.search),
                        suffixIcon: _searchController.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() {});
                                  ref.read(productsProvider.notifier).clearSearch();
                                },
                              )
                            : null,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        filled: true,
                        fillColor: Colors.white,
                      ),
                      onChanged: (value) => setState(() {}),
                      onSubmitted: (value) {
                        if (value.isNotEmpty) {
                          ref.read(productsProvider.notifier).searchProducts(value);
                        } else {
                          ref.read(productsProvider.notifier).loadProducts(refresh: true);
                        }
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  _buildFilterButton(theme),
                ],
              ),
            ),
          ),

          // Categories Section
          _buildCategoriesSection(theme),

          // Featured Products Section
          _buildFeaturedSection(theme),

          // Products Grid
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'products.allProducts'.tr(),
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () {
                      // TODO: Show sort options
                    },
                    icon: const Icon(Icons.sort, size: 18),
                    label: Text('common.sort'.tr()),
                  ),
                ],
              ),
            ),
          ),

          _buildProductsGrid(),

          // Loading indicator
          _buildLoadingIndicator(),
        ],
      ),
    );
  }

  Widget _buildDrawer(BuildContext context, dynamic user, bool isVendor, bool isDeliveryPartner, ThemeData theme) {
    final authState = ref.watch(authProvider);
    final isGuest = authState.isGuestMode || user == null;

    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            // User Header
            Container(
              padding: const EdgeInsets.all(20),
              color: theme.colorScheme.primary.withValues(alpha: 0.1),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.2),
                    child: isGuest
                        ? Icon(
                            Icons.person_outline,
                            size: 36,
                            color: theme.colorScheme.primary,
                          )
                        : Text(
                            user?.initials ?? 'U',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isGuest ? 'auth.guestUser'.tr() : (user?.name ?? 'auth.guestUser'.tr()),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          isGuest ? 'auth.loginToAccessFeatures'.tr() : (user?.email ?? ''),
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey.shade600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Menu Items
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  // Mode Switcher (show if user is vendor or delivery partner)
                  if (isVendor || isDeliveryPartner) ...[
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: theme.colorScheme.primary.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Icon(
                                      Icons.swap_horiz,
                                      color: theme.colorScheme.primary,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'nav.appMode'.tr(),
                                          style: const TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'nav.currentlyInCustomerMode'.tr(),
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              if (isVendor)
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton.icon(
                                    onPressed: () {
                                      Navigator.of(context).pushReplacement(
                                        MaterialPageRoute(
                                          builder: (_) => const VendorHomePage(),
                                        ),
                                      );
                                    },
                                    icon: const Icon(Icons.store_outlined),
                                    label: Text('nav.switchToVendorMode'.tr()),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: theme.colorScheme.primary,
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                  ),
                                ),
                              if (isDeliveryPartner) ...[
                                const SizedBox(height: 8),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton.icon(
                                    onPressed: () {
                                      Navigator.of(context).pushReplacement(
                                        MaterialPageRoute(
                                          builder: (_) => const DeliveryHomePage(),
                                        ),
                                      );
                                    },
                                    icon: const Icon(Icons.delivery_dining),
                                    label: Text('nav.switchToDeliveryMode'.tr()),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.orange,
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                    ),
                    const Divider(),
                  ],
                  // Show Login button for guest users
                  if (isGuest) ...[
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          AppRouter.navigateToLogin(context);
                        },
                        icon: const Icon(Icons.login),
                        label: Text('common.loginSignup'.tr()),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: theme.colorScheme.primary,
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 48),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                    const Divider(),
                  ],
                  ListTile(
                    leading: const Icon(Icons.home),
                    title: Text('common.home'.tr()),
                    onTap: () => Navigator.pop(context),
                  ),
                  // Hide orders for guests
                  if (!isGuest)
                    ListTile(
                      leading: const Icon(Icons.shopping_bag),
                      title: Text('nav.myOrders'.tr()),
                      onTap: () {
                        Navigator.pop(context);
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const OrdersPage()),
                        );
                      },
                    ),
                  ListTile(
                    leading: const Icon(Icons.favorite),
                    title: Text('nav.wishlist'.tr()),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const WishlistPage()),
                      );
                    },
                  ),
                  // Hide profile for guests
                  if (!isGuest)
                    ListTile(
                      leading: const Icon(Icons.person),
                      title: Text('common.profile'.tr()),
                      onTap: () {
                        Navigator.pop(context); // Close drawer
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const CustomerProfilePage(),
                          ),
                        );
                      },
                    ),
                  const Divider(),
                  // Hide logout for guests
                  if (!isGuest)
                    ListTile(
                      leading: const Icon(Icons.logout, color: Colors.red),
                      title: Text(
                        'common.logout'.tr(),
                        style: const TextStyle(color: Colors.red),
                      ),
                      onTap: () async {
                        await ref.read(authProvider.notifier).logout();
                        if (context.mounted) {
                          AppRouter.navigateToLogin(context);
                        }
                      },
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoriesSection(ThemeData theme) {
    final categoriesAsync = ref.watch(categoriesProvider);

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'common.categories'.tr(),
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            categoriesAsync.when(
              data: (categories) {
                if (categories.isEmpty) {
                  return const SizedBox.shrink();
                }

                return SizedBox(
                  height: 100,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: categories.length,
                    itemBuilder: (context, index) {
                      final category = categories[index];
                      return GestureDetector(
                        onTap: () {
                          ref
                              .read(productsProvider.notifier)
                              .loadProductsByCategory(category.slug);
                        },
                        child: Container(
                          width: 80,
                          margin: const EdgeInsets.only(right: 12),
                          child: Column(
                            children: [
                              Container(
                                width: 60,
                                height: 60,
                                decoration: BoxDecoration(
                                  color: theme.colorScheme.primary.withValues(alpha: 0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: category.image != null
                                    ? ClipOval(
                                        child: CachedNetworkImage(
                                          imageUrl: category.image!,
                                          fit: BoxFit.cover,
                                          errorWidget: (context, url, error) => Icon(
                                            Icons.category,
                                            size: 30,
                                            color: theme.colorScheme.primary,
                                          ),
                                        ),
                                      )
                                    : Icon(
                                        Icons.category,
                                        size: 30,
                                        color: theme.colorScheme.primary,
                                      ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                category.name,
                                textAlign: TextAlign.center,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stack) => const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeaturedSection(ThemeData theme) {
    final featuredAsync = ref.watch(featuredProductsProvider);

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'products.featuredProducts'.tr(),
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            featuredAsync.when(
              data: (products) {
                if (products.isEmpty) {
                  return const SizedBox.shrink();
                }

                return SizedBox(
                  height: 280,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: products.length,
                    itemBuilder: (context, index) {
                      return Container(
                        width: 180,
                        margin: const EdgeInsets.only(right: 12),
                        child: ProductCard(
                          product: products[index],
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => ProductDetailPage(
                                  productId: products[index].id,
                                ),
                              ),
                            );
                          },
                          onAddToCart: () async {
                            await ref.read(cartProvider.notifier).addToCart(
                                  productId: products[index].id,
                                  quantity: 1,
                                );
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('products.addedToCart'.tr()),
                                  backgroundColor: Colors.green,
                                  duration: Duration(seconds: 1),
                                ),
                              );
                            }
                          },
                        ),
                      );
                    },
                  ),
                );
              },
              loading: () => const SizedBox(
                height: 280,
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (error, stack) => const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductsGrid() {
    final productsState = ref.watch(productsProvider);

    if (productsState.products.isEmpty && productsState.isLoading) {
      return const SliverToBoxAdapter(
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(32),
            child: CircularProgressIndicator(),
          ),
        ),
      );
    }

    if (productsState.products.isEmpty && productsState.error != null) {
      return SliverToBoxAdapter(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              children: [
                const Icon(Icons.error_outline, size: 64, color: Colors.red),
                const SizedBox(height: 16),
                Text(
                  'products.errorLoadingProducts'.tr(),
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${productsState.error}',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey.shade600),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    ref.read(productsProvider.notifier).loadProducts(refresh: true);
                  },
                  child: Text('common.retry'.tr()),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (productsState.products.isEmpty) {
      return SliverToBoxAdapter(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              children: [
                Icon(
                  Icons.inventory_outlined,
                  size: 80,
                  color: Colors.grey.shade300,
                ),
                const SizedBox(height: 16),
                Text(
                  'products.noProductsAvailable'.tr(),
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'products.checkBackLater'.tr(),
                  style: TextStyle(color: Colors.grey.shade600),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.65,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final product = productsState.products[index];
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
                    SnackBar(
                      content: Text('products.addedToCart'.tr()),
                      backgroundColor: Colors.green,
                      duration: Duration(seconds: 1),
                    ),
                  );
                }
              },
            );
          },
          childCount: productsState.products.length,
        ),
      ),
    );
  }

  Widget _buildLoadingIndicator() {
    final productsState = ref.watch(productsProvider);

    if (!productsState.isLoading || productsState.products.isEmpty) {
      return const SliverToBoxAdapter(child: SizedBox.shrink());
    }

    return const SliverToBoxAdapter(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Center(child: CircularProgressIndicator()),
      ),
    );
  }

  Widget _buildFilterButton(ThemeData theme) {
    final hasFilters = ref.watch(productsProvider).filters.hasActiveFilters;

    return Container(
      decoration: BoxDecoration(
        color: hasFilters ? theme.colorScheme.primary : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: IconButton(
        icon: Icon(
          Icons.tune,
          color: hasFilters ? Colors.white : Colors.grey.shade700,
        ),
        onPressed: _showFilterDialog,
      ),
    );
  }

  void _showFilterDialog() {
    final currentFilters = ref.read(productsProvider).filters;
    double? minPrice = currentFilters.minPrice;
    double? maxPrice = currentFilters.maxPrice;
    String sortBy = currentFilters.sortBy;

    final minPriceController = TextEditingController(
      text: minPrice?.toStringAsFixed(0) ?? '',
    );
    final maxPriceController = TextEditingController(
      text: maxPrice?.toStringAsFixed(0) ?? '',
    );

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setSheetState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'products.filters'.tr(),
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Price Range
              Text(
                'products.priceRange'.tr(),
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: minPriceController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: 'products.minPrice'.tr(),
                        prefixText: '\$ ',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onChanged: (value) {
                        minPrice = double.tryParse(value);
                      },
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 12),
                    child: Text('-'),
                  ),
                  Expanded(
                    child: TextField(
                      controller: maxPriceController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: 'products.maxPrice'.tr(),
                        prefixText: '\$ ',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onChanged: (value) {
                        maxPrice = double.tryParse(value);
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Sort By
              Text(
                'products.sortBy'.tr(),
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildSortChip(
                    'products.sortRelevance'.tr(),
                    'relevance',
                    sortBy,
                    (value) => setSheetState(() => sortBy = value),
                  ),
                  _buildSortChip(
                    'products.sortPriceLow'.tr(),
                    'price_low',
                    sortBy,
                    (value) => setSheetState(() => sortBy = value),
                  ),
                  _buildSortChip(
                    'products.sortPriceHigh'.tr(),
                    'price_high',
                    sortBy,
                    (value) => setSheetState(() => sortBy = value),
                  ),
                  _buildSortChip(
                    'products.sortNewest'.tr(),
                    'newest',
                    sortBy,
                    (value) => setSheetState(() => sortBy = value),
                  ),
                  _buildSortChip(
                    'products.sortRating'.tr(),
                    'rating',
                    sortBy,
                    (value) => setSheetState(() => sortBy = value),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        ref.read(productsProvider.notifier).clearFilters();
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text('products.clearFilters'.tr()),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        ref.read(productsProvider.notifier).applyFilters(
                              minPrice: minPrice,
                              maxPrice: maxPrice,
                              sortBy: sortBy,
                            );
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text('products.applyFilters'.tr()),
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

  Widget _buildSortChip(
    String label,
    String value,
    String currentValue,
    Function(String) onSelected,
  ) {
    final isSelected = value == currentValue;
    final theme = Theme.of(context);

    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => onSelected(value),
      selectedColor: theme.colorScheme.primary,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : Colors.grey.shade700,
        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
      ),
    );
  }
}

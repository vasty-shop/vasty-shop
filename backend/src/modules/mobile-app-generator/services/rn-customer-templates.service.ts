import { Injectable } from '@nestjs/common';
import { MobileAppConfig, GeneratedFile } from '../interfaces/types';

@Injectable()
export class RNCustomerTemplatesService {
  /**
   * Generate all customer app screens
   */
  generateCustomerScreens(config: MobileAppConfig): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Home Screen
    files.push(this.generateHomeScreen(config));

    // Products Screen
    files.push(this.generateProductsScreen(config));

    // Product Detail Screen
    files.push(this.generateProductDetailScreen(config));

    // Categories Screen
    files.push(this.generateCategoriesScreen(config));

    // Cart Screen
    files.push(this.generateCartScreen(config));

    // Checkout Screen
    files.push(this.generateCheckoutScreen(config));

    // Wishlist Screen
    files.push(this.generateWishlistScreen(config));

    // Orders Screen
    files.push(this.generateOrdersScreen(config));

    // Order Detail Screen
    files.push(this.generateOrderDetailScreen(config));

    // Profile Screen
    files.push(this.generateProfileScreen(config));

    // Settings Screen
    files.push(this.generateSettingsScreen(config));

    // Notifications Screen
    files.push(this.generateNotificationsScreen(config));

    // Address Management Screen
    files.push(this.generateAddressScreen(config));

    // Search Screen
    files.push(this.generateSearchScreen(config));

    // Screen index export
    files.push(this.generateScreensIndex('customer'));

    return files;
  }

  private generateHomeScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/customer/HomeScreen.tsx',
      type: 'screen',
      content: `import React, { useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { productsApi } from '@api/products';
import { categoriesApi } from '@api/categories';
import { offersApi } from '@api/offers';
import { ProductCard } from '@components/ProductCard';
import { CategoryCard } from '@components/CategoryCard';
import { BannerCarousel } from '@components/BannerCarousel';
import { SectionHeader } from '@components/SectionHeader';
import { SkeletonLoader } from '@components/SkeletonLoader';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  // Fetch data
  const { data: banners, isLoading: bannersLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: offersApi.getBanners,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
  });

  const { data: featuredProducts, isLoading: featuredLoading, refetch: refetchFeatured } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productsApi.getFeaturedProducts(10),
  });

  const { data: bestSellers, isLoading: bestSellersLoading } = useQuery({
    queryKey: ['bestSellers'],
    queryFn: () => productsApi.getBestsellerProducts(10),
  });

  const { data: newArrivals, isLoading: newArrivalsLoading } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: () => productsApi.getNewArrivals(10),
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchFeatured();
    setRefreshing(false);
  }, [refetchFeatured]);

  const styles = useStyles((t) => ({
    container: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: t.spacing.md,
      paddingVertical: t.spacing.sm,
      backgroundColor: t.colors.surface,
      ...t.shadows.sm,
    },
    logo: {
      fontSize: t.typography.fontSize.xl,
      fontFamily: t.typography.fontFamily.bold,
      color: t.colors.primary,
    },
    headerIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
    },
    iconButton: {
      padding: t.spacing.xs,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.colors.input,
      borderRadius: t.borderRadius.md,
      marginHorizontal: t.spacing.md,
      marginVertical: t.spacing.sm,
      paddingHorizontal: t.spacing.md,
      paddingVertical: t.spacing.sm,
    },
    searchText: {
      flex: 1,
      marginLeft: t.spacing.sm,
      fontSize: t.typography.fontSize.md,
      color: t.colors.placeholder,
    },
    section: {
      marginBottom: t.spacing.lg,
    },
    categoriesContainer: {
      paddingLeft: t.spacing.md,
    },
    productsRow: {
      paddingLeft: t.spacing.md,
    },
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>${config.appName}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <Icon name="bell" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Cart')}>
            <Icon name="shopping-cart" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
        <Icon name="search" size={20} color={theme.colors.placeholder} />
        <Text style={styles.searchText}>Search products...</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Banner Carousel */}
        {!bannersLoading && banners && (
          <BannerCarousel banners={banners} />
        )}

        {/* Categories */}
        <View style={styles.section}>
          <SectionHeader title="Categories" onSeeAll={() => navigation.navigate('Categories')} />
          {categoriesLoading ? (
            <SkeletonLoader type="category" count={5} />
          ) : (
            <FlatList
              data={categories?.slice(0, 8)}
              renderItem={({ item }) => (
                <CategoryCard
                  category={item}
                  onPress={() => navigation.navigate('Products', { categoryId: item.id })}
                />
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            />
          )}
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <SectionHeader title="Featured" onSeeAll={() => navigation.navigate('Products', { filter: 'featured' })} />
          {featuredLoading ? (
            <SkeletonLoader type="product" count={4} />
          ) : (
            <FlatList
              data={featuredProducts}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                />
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsRow}
            />
          )}
        </View>

        {/* Best Sellers */}
        <View style={styles.section}>
          <SectionHeader title="Best Sellers" onSeeAll={() => navigation.navigate('Products', { filter: 'bestsellers' })} />
          {bestSellersLoading ? (
            <SkeletonLoader type="product" count={4} />
          ) : (
            <FlatList
              data={bestSellers}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                />
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsRow}
            />
          )}
        </View>

        {/* New Arrivals */}
        <View style={styles.section}>
          <SectionHeader title="New Arrivals" onSeeAll={() => navigation.navigate('Products', { filter: 'new' })} />
          {newArrivalsLoading ? (
            <SkeletonLoader type="product" count={4} />
          ) : (
            <FlatList
              data={newArrivals}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                />
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsRow}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
`,
    };
  }

  private generateProductsScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/customer/ProductsScreen.tsx',
      type: 'screen',
      content: `import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useInfiniteQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { productsApi } from '@api/products';
import { ProductCard } from '@components/ProductCard';
import { FilterModal } from '@components/FilterModal';
import { SortModal } from '@components/SortModal';

export const ProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const categoryId = route.params?.categoryId;
  const filter = route.params?.filter;

  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['products', categoryId, filter, sortBy, sortOrder, priceRange],
    queryFn: ({ pageParam = 1 }) =>
      productsApi.getProducts({
        page: pageParam,
        limit: 20,
        categoryId,
        sortBy,
        sortOrder,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const products = data?.pages.flatMap((page) => page.data) || [];

  const styles = useStyles((t) => ({
    container: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: t.spacing.md,
      paddingVertical: t.spacing.sm,
      backgroundColor: t.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    backButton: {
      padding: t.spacing.xs,
      marginRight: t.spacing.sm,
    },
    title: {
      flex: 1,
      fontSize: t.typography.fontSize.lg,
      fontFamily: t.typography.fontFamily.semiBold,
      color: t.colors.text,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.sm,
    },
    filterBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: t.spacing.md,
      paddingVertical: t.spacing.sm,
      backgroundColor: t.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    resultCount: {
      fontSize: t.typography.fontSize.sm,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.textSecondary,
    },
    filterButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: t.spacing.sm,
      paddingVertical: t.spacing.xs,
      borderRadius: t.borderRadius.sm,
      borderWidth: 1,
      borderColor: t.colors.border,
    },
    filterButtonText: {
      fontSize: t.typography.fontSize.sm,
      fontFamily: t.typography.fontFamily.medium,
      color: t.colors.text,
      marginLeft: t.spacing.xs,
    },
    listContent: {
      padding: t.spacing.sm,
    },
    row: {
      justifyContent: 'space-between',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: t.spacing.xxl,
    },
    emptyText: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.textSecondary,
      marginTop: t.spacing.md,
    },
    loadingFooter: {
      paddingVertical: t.spacing.lg,
      alignItems: 'center',
    },
  }));

  const renderProduct = useCallback(
    ({ item }: { item: any }) => (
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        style={{ width: '48%', marginBottom: theme.spacing.md }}
      />
    ),
    [navigation, theme]
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  };

  const totalCount = data?.pages[0]?.total || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Products</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Icon name="search" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <Text style={styles.resultCount}>{totalCount} products</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowSort(true)}>
            <Icon name="bar-chart-2" size={16} color={theme.colors.text} />
            <Text style={styles.filterButtonText}>Sort</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
            <Icon name="filter" size={16} color={theme.colors.text} />
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Products Grid */}
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="package" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Sort Modal */}
      <SortModal
        visible={showSort}
        onClose={() => setShowSort(false)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onApply={(newSortBy, newSortOrder) => {
          setSortBy(newSortBy);
          setSortOrder(newSortOrder);
          setShowSort(false);
        }}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        priceRange={priceRange}
        onApply={(filters) => {
          setPriceRange(filters.priceRange);
          setShowFilters(false);
        }}
      />
    </SafeAreaView>
  );
};

export default ProductsScreen;
`,
    };
  }

  private generateProductDetailScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/customer/ProductDetailScreen.tsx',
      type: 'screen',
      content: `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { productsApi } from '@api/products';
import { cartApi } from '@api/cart';
import { wishlistApi } from '@api/wishlist';
import { reviewsApi } from '@api/reviews';
import { ImageCarousel } from '@components/ImageCarousel';
import { QuantitySelector } from '@components/QuantitySelector';
import { ReviewsList } from '@components/ReviewsList';
import { ProductCard } from '@components/ProductCard';

const { width } = Dimensions.get('window');

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const productId = route.params?.productId;

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Fetch product details
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getProduct(productId),
    enabled: !!productId,
  });

  // Fetch reviews
  const { data: reviews } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewsApi.getProductReviews(productId, { limit: 5 }),
    enabled: !!productId,
  });

  // Fetch related products
  const { data: relatedProducts } = useQuery({
    queryKey: ['relatedProducts', productId],
    queryFn: () => productsApi.getRelatedProducts(productId, 6),
    enabled: !!productId,
  });

  // Check wishlist status
  useQuery({
    queryKey: ['wishlistCheck', productId],
    queryFn: () => wishlistApi.isInWishlist(productId),
    enabled: !!productId,
    onSuccess: (data) => setIsInWishlist(data),
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: () => cartApi.addToCart({ productId, quantity, variantId: selectedVariant?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: \`\${product?.name} has been added to your cart\`,
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to add to cart',
      });
    },
  });

  // Toggle wishlist mutation
  const toggleWishlistMutation = useMutation({
    mutationFn: () => wishlistApi.toggleWishlist(productId),
    onSuccess: (inWishlist) => {
      setIsInWishlist(inWishlist);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      Toast.show({
        type: 'success',
        text1: inWishlist ? 'Added to Wishlist' : 'Removed from Wishlist',
      });
    },
  });

  const styles = useStyles((t) => ({
    container: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: t.spacing.md,
      paddingTop: 50,
      paddingBottom: t.spacing.md,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      alignItems: 'center',
      justifyContent: 'center',
      ...t.shadows.sm,
    },
    headerActions: {
      flexDirection: 'row',
      gap: t.spacing.sm,
    },
    content: {
      paddingHorizontal: t.spacing.md,
      paddingTop: t.spacing.md,
    },
    title: {
      fontSize: t.typography.fontSize.xl,
      fontFamily: t.typography.fontFamily.bold,
      color: t.colors.text,
      marginBottom: t.spacing.xs,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: t.spacing.md,
    },
    price: {
      fontSize: t.typography.fontSize.xxl,
      fontFamily: t.typography.fontFamily.bold,
      color: t.colors.primary,
    },
    comparePrice: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.textSecondary,
      textDecorationLine: 'line-through',
      marginLeft: t.spacing.sm,
    },
    discount: {
      backgroundColor: t.colors.error,
      paddingHorizontal: t.spacing.sm,
      paddingVertical: 2,
      borderRadius: t.borderRadius.sm,
      marginLeft: t.spacing.sm,
    },
    discountText: {
      fontSize: t.typography.fontSize.xs,
      fontFamily: t.typography.fontFamily.semiBold,
      color: '#FFFFFF',
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: t.spacing.lg,
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: t.spacing.md,
    },
    ratingText: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.semiBold,
      color: t.colors.text,
      marginLeft: t.spacing.xs,
    },
    reviewCount: {
      fontSize: t.typography.fontSize.sm,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.textSecondary,
    },
    section: {
      marginBottom: t.spacing.lg,
    },
    sectionTitle: {
      fontSize: t.typography.fontSize.lg,
      fontFamily: t.typography.fontFamily.semiBold,
      color: t.colors.text,
      marginBottom: t.spacing.sm,
    },
    description: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.textSecondary,
      lineHeight: 24,
    },
    variantsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: t.spacing.sm,
    },
    variantButton: {
      paddingHorizontal: t.spacing.md,
      paddingVertical: t.spacing.sm,
      borderRadius: t.borderRadius.md,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.surface,
    },
    variantButtonSelected: {
      borderColor: t.colors.primary,
      backgroundColor: t.colors.primary + '10',
    },
    variantText: {
      fontSize: t.typography.fontSize.sm,
      fontFamily: t.typography.fontFamily.medium,
      color: t.colors.text,
    },
    variantTextSelected: {
      color: t.colors.primary,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: t.spacing.md,
      paddingVertical: t.spacing.md,
      backgroundColor: t.colors.surface,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
      gap: t.spacing.md,
    },
    addToCartButton: {
      flex: 1,
      backgroundColor: t.colors.primary,
      borderRadius: t.borderRadius.md,
      paddingVertical: t.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      ...t.shadows.sm,
    },
    addToCartText: {
      fontSize: t.typography.fontSize.lg,
      fontFamily: t.typography.fontFamily.semiBold,
      color: '#FFFFFF',
    },
    relatedList: {
      paddingLeft: t.spacing.md,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

  if (isLoading || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const discountPercent = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <ImageCarousel images={product.images || [product.thumbnail]} />

        {/* Header - Absolute positioned */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => toggleWishlistMutation.mutate()}
            >
              <Icon
                name="heart"
                size={24}
                color={isInWishlist ? theme.colors.error : theme.colors.text}
                fill={isInWishlist ? theme.colors.error : 'none'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Icon name="share-2" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{product.name}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>\${product.price.toFixed(2)}</Text>
            {product.comparePrice && (
              <>
                <Text style={styles.comparePrice}>\${product.comparePrice.toFixed(2)}</Text>
                <View style={styles.discount}>
                  <Text style={styles.discountText}>{discountPercent}% OFF</Text>
                </View>
              </>
            )}
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.rating}>
              <Icon name="star" size={18} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{product.rating?.toFixed(1) || '0.0'}</Text>
            </View>
            <Text style={styles.reviewCount}>({product.reviewCount || 0} reviews)</Text>
          </View>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Options</Text>
              <View style={styles.variantsContainer}>
                {product.variants.map((variant: any) => (
                  <TouchableOpacity
                    key={variant.id}
                    style={[
                      styles.variantButton,
                      selectedVariant?.id === variant.id && styles.variantButtonSelected,
                    ]}
                    onPress={() => setSelectedVariant(variant)}
                  >
                    <Text
                      style={[
                        styles.variantText,
                        selectedVariant?.id === variant.id && styles.variantTextSelected,
                      ]}
                    >
                      {variant.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => setQuantity((q) => q + 1)}
              onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
              max={product.stock}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Reviews */}
          {reviews && reviews.data?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <ReviewsList
                reviews={reviews.data}
                onSeeAll={() => navigation.navigate('Reviews', { productId })}
              />
            </View>
          )}

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>You May Also Like</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedList}
              >
                {relatedProducts.map((item: any) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    onPress={() =>
                      navigation.push('ProductDetail', { productId: item.id })
                    }
                    compact
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer - Add to Cart */}
      <SafeAreaView edges={['bottom']}>
        <View style={styles.footer}>
          <QuantitySelector
            quantity={quantity}
            onIncrease={() => setQuantity((q) => q + 1)}
            onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
            max={product.stock}
            compact
          />
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => addToCartMutation.mutate()}
            disabled={addToCartMutation.isPending}
          >
            {addToCartMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.addToCartText}>Add to Cart</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default ProductDetailScreen;
`,
    };
  }

  // Continue with other screens - keeping them shorter for brevity
  private generateCategoriesScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/customer/CategoriesScreen.tsx',
      type: 'screen',
      content: `import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { categoriesApi } from '@api/categories';
import { CategoryCard } from '@components/CategoryCard';

export const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['allCategories'],
    queryFn: categoriesApi.getCategories,
  });

  const styles = useStyles((t) => ({
    container: { flex: 1, backgroundColor: t.colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: t.spacing.md,
      backgroundColor: t.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    title: {
      flex: 1,
      fontSize: t.typography.fontSize.xl,
      fontFamily: t.typography.fontFamily.bold,
      color: t.colors.text,
      textAlign: 'center',
    },
    grid: { padding: t.spacing.md },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  }));

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
      </View>
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onPress={() => navigation.navigate('Products', { categoryId: item.id, title: item.name })}
            large
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default CategoriesScreen;
`,
    };
  }

  private generateCartScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/customer/CartScreen.tsx',
      type: 'screen',
      content: `import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { cartApi } from '@api/cart';
import { CartItem } from '@components/CartItem';
import { EmptyState } from '@components/EmptyState';

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateCartItem(itemId, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      Toast.show({ type: 'success', text1: 'Item removed from cart' });
    },
  });

  const styles = useStyles((t) => ({
    container: { flex: 1, backgroundColor: t.colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: t.spacing.md,
      backgroundColor: t.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    backButton: { padding: t.spacing.xs, marginRight: t.spacing.sm },
    title: {
      flex: 1,
      fontSize: t.typography.fontSize.xl,
      fontFamily: t.typography.fontFamily.bold,
      color: t.colors.text,
    },
    itemCount: {
      fontSize: t.typography.fontSize.sm,
      color: t.colors.textSecondary,
    },
    list: { padding: t.spacing.md },
    summary: {
      backgroundColor: t.colors.surface,
      padding: t.spacing.md,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: t.spacing.sm,
    },
    summaryLabel: {
      fontSize: t.typography.fontSize.md,
      color: t.colors.textSecondary,
    },
    summaryValue: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.semiBold,
      color: t.colors.text,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: t.spacing.sm,
      paddingTop: t.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
    },
    totalLabel: {
      fontSize: t.typography.fontSize.lg,
      fontFamily: t.typography.fontFamily.bold,
      color: t.colors.text,
    },
    totalValue: {
      fontSize: t.typography.fontSize.xl,
      fontFamily: t.typography.fontFamily.bold,
      color: t.colors.primary,
    },
    checkoutButton: {
      backgroundColor: t.colors.primary,
      borderRadius: t.borderRadius.md,
      paddingVertical: t.spacing.md,
      alignItems: 'center',
      marginTop: t.spacing.md,
      ...t.shadows.sm,
    },
    checkoutText: {
      fontSize: t.typography.fontSize.lg,
      fontFamily: t.typography.fontFamily.semiBold,
      color: '#FFFFFF',
    },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  }));

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Cart</Text>
        </View>
        <EmptyState
          icon="shopping-cart"
          title="Your cart is empty"
          description="Add some products to get started"
          actionLabel="Start Shopping"
          onAction={() => navigation.navigate('Home')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Cart</Text>
        <Text style={styles.itemCount}>{cart.items.length} items</Text>
      </View>

      <FlatList
        data={cart.items}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onUpdateQuantity={(quantity) =>
              updateQuantityMutation.mutate({ itemId: item.id, quantity })
            }
            onRemove={() => {
              Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => removeItemMutation.mutate(item.id) },
              ]);
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <SafeAreaView edges={['bottom']}>
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>\${cart.subtotal.toFixed(2)}</Text>
          </View>
          {cart.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                -\${cart.discount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>
              {cart.deliveryCost > 0 ? \`\$\${cart.deliveryCost.toFixed(2)}\` : 'Free'}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>\${cart.total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('Checkout')}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
};

export default CartScreen;
`,
    };
  }

  private generateCheckoutScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/customer/CheckoutScreen.tsx',
      type: 'screen',
      content: `// CheckoutScreen.tsx - Checkout flow with address, payment, and order summary
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { cartApi } from '@api/cart';
import { deliveryApi } from '@api/delivery';
import { ordersApi } from '@api/orders';
import { paymentApi } from '@api/payment';
import { AddressCard } from '@components/AddressCard';
import { PaymentMethodCard } from '@components/PaymentMethodCard';
import { OrderSummaryCard } from '@components/OrderSummaryCard';

export const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [step, setStep] = useState<'address' | 'payment' | 'review'>('address');

  const { data: cart } = useQuery({ queryKey: ['cart'], queryFn: cartApi.getCart });
  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: deliveryApi.getAddresses });
  const { data: paymentMethods } = useQuery({ queryKey: ['paymentMethods'], queryFn: paymentApi.getPaymentMethods });

  const createOrderMutation = useMutation({
    mutationFn: () => ordersApi.createOrder({
      addressId: selectedAddressId!,
      paymentMethodId: selectedPaymentId!,
    }),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigation.replace('OrderConfirmation', { orderId: order.id });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to place order');
    },
  });

  const styles = useStyles((t) => ({
    container: { flex: 1, backgroundColor: t.colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: t.spacing.md,
      backgroundColor: t.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    backButton: { padding: t.spacing.xs, marginRight: t.spacing.sm },
    title: { flex: 1, fontSize: t.typography.fontSize.xl, fontFamily: t.typography.fontFamily.bold, color: t.colors.text },
    steps: { flexDirection: 'row', padding: t.spacing.md, backgroundColor: t.colors.surface },
    step: { flex: 1, alignItems: 'center' },
    stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: t.colors.border, alignItems: 'center', justifyContent: 'center' },
    stepCircleActive: { backgroundColor: t.colors.primary },
    stepText: { marginTop: t.spacing.xs, fontSize: t.typography.fontSize.xs, color: t.colors.textSecondary },
    stepTextActive: { color: t.colors.primary, fontFamily: t.typography.fontFamily.semiBold },
    content: { flex: 1, padding: t.spacing.md },
    sectionTitle: { fontSize: t.typography.fontSize.lg, fontFamily: t.typography.fontFamily.semiBold, color: t.colors.text, marginBottom: t.spacing.md },
    footer: { padding: t.spacing.md, backgroundColor: t.colors.surface, borderTopWidth: 1, borderTopColor: t.colors.border },
    button: { backgroundColor: t.colors.primary, borderRadius: t.borderRadius.md, paddingVertical: t.spacing.md, alignItems: 'center', ...t.shadows.sm },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { fontSize: t.typography.fontSize.lg, fontFamily: t.typography.fontFamily.semiBold, color: '#FFFFFF' },
    addButton: { borderWidth: 1, borderColor: t.colors.primary, borderRadius: t.borderRadius.md, paddingVertical: t.spacing.md, alignItems: 'center', marginTop: t.spacing.md },
    addButtonText: { fontSize: t.typography.fontSize.md, fontFamily: t.typography.fontFamily.semiBold, color: t.colors.primary },
  }));

  const renderStep = () => {
    switch (step) {
      case 'address':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Select Delivery Address</Text>
            {addresses?.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                selected={selectedAddressId === address.id}
                onSelect={() => setSelectedAddressId(address.id)}
              />
            ))}
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddAddress')}>
              <Text style={styles.addButtonText}>+ Add New Address</Text>
            </TouchableOpacity>
          </View>
        );
      case 'payment':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
            {paymentMethods?.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                selected={selectedPaymentId === method.id}
                onSelect={() => setSelectedPaymentId(method.id)}
              />
            ))}
            <PaymentMethodCard
              method={{ id: 'cod', type: 'cod', isDefault: false }}
              selected={selectedPaymentId === 'cod'}
              onSelect={() => setSelectedPaymentId('cod')}
            />
          </View>
        );
      case 'review':
        return (
          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {cart && <OrderSummaryCard cart={cart} />}
            <Text style={[styles.sectionTitle, { marginTop: theme.spacing.lg }]}>Delivery Address</Text>
            {addresses?.find((a) => a.id === selectedAddressId) && (
              <AddressCard address={addresses.find((a) => a.id === selectedAddressId)!} />
            )}
          </ScrollView>
        );
    }
  };

  const canProceed = () => {
    if (step === 'address') return !!selectedAddressId;
    if (step === 'payment') return !!selectedPaymentId;
    return true;
  };

  const handleNext = () => {
    if (step === 'address') setStep('payment');
    else if (step === 'payment') setStep('review');
    else createOrderMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => step === 'address' ? navigation.goBack() : setStep(step === 'review' ? 'payment' : 'address')}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <View style={styles.steps}>
        {['address', 'payment', 'review'].map((s, i) => (
          <View key={s} style={styles.step}>
            <View style={[styles.stepCircle, (step === s || ['payment', 'review'].indexOf(step) >= i) && styles.stepCircleActive]}>
              <Icon name={s === 'address' ? 'map-pin' : s === 'payment' ? 'credit-card' : 'check'} size={16} color={step === s || ['payment', 'review'].indexOf(step) >= i ? '#FFF' : theme.colors.textSecondary} />
            </View>
            <Text style={[styles.stepText, step === s && styles.stepTextActive]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
          </View>
        ))}
      </View>

      {renderStep()}

      <SafeAreaView edges={['bottom']}>
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, !canProceed() && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!canProceed() || createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>{step === 'review' ? 'Place Order' : 'Continue'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
};

export default CheckoutScreen;
`,
    };
  }

  private generateWishlistScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/customer/WishlistScreen.tsx',
      type: 'screen',
      content: `import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { wishlistApi } from '@api/wishlist';
import { cartApi } from '@api/cart';
import { WishlistItem } from '@components/WishlistItem';
import { EmptyState } from '@components/EmptyState';

export const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.getWishlist,
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (productId: string) => wishlistApi.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      Toast.show({ type: 'success', text1: 'Removed from wishlist' });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => cartApi.addToCart({ productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      Toast.show({ type: 'success', text1: 'Added to cart' });
    },
  });

  const styles = useStyles((t) => ({
    container: { flex: 1, backgroundColor: t.colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: t.spacing.md,
      backgroundColor: t.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    backButton: { padding: t.spacing.xs, marginRight: t.spacing.sm },
    title: { flex: 1, fontSize: t.typography.fontSize.xl, fontFamily: t.typography.fontFamily.bold, color: t.colors.text },
    itemCount: { fontSize: t.typography.fontSize.sm, color: t.colors.textSecondary },
    list: { padding: t.spacing.md },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  }));

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Wishlist</Text>
        </View>
        <EmptyState
          icon="heart"
          title="Your wishlist is empty"
          description="Save items you love for later"
          actionLabel="Explore Products"
          onAction={() => navigation.navigate('Home')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.itemCount}>{wishlist.length} items</Text>
      </View>

      <FlatList
        data={wishlist}
        renderItem={({ item }) => (
          <WishlistItem
            item={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.productId })}
            onRemove={() => removeFromWishlistMutation.mutate(item.productId)}
            onAddToCart={() => addToCartMutation.mutate(item.productId)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default WishlistScreen;
`,
    };
  }

  private generateOrdersScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/customer/OrdersScreen.tsx',
      type: 'screen',
      content: `import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useInfiniteQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { ordersApi } from '@api/orders';
import { OrderCard } from '@components/OrderCard';
import { EmptyState } from '@components/EmptyState';

const TABS = ['All', 'Active', 'Completed'];

export const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('All');

  const statusFilter = activeTab === 'Active' ? 'active' : activeTab === 'Completed' ? 'delivered' : undefined;

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['orders', statusFilter],
    queryFn: ({ pageParam = 1 }) => ordersApi.getOrders({ page: pageParam, limit: 10, status: statusFilter }),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const orders = data?.pages.flatMap((page) => page.data) || [];

  const styles = useStyles((t) => ({
    container: { flex: 1, backgroundColor: t.colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: t.spacing.md,
      backgroundColor: t.colors.surface,
    },
    backButton: { padding: t.spacing.xs, marginRight: t.spacing.sm },
    title: { flex: 1, fontSize: t.typography.fontSize.xl, fontFamily: t.typography.fontFamily.bold, color: t.colors.text },
    tabs: {
      flexDirection: 'row',
      paddingHorizontal: t.spacing.md,
      paddingBottom: t.spacing.sm,
      backgroundColor: t.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    tab: { paddingVertical: t.spacing.sm, paddingHorizontal: t.spacing.md, marginRight: t.spacing.sm },
    tabActive: { borderBottomWidth: 2, borderBottomColor: t.colors.primary },
    tabText: { fontSize: t.typography.fontSize.md, color: t.colors.textSecondary },
    tabTextActive: { color: t.colors.primary, fontFamily: t.typography.fontFamily.semiBold },
    list: { padding: t.spacing.md },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingFooter: { paddingVertical: t.spacing.lg, alignItems: 'center' },
  }));

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {orders.length === 0 ? (
        <EmptyState
          icon="package"
          title="No orders yet"
          description="Your order history will appear here"
          actionLabel="Start Shopping"
          onAction={() => navigation.navigate('Home')}
        />
      ) : (
        <FlatList
          data={orders}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <View style={styles.loadingFooter}><ActivityIndicator color={theme.colors.primary} /></View> : null}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default OrdersScreen;
`,
    };
  }

  // Shortened versions of remaining screens for brevity
  private generateOrderDetailScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/customer/OrderDetailScreen.tsx',
      type: 'screen',
      content: `// OrderDetailScreen - Shows detailed order information, tracking, and actions
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { ordersApi } from '@api/orders';
import { OrderTimeline } from '@components/OrderTimeline';
import { OrderItemCard } from '@components/OrderItemCard';

export const OrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const orderId = route.params?.orderId;

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getOrder(orderId),
    enabled: !!orderId,
  });

  const styles = useStyles((t) => ({
    container: { flex: 1, backgroundColor: t.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: t.spacing.md, backgroundColor: t.colors.surface, borderBottomWidth: 1, borderBottomColor: t.colors.border },
    backButton: { padding: t.spacing.xs, marginRight: t.spacing.sm },
    title: { flex: 1, fontSize: t.typography.fontSize.xl, fontFamily: t.typography.fontFamily.bold, color: t.colors.text },
    content: { padding: t.spacing.md },
    section: { backgroundColor: t.colors.surface, borderRadius: t.borderRadius.md, padding: t.spacing.md, marginBottom: t.spacing.md, ...t.shadows.sm },
    sectionTitle: { fontSize: t.typography.fontSize.lg, fontFamily: t.typography.fontFamily.semiBold, color: t.colors.text, marginBottom: t.spacing.md },
    orderNumber: { fontSize: t.typography.fontSize.sm, color: t.colors.textSecondary },
    statusBadge: { paddingHorizontal: t.spacing.sm, paddingVertical: 4, borderRadius: t.borderRadius.sm, alignSelf: 'flex-start' },
    statusText: { fontSize: t.typography.fontSize.sm, fontFamily: t.typography.fontFamily.semiBold },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: t.spacing.md, paddingTop: t.spacing.md, borderTopWidth: 1, borderTopColor: t.colors.border },
    totalLabel: { fontSize: t.typography.fontSize.lg, fontFamily: t.typography.fontFamily.bold, color: t.colors.text },
    totalValue: { fontSize: t.typography.fontSize.xl, fontFamily: t.typography.fontFamily.bold, color: t.colors.primary },
  }));

  if (isLoading || !order) {
    return <SafeAreaView style={styles.container}><View style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.colors.primary} /></View></SafeAreaView>;
  }

  const statusColors: Record<string, string> = {
    pending: theme.colors.warning,
    confirmed: theme.colors.info,
    processing: theme.colors.info,
    shipped: theme.colors.primary,
    delivered: theme.colors.success,
    cancelled: theme.colors.error,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Order Details</Text>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[order.status] + '20' }]}>
              <Text style={[styles.statusText, { color: statusColors[order.status] }]}>{order.status.toUpperCase()}</Text>
            </View>
          </View>
          <OrderTimeline status={order.status} createdAt={order.createdAt} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          {order.items.map((item: any) => <OrderItemCard key={item.id} item={item} />)}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>\${order.total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={{ color: theme.colors.text }}>{order.shippingAddress.recipientName}</Text>
          <Text style={{ color: theme.colors.textSecondary }}>{order.shippingAddress.street}, {order.shippingAddress.city}</Text>
          <Text style={{ color: theme.colors.textSecondary }}>{order.shippingAddress.phone}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetailScreen;
`,
    };
  }

  private generateProfileScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/customer/ProfileScreen.tsx',
      type: 'screen',
      content: `import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '@store/AuthContext';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';

const MENU_ITEMS = [
  { id: 'orders', icon: 'package', label: 'My Orders', route: 'Orders' },
  { id: 'wishlist', icon: 'heart', label: 'Wishlist', route: 'Wishlist' },
  { id: 'addresses', icon: 'map-pin', label: 'Addresses', route: 'Addresses' },
  { id: 'payments', icon: 'credit-card', label: 'Payment Methods', route: 'PaymentMethods' },
  { id: 'notifications', icon: 'bell', label: 'Notifications', route: 'NotificationSettings' },
  { id: 'settings', icon: 'settings', label: 'Settings', route: 'Settings' },
  { id: 'help', icon: 'help-circle', label: 'Help & Support', route: 'Help' },
];

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const styles = useStyles((t) => ({
    container: { flex: 1, backgroundColor: t.colors.background },
    header: { alignItems: 'center', padding: t.spacing.xl, backgroundColor: t.colors.surface },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: t.colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
    avatarImage: { width: 80, height: 80, borderRadius: 40 },
    name: { fontSize: t.typography.fontSize.xl, fontFamily: t.typography.fontFamily.bold, color: t.colors.text, marginTop: t.spacing.md },
    email: { fontSize: t.typography.fontSize.sm, color: t.colors.textSecondary, marginTop: t.spacing.xs },
    editButton: { marginTop: t.spacing.md, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm, borderRadius: t.borderRadius.md, borderWidth: 1, borderColor: t.colors.primary },
    editButtonText: { fontSize: t.typography.fontSize.sm, fontFamily: t.typography.fontFamily.medium, color: t.colors.primary },
    menu: { marginTop: t.spacing.md },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: t.spacing.md, paddingHorizontal: t.spacing.md, backgroundColor: t.colors.surface, borderBottomWidth: 1, borderBottomColor: t.colors.border },
    menuIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: t.colors.primary + '10', alignItems: 'center', justifyContent: 'center', marginRight: t.spacing.md },
    menuLabel: { flex: 1, fontSize: t.typography.fontSize.md, color: t.colors.text },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: t.spacing.md, padding: t.spacing.md, borderRadius: t.borderRadius.md, backgroundColor: t.colors.error + '10' },
    logoutText: { fontSize: t.typography.fontSize.md, fontFamily: t.typography.fontFamily.semiBold, color: t.colors.error, marginLeft: t.spacing.sm },
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Icon name="user" size={32} color={theme.colors.primary} />
            )}
          </View>
          <Text style={styles.name}>{user?.name || 'Guest'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => navigation.navigate(item.route)}>
              <View style={styles.menuIcon}>
                <Icon name={item.icon} size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out" size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
`,
    };
  }

  private generateSettingsScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/customer/SettingsScreen.tsx',
      type: 'screen',
      content: `import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const styles = useStyles((t) => ({
    container: { flex: 1, backgroundColor: t.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: t.spacing.md, backgroundColor: t.colors.surface, borderBottomWidth: 1, borderBottomColor: t.colors.border },
    backButton: { padding: t.spacing.xs, marginRight: t.spacing.sm },
    title: { flex: 1, fontSize: t.typography.fontSize.xl, fontFamily: t.typography.fontFamily.bold, color: t.colors.text },
    section: { marginTop: t.spacing.md },
    sectionTitle: { fontSize: t.typography.fontSize.sm, fontFamily: t.typography.fontFamily.semiBold, color: t.colors.textSecondary, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm, textTransform: 'uppercase' },
    item: { flexDirection: 'row', alignItems: 'center', paddingVertical: t.spacing.md, paddingHorizontal: t.spacing.md, backgroundColor: t.colors.surface, borderBottomWidth: 1, borderBottomColor: t.colors.border },
    itemIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: t.colors.primary + '10', alignItems: 'center', justifyContent: 'center', marginRight: t.spacing.md },
    itemContent: { flex: 1 },
    itemLabel: { fontSize: t.typography.fontSize.md, color: t.colors.text },
    itemDescription: { fontSize: t.typography.fontSize.sm, color: t.colors.textSecondary, marginTop: 2 },
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.item}>
            <View style={styles.itemIcon}>
              <Icon name={isDarkMode ? 'moon' : 'sun'} size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemLabel}>Dark Mode</Text>
              <Text style={styles.itemDescription}>Use dark theme</Text>
            </View>
            <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ false: theme.colors.border, true: theme.colors.primary }} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ChangePassword')}>
            <View style={styles.itemIcon}><Icon name="lock" size={18} color={theme.colors.primary} /></View>
            <View style={styles.itemContent}><Text style={styles.itemLabel}>Change Password</Text></View>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.item}>
            <View style={styles.itemIcon}><Icon name="info" size={18} color={theme.colors.primary} /></View>
            <View style={styles.itemContent}><Text style={styles.itemLabel}>App Version</Text><Text style={styles.itemDescription}>1.0.0</Text></View>
          </View>
          <TouchableOpacity style={styles.item}>
            <View style={styles.itemIcon}><Icon name="file-text" size={18} color={theme.colors.primary} /></View>
            <View style={styles.itemContent}><Text style={styles.itemLabel}>Terms of Service</Text></View>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.item}>
            <View style={styles.itemIcon}><Icon name="shield" size={18} color={theme.colors.primary} /></View>
            <View style={styles.itemContent}><Text style={styles.itemLabel}>Privacy Policy</Text></View>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
`,
    };
  }

  private generateNotificationsScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/customer/NotificationsScreen.tsx',
      type: 'screen',
      content: `import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Feather';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { notificationsApi } from '@api/notifications';
import { EmptyState } from '@components/EmptyState';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam = 1 }) => notificationsApi.getNotifications({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.pages.flatMap((page) => page.data) || [];

  const styles = useStyles((t) => ({
    container: { flex: 1, backgroundColor: t.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: t.spacing.md, backgroundColor: t.colors.surface, borderBottomWidth: 1, borderBottomColor: t.colors.border },
    backButton: { padding: t.spacing.xs, marginRight: t.spacing.sm },
    title: { flex: 1, fontSize: t.typography.fontSize.xl, fontFamily: t.typography.fontFamily.bold, color: t.colors.text },
    markAllButton: { paddingHorizontal: t.spacing.sm },
    markAllText: { fontSize: t.typography.fontSize.sm, color: t.colors.primary },
    notificationItem: { flexDirection: 'row', padding: t.spacing.md, backgroundColor: t.colors.surface, borderBottomWidth: 1, borderBottomColor: t.colors.border },
    notificationUnread: { backgroundColor: t.colors.primary + '05' },
    notificationIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: t.colors.primary + '20', alignItems: 'center', justifyContent: 'center', marginRight: t.spacing.md },
    notificationContent: { flex: 1 },
    notificationTitle: { fontSize: t.typography.fontSize.md, fontFamily: t.typography.fontFamily.semiBold, color: t.colors.text },
    notificationBody: { fontSize: t.typography.fontSize.sm, color: t.colors.textSecondary, marginTop: 2 },
    notificationTime: { fontSize: t.typography.fontSize.xs, color: t.colors.textSecondary, marginTop: 4 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: t.colors.primary },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  }));

  if (isLoading) {
    return <SafeAreaView style={styles.container}><View style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.colors.primary} /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity style={styles.markAllButton} onPress={() => markAllReadMutation.mutate()}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {notifications.length === 0 ? (
        <EmptyState icon="bell" title="No notifications" description="You're all caught up!" />
      ) : (
        <FlatList
          data={notifications}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.notificationItem, !item.isRead && styles.notificationUnread]}>
              <View style={styles.notificationIcon}>
                <Icon name={item.type === 'order' ? 'package' : item.type === 'promo' ? 'tag' : 'bell'} size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationBody} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.notificationTime}>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</Text>
              </View>
              {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;
`,
    };
  }

  private generateAddressScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/customer/AddressesScreen.tsx',
      type: 'screen',
      content: `import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { deliveryApi } from '@api/delivery';
import { AddressCard } from '@components/AddressCard';
import { EmptyState } from '@components/EmptyState';

export const AddressesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: deliveryApi.getAddresses,
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => deliveryApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      Toast.show({ type: 'success', text1: 'Address deleted' });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => deliveryApi.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      Toast.show({ type: 'success', text1: 'Default address updated' });
    },
  });

  const styles = useStyles((t) => ({
    container: { flex: 1, backgroundColor: t.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: t.spacing.md, backgroundColor: t.colors.surface, borderBottomWidth: 1, borderBottomColor: t.colors.border },
    backButton: { padding: t.spacing.xs, marginRight: t.spacing.sm },
    title: { flex: 1, fontSize: t.typography.fontSize.xl, fontFamily: t.typography.fontFamily.bold, color: t.colors.text },
    addButton: { padding: t.spacing.xs },
    list: { padding: t.spacing.md },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  }));

  if (isLoading) {
    return <SafeAreaView style={styles.container}><View style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.colors.primary} /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Addresses</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddAddress')}>
          <Icon name="plus" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {!addresses || addresses.length === 0 ? (
        <EmptyState icon="map-pin" title="No addresses" description="Add your delivery address" actionLabel="Add Address" onAction={() => navigation.navigate('AddAddress')} />
      ) : (
        <FlatList
          data={addresses}
          renderItem={({ item }) => (
            <AddressCard
              address={item}
              onEdit={() => navigation.navigate('EditAddress', { addressId: item.id })}
              onDelete={() => Alert.alert('Delete Address', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteAddressMutation.mutate(item.id) },
              ])}
              onSetDefault={() => setDefaultMutation.mutate(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default AddressesScreen;
`,
    };
  }

  private generateSearchScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/customer/SearchScreen.tsx',
      type: 'screen',
      content: `import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Feather';
import debounce from 'lodash/debounce';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { productsApi } from '@api/products';
import { ProductCard } from '@components/ProductCard';

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const debouncedSearch = useCallback(
    debounce((text: string) => setDebouncedQuery(text), 500),
    []
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => productsApi.searchProducts(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const styles = useStyles((t) => ({
    container: { flex: 1, backgroundColor: t.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: t.spacing.md, backgroundColor: t.colors.surface, borderBottomWidth: 1, borderBottomColor: t.colors.border },
    backButton: { padding: t.spacing.xs, marginRight: t.spacing.sm },
    searchInput: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: t.colors.input, borderRadius: t.borderRadius.md, paddingHorizontal: t.spacing.md },
    input: { flex: 1, paddingVertical: t.spacing.sm, fontSize: t.typography.fontSize.md, color: t.colors.text },
    clearButton: { padding: t.spacing.xs },
    content: { flex: 1, padding: t.spacing.md },
    emptyText: { textAlign: 'center', color: t.colors.textSecondary, marginTop: t.spacing.xxl },
    resultCount: { fontSize: t.typography.fontSize.sm, color: t.colors.textSecondary, marginBottom: t.spacing.md },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.searchInput}>
          <Icon name="search" size={20} color={theme.colors.placeholder} />
          <TextInput
            style={styles.input}
            placeholder="Search products..."
            placeholderTextColor={theme.colors.placeholder}
            value={query}
            onChangeText={handleQueryChange}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => { setQuery(''); setDebouncedQuery(''); }}>
              <Icon name="x" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}><ActivityIndicator color={theme.colors.primary} /></View>
        ) : debouncedQuery.length < 2 ? (
          <Text style={styles.emptyText}>Type at least 2 characters to search</Text>
        ) : results?.data?.length === 0 ? (
          <Text style={styles.emptyText}>No products found for "{debouncedQuery}"</Text>
        ) : (
          <>
            <Text style={styles.resultCount}>{results?.total || 0} results</Text>
            <FlatList
              data={results?.data}
              renderItem={({ item }) => (
                <ProductCard product={item} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} style={{ width: '48%', marginBottom: theme.spacing.md }} />
              )}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;
`,
    };
  }

  private generateScreensIndex(appType: string): GeneratedFile {
    const isCustomer = appType === 'customer';

    return {
      path: `src/screens/${isCustomer ? 'customer' : 'delivery'}/index.ts`,
      type: 'screen',
      content: isCustomer
        ? `// Customer Screens
export { HomeScreen } from './HomeScreen';
export { ProductsScreen } from './ProductsScreen';
export { ProductDetailScreen } from './ProductDetailScreen';
export { CategoriesScreen } from './CategoriesScreen';
export { CartScreen } from './CartScreen';
export { CheckoutScreen } from './CheckoutScreen';
export { WishlistScreen } from './WishlistScreen';
export { OrdersScreen } from './OrdersScreen';
export { OrderDetailScreen } from './OrderDetailScreen';
export { ProfileScreen } from './ProfileScreen';
export { SettingsScreen } from './SettingsScreen';
export { NotificationsScreen } from './NotificationsScreen';
export { AddressesScreen } from './AddressesScreen';
export { SearchScreen } from './SearchScreen';
`
        : `// Delivery Screens
export { DashboardScreen } from './DashboardScreen';
export { ActiveDeliveriesScreen } from './ActiveDeliveriesScreen';
export { DeliveryDetailScreen } from './DeliveryDetailScreen';
export { RouteMapScreen } from './RouteMapScreen';
export { EarningsScreen } from './EarningsScreen';
export { DeliveryHistoryScreen } from './DeliveryHistoryScreen';
export { ProfileScreen } from './ProfileScreen';
export { SettingsScreen } from './SettingsScreen';
`,
    };
  }
}

/**
 * VASTY PRODUCT COMPONENTS - USAGE EXAMPLES
 *
 * This file demonstrates how to use the ProductCard and ProductGrid components
 * with various configurations and variants.
 */

import * as React from 'react';
import {
  ProductCard,
  ProductGrid,
  PopularProductsGrid,
  FeaturedProductsGrid,
  TodaysForYouGrid,
  FlashSaleGrid,
} from './index';
import type { Product } from '@/types';

// ============================================================================
// EXAMPLE 1: Standard Product Card
// ============================================================================
export const StandardProductCardExample = () => {
  const sampleProduct: Product = {
    id: '1',
    name: 'Classic Cotton T-Shirt',
    brand: 'VASTY',
    price: 29.99,
    salePrice: 19.99,
    discountPercent: 33,
    images: ['/products/tshirt-1.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.8,
    category: 'T-SHIRT',
    colors: ['#000000', '#FFFFFF', '#3B82F6', '#EF4444'],
  };

  const handleWishlistToggle = (productId: string) => {
    console.log('Toggle wishlist for:', productId);
  };

  const handleAddToCart = (product: Product) => {
    console.log('Add to cart:', product);
  };

  return (
    <div className="max-w-xs">
      <ProductCard
        product={sampleProduct}
        variant="standard"
        showQuickAdd={true}
        showRating={true}
        showBadges={true}
        onWishlistToggle={handleWishlistToggle}
        onAddToCart={handleAddToCart}
        isWishlisted={false}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 2: Flash Sale Product Card
// ============================================================================
export const FlashSaleProductCardExample = () => {
  const flashSaleProduct: Product = {
    id: '2',
    name: 'Limited Edition Sneakers',
    brand: 'NIKE',
    price: 159.99,
    salePrice: 99.99,
    discountPercent: 37,
    images: ['/products/sneakers-1.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.9,
    category: 'SHOES',
  };

  // Flash sale ends in 2 hours
  const flashSaleEndTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

  return (
    <div className="max-w-xs">
      <ProductCard
        product={flashSaleProduct}
        variant="flash-sale"
        showQuickAdd={true}
        showRating={true}
        showBadges={true}
        flashSale={{
          endTime: flashSaleEndTime,
          soldCount: 9,
          totalStock: 10,
        }}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 3: Featured Products Grid with Filters
// ============================================================================
export const FeaturedProductsExample = () => {
  const [products] = React.useState<Product[]>([
    {
      id: '1',
      name: 'Summer Floral Dress',
      brand: 'ZARA',
      price: 89.99,
      salePrice: 69.99,
      discountPercent: 22,
      images: ['/products/dress-1.jpg'],
      sizes: ['S', 'M', 'L'],
      rating: 4.7,
      category: 'WOMAN',
      colors: ['#FFC0CB', '#87CEEB', '#98FB98'],
    },
    {
      id: '2',
      name: 'Kids Denim Shorts',
      brand: 'GAP',
      price: 39.99,
      images: ['/products/shorts-1.jpg'],
      sizes: ['XS', 'S', 'M'],
      rating: 4.5,
      category: 'CHILDREN',
    },
    {
      id: '3',
      name: 'Leather Jacket',
      brand: 'LEVI\'S',
      price: 249.99,
      salePrice: 199.99,
      images: ['/products/jacket-1.jpg'],
      sizes: ['M', 'L', 'XL'],
      rating: 4.9,
      category: 'JACKETS',
    },
    // Add more products...
  ]);

  const [wishlistedProducts, setWishlistedProducts] = React.useState<string[]>([]);

  const handleWishlistToggle = (productId: string) => {
    setWishlistedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddToCart = (product: Product) => {
    console.log('Adding to cart:', product);
    // Your cart logic here
  };

  const handleFilterChange = (filter: string) => {
    // Filter products based on category
    // This is a simplified example
    console.log('Filter changed to:', filter);
  };

  const handleSeeAll = () => {
    console.log('Navigate to all products page');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <FeaturedProductsGrid
        products={products}
        showSeeAll={true}
        onSeeAllClick={handleSeeAll}
        onFilterChange={handleFilterChange}
        onWishlistToggle={handleWishlistToggle}
        onAddToCart={handleAddToCart}
        wishlistedProducts={wishlistedProducts}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 4: Popular Products Grid (No Filters)
// ============================================================================
export const PopularProductsExample = () => {
  const popularProducts: Product[] = [
    {
      id: '1',
      name: 'Classic White Sneakers',
      brand: 'ADIDAS',
      price: 79.99,
      images: ['/products/sneakers-white.jpg'],
      sizes: ['S', 'M', 'L', 'XL'],
      rating: 4.8,
      category: 'SHOES',
    },
    {
      id: '2',
      name: 'Slim Fit Jeans',
      brand: 'LEVI\'S',
      price: 99.99,
      salePrice: 79.99,
      images: ['/products/jeans-1.jpg'],
      sizes: ['S', 'M', 'L', 'XL'],
      rating: 4.6,
      category: 'WOMAN',
    },
    // Add more products...
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PopularProductsGrid
        products={popularProducts}
        showQuickAdd={true}
        showRating={true}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 5: Flash Sale Grid
// ============================================================================
export const FlashSaleExample = () => {
  const flashSaleProducts: Product[] = [
    {
      id: '1',
      name: 'Designer Sunglasses',
      brand: 'RAY-BAN',
      price: 199.99,
      salePrice: 99.99,
      discountPercent: 50,
      images: ['/products/sunglasses-1.jpg'],
      sizes: ['M'],
      rating: 4.9,
      category: 'ACCESSORIES',
    },
    // Add more flash sale products...
  ];

  // Flash sale configuration
  const flashSaleConfig = {
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // Ends in 3 hours
    getSoldCount: () => {
      // Mock data - replace with actual API call
      return 8;
    },
    getTotalStock: () => {
      // Mock data - replace with actual API call
      return 10;
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <FlashSaleGrid
        products={flashSaleProducts}
        flashSaleConfig={flashSaleConfig}
        showQuickAdd={true}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 6: Today's For You Grid (5 Columns)
// ============================================================================
export const TodaysForYouExample = () => {
  const recommendedProducts: Product[] = [
    // ... products based on user preferences
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <TodaysForYouGrid
        products={recommendedProducts}
        showQuickAdd={true}
        showRating={true}
        showBadges={true}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 7: Custom Grid Configuration
// ============================================================================
export const CustomGridExample = () => {
  const products: Product[] = [
    // Your products...
  ];

  const customFilters = ['ALL', 'NEW ARRIVALS', 'BESTSELLERS', 'ON SALE'];

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductGrid
        products={products}
        title="Custom Collection"
        showSeeAll={true}
        showFilters={true}
        filters={customFilters}
        defaultFilter="ALL"
        columns={3}
        variant="standard"
        showQuickAdd={true}
        showRating={true}
        showBadges={true}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 8: Compact 2-Column Grid (Mobile-First)
// ============================================================================
export const CompactGridExample = () => {
  const products: Product[] = [
    // Your products...
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductGrid
        products={products}
        title="Quick Browse"
        columns={2}
        variant="compact"
        showQuickAdd={false}
        showRating={true}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 9: Complete Page Example with Multiple Grids
// ============================================================================
export const CompleteProductPage = () => {
  const [wishlistedProducts, setWishlistedProducts] = React.useState<string[]>([]);

  const handleWishlistToggle = (productId: string) => {
    setWishlistedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddToCart = (product: Product) => {
    console.log('Adding to cart:', product);
  };

  const handleProductClick = (product: Product) => {
    console.log('Navigate to product:', product.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Flash Sale Section */}
        <FlashSaleGrid
          products={[/* flash sale products */]}
          flashSaleConfig={{
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
            getSoldCount: () => 9,
            getTotalStock: () => 10,
          }}
          onWishlistToggle={handleWishlistToggle}
          onAddToCart={handleAddToCart}
          onProductClick={handleProductClick}
          wishlistedProducts={wishlistedProducts}
        />

        {/* Featured Products with Filters */}
        <FeaturedProductsGrid
          products={[/* featured products */]}
          onWishlistToggle={handleWishlistToggle}
          onAddToCart={handleAddToCart}
          onProductClick={handleProductClick}
          wishlistedProducts={wishlistedProducts}
        />

        {/* Popular Products */}
        <PopularProductsGrid
          products={[/* popular products */]}
          onWishlistToggle={handleWishlistToggle}
          onAddToCart={handleAddToCart}
          onProductClick={handleProductClick}
          wishlistedProducts={wishlistedProducts}
        />

        {/* Today's For You */}
        <TodaysForYouGrid
          products={[/* recommended products */]}
          onWishlistToggle={handleWishlistToggle}
          onAddToCart={handleAddToCart}
          onProductClick={handleProductClick}
          wishlistedProducts={wishlistedProducts}
        />
      </div>
    </div>
  );
};

export default {
  StandardProductCardExample,
  FlashSaleProductCardExample,
  FeaturedProductsExample,
  PopularProductsExample,
  FlashSaleExample,
  TodaysForYouExample,
  CustomGridExample,
  CompactGridExample,
  CompleteProductPage,
};

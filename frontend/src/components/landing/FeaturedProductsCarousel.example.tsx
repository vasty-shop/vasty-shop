/**
 * FeaturedProductsCarousel Component - Usage Examples
 *
 * This file demonstrates various ways to use the FeaturedProductsCarousel component.
 */

import React, { useState } from 'react';
import { FeaturedProductsCarousel } from './FeaturedProductsCarousel';
import type { Product } from '@/types';
import { toast } from 'sonner';

/**
 * Example 1: Basic Usage
 * Simplest implementation with no event handlers
 */
export const BasicExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <FeaturedProductsCarousel />
    </div>
  );
};

/**
 * Example 2: With Wishlist State
 * Manages wishlist state locally
 */
export const WishlistExample: React.FC = () => {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const handleWishlistToggle = (productId: string) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
        console.log(`Removed ${productId} from wishlist`);
      } else {
        newSet.add(productId);
        console.log(`Added ${productId} to wishlist`);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <FeaturedProductsCarousel
        wishlistedProducts={wishlist}
        onWishlistToggle={handleWishlistToggle}
      />

      {/* Display wishlist count */}
      <div className="container mx-auto px-4 mt-8">
        <p className="text-center text-gray-600">
          Wishlist items: {wishlist.size}
        </p>
      </div>
    </div>
  );
};

/**
 * Example 3: With Toast Notifications
 * Shows success messages using Sonner toast
 */
export const ToastExample: React.FC = () => {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const handleWishlistToggle = (productId: string) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      const isAdding = !newSet.has(productId);

      if (isAdding) {
        newSet.add(productId);
        toast.success('Added to wishlist!', {
          description: 'You can view your wishlist anytime.',
        });
      } else {
        newSet.delete(productId);
        toast.success('Removed from wishlist!');
      }

      return newSet;
    });
  };

  const handleAddToCart = (product: Product) => {
    toast.success(`${product.name} added to cart!`, {
      description: `Price: $${product.price.toFixed(2)}`,
    });
    console.log('Adding to cart:', product);
  };

  const handleQuickView = (product: Product) => {
    toast.info(`Quick view: ${product.name}`);
    console.log('Quick view:', product);
  };

  return (
    <div className="min-h-screen bg-white">
      <FeaturedProductsCarousel
        wishlistedProducts={wishlist}
        onWishlistToggle={handleWishlistToggle}
        onAddToCart={handleAddToCart}
        onQuickView={handleQuickView}
      />
    </div>
  );
};

/**
 * Example 4: With Navigation
 * Integrates with React Router for navigation
 */
export const NavigationExample: React.FC = () => {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const handleSeeAll = () => {
    console.log('Navigating to featured products page');
    // In a real app: navigate('/products/featured')
    toast.info('Navigating to Featured Products...');
  };

  const handleWishlistToggle = (productId: string) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleAddToCart = (product: Product) => {
    console.log('Adding to cart:', product);
    toast.success('Added to cart!');
  };

  const handleQuickView = (product: Product) => {
    console.log('Opening quick view for:', product.name);
    // In a real app: Open modal or navigate to product page
  };

  return (
    <div className="min-h-screen bg-white">
      <FeaturedProductsCarousel
        wishlistedProducts={wishlist}
        onWishlistToggle={handleWishlistToggle}
        onAddToCart={handleAddToCart}
        onQuickView={handleQuickView}
        onSeeAll={handleSeeAll}
      />
    </div>
  );
};

/**
 * Example 5: Full Featured Implementation
 * Complete implementation with all features
 */
export const FullFeaturedExample: React.FC = () => {
  const [wishlist, setWishlist] = useState<Set<string>>(
    new Set(['airpods-1', 'cap-1']) // Pre-populate wishlist
  );
  const [cart, setCart] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const handleWishlistToggle = (productId: string) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      const isAdding = !newSet.has(productId);

      if (isAdding) {
        newSet.add(productId);
        toast.success('Added to wishlist!', {
          description: 'You can view your wishlist anytime.',
          action: {
            label: 'View',
            onClick: () => console.log('Navigate to wishlist'),
          },
        });
      } else {
        newSet.delete(productId);
        toast.success('Removed from wishlist!');
      }

      return newSet;
    });
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => [...prev, product]);
    toast.success(`${product.name} added to cart!`, {
      description: `Price: $${product.price.toFixed(2)}`,
      action: {
        label: 'View Cart',
        onClick: () => console.log('Navigate to cart'),
      },
    });
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    toast.info(`Quick view: ${product.name}`);
    // In a real app, you would open a modal here
  };

  const handleSeeAll = () => {
    console.log('Navigating to featured products page');
    toast.info('Navigating to Featured Products...');
    // In a real app: navigate('/products/featured')
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Stats Bar */}
      <div className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4 flex justify-center gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold">{cart.length}</p>
            <p className="text-sm opacity-90">Cart Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{wishlist.size}</p>
            <p className="text-sm opacity-90">Wishlist Items</p>
          </div>
        </div>
      </div>

      {/* Featured Products Carousel */}
      <FeaturedProductsCarousel
        wishlistedProducts={wishlist}
        onWishlistToggle={handleWishlistToggle}
        onAddToCart={handleAddToCart}
        onQuickView={handleQuickView}
        onSeeAll={handleSeeAll}
        className="bg-white"
      />

      {/* Quick View Display (Placeholder) */}
      {quickViewProduct && (
        <div className="container mx-auto px-4 mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-2">Quick View</h3>
            <p className="text-gray-600">
              Product: {quickViewProduct.name}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => setQuickViewProduct(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Cart Display */}
      {cart.length > 0 && (
        <div className="container mx-auto px-4 mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Shopping Cart</h3>
            <div className="space-y-2">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span>{item.name}</span>
                  <span className="font-semibold text-red-500">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="font-bold">Total:</span>
              <span className="text-xl font-bold text-red-500">
                ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Example 6: Custom Styling
 * Shows how to customize the appearance
 */
export const CustomStylingExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <FeaturedProductsCarousel className="bg-white/80 backdrop-blur-sm py-16" />
    </div>
  );
};

/**
 * Example 7: Multiple Carousels
 * Multiple carousels on the same page
 */
export const MultipleCarouselsExample: React.FC = () => {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const handleWishlistToggle = (productId: string) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to Our Store
          </h1>
          <p className="text-xl opacity-90">
            Discover amazing products at great prices
          </p>
        </div>
      </div>

      {/* First Carousel */}
      <FeaturedProductsCarousel
        wishlistedProducts={wishlist}
        onWishlistToggle={handleWishlistToggle}
        className="bg-white"
      />

      {/* Divider */}
      <div className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="h-px bg-gray-200" />
        </div>
      </div>

      {/* Second Carousel (could be different products) */}
      <FeaturedProductsCarousel
        wishlistedProducts={wishlist}
        onWishlistToggle={handleWishlistToggle}
        className="bg-white"
      />
    </div>
  );
};

/**
 * Default Export: Demo Page with All Examples
 */
const FeaturedProductsCarouselDemo: React.FC = () => {
  const [activeExample, setActiveExample] = useState<string>('full');

  const examples = [
    { id: 'basic', label: 'Basic', component: BasicExample },
    { id: 'wishlist', label: 'Wishlist', component: WishlistExample },
    { id: 'toast', label: 'Toast', component: ToastExample },
    { id: 'navigation', label: 'Navigation', component: NavigationExample },
    { id: 'full', label: 'Full Featured', component: FullFeaturedExample },
    { id: 'custom', label: 'Custom Style', component: CustomStylingExample },
    { id: 'multiple', label: 'Multiple', component: MultipleCarouselsExample },
  ];

  const ActiveComponent =
    examples.find((ex) => ex.id === activeExample)?.component || FullFeaturedExample;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Example Selector */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">
            FeaturedProductsCarousel Examples
          </h1>
          <div className="flex gap-2 overflow-x-auto">
            {examples.map((example) => (
              <button
                key={example.id}
                onClick={() => setActiveExample(example.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeExample === example.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Example */}
      <ActiveComponent />
    </div>
  );
};

export default FeaturedProductsCarouselDemo;

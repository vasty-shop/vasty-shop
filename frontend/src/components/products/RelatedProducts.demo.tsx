/**
 * RelatedProducts Demo Page
 *
 * A simple demo page to preview all RelatedProducts variants.
 * Import this component in your routing to see the component in action.
 *
 * Usage:
 * import { RelatedProductsDemo } from '@/components/products/RelatedProducts.demo';
 *
 * Add to your routes:
 * <Route path="/demo/related-products" element={<RelatedProductsDemo />} />
 */

import * as React from 'react';
import { RelatedProducts } from './RelatedProducts';
import type { Product } from '@/types';

// Demo product data
const demoCurrentProduct: Product = {
  id: 'demo-main',
  name: 'Premium Denim Jacket',
  brand: 'VASTY',
  price: 199,
  salePrice: 159,
  discountPercent: 20,
  images: ['/images/products/denim-jacket.jpg'],
  sizes: ['S', 'M', 'L', 'XL'],
  rating: 4.5,
  category: 'Jackets',
  colors: ['#1E3A8A', '#000000', '#9CA3AF'],
};

const demoProducts: Product[] = [
  {
    id: 'demo-1',
    name: 'Polo with Contrast Trims',
    brand: 'VASTY',
    price: 242,
    salePrice: 212,
    discountPercent: 20,
    images: ['/images/products/polo-contrast.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.0,
    category: 'Shirts',
    colors: ['#000000', '#FFFFFF', '#1E40AF'],
  },
  {
    id: 'demo-2',
    name: 'Gradient Graphic T-shirt',
    brand: 'VASTY',
    price: 145,
    images: ['/images/products/gradient-tshirt.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 3.5,
    category: 'T-Shirts',
    colors: ['#6B7280', '#EC4899', '#8B5CF6'],
  },
  {
    id: 'demo-3',
    name: 'Polo with Tipping Details',
    brand: 'VASTY',
    price: 180,
    images: ['/images/products/polo-tipping.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.5,
    category: 'Shirts',
    colors: ['#DC2626', '#059669', '#000000'],
  },
  {
    id: 'demo-4',
    name: 'Striped Jacket',
    brand: 'VASTY',
    price: 150,
    salePrice: 120,
    discountPercent: 30,
    images: ['/images/products/striped-jacket.jpg'],
    sizes: ['M', 'L', 'XL'],
    rating: 4.2,
    category: 'Jackets',
    colors: ['#1F2937', '#F59E0B'],
  },
  {
    id: 'demo-5',
    name: 'Cotton Crew Neck T-shirt',
    brand: 'VASTY',
    price: 89,
    salePrice: 69,
    discountPercent: 22,
    images: ['/images/products/crew-neck.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.3,
    category: 'T-Shirts',
    colors: ['#000000', '#FFFFFF', '#DC2626', '#059669'],
  },
  {
    id: 'demo-6',
    name: 'Casual Sneakers',
    brand: 'VASTY',
    price: 199,
    salePrice: 159,
    discountPercent: 20,
    images: ['/images/products/sneakers.jpg'],
    sizes: ['M', 'L', 'XL'],
    rating: 4.4,
    category: 'Shoes',
    colors: ['#FFFFFF', '#000000'],
  },
  {
    id: 'demo-7',
    name: 'Leather Belt',
    brand: 'VASTY',
    price: 59,
    images: ['/images/products/leather-belt.jpg'],
    sizes: ['S', 'M', 'L'],
    rating: 4.7,
    category: 'Accessories',
    colors: ['#78716C', '#000000'],
  },
  {
    id: 'demo-8',
    name: 'Classic White T-shirt',
    brand: 'VASTY',
    price: 49,
    salePrice: 39,
    discountPercent: 20,
    images: ['/images/products/white-tshirt.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.6,
    category: 'T-Shirts',
    colors: ['#FFFFFF', '#000000', '#6B7280'],
  },
];

export const RelatedProductsDemo: React.FC = () => {
  const [wishlistedProducts, setWishlistedProducts] = React.useState<Set<string>>(
    new Set(['demo-2', 'demo-5'])
  );
  const [activeVariant, setActiveVariant] = React.useState<string>('you-might-like');

  const handleWishlistToggle = (productId: string) => {
    setWishlistedProducts((prev) => {
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
    alert(`Added "${product.name}" to cart!`);
  };

  const handleQuickView = (product: Product) => {
    console.log('Quick view:', product);
    alert(`Quick view: ${product.name}`);
  };

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product);
    alert(`Navigating to: ${product.name}`);
  };

  const variants = [
    { id: 'you-might-like', label: 'You Might Also Like' },
    { id: 'frequently-bought', label: 'Frequently Bought Together' },
    { id: 'recently-viewed', label: 'Recently Viewed' },
    { id: 'complete-look', label: 'Complete the Look' },
    { id: 'customers-viewed', label: 'Customers Also Viewed' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            RelatedProducts Component Demo
          </h1>
          <p className="text-gray-600">
            Preview all variants and features of the RelatedProducts component
          </p>
        </div>
      </div>

      {/* Variant Selector */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Select Variant:
            </span>
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setActiveVariant(variant.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeVariant === variant.id
                    ? 'bg-primary-lime text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Component Preview */}
      <div className="py-8">
        {activeVariant === 'you-might-like' && (
          <RelatedProducts
            variant="you-might-like"
            products={demoProducts}
            onWishlistToggle={handleWishlistToggle}
            onAddToCart={handleAddToCart}
            onQuickView={handleQuickView}
            onProductClick={handleProductClick}
            wishlistedProducts={wishlistedProducts}
            enableQuickAdd={true}
            enableColorSelector={true}
            enableSizeSelector={true}
            showCarouselControls={true}
          />
        )}

        {activeVariant === 'frequently-bought' && (
          <RelatedProducts
            variant="frequently-bought"
            currentProduct={demoCurrentProduct}
            products={demoProducts.slice(0, 3)}
            onWishlistToggle={handleWishlistToggle}
            onAddToCart={handleAddToCart}
            wishlistedProducts={wishlistedProducts}
          />
        )}

        {activeVariant === 'recently-viewed' && (
          <RelatedProducts
            variant="recently-viewed"
            products={demoProducts.slice(0, 6)}
            onWishlistToggle={handleWishlistToggle}
            onAddToCart={handleAddToCart}
            onQuickView={handleQuickView}
            onProductClick={handleProductClick}
            wishlistedProducts={wishlistedProducts}
            enableQuickAdd={true}
            showCarouselControls={true}
          />
        )}

        {activeVariant === 'complete-look' && (
          <RelatedProducts
            variant="complete-look"
            products={demoProducts.slice(0, 4)}
            onWishlistToggle={handleWishlistToggle}
            onAddToCart={handleAddToCart}
            onQuickView={handleQuickView}
            onProductClick={handleProductClick}
            wishlistedProducts={wishlistedProducts}
            enableQuickAdd={true}
            enableColorSelector={true}
            showCarouselControls={false}
          />
        )}

        {activeVariant === 'customers-viewed' && (
          <RelatedProducts
            variant="customers-viewed"
            products={demoProducts}
            onWishlistToggle={handleWishlistToggle}
            onAddToCart={handleAddToCart}
            onQuickView={handleQuickView}
            onProductClick={handleProductClick}
            wishlistedProducts={wishlistedProducts}
            enableQuickAdd={true}
            showCarouselControls={true}
          />
        )}
      </div>

      {/* Info Panel */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Current Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Active Variant</h3>
              <p className="text-gray-600">
                {variants.find((v) => v.id === activeVariant)?.label}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Wishlisted Products</h3>
              <p className="text-gray-600">{wishlistedProducts.size} products</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Total Products</h3>
              <p className="text-gray-600">{demoProducts.length} products</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Features Enabled</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Quick Add to Cart</li>
                <li>✅ Color Selector (on hover)</li>
                <li>✅ Size Selector (on hover)</li>
                <li>✅ Wishlist Toggle</li>
                <li>✅ Quick View</li>
                <li>✅ Carousel Controls</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Hover over product cards to see interactive elements</li>
              <li>• Click the heart icon to toggle wishlist</li>
              <li>• Try the carousel navigation arrows on desktop</li>
              <li>• Test horizontal scrolling on mobile</li>
              <li>• Check console for event logs</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">📚 Documentation</h3>
            <p className="text-sm text-green-800 mb-2">
              For implementation details, see:
            </p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• <code className="bg-green-100 px-2 py-0.5 rounded">RELATED_PRODUCTS_GUIDE.md</code> - Quick start</li>
              <li>• <code className="bg-green-100 px-2 py-0.5 rounded">RelatedProducts.md</code> - Full docs</li>
              <li>• <code className="bg-green-100 px-2 py-0.5 rounded">RelatedProducts.example.tsx</code> - Code examples</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default RelatedProductsDemo;

import * as React from 'react';
import { RelatedProducts } from './RelatedProducts';
import type { Product } from '@/types';

/**
 * Example usage of the RelatedProducts component
 * This file demonstrates all the different variants and configurations
 */

// Example product data
const exampleCurrentProduct: Product = {
  id: 'current-1',
  name: 'Classic Denim Jacket',
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

const exampleRelatedProducts: Product[] = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
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
    id: '5',
    name: 'Cotton Crew Neck T-shirt',
    brand: 'VASTY',
    price: 89,
    salePrice: 69,
    images: ['/images/products/crew-neck.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.3,
    category: 'T-Shirts',
    colors: ['#000000', '#FFFFFF', '#DC2626', '#059669'],
  },
  {
    id: '6',
    name: 'Slim Fit Chinos',
    brand: 'VASTY',
    price: 129,
    images: ['/images/products/chinos.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.6,
    category: 'Pants',
    colors: ['#78716C', '#000000', '#1E40AF'],
  },
  {
    id: '7',
    name: 'Casual Sneakers',
    brand: 'VASTY',
    price: 199,
    salePrice: 159,
    images: ['/images/products/sneakers.jpg'],
    sizes: ['M', 'L', 'XL'],
    rating: 4.4,
    category: 'Shoes',
    colors: ['#FFFFFF', '#000000'],
  },
  {
    id: '8',
    name: 'Leather Belt',
    brand: 'VASTY',
    price: 59,
    images: ['/images/products/leather-belt.jpg'],
    sizes: ['S', 'M', 'L'],
    rating: 4.7,
    category: 'Accessories',
    colors: ['#78716C', '#000000'],
  },
];

export const RelatedProductsExample: React.FC = () => {
  const [wishlistedProducts, setWishlistedProducts] = React.useState<Set<string>>(
    new Set(['2', '5'])
  );

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
    // Add your cart logic here
  };

  const handleQuickView = (product: Product) => {
    console.log('Quick view:', product);
    // Open quick view modal
  };

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product);
    // Navigate to product page
  };

  return (
    <div className="space-y-16 bg-gray-50 py-12">
      {/* Example 1: You Might Also Like (Default) */}
      <div>
        <div className="container mx-auto px-4 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-900 mb-2">
              Example 1: You Might Also Like
            </h3>
            <p className="text-sm text-blue-700">
              Standard related products section with all features enabled. Shows similar
              products with quick add, color/size selectors on hover.
            </p>
          </div>
        </div>
        <RelatedProducts
          variant="you-might-like"
          products={exampleRelatedProducts}
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
      </div>

      {/* Example 2: Frequently Bought Together */}
      <div>
        <div className="container mx-auto px-4 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-900 mb-2">
              Example 2: Frequently Bought Together
            </h3>
            <p className="text-sm text-green-700">
              Bundle section with checkboxes. Customers can select multiple products and
              add them all to cart at once with a discount.
            </p>
          </div>
        </div>
        <RelatedProducts
          variant="frequently-bought"
          currentProduct={exampleCurrentProduct}
          products={exampleRelatedProducts.slice(0, 3)}
          onWishlistToggle={handleWishlistToggle}
          onAddToCart={handleAddToCart}
          wishlistedProducts={wishlistedProducts}
        />
      </div>

      {/* Example 3: Recently Viewed */}
      <div>
        <div className="container mx-auto px-4 mb-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-bold text-purple-900 mb-2">
              Example 3: Recently Viewed
            </h3>
            <p className="text-sm text-purple-700">
              Shows products the user has recently viewed. Great for helping customers
              continue their shopping journey.
            </p>
          </div>
        </div>
        <RelatedProducts
          variant="recently-viewed"
          products={exampleRelatedProducts.slice(0, 6)}
          onWishlistToggle={handleWishlistToggle}
          onAddToCart={handleAddToCart}
          onQuickView={handleQuickView}
          onProductClick={handleProductClick}
          wishlistedProducts={wishlistedProducts}
          enableQuickAdd={true}
          showCarouselControls={true}
        />
      </div>

      {/* Example 4: Complete the Look */}
      <div>
        <div className="container mx-auto px-4 mb-4">
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <h3 className="font-bold text-pink-900 mb-2">
              Example 4: Complete the Look
            </h3>
            <p className="text-sm text-pink-700">
              Outfit suggestions that complement the current product. Perfect for
              cross-selling accessories and complementary items.
            </p>
          </div>
        </div>
        <RelatedProducts
          variant="complete-look"
          products={exampleRelatedProducts.slice(0, 4)}
          onWishlistToggle={handleWishlistToggle}
          onAddToCart={handleAddToCart}
          onQuickView={handleQuickView}
          onProductClick={handleProductClick}
          wishlistedProducts={wishlistedProducts}
          enableQuickAdd={true}
          enableColorSelector={true}
          showCarouselControls={false} // Grid layout without carousel
        />
      </div>

      {/* Example 5: Customers Also Viewed */}
      <div>
        <div className="container mx-auto px-4 mb-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-bold text-orange-900 mb-2">
              Example 5: Customers Also Viewed
            </h3>
            <p className="text-sm text-orange-700">
              Alternative recommendations based on what other customers viewed. Great for
              product discovery and increasing conversion.
            </p>
          </div>
        </div>
        <RelatedProducts
          variant="customers-viewed"
          products={exampleRelatedProducts}
          onWishlistToggle={handleWishlistToggle}
          onAddToCart={handleAddToCart}
          onQuickView={handleQuickView}
          onProductClick={handleProductClick}
          wishlistedProducts={wishlistedProducts}
          enableQuickAdd={true}
          showCarouselControls={true}
        />
      </div>

      {/* Example 6: Minimal Configuration */}
      <div>
        <div className="container mx-auto px-4 mb-4">
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">
              Example 6: Minimal Configuration
            </h3>
            <p className="text-sm text-gray-700">
              Simple related products section with minimal features. No quick add, no
              selectors, just basic product cards.
            </p>
          </div>
        </div>
        <RelatedProducts
          products={exampleRelatedProducts.slice(0, 4)}
          onProductClick={handleProductClick}
          wishlistedProducts={wishlistedProducts}
          enableQuickAdd={false}
          enableColorSelector={false}
          enableSizeSelector={false}
          showCarouselControls={false}
        />
      </div>

      {/* Usage Notes */}
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Implementation Notes
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Basic Usage
              </h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {`<RelatedProducts
  products={relatedProducts}
  onWishlistToggle={handleWishlistToggle}
  onAddToCart={handleAddToCart}
  wishlistedProducts={wishlistedProducts}
/>`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                With All Features
              </h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {`<RelatedProducts
  variant="you-might-like"
  currentProduct={currentProduct}
  products={relatedProducts}
  onWishlistToggle={handleWishlistToggle}
  onAddToCart={handleAddToCart}
  onQuickView={handleQuickView}
  onProductClick={handleProductClick}
  wishlistedProducts={wishlistedProducts}
  enableQuickAdd={true}
  enableColorSelector={true}
  enableSizeSelector={true}
  showCarouselControls={true}
/>`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Available Variants
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">you-might-like</code>{' '}
                  - Standard related products section
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    frequently-bought
                  </code>{' '}
                  - Bundle section with checkboxes
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">recently-viewed</code>{' '}
                  - Products user has seen
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">complete-look</code> -
                  Outfit suggestions
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    customers-viewed
                  </code>{' '}
                  - Alternative recommendations
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Smart Recommendations Logic
              </h3>
              <p className="text-gray-700 mb-2">
                To implement smart recommendations in your application:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <strong>Same Category:</strong> Filter products by matching category
                </li>
                <li>
                  <strong>Similar Price Range:</strong> Products within ±20% of current
                  price
                </li>
                <li>
                  <strong>Frequently Bought Together:</strong> Use purchase history data
                </li>
                <li>
                  <strong>Recently Viewed:</strong> Store in localStorage or user session
                </li>
                <li>
                  <strong>Trending:</strong> Sort by sales count or view count
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Responsive Behavior
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <strong>Desktop:</strong> 4 products per row with carousel controls
                </li>
                <li>
                  <strong>Tablet:</strong> 3 products per row
                </li>
                <li>
                  <strong>Mobile:</strong> 2 products per row with horizontal scroll
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatedProductsExample;

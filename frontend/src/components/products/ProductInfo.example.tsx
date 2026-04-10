/**
 * ProductInfo Component - Usage Examples
 *
 * This file demonstrates various use cases of the ProductInfo component
 * including handling state, user interactions, and different configurations
 */

import * as React from 'react';
import { ProductInfo } from './ProductInfo';
import type { ProductInfoData, StockStatus } from './ProductInfo';
import type { Size } from '@/types/product';

// ============================================================================
// Example 1: Basic Usage with State Management
// ============================================================================

export function BasicProductInfoExample() {
  const [selectedSize, setSelectedSize] = React.useState<Size | undefined>();
  const [selectedColor, setSelectedColor] = React.useState<string | undefined>();
  const [quantity, setQuantity] = React.useState(1);
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  // Mock product data
  const productData: ProductInfoData = {
    product: {
      id: '1',
      name: 'Loose Fit Hoodie',
      brand: 'Urban Style',
      price: 49.99,
      salePrice: 24.99,
      discountPercent: 50,
      images: ['/images/hoodie-1.jpg', '/images/hoodie-2.jpg'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      rating: 4.5,
      category: 'Men Fashion',
      description: 'A comfortable loose fit hoodie perfect for casual wear. Made from premium cotton blend fabric.',
    },
    stockStatus: 'in_stock' as StockStatus,
    stockCount: 15,
    reviewCount: 80,
    deliveryInfo: {
      cutoffTime: new Date(new Date().getTime() + 3 * 60 * 60 * 1000), // 3 hours from now
      estimatedDeliveryStart: '10 October 2024',
      estimatedDeliveryEnd: '12 October 2024',
      deliveryDays: '3-4 Working Days',
      packageType: 'Regular Package',
    },
    colors: [
      { name: 'Black', hexCode: '#000000', available: true },
      { name: 'Navy', hexCode: '#1e3a8a', available: true },
      { name: 'Gray', hexCode: '#6b7280', available: true },
      { name: 'White', hexCode: '#ffffff', available: false },
    ],
    sizeAvailability: [
      { size: 'S', available: true, stockCount: 5 },
      { size: 'M', available: true, stockCount: 8 },
      { size: 'L', available: true, stockCount: 12 },
      { size: 'XL', available: true, stockCount: 7 },
      { size: 'XXL', available: false },
    ],
    materialInfo: {
      fabric: 'Premium Cotton Blend',
      composition: ['80% Cotton', '20% Polyester'],
      careInstructions: [
        'Machine wash cold',
        'Do not bleach',
        'Tumble dry low',
        'Iron on low heat if needed',
        'Do not dry clean',
      ],
    },
    fitInfo: {
      fit: 'Loose Fit',
      modelHeight: '6\'1" / 185 cm',
      modelSize: 'M',
      sizeGuideUrl: '/size-guide',
    },
    description: 'This loose fit hoodie is designed for maximum comfort and style. Perfect for layering or wearing on its own, it features a soft cotton blend fabric that feels great against your skin. The relaxed fit allows for easy movement while maintaining a stylish silhouette.',
  };

  const handleAddToCart = () => {
    console.log('Adding to cart:', {
      product: productData.product,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    alert(`Added ${quantity} ${selectedSize} ${selectedColor} hoodie(s) to cart!`);
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    console.log('Wishlist toggled:', !isWishlisted);
  };

  const handleShare = () => {
    console.log('Sharing product:', productData.product);
    if (navigator.share) {
      navigator.share({
        title: productData.product.name,
        text: `Check out this ${productData.product.name}!`,
        url: window.location.href,
      });
    } else {
      alert('Share functionality would copy link to clipboard');
    }
  };

  const handleBack = () => {
    console.log('Navigating back');
    // In real app: navigate(-1) or navigate('/products')
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ProductInfo
        data={productData}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        quantity={quantity}
        isWishlisted={isWishlisted}
        onSizeSelect={setSelectedSize}
        onColorSelect={setSelectedColor}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        onWishlistToggle={handleWishlistToggle}
        onShare={handleShare}
        onBack={handleBack}
      />
    </div>
  );
}

// ============================================================================
// Example 2: Low Stock Product
// ============================================================================

export function LowStockProductExample() {
  const [selectedSize, setSelectedSize] = React.useState<Size | undefined>();
  const [quantity, setQuantity] = React.useState(1);

  const productData: ProductInfoData = {
    product: {
      id: '2',
      name: 'Limited Edition Sneakers',
      brand: 'Sport Elite',
      price: 149.99,
      salePrice: 99.99,
      discountPercent: 33,
      images: ['/images/sneakers-1.jpg'],
      sizes: ['S', 'M', 'L', 'XL'],
      rating: 4.8,
      category: 'Footwear',
    },
    stockStatus: 'low_stock' as StockStatus,
    stockCount: 3,
    reviewCount: 156,
    deliveryInfo: {
      cutoffTime: new Date(new Date().getTime() + 45 * 60 * 1000), // 45 minutes from now
      estimatedDeliveryStart: '8 October 2024',
      estimatedDeliveryEnd: '10 October 2024',
      deliveryDays: '2-3 Working Days',
      packageType: 'Express Package',
    },
    sizeAvailability: [
      { size: 'S', available: false },
      { size: 'M', available: true, stockCount: 1 },
      { size: 'L', available: true, stockCount: 2 },
      { size: 'XL', available: false },
    ],
    description: 'Limited edition sneakers with premium materials and exclusive design.',
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ProductInfo
        data={productData}
        selectedSize={selectedSize}
        quantity={quantity}
        onSizeSelect={setSelectedSize}
        onQuantityChange={setQuantity}
        onAddToCart={() => alert('Added to cart!')}
      />
    </div>
  );
}

// ============================================================================
// Example 3: Out of Stock Product
// ============================================================================

export function OutOfStockProductExample() {
  const productData: ProductInfoData = {
    product: {
      id: '3',
      name: 'Vintage Denim Jacket',
      brand: 'Retro Wear',
      price: 89.99,
      images: ['/images/jacket-1.jpg'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      rating: 4.3,
      category: 'Jackets',
    },
    stockStatus: 'out_of_stock' as StockStatus,
    reviewCount: 45,
    deliveryInfo: {
      cutoffTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
      estimatedDeliveryStart: '15 October 2024',
      estimatedDeliveryEnd: '20 October 2024',
      deliveryDays: '5-7 Working Days',
      packageType: 'Standard Package',
    },
    sizeAvailability: [
      { size: 'S', available: false },
      { size: 'M', available: false },
      { size: 'L', available: false },
      { size: 'XL', available: false },
      { size: 'XXL', available: false },
    ],
    description: 'Classic vintage denim jacket. Currently out of stock but coming soon!',
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ProductInfo
        data={productData}
        onWishlistToggle={() => alert('Added to wishlist - we will notify you when back in stock!')}
      />
    </div>
  );
}

// ============================================================================
// Example 4: Product Without Colors
// ============================================================================

export function SimpleProductExample() {
  const [selectedSize, setSelectedSize] = React.useState<Size | undefined>();

  const productData: ProductInfoData = {
    product: {
      id: '4',
      name: 'Classic White T-Shirt',
      brand: 'Basics Co',
      price: 19.99,
      images: ['/images/tshirt-white.jpg'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      rating: 4.6,
      category: 'T-Shirts',
    },
    stockStatus: 'in_stock' as StockStatus,
    stockCount: 50,
    reviewCount: 234,
    deliveryInfo: {
      cutoffTime: new Date(new Date().getTime() + 4 * 60 * 60 * 1000),
      estimatedDeliveryStart: '9 October 2024',
      estimatedDeliveryEnd: '11 October 2024',
      deliveryDays: '2-3 Working Days',
      packageType: 'Regular Package',
    },
    // No colors array - component will hide color selector
    sizeAvailability: [
      { size: 'S', available: true },
      { size: 'M', available: true },
      { size: 'L', available: true },
      { size: 'XL', available: true },
      { size: 'XXL', available: true },
    ],
    materialInfo: {
      fabric: '100% Pure Cotton',
      composition: ['100% Cotton'],
      careInstructions: ['Machine wash warm', 'Tumble dry medium', 'Do not iron'],
    },
    description: 'Essential classic white t-shirt made from 100% pure cotton.',
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ProductInfo
        data={productData}
        selectedSize={selectedSize}
        onSizeSelect={setSelectedSize}
        onAddToCart={() => alert('Added to cart!')}
      />
    </div>
  );
}

// ============================================================================
// Example 5: Integration with React Router
// ============================================================================

export function ProductInfoWithRouterExample() {
  // In a real app, you would use:
  // const navigate = useNavigate();
  // const { productId } = useParams();
  // const { data, loading } = useProductQuery(productId);

  const [selectedSize, setSelectedSize] = React.useState<Size | undefined>();
  const [selectedColor, setSelectedColor] = React.useState<string | undefined>();
  const [quantity, setQuantity] = React.useState(1);
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  const productData: ProductInfoData = {
    product: {
      id: '5',
      name: 'Summer Floral Dress',
      brand: 'Fashion Forward',
      price: 79.99,
      salePrice: 59.99,
      discountPercent: 25,
      images: ['/images/dress-1.jpg'],
      sizes: ['S', 'M', 'L', 'XL'],
      rating: 4.7,
      category: 'Women Fashion',
    },
    stockStatus: 'in_stock' as StockStatus,
    stockCount: 25,
    reviewCount: 92,
    deliveryInfo: {
      cutoffTime: new Date(new Date().getTime() + 5 * 60 * 60 * 1000),
      estimatedDeliveryStart: '12 October 2024',
      estimatedDeliveryEnd: '14 October 2024',
      deliveryDays: '3-4 Working Days',
      packageType: 'Regular Package',
    },
    colors: [
      { name: 'Floral Blue', hexCode: '#4a90e2', available: true },
      { name: 'Floral Pink', hexCode: '#f5a3b9', available: true },
      { name: 'Floral Green', hexCode: '#95d5b2', available: true },
    ],
    sizeAvailability: [
      { size: 'S', available: true, stockCount: 8 },
      { size: 'M', available: true, stockCount: 10 },
      { size: 'L', available: true, stockCount: 5 },
      { size: 'XL', available: true, stockCount: 2 },
    ],
    fitInfo: {
      fit: 'Regular Fit',
      modelHeight: '5\'8" / 173 cm',
      modelSize: 'S',
    },
    description: 'Beautiful summer floral dress perfect for any occasion.',
  };

  const handleAddToCart = () => {
    // In real app: dispatch(addToCart({ product, size, color, quantity }))
    console.log('Adding to cart with router navigation');
    // navigate('/cart')
  };

  const handleBack = () => {
    // navigate(-1) or navigate('/products')
    console.log('Navigating back');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ProductInfo
        data={productData}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        quantity={quantity}
        isWishlisted={isWishlisted}
        onSizeSelect={setSelectedSize}
        onColorSelect={setSelectedColor}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        onWishlistToggle={() => setIsWishlisted(!isWishlisted)}
        onBack={handleBack}
      />
    </div>
  );
}

// ============================================================================
// Example 6: All Examples Showcase
// ============================================================================

export function AllProductInfoExamples() {
  const [activeExample, setActiveExample] = React.useState('basic');

  const examples = [
    { id: 'basic', name: 'Basic Product', component: BasicProductInfoExample },
    { id: 'low-stock', name: 'Low Stock', component: LowStockProductExample },
    { id: 'out-of-stock', name: 'Out of Stock', component: OutOfStockProductExample },
    { id: 'simple', name: 'No Colors', component: SimpleProductExample },
    { id: 'router', name: 'With Router', component: ProductInfoWithRouterExample },
  ];

  const ActiveComponent = examples.find((e) => e.id === activeExample)?.component || BasicProductInfoExample;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">ProductInfo Component Examples</h1>
        <p className="text-text-secondary mb-8">
          Explore different configurations and use cases
        </p>

        {/* Example Selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {examples.map((example) => (
            <button
              key={example.id}
              onClick={() => setActiveExample(example.id)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap',
                activeExample === example.id
                  ? 'bg-card-black text-white'
                  : 'bg-white text-text-primary hover:bg-gray-100'
              )}
            >
              {example.name}
            </button>
          ))}
        </div>

        {/* Active Example */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}

// Helper function (would normally be imported from utils)
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default AllProductInfoExamples;

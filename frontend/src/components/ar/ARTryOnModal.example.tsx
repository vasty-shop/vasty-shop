import React, { useState } from 'react';
import { ARTryOnModal } from './ARTryOnModal';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';

// Example product data
const exampleProduct: Product = {
  id: '1',
  name: 'Premium Cotton T-Shirt',
  brand: 'Vasty',
  price: 49.99,
  salePrice: 39.99,
  discountPercent: 20,
  images: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400',
  ],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  colors: ['#000000', '#FFFFFF', '#3B82F6', '#84CC16', '#EF4444'],
  rating: 4.5,
  category: 'T-Shirts',
  description: 'Premium quality cotton t-shirt perfect for everyday wear',
  characteristics: {
    Material: '100% Cotton',
    Fit: 'Regular',
    Care: 'Machine washable',
  },
};

export const ARTryOnModalExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (size: string, color?: string) => {
    console.log('Adding to cart:', { product: exampleProduct.name, size, color });
    alert(`Added ${exampleProduct.name} (Size: ${size}${color ? `, Color: ${color}` : ''}) to cart!`);
  };

  return (
    <div className="min-h-screen bg-cloud-gradient flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-card shadow-card p-8 text-center">
        <h1 className="text-h2 text-text-primary mb-4">AR Try-On Demo</h1>
        <p className="text-body text-text-secondary mb-6">
          Click the button below to open the AR try-on experience
        </p>

        <Button
          size="lg"
          onClick={() => setIsModalOpen(true)}
          className="w-full"
        >
          Try On with AR
        </Button>

        <div className="mt-6 text-left">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Features:</h3>
          <ul className="text-xs text-text-secondary space-y-1">
            <li>Full-screen AR experience</li>
            <li>Camera placeholder (real AR coming soon)</li>
            <li>Size and color selection</li>
            <li>Capture and share functionality</li>
            <li>Smooth animations</li>
            <li>Keyboard navigation (Esc to close)</li>
            <li>Auto-hiding instructions</li>
            <li>Glassmorphism design</li>
          </ul>
        </div>
      </div>

      <ARTryOnModal
        isOpen={isModalOpen}
        product={exampleProduct}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default ARTryOnModalExample;

import React, { useState } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ARTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    brand: string;
    images: string[];
    price: number;
    salePrice?: number;
  };
  selectedSize?: string;
  selectedColor?: string;
  onAddToCart: () => void;
}

export const ARTryOnModal: React.FC<ARTryOnModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedSize,
  selectedColor,
  onAddToCart,
}) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    onAddToCart();
    setTimeout(() => {
      setIsAddingToCart(false);
      onClose();
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={onClose}
        >
          {/* AR Camera View */}
          <div className="relative h-full w-full bg-gradient-to-b from-gray-900 to-black">
            {/* Mock camera feed */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="w-32 h-32 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                  <div className="w-24 h-24 bg-primary-lime/30 rounded-full animate-pulse" />
                </div>
                <h2 className="text-2xl text-white font-bold">AR Try-On</h2>
                <p className="text-base text-white/80">
                  In a production app, this would show live camera feed with AR overlay
                </p>
                <p className="text-sm text-white/60">
                  Powered by MediaPipe or ARKit/ARCore
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
              <button
                onClick={onClose}
                className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Product Overlay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-32 left-4 right-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white truncate">{product.name}</h3>
                  <p className="text-sm text-white/80">{product.brand}</p>
                  {selectedSize && (
                    <p className="text-sm text-white/70 mt-1">
                      Size: {selectedSize}
                      {selectedColor && ` • ${selectedColor}`}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Bottom Actions */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-3" onClick={(e) => e.stopPropagation()}>
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={cn(
                  'flex-1 shadow-lg bg-primary-lime hover:bg-primary-lime-dark text-white',
                  isAddingToCart && 'opacity-70'
                )}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

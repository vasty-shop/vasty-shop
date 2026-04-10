import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  Video,
  Share2,
  ShoppingCart,
  Info,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Product, Size } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ARTryOnModalProps {
  isOpen: boolean;
  product: Product;
  onClose: () => void;
  onAddToCart: (size: Size, color?: string) => void;
}

export const ARTryOnModal: React.FC<ARTryOnModalProps> = ({
  isOpen,
  product,
  onClose,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<Size | null>(
    product.sizes[0] || null
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors?.[0]
  );
  const [showInstructions, setShowInstructions] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Auto-hide instructions after 3 seconds
  useEffect(() => {
    if (isOpen && showInstructions) {
      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showInstructions]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCameraEnabled(false);
      setShowInstructions(true);
    }
  }, [isOpen]);

  const handleEnableCamera = () => {
    setCameraEnabled(true);
    setShowInstructions(false);
  };

  const handleCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      // Flash effect simulation
    }, 200);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Try on ${product.name}`,
          text: `Check out this AR try-on experience for ${product.name}`,
          url: window.location.href,
        });
      } catch (err) {
        // Share cancelled or failed
      }
    }
  };

  const handleAddToCart = () => {
    if (selectedSize) {
      onAddToCart(selectedSize, selectedColor);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90" />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-screen h-screen flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6">
              <div className="flex items-center justify-between">
                {/* Logo and Product Name */}
                <div className="flex items-center gap-3">
                  <div className="glass-morphism rounded-full px-4 py-2 shadow-glass">
                    <h2 className="text-sm font-bold text-primary-lime">VASTY</h2>
                  </div>
                  <div className="glass-morphism rounded-button px-4 py-2 shadow-glass hidden md:block">
                    <p className="text-sm font-semibold text-text-primary">{product.name}</p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="glass-morphism rounded-full p-3 shadow-glass hover:bg-white/90 transition-all"
                  aria-label="Close AR Try-On"
                >
                  <X className="w-6 h-6 text-text-primary" />
                </button>
              </div>
            </header>

            {/* Camera Feed Section */}
            <div className="flex-1 relative overflow-hidden bg-slate-900">
              {!cameraEnabled ? (
                // Camera Placeholder
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center px-6"
                  >
                    {/* Pulsing Camera Icon */}
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-primary-lime/20"
                    >
                      <Video className="w-12 h-12 text-primary-lime" />
                    </motion.div>

                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                      Camera Access Required
                    </h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                      Enable your camera to try on {product.name} using augmented reality
                    </p>

                    <Button
                      size="lg"
                      onClick={handleEnableCamera}
                      className="bg-primary-lime hover:bg-primary-lime-dark text-white shadow-lg"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Enable Camera
                    </Button>
                  </motion.div>
                </div>
              ) : (
                // Camera Feed (Placeholder)
                <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900">
                  {/* Simulated Camera Feed with Product Overlay */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Demo Message */}
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
                      <div className="glass-morphism rounded-button px-4 py-2 shadow-glass">
                        <p className="text-xs font-medium text-primary-lime flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          AR Demo - Actual camera integration coming soon
                        </p>
                      </div>
                    </div>

                    {/* Product Image Overlay (Simulated AR) */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="relative"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="max-w-sm max-h-96 object-contain opacity-80 drop-shadow-2xl"
                      />

                      {/* AR Grid Effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-lime/10 to-transparent pointer-events-none" />
                    </motion.div>

                    {/* Zoom Controls */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                      <button className="glass-morphism rounded-full p-3 shadow-glass hover:bg-white/90 transition-all">
                        <ZoomIn className="w-5 h-5 text-text-primary" />
                      </button>
                      <button className="glass-morphism rounded-full p-3 shadow-glass hover:bg-white/90 transition-all">
                        <ZoomOut className="w-5 h-5 text-text-primary" />
                      </button>
                    </div>

                    {/* Capture Flash Effect */}
                    <AnimatePresence>
                      {isCapturing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 1, 0] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0 bg-white pointer-events-none"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* AR Instructions Overlay */}
              <AnimatePresence>
                {showInstructions && cameraEnabled && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center z-10"
                    onClick={() => setShowInstructions(false)}
                  >
                    <div className="glass-morphism rounded-card p-8 max-w-md mx-4 shadow-glass">
                      <h3 className="text-xl font-bold text-text-primary mb-4">
                        AR Try-On Instructions
                      </h3>
                      <ul className="space-y-3 text-text-secondary">
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary-lime flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">1</span>
                          </div>
                          <span>Position yourself in front of the camera</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary-lime flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">2</span>
                          </div>
                          <span>Adjust lighting for best results</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary-lime flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">3</span>
                          </div>
                          <span>Tap to try different sizes and colors</span>
                        </li>
                      </ul>
                      <p className="text-xs text-text-secondary mt-4 text-center">
                        Tap anywhere to continue
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Controls Panel */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 md:p-6">
              <div className="glass-morphism rounded-card p-4 md:p-6 shadow-glass max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  {/* Product Info Section */}
                  <div className="flex gap-4 flex-1">
                    {/* Product Thumbnail */}
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-button overflow-hidden bg-white shadow-card flex-shrink-0">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary text-sm md:text-base truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        {product.salePrice ? (
                          <>
                            <span className="text-lg md:text-xl font-bold text-badge-sale">
                              ${product.salePrice}
                            </span>
                            <span className="text-sm text-text-secondary line-through">
                              ${product.price}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg md:text-xl font-bold text-text-primary">
                            ${product.price}
                          </span>
                        )}
                      </div>

                      {/* Size Selector */}
                      {product.sizes.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-text-secondary mb-2">Size:</p>
                          <div className="flex gap-2 flex-wrap">
                            {product.sizes.map((size) => (
                              <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={cn(
                                  'px-3 py-1.5 rounded-button text-xs font-semibold transition-all',
                                  selectedSize === size
                                    ? 'bg-primary-lime text-white shadow-md'
                                    : 'bg-white text-text-primary border border-gray-200 hover:border-primary-lime'
                                )}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Color Selector */}
                      {product.colors && product.colors.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-text-secondary mb-2">Color:</p>
                          <div className="flex gap-2">
                            {product.colors.map((color) => (
                              <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={cn(
                                  'w-8 h-8 rounded-full border-2 transition-all',
                                  selectedColor === color
                                    ? 'border-primary-lime shadow-md scale-110'
                                    : 'border-gray-300 hover:border-primary-lime'
                                )}
                                style={{ backgroundColor: color }}
                                aria-label={`Select ${color} color`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 md:gap-3 md:flex-col md:justify-center">
                    {/* Capture Button */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCapture}
                      disabled={!cameraEnabled}
                      className="flex-1 md:flex-none bg-white hover:bg-gray-50"
                      aria-label="Capture photo"
                    >
                      <Camera className="w-5 h-5" />
                    </Button>

                    {/* Share Button */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleShare}
                      className="flex-1 md:flex-none bg-white hover:bg-gray-50"
                      aria-label="Share"
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>

                    {/* Add to Cart Button */}
                    <Button
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={!selectedSize}
                      className="flex-1 md:flex-none md:min-w-[140px] bg-primary-lime hover:bg-primary-lime-dark text-white shadow-lg"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

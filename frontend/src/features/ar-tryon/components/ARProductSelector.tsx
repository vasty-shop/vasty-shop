import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { ARProductSelectorProps } from '../types';

/**
 * AR Product Color/Variant Selector
 * Allows quick switching between product variants during AR try-on
 */
const ARProductSelector: React.FC<ARProductSelectorProps> = ({
  product,
  selectedVariant,
  onVariantChange,
}) => {
  if (!product.variants || product.variants.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="glass-solid rounded-2xl p-4 backdrop-blur-xl">
        {/* Product Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
            <img
              src={selectedVariant?.thumbnail || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">{product.name}</h3>
            <p className="text-white/60 text-sm">
              {selectedVariant?.name || 'Select a variant'}
            </p>
          </div>
        </div>

        {/* Variant Selector */}
        <div className="space-y-2">
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
            Available Colors
          </p>
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
            {product.variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;

              return (
                <motion.button
                  key={variant.id}
                  onClick={() => onVariantChange(variant)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all ${
                    isSelected
                      ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900'
                      : 'ring-1 ring-white/20'
                  }`}
                >
                  {/* Variant Thumbnail */}
                  <img
                    src={variant.thumbnail}
                    alt={variant.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Color Dot Indicator */}
                  <div
                    className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: variant.color }}
                  />

                  {/* Selected Check Mark */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute inset-0 bg-cyan-500/20 backdrop-blur-sm flex items-center justify-center"
                      >
                        <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Variant Details */}
        {selectedVariant && (
          <motion.div
            key={selectedVariant.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-white/10"
          >
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Selected Color:</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-white/30"
                  style={{ backgroundColor: selectedVariant.color }}
                />
                <span className="text-white text-sm font-medium">
                  {selectedVariant.name}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ARProductSelector;

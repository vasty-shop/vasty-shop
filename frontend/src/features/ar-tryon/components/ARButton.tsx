import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import ARModal from './ARModal';

/**
 * AR Try-On Button with Modal
 * Quick integration component for product pages
 */
interface ARButtonProps {
  productId: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

const ARButton: React.FC<ARButtonProps> = ({
  productId,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}) => {
  const [showAR, setShowAR] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // Variant classes
  const variantClasses = {
    primary:
      'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50',
    secondary:
      'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50',
    outline:
      'bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10',
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowAR(true)}
        className={`
          flex items-center justify-center gap-2 rounded-xl font-medium
          transition-all duration-300
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
      >
        <Camera className="w-5 h-5" />
        Try with AR
      </motion.button>

      <ARModal
        isOpen={showAR}
        onClose={() => setShowAR(false)}
        productId={productId}
      />
    </>
  );
};

export default ARButton;

import React from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  RotateCcw,
  Share2,
  X,
  RefreshCw,
  Maximize2,
} from 'lucide-react';
import { ARControlsProps } from '../types';

/**
 * AR Try-On Control Panel
 * Provides camera controls, capture, size adjustment, and other actions
 */
const ARControls: React.FC<ARControlsProps> = ({
  onCameraFlip,
  onCapture,
  onSizeChange,
  onReset,
  onClose,
  onShare,
  isCapturing = false,
  currentSize = 100,
}) => {
  return (
    <div className="space-y-4">
      {/* Size Adjustment Slider */}
      <div className="glass-solid rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-cyan-400" />
            <span className="text-white text-sm font-medium">Size</span>
          </div>
          <span className="text-cyan-400 text-sm font-bold">{currentSize}%</span>
        </div>
        <input
          type="range"
          min="50"
          max="150"
          value={currentSize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, rgb(34, 211, 238) 0%, rgb(34, 211, 238) ${
              ((currentSize - 50) / (150 - 50)) * 100
            }%, rgba(255,255,255,0.1) ${
              ((currentSize - 50) / (150 - 50)) * 100
            }%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between gap-3">
        {/* Secondary Controls */}
        <div className="flex gap-2">
          {/* Reset Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="p-4 glass-solid rounded-xl hover:bg-white/10 transition-all"
            title="Reset"
          >
            <RotateCcw className="w-6 h-6 text-white" />
          </motion.button>

          {/* Camera Flip Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCameraFlip}
            className="p-4 glass-solid rounded-xl hover:bg-white/10 transition-all"
            title="Flip Camera"
          >
            <RefreshCw className="w-6 h-6 text-white" />
          </motion.button>
        </div>

        {/* Capture Button (Primary) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCapture}
          disabled={isCapturing}
          className="relative w-20 h-20 rounded-full bg-white shadow-lg shadow-white/20 flex items-center justify-center border-4 border-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Capture Photo"
        >
          <motion.div
            animate={isCapturing ? { scale: [1, 0.8, 1] } : {}}
            transition={{ duration: 0.3 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center"
          >
            <Camera className="w-8 h-8 text-white" />
          </motion.div>
        </motion.button>

        {/* Tertiary Controls */}
        <div className="flex gap-2">
          {/* Share Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onShare}
            className="p-4 glass-solid rounded-xl hover:bg-white/10 transition-all"
            title="Share"
          >
            <Share2 className="w-6 h-6 text-white" />
          </motion.button>

          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-4 bg-red-500/20 rounded-xl hover:bg-red-500/30 transition-all border border-red-500/50"
            title="Close"
          >
            <X className="w-6 h-6 text-red-400" />
          </motion.button>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="glass-solid rounded-xl p-3">
        <p className="text-white/60 text-xs text-center">
          Adjust size with slider • Tap capture to take photo • Share your look
        </p>
      </div>
    </div>
  );
};

export default ARControls;

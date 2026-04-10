import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  MoveHorizontal,
  Maximize2,
  Camera,
  X,
  CheckCircle2,
} from 'lucide-react';
import { ARInstructionsProps } from '../types';

/**
 * AR Instructions Overlay
 * Shows first-time user instructions with step-by-step guidance
 */
const ARInstructions: React.FC<ARInstructionsProps> = ({
  onDismiss,
  showAgain = true,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem('ar-instructions-dismissed', 'true');
    }
    onDismiss();
  };

  const instructions = [
    {
      icon: User,
      title: 'Face the Camera',
      description: 'Stand in front of the camera with your full body visible',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: MoveHorizontal,
      title: 'Stand Back',
      description: 'Keep a distance of 2-3 feet for best AR experience',
      color: 'from-blue-500 to-purple-500',
    },
    {
      icon: Maximize2,
      title: 'Adjust Size',
      description: 'Use the slider to adjust product size to fit perfectly',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Camera,
      title: 'Capture & Share',
      description: 'Take photos and share your virtual try-on with friends',
      color: 'from-pink-500 to-red-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-solid rounded-3xl p-6 sm:p-8 max-w-2xl w-full relative overflow-hidden"
      >
        {/* Background Gradient Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-500/10 to-blue-500/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                AR Try-On Guide
              </h2>
              <p className="text-white/60">
                Follow these steps for the best experience
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-6 h-6 text-white/70" />
            </button>
          </div>

          {/* Instructions Grid */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {instructions.map((instruction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-4 hover:bg-white/5 transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${instruction.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                  >
                    <instruction.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold mb-1">
                      {instruction.title}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {instruction.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pro Tips */}
          <div className="glass rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold mb-2">Pro Tips</h4>
                <ul className="space-y-1 text-white/60 text-sm">
                  <li>• Use good lighting for better AR accuracy</li>
                  <li>• Stand against a plain background if possible</li>
                  <li>• Try different camera angles for the best view</li>
                  <li>• Adjust product size to match your body proportions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Don't Show Again Checkbox */}
          {showAgain && (
            <div className="flex items-center gap-3 mb-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-5 h-5 rounded bg-white/10 border-2 border-white/20 checked:bg-cyan-500 checked:border-cyan-500 cursor-pointer transition-all"
                />
                <span className="text-white/70 text-sm group-hover:text-white transition-colors">
                  Don't show this again
                </span>
              </label>
            </div>
          )}

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDismiss}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all"
          >
            Got It, Let's Try!
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ARInstructions;

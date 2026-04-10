import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: AlertType;
  buttonText?: string;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK'
}) => {
  const alertConfig = {
    success: {
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-500',
      button: 'bg-gradient-to-br from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600',
      gradient: 'from-emerald-500/10 to-green-500/10',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
      orbColor: 'bg-emerald-500/20'
    },
    error: {
      icon: XCircle,
      iconColor: 'text-red-400',
      iconBg: 'bg-gradient-to-br from-red-500 to-pink-500',
      button: 'bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600',
      gradient: 'from-red-500/10 to-pink-500/10',
      glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
      orbColor: 'bg-red-500/20'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
      button: 'bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
      gradient: 'from-amber-500/10 to-orange-500/10',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
      orbColor: 'bg-amber-500/20'
    },
    info: {
      icon: Info,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-500',
      button: 'bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600',
      gradient: 'from-cyan-500/10 to-blue-500/10',
      glow: 'shadow-[0_0_30px_rgba(34,211,238,0.3)]',
      orbColor: 'bg-cyan-500/20'
    }
  };

  const config = alertConfig[type];
  const Icon = config.icon;

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9998]"
            onClick={handleClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25
              }}
              className={`
                relative w-full max-w-md
                backdrop-filter backdrop-blur-3xl
                bg-slate-900/95
                border border-white/10
                rounded-2xl
                shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
                ${config.glow}
                overflow-hidden
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient overlay effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} pointer-events-none`} />

              {/* Animated glow orbs */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 ${config.orbColor} rounded-full blur-3xl animate-pulse`} />
              <div className={`absolute -bottom-24 -left-24 w-48 h-48 ${config.orbColor} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1.5s' }} />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="relative p-6">
                {/* Icon with animation */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                      delay: 0.1
                    }}
                    className={`
                      w-20 h-20 rounded-2xl
                      ${config.iconBg}
                      flex items-center justify-center
                      shadow-lg
                    `}
                  >
                    <Icon className={`w-10 h-10 text-white`} />
                  </motion.div>
                </div>

                {/* Title with animation */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white text-center mb-3"
                >
                  {title}
                </motion.h3>

                {/* Message with animation */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/70 text-center text-sm mb-6 leading-relaxed"
                >
                  {message}
                </motion.p>

                {/* Button with animation */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={handleClose}
                  className={`
                    w-full px-6 py-3 rounded-xl
                    ${config.button}
                    text-white font-semibold
                    shadow-lg
                    transition-all duration-200
                    hover:scale-105
                    active:scale-95
                  `}
                >
                  {buttonText}
                </motion.button>
              </div>

              {/* Shimmer effect */}
              <div className="absolute inset-0 pointer-events-none">
                <motion.div
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  style={{ transform: 'skewX(-20deg)' }}
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

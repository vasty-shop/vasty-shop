'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles, ArrowRight, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogPortal, DialogOverlay } from '../ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '../ui/button';
import { FeatureData } from '../../types/features';

interface FeatureAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFeature: FeatureData | null;
  currentIndex: number;
  totalFeatures: number;
  onNext: () => void;
  onPrev: () => void;
}

export function FeatureAnnouncementModal({
  isOpen,
  onClose,
  currentFeature,
  currentIndex,
  totalFeatures,
  onNext,
  onPrev,
}: FeatureAnnouncementModalProps) {
  const navigate = useNavigate();

  if (!currentFeature) return null;

  const handleLearnMore = () => {
    onClose();
    navigate(`/features#${currentFeature.id}`);
  };

  const handleVideoClick = () => {
    handleLearnMore();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] p-0 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl overflow-hidden border border-slate-700/50">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(circle at 30% 20%, rgba(132, 204, 22, 0.15) 0%, transparent 50%)',
            }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            {/* Header Badge */}
            <div className="px-6 pt-6 pb-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-lime/20 to-emerald-500/20 border border-primary-lime/30"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-lime opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-lime"></span>
                </span>
                <Store className="w-4 h-4 text-primary-lime" />
                <span className="text-sm font-medium text-primary-lime">
                  Discover Vasty Shop
                </span>
              </motion.div>
            </div>

            {/* Video/Image Container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="px-6"
              >
                <div
                  className="relative aspect-video rounded-xl overflow-hidden border border-slate-700/50 cursor-pointer group"
                  onClick={handleVideoClick}
                >
                  {currentFeature.videoSrc ? (
                    <>
                      <video
                        src={currentFeature.videoSrc}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                          Click to learn more
                        </div>
                      </div>
                    </>
                  ) : currentFeature.thumbnailSrc ? (
                    <>
                      <img
                        src={currentFeature.thumbnailSrc}
                        alt={currentFeature.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                          Click to learn more
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-primary-lime/30" />
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${currentFeature.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="px-6 py-6"
              >
                <h2 className="text-2xl font-bold text-white mb-3">
                  {currentFeature.title}
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  {currentFeature.description}
                </p>

                <div className="flex items-center justify-between">
                  <Button
                    onClick={handleLearnMore}
                    className="bg-gradient-to-r from-primary-lime to-emerald-500 hover:from-primary-lime/90 hover:to-emerald-500/90 text-white px-6 py-5 text-sm font-semibold shadow-lg shadow-primary-lime/20 hover:shadow-xl hover:shadow-primary-lime/30 transition-all group"
                  >
                    Learn More
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  {totalFeatures > 1 && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={onPrev}
                        disabled={currentIndex === 0}
                        className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </button>
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalFeatures }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              i === currentIndex ? 'bg-primary-lime' : 'bg-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={onNext}
                        disabled={currentIndex === totalFeatures - 1}
                        className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

export default FeatureAnnouncementModal;

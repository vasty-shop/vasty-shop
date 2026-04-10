'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { LucideIcon, Play, CheckCircle } from 'lucide-react';

interface FeatureShowcaseProps {
  id: string;
  icon: LucideIcon;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  color: 'cyan' | 'purple' | 'blue' | 'emerald' | 'orange' | 'pink';
  direction: 'left' | 'right';
  mediaType: 'video' | 'image';
  mediaSrc?: string;
  index: number;
}

const colorClasses = {
  cyan: {
    badge: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    icon: 'bg-gradient-to-br from-cyan-500 to-blue-500',
    glow: 'rgba(6, 182, 212, 0.3)',
    checkIcon: 'text-cyan-400',
    border: 'border-cyan-500/30',
    ring: 'ring-cyan-500/20',
  },
  purple: {
    badge: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    icon: 'bg-gradient-to-br from-purple-500 to-pink-500',
    glow: 'rgba(139, 92, 246, 0.3)',
    checkIcon: 'text-purple-400',
    border: 'border-purple-500/30',
    ring: 'ring-purple-500/20',
  },
  blue: {
    badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    icon: 'bg-gradient-to-br from-blue-500 to-indigo-500',
    glow: 'rgba(59, 130, 246, 0.3)',
    checkIcon: 'text-blue-400',
    border: 'border-blue-500/30',
    ring: 'ring-blue-500/20',
  },
  emerald: {
    badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    icon: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    glow: 'rgba(16, 185, 129, 0.3)',
    checkIcon: 'text-emerald-400',
    border: 'border-emerald-500/30',
    ring: 'ring-emerald-500/20',
  },
  orange: {
    badge: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    icon: 'bg-gradient-to-br from-orange-500 to-amber-500',
    glow: 'rgba(249, 115, 22, 0.3)',
    checkIcon: 'text-orange-400',
    border: 'border-orange-500/30',
    ring: 'ring-orange-500/20',
  },
  pink: {
    badge: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
    icon: 'bg-gradient-to-br from-pink-500 to-rose-500',
    glow: 'rgba(236, 72, 153, 0.3)',
    checkIcon: 'text-pink-400',
    border: 'border-pink-500/30',
    ring: 'ring-pink-500/20',
  },
};

export function FeatureShowcase({
  id,
  icon: Icon,
  title,
  tagline,
  description,
  features,
  color,
  direction,
  mediaType,
  mediaSrc,
  index,
}: FeatureShowcaseProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const colors = colorClasses[color];

  const contentOrder = direction === 'left' ? 'lg:order-1' : 'lg:order-2';
  const mediaOrder = direction === 'left' ? 'lg:order-2' : 'lg:order-1';

  return (
    <motion.div
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.1 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
    >
      {/* Content Side */}
      <div className={`space-y-6 ${contentOrder}`}>
        {/* Tagline Badge */}
        <motion.div
          initial={{ opacity: 0, x: direction === 'left' ? -20 : 20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2 }}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${colors.badge}`}
        >
          <div className={`w-6 h-6 rounded-lg ${colors.icon} flex items-center justify-center`}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-medium">{tagline}</span>
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
        >
          {title}
        </motion.h3>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-400 leading-relaxed"
        >
          {description}
        </motion.p>

        {/* Feature List */}
        <motion.ul
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {features.map((feature, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-start gap-3"
            >
              <CheckCircle className={`w-5 h-5 mt-0.5 ${colors.checkIcon} flex-shrink-0`} />
              <span className="text-gray-300">{feature}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {/* Media Side */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.6 }}
        className={mediaOrder}
      >
        {/* Modern Video Container */}
        <div className="relative">
          {/* Outer glow effect */}
          <div
            className="absolute -inset-1 rounded-3xl opacity-50 blur-xl"
            style={{
              background: `linear-gradient(135deg, ${colors.glow} 0%, transparent 50%, ${colors.glow} 100%)`,
            }}
          />

          {/* Main container with browser-like frame */}
          <div
            className={`relative rounded-2xl overflow-hidden bg-slate-900/90 border ${colors.border} ring-1 ${colors.ring}`}
            style={{
              boxShadow: `0 25px 50px -12px ${colors.glow}, 0 0 0 1px rgba(255,255,255,0.05)`,
            }}
          >
            {/* Browser-like top bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-slate-700/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className="h-6 bg-slate-700/50 rounded-md flex items-center px-3">
                  <span className="text-xs text-slate-400 truncate">vasty.shop/{id}</span>
                </div>
              </div>
            </div>

            {/* Video/Image Container */}
            <div className="relative aspect-[16/10] bg-slate-900">
              {/* Gradient Overlay */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none z-10"
                style={{
                  background: `radial-gradient(ellipse at top, ${colors.glow} 0%, transparent 50%)`,
                }}
              />

              {mediaType === 'video' && mediaSrc ? (
                <video
                  src={mediaSrc}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : mediaType === 'image' && mediaSrc ? (
                <img
                  src={mediaSrc}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Placeholder */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <motion.div
                    className={`w-24 h-24 rounded-3xl ${colors.icon} flex items-center justify-center mb-8 shadow-2xl`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className="w-12 h-12 text-white" />
                  </motion.div>
                  <h4 className="text-white/80 font-semibold text-xl text-center mb-6">
                    {title}
                  </h4>
                  <motion.div
                    className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </motion.div>
                  <span className="text-white/50 text-sm mt-6">Demo Coming Soon</span>
                </div>
              )}

            </div>
          </div>

          {/* Decorative elements */}
          <div
            className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-30 blur-2xl"
            style={{ background: colors.glow }}
          />
          <div
            className="absolute -top-4 -left-4 w-16 h-16 rounded-full opacity-20 blur-xl"
            style={{ background: colors.glow }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default FeatureShowcase;

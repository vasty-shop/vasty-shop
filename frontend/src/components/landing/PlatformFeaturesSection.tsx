'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Search,
  Palette,
  BarChart3,
  CreditCard,
  Globe,
  Zap,
  Shield,
  Sparkles,
  Bot,
  Layers,
  Truck,
  MessageSquare,
  Target,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface Feature {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  color: string;
  gradient: string;
}

interface PlatformAdvantage {
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
}

export function PlatformFeaturesSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features: Feature[] = [
    {
      id: 'marketplace',
      icon: <Search className="w-7 h-7" />,
      titleKey: 'landing.features.marketplaceDiscovery.title',
      descriptionKey: 'landing.features.marketplaceDiscovery.description',
      color: 'text-cyan-400',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'storefront',
      icon: <Store className="w-7 h-7" />,
      titleKey: 'landing.features.independentStorefronts.title',
      descriptionKey: 'landing.features.independentStorefronts.description',
      color: 'text-emerald-400',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'ai-builder',
      icon: <Bot className="w-7 h-7" />,
      titleKey: 'landing.features.aiStoreBuilder.title',
      descriptionKey: 'landing.features.aiStoreBuilder.description',
      color: 'text-purple-400',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'payments',
      icon: <CreditCard className="w-7 h-7" />,
      titleKey: 'landing.features.integratedPayments.title',
      descriptionKey: 'landing.features.integratedPayments.description',
      color: 'text-green-400',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: 'analytics',
      icon: <BarChart3 className="w-7 h-7" />,
      titleKey: 'landing.features.powerfulAnalytics.title',
      descriptionKey: 'landing.features.powerfulAnalytics.description',
      color: 'text-orange-400',
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      id: 'delivery',
      icon: <Truck className="w-7 h-7" />,
      titleKey: 'landing.features.deliveryManagement.title',
      descriptionKey: 'landing.features.deliveryManagement.description',
      color: 'text-blue-400',
      gradient: 'from-blue-500 to-indigo-500',
    },
  ];

  const platformAdvantages: PlatformAdvantage[] = [
    {
      icon: <Zap className="w-6 h-6" />,
      titleKey: 'landing.features.lightningFast',
      descriptionKey: 'landing.features.lightningFastDesc',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      titleKey: 'landing.features.enterpriseSecurity',
      descriptionKey: 'landing.features.enterpriseSecurityDesc',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      titleKey: 'landing.features.globalScale',
      descriptionKey: 'landing.features.globalScaleDesc',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      titleKey: 'landing.features.support247',
      descriptionKey: 'landing.features.support247Desc',
    },
  ];

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-slate-900 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary-lime/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-lime/20 to-emerald-500/20 backdrop-blur-sm border border-primary-lime/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary-lime" />
            <span className="text-sm font-medium text-primary-lime">{t('landing.features.badge')}</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              {t('landing.features.title')}
            </span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
            {t('landing.features.subtitle')}
          </p>

          {/* View All Features Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <motion.button
              onClick={() => navigate('/features')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-lime to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-lime/25 hover:shadow-xl hover:shadow-primary-lime/30 transition-all duration-300 overflow-hidden"
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              <span className="relative">{t('landing.features.viewAllFeatures')}</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Grid - Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setActiveFeature(feature.id)}
              onMouseLeave={() => setActiveFeature(null)}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group cursor-pointer"
            >
              <div className="relative h-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-500 overflow-hidden">
                {/* Animated Gradient Border */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} style={{ padding: '1px' }}>
                  <div className="absolute inset-[1px] bg-slate-900 rounded-2xl" />
                </div>

                {/* Glow Effect */}
                <div
                  className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon with Ring */}
                  <div className="relative mb-5">
                    <div className={`absolute inset-0 w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-20 blur-lg group-hover:opacity-40 transition-opacity`} />
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg ring-2 ring-white/10 group-hover:ring-white/20 transition-all`}
                    >
                      <span className="text-white">{feature.icon}</span>
                    </motion.div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/80 group-hover:bg-clip-text transition-all duration-300">
                    {t(feature.titleKey)}
                  </h3>

                  {/* Description */}
                  <p className="text-white/50 text-sm leading-relaxed mb-4 group-hover:text-white/70 transition-colors">
                    {t(feature.descriptionKey)}
                  </p>

                  {/* Learn More Link */}
                  <div className={`flex items-center gap-2 ${feature.color} text-sm font-medium opacity-70 group-hover:opacity-100 group-hover:gap-3 transition-all duration-300`}>
                    <span>{t('landing.features.learnMore')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Corner Decoration */}
                <div className={`absolute -bottom-12 -right-12 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Platform Advantages - Improved */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 overflow-hidden"
        >
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-lime/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl" />

          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {platformAdvantages.map((advantage, index) => (
              <motion.div
                key={advantage.titleKey}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="text-center group cursor-pointer"
              >
                <div className="relative mb-4">
                  <div className="absolute inset-0 w-16 h-16 mx-auto bg-primary-lime/20 rounded-2xl blur-xl group-hover:bg-primary-lime/40 transition-colors" />
                  <div className="relative w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-lime/20 to-emerald-500/20 border border-primary-lime/30 flex items-center justify-center text-primary-lime group-hover:bg-gradient-to-br group-hover:from-primary-lime group-hover:to-emerald-500 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-lg">
                    {advantage.icon}
                  </div>
                </div>
                <h4 className="text-base md:text-lg font-bold text-white mb-2">{t(advantage.titleKey)}</h4>
                <p className="text-xs md:text-sm text-white/50 group-hover:text-white/70 transition-colors">{t(advantage.descriptionKey)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default PlatformFeaturesSection;

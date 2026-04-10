'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Store,
  Package,
  Globe,
  Rocket,
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  CreditCard,
  Users
} from 'lucide-react';
import { usePlatformSettings } from '@/contexts/PlatformSettingsContext';

interface Step {
  number: string;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  featureKeys: string[];
  color: string;
  gradient: string;
}

function StepCard({ step, index, isReversed, t }: { step: Step; index: number; isReversed?: boolean; t: (key: string) => string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isReversed ? 50 : -50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="relative"
    >
      <div className={`relative bg-gradient-to-br ${step.gradient} backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all group`}>
        {/* Step Number */}
        <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} border border-white/20 flex items-center justify-center`}>
          <span className={`text-lg font-bold ${step.color}`}>{step.number}</span>
        </div>

        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 ${step.color} group-hover:bg-white/20 transition-colors`}
        >
          {step.icon}
        </motion.div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-3">{t(step.titleKey)}</h3>
        <p className="text-white/60 mb-6 leading-relaxed">{t(step.descriptionKey)}</p>

        {/* Features */}
        <div className="space-y-2">
          {step.featureKeys.map((featureKey, i) => (
            <motion.div
              key={featureKey}
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-2"
            >
              <CheckCircle className={`w-4 h-4 ${step.color}`} />
              <span className="text-sm text-white/70">{t(featureKey)}</span>
            </motion.div>
          ))}
        </div>

        {/* Connector Line (except last) */}
        {index < 3 && (
          <div className="hidden lg:block absolute top-1/2 -right-8 w-8 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
        )}
      </div>
    </motion.div>
  );
}

export function HowItWorksSection() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { settings } = usePlatformSettings();

  const sellerSteps: Step[] = [
    {
      number: '01',
      icon: <Store className="w-8 h-8" />,
      titleKey: 'landing.howItWorks.seller.step1.title',
      descriptionKey: 'landing.howItWorks.seller.step1.description',
      featureKeys: ['landing.howItWorks.seller.step1.feature1', 'landing.howItWorks.seller.step1.feature2', 'landing.howItWorks.seller.step1.feature3'],
      color: 'text-emerald-400',
      gradient: 'from-emerald-500/20 to-teal-500/20',
    },
    {
      number: '02',
      icon: <Package className="w-8 h-8" />,
      titleKey: 'landing.howItWorks.seller.step2.title',
      descriptionKey: 'landing.howItWorks.seller.step2.description',
      featureKeys: ['landing.howItWorks.seller.step2.feature1', 'landing.howItWorks.seller.step2.feature2', 'landing.howItWorks.seller.step2.feature3'],
      color: 'text-blue-400',
      gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      number: '03',
      icon: <Globe className="w-8 h-8" />,
      titleKey: 'landing.howItWorks.seller.step3.title',
      descriptionKey: 'landing.howItWorks.seller.step3.description',
      featureKeys: ['landing.howItWorks.seller.step3.feature1', 'landing.howItWorks.seller.step3.feature2', 'landing.howItWorks.seller.step3.feature3'],
      color: 'text-purple-400',
      gradient: 'from-purple-500/20 to-pink-500/20',
    },
    {
      number: '04',
      icon: <Rocket className="w-8 h-8" />,
      titleKey: 'landing.howItWorks.seller.step4.title',
      descriptionKey: 'landing.howItWorks.seller.step4.description',
      featureKeys: ['landing.howItWorks.seller.step4.feature1', 'landing.howItWorks.seller.step4.feature2', 'landing.howItWorks.seller.step4.feature3'],
      color: 'text-orange-400',
      gradient: 'from-orange-500/20 to-amber-500/20',
    },
  ];

  const buyerSteps: Step[] = [
    {
      number: '01',
      icon: <Globe className="w-8 h-8" />,
      titleKey: 'landing.howItWorks.buyer.step1.title',
      descriptionKey: 'landing.howItWorks.buyer.step1.description',
      featureKeys: ['landing.howItWorks.buyer.step1.feature1', 'landing.howItWorks.buyer.step1.feature2', 'landing.howItWorks.buyer.step1.feature3'],
      color: 'text-cyan-400',
      gradient: 'from-cyan-500/20 to-blue-500/20',
    },
    {
      number: '02',
      icon: <Store className="w-8 h-8" />,
      titleKey: 'landing.howItWorks.buyer.step2.title',
      descriptionKey: 'landing.howItWorks.buyer.step2.description',
      featureKeys: ['landing.howItWorks.buyer.step2.feature1', 'landing.howItWorks.buyer.step2.feature2', 'landing.howItWorks.buyer.step2.feature3'],
      color: 'text-pink-400',
      gradient: 'from-pink-500/20 to-rose-500/20',
    },
    {
      number: '03',
      icon: <CreditCard className="w-8 h-8" />,
      titleKey: 'landing.howItWorks.buyer.step3.title',
      descriptionKey: 'landing.howItWorks.buyer.step3.description',
      featureKeys: ['landing.howItWorks.buyer.step3.feature1', 'landing.howItWorks.buyer.step3.feature2', 'landing.howItWorks.buyer.step3.feature3'],
      color: 'text-green-400',
      gradient: 'from-green-500/20 to-emerald-500/20',
    },
    {
      number: '04',
      icon: <Users className="w-8 h-8" />,
      titleKey: 'landing.howItWorks.buyer.step4.title',
      descriptionKey: 'landing.howItWorks.buyer.step4.description',
      featureKeys: ['landing.howItWorks.buyer.step4.feature1', 'landing.howItWorks.buyer.step4.feature2', 'landing.howItWorks.buyer.step4.feature3'],
      color: 'text-amber-400',
      gradient: 'from-amber-500/20 to-yellow-500/20',
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-lime/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary-lime" />
            <span className="text-sm font-medium text-white/90">{t('landing.howItWorks.badge')}</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('landing.howItWorks.titlePart1')} <span className="bg-gradient-to-r from-primary-lime to-emerald-400 bg-clip-text text-transparent">{settings.platformName}</span> {t('landing.howItWorks.titlePart2')}
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            {t('landing.howItWorks.subtitle')}
          </p>
        </motion.div>

        {/* For Sellers */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-lime/20 to-emerald-500/20 flex items-center justify-center">
              <Store className="w-6 h-6 text-primary-lime" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{t('landing.howItWorks.forSellers')}</h3>
              <p className="text-white/60">{t('landing.howItWorks.forSellersDesc')}</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sellerSteps.map((step, index) => (
              <StepCard key={step.titleKey} step={step} index={index} t={t} />
            ))}
          </div>
        </div>

        {/* For Buyers */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{t('landing.howItWorks.forBuyers')}</h3>
              <p className="text-white/60">{t('landing.howItWorks.forBuyersDesc')}</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {buyerSteps.map((step, index) => (
              <StepCard key={step.titleKey} step={step} index={index} isReversed t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;

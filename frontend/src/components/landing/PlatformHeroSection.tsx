'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Store,
  Search,
  Globe,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Users,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface PlatformStat {
  value: string;
  labelKey: string;
  icon: React.ReactNode;
}

const floatingElements = [
  { icon: Store, color: 'from-emerald-400 to-teal-500', delay: 0, x: '10%', y: '20%' },
  { icon: ShoppingBag, color: 'from-purple-400 to-pink-500', delay: 0.5, x: '80%', y: '15%' },
  { icon: Search, color: 'from-blue-400 to-cyan-500', delay: 1, x: '85%', y: '60%' },
  { icon: Globe, color: 'from-orange-400 to-amber-500', delay: 1.5, x: '15%', y: '70%' },
];

export function PlatformHeroSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [activeWord, setActiveWord] = useState(0);
  const words = [
    t('landing.hero.words.discover'),
    t('landing.hero.words.create'),
    t('landing.hero.words.grow'),
    t('landing.hero.words.succeed')
  ];

  const platformStats: PlatformStat[] = [
    { value: '10K+', labelKey: 'landing.hero.stats.activeStores', icon: <Store className="w-5 h-5" /> },
    { value: '1M+', labelKey: 'landing.hero.stats.products', icon: <ShoppingBag className="w-5 h-5" /> },
    { value: '5M+', labelKey: 'landing.hero.stats.customers', icon: <Users className="w-5 h-5" /> },
    { value: '99.9%', labelKey: 'landing.hero.stats.uptime', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWord((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-primary-lime/20 to-emerald-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Floating Icons */}
        {floatingElements.map((el, index) => (
          <motion.div
            key={index}
            className={`absolute w-14 h-14 rounded-2xl bg-gradient-to-br ${el.color} flex items-center justify-center shadow-lg`}
            style={{ left: el.x, top: el.y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [0.9, 1.1, 0.9],
              y: [0, -20, 0],
            }}
            transition={{
              delay: el.delay,
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <el.icon className="w-7 h-7 text-white" />
          </motion.div>
        ))}

        {/* Shimmer Lines */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-lime/50 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 container mx-auto px-4 pt-20 pb-32"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary-lime" />
            <span className="text-sm font-medium text-white/90">
              {t('landing.hero.badge')}
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            <span className="inline-block">
              <motion.span
                key={activeWord}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="inline-block bg-gradient-to-r from-primary-lime via-emerald-400 to-cyan-400 bg-clip-text text-transparent"
              >
                {words[activeWord]}
              </motion.span>
            </span>
            {' '}{t('landing.hero.titlePart1')}
            <br />
            {t('landing.hero.titlePart2')}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-white/70 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            {t('landing.hero.subtitlePart1')}{' '}
            <span className="text-primary-lime font-semibold">{t('landing.hero.shopifyIndependence')}</span> {t('landing.hero.with')}{' '}
            <span className="text-cyan-400 font-semibold">{t('landing.hero.amazonDiscovery')}</span>.
            {' '}{t('landing.hero.subtitlePart2')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              size="lg"
              onClick={() => navigate(isAuthenticated ? '/vendor/create-shop' : '/login')}
              className="bg-gradient-to-r from-primary-lime to-emerald-500 hover:from-primary-lime/90 hover:to-emerald-500/90 text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-primary-lime/30 hover:shadow-xl hover:shadow-primary-lime/40 transition-all group"
            >
              <Store className="w-5 h-5 mr-2" />
              {t('landing.hero.startStoreFree')}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/explore')}
              className="border-white/30 bg-transparent text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold group"
            >
              <Search className="w-5 h-5 mr-2" />
              {t('landing.hero.exploreMarketplace')}
              <ArrowRight className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Button>
          </motion.div>

          {/* Platform Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {platformStats.map((stat, index) => (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-primary-lime group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60">{t(stat.labelKey)}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.button
        onClick={() => scrollToSection('how-it-works')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors cursor-pointer group"
      >
        <span className="text-sm font-medium">{t('landing.hero.scrollToExplore')}</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 group-hover:text-primary-lime transition-colors" />
        </motion.div>
      </motion.button>
    </section>
  );
}

export default PlatformHeroSection;

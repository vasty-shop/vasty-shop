import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Truck,
  Headphones,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Category {
  id?: string;
  name: string;
  count?: number;
  productCount?: number;
  icon?: string;
}

interface ServiceFeature {
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const categoryVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

export function HeroSection() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const serviceFeatures: ServiceFeature[] = [
    {
      icon: <Truck className="w-8 h-8" />,
      titleKey: "platform.hero.freeShipping",
      descKey: "platform.hero.freeShippingDesc",
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      titleKey: "platform.hero.support247",
      descKey: "platform.hero.support247Desc",
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      titleKey: "platform.hero.daysReturn",
      descKey: "platform.hero.daysReturnDesc",
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      titleKey: "platform.hero.paymentSecure",
      descKey: "platform.hero.paymentSecureDesc",
    },
  ];

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await api.getCategories();

        // Transform API response to match Category interface
        const transformedCategories = (Array.isArray(categoriesData) ? categoriesData : [])
          .slice(0, 8) // Show top 8 categories
          .map((cat: any) => ({
            id: cat.id || cat._id,
            name: cat.name,
            count: cat.productCount || cat.product_count || 0,
          }));

        setCategories(transformedCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="w-full py-8 px-4 md:px-6 lg:px-8 max-w-[1400px] mx-auto relative">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Left Sidebar - Categories */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 order-2 lg:order-1"
        >
          <Card className="overflow-hidden bg-white border-0 shadow-lg">
            <div className="p-4 bg-gradient-to-r from-primary-lime to-primary-lime-dark">
              <h3 className="text-h3 text-white font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {t('platform.hero.categories')}
              </h3>
            </div>
            <div className="p-2">
              {isLoadingCategories ? (
                // Loading skeleton
                Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-full px-4 py-3 rounded-lg mb-2 animate-pulse"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-12"></div>
                    </div>
                  </div>
                ))
              ) : categories.length > 0 ? (
                categories.map((category, index) => (
                  <motion.button
                    key={category.id || category.name}
                    variants={categoryVariants}
                    custom={index}
                    whileHover={{
                      x: 8,
                      backgroundColor: "rgba(132, 204, 22, 0.1)",
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 group hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-primary group-hover:text-primary-lime transition-colors">
                        {category.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-secondary bg-gray-100 px-2 py-1 rounded-full group-hover:bg-primary-lime group-hover:text-white transition-all">
                          {category.count}
                        </span>
                        <ChevronRight className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </motion.button>
                ))
              ) : (
                // Empty state
                <div className="p-4 text-center text-sm text-text-secondary">
                  {t('platform.hero.noCategoriesAvailable')}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Center - Main Hero Banner */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-7 order-1 lg:order-2"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative h-[400px] md:h-[500px] rounded-card overflow-hidden shadow-card group cursor-pointer"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100" />

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-lime opacity-10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-blue opacity-10 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-center px-8 md:px-12 lg:px-16 z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <span className="inline-block px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-semibold text-primary-lime mb-4 shadow-sm">
                  {t('platform.hero.newCollection')}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4 leading-tight">
                  {t('platform.hero.sunglassCollection')}
                  <br />
                  <span className="text-primary-lime">{t('platform.hero.collection')}</span>
                </h1>
                <p className="text-lg text-text-secondary mb-8 max-w-md">
                  {t('platform.hero.heroDescription')}
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="shadow-xl hover:shadow-2xl transition-shadow duration-300 group"
                  >
                    {t('platform.hero.shopNow')}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            {/* Model Image Placeholder */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="h-full w-full bg-gradient-to-l from-amber-200/30 to-transparent flex items-center justify-center"
              >
                {/* Placeholder for model image - replace with actual image */}
                <div className="w-full h-full flex items-end justify-center opacity-40">
                  <div className="w-64 h-80 bg-gradient-to-t from-yellow-400/50 to-transparent rounded-t-full" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Sidebar - Collection Cards */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-3 order-3 flex flex-col gap-6"
        >
          {/* Trendy Collection Card */}
          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ duration: 0.3 }}
            className="relative h-[240px] rounded-card overflow-hidden shadow-card cursor-pointer group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100" />

            {/* Decorative blob */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-blue opacity-20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />

            <div className="relative h-full p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-accent-blue uppercase tracking-wider">
                  {t('platform.hero.premium')}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-text-primary mt-2 leading-tight">
                  {t('platform.hero.trendyCollection')}
                  <br />
                  {t('platform.hero.collection')}
                </h3>
              </div>

              {/* Ring Image Placeholder */}
              <div className="absolute right-4 bottom-4 w-24 h-24 bg-gradient-to-br from-blue-300/40 to-cyan-300/40 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-16 h-16 border-4 border-white rounded-full shadow-lg" />
              </div>

              <motion.button
                whileHover={{ x: 5 }}
                className="text-sm font-semibold text-accent-blue flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                {t('platform.hero.explore')}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Watch Collection Card */}
          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ duration: 0.3 }}
            className="relative h-[240px] rounded-card overflow-hidden shadow-card cursor-pointer group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-rose-50 to-red-50" />

            {/* Decorative blob */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-400 opacity-20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />

            <div className="relative h-full p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-pink-600 uppercase tracking-wider">
                  {t('platform.hero.luxury')}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-text-primary mt-2 leading-tight">
                  {t('platform.hero.watchCollection')}
                  <br />
                  {t('platform.hero.collection')}
                </h3>
              </div>

              {/* Bag Image Placeholder */}
              <div className="absolute right-4 bottom-4 w-28 h-32 bg-gradient-to-br from-amber-600/60 to-orange-800/60 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <div className="w-16 h-4 bg-amber-800 rounded-full" />
              </div>

              <motion.button
                whileHover={{ x: 5 }}
                className="text-sm font-semibold text-pink-600 flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                {t('platform.hero.explore')}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Service Features Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
      >
        {serviceFeatures.map((feature, index) => (
          <motion.div
            key={feature.titleKey}
            variants={itemVariants}
            custom={index}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 text-center hover:shadow-xl transition-all duration-300 border-0 bg-white cursor-pointer group">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br shadow-lg group-hover:shadow-xl transition-shadow",
                  index === 0 && "from-primary-lime to-lime-600 text-white",
                  index === 1 && "from-accent-blue to-blue-600 text-white",
                  index === 2 && "from-amber-400 to-orange-500 text-white",
                  index === 3 && "from-emerald-400 to-teal-600 text-white"
                )}
              >
                {feature.icon}
              </motion.div>
              <h4 className="text-h3 text-text-primary mb-2 font-bold group-hover:text-primary-lime transition-colors">
                {t(feature.titleKey)}
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t(feature.descKey)}
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

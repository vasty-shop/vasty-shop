import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Store, Package, TrendingUp, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useShopStore } from '@/stores/useShopStore';
import { usePlatformSettings } from '@/contexts/PlatformSettingsContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const SellOnVastySection: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { shops, currentShop } = useShopStore();
  const { settings } = usePlatformSettings();
  const navigate = useNavigate();

  const features = [
    { icon: Store, titleKey: 'platform.sellSection.easySetup', descKey: 'platform.sellSection.easySetupDesc' },
    { icon: Package, titleKey: 'platform.sellSection.productManagement', descKey: 'platform.sellSection.productManagementDesc' },
    { icon: TrendingUp, titleKey: 'platform.sellSection.analytics', descKey: 'platform.sellSection.analyticsDesc' },
    { icon: Users, titleKey: 'platform.sellSection.reachCustomers', descKey: 'platform.sellSection.reachCustomersDesc' },
  ];

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      navigate('/signup', { state: { from: '/vendor/create-shop', message: 'Sign up to create your store' } });
    } else {
      navigate('/vendor/create-shop');
    }
  };

  const handleGoToStore = () => {
    if (currentShop) {
      navigate(`/shop/${currentShop.id}/vendor/dashboard`);
    } else if (shops.length > 0) {
      navigate(`/shop/${shops[0].id}/vendor/dashboard`);
    }
  };

  // User has a store - show "Go to Store" CTA
  if (isAuthenticated && shops.length > 0) {
    return (
      <section className="w-full py-12 md:py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-white/5 backdrop-blur-sm border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary-lime/20 rounded-full flex items-center justify-center">
                    <Store className="w-8 h-8 text-primary-lime" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {currentShop?.name || shops[0]?.name || t('platform.sellSection.yourStore')}
                    </h3>
                    <p className="text-gray-400">
                      {t('platform.sellSection.manageStore')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleGoToStore}
                    className="bg-primary-lime hover:bg-primary-lime/90 text-white"
                  >
                    {t('platform.sellSection.goToDashboard')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  {shops.length < 3 && (
                    <Button
                      variant="outline"
                      onClick={() => navigate('/vendor/create-shop')}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      {t('platform.sellSection.createAnotherStore')}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  // No store - show "Start Selling" CTA
  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-2 bg-primary-lime/20 text-primary-lime rounded-full text-sm font-medium mb-6">
                {t('platform.sellSection.startYourBusiness')}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                {t('platform.sellSection.sellOn')} <span className="text-primary-lime">{settings.platformName}</span>
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                {t('platform.sellSection.sellDescription')}
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.titleKey}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-10 h-10 bg-primary-lime/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary-lime" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{t(feature.titleKey)}</h4>
                      <p className="text-xs text-gray-400">{t(feature.descKey)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-primary-lime hover:bg-primary-lime/90 text-white px-8"
                >
                  {isAuthenticated ? t('platform.sellSection.createYourStore') : t('platform.sellSection.getStartedFree')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Link to="/about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                  >
                    {t('platform.sellSection.learnMore')}
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary-lime" />
                  <span className="text-sm text-gray-400">{t('platform.sellSection.noMonthlyFees')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary-lime" />
                  <span className="text-sm text-gray-400">{t('platform.sellSection.freeToStart')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary-lime" />
                  <span className="text-sm text-gray-400">{t('platform.sellSection.support247')}</span>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-primary-lime mb-2">10K+</div>
                  <div className="text-sm text-gray-400">{t('platform.sellSection.activeSellers')}</div>
                </Card>
                <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-primary-lime mb-2">1M+</div>
                  <div className="text-sm text-gray-400">{t('platform.sellSection.productsListed')}</div>
                </Card>
                <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-primary-lime mb-2">5M+</div>
                  <div className="text-sm text-gray-400">{t('platform.sellSection.happyCustomers')}</div>
                </Card>
                <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-primary-lime mb-2">99%</div>
                  <div className="text-sm text-gray-400">{t('platform.sellSection.sellerSatisfaction')}</div>
                </Card>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-lime/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent-blue/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellOnVastySection;

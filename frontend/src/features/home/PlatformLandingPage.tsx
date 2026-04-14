'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

// Landing Page Components
import {
  PlatformNavbar,
  PlatformHeroSection,
  HowItWorksSection,
  PlatformFeaturesSection,
  MarketplacePreviewSection,
  PricingSection,
  FinalCTASection,
  PlatformFooter,
} from '@/components/landing';

/**
 * PlatformLandingPage Component
 *
 * The main marketing landing page for Vasty - showcasing the hybrid marketplace
 * that combines Shopify's independence with Amazon's discovery.
 *
 * Sections:
 * 1. PlatformNavbar - Sticky navigation with scroll-to-section links
 * 2. PlatformHeroSection - Animated hero with stats and CTAs
 * 3. HowItWorksSection - Step-by-step guide for sellers and buyers
 * 4. PlatformFeaturesSection - Feature showcase with hover details
 * 5. MarketplacePreviewSection - Preview of marketplace discovery
 * 6. PricingSection - Pricing tiers with Shopify comparison
 * 7. FinalCTASection - Final call-to-action
 * 8. PlatformFooter - Footer with links and newsletter
 */
export default function PlatformLandingPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  // Handle hash navigation when page loads
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.slice(1); // Remove the # symbol
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const yOffset = -80;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100); // Small delay to ensure page is rendered
    }
  }, [location.hash]);

  // Handle scroll events for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Enable smooth scrolling */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Navigation */}
      <PlatformNavbar />

      {/* Main Content */}
      <main className="w-full">
        {/* Hero Section */}
        <PlatformHeroSection />

        {/* How It Works */}
        <HowItWorksSection />

        {/* Platform Features */}
        <PlatformFeaturesSection />

        {/* Marketplace Preview */}
        <MarketplacePreviewSection />

        {/* Pricing */}
        <PricingSection />

        {/* Final CTA */}
        <FinalCTASection />
      </main>

      {/* Footer */}
      <PlatformFooter />

      {/* Fixed App Store Buttons & Demo Panel - Right Center */}
      <div
        className="flex flex-col gap-2"
        style={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 9999
        }}
      >
        {/* Google Play Button */}
        <div className="flex flex-col items-end mr-4">
          <div
            className="flex items-center gap-3 bg-gray-900 rounded px-4 py-2.5 shadow-lg border border-gray-400 cursor-not-allowed w-[165px]"
          >
            {/* Google Play Icon */}
            <svg viewBox="0 0 511.999 511.999" className="w-8 h-8 flex-shrink-0">
              <path fill="#32BBFF" d="M382.369,175.623C322.891,142.356,227.427,88.937,79.355,6.028C69.372-0.565,57.886-1.429,47.962,1.93l254.05,254.05L382.369,175.623z"/>
              <path fill="#32BBFF" d="M47.962,1.93c-1.86,0.63-3.67,1.39-5.401,2.308C31.602,10.166,23.549,21.573,23.549,36v439.96c0,14.427,8.052,25.834,19.012,31.761c1.728,0.917,3.537,1.68,5.395,2.314L302.012,255.98L47.962,1.93z"/>
              <path fill="#32BBFF" d="M302.012,255.98L47.956,510.035c9.927,3.384,21.413,2.586,31.399-4.103c143.598-80.41,237.986-133.196,298.152-166.746c1.675-0.941,3.316-1.861,4.938-2.772L302.012,255.98z"/>
              <path fill="#2C9FD9" d="M23.549,255.98v219.98c0,14.427,8.052,25.834,19.012,31.761c1.728,0.917,3.537,1.68,5.395,2.314L302.012,255.98H23.549z"/>
              <path fill="#29CC5E" d="M79.355,6.028C67.5-1.8,53.52-1.577,42.561,4.239l255.595,255.596l84.212-84.212C322.891,142.356,227.427,88.937,79.355,6.028z"/>
              <path fill="#D93F21" d="M298.158,252.126L42.561,507.721c10.96,5.815,24.939,6.151,36.794-1.789c143.598-80.41,237.986-133.196,298.152-166.746c1.675-0.941,3.316-1.861,4.938-2.772L298.158,252.126z"/>
              <path fill="#FFD500" d="M488.45,255.98c0-12.19-6.151-24.492-18.342-31.314c0,0-22.799-12.721-92.682-51.809l-83.123,83.123l83.204,83.205c69.116-38.807,92.6-51.892,92.6-51.892C482.299,280.472,488.45,268.17,488.45,255.98z"/>
              <path fill="#FFAA00" d="M470.108,287.294c12.191-6.822,18.342-19.124,18.342-31.314H294.303l83.204,83.205C446.624,300.379,470.108,287.294,470.108,287.294z"/>
            </svg>
            <div className="text-left">
              <div className="text-[8px] text-gray-400 leading-none uppercase tracking-wide">{t('platform.demoAccess.getItOn')}</div>
              <div className="text-sm text-white font-semibold leading-tight">{t('platform.demoAccess.googlePlay')}</div>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium mt-1">{t('platform.demoAccess.comingSoon')}</span>
        </div>

        {/* App Store Button */}
        <div className="flex flex-col items-end mr-4">
          <div
            className="flex items-center gap-3 bg-gray-900 rounded px-4 py-2.5 shadow-lg border border-gray-400 cursor-not-allowed w-[165px]"
          >
            {/* Apple Icon */}
            <svg viewBox="0 0 24 24" className="w-8 h-8 flex-shrink-0" fill="white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div className="text-left">
              <div className="text-[8px] text-gray-400 leading-none">{t('platform.demoAccess.downloadOn')}</div>
              <div className="text-sm text-white font-semibold leading-tight">{t('platform.demoAccess.appStore')}</div>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium mt-1">{t('platform.demoAccess.comingSoon')}</span>
        </div>

        {/* Demo Credentials Panel - Expandable */}
        <div className="bg-gray-900 rounded shadow-lg overflow-hidden mr-4 w-[165px] border border-gray-400">
          {/* Header - Always Visible */}
          <button
            onClick={() => setShowDemoCredentials(!showDemoCredentials)}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-[11px] text-gray-200 font-semibold">{t('platform.demoAccess.title')}</span>
            </div>
            {showDemoCredentials ? (
              <ChevronUp className="w-4 h-4 text-gray-200" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-200" />
            )}
          </button>

          {/* Expandable Content */}
          <AnimatePresence>
            {showDemoCredentials && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 space-y-2">
                  {/* Admin */}
                  <div className="border-l-2 border-red-500 pl-2">
                    <div className="text-[10px] text-red-400 font-semibold">{t('platform.demoAccess.roles.admin')}</div>
                    <div className="text-[10px] text-gray-300 font-mono">admin@demo.vasty.shop</div>
                    <div className="text-[10px] text-gray-500 font-mono">Demo@123</div>
                  </div>

                  {/* Vendor */}
                  <div className="border-l-2 border-blue-500 pl-2">
                    <div className="text-[10px] text-blue-400 font-semibold">{t('platform.demoAccess.roles.vendor')}</div>
                    <div className="text-[10px] text-gray-300 font-mono">vendor@demo.vasty.shop</div>
                    <div className="text-[10px] text-gray-500 font-mono">Demo@123</div>
                  </div>

                  {/* Customer */}
                  <div className="border-l-2 border-green-500 pl-2">
                    <div className="text-[10px] text-green-400 font-semibold">{t('platform.demoAccess.roles.customer')}</div>
                    <div className="text-[10px] text-gray-300 font-mono">customer@demo.vasty.shop</div>
                    <div className="text-[10px] text-gray-500 font-mono">Demo@123</div>
                  </div>

                  {/* Delivery */}
                  <div className="border-l-2 border-orange-500 pl-2">
                    <div className="text-[10px] text-orange-400 font-semibold">{t('platform.demoAccess.roles.delivery')}</div>
                    <div className="text-[10px] text-gray-300 font-mono">delivery@demo.vasty.shop</div>
                    <div className="text-[10px] text-gray-500 font-mono">Demo@123</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-primary-lime to-emerald-500 text-white rounded-full shadow-lg shadow-primary-lime/30 hover:shadow-xl hover:shadow-primary-lime/40 transition-all duration-300 flex items-center justify-center group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-6 h-6 md:w-7 md:h-7 group-hover:-translate-y-1 transition-transform duration-200" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

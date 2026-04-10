'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  Sparkles,
  Palette,
  ShoppingCart,
  Truck,
  BarChart3,
  CreditCard,
  Zap,
  Smartphone,
  Users,
  Target,
  ArrowRight,
  Shield,
  Globe,
  Bell,
  Package,
  Gift,
  Star,
} from 'lucide-react';
import { FeatureShowcase } from './FeatureShowcase';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { PlatformNavbar, PlatformFooter } from '@/components/landing';

const features = [
  {
    id: 'ai-storefront-builder',
    icon: Palette,
    title: 'AI-Powered Storefront Builder',
    tagline: 'Design Without Limits',
    description:
      'Create stunning, professional storefronts in minutes. Our AI understands your brand and generates beautiful designs automatically. Just describe what you want, and watch your dream store come to life with drag-and-drop customization.',
    features: [
      'AI-generated store designs from text prompts',
      'Drag-and-drop customization with live preview',
      'Mobile-responsive themes that look great everywhere',
      'Custom color schemes, fonts, and layouts',
    ],
    color: 'purple' as const,
    mediaType: 'video' as const,
    mediaSrc: '/store-front.mp4',
  },
  {
    id: 'instant-mobile-app',
    icon: Smartphone,
    title: 'Instant Mobile App',
    tagline: 'Your Brand, Native Experience',
    description:
      'Get your own branded mobile app automatically generated from your store. Your customers can shop on iOS and Android with a seamless native experience. Download ready-to-publish app packages with your branding.',
    features: [
      'Auto-generated iOS and Android apps',
      'Push notifications for orders and promotions',
      'Native checkout and payment experience',
      'App store ready packages',
    ],
    color: 'cyan' as const,
    mediaType: 'video' as const,
    mediaSrc: '/videos/mobile-app.mp4',
  },
  {
    id: 'smart-order-management',
    icon: ShoppingCart,
    title: 'Smart Order Management',
    tagline: 'Effortless Operations',
    description:
      'Manage all orders from one powerful dashboard. Real-time updates, batch operations, automated status notifications. Track orders from pending to delivered with complete visibility and control.',
    features: [
      'Real-time order tracking and status updates',
      'Batch operations for efficient processing',
      'Automated customer notifications at every step',
      'Order notes, tags, and priority management',
    ],
    color: 'blue' as const,
    mediaType: 'video' as const,
    mediaSrc: '/videos/order-management.mp4',
  },
  {
    id: 'delivery-ecosystem',
    icon: Truck,
    title: 'Complete Delivery Ecosystem',
    tagline: 'End-to-End Logistics',
    description:
      'Built-in delivery management with your own delivery team. Draw delivery zones on the map, assign drivers, track deliveries in real-time. Customers see live tracking from pickup to doorstep.',
    features: [
      'Add and manage your own delivery team',
      'Visual delivery zone mapping with custom rates',
      'Real-time GPS tracking for customers',
      'Driver earnings, ratings, and performance tracking',
    ],
    color: 'emerald' as const,
    mediaType: 'video' as const,
    mediaSrc: '/videos/delivery.mp4',
  },
  {
    id: 'powerful-analytics',
    icon: BarChart3,
    title: 'Powerful Analytics Dashboard',
    tagline: 'Data-Driven Growth',
    description:
      'Make informed decisions with comprehensive analytics. Track sales, revenue, top products, customer behavior, and growth trends. Beautiful charts and exportable reports to understand your business.',
    features: [
      'Real-time sales and revenue tracking',
      'Product performance and inventory insights',
      'Customer behavior and retention analytics',
      'Exportable reports in CSV and PDF formats',
    ],
    color: 'orange' as const,
    mediaType: 'image' as const,
    mediaSrc: '/images/analytics.png',
  },
  {
    id: 'integrated-payments',
    icon: CreditCard,
    title: 'Secure Payment Processing',
    tagline: 'Accept Every Payment',
    description:
      'Accept cards, Apple Pay, Google Pay, and more with Stripe integration. Secure, PCI-compliant payment processing with automatic payouts to your bank. Cash on delivery support for local businesses.',
    features: [
      'Stripe integration for cards and digital wallets',
      'Cash on delivery option for local markets',
      'Automatic payouts to your bank account',
      'Detailed transaction history and reporting',
    ],
    color: 'blue' as const,
    mediaType: 'video' as const,
    mediaSrc: '/videos/payments.mp4',
  },
  {
    id: 'marketing-tools',
    icon: Target,
    title: 'Built-in Marketing Tools',
    tagline: 'Grow Your Sales',
    description:
      'Boost sales with flash deals, coupon codes, and promotional campaigns. Create urgency with countdown timers, bundle products, and target the right customers with smart segmentation.',
    features: [
      'Flash sales with countdown timers',
      'Flexible coupon codes and discount rules',
      'Campaign scheduling and automation',
      'Customer segmentation for targeted offers',
    ],
    color: 'pink' as const,
    mediaType: 'video' as const,
    mediaSrc: '/videos/marketing.mp4',
  },
  {
    id: 'team-collaboration',
    icon: Users,
    title: 'Team Collaboration',
    tagline: 'Work Together',
    description:
      'Invite team members with role-based permissions. From admins to order managers to delivery coordinators - everyone gets the right access level. Activity logs keep everyone accountable.',
    features: [
      'Role-based access control',
      'Team member invitation and management',
      'Activity logs and audit trails',
      'Department-specific dashboards',
    ],
    color: 'cyan' as const,
    mediaType: 'image' as const,
    mediaSrc: '/images/team.png',
  },
  {
    id: 'product-management',
    icon: Package,
    title: 'Advanced Product Management',
    tagline: 'Catalog Made Easy',
    description:
      'Add products with our intelligent, fully dynamic form. Support for variants (size, color), multiple images, inventory tracking, and SKU management. Bulk edit prices and stock across all products.',
    features: [
      'Unlimited product variants and attributes',
      'Multi-image galleries with drag-and-drop',
      'Real-time inventory tracking and alerts',
      'Bulk editing and import/export tools',
    ],
    color: 'purple' as const,
    mediaType: 'video' as const,
    mediaSrc: '/videos/products.mp4',
  },
  {
    id: 'reviews-ratings',
    icon: Star,
    title: 'Reviews & Ratings System',
    tagline: 'Build Customer Trust',
    description:
      'Build credibility with verified customer reviews. Photo reviews, star ratings, and verified purchase badges help new customers make confident decisions. Respond to reviews to show you care.',
    features: [
      'Verified purchase badges',
      'Photo and video reviews support',
      'Review moderation and response tools',
      'Rating aggregation and display',
    ],
    color: 'orange' as const,
    mediaType: 'image' as const,
    mediaSrc: '/images/reviews.png',
  },
];

export default function FeaturesPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-slate-900">
      <PlatformNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/2 -left-32 w-[400px] h-[400px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(132, 204, 22, 0.2) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary-lime" />
            <span className="text-sm font-medium text-gray-300">
              Powerful E-commerce Features
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-primary-lime to-emerald-400 bg-clip-text text-transparent">
              Succeed Online
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-10"
          >
            From AI-powered store creation to delivery management, Vasty Shop gives
            you all the tools to build, grow, and scale your online business.
          </motion.p>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto"
          >
            {[
              { value: '2', label: 'Months FREE', icon: Gift, color: 'from-emerald-500 to-teal-500' },
              { value: '20+', label: 'Core Features', icon: Zap, color: 'from-purple-500 to-pink-500' },
              { value: '9+', label: 'Languages', icon: Globe, color: 'from-blue-500 to-cyan-500' },
              { value: '24/7', label: 'Support', icon: Shield, color: 'from-orange-500 to-amber-500' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 rounded-2xl blur-xl transition-opacity duration-300" style={{ background: `linear-gradient(135deg, ${stat.color.includes('emerald') ? 'rgba(16,185,129,0.3)' : stat.color.includes('purple') ? 'rgba(139,92,246,0.3)' : stat.color.includes('blue') ? 'rgba(59,130,246,0.3)' : 'rgba(249,115,22,0.3)'} 0%, transparent 100%)` }} />
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 text-center hover:border-slate-600/50 transition-all duration-300">
                  <div className={`w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-32">
          {features.map((feature, index) => (
            <FeatureShowcase
              key={feature.id}
              id={feature.id}
              icon={feature.icon}
              title={feature.title}
              tagline={feature.tagline}
              description={feature.description}
              features={feature.features}
              color={feature.color}
              direction={index % 2 === 0 ? 'left' : 'right'}
              mediaType={feature.mediaType}
              mediaSrc={feature.mediaSrc}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Additional Highlights */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              And Much More...
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Additional features that make Vasty Shop the complete solution for your business
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: '9+ Languages', desc: 'Reach global customers with multi-language support' },
              { icon: Shield, title: 'Enterprise Security', desc: 'PCI-compliant with end-to-end encryption' },
              { icon: Bell, title: 'Smart Notifications', desc: 'Push, email, and SMS alerts for everything' },
              { icon: Gift, title: 'Loyalty Programs', desc: 'Reward your best customers automatically' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for speed and performance' },
              { icon: Store, title: 'Multi-Store', desc: 'Manage multiple stores from one account' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-lime/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary-lime" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 overflow-hidden">
            {/* Background glow */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, rgba(132, 204, 22, 0.3) 0%, transparent 60%)',
              }}
            />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Launch Your Store?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Join thousands of sellers using Vasty Shop to grow their business.
                Start with 2 months FREE - no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-primary-lime to-emerald-500 hover:from-primary-lime/90 hover:to-emerald-500/90 text-white px-8 py-6 text-base font-semibold shadow-lg shadow-primary-lime/20 hover:shadow-xl hover:shadow-primary-lime/30 transition-all group">
                    Start Free - 2 Months on Us
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/#pricing">
                  <Button
                    variant="outline"
                    className="border-2 border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-500 text-white px-8 py-6 text-base font-semibold"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <PlatformFooter />
    </div>
  );
}

export { FeaturesPage };

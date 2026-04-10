import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Map,
  Home,
  Search,
  ShoppingBag,
  User,
  Store,
  Heart,
  ShoppingCart,
  Settings,
  FileText,
  HelpCircle,
  Mail,
  Building,
  Truck,
  CreditCard,
  Tag,
  Star,
  Shield,
  ChevronRight
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';

interface SitemapSection {
  titleKey: string;
  icon: React.ElementType;
  links: { labelKey: string; descKey: string; href: string }[];
}

export const SitemapPage: React.FC = () => {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('legal.sitemap.breadcrumb'), href: '/sitemap' },
    { label: t('legal.sitemap.title') },
  ];

  const sitemapSections: SitemapSection[] = [
    {
      titleKey: 'legal.sitemap.sections.mainPages',
      icon: Home,
      links: [
        { labelKey: 'legal.sitemap.links.home', descKey: 'legal.sitemap.links.homeDesc', href: '/' },
        { labelKey: 'legal.sitemap.links.explore', descKey: 'legal.sitemap.links.exploreDesc', href: '/explore' },
        { labelKey: 'legal.sitemap.links.categories', descKey: 'legal.sitemap.links.categoriesDesc', href: '/categories' },
        { labelKey: 'legal.sitemap.links.offers', descKey: 'legal.sitemap.links.offersDesc', href: '/offers' },
      ]
    },
    {
      titleKey: 'legal.sitemap.sections.shopping',
      icon: ShoppingBag,
      links: [
        { labelKey: 'legal.sitemap.links.products', descKey: 'legal.sitemap.links.productsDesc', href: '/products' },
        { labelKey: 'legal.sitemap.links.cart', descKey: 'legal.sitemap.links.cartDesc', href: '/cart' },
        { labelKey: 'legal.sitemap.links.checkout', descKey: 'legal.sitemap.links.checkoutDesc', href: '/checkout' },
        { labelKey: 'legal.sitemap.links.wishlist', descKey: 'legal.sitemap.links.wishlistDesc', href: '/wishlist' },
      ]
    },
    {
      titleKey: 'legal.sitemap.sections.account',
      icon: User,
      links: [
        { labelKey: 'legal.sitemap.links.login', descKey: 'legal.sitemap.links.loginDesc', href: '/login' },
        { labelKey: 'legal.sitemap.links.register', descKey: 'legal.sitemap.links.registerDesc', href: '/register' },
        { labelKey: 'legal.sitemap.links.profile', descKey: 'legal.sitemap.links.profileDesc', href: '/profile' },
        { labelKey: 'legal.sitemap.links.orders', descKey: 'legal.sitemap.links.ordersDesc', href: '/orders' },
        { labelKey: 'legal.sitemap.links.trackOrder', descKey: 'legal.sitemap.links.trackOrderDesc', href: '/track-order' },
      ]
    },
    {
      titleKey: 'legal.sitemap.sections.sellerHub',
      icon: Store,
      links: [
        { labelKey: 'legal.sitemap.links.becomeSeller', descKey: 'legal.sitemap.links.becomeSellerDesc', href: '/vendor/create-shop' },
        { labelKey: 'legal.sitemap.links.vendorDashboard', descKey: 'legal.sitemap.links.vendorDashboardDesc', href: '/vendor/dashboard' },
        { labelKey: 'legal.sitemap.links.productsManagement', descKey: 'legal.sitemap.links.productsManagementDesc', href: '/vendor/products' },
        { labelKey: 'legal.sitemap.links.ordersManagement', descKey: 'legal.sitemap.links.ordersManagementDesc', href: '/vendor/orders' },
        { labelKey: 'legal.sitemap.links.shopSettings', descKey: 'legal.sitemap.links.shopSettingsDesc', href: '/vendor/settings' },
        { labelKey: 'legal.sitemap.links.analytics', descKey: 'legal.sitemap.links.analyticsDesc', href: '/vendor/analytics' },
      ]
    },
    {
      titleKey: 'legal.sitemap.sections.deliveryPartners',
      icon: Truck,
      links: [
        { labelKey: 'legal.sitemap.links.deliveryLogin', descKey: 'legal.sitemap.links.deliveryLoginDesc', href: '/delivery/login' },
        { labelKey: 'legal.sitemap.links.deliveryDashboard', descKey: 'legal.sitemap.links.deliveryDashboardDesc', href: '/delivery/dashboard' },
        { labelKey: 'legal.sitemap.links.availableOrders', descKey: 'legal.sitemap.links.availableOrdersDesc', href: '/delivery/orders' },
        { labelKey: 'legal.sitemap.links.earnings', descKey: 'legal.sitemap.links.earningsDesc', href: '/delivery/earnings' },
      ]
    },
    {
      titleKey: 'legal.sitemap.sections.company',
      icon: Building,
      links: [
        { labelKey: 'legal.sitemap.links.aboutUs', descKey: 'legal.sitemap.links.aboutUsDesc', href: '/about' },
        { labelKey: 'legal.sitemap.links.press', descKey: 'legal.sitemap.links.pressDesc', href: '/press' },
        { labelKey: 'legal.sitemap.links.contactUs', descKey: 'legal.sitemap.links.contactUsDesc', href: '/contact' },
      ]
    },
    {
      titleKey: 'legal.sitemap.sections.legal',
      icon: Shield,
      links: [
        { labelKey: 'legal.sitemap.links.privacyPolicy', descKey: 'legal.sitemap.links.privacyPolicyDesc', href: '/privacy' },
        { labelKey: 'legal.sitemap.links.termsOfService', descKey: 'legal.sitemap.links.termsOfServiceDesc', href: '/terms' },
        { labelKey: 'legal.sitemap.links.cookiePolicy', descKey: 'legal.sitemap.links.cookiePolicyDesc', href: '/cookies' },
        { labelKey: 'legal.sitemap.links.dataDeletion', descKey: 'legal.sitemap.links.dataDeletionDesc', href: '/data-deletion' },
        { labelKey: 'legal.sitemap.links.shippingPolicy', descKey: 'legal.sitemap.links.shippingPolicyDesc', href: '/shipping' },
      ]
    },
    {
      titleKey: 'legal.sitemap.sections.helpSupport',
      icon: HelpCircle,
      links: [
        { labelKey: 'legal.sitemap.links.helpCenter', descKey: 'legal.sitemap.links.helpCenterDesc', href: '/help' },
        { labelKey: 'legal.sitemap.links.faqs', descKey: 'legal.sitemap.links.faqsDesc', href: '/faqs' },
        { labelKey: 'legal.sitemap.links.contactSupport', descKey: 'legal.sitemap.links.contactSupportDesc', href: '/contact' },
      ]
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <BreadcrumbNavigation items={breadcrumbItems} />
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Map className="w-12 h-12 text-primary-lime" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('legal.sitemap.title')}</h1>
            <p className="text-lg text-gray-300 mb-6">
              {t('legal.sitemap.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sitemapSections.map((section) => (
                <div
                  key={section.titleKey}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary-lime/10 rounded-lg flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary-lime" />
                    </div>
                    <h2 className="text-lg font-bold text-text-primary">{t(section.titleKey)}</h2>
                  </div>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          className="group flex items-start gap-2 text-text-secondary hover:text-primary-lime transition-colors"
                        >
                          <ChevronRight className="w-4 h-4 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div>
                            <span className="font-medium">{t(link.labelKey)}</span>
                            <p className="text-xs text-gray-400 mt-0.5">{t(link.descKey)}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Additional Resources */}
            <div className="mt-12 bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <Search className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-text-primary mb-2">{t('legal.sitemap.cantFind.title')}</h3>
              <p className="text-text-secondary mb-6">
                {t('legal.sitemap.cantFind.description')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-lime text-white font-medium rounded-lg hover:bg-primary-lime/90 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  {t('legal.sitemap.cantFind.searchBtn')}
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-text-primary font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {t('legal.sitemap.cantFind.contactBtn')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SitemapPage;

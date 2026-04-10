import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  ChevronRight,
  Copy,
  Check,
  Menu,
  X
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';

interface DocSection {
  id: string;
  titleKey: string;
  subsections?: { id: string; titleKey: string }[];
}

export const HelpCenterPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('introduction');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sections: DocSection[] = [
    { id: 'introduction', titleKey: 'helpCenter.nav.introduction' },
    { id: 'quick-start', titleKey: 'helpCenter.nav.quickStart' },
    {
      id: 'for-vendors',
      titleKey: 'helpCenter.nav.forVendors',
      subsections: [
        { id: 'create-store', titleKey: 'helpCenter.vendorNav.createStore' },
        { id: 'vendor-dashboard', titleKey: 'helpCenter.vendorNav.vendorDashboard' },
        { id: 'add-products', titleKey: 'helpCenter.vendorNav.addProducts' },
        { id: 'manage-orders', titleKey: 'helpCenter.vendorNav.manageOrders' },
        { id: 'storefront-builder', titleKey: 'helpCenter.vendorNav.storefrontBuilder' },
        { id: 'ai-features', titleKey: 'helpCenter.vendorNav.aiFeatures' },
        { id: 'mobile-app', titleKey: 'helpCenter.vendorNav.mobileApp' },
        { id: 'analytics', titleKey: 'helpCenter.vendorNav.analytics' },
        { id: 'delivery-setup', titleKey: 'helpCenter.vendorNav.deliverySetup' },
        { id: 'team-management', titleKey: 'helpCenter.vendorNav.teamManagement' },
      ]
    },
    {
      id: 'for-customers',
      titleKey: 'helpCenter.nav.forCustomers',
      subsections: [
        { id: 'browse-shop', titleKey: 'helpCenter.customerNav.browseShop' },
        { id: 'cart-checkout', titleKey: 'helpCenter.customerNav.cartCheckout' },
        { id: 'track-orders', titleKey: 'helpCenter.customerNav.trackOrders' },
        { id: 'reviews-wishlist', titleKey: 'helpCenter.customerNav.reviewsWishlist' },
      ]
    },
    {
      id: 'for-delivery',
      titleKey: 'helpCenter.nav.forDelivery',
      subsections: [
        { id: 'how-delivery-works', titleKey: 'helpCenter.deliveryNav.howDeliveryWorks' },
        { id: 'delivery-dashboard', titleKey: 'helpCenter.deliveryNav.deliveryDashboard' },
        { id: 'earnings', titleKey: 'helpCenter.deliveryNav.earnings' },
      ]
    },
    {
      id: 'pricing-plans',
      titleKey: 'helpCenter.nav.pricingPlans'
    },
    {
      id: 'payments',
      titleKey: 'helpCenter.nav.payments'
    },
    {
      id: 'support',
      titleKey: 'helpCenter.nav.support'
    },
  ];

  const copyLink = (sectionId: string) => {
    const url = `${window.location.origin}/help#${sectionId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(sectionId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const SectionHeader = ({ id, title }: { id: string; title: string }) => (
    <div className="flex items-center gap-2 group mb-4">
      <h2 id={id} className="text-2xl font-bold text-gray-900 scroll-mt-24">{title}</h2>
      <button
        onClick={() => copyLink(id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
        title={t('helpCenter.copyLink')}
      >
        {copiedLink === id ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400" />
        )}
      </button>
    </div>
  );

  const SubHeader = ({ id, title }: { id: string; title: string }) => (
    <div className="flex items-center gap-2 group mb-3 mt-8">
      <h3 id={id} className="text-xl font-semibold text-gray-800 scroll-mt-24">{title}</h3>
      <button
        onClick={() => copyLink(id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
        title={t('helpCenter.copyLink')}
      >
        {copiedLink === id ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400" />
        )}
      </button>
    </div>
  );

  const StepItem = ({ number, title, children, link, linkText }: {
    number: number;
    title: string;
    children: React.ReactNode;
    link?: string;
    linkText?: string;
  }) => (
    <div className="flex gap-4 mb-6">
      <div className="flex-shrink-0 w-8 h-8 bg-primary-lime text-white rounded-full flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
        <div className="text-gray-600 leading-relaxed">{children}</div>
        {link && (
          <Link
            to={link}
            className="inline-flex items-center gap-1 mt-3 text-primary-lime hover:underline font-medium"
          >
            {linkText || t('helpCenter.goToPage')} <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );

  const CodeBlock = ({ children }: { children: string }) => (
    <code className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">
      {children}
    </code>
  );

  const LinkCard = ({ href, title, description }: { href: string; title: string; description: string }) => (
    <Link
      to={href}
      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-lime hover:shadow-md transition-all group"
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-900 group-hover:text-primary-lime">{title}</h4>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-lime" />
      </div>
    </Link>
  );

  const Table = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, i) => (
              <th key={i} className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-gray-600">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Helper to render HTML content from translations
  const HtmlContent = ({ html, className }: { html: string; className?: string }) => (
    <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 w-14 h-14 bg-primary-lime text-white rounded-full shadow-lg flex items-center justify-center"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:sticky top-0 left-0 z-40 w-72 h-screen bg-white border-r border-gray-200 overflow-y-auto transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
            <div className="flex items-center gap-2 text-primary-lime">
              <BookOpen className="w-6 h-6" />
              <span className="font-bold text-lg">{t('helpCenter.docsTitle')}</span>
            </div>
          </div>

          <nav className="p-4">
            {sections.map((section) => (
              <div key={section.id} className="mb-2">
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeSection === section.id
                      ? "bg-primary-lime/10 text-primary-lime"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {t(section.titleKey)}
                </button>
                {section.subsections && (
                  <div className="ml-4 mt-1 space-y-1">
                    {section.subsections.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => scrollToSection(sub.id)}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded text-sm transition-colors",
                          activeSection === sub.id
                            ? "text-primary-lime font-medium"
                            : "text-gray-500 hover:text-gray-900"
                        )}
                      >
                        {t(sub.titleKey)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-12">

          {/* Introduction */}
          <section className="mb-16">
            <SectionHeader id="introduction" title={t('helpCenter.introduction.title')} />
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              <HtmlContent html={t('helpCenter.introduction.welcome')} />
            </p>

            <div className="bg-gradient-to-r from-primary-lime/10 to-emerald-50 border border-primary-lime/20 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">{t('helpCenter.introduction.whatIsVasty')}</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• <HtmlContent html={t('helpCenter.introduction.features.multiVendor')} /></li>
                <li>• <HtmlContent html={t('helpCenter.introduction.features.aiPowered')} /></li>
                <li>• <HtmlContent html={t('helpCenter.introduction.features.mobileApp')} /></li>
                <li>• <HtmlContent html={t('helpCenter.introduction.features.payments')} /></li>
                <li>• <HtmlContent html={t('helpCenter.introduction.features.delivery')} /></li>
              </ul>
            </div>

            <h4 className="font-semibold text-gray-900 mb-3">{t('helpCenter.introduction.userTypes')}</h4>
            <Table
              headers={t('helpCenter.introduction.table.headers', { returnObjects: true }) as string[]}
              rows={[
                t('helpCenter.introduction.table.vendor', { returnObjects: true }) as string[],
                t('helpCenter.introduction.table.customer', { returnObjects: true }) as string[],
                t('helpCenter.introduction.table.deliveryPartner', { returnObjects: true }) as string[],
                t('helpCenter.introduction.table.admin', { returnObjects: true }) as string[],
              ]}
            />
          </section>

          {/* Quick Start */}
          <section className="mb-16">
            <SectionHeader id="quick-start" title={t('helpCenter.quickStart.title')} />
            <p className="text-gray-600 mb-6">{t('helpCenter.quickStart.subtitle')}</p>

            <StepItem number={1} title={t('helpCenter.quickStart.step1.title')} link="/register" linkText={t('helpCenter.quickStart.step1.linkText')}>
              {t('helpCenter.quickStart.step1.description')}
            </StepItem>

            <StepItem number={2} title={t('helpCenter.quickStart.step2.title')}>
              <ul className="list-disc list-inside space-y-1">
                <li><HtmlContent html={t('helpCenter.quickStart.step2.wantToSell')} /></li>
                <li><HtmlContent html={t('helpCenter.quickStart.step2.wantToShop')} /></li>
                <li><HtmlContent html={t('helpCenter.quickStart.step2.wantToDeliver')} /></li>
              </ul>
            </StepItem>

            <StepItem number={3} title={t('helpCenter.quickStart.step3.title')} link="/explore" linkText={t('helpCenter.quickStart.step3.linkText')}>
              {t('helpCenter.quickStart.step3.description')}
            </StepItem>

            <div className="grid md:grid-cols-2 gap-4 mt-8">
              <LinkCard href="/vendor/create-shop" title={t('helpCenter.quickStart.cards.startSelling')} description={t('helpCenter.quickStart.cards.startSellingDesc')} />
              <LinkCard href="/explore" title={t('helpCenter.quickStart.cards.startShopping')} description={t('helpCenter.quickStart.cards.startShoppingDesc')} />
            </div>
          </section>

          {/* For Vendors */}
          <section className="mb-16">
            <SectionHeader id="for-vendors" title={t('helpCenter.forVendors.title')} />
            <p className="text-gray-600 mb-8">
              {t('helpCenter.forVendors.subtitle')}
            </p>

            <SubHeader id="create-store" title={t('helpCenter.forVendors.createStore.title')} />
            <StepItem number={1} title={t('helpCenter.forVendors.createStore.step1.title')} link="/vendor/create-shop" linkText={t('helpCenter.forVendors.createStore.step1.linkText')}>
              <HtmlContent html={t('helpCenter.forVendors.createStore.step1.description').replace('<code>', '<code class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">').replace('</code>', '</code>')} />
            </StepItem>
            <StepItem number={2} title={t('helpCenter.forVendors.createStore.step2.title')}>
              <ul className="list-disc list-inside space-y-1">
                <li><HtmlContent html={t('helpCenter.forVendors.createStore.step2.storeName')} /></li>
                <li><HtmlContent html={t('helpCenter.forVendors.createStore.step2.storeDescription')} /></li>
                <li><HtmlContent html={t('helpCenter.forVendors.createStore.step2.category')} /></li>
                <li><HtmlContent html={t('helpCenter.forVendors.createStore.step2.logoBanner')} /></li>
              </ul>
            </StepItem>
            <StepItem number={3} title={t('helpCenter.forVendors.createStore.step3.title')} link="/#pricing" linkText={t('helpCenter.forVendors.createStore.step3.linkText')}>
              {t('helpCenter.forVendors.createStore.step3.description')}
            </StepItem>
            <StepItem number={4} title={t('helpCenter.forVendors.createStore.step4.title')}>
              {t('helpCenter.forVendors.createStore.step4.description')}
            </StepItem>

            <SubHeader id="vendor-dashboard" title={t('helpCenter.forVendors.dashboard.title')} />
            <p className="text-gray-600 mb-4">
              {t('helpCenter.forVendors.dashboard.accessAt')} <CodeBlock>/vendor/dashboard</CodeBlock>
            </p>
            <Table
              headers={t('helpCenter.forVendors.dashboard.table.headers', { returnObjects: true }) as string[]}
              rows={t('helpCenter.forVendors.dashboard.table.rows', { returnObjects: true }) as string[][]}
            />

            <SubHeader id="add-products" title={t('helpCenter.forVendors.addProducts.title')} />
            <StepItem number={1} title={t('helpCenter.forVendors.addProducts.step1.title')} link="/vendor/products/add" linkText={t('helpCenter.forVendors.addProducts.step1.linkText')}>
              <HtmlContent html={t('helpCenter.forVendors.addProducts.step1.description').replace('<code>', '<code class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">').replace('</code>', '</code>')} />
            </StepItem>
            <StepItem number={2} title={t('helpCenter.forVendors.addProducts.step2.title')}>
              <ul className="list-disc list-inside space-y-1">
                <li><HtmlContent html={t('helpCenter.forVendors.addProducts.step2.productName')} /></li>
                <li><HtmlContent html={t('helpCenter.forVendors.addProducts.step2.description')} /></li>
                <li><HtmlContent html={t('helpCenter.forVendors.addProducts.step2.price')} /></li>
                <li><HtmlContent html={t('helpCenter.forVendors.addProducts.step2.images')} /></li>
                <li><HtmlContent html={t('helpCenter.forVendors.addProducts.step2.category')} /></li>
                <li><HtmlContent html={t('helpCenter.forVendors.addProducts.step2.inventory')} /></li>
              </ul>
            </StepItem>
            <StepItem number={3} title={t('helpCenter.forVendors.addProducts.step3.title')}>
              {t('helpCenter.forVendors.addProducts.step3.description')}
            </StepItem>
            <StepItem number={4} title={t('helpCenter.forVendors.addProducts.step4.title')}>
              {t('helpCenter.forVendors.addProducts.step4.description')}
            </StepItem>

            <SubHeader id="manage-orders" title={t('helpCenter.forVendors.manageOrders.title')} />
            <p className="text-gray-600 mb-4">
              {t('helpCenter.forVendors.manageOrders.viewAt')} <CodeBlock>/vendor/orders</CodeBlock>
            </p>
            <Table
              headers={t('helpCenter.forVendors.manageOrders.table.headers', { returnObjects: true }) as string[]}
              rows={t('helpCenter.forVendors.manageOrders.table.rows', { returnObjects: true }) as string[][]}
            />

            <SubHeader id="storefront-builder" title={t('helpCenter.forVendors.storefrontBuilder.title')} />
            <p className="text-gray-600 mb-4">
              {t('helpCenter.forVendors.storefrontBuilder.customizeAt')} <CodeBlock>/vendor/storefront</CodeBlock>
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
              {(t('helpCenter.forVendors.storefrontBuilder.features', { returnObjects: true }) as string[]).map((feature, i) => (
                <li key={i}><HtmlContent html={feature.replace('<code>', '<code class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">').replace('</code>', '</code>')} /></li>
              ))}
            </ul>
            <LinkCard href="/vendor/storefront" title={t('helpCenter.forVendors.storefrontBuilder.cardTitle')} description={t('helpCenter.forVendors.storefrontBuilder.cardDescription')} />

            <SubHeader id="ai-features" title={t('helpCenter.forVendors.aiFeatures.title')} />
            <div className="space-y-4 text-gray-600">
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">🤖 {t('helpCenter.forVendors.aiFeatures.storeBuilder.title')}</h5>
                <p>{t('helpCenter.forVendors.aiFeatures.storeBuilder.description')}</p>
                <Link to="/vendor/storefront/ai" className="text-primary-lime hover:underline text-sm mt-2 inline-block">
                  {t('helpCenter.forVendors.aiFeatures.storeBuilder.linkText')}
                </Link>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">✨ {t('helpCenter.forVendors.aiFeatures.productDescriptions.title')}</h5>
                <p>{t('helpCenter.forVendors.aiFeatures.productDescriptions.description')}</p>
              </div>
            </div>

            <SubHeader id="mobile-app" title={t('helpCenter.forVendors.mobileApp.title')} />
            <p className="text-gray-600 mb-4">
              <HtmlContent html={t('helpCenter.forVendors.mobileApp.availability')} />
            </p>
            <StepItem number={1} title={t('helpCenter.forVendors.mobileApp.step1.title')} link="/vendor/mobile-app" linkText={t('helpCenter.forVendors.mobileApp.step1.linkText')}>
              <HtmlContent html={t('helpCenter.forVendors.mobileApp.step1.description').replace('<code>', '<code class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">').replace('</code>', '</code>')} />
            </StepItem>
            <StepItem number={2} title={t('helpCenter.forVendors.mobileApp.step2.title')}>
              {t('helpCenter.forVendors.mobileApp.step2.description')}
            </StepItem>
            <StepItem number={3} title={t('helpCenter.forVendors.mobileApp.step3.title')}>
              {t('helpCenter.forVendors.mobileApp.step3.description')}
            </StepItem>

            <SubHeader id="analytics" title={t('helpCenter.forVendors.analytics.title')} />
            <p className="text-gray-600 mb-4">
              {t('helpCenter.forVendors.analytics.accessAt')} <CodeBlock>/vendor/analytics</CodeBlock>
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {(t('helpCenter.forVendors.analytics.features', { returnObjects: true }) as string[]).map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>

            <SubHeader id="delivery-setup" title={t('helpCenter.forVendors.deliverySetup.title')} />
            <p className="text-gray-600 mb-4">
              {t('helpCenter.forVendors.deliverySetup.configureAt')} <CodeBlock>/vendor/settings → Delivery</CodeBlock>
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {(t('helpCenter.forVendors.deliverySetup.features', { returnObjects: true }) as string[]).map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>

            <SubHeader id="team-management" title={t('helpCenter.forVendors.teamManagement.title')} />
            <p className="text-gray-600 mb-4">
              {t('helpCenter.forVendors.teamManagement.addAt')} <CodeBlock>/vendor/team</CodeBlock>
            </p>
            <Table
              headers={t('helpCenter.forVendors.teamManagement.table.headers', { returnObjects: true }) as string[]}
              rows={t('helpCenter.forVendors.teamManagement.table.rows', { returnObjects: true }) as string[][]}
            />
          </section>

          {/* For Customers */}
          <section className="mb-16">
            <SectionHeader id="for-customers" title={t('helpCenter.forCustomers.title')} />

            <SubHeader id="browse-shop" title={t('helpCenter.forCustomers.browseShop.title')} />
            <StepItem number={1} title={t('helpCenter.forCustomers.browseShop.step1.title')} link="/explore" linkText={t('helpCenter.forCustomers.browseShop.step1.linkText')}>
              <HtmlContent html={t('helpCenter.forCustomers.browseShop.step1.description').replace('<code>', '<code class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">').replace('</code>', '</code>')} />
            </StepItem>
            <StepItem number={2} title={t('helpCenter.forCustomers.browseShop.step2.title')}>
              {t('helpCenter.forCustomers.browseShop.step2.description')}
            </StepItem>
            <StepItem number={3} title={t('helpCenter.forCustomers.browseShop.step3.title')}>
              <HtmlContent html={t('helpCenter.forCustomers.browseShop.step3.description').replace('<code>', '<code class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">').replace('</code>', '</code>')} />
            </StepItem>

            <SubHeader id="cart-checkout" title={t('helpCenter.forCustomers.cartCheckout.title')} />
            <StepItem number={1} title={t('helpCenter.forCustomers.cartCheckout.step1.title')} link="/cart" linkText={t('helpCenter.forCustomers.cartCheckout.step1.linkText')}>
              {t('helpCenter.forCustomers.cartCheckout.step1.description')}
            </StepItem>
            <StepItem number={2} title={t('helpCenter.forCustomers.cartCheckout.step2.title')}>
              <HtmlContent html={t('helpCenter.forCustomers.cartCheckout.step2.description').replace('<code>', '<code class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">').replace('</code>', '</code>')} />
            </StepItem>
            <StepItem number={3} title={t('helpCenter.forCustomers.cartCheckout.step3.title')} link="/checkout" linkText={t('helpCenter.forCustomers.cartCheckout.step3.linkText')}>
              {t('helpCenter.forCustomers.cartCheckout.step3.description')}
            </StepItem>

            <SubHeader id="track-orders" title={t('helpCenter.forCustomers.trackOrders.title')} />
            <p className="text-gray-600 mb-4">
              {t('helpCenter.forCustomers.trackOrders.viewAt')} <CodeBlock>/orders</CodeBlock>
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
              {(t('helpCenter.forCustomers.trackOrders.features', { returnObjects: true }) as string[]).map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
            <LinkCard href="/orders" title={t('helpCenter.forCustomers.trackOrders.cardTitle')} description={t('helpCenter.forCustomers.trackOrders.cardDescription')} />

            <SubHeader id="reviews-wishlist" title={t('helpCenter.forCustomers.reviewsWishlist.title')} />
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><HtmlContent html={t('helpCenter.forCustomers.reviewsWishlist.leaveReviews')} /></li>
              <li><HtmlContent html={t('helpCenter.forCustomers.reviewsWishlist.wishlist').replace('<code>', '<code class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">').replace('</code>', '</code>')} /></li>
            </ul>
          </section>

          {/* For Delivery Partners */}
          <section className="mb-16">
            <SectionHeader id="for-delivery" title={t('helpCenter.forDelivery.title')} />
            <p className="text-gray-600 mb-8">
              {t('helpCenter.forDelivery.subtitle')}
            </p>

            <SubHeader id="how-delivery-works" title={t('helpCenter.forDelivery.howDeliveryWorks.title')} />
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-blue-900 mb-3">{t('helpCenter.forDelivery.howDeliveryWorks.forVendors.title')}</h4>
              <p className="text-blue-800 mb-4">
                {t('helpCenter.forDelivery.howDeliveryWorks.forVendors.description')}
              </p>
              <StepItem number={1} title={t('helpCenter.forDelivery.howDeliveryWorks.forVendors.step1.title')} link="/vendor/delivery" linkText={t('helpCenter.forDelivery.howDeliveryWorks.forVendors.step1.linkText')}>
                <HtmlContent html={t('helpCenter.forDelivery.howDeliveryWorks.forVendors.step1.description').replace('<code>', '<code class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">').replace('</code>', '</code>')} />
              </StepItem>
              <StepItem number={2} title={t('helpCenter.forDelivery.howDeliveryWorks.forVendors.step2.title')}>
                {t('helpCenter.forDelivery.howDeliveryWorks.forVendors.step2.description')}
              </StepItem>
              <StepItem number={3} title={t('helpCenter.forDelivery.howDeliveryWorks.forVendors.step3.title')}>
                {t('helpCenter.forDelivery.howDeliveryWorks.forVendors.step3.description')}
              </StepItem>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">{t('helpCenter.forDelivery.howDeliveryWorks.forDeliveryPersonnel.title')}</h4>
              <p className="text-gray-600">
                {t('helpCenter.forDelivery.howDeliveryWorks.forDeliveryPersonnel.description')}
              </p>
            </div>

            <SubHeader id="delivery-dashboard" title={t('helpCenter.forDelivery.deliveryDashboard.title')} />
            <p className="text-gray-600 mb-4">
              {t('helpCenter.forDelivery.deliveryDashboard.accessAt')} <CodeBlock>/delivery/dashboard</CodeBlock>
            </p>
            <Table
              headers={t('helpCenter.forDelivery.deliveryDashboard.table.headers', { returnObjects: true }) as string[]}
              rows={t('helpCenter.forDelivery.deliveryDashboard.table.rows', { returnObjects: true }) as string[][]}
            />

            <SubHeader id="earnings" title={t('helpCenter.forDelivery.earnings.title')} />
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {(t('helpCenter.forDelivery.earnings.features', { returnObjects: true }) as string[]).map((feature, i) => (
                <li key={i}><HtmlContent html={feature.replace('<code>', '<code class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">').replace('</code>', '</code>')} /></li>
              ))}
            </ul>
          </section>

          {/* Pricing */}
          <section className="mb-16">
            <SectionHeader id="pricing-plans" title={t('helpCenter.pricingPlans.title')} />
            <p className="text-gray-600 mb-6">
              <HtmlContent html={t('helpCenter.pricingPlans.subtitle')} />
            </p>

            <Table
              headers={t('helpCenter.pricingPlans.table.headers', { returnObjects: true }) as string[]}
              rows={t('helpCenter.pricingPlans.table.rows', { returnObjects: true }) as string[][]}
            />
            <p className="text-sm text-gray-500 mt-4">
              💡 {t('helpCenter.pricingPlans.annualDiscount')}
            </p>
            <div className="mt-6">
              <LinkCard href="/#pricing" title={t('helpCenter.pricingPlans.cardTitle')} description={t('helpCenter.pricingPlans.cardDescription')} />
            </div>
          </section>

          {/* Payments */}
          <section className="mb-16">
            <SectionHeader id="payments" title={t('helpCenter.paymentsAndBilling.title')} />

            <h4 className="font-semibold text-gray-900 mb-3">{t('helpCenter.paymentsAndBilling.customerPayments.title')}</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
              {(t('helpCenter.paymentsAndBilling.customerPayments.features', { returnObjects: true }) as string[]).map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>

            <h4 className="font-semibold text-gray-900 mb-3">{t('helpCenter.paymentsAndBilling.vendorPayouts.title')}</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
              {(t('helpCenter.paymentsAndBilling.vendorPayouts.features', { returnObjects: true }) as string[]).map((feature, i) => (
                <li key={i}><HtmlContent html={feature} /></li>
              ))}
            </ul>

            <h4 className="font-semibold text-gray-900 mb-3">{t('helpCenter.paymentsAndBilling.subscriptionBilling.title')}</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {(t('helpCenter.paymentsAndBilling.subscriptionBilling.features', { returnObjects: true }) as string[]).map((feature, i) => (
                <li key={i}><HtmlContent html={feature.replace('<code>', '<code class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">').replace('</code>', '</code>')} /></li>
              ))}
            </ul>
          </section>

          {/* Support */}
          <section className="mb-16">
            <SectionHeader id="support" title={t('helpCenter.supportAndContact.title')} />

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">{t('helpCenter.supportAndContact.contactUs')}</h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="font-medium">{t('helpCenter.supportAndContact.email')}</span>
                  <a href={`mailto:${t('helpCenter.supportAndContact.supportEmail')}`} className="text-primary-lime hover:underline">
                    {t('helpCenter.supportAndContact.supportEmail')}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-medium">{t('helpCenter.supportAndContact.supportHours')}</span>
                  <span>{t('helpCenter.supportAndContact.supportHoursValue')}</span>
                </li>
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <LinkCard href="/faq" title={t('helpCenter.supportAndContact.cards.faqsTitle')} description={t('helpCenter.supportAndContact.cards.faqsDescription')} />
              <LinkCard href="/contact" title={t('helpCenter.supportAndContact.cards.contactTitle')} description={t('helpCenter.supportAndContact.cards.contactDescription')} />
            </div>
          </section>

          {/* Footer navigation */}
          <div className="border-t border-gray-200 pt-8 mt-16">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <p>{t('helpCenter.lastUpdated')}</p>
              <a
                href={`mailto:${t('helpCenter.supportAndContact.supportEmail')}?subject=Documentation Feedback`}
                className="text-primary-lime hover:underline"
              >
                {t('helpCenter.suggestImprovements')}
              </a>
            </div>
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenterPage;

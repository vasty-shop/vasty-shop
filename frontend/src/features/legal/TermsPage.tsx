import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronUp, Mail } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  titleKey: string;
  contentKey: string;
  subsections?: { id: string; titleKey: string }[];
}

export const TermsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string>('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show back to top button
      setShowBackToTop(window.scrollY > 500);

      // Update active section based on scroll position
      const sections = document.querySelectorAll('[data-section]');
      let currentSection = '';

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
          currentSection = section.getAttribute('data-section') || '';
        }
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const sections: Section[] = [
    {
      id: 'introduction',
      titleKey: 'legal.terms.sections.introduction.title',
      contentKey: 'introduction',
    },
    {
      id: 'acceptance',
      titleKey: 'legal.terms.sections.acceptance.title',
      contentKey: 'acceptance',
    },
    {
      id: 'use-of-website',
      titleKey: 'legal.terms.sections.useOfWebsite.title',
      contentKey: 'useOfWebsite',
      subsections: [
        { id: 'permitted-use', titleKey: 'legal.terms.sections.useOfWebsite.permitted' },
        { id: 'prohibited-activities', titleKey: 'legal.terms.sections.useOfWebsite.prohibited' },
      ],
    },
    {
      id: 'account-registration',
      titleKey: 'legal.terms.sections.accountReg.title',
      contentKey: 'accountReg',
      subsections: [
        { id: 'account-creation', titleKey: 'legal.terms.sections.accountReg.creation' },
        { id: 'account-security', titleKey: 'legal.terms.sections.accountReg.security' },
      ],
    },
    {
      id: 'products-pricing',
      titleKey: 'legal.terms.sections.products.title',
      contentKey: 'products',
      subsections: [
        { id: 'product-descriptions', titleKey: 'legal.terms.sections.products.descriptions' },
        { id: 'pricing-availability', titleKey: 'legal.terms.sections.products.pricing' },
      ],
    },
    {
      id: 'orders-payment',
      titleKey: 'legal.terms.sections.orders.title',
      contentKey: 'orders',
      subsections: [
        { id: 'order-acceptance', titleKey: 'legal.terms.sections.orders.acceptance' },
        { id: 'payment-methods', titleKey: 'legal.terms.sections.orders.methods' },
        { id: 'payment-security', titleKey: 'legal.terms.sections.orders.security' },
      ],
    },
    {
      id: 'shipping-delivery',
      titleKey: 'legal.terms.sections.shipping.title',
      contentKey: 'shipping',
    },
    {
      id: 'returns-refunds',
      titleKey: 'legal.terms.sections.returns.title',
      contentKey: 'returns',
    },
    {
      id: 'intellectual-property',
      titleKey: 'legal.terms.sections.ip.title',
      contentKey: 'ip',
    },
    {
      id: 'limitation-liability',
      titleKey: 'legal.terms.sections.liability.title',
      contentKey: 'liability',
    },
    {
      id: 'dispute-resolution',
      titleKey: 'legal.terms.sections.disputes.title',
      contentKey: 'disputes',
      subsections: [
        { id: 'informal-resolution', titleKey: 'legal.terms.sections.disputes.informal' },
        { id: 'arbitration', titleKey: 'legal.terms.sections.disputes.arbitration' },
      ],
    },
    {
      id: 'changes-to-terms',
      titleKey: 'legal.terms.sections.changes.title',
      contentKey: 'changes',
    },
    {
      id: 'contact-information',
      titleKey: 'legal.terms.sections.contact.title',
      contentKey: 'contact',
    },
  ];

  const renderSectionContent = (contentKey: string) => {
    switch (contentKey) {
      case 'introduction':
        return (
          <>
            <p className="mb-4">{t('legal.terms.sections.introduction.p1')}</p>
            <p className="mb-4">{t('legal.terms.sections.introduction.p2')}</p>
            <p className="mb-4">{t('legal.terms.sections.introduction.p3')}</p>
          </>
        );

      case 'acceptance':
        return (
          <>
            <p className="mb-4">{t('legal.terms.sections.acceptance.p1')}</p>
            <p className="mb-4">{t('legal.terms.sections.acceptance.p2')}</p>
            <p className="mb-4">{t('legal.terms.sections.acceptance.p3')}</p>
          </>
        );

      case 'useOfWebsite':
        return (
          <>
            <h3 id="permitted-use" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.terms.sections.useOfWebsite.permitted')}
            </h3>
            <p className="mb-4">{t('legal.terms.sections.useOfWebsite.permittedP1')}</p>
            <p className="mb-4">{t('legal.terms.sections.useOfWebsite.permittedP2')}</p>

            <h3 id="prohibited-activities" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.terms.sections.useOfWebsite.prohibited')}
            </h3>
            <p className="mb-4">{t('legal.terms.sections.useOfWebsite.prohibitedIntro')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {(t('legal.terms.sections.useOfWebsite.prohibitedList', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        );

      case 'accountReg':
        return (
          <>
            <h3 id="account-creation" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.terms.sections.accountReg.creation')}
            </h3>
            <p className="mb-4">{t('legal.terms.sections.accountReg.creationP1')}</p>
            <p className="mb-4">{t('legal.terms.sections.accountReg.creationP2')}</p>

            <h3 id="account-security" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.terms.sections.accountReg.security')}
            </h3>
            <p className="mb-4">{t('legal.terms.sections.accountReg.securityP1')}</p>
            <p className="mb-4">{t('legal.terms.sections.accountReg.securityP2')}</p>
          </>
        );

      case 'products':
        return (
          <>
            <h3 id="product-descriptions" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.terms.sections.products.descriptions')}
            </h3>
            <p className="mb-4">{t('legal.terms.sections.products.descriptionsP1')}</p>
            <p className="mb-4">{t('legal.terms.sections.products.descriptionsP2')}</p>

            <h3 id="pricing-availability" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.terms.sections.products.pricing')}
            </h3>
            <p className="mb-4">{t('legal.terms.sections.products.pricingP1')}</p>
            <p className="mb-4">{t('legal.terms.sections.products.pricingP2')}</p>
            <p className="mb-4">{t('legal.terms.sections.products.pricingP3')}</p>
          </>
        );

      case 'orders':
        return (
          <>
            <h3 id="order-acceptance" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.terms.sections.orders.acceptance')}
            </h3>
            <p className="mb-4">{t('legal.terms.sections.orders.acceptanceP1')}</p>
            <p className="mb-4">{t('legal.terms.sections.orders.acceptanceP2')}</p>

            <h3 id="payment-methods" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.terms.sections.orders.methods')}
            </h3>
            <p className="mb-4">{t('legal.terms.sections.orders.methodsP1')}</p>
            <p className="mb-4">{t('legal.terms.sections.orders.methodsP2')}</p>

            <h3 id="payment-security" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.terms.sections.orders.security')}
            </h3>
            <p className="mb-4">{t('legal.terms.sections.orders.securityP1')}</p>
            <p className="mb-4">{t('legal.terms.sections.orders.securityP2')}</p>
          </>
        );

      case 'shipping':
        return (
          <>
            <p className="mb-4">{t('legal.terms.sections.shipping.p1')}</p>
            <p className="mb-4">{t('legal.terms.sections.shipping.p2')}</p>
            <p className="mb-4">{t('legal.terms.sections.shipping.p3')}</p>
            <p className="mb-4">{t('legal.terms.sections.shipping.p4')}</p>
          </>
        );

      case 'returns':
        return (
          <>
            <p className="mb-4">{t('legal.terms.sections.returns.p1')}</p>
            <p className="mb-4">{t('legal.terms.sections.returns.p2')}</p>
            <p className="mb-4">{t('legal.terms.sections.returns.p3')}</p>
            <p className="mb-4">{t('legal.terms.sections.returns.p4')}</p>
          </>
        );

      case 'ip':
        return (
          <>
            <p className="mb-4">{t('legal.terms.sections.ip.p1')}</p>
            <p className="mb-4">{t('legal.terms.sections.ip.p2')}</p>
            <p className="mb-4">{t('legal.terms.sections.ip.p3')}</p>
            <p className="mb-4">{t('legal.terms.sections.ip.p4')}</p>
          </>
        );

      case 'liability':
        return (
          <>
            <p className="mb-4">{t('legal.terms.sections.liability.p1')}</p>
            <p className="mb-4">{t('legal.terms.sections.liability.p2')}</p>
            <p className="mb-4">{t('legal.terms.sections.liability.p3')}</p>
            <p className="mb-4">{t('legal.terms.sections.liability.p4')}</p>
          </>
        );

      case 'disputes':
        return (
          <>
            <h3 id="informal-resolution" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.terms.sections.disputes.informal')}
            </h3>
            <p className="mb-4">{t('legal.terms.sections.disputes.informalP1')}</p>

            <h3 id="arbitration" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.terms.sections.disputes.arbitration')}
            </h3>
            <p className="mb-4">{t('legal.terms.sections.disputes.arbitrationP1')}</p>
            <p className="mb-4">{t('legal.terms.sections.disputes.arbitrationP2')}</p>
            <p className="mb-4">{t('legal.terms.sections.disputes.arbitrationP3')}</p>
          </>
        );

      case 'changes':
        return (
          <>
            <p className="mb-4">{t('legal.terms.sections.changes.p1')}</p>
            <p className="mb-4">{t('legal.terms.sections.changes.p2')}</p>
            <p className="mb-4">{t('legal.terms.sections.changes.p3')}</p>
          </>
        );

      case 'contact':
        return (
          <>
            <p className="mb-4">{t('legal.terms.sections.contact.intro')}</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4">
              <p className="font-semibold text-text-primary mb-2">{t('legal.terms.sections.contact.companyName')}</p>
              <p className="text-text-secondary mb-1">{t('legal.terms.sections.contact.email')}</p>
              <p className="text-text-secondary mb-1">{t('legal.terms.sections.contact.support')}</p>
              <p className="text-text-secondary mb-1">{t('legal.terms.sections.contact.phone')}</p>
              <p className="text-text-secondary">{t('legal.terms.sections.contact.hours')}</p>
            </div>
            <p className="mb-4">{t('legal.terms.sections.contact.responseTime')}</p>
            <p className="mb-4">
              {t('legal.terms.sections.contact.privacyNote').split('Privacy Policy')[0]}
              <Link to="/privacy" className="text-primary-lime hover:underline">{t('legal.privacy.title')}</Link>
              {t('legal.terms.sections.contact.privacyNote').split('Privacy Policy')[1]}
            </p>
          </>
        );

      default:
        return null;
    }
  };

  const breadcrumbItems = [
    { label: t('legal.breadcrumb'), href: '/terms' },
    { label: t('legal.terms.title') },
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('legal.terms.title')}</h1>
            <p className="text-lg text-gray-300 mb-6">
              {t('legal.terms.subtitle')}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span>{t('legal.terms.lastUpdated')}</span>
              <span>•</span>
              <span>{t('legal.terms.effectiveDate')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
            {/* Sidebar - Table of Contents */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-text-primary mb-4">{t('legal.terms.toc')}</h2>
                  <nav className="space-y-2">
                    {sections.map((section) => (
                      <div key={section.id}>
                        <button
                          onClick={() => scrollToSection(section.id)}
                          className={cn(
                            'w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-all',
                            activeSection === section.id
                              ? 'bg-primary-lime text-white'
                              : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                          )}
                        >
                          {t(section.titleKey)}
                        </button>
                        {section.subsections && activeSection === section.id && (
                          <div className="ml-4 mt-2 space-y-1">
                            {section.subsections.map((subsection) => (
                              <button
                                key={subsection.id}
                                onClick={() => scrollToSection(subsection.id)}
                                className="w-full text-left px-3 py-1.5 text-xs text-text-secondary hover:text-primary-lime transition-colors"
                              >
                                {t(subsection.titleKey)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>
                </div>

                {/* Help Section */}
                <div className="mt-6 bg-gradient-to-br from-primary-lime/10 to-primary-lime/5 border border-primary-lime/20 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-5 h-5 text-primary-lime" />
                    <h3 className="font-semibold text-text-primary">{t('legal.terms.sidebar.needHelp.title')}</h3>
                  </div>
                  <p className="text-sm text-text-secondary mb-4">
                    {t('legal.terms.sidebar.needHelp.description')}
                  </p>
                  <Link
                    to="/contact"
                    className="inline-block w-full text-center px-4 py-2 bg-primary-lime text-white font-medium rounded-lg hover:bg-primary-lime-dark transition-colors"
                  >
                    {t('legal.terms.sidebar.needHelp.button')}
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
              <div className="bg-white border border-gray-200 rounded-lg p-8 md:p-12 shadow-sm print:border-0 print:shadow-none">
                <div className="prose prose-slate max-w-none">
                  {/* Introduction Paragraph */}
                  <div className="mb-12 pb-8 border-b border-gray-200">
                    <p className="text-lg text-text-secondary leading-relaxed">
                      {t('legal.terms.introText')}
                    </p>
                  </div>

                  {/* Sections */}
                  {sections.map((section) => (
                    <section
                      key={section.id}
                      id={section.id}
                      data-section={section.id}
                      className="mb-12 scroll-mt-24"
                    >
                      <h2 className="text-2xl font-bold text-text-primary mb-6 pb-3 border-b-2 border-primary-lime/30">
                        {t(section.titleKey)}
                      </h2>
                      <div className="text-text-secondary leading-relaxed space-y-4">
                        {renderSectionContent(section.contentKey)}
                      </div>
                    </section>
                  ))}

                  {/* Footer Note */}
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-text-secondary italic">
                      {t('legal.terms.footerNote')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Print-friendly note */}
              <div className="mt-6 text-center text-sm text-text-secondary print:hidden">
                <p>
                  {t('legal.terms.saveTerms')}{' '}
                  <button
                    onClick={() => window.print()}
                    className="text-primary-lime hover:underline font-medium"
                  >
                    {t('legal.terms.printPage')}
                  </button>
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-primary-lime text-white rounded-full shadow-lg hover:bg-primary-lime-dark transition-all duration-300 z-40 print:hidden"
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      <Footer />
    </div>
  );
};

export default TermsPage;

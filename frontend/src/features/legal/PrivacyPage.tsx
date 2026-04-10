import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronUp, Mail, Shield, Cookie, Download, Trash2 } from 'lucide-react';
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

export const PrivacyPage: React.FC = () => {
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
      titleKey: 'legal.privacy.sections.introduction.title',
      contentKey: 'introduction',
    },
    {
      id: 'information-we-collect',
      titleKey: 'legal.privacy.sections.informationWeCollect.title',
      contentKey: 'informationWeCollect',
      subsections: [
        { id: 'personal-information', titleKey: 'legal.privacy.sections.informationWeCollect.personalInfo' },
        { id: 'payment-information', titleKey: 'legal.privacy.sections.informationWeCollect.paymentInfo' },
        { id: 'automatically-collected', titleKey: 'legal.privacy.sections.informationWeCollect.autoCollected' },
      ],
    },
    {
      id: 'how-we-use-information',
      titleKey: 'legal.privacy.sections.howWeUse.title',
      contentKey: 'howWeUse',
    },
    {
      id: 'cookies-tracking',
      titleKey: 'legal.privacy.sections.cookies.title',
      contentKey: 'cookies',
      subsections: [
        { id: 'types-of-cookies', titleKey: 'legal.privacy.sections.cookies.types' },
        { id: 'managing-cookies', titleKey: 'legal.privacy.sections.cookies.managing' },
      ],
    },
    {
      id: 'sharing-information',
      titleKey: 'legal.privacy.sections.sharing.title',
      contentKey: 'sharing',
    },
    {
      id: 'data-security',
      titleKey: 'legal.privacy.sections.security.title',
      contentKey: 'security',
    },
    {
      id: 'your-privacy-rights',
      titleKey: 'legal.privacy.sections.rights.title',
      contentKey: 'rights',
      subsections: [
        { id: 'gdpr-rights', titleKey: 'legal.privacy.sections.rights.gdpr' },
        { id: 'ccpa-rights', titleKey: 'legal.privacy.sections.rights.ccpa' },
        { id: 'exercising-rights', titleKey: 'legal.privacy.sections.rights.exercising' },
      ],
    },
    {
      id: 'childrens-privacy',
      titleKey: 'legal.privacy.sections.children.title',
      contentKey: 'children',
    },
    {
      id: 'international-transfers',
      titleKey: 'legal.privacy.sections.international.title',
      contentKey: 'international',
    },
    {
      id: 'third-party-links',
      titleKey: 'legal.privacy.sections.thirdParty.title',
      contentKey: 'thirdParty',
    },
    {
      id: 'data-retention',
      titleKey: 'legal.privacy.sections.retention.title',
      contentKey: 'retention',
    },
    {
      id: 'changes-to-policy',
      titleKey: 'legal.privacy.sections.changes.title',
      contentKey: 'changes',
    },
    {
      id: 'contact-us',
      titleKey: 'legal.privacy.sections.contact.title',
      contentKey: 'contact',
    },
  ];

  const renderSectionContent = (contentKey: string) => {
    switch (contentKey) {
      case 'introduction':
        return (
          <>
            <p className="mb-4">{t('legal.privacy.sections.introduction.p1')}</p>
            <p className="mb-4">{t('legal.privacy.sections.introduction.p2')}</p>
            <p className="mb-4">{t('legal.privacy.sections.introduction.p3')}</p>
            <p className="mb-4">{t('legal.privacy.sections.introduction.p4')}</p>
          </>
        );

      case 'informationWeCollect':
        return (
          <>
            <h3 id="personal-information" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.privacy.sections.informationWeCollect.personalInfo')}
            </h3>
            <p className="mb-4">{t('legal.privacy.sections.informationWeCollect.personalInfoDesc')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {(t('legal.privacy.sections.informationWeCollect.personalInfoList', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3 id="payment-information" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.privacy.sections.informationWeCollect.paymentInfo')}
            </h3>
            <p className="mb-4">{t('legal.privacy.sections.informationWeCollect.paymentInfoDesc')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {(t('legal.privacy.sections.informationWeCollect.paymentInfoList', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="mb-4">{t('legal.privacy.sections.informationWeCollect.paymentInfoNote')}</p>

            <h3 id="automatically-collected" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.privacy.sections.informationWeCollect.autoCollected')}
            </h3>
            <p className="mb-4">{t('legal.privacy.sections.informationWeCollect.autoCollectedDesc')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {(t('legal.privacy.sections.informationWeCollect.autoCollectedList', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        );

      case 'howWeUse':
        return (
          <>
            <p className="mb-4">{t('legal.privacy.sections.howWeUse.intro')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {(t('legal.privacy.sections.howWeUse.list', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item.replace(/^<strong>(.+?)<\/strong>/, '<strong>$1</strong>') }} />
              ))}
            </ul>
            <p className="mb-4">{t('legal.privacy.sections.howWeUse.outro')}</p>
          </>
        );

      case 'cookies':
        return (
          <>
            <p className="mb-4">{t('legal.privacy.sections.cookies.intro')}</p>

            <h3 id="types-of-cookies" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.privacy.sections.cookies.types')}
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {(t('legal.privacy.sections.cookies.typesList', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>

            <h3 id="managing-cookies" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.privacy.sections.cookies.managing')}
            </h3>
            <p className="mb-4">{t('legal.privacy.sections.cookies.managingDesc')}</p>
            <p className="mb-4">{t('legal.privacy.sections.cookies.managingNote')}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Cookie className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-text-primary mb-1">{t('legal.privacy.sections.cookies.cookieConsent')}</p>
                  <p className="text-sm text-text-secondary">
                    {t('legal.privacy.sections.cookies.cookieConsentDesc')}
                  </p>
                </div>
              </div>
            </div>
          </>
        );

      case 'sharing':
        return (
          <>
            <p className="mb-4">{t('legal.privacy.sections.sharing.intro')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {(t('legal.privacy.sections.sharing.list', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
            <p className="mb-4">{t('legal.privacy.sections.sharing.noSell')}</p>
          </>
        );

      case 'security':
        return (
          <>
            <p className="mb-4">{t('legal.privacy.sections.security.intro')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {(t('legal.privacy.sections.security.list', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="mb-4">{t('legal.privacy.sections.security.disclaimer')}</p>
            <p className="mb-4">{t('legal.privacy.sections.security.responsibility')}</p>
          </>
        );

      case 'rights':
        return (
          <>
            <p className="mb-4">{t('legal.privacy.sections.rights.intro')}</p>

            <h3 id="gdpr-rights" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.privacy.sections.rights.gdpr')}
            </h3>
            <p className="mb-4">{t('legal.privacy.sections.rights.gdprIntro')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {(t('legal.privacy.sections.rights.gdprList', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>

            <h3 id="ccpa-rights" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.privacy.sections.rights.ccpa')}
            </h3>
            <p className="mb-4">{t('legal.privacy.sections.rights.ccpaIntro')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {(t('legal.privacy.sections.rights.ccpaList', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>

            <h3 id="exercising-rights" className="text-xl font-semibold text-text-primary mb-4 mt-6">
              {t('legal.privacy.sections.rights.exercising')}
            </h3>
            <p className="mb-4">{t('legal.privacy.sections.rights.exercisingIntro')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {(t('legal.privacy.sections.rights.exercisingList', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link
                to="/data-request/download"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-lime text-white font-medium rounded-lg hover:bg-primary-lime-dark transition-colors"
              >
                <Download className="w-4 h-4" />
                {t('legal.privacy.sections.rights.downloadData')}
              </Link>
              <Link
                to="/data-request/delete"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {t('legal.privacy.sections.rights.deleteAccount')}
              </Link>
            </div>
            <p className="mt-4 text-sm text-text-secondary">
              {t('legal.privacy.sections.rights.responseTime')}
            </p>
          </>
        );

      case 'children':
        return (
          <>
            <p className="mb-4">{t('legal.privacy.sections.children.p1')}</p>
            <p className="mb-4">{t('legal.privacy.sections.children.p2')}</p>
            <p className="mb-4">{t('legal.privacy.sections.children.p3')}</p>
          </>
        );

      case 'international':
        return (
          <>
            <p className="mb-4">{t('legal.privacy.sections.international.p1')}</p>
            <p className="mb-4">{t('legal.privacy.sections.international.p2')}</p>
            <p className="mb-4">{t('legal.privacy.sections.international.p3')}</p>
          </>
        );

      case 'thirdParty':
        return (
          <>
            <p className="mb-4">{t('legal.privacy.sections.thirdParty.p1')}</p>
            <p className="mb-4">{t('legal.privacy.sections.thirdParty.p2')}</p>
            <p className="mb-4">{t('legal.privacy.sections.thirdParty.p3')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {(t('legal.privacy.sections.thirdParty.list', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        );

      case 'retention':
        return (
          <>
            <p className="mb-4">{t('legal.privacy.sections.retention.intro')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {(t('legal.privacy.sections.retention.criteriaList', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="mb-4">{t('legal.privacy.sections.retention.periodsIntro')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {(t('legal.privacy.sections.retention.periodsList', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item.replace(/^(.+?):/, '<strong>$1:</strong>') }} />
              ))}
            </ul>
            <p className="mb-4">{t('legal.privacy.sections.retention.outro')}</p>
          </>
        );

      case 'changes':
        return (
          <>
            <p className="mb-4">{t('legal.privacy.sections.changes.p1')}</p>
            <p className="mb-4">{t('legal.privacy.sections.changes.p2')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {(t('legal.privacy.sections.changes.list', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="mb-4">{t('legal.privacy.sections.changes.p3')}</p>
          </>
        );

      case 'contact':
        return (
          <>
            <p className="mb-4">{t('legal.privacy.sections.contact.intro')}</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4">
              <p className="font-semibold text-text-primary mb-2">{t('legal.privacy.sections.contact.companyName')}</p>
              <p className="text-text-secondary mb-1">{t('legal.privacy.sections.contact.email')}</p>
              <p className="text-text-secondary mb-1">{t('legal.privacy.sections.contact.dpo')}</p>
              <p className="text-text-secondary mb-1">{t('legal.privacy.sections.contact.general')}</p>
              <p className="text-text-secondary mb-1">{t('legal.privacy.sections.contact.phone')}</p>
              <p className="text-text-secondary">{t('legal.privacy.sections.contact.hours')}</p>
            </div>
            <p className="mb-4">{t('legal.privacy.sections.contact.commitment')}</p>
            <p className="mb-4">{t('legal.privacy.sections.contact.euComplaint')}</p>
          </>
        );

      default:
        return null;
    }
  };

  const breadcrumbItems = [
    { label: t('legal.breadcrumb'), href: '/privacy' },
    { label: t('legal.privacy.title') },
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
              <Shield className="w-12 h-12 text-primary-lime" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('legal.privacy.title')}</h1>
            <p className="text-lg text-gray-300 mb-6">
              {t('legal.privacy.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-400">
              <span>{t('legal.privacy.lastUpdated')}</span>
              <span className="hidden sm:inline">•</span>
              <span>{t('legal.privacy.compliance')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Badge */}
      <div className="bg-blue-50 border-y border-blue-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-blue-900">
              <Shield className="w-4 h-4" />
              <span className="font-semibold">{t('legal.privacy.badges.gdpr')}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-900">
              <Shield className="w-4 h-4" />
              <span className="font-semibold">{t('legal.privacy.badges.ccpa')}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-900">
              <Shield className="w-4 h-4" />
              <span className="font-semibold">{t('legal.privacy.badges.ssl')}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-900">
              <Shield className="w-4 h-4" />
              <span className="font-semibold">{t('legal.privacy.badges.pci')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
            {/* Sidebar - Table of Contents */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-text-primary mb-4">{t('legal.privacy.toc')}</h2>
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

                {/* Privacy Rights Card */}
                <div className="mt-6 bg-gradient-to-br from-primary-lime/10 to-primary-lime/5 border border-primary-lime/20 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-primary-lime" />
                    <h3 className="font-semibold text-text-primary">{t('legal.privacy.sidebar.rights.title')}</h3>
                  </div>
                  <p className="text-sm text-text-secondary mb-4">
                    {t('legal.privacy.sidebar.rights.description')}
                  </p>
                  <Link
                    to="/data-request"
                    className="inline-block w-full text-center px-4 py-2 bg-primary-lime text-white font-medium rounded-lg hover:bg-primary-lime-dark transition-colors"
                  >
                    {t('legal.privacy.sidebar.rights.button')}
                  </Link>
                </div>

                {/* Contact Card */}
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-5 h-5 text-gray-700" />
                    <h3 className="font-semibold text-text-primary">{t('legal.privacy.sidebar.questions.title')}</h3>
                  </div>
                  <p className="text-sm text-text-secondary mb-4">
                    {t('legal.privacy.sidebar.questions.description')}
                  </p>
                  <a
                    href="mailto:support@vasty.shop"
                    className="inline-block w-full text-center px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    {t('legal.privacy.sidebar.questions.button')}
                  </a>
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
                      {t('legal.privacy.introText')}
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
                      {t('legal.privacy.footerNote')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Print-friendly note */}
              <div className="mt-6 text-center text-sm text-text-secondary print:hidden">
                <p>
                  {t('legal.privacy.savePolicy')}{' '}
                  <button
                    onClick={() => window.print()}
                    className="text-primary-lime hover:underline font-medium"
                  >
                    {t('legal.privacy.printPage')}
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

export default PrivacyPage;

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cookie, Shield, Settings, Info } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { Button } from '@/components/ui/button';

export const CookiesPage: React.FC = () => {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('legal.breadcrumb'), href: '/terms' },
    { label: t('legal.cookies.title') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <BreadcrumbNavigation items={breadcrumbItems} />
        </div>
      </div>

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-lime/20 rounded-full mb-6">
              <Cookie className="w-8 h-8 text-primary-lime" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('legal.cookies.title')}</h1>
            <p className="text-lg text-gray-300">
              {t('legal.cookies.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-8 md:p-12 shadow-sm">

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-6 h-6 text-primary-lime" />
                  {t('legal.cookies.whatAreCookies.title')}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {t('legal.cookies.whatAreCookies.content')}
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary-lime" />
                  {t('legal.cookies.types.title')}
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('legal.cookies.types.essential.title')}</h3>
                    <p className="text-gray-600 text-sm">{t('legal.cookies.types.essential.description')}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('legal.cookies.types.analytics.title')}</h3>
                    <p className="text-gray-600 text-sm">{t('legal.cookies.types.analytics.description')}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('legal.cookies.types.marketing.title')}</h3>
                    <p className="text-gray-600 text-sm">{t('legal.cookies.types.marketing.description')}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('legal.cookies.types.preference.title')}</h3>
                    <p className="text-gray-600 text-sm">{t('legal.cookies.types.preference.description')}</p>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-primary-lime" />
                  {t('legal.cookies.managing.title')}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {t('legal.cookies.managing.content1')}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {t('legal.cookies.managing.content2')}
                </p>
              </section>

              <div className="mt-8 p-6 bg-primary-lime/10 rounded-lg border border-primary-lime/20">
                <p className="text-gray-700 mb-4">
                  {t('legal.cookies.moreInfo')}
                </p>
                <Link to="/privacy">
                  <Button className="bg-primary-lime text-white hover:bg-primary-lime-dark">
                    {t('legal.cookies.viewPrivacy')}
                  </Button>
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

export default CookiesPage;

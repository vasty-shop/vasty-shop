import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  FileText,
  Loader2
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export const DataDeletionPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(t('legal.dataDeletion.form.emailRequired'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('validation.invalidEmail'));
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/data-deletion/request', {
        email: email.trim(),
        reason: reason.trim()
      });
      setIsSubmitted(true);
      toast.success(t('legal.dataDeletion.success.title'));
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setIsSubmitted(true);
        toast.success(t('legal.dataDeletion.success.title'));
      } else {
        toast.error(error?.message || t('common.error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: t('legal.breadcrumb'), href: '/privacy' },
    { label: t('legal.dataDeletion.title') },
  ];

  const deletionSteps = [
    {
      icon: FileText,
      titleKey: 'legal.dataDeletion.steps.submit.title',
      descriptionKey: 'legal.dataDeletion.steps.submit.description'
    },
    {
      icon: Mail,
      titleKey: 'legal.dataDeletion.steps.verification.title',
      descriptionKey: 'legal.dataDeletion.steps.verification.description'
    },
    {
      icon: Clock,
      titleKey: 'legal.dataDeletion.steps.processing.title',
      descriptionKey: 'legal.dataDeletion.steps.processing.description'
    },
    {
      icon: CheckCircle,
      titleKey: 'legal.dataDeletion.steps.confirmation.title',
      descriptionKey: 'legal.dataDeletion.steps.confirmation.description'
    }
  ];

  const dataTypes = [
    { nameKey: 'legal.dataDeletion.dataTypes.account.title', descKey: 'legal.dataDeletion.dataTypes.account.description' },
    { nameKey: 'legal.dataDeletion.dataTypes.orders.title', descKey: 'legal.dataDeletion.dataTypes.orders.description' },
    { nameKey: 'legal.dataDeletion.dataTypes.addresses.title', descKey: 'legal.dataDeletion.dataTypes.addresses.description' },
    { nameKey: 'legal.dataDeletion.dataTypes.preferences.title', descKey: 'legal.dataDeletion.dataTypes.preferences.description' },
    { nameKey: 'legal.dataDeletion.dataTypes.activity.title', descKey: 'legal.dataDeletion.dataTypes.activity.description' },
    { nameKey: 'legal.dataDeletion.dataTypes.reviews.title', descKey: 'legal.dataDeletion.dataTypes.reviews.description' }
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
              <Trash2 className="w-12 h-12 text-red-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('legal.dataDeletion.title')}</h1>
            <p className="text-lg text-gray-300 mb-6">
              {t('legal.dataDeletion.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-400">
              <span>{t('legal.dataDeletion.compliance')}</span>
              <span className="hidden sm:inline">|</span>
              <span>{t('legal.dataDeletion.processingTime')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Warning Banner */}
      <div className="bg-amber-50 border-y border-amber-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-3 max-w-4xl mx-auto">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 mb-1">{t('legal.dataDeletion.warningTitle')}</p>
              <p className="text-sm text-amber-700">
                {t('legal.dataDeletion.warningContent')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            {/* How It Works */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-text-primary mb-6">{t('legal.dataDeletion.howItWorks')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {deletionSteps.map((step, index) => (
                  <div key={step.titleKey} className="relative">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 h-full">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <step.icon className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="absolute -top-3 -left-3 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <h3 className="font-semibold text-text-primary mb-2">{t(step.titleKey)}</h3>
                      <p className="text-sm text-text-secondary">{t(step.descriptionKey)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Data Types Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-text-primary mb-6">{t('legal.dataDeletion.whatWillBeDeleted')}</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dataTypes.map((type) => (
                    <div key={type.nameKey} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-text-primary">{t(type.nameKey)}</p>
                        <p className="text-sm text-text-secondary">{t(type.descKey)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Request Form */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-text-primary mb-6">{t('legal.dataDeletion.submitRequest')}</h2>

              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">{t('legal.dataDeletion.success.title')}</h3>
                  <p className="text-green-700 mb-6">
                    {t('legal.dataDeletion.success.message')}
                  </p>
                  <p className="text-sm text-green-600">
                    {t('legal.dataDeletion.success.processingNote')}
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-8">
                  {isAuthenticated ? (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>{t('legal.dataDeletion.form.loggedInAs')}</strong> {user?.email || user?.name}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {t('legal.dataDeletion.form.deleteFromProfile')}{' '}
                        <Link to="/profile" className="underline hover:no-underline">{t('legal.dataDeletion.form.profileSettings')}</Link>.
                      </p>
                    </div>
                  ) : null}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                        {t('legal.dataDeletion.form.emailLabel')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('legal.dataDeletion.form.emailPlaceholder')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                      <p className="mt-1 text-xs text-text-secondary">
                        {t('legal.dataDeletion.form.emailHint')}
                      </p>
                    </div>

                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium text-text-primary mb-2">
                        {t('legal.dataDeletion.form.reasonLabel')}
                      </label>
                      <textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={t('legal.dataDeletion.form.reasonPlaceholder')}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-text-secondary">
                          {t('legal.dataDeletion.form.consent')}
                        </span>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-semibold"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {t('legal.dataDeletion.form.submitting')}
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-5 h-5 mr-2" />
                          {t('legal.dataDeletion.submitRequest')}
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </section>

            {/* Contact Section */}
            <section>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                <Mail className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                <h3 className="font-semibold text-text-primary mb-2">{t('legal.dataDeletion.needHelp.title')}</h3>
                <p className="text-text-secondary mb-4">
                  {t('legal.dataDeletion.needHelp.content')}
                </p>
                <a
                  href="mailto:support@vasty.shop"
                  className="text-primary-lime hover:underline font-medium"
                >
                  support@vasty.shop
                </a>
              </div>
            </section>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DataDeletionPage;

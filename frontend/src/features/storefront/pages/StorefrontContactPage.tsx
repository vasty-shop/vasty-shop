'use client';

/**
 * Storefront Contact Page
 * Contact form and store contact information
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useStorefront } from '../StorefrontLayout';
import { useTranslation } from 'react-i18next';

export function StorefrontContactPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { theme, shop, config } = useStorefront();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  if (!theme) return null;

  const getBorderRadius = (size: 'small' | 'medium' | 'large' = 'medium') => {
    const radiusMap: Record<string, Record<string, string>> = {
      none: { small: 'rounded-none', medium: 'rounded-none', large: 'rounded-none' },
      small: { small: 'rounded', medium: 'rounded-md', large: 'rounded-lg' },
      medium: { small: 'rounded-md', medium: 'rounded-lg', large: 'rounded-xl' },
      large: { small: 'rounded-lg', medium: 'rounded-xl', large: 'rounded-2xl' },
      full: { small: 'rounded-xl', medium: 'rounded-2xl', large: 'rounded-3xl' },
    };
    return radiusMap[theme.borderRadius]?.[size] || 'rounded-lg';
  };

  const getSecondaryTextStyle = () => ({
    color: theme.textColor,
    opacity: 0.7,
  });

  const getCardBg = () => {
    const isDark = theme.backgroundColor.toLowerCase() === '#000000' ||
                   theme.backgroundColor.toLowerCase() === '#1a1a1a' ||
                   theme.backgroundColor.toLowerCase().includes('rgb(0');
    if (isDark) {
      return 'rgba(255,255,255,0.05)';
    }
    return theme.backgroundColor;
  };

  // Find contact section from config if exists
  const contactSection = config?.pages?.landing?.sections?.find(
    (s: any) => s.type === 'contact' && s.enabled
  ) as any;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${t('contact.messageSent')} ${t('contact.messageSentDesc')}`);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(t('contact.messageFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-6" style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: theme.headingFont, color: theme.textColor }}
          >
            {contactSection?.title || t('contact.contactUs')}
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={getSecondaryTextStyle()}>
            {contactSection?.subtitle || t('contact.getInTouch')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div
              className={`p-8 ${getBorderRadius('large')} border`}
              style={{
                backgroundColor: getCardBg(),
                borderColor: `${theme.textColor}15`,
              }}
            >
              <h2
                className="text-xl font-bold mb-6 flex items-center gap-2"
                style={{ fontFamily: theme.headingFont, color: theme.textColor }}
              >
                <MessageSquare className="w-5 h-5" style={{ color: theme.primaryColor }} />
                {t('contact.sendMessage')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.textColor }}
                    >
                      {t('checkout.fullName')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className={`w-full px-4 py-3 border ${getBorderRadius('medium')} focus:outline-none focus:ring-2`}
                      style={{
                        backgroundColor: getCardBg(),
                        borderColor: `${theme.textColor}20`,
                        color: theme.textColor,
                      }}
                      placeholder={t('contact.namePlaceholder')}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.textColor }}
                    >
                      {t('auth.emailAddress')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className={`w-full px-4 py-3 border ${getBorderRadius('medium')} focus:outline-none focus:ring-2`}
                      style={{
                        backgroundColor: getCardBg(),
                        borderColor: `${theme.textColor}20`,
                        color: theme.textColor,
                      }}
                      placeholder={t('contact.emailPlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.textColor }}
                  >
                    {t('contact.subject')}
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className={`w-full px-4 py-3 border ${getBorderRadius('medium')} focus:outline-none focus:ring-2`}
                    style={{
                      backgroundColor: getCardBg(),
                      borderColor: `${theme.textColor}20`,
                      color: theme.textColor,
                    }}
                    placeholder={t('contact.subjectPlaceholder')}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.textColor }}
                  >
                    {t('contact.message')}
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className={`w-full px-4 py-3 border ${getBorderRadius('medium')} focus:outline-none focus:ring-2 resize-none`}
                    style={{
                      backgroundColor: getCardBg(),
                      borderColor: `${theme.textColor}20`,
                      color: theme.textColor,
                    }}
                    placeholder={t('contact.messagePlaceholder')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 font-semibold ${getBorderRadius('medium')} text-white disabled:opacity-50 transition-opacity hover:opacity-90`}
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t('contact.sendMessage')}
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Contact Cards */}
            <div className="space-y-4">
              {/* Email */}
              {contactSection?.email && (
                <div
                  className={`p-6 ${getBorderRadius('large')} border flex items-start gap-4`}
                  style={{
                    backgroundColor: getCardBg(),
                    borderColor: `${theme.textColor}15`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${theme.primaryColor}20` }}
                  >
                    <Mail className="w-5 h-5" style={{ color: theme.primaryColor }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: theme.textColor }}>
                      {t('contact.emailUs')}
                    </h3>
                    <a
                      href={`mailto:${contactSection.email}`}
                      className="text-sm transition-opacity hover:opacity-100"
                      style={getSecondaryTextStyle()}
                    >
                      {contactSection.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Phone */}
              {contactSection?.phone && (
                <div
                  className={`p-6 ${getBorderRadius('large')} border flex items-start gap-4`}
                  style={{
                    backgroundColor: getCardBg(),
                    borderColor: `${theme.textColor}15`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${theme.primaryColor}20` }}
                  >
                    <Phone className="w-5 h-5" style={{ color: theme.primaryColor }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: theme.textColor }}>
                      {t('contact.callUs')}
                    </h3>
                    <a
                      href={`tel:${contactSection.phone}`}
                      className="text-sm transition-opacity hover:opacity-100"
                      style={getSecondaryTextStyle()}
                    >
                      {contactSection.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Address */}
              {contactSection?.address && (
                <div
                  className={`p-6 ${getBorderRadius('large')} border flex items-start gap-4`}
                  style={{
                    backgroundColor: getCardBg(),
                    borderColor: `${theme.textColor}15`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${theme.primaryColor}20` }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: theme.primaryColor }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: theme.textColor }}>
                      {t('contact.visitUs')}
                    </h3>
                    <p className="text-sm" style={getSecondaryTextStyle()}>
                      {contactSection.address}
                    </p>
                  </div>
                </div>
              )}

              {/* Default contact info if no config */}
              {!contactSection?.email && !contactSection?.phone && !contactSection?.address && (
                <>
                  <div
                    className={`p-6 ${getBorderRadius('large')} border flex items-start gap-4`}
                    style={{
                      backgroundColor: getCardBg(),
                      borderColor: `${theme.textColor}15`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${theme.primaryColor}20` }}
                    >
                      <Mail className="w-5 h-5" style={{ color: theme.primaryColor }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: theme.textColor }}>
                        {t('contact.emailUs')}
                      </h3>
                      <p className="text-sm" style={getSecondaryTextStyle()}>
                        support@{shop?.name?.toLowerCase().replace(/\s+/g, '') || 'store'}.com
                      </p>
                    </div>
                  </div>

                  <div
                    className={`p-6 ${getBorderRadius('large')} border flex items-start gap-4`}
                    style={{
                      backgroundColor: getCardBg(),
                      borderColor: `${theme.textColor}15`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${theme.primaryColor}20` }}
                    >
                      <Clock className="w-5 h-5" style={{ color: theme.primaryColor }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: theme.textColor }}>
                        {t('contact.businessHours')}
                      </h3>
                      <p className="text-sm" style={getSecondaryTextStyle()}>
                        {t('contact.weekdayHours')}
                      </p>
                      <p className="text-sm" style={getSecondaryTextStyle()}>
                        {t('contact.weekendHours')}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* FAQ Link */}
            <div
              className={`p-6 ${getBorderRadius('large')} text-white`}
              style={{ backgroundColor: theme.primaryColor }}
            >
              <h3 className="font-semibold mb-2">{t('faq.title')}</h3>
              <p className="text-sm opacity-90 mb-4">
                {t('faq.subtitle')}
              </p>
              <a
                href={`/store/${shopId}/faq`}
                className={`inline-block px-4 py-2 bg-white font-medium text-sm ${getBorderRadius('small')} transition-opacity hover:opacity-90`}
                style={{ color: theme.primaryColor }}
              >
                {t('faq.viewFaq')}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default StorefrontContactPage;

'use client';

/**
 * Storefront FAQ Page
 * Frequently Asked Questions
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, Minus, Search } from 'lucide-react';
import { useStorefront } from '../StorefrontLayout';
import { useTranslation } from 'react-i18next';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export function StorefrontFAQPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { theme, config, shop } = useStorefront();
  const { t } = useTranslation();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Get FAQs from config or use defaults
  const faqSection = config?.pages?.landing?.sections?.find(
    (s: any) => s.type === 'faq' && s.enabled
  ) as any;

  const defaultFaqs: FAQ[] = [
    {
      id: '1',
      question: t('faq.defaultFaqs.placeOrder.question'),
      answer: t('faq.defaultFaqs.placeOrder.answer'),
      category: t('faq.categories.orders'),
    },
    {
      id: '2',
      question: t('faq.defaultFaqs.paymentMethods.question'),
      answer: t('faq.defaultFaqs.paymentMethods.answer'),
      category: t('faq.categories.payments'),
    },
    {
      id: '3',
      question: t('faq.defaultFaqs.shippingTime.question'),
      answer: t('faq.defaultFaqs.shippingTime.answer'),
      category: t('faq.categories.shipping'),
    },
    {
      id: '4',
      question: t('faq.defaultFaqs.returnPolicy.question'),
      answer: t('faq.defaultFaqs.returnPolicy.answer'),
      category: t('faq.categories.returns'),
    },
    {
      id: '5',
      question: t('faq.defaultFaqs.trackOrder.question'),
      answer: t('faq.defaultFaqs.trackOrder.answer'),
      category: t('faq.categories.orders'),
    },
    {
      id: '6',
      question: t('faq.defaultFaqs.internationalShipping.question'),
      answer: t('faq.defaultFaqs.internationalShipping.answer'),
      category: t('faq.categories.shipping'),
    },
  ];

  const faqs: FAQ[] = faqSection?.faqs || defaultFaqs;

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-12 px-6" style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
      <div className="max-w-3xl mx-auto">
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
            {faqSection?.title || t('faq.title')}
          </h1>
          <p className="text-lg" style={getSecondaryTextStyle()}>
            {faqSection?.subtitle || t('faq.subtitle')}
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: theme.textColor, opacity: 0.5 }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search')}
              className={`w-full pl-12 pr-4 py-4 border ${getBorderRadius('medium')} focus:outline-none focus:ring-2`}
              style={{
                backgroundColor: getCardBg(),
                borderColor: `${theme.textColor}20`,
                color: theme.textColor,
              }}
            />
          </div>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle
                className="w-12 h-12 mx-auto mb-4"
                style={{ color: theme.textColor, opacity: 0.2 }}
              />
              <p style={getSecondaryTextStyle()}>{t('common.noResults')}</p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`${getBorderRadius('medium')} border overflow-hidden`}
                style={{
                  backgroundColor: getCardBg(),
                  borderColor: `${theme.textColor}15`,
                }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left transition-opacity hover:opacity-80"
                  style={{ color: theme.textColor }}
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <Minus className="w-5 h-5 flex-shrink-0" style={{ color: theme.primaryColor }} />
                  ) : (
                    <Plus className="w-5 h-5 flex-shrink-0" style={{ color: theme.textColor }} />
                  )}
                </button>
                <AnimatePresence>
                  {expandedFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-6 pb-4 pt-4 border-t"
                        style={{
                          ...getSecondaryTextStyle(),
                          borderColor: `${theme.textColor}15`,
                        }}
                      >
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mt-12 p-8 ${getBorderRadius('large')} text-center border`}
          style={{
            backgroundColor: getCardBg(),
            borderColor: `${theme.textColor}15`,
          }}
        >
          <HelpCircle className="w-12 h-12 mx-auto mb-4" style={{ color: theme.primaryColor }} />
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>
            {t('faq.stillHaveQuestions')}
          </h2>
          <p className="mb-4" style={getSecondaryTextStyle()}>
            {t('faq.supportHelp')}
          </p>
          <a
            href={`/store/${shopId}/contact`}
            className={`inline-block px-6 py-3 font-medium ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90`}
            style={{ backgroundColor: theme.primaryColor }}
          >
            {t('faq.contactSupport')}
          </a>
        </motion.div>
      </div>
    </div>
  );
}

export default StorefrontFAQPage;

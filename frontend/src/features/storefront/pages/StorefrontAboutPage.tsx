'use client';

/**
 * Storefront About Page
 * Displays store information and about content
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Users, Award, Heart } from 'lucide-react';
import { useStorefront } from '../StorefrontLayout';
import { useTranslation } from 'react-i18next';

export function StorefrontAboutPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { theme, shop, config } = useStorefront();
  const { t } = useTranslation();

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

  // Find about section from config if exists
  const aboutSection = config?.pages?.landing?.sections?.find(
    (s: any) => s.type === 'about' && s.enabled
  ) as any;

  // Helper to translate stat labels (for default values)
  const translateStatLabel = (label: string): string => {
    const labelTranslations: Record<string, string> = {
      'Happy Customers': t('about.happyCustomers'),
      'Products': t('about.products'),
      'Years Experience': t('about.yearsExperience'),
    };
    return labelTranslations[label] || label;
  };

  // Helper to translate title (for default values)
  const translateTitle = (title: string): string => {
    const titleTranslations: Record<string, string> = {
      'Our Story': t('about.ourStory'),
      'Why Choose Us': t('home.whyChooseUs'),
    };
    return titleTranslations[title] || title;
  };

  // Helper to translate content (for default values)
  const translateContent = (content: string): string => {
    const defaultContents = [
      'We started with a simple mission: to bring you the best products with exceptional service.',
      'We started with a simple mission: to bring you the best products with exceptional service. Every item in our store is carefully selected to ensure quality and value.',
      'We bring you the best products with unmatched quality and style. Every item is carefully curated to meet your expectations.',
    ];
    if (defaultContents.includes(content)) {
      return t('about.storyDescription', { storeName: shop?.name || t('common.store') });
    }
    return content;
  };

  // Default stats if not configured
  const defaultStats = [
    { value: '10K+', label: t('about.happyCustomers') },
    { value: '500+', label: t('about.products') },
    { value: '5+', label: t('about.yearsExperience') },
  ];

  const stats = aboutSection?.stats?.length > 0 ? aboutSection.stats : defaultStats;
  const aboutTitle = aboutSection?.title ? translateTitle(aboutSection.title) : t('about.ourStory');
  const aboutContent = aboutSection?.content
    ? translateContent(aboutSection.content)
    : t('about.storyDescription', { storeName: shop?.name || t('common.store') });

  return (
    <div className="py-16 px-6" style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
      <div className="max-w-6xl mx-auto">
        {/* Split Layout - matches LivePreview about section */}
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Text Content */}
          <div className="flex-1">
            <h2
              className="text-3xl font-bold mb-4"
              style={{ fontFamily: theme.headingFont, color: theme.textColor }}
            >
              {aboutTitle}
            </h2>
            <p className="opacity-80 mb-6 leading-relaxed" style={{ color: theme.textColor }}>
              {aboutContent}
            </p>

            {/* Stats */}
            <div className="flex gap-8 flex-wrap">
              {stats.map((stat: any, i: number) => (
                <div key={i}>
                  <p className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
                    {stat.value}
                  </p>
                  <p className="text-sm opacity-60" style={{ color: theme.textColor }}>
                    {translateStatLabel(stat.label)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className={`flex-1 aspect-[4/3] ${getBorderRadius('large')} overflow-hidden`}>
            {shop?.logo || aboutSection?.image ? (
              <img
                src={aboutSection?.image || shop?.logo}
                alt={shop?.name || aboutTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: `${theme.primaryColor}15` }}
              >
                <Store className="w-16 h-16" style={{ color: theme.primaryColor, opacity: 0.5 }} />
              </div>
            )}
          </div>
        </div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mt-16"
        >
          {[
            {
              icon: <Award className="w-8 h-8" />,
              title: t('about.quality'),
              description: t('about.qualityDesc'),
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: t('about.customerFirst'),
              description: t('about.customerFirstDesc'),
            },
            {
              icon: <Heart className="w-8 h-8" />,
              title: t('about.passion'),
              description: t('about.passionDesc'),
            },
          ].map((value, index) => (
            <div
              key={index}
              className={`p-6 ${getBorderRadius('large')} text-center`}
              style={{
                backgroundColor: theme.backgroundColor === '#FFFFFF' ? '#F9FAFB' : 'rgba(255,255,255,0.05)',
              }}
            >
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}
              >
                {value.icon}
              </div>
              <h3 className="font-bold mb-2" style={{ color: theme.textColor }}>
                {value.title}
              </h3>
              <p className="text-sm opacity-70" style={{ color: theme.textColor }}>
                {value.description}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mt-16 p-8 ${getBorderRadius('large')} text-center text-white`}
          style={{ backgroundColor: theme.primaryColor }}
        >
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: theme.headingFont }}>
            {t('about.haveQuestions')}
          </h2>
          <p className="opacity-90 mb-6">
            {t('about.getInTouch')}
          </p>
          <a
            href={`/store/${shopId}/contact`}
            className={`inline-block px-8 py-3 bg-white font-medium ${getBorderRadius('medium')} transition-opacity hover:opacity-90`}
            style={{ color: theme.primaryColor }}
          >
            {t('contact.contactUs')}
          </a>
        </motion.div>
      </div>
    </div>
  );
}

export default StorefrontAboutPage;

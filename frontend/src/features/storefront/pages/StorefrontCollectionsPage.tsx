'use client';

/**
 * Storefront Collections Page
 * Displays product collections/categories
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Grid, Store } from 'lucide-react';
import { api } from '@/lib/api';
import { useStorefront } from '../StorefrontLayout';
import { useTranslation } from 'react-i18next';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

export function StorefrontCollectionsPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { theme } = useStorefront();
  const { t } = useTranslation();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (shopId) {
      setIsLoading(true);
      api.getCategories()
        .then((res: any) => {
          const cats = Array.isArray(res) ? res : res?.data || [];
          setCollections(cats);
        })
        .catch(() => setCollections([]))
        .finally(() => setIsLoading(false));
    }
  }, [shopId]);

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

  return (
    <div style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
      {/* Hero Section - matches collection-hero preview */}
      <div
        className="relative py-16 px-6"
        style={{
          background: `linear-gradient(135deg, ${theme.primaryColor}15 0%, ${theme.secondaryColor || theme.primaryColor}15 100%)`,
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ fontFamily: theme.headingFont, color: theme.textColor }}
          >
            {t('common.collections')}
          </h1>
          <p className="text-lg opacity-70 mb-6" style={{ color: theme.textColor }}>
            {t('products.allProducts')}
          </p>
          {/* Breadcrumb */}
          <div className="flex justify-center gap-2 text-sm" style={{ color: theme.textColor }}>
            <Link to={`/store/${shopId}`} className="opacity-60 hover:opacity-100">{t('common.home')}</Link>
            <span className="opacity-40">/</span>
            <span style={{ color: theme.primaryColor }}>{t('common.collections')}</span>
          </div>
        </div>
      </div>

      <div className="py-12 px-6">
        <div className="max-w-6xl mx-auto">

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`animate-pulse ${getBorderRadius('large')} overflow-hidden`}>
                <div className="aspect-square" style={{ backgroundColor: `${theme.textColor}20` }} />
                <div className="p-4 space-y-2">
                  <div className="h-4 rounded w-3/4" style={{ backgroundColor: `${theme.textColor}20` }} />
                  <div className="h-3 rounded w-1/2" style={{ backgroundColor: `${theme.textColor}20` }} />
                </div>
              </div>
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20">
            <Grid className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textColor, opacity: 0.2 }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: theme.textColor }}>{t('common.noResults')}</h2>
            <p className="mb-6" style={getSecondaryTextStyle()}>{t('common.noResults')}</p>
            <Link
              to={`/store/${shopId}/products`}
              className={`inline-flex items-center gap-2 px-6 py-3 font-medium ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90`}
              style={{ backgroundColor: theme.primaryColor }}
            >
              {t('common.products')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/store/${shopId}/collection/${collection.id}`}
                  className={`block ${getBorderRadius('large')} overflow-hidden group transition-all hover:shadow-lg`}
                  style={{
                    backgroundColor: theme.backgroundColor === '#FFFFFF' ? '#F9FAFB' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="aspect-square overflow-hidden relative">
                    {collection.image ? (
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: theme.primaryColor + '15' }}
                      >
                        <Store className="w-12 h-12" style={{ color: theme.primaryColor, opacity: 0.5 }} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-1 line-clamp-1" style={{ color: theme.textColor }}>
                      {collection.name}
                    </h3>
                    {collection.productCount !== undefined && (
                      <span className="text-sm" style={{ color: theme.primaryColor }}>
                        {collection.productCount} {t('common.products')}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default StorefrontCollectionsPage;

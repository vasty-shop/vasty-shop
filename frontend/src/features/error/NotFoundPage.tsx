/**
 * NotFoundPage - 404 Error Page
 * Displays a user-friendly 404 page with navigation options
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, ShoppingBag } from 'lucide-react';
import { SEO } from '../../components/seo';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title={t('errors.pageNotFound', { defaultValue: 'Page Not Found' })}
        description="The page you're looking for doesn't exist or has been moved."
        noIndex={true}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* 404 Text */}
            <div className="mb-8">
              <h1 className="text-9xl font-bold text-gray-200 select-none">404</h1>
              <div className="relative -mt-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-lime/10 border-2 border-primary-lime"
                >
                  <Search className="w-10 h-10 text-primary-lime" />
                </motion.div>
              </div>
            </div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900">
                {t('errors.pageNotFound', { defaultValue: 'Page Not Found' })}
              </h2>
              <p className="text-gray-600">
                {t('errors.pageNotFoundMessage', {
                  defaultValue: "The page you're looking for doesn't exist or has been moved.",
                })}
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                {t('common.goBack', { defaultValue: 'Go Back' })}
              </button>

              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary-lime/25"
              >
                <Home className="w-5 h-5" />
                {t('common.goHome', { defaultValue: 'Go Home' })}
              </Link>
            </motion.div>

            {/* Helpful Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 pt-8 border-t border-gray-200"
            >
              <p className="text-sm text-gray-500 mb-4">
                {t('errors.helpfulLinks', { defaultValue: 'Here are some helpful links:' })}
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link to="/shop" className="text-primary-lime hover:underline flex items-center gap-1">
                  <ShoppingBag className="w-4 h-4" />
                  {t('nav.shop', { defaultValue: 'Shop' })}
                </Link>
                <Link to="/categories" className="text-primary-lime hover:underline">
                  {t('nav.categories', { defaultValue: 'Categories' })}
                </Link>
                <Link to="/contact" className="text-primary-lime hover:underline">
                  {t('nav.contact', { defaultValue: 'Contact' })}
                </Link>
                <Link to="/help" className="text-primary-lime hover:underline">
                  {t('nav.help', { defaultValue: 'Help Center' })}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;

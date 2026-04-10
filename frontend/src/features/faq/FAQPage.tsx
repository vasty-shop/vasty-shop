import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Search,
  RotateCcw,
  ShoppingBag,
  CreditCard,
  User,
  HelpCircle,
  Truck,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// FAQ Category Icon Mapping
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'ordersShipping': Truck,
  'returnsRefunds': RotateCcw,
  'products': ShoppingBag,
  'paymentSecurity': CreditCard,
  'account': User,
  'other': HelpCircle,
};

// FAQ Data Structure
interface FAQItem {
  questionKey: string;
  answerKey: string;
}

interface FAQCategory {
  id: string;
  titleKey: string;
  items: FAQItem[];
}

// FAQ Category and Item Keys
const faqData: FAQCategory[] = [
  {
    id: 'ordersShipping',
    titleKey: 'faq.categories.ordersShipping',
    items: [
      { questionKey: 'faq.items.trackOrder.question', answerKey: 'faq.items.trackOrder.answer' },
      { questionKey: 'faq.items.shippingOptions.question', answerKey: 'faq.items.shippingOptions.answer' },
      { questionKey: 'faq.items.internationalShipping.question', answerKey: 'faq.items.internationalShipping.answer' },
      { questionKey: 'faq.items.shippingTime.question', answerKey: 'faq.items.shippingTime.answer' },
      { questionKey: 'faq.items.lostDamaged.question', answerKey: 'faq.items.lostDamaged.answer' },
      { questionKey: 'faq.items.changeAddress.question', answerKey: 'faq.items.changeAddress.answer' },
    ],
  },
  {
    id: 'returnsRefunds',
    titleKey: 'faq.categories.returnsRefunds',
    items: [
      { questionKey: 'faq.items.returnPolicy.question', answerKey: 'faq.items.returnPolicy.answer' },
      { questionKey: 'faq.items.howToReturn.question', answerKey: 'faq.items.howToReturn.answer' },
      { questionKey: 'faq.items.refundTime.question', answerKey: 'faq.items.refundTime.answer' },
      { questionKey: 'faq.items.exchange.question', answerKey: 'faq.items.exchange.answer' },
      { questionKey: 'faq.items.defectiveItem.question', answerKey: 'faq.items.defectiveItem.answer' },
    ],
  },
  {
    id: 'products',
    titleKey: 'faq.categories.products',
    items: [
      { questionKey: 'faq.items.sizeGuide.question', answerKey: 'faq.items.sizeGuide.answer' },
      { questionKey: 'faq.items.authentic.question', answerKey: 'faq.items.authentic.answer' },
      { questionKey: 'faq.items.restock.question', answerKey: 'faq.items.restock.answer' },
      { questionKey: 'faq.items.preorder.question', answerKey: 'faq.items.preorder.answer' },
      { questionKey: 'faq.items.inStock.question', answerKey: 'faq.items.inStock.answer' },
      { questionKey: 'faq.items.careInstructions.question', answerKey: 'faq.items.careInstructions.answer' },
    ],
  },
  {
    id: 'paymentSecurity',
    titleKey: 'faq.categories.paymentSecurity',
    items: [
      { questionKey: 'faq.items.paymentMethods.question', answerKey: 'faq.items.paymentMethods.answer' },
      { questionKey: 'faq.items.paymentSecure.question', answerKey: 'faq.items.paymentSecure.answer' },
      { questionKey: 'faq.items.multiplePayment.question', answerKey: 'faq.items.multiplePayment.answer' },
      { questionKey: 'faq.items.paymentPlans.question', answerKey: 'faq.items.paymentPlans.answer' },
      { questionKey: 'faq.items.paymentDeclined.question', answerKey: 'faq.items.paymentDeclined.answer' },
    ],
  },
  {
    id: 'account',
    titleKey: 'faq.categories.account',
    items: [
      { questionKey: 'faq.items.createAccount.question', answerKey: 'faq.items.createAccount.answer' },
      { questionKey: 'faq.items.forgotPassword.question', answerKey: 'faq.items.forgotPassword.answer' },
      { questionKey: 'faq.items.updateAccount.question', answerKey: 'faq.items.updateAccount.answer' },
      { questionKey: 'faq.items.deleteAccount.question', answerKey: 'faq.items.deleteAccount.answer' },
      { questionKey: 'faq.items.emailPreferences.question', answerKey: 'faq.items.emailPreferences.answer' },
    ],
  },
  {
    id: 'other',
    titleKey: 'faq.categories.other',
    items: [
      { questionKey: 'faq.items.physicalStores.question', answerKey: 'faq.items.physicalStores.answer' },
      { questionKey: 'faq.items.contactService.question', answerKey: 'faq.items.contactService.answer' },
      { questionKey: 'faq.items.giftCards.question', answerKey: 'faq.items.giftCards.answer' },
      { questionKey: 'faq.items.promotions.question', answerKey: 'faq.items.promotions.answer' },
      { questionKey: 'faq.items.priceMatch.question', answerKey: 'faq.items.priceMatch.answer' },
    ],
  },
];

export const FAQPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter FAQs based on search query
  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqData;
    }

    const query = searchQuery.toLowerCase();
    return faqData
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            t(item.questionKey).toLowerCase().includes(query) ||
            t(item.answerKey).toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [searchQuery, t]);

  // Highlight search terms in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Calculate total FAQs
  const totalFAQs = filteredFAQs.reduce((acc, category) => acc + category.items.length, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <BreadcrumbNavigation
            items={[{ label: t('faq.title'), href: '/faq' }]}
          />
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-lime/10 via-white to-accent-blue/10 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-lime/20 rounded-full mb-6">
              <HelpCircle className="w-8 h-8 text-primary-lime" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              {t('faq.title')}
            </h1>
            <p className="text-lg text-text-secondary mb-8">
              {t('faq.subtitle')}
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t('faq.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 text-base shadow-lg border-gray-200 focus:border-primary-lime"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            {searchQuery && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm text-text-secondary"
              >
                {t(totalFAQs !== 1 ? 'faq.foundResultsPlural' : 'faq.foundResults', { count: totalFAQs, query: searchQuery })}
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            {faqData.map((category) => {
              const Icon = categoryIcons[category.id];
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSearchQuery('');
                    const element = document.getElementById(category.id);
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
                    'border-2 hover:shadow-md',
                    'bg-white text-gray-700 border-gray-200 hover:border-primary-lime hover:text-primary-lime'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t(category.titleKey)}</span>
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length === 0 ? (
              // No Results State
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3">
                  {t('faq.noResults.title')}
                </h3>
                <p className="text-text-secondary mb-6">
                  {t('faq.noResults.message', { query: searchQuery })}
                </p>
                <Button
                  onClick={() => setSearchQuery('')}
                  className="bg-primary-lime hover:bg-primary-lime-dark"
                >
                  {t('faq.noResults.clearSearch')}
                </Button>
              </motion.div>
            ) : (
              // FAQ Categories
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {filteredFAQs.map((category, categoryIndex) => {
                  const Icon = categoryIcons[category.id];
                  return (
                    <motion.div
                      key={category.id}
                      variants={itemVariants}
                      id={category.id}
                      className="scroll-mt-24"
                    >
                      <Card className="overflow-hidden border-2 border-gray-200 hover:border-primary-lime/50 transition-colors">
                        {/* Category Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-12 h-12 bg-primary-lime/10 rounded-lg">
                              <Icon className="w-6 h-6 text-primary-lime" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-text-primary">
                                {t(category.titleKey)}
                              </h2>
                              <p className="text-sm text-text-secondary mt-0.5">
                                {category.items.length} {t(category.items.length !== 1 ? 'faq.questions' : 'faq.question')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Category FAQs */}
                        <div className="p-6">
                          <Accordion type="single" collapsible className="space-y-2">
                            {category.items.map((item, itemIndex) => (
                              <AccordionItem
                                key={`${categoryIndex}-${itemIndex}`}
                                value={`item-${categoryIndex}-${itemIndex}`}
                                className="border border-gray-200 rounded-lg px-4 data-[state=open]:border-primary-lime data-[state=open]:bg-primary-lime/5"
                              >
                                <AccordionTrigger className="text-left hover:no-underline">
                                  <div className="flex items-start gap-3 pr-4">
                                    <CheckCircle className="w-5 h-5 text-primary-lime flex-shrink-0 mt-0.5" />
                                    <span className="font-semibold text-text-primary">
                                      {highlightText(t(item.questionKey), searchQuery)}
                                    </span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-text-secondary leading-relaxed pl-8 pr-4">
                                  {highlightText(t(item.answerKey), searchQuery)}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQPage;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  HelpCircle,
  Package,
  Globe,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { toast } from 'sonner';

// Types
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

interface FAQItem {
  question: string;
  href: string;
  icon: React.ReactNode;
}

interface ContactInfo {
  icon: React.ReactNode;
  title: string;
  items: { label: string; value: string; href?: string }[];
}

/**
 * Contact Page Component
 * Comprehensive contact page with form, contact information, and FAQ links
 */
export const ContactPage: React.FC = () => {
  const { t } = useTranslation();

  // Form State
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Contact Information Data
  const contactInfoData: ContactInfo[] = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: t('contact.info.customerSupport'),
      items: [
        { label: t('contact.info.email'), value: 'support@vasty.shop', href: 'mailto:support@vasty.shop' },
        { label: t('contact.info.hours'), value: t('contact.info.support247') },
      ],
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: t('contact.info.businessInquiries'),
      items: [
        { label: t('contact.info.email'), value: 'support@vasty.shop', href: 'mailto:support@vasty.shop' },
      ],
    },
  ];

  // FAQ Quick Links
  const faqItems: FAQItem[] = [
    { question: t('contact.faqQuestions.trackOrder'), href: '/faq#track-order', icon: <Package className="w-5 h-5" /> },
    { question: t('contact.faqQuestions.returnPolicy'), href: '/faq#returns', icon: <HelpCircle className="w-5 h-5" /> },
    { question: t('contact.faqQuestions.internationalShipping'), href: '/faq#shipping', icon: <Globe className="w-5 h-5" /> },
    { question: t('contact.faqQuestions.changeOrder'), href: '/faq#change-order', icon: <Package className="w-5 h-5" /> },
    { question: t('contact.faqQuestions.paymentMethods'), href: '/faq#payment', icon: <HelpCircle className="w-5 h-5" /> },
    { question: t('contact.faqQuestions.contactService'), href: '/faq#customer-service', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  // Subject Options
  const subjectOptions = [
    { value: 'general', label: t('contact.subjects.general') },
    { value: 'order', label: t('contact.subjects.order') },
    { value: 'product', label: t('contact.subjects.product') },
    { value: 'partnership', label: t('contact.subjects.partnership') },
    { value: 'other', label: t('contact.subjects.other') },
  ];

  // Form Validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t('contact.validation.nameRequired');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('contact.validation.nameMinLength');
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t('contact.validation.emailRequired');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('contact.validation.emailInvalid');
    }

    // Subject validation
    if (!formData.subject) {
      newErrors.subject = t('contact.validation.subjectRequired');
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = t('contact.validation.messageRequired');
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t('contact.validation.messageMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Input Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle Subject Change
  const handleSubjectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subject: value }));
    if (errors.subject) {
      setErrors((prev) => ({ ...prev, subject: undefined }));
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error(t('contact.validation.fixErrors'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit contact form to API
      await api.submitContactForm({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject,
        message: formData.message
      });

      // Show success state
      setIsSuccess(true);
      toast.success(t('contact.messageSent'));

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(t('contact.messageFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [{ label: t('contact.contactUs') }];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4">
        <BreadcrumbNavigation items={breadcrumbItems} />
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-lime via-green-400 to-emerald-500 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {t('contact.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6">
              {t('contact.hero.subtitle')}
            </p>
            <div className="flex items-center justify-center gap-2 text-white/80">
              <Clock className="w-5 h-5" />
              <span className="text-sm md:text-base">
                {t('contact.hero.availability')}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Contact Form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                  {t('contact.form.title')}
                </h2>
                <p className="text-text-secondary">
                  {t('contact.form.subtitle')}
                </p>
              </div>

              {/* Success Message */}
              {isSuccess && (
                <motion.div
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">
                      {t('contact.form.successTitle')}
                    </h3>
                    <p className="text-sm text-green-700">
                      {t('contact.form.successMessage')}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Contact Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <Label htmlFor="name" className="mb-2 block">
                    {t('contact.form.fullName')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t('contact.form.fullNamePlaceholder')}
                    value={formData.name}
                    onChange={handleChange}
                    className={cn(
                      errors.name && 'border-red-500 focus-visible:ring-red-500'
                    )}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <Label htmlFor="email" className="mb-2 block">
                    {t('contact.form.emailAddress')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('contact.form.emailPlaceholder')}
                    value={formData.email}
                    onChange={handleChange}
                    className={cn(
                      errors.email && 'border-red-500 focus-visible:ring-red-500'
                    )}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <Label htmlFor="phone" className="mb-2 block">
                    {t('contact.form.phone')} <span className="text-text-secondary">{t('contact.form.phoneOptional')}</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={t('contact.form.phonePlaceholder')}
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Subject Field */}
                <div>
                  <Label htmlFor="subject" className="mb-2 block">
                    {t('contact.subject')} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.subject}
                    onValueChange={handleSubjectChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      className={cn(
                        errors.subject && 'border-red-500 focus:ring-red-500'
                      )}
                    >
                      <SelectValue placeholder={t('contact.form.selectSubject')} />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subject && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <Label htmlFor="message" className="mb-2 block">
                    {t('contact.form.yourMessage')} <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder={t('contact.form.messagePlaceholder')}
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={cn(
                      'flex min-h-[150px] w-full rounded-button border border-input bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
                      errors.message && 'border-red-500 focus-visible:ring-red-500'
                    )}
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.message}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-text-secondary">
                    {formData.message.length} / 2000 {t('contact.form.characters')}
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isSubmitting || isSuccess}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('contact.sending')}
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {t('contact.messageSent')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t('contact.sendMessage')}
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Right Column - Contact Info */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Contact Information Cards */}
            {contactInfoData.map((info, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-lime/10 flex items-center justify-center text-primary-lime">
                    {info.icon}
                  </div>
                  <h3 className="font-bold text-lg text-text-primary">
                    {info.title}
                  </h3>
                </div>
                <div className="space-y-2">
                  {info.items.map((item, idx) => (
                    <div key={idx}>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="block text-sm hover:text-primary-lime transition-colors"
                        >
                          {item.label && (
                            <span className="font-medium text-text-secondary">
                              {item.label}:{' '}
                            </span>
                          )}
                          <span className="text-text-primary font-medium">
                            {item.value}
                          </span>
                        </a>
                      ) : (
                        <p className="text-sm">
                          {item.label && (
                            <span className="font-medium text-text-secondary">
                              {item.label}:{' '}
                            </span>
                          )}
                          <span className="text-text-primary font-medium">
                            {item.value}
                          </span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Quick Links Section */}
      <section className="bg-white py-12 md:py-16 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              {t('contact.quickAnswers.title')}
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              {t('contact.quickAnswers.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={item.href}
                  className="group block p-5 bg-gray-50 hover:bg-primary-lime/10 rounded-xl border border-gray-200 hover:border-primary-lime transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 group-hover:border-primary-lime flex items-center justify-center text-text-secondary group-hover:text-primary-lime transition-all flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary group-hover:text-primary-lime transition-colors leading-snug">
                        {item.question}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link to="/faq">
              <Button variant="outline" size="lg" className="gap-2">
                <HelpCircle className="w-5 h-5" />
                {t('contact.quickAnswers.viewAllFaqs')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;

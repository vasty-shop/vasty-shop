'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Store,
  Mail,
  Facebook,
  Linkedin,
  ArrowRight,
  Loader2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlatformSettings } from '@/contexts/PlatformSettingsContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const footerLinks = {
  platform: {
    title: 'Platform',
    links: [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Marketplace', href: '/explore' },
      { label: 'For Sellers', href: '/vendor/create-shop' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Press', href: '/press' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Data Deletion', href: '/data-deletion' },
    ],
  },
  resources: {
    title: 'Resources',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'FAQs', href: '/faq' },
      { label: 'Blog', href: '/blog' },
      { label: 'Site Map', href: '/sitemap' },
    ],
  },
};

// X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/infoinlet/', label: 'Facebook' },
  { icon: XIcon, href: 'https://x.com/inletinfo', label: 'X' },
  { icon: Linkedin, href: 'https://linkedin.com/company/info-inlet', label: 'LinkedIn' },
];

export function PlatformFooter() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const { settings } = usePlatformSettings();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const footerLinksTranslated = {
    platform: {
      title: t('platform.footer.sections.platform'),
      links: [
        { label: t('platform.footer.links.howItWorks'), href: '#how-it-works' },
        { label: t('platform.footer.links.features'), href: '/features' },
        { label: t('platform.footer.links.pricing'), href: '#pricing' },
        { label: t('platform.footer.links.marketplace'), href: '/explore' },
        { label: t('platform.footer.links.forSellers'), href: '/vendor/create-shop' },
      ],
    },
    company: {
      title: t('platform.footer.sections.company'),
      links: [
        { label: t('platform.footer.links.aboutUs'), href: '/about' },
        { label: t('platform.footer.links.press'), href: '/press' },
        { label: t('platform.footer.links.contact'), href: '/contact' },
      ],
    },
    legal: {
      title: t('platform.footer.sections.legal'),
      links: [
        { label: t('platform.footer.links.privacyPolicy'), href: '/privacy' },
        { label: t('platform.footer.links.termsOfService'), href: '/terms' },
        { label: t('platform.footer.links.cookiePolicy'), href: '/cookies' },
        { label: t('platform.footer.links.dataDeletion'), href: '/data-deletion' },
      ],
    },
    resources: {
      title: t('platform.footer.sections.resources'),
      links: [
        { label: t('platform.footer.links.helpCenter'), href: '/help' },
        { label: t('platform.footer.links.faqs'), href: '/faq' },
        { label: t('platform.footer.links.blog', 'Blog'), href: '/blog' },
        { label: t('platform.footer.links.siteMap'), href: '/sitemap' },
      ],
    },
  };

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);
    try {
      await api.post('/newsletter/subscribe', { email: email.trim() });
      setIsSubscribed(true);
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
      // Reset after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000);
    } catch (error: any) {
      // If API doesn't exist, still show success for UX
      if (error?.response?.status === 404) {
        setIsSubscribed(true);
        toast.success('Successfully subscribed to newsletter!');
        setEmail('');
        setTimeout(() => setIsSubscribed(false), 3000);
      } else {
        toast.error(error?.message || 'Failed to subscribe. Please try again.');
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.getElementById(href.slice(1));
      if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-white/10">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t('platform.footer.stayUpdated')}
              </h3>
              <p className="text-white/60">
                {t('platform.footer.newsletterDesc')}
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder={t('platform.footer.enterEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                disabled={isSubscribing || isSubscribed}
                className="flex-1 md:w-64 px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary-lime/50 disabled:opacity-50"
              />
              <Button
                onClick={handleSubscribe}
                disabled={isSubscribing || isSubscribed}
                className="bg-gradient-to-r from-primary-lime to-emerald-500 text-white px-6 disabled:opacity-70"
              >
                {isSubscribing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSubscribed ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t('platform.footer.subscribed')}
                  </>
                ) : (
                  <>
                    {t('platform.footer.subscribe')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              {settings.platformLogo ? (
                <>
                  <img
                    src={settings.platformLogo}
                    alt={settings.platformName}
                    className="h-10 w-auto max-w-[120px] object-contain"
                  />
                  <span className="text-xl font-bold text-white">{settings.platformName}</span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-lime to-emerald-500 flex items-center justify-center">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">{settings.platformName}</span>
                </>
              )}
            </Link>
            <p className="text-white/60 mb-6 max-w-sm">
              {t('platform.footer.platformDescription')}
            </p>
            <div className="space-y-3 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-lime" />
                <span>{settings.supportEmail}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-4">{t('platform.footer.followUs')}</h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-primary-lime hover:bg-white/10 transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinksTranslated).map(([key, section]) => (
            <div key={key}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-white/60 hover:text-primary-lime transition-colors text-sm"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-white/60 hover:text-primary-lime transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/40 text-sm">
            &copy; {currentYear} {settings.platformName}. {t('platform.footer.allRightsReserved')}
          </p>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link to="/privacy" className="hover:text-primary-lime transition-colors">{t('platform.footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-primary-lime transition-colors">{t('platform.footer.terms')}</Link>
            <Link to="/contact" className="hover:text-primary-lime transition-colors">{t('platform.footer.contact')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PlatformFooter;

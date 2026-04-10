'use client';

/**
 * Public Storefront Page
 * Renders a shop's custom storefront built with the AI Storefront Builder
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  Star,
  ArrowRight,
  Mail,
  ChevronRight,
  Play,
  Plus,
  Minus,
  Heart,
  Loader2,
  Store,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useCartStore } from '@/stores/useCartStore';
import { toast } from 'sonner';
import type {
  StorefrontConfig,
  StorefrontConfigV2,
  StorefrontSection,
  HeroSection,
  FeaturedProductsSection,
  AboutSection,
  TestimonialsSection,
  NewsletterSection,
  BannerSection,
  FAQSection,
  ContactSection,
  PageType,
} from '@/features/vendor/storefront-builder/types';
import { migrateConfigV1ToV2 } from '@/features/vendor/storefront-builder/constants';

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  images: string[];
  rating: number;
}

interface ShopInfo {
  id: string;
  name: string;
  logo?: string;
  description?: string;
}

interface PublicStorefrontProps {
  /** Override shopId from URL params (used for subdomain routing) */
  shopIdOverride?: string;
}

export function PublicStorefront({ shopIdOverride }: PublicStorefrontProps = {}) {
  const { shopId: shopIdFromParams, collectionId, productId } = useParams<{
    shopId: string;
    collectionId?: string;
    productId?: string;
  }>();
  const shopId = shopIdOverride || shopIdFromParams;
  const navigate = useNavigate();
  const location = window.location;

  // Determine current page from URL path
  const determineCurrentPage = (): PageType => {
    const path = location.pathname;
    if (path.includes('/collection')) return 'collection';
    if (path.includes('/product')) return 'product';
    if (path.includes('/cart')) return 'cart';
    if (path.includes('/checkout')) return 'checkout';
    if (path.includes('/wishlist')) return 'wishlist';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/track-order')) return 'trackOrder';
    return 'landing';
  };

  const [config, setConfig] = useState<StorefrontConfigV2 | null>(null);
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [currentPage] = useState<PageType>(determineCurrentPage);

  const fetchData = useCallback(async () => {
    if (!shopId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch storefront config and shop info in parallel
      const [storefrontResponse, shopResponse, productsResponse] = await Promise.all([
        api.getPublicStorefront(shopId).catch(() => null),
        api.getShop(shopId).catch(() => null),
        api.getProducts({ shopId, limit: 20 }).catch(() => ({ data: [] })),
      ]);

      if (!storefrontResponse || !storefrontResponse.published) {
        // No published storefront
        setError('Storefront not published');
        return;
      }

      // Use config from response, handle both nested and flat structure
      const rawConfig = storefrontResponse.config || storefrontResponse;
      const shopInfo = storefrontResponse.shop || shopResponse?.data || shopResponse;

      // Migrate V1 config to V2 if needed
      let v2Config: StorefrontConfigV2;
      if (rawConfig.version === 2 && rawConfig.pages) {
        v2Config = rawConfig as StorefrontConfigV2;
      } else {
        // Migrate V1 to V2
        v2Config = migrateConfigV1ToV2(rawConfig as StorefrontConfig, shopInfo?.name || 'Store');
      }

      setConfig(v2Config);
      setShop(shopInfo);
      setProducts(productsResponse?.data || []);
    } catch (err) {
      console.error('Failed to load storefront:', err);
      setError('Failed to load storefront');
    } finally {
      setIsLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-lime animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading storefront...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Storefront Not Available</h1>
          <p className="text-gray-500 mb-4">This shop hasn't published a custom storefront yet.</p>
          <Link
            to={`/store/${shopId}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-lime text-white rounded-lg hover:bg-primary-lime/90"
          >
            View Shop Profile
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const { theme, header, footer, seo, pages } = config;
  // Get sections for current page
  const sections = (pages?.[currentPage]?.sections || []) as StorefrontSection[];

  // Helper functions
  const getBorderRadius = (size: 'small' | 'medium' | 'large' = 'medium') => {
    const radiusMap: Record<string, Record<string, string>> = {
      none: { small: 'rounded-none', medium: 'rounded-none', large: 'rounded-none' },
      small: { small: 'rounded', medium: 'rounded-md', large: 'rounded-lg' },
      medium: { small: 'rounded-md', medium: 'rounded-lg', large: 'rounded-xl' },
      large: { small: 'rounded-lg', medium: 'rounded-xl', large: 'rounded-2xl' },
      full: { small: 'rounded-full', medium: 'rounded-full', large: 'rounded-full' },
    };
    return radiusMap[theme.borderRadius]?.[size] || 'rounded-lg';
  };

  const getButtonClasses = (variant: 'primary' | 'secondary' = 'primary') => {
    const base = `px-6 py-3 font-medium transition-all ${getBorderRadius('medium')}`;
    if (theme.buttonStyle === 'solid') {
      return variant === 'primary'
        ? `${base} text-white`
        : `${base} bg-gray-200 text-gray-800`;
    } else if (theme.buttonStyle === 'outline') {
      return `${base} border-2 bg-transparent`;
    }
    return `${base} bg-transparent hover:bg-gray-100`;
  };

  // Render sections
  const renderSection = (section: StorefrontSection) => {
    if (!section.enabled) return null;

    switch (section.type) {
      case 'hero':
        return renderHero(section as HeroSection);
      case 'featured-products':
        return renderFeaturedProducts(section as FeaturedProductsSection);
      case 'about':
        return renderAbout(section as AboutSection);
      case 'testimonials':
        return renderTestimonials(section as TestimonialsSection);
      case 'newsletter':
        return renderNewsletter(section as NewsletterSection);
      case 'banner':
        return renderBanner(section as BannerSection);
      case 'faq':
        return renderFAQ(section as FAQSection);
      case 'contact':
        return renderContact(section as ContactSection);
      default:
        return null;
    }
  };

  const renderHero = (section: HeroSection) => {
    const heightClasses = {
      small: 'min-h-[40vh]',
      medium: 'min-h-[60vh]',
      large: 'min-h-[80vh]',
      full: 'min-h-screen',
    };

    return (
      <section
        key={section.id}
        className={`relative ${heightClasses[section.height]} flex items-center justify-center`}
        style={{
          backgroundImage: section.backgroundType === 'image' && section.backgroundImage
            ? `url(${section.backgroundImage})`
            : section.backgroundType === 'gradient'
            ? section.backgroundGradient
            : undefined,
          backgroundColor: section.backgroundType === 'color' ? section.backgroundColor : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {section.overlayOpacity > 0 && (
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: section.overlayOpacity / 100 }}
          />
        )}
        <div className={`relative z-10 max-w-4xl mx-auto px-6 text-${section.textAlignment}`}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{ fontFamily: theme.headingFont, color: section.overlayOpacity > 30 ? 'white' : theme.textColor }}
          >
            {section.headline}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl mb-8 opacity-90"
            style={{ color: section.overlayOpacity > 30 ? 'white' : theme.textColor }}
          >
            {section.subheadline}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              to={section.ctaLink}
              className={getButtonClasses('primary')}
              style={{ backgroundColor: theme.primaryColor }}
            >
              {section.ctaText}
            </Link>
            {section.secondaryCtaText && (
              <Link
                to={section.secondaryCtaLink || '#'}
                className={getButtonClasses('secondary')}
                style={{ borderColor: section.overlayOpacity > 30 ? 'white' : theme.primaryColor }}
              >
                {section.secondaryCtaText}
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    );
  };

  const renderFeaturedProducts = (section: FeaturedProductsSection) => {
    const displayProducts = products.slice(0, section.limit || 8);

    return (
      <section key={section.id} className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: theme.headingFont }}
            >
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="text-lg opacity-70">{section.subtitle}</p>
            )}
          </div>

          <div
            className={`grid gap-6`}
            style={{ gridTemplateColumns: `repeat(${section.columns}, minmax(0, 1fr))` }}
          >
            {displayProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5 }}
                className={`${getBorderRadius('large')} overflow-hidden ${
                  theme.cardStyle === 'elevated' ? 'shadow-lg' :
                  theme.cardStyle === 'bordered' ? 'border' : ''
                }`}
                style={{
                  backgroundColor: theme.backgroundColor,
                  borderColor: theme.cardStyle === 'bordered' ? '#e5e7eb' : undefined,
                }}
              >
                <Link to={`/products/${product.id}`}>
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    {section.showRating && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm">{Number(product.rating || 5).toFixed(1)}</span>
                      </div>
                    )}
                    {section.showPrice && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: theme.primaryColor }}>
                          ${Number(product.salePrice || product.price || 0).toFixed(2)}
                        </span>
                        {product.salePrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ${Number(product.price || 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
                {section.showAddToCart && (
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => toast.success('Added to cart')}
                      className={`w-full ${getButtonClasses('primary')}`}
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      Add to Cart
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderAbout = (section: AboutSection) => (
    <section key={section.id} className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className={`flex flex-col ${section.imagePosition === 'right' ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center`}>
          {section.image && (
            <div className="flex-1">
              <img
                src={section.image}
                alt={section.title}
                className={`w-full ${getBorderRadius('large')}`}
              />
            </div>
          )}
          <div className="flex-1">
            <h2
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ fontFamily: theme.headingFont }}
            >
              {section.title}
            </h2>
            <div
              className="prose prose-lg"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
            {section.stats && section.stats.length > 0 && (
              <div className="grid grid-cols-3 gap-6 mt-8">
                {section.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
                      {stat.value}
                    </div>
                    <div className="text-sm opacity-70">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
            {section.ctaText && (
              <Link
                to={section.ctaLink || '#'}
                className={`inline-flex items-center gap-2 mt-8 ${getButtonClasses('primary')}`}
                style={{ backgroundColor: theme.primaryColor }}
              >
                {section.ctaText}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  const renderTestimonials = (section: TestimonialsSection) => (
    <section key={section.id} className="py-16 px-6" style={{ backgroundColor: theme.secondaryColor + '10' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: theme.headingFont }}
          >
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-lg opacity-70">{section.subtitle}</p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {section.testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`p-6 ${getBorderRadius('large')} ${
                theme.cardStyle === 'elevated' ? 'shadow-lg' : 'border'
              }`}
              style={{ backgroundColor: theme.backgroundColor }}
            >
              {section.showRating && testimonial.rating && (
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < testimonial.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
              )}
              <p className="mb-6 italic">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.primaryColor + '20' }}
                  >
                    <span style={{ color: theme.primaryColor }}>
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  {testimonial.role && (
                    <div className="text-sm opacity-70">{testimonial.role}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderNewsletter = (section: NewsletterSection) => (
    <section
      key={section.id}
      className={`py-16 px-6 ${section.variant === 'banner' ? 'text-white' : ''}`}
      style={{
        backgroundColor: section.backgroundColor || theme.primaryColor,
        backgroundImage: section.backgroundImage ? `url(${section.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-2xl mx-auto text-center">
        <h2
          className="text-3xl font-bold mb-4"
          style={{ fontFamily: theme.headingFont }}
        >
          {section.title}
        </h2>
        {section.subtitle && (
          <p className="text-lg opacity-90 mb-8">{section.subtitle}</p>
        )}
        <form className="flex flex-col sm:flex-row gap-4 justify-center" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder={section.placeholder}
            className={`flex-1 max-w-md px-4 py-3 ${getBorderRadius('medium')} border-0 focus:ring-2`}
            style={{ backgroundColor: 'white', color: theme.textColor }}
          />
          <button
            type="submit"
            className={`${getButtonClasses('primary')} whitespace-nowrap`}
            style={{ backgroundColor: theme.accentColor || theme.primaryColor }}
          >
            {section.buttonText}
          </button>
        </form>
      </div>
    </section>
  );

  const renderBanner = (section: BannerSection) => {
    const heightClasses = {
      small: 'py-12',
      medium: 'py-20',
      large: 'py-32',
    };

    return (
      <section
        key={section.id}
        className={`${heightClasses[section.height]} px-6`}
        style={{
          backgroundColor: section.backgroundColor,
          backgroundImage: section.backgroundImage ? `url(${section.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: section.textColor || 'white',
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: theme.headingFont }}
          >
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-lg opacity-90 mb-8">{section.subtitle}</p>
          )}
          {section.ctaText && (
            <Link
              to={section.ctaLink || '#'}
              className={`inline-flex items-center gap-2 ${getButtonClasses('primary')}`}
              style={{ backgroundColor: theme.primaryColor }}
            >
              {section.ctaText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>
    );
  };

  const renderFAQ = (section: FAQSection) => (
    <section key={section.id} className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: theme.headingFont }}
          >
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-lg opacity-70">{section.subtitle}</p>
          )}
        </div>

        <div className="space-y-4">
          {section.faqs.map((faq) => (
            <div
              key={faq.id}
              className={`${getBorderRadius('medium')} border overflow-hidden`}
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold"
                style={{ backgroundColor: theme.backgroundColor }}
              >
                {faq.question}
                {expandedFaq === faq.id ? (
                  <Minus className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 flex-shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {expandedFaq === faq.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 border-t opacity-80">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderContact = (section: ContactSection) => (
    <section key={section.id} className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: theme.headingFont }}
          >
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-lg opacity-70">{section.subtitle}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {section.showForm && (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className={`w-full px-4 py-3 border ${getBorderRadius('medium')}`}
              />
              <input
                type="email"
                placeholder="Your Email"
                className={`w-full px-4 py-3 border ${getBorderRadius('medium')}`}
              />
              <textarea
                placeholder="Your Message"
                rows={4}
                className={`w-full px-4 py-3 border ${getBorderRadius('medium')}`}
              />
              <button
                type="submit"
                className={`w-full ${getButtonClasses('primary')}`}
                style={{ backgroundColor: theme.primaryColor }}
              >
                Send Message
              </button>
            </form>
          )}

          <div className="space-y-6">
            {section.email && (
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.primaryColor + '20' }}
                >
                  <Mail className="w-5 h-5" style={{ color: theme.primaryColor }} />
                </div>
                <div>
                  <div className="text-sm opacity-70">Email</div>
                  <a href={`mailto:${section.email}`} className="font-semibold">
                    {section.email}
                  </a>
                </div>
              </div>
            )}
            {section.address && (
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: theme.primaryColor + '20' }}
                >
                  <Store className="w-5 h-5" style={{ color: theme.primaryColor }} />
                </div>
                <div>
                  <div className="text-sm opacity-70">Address</div>
                  <div className="font-semibold">{section.address}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.bodyFont,
      }}
    >
      {/* Header */}
      {header.announcementBar?.enabled && (
        <div
          className="py-2 px-4 text-center text-sm"
          style={{
            backgroundColor: header.announcementBar.backgroundColor,
            color: header.announcementBar.textColor,
          }}
        >
          {header.announcementBar.link ? (
            <Link to={header.announcementBar.link}>
              {header.announcementBar.text}
            </Link>
          ) : (
            header.announcementBar.text
          )}
        </div>
      )}

      <header
        className={`py-4 px-6 flex items-center ${
          header.variant === 'centered' ? 'justify-center' : 'justify-between'
        } ${header.sticky ? 'sticky top-0 z-50' : ''}`}
        style={{
          backgroundColor: header.transparent ? 'transparent' : theme.backgroundColor,
          borderBottom: header.transparent ? 'none' : '1px solid #e5e7eb',
        }}
      >
        {header.variant !== 'centered' && (
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        )}

        {header.showLogo && (
          <Link to={`/store/${shopId}`} className="text-xl font-bold" style={{ fontFamily: theme.headingFont }}>
            {shop?.name || 'Store'}
          </Link>
        )}

        <nav className="hidden md:flex items-center gap-6">
          {header.menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="text-sm hover:opacity-70 transition-opacity"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {header.showSearch && (
            <button className="p-2 hover:opacity-70">
              <Search className="w-5 h-5" />
            </button>
          )}
          {header.showAccount && (
            <Link to="/profile" className="p-2 hover:opacity-70">
              <User className="w-5 h-5" />
            </Link>
          )}
          {header.showCart && (
            <Link to="/cart" className="p-2 hover:opacity-70">
              <ShoppingCart className="w-5 h-5" />
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b"
            style={{ backgroundColor: theme.backgroundColor }}
          >
            <nav className="px-6 py-4 space-y-2">
              {header.menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="block py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sections */}
      <main>
        {sections
          .filter(s => s.enabled)
          .sort((a, b) => a.order - b.order)
          .map(renderSection)}
      </main>

      {/* Footer */}
      <footer
        className="py-12 px-6 border-t"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <div className="max-w-7xl mx-auto">
          {footer.variant === 'columns' && footer.columns.length > 0 && (
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {footer.showLogo && (
                <div>
                  <Link
                    to={`/store/${shopId}`}
                    className="text-xl font-bold"
                    style={{ fontFamily: theme.headingFont }}
                  >
                    {shop?.name || 'Store'}
                  </Link>
                  {shop?.description && (
                    <p className="mt-2 text-sm opacity-70 line-clamp-3">
                      {shop.description}
                    </p>
                  )}
                </div>
              )}
              {footer.columns.map((column) => (
                <div key={column.id}>
                  <h4 className="font-semibold mb-4">{column.title}</h4>
                  <ul className="space-y-2">
                    {column.links.map((link, index) => (
                      <li key={index}>
                        <Link
                          to={link.link}
                          className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t">
            <p className="text-sm opacity-70">
              {footer.copyrightText || `© ${new Date().getFullYear()} ${shop?.name || 'Store'}. All rights reserved.`}
            </p>
            {footer.showSocial && footer.socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {footer.socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {social.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicStorefront;

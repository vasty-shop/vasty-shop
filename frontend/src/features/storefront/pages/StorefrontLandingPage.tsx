'use client';

/**
 * Storefront Landing Page
 * Renders the customizable sections from the storefront builder
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ArrowRight,
  Mail,
  Plus,
  Minus,
  Store,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { useStorefront } from '../StorefrontLayout';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/useCartStore';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import type {
  StorefrontSection,
  HeroSection,
  HeroSlide,
  ContentPosition,
  FeaturedProductsSection,
  CategoriesSection,
  AboutSection,
  TestimonialsSection,
  NewsletterSection,
  BannerSection,
  FAQSection,
  ContactSection,
} from '@/features/vendor/storefront-builder/types';

// Helper function to get content position classes
const getContentPositionClasses = (position: ContentPosition = 'center') => {
  const positionMap: Record<ContentPosition, { justify: string; items: string }> = {
    'top-left': { justify: 'justify-start', items: 'items-start' },
    'top-center': { justify: 'justify-center', items: 'items-start' },
    'top-right': { justify: 'justify-end', items: 'items-start' },
    'center-left': { justify: 'justify-start', items: 'items-center' },
    'center': { justify: 'justify-center', items: 'items-center' },
    'center-right': { justify: 'justify-end', items: 'items-center' },
    'bottom-left': { justify: 'justify-start', items: 'items-end' },
    'bottom-center': { justify: 'justify-center', items: 'items-end' },
    'bottom-right': { justify: 'justify-end', items: 'items-end' },
  };
  return positionMap[position] || positionMap['center'];
};

interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  images: string[];
  thumbnail?: string;
  rating: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  productCount?: number;
  level?: number;
}

// Helper to truncate text
const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Helper to format price
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

// Helper to get image URL from various formats (string, object with url property, etc.)
const getImageUrl = (image: unknown): string | null => {
  if (!image) return null;
  if (typeof image === 'string') return image;
  if (typeof image === 'object' && image !== null) {
    // Handle {url: '...'} or {src: '...'} format
    const imgObj = image as Record<string, unknown>;
    if (typeof imgObj.url === 'string') return imgObj.url;
    if (typeof imgObj.src === 'string') return imgObj.src;
  }
  return null;
};

// Helper to check if image URL is valid
const isValidImageUrl = (image: unknown): boolean => {
  const url = getImageUrl(image);
  if (!url) return false;
  // Check for common invalid patterns
  if (url.startsWith('file://') || url.startsWith('/path/')) return false;
  // Must be a valid URL or start with /
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('data:');
};

// Default placeholder image
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23374151" width="400" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="16" text-anchor="middle" x="200" y="200"%3ENo Image%3C/text%3E%3C/svg%3E';

export function StorefrontLandingPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { config, shop, theme } = useStorefront();
  const { isStoreAuthenticated } = useStoreAuth();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const { addItem } = useCartStore();

  // Translation helpers for default section content
  const translateSectionTitle = (title: string): string => {
    const titleTranslations: Record<string, string> = {
      'Featured Products': t('home.featuredProducts'),
      'Our Products': t('products.allProducts'),
      'Shop by Category': t('home.shopByCategory'),
      'Our Story': t('about.ourStory'),
      'What Our Customers Say': t('home.testimonials'),
      'Stay Updated': t('home.stayUpdated'),
      'Trending Now': t('home.trendingNow'),
      'New Arrivals': t('home.newArrivals'),
      'Best Sellers': t('home.bestSellers'),
      'Special Offers': t('home.specialOffers'),
      'Welcome to Our Store': t('home.heroTitle'),
      'Frequently Asked Questions': t('faq.title'),
      'Get in Touch': t('contact.contactUs'),
      'Hot picks you will love': t('home.hotPicks'),
      'Why Choose Us': t('home.whyChooseUs'),
      'Get 15% Off Your First Order': t('home.firstOrderDiscount'),
    };
    return titleTranslations[title] || title;
  };

  const translateSectionSubtitle = (subtitle: string): string => {
    const subtitleTranslations: Record<string, string> = {
      'Our handpicked favorites': t('home.handpickedFavorites'),
      'Handpicked favorites just for you': t('home.handpickedFavorites'),
      'Discover amazing products crafted just for you': t('home.heroSubtitle'),
      'Discover amazing products crafted with love': t('home.discoverProducts'),
      'Find the perfect products for your lifestyle': t('home.heroSubtitle'),
      'Subscribe for exclusive offers': t('home.subscribeExclusive'),
      'Subscribe for exclusive offers and new arrivals': t('home.subscribeExclusiveArrivals'),
      'Check out our latest arrivals': t('home.latestArrivalsDesc'),
      'Explore our latest arrivals': t('home.latestArrivalsDesc'),
      'Our most popular items': t('home.popularItemsDesc'),
      'See what everyone is loving': t('home.seeWhatEveryoneLoves'),
      'Find exactly what you need': t('home.findWhatYouNeed'),
      'Real reviews from real people': t('home.realReviews'),
      'Fresh drops every week': t('home.freshDrops'),
      'We bring you the best products with unmatched quality and style. Every item is carefully curated to meet your expectations.': t('home.whyChooseUsDesc'),
      'Subscribe for exclusive deals and updates': t('home.subscribeDealsUpdates'),
    };
    return subtitleTranslations[subtitle] || subtitle;
  };

  const translateButtonText = (text: string): string => {
    const buttonTranslations: Record<string, string> = {
      'Shop Now': t('common.shopNow'),
      'Subscribe': t('common.subscribe'),
      'Learn More': t('common.learnMore'),
      'View All': t('common.viewAll'),
      'See More': t('common.seeMore'),
    };
    return buttonTranslations[text] || text;
  };

  const translatePlaceholder = (placeholder: string): string => {
    const placeholderTranslations: Record<string, string> = {
      'Enter your email': t('common.emailPlaceholder'),
    };
    return placeholderTranslations[placeholder] || placeholder;
  };

  const translateContent = (content: string): string => {
    const contentTranslations: Record<string, string> = {
      'We started with a simple mission: to bring you the best products with exceptional service.': t('about.missionStatement'),
      'We started with a simple mission: to bring you the best products with exceptional service. Every item in our store is carefully selected to ensure quality and value.': t('about.fullMissionStatement'),
      'We bring you the best products with unmatched quality and style. Every item is carefully curated to meet your expectations.': t('home.whyChooseUsDesc'),
    };
    return contentTranslations[content] || content;
  };

  const translateStatLabel = (label: string): string => {
    const labelTranslations: Record<string, string> = {
      'Happy Customers': t('about.happyCustomers'),
      'Products': t('about.products'),
      'Years Experience': t('about.yearsExperience'),
    };
    return labelTranslations[label] || label;
  };

  // Check if user is authenticated for this store
  const isAuthenticated = shopId ? isStoreAuthenticated(shopId) : false;

  useEffect(() => {
    if (shopId) {
      // Fetch products and categories in parallel
      Promise.all([
        api.getProducts({ shopId, limit: 20 }),
        api.getCategories(),
      ])
        .then(([productsRes, categoriesRes]) => {
          // Map backend snake_case fields to frontend camelCase
          // Shopify convention: price = selling price, compare_price = original (crossed out)
          const transformedProducts = (productsRes?.data || []).map((product: any) => {
            const priceVal = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
            const comparePrice = product.compare_price || product.comparePrice || product.compareAtPrice;
            const comparePriceVal = comparePrice ? (typeof comparePrice === 'string' ? parseFloat(comparePrice) : comparePrice) : undefined;
            // If compare price exists and is higher than price, product is on sale
            const isOnSale = comparePriceVal && comparePriceVal > priceVal;

            return {
              ...product,
              price: isOnSale ? comparePriceVal : priceVal, // Original price for display
              salePrice: isOnSale ? priceVal : undefined, // Sale price only if on sale
              shopId: product.shop_id || product.shopId,
              shopName: product.shop_name || product.shopName,
            };
          });
          setProducts(transformedProducts);
          setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
        })
        .catch(() => {
          setProducts([]);
          setCategories([]);
        });
    }
  }, [shopId]);

  if (!config || !theme) {
    return null;
  }

  const sections = (config.pages?.landing?.sections || []) as StorefrontSection[];

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

  const getButtonStyle = (variant: 'primary' | 'secondary' = 'primary'): React.CSSProperties => {
    if (theme.buttonStyle === 'solid') {
      return variant === 'primary'
        ? { backgroundColor: theme.primaryColor, color: '#fff' }
        : { backgroundColor: '#e5e7eb', color: '#1f2937' };
    } else if (theme.buttonStyle === 'outline') {
      return {
        backgroundColor: 'transparent',
        borderColor: variant === 'primary' ? theme.primaryColor : theme.secondaryColor,
        color: variant === 'primary' ? theme.primaryColor : theme.textColor,
      };
    }
    // ghost
    return {
      backgroundColor: 'transparent',
      color: variant === 'primary' ? theme.primaryColor : theme.textColor,
    };
  };

  const getButtonClasses = (variant: 'primary' | 'secondary' = 'primary') => {
    const base = `px-6 py-3 font-medium transition-all ${getBorderRadius('medium')}`;
    if (theme.buttonStyle === 'solid') {
      return `${base}`;
    } else if (theme.buttonStyle === 'outline') {
      return `${base} border-2`;
    }
    return `${base} hover:bg-gray-100/10`;
  };

  const handleAddToCart = async (product: Product) => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.info(t('auth.signInToContinue'));
      navigate(`/store/${shopId}/login`, { state: { from: `/store/${shopId}` } });
      return;
    }

    // Create a product with shopId for the cart store
    const productWithShopId = {
      ...product,
      shopId: shopId || '',
    } as any;
    await addItem(productWithShopId, 'M'); // Default size
    toast.success(t('products.addedToCart'));
  };

  const renderSection = (section: StorefrontSection) => {
    if (!section.enabled) return null;

    switch (section.type) {
      case 'hero':
        return renderHero(section as HeroSection);
      case 'featured-products':
        return renderFeaturedProducts(section as FeaturedProductsSection);
      case 'categories':
        return renderCategories(section as CategoriesSection);
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

  // Generate theme-based gradient for hero
  const getThemeGradient = () => {
    return `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`;
  };

  // Helper to get text alignment class
  const getTextAlignmentClass = (alignment: string = 'center') => {
    const alignmentMap: Record<string, string> = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };
    return alignmentMap[alignment] || 'text-center';
  };

  // Hero Slideshow Component
  const HeroSlideshow: React.FC<{ section: HeroSection }> = ({ section }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Generate dynamic slides from products
    const dynamicSlides: HeroSlide[] = products.slice(0, 3).map((product) => {
      const productImage = product.images?.[0] || product.thumbnail;
      const validImageUrl = isValidImageUrl(productImage) ? getImageUrl(productImage) : null;
      return {
        id: `product-slide-${product.id}`,
        headline: product.name,
        subheadline: truncateText(product.description || product.shortDescription || `${t('home.heroSubtitle')}`, 100),
        ctaText: t('common.shopNow'),
        ctaLink: `/product/${product.slug || product.id}`,
        backgroundImage: validImageUrl || '',
        backgroundGradient: getThemeGradient(),
        overlayOpacity: validImageUrl ? 50 : 30,
      };
    });

    // Use dynamic slides if useDynamicContent is enabled, otherwise use manual slides
    const slides = section.useDynamicContent
      ? dynamicSlides
      : (section.slides && section.slides.length > 0) ? section.slides : dynamicSlides;

    useEffect(() => {
      if (!section.autoplay || slides.length <= 1) return;

      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, (section.autoplayInterval || 5) * 1000);

      return () => clearInterval(interval);
    }, [section.autoplay, section.autoplayInterval, slides.length]);

    if (slides.length === 0) {
      // Fallback when no products and no slides - show shop info
      return (
        <section
          className="relative min-h-[60vh] flex items-center justify-center"
          style={{ background: getThemeGradient() }}
        >
          <div className="relative z-10 text-center px-6">
            <h1
              className="text-4xl md:text-6xl font-bold mb-6 text-white"
              style={{ fontFamily: theme.headingFont }}
            >
              {shop?.name || t('header.welcome')}
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90 text-white">
              {shop?.description || t('home.heroSubtitle')}
            </p>
            <Link
              to={`/store/${shopId}/products`}
              className={getButtonClasses('primary')}
              style={getButtonStyle('primary')}
            >
              {t('common.shopNow')}
            </Link>
          </div>
        </section>
      );
    }

    const heightClasses = {
      small: 'min-h-[40vh]',
      medium: 'min-h-[60vh]',
      large: 'min-h-[80vh]',
      full: 'min-h-screen',
    };

    // Get current slide's overlay (fallback to section overlay)
    const currentSlideOverlay = slides[currentSlide]?.overlayOpacity ?? section.overlayOpacity ?? 0;
    const textColor = currentSlideOverlay > 30 || slides[currentSlide]?.backgroundImage ? 'white' : theme.textColor;
    const positionClasses = getContentPositionClasses(section.contentPosition);
    const textAlignClass = getTextAlignmentClass(section.textAlignment);

    return (
      <section key={section.id} className={`relative ${heightClasses[section.height]} overflow-hidden`}>
        {/* Slides */}
        <AnimatePresence mode="wait">
          {slides.map((slide, index) => {
            if (index !== currentSlide) return null;
            const slideBackground = slide.backgroundImage
              ? { backgroundImage: `url(${slide.backgroundImage})` }
              : { background: slide.backgroundGradient || getThemeGradient() };
            const slideOverlay = slide.overlayOpacity ?? section.overlayOpacity ?? 0;

            return (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
                style={{
                  ...slideBackground,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Per-slide overlay */}
                {slideOverlay > 0 && (
                  <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: slideOverlay / 100 }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Content */}
        <div className={`relative z-20 h-full w-full flex ${positionClasses.items} ${positionClasses.justify} px-6 md:px-12 py-12`}>
          <div className={`max-w-4xl ${textAlignClass}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1
                  className="text-4xl md:text-6xl font-bold mb-6"
                  style={{ fontFamily: theme.headingFont, color: textColor }}
                >
                  {translateSectionTitle(slides[currentSlide].headline)}
                </h1>
                <p
                  className="text-lg md:text-xl mb-8 opacity-90"
                  style={{ color: textColor }}
                >
                  {translateSectionSubtitle(slides[currentSlide].subheadline)}
                </p>
                {slides[currentSlide].ctaText && (
                  <Link
                    to={slides[currentSlide].ctaLink?.startsWith('/')
                      ? `/store/${shopId}${slides[currentSlide].ctaLink}`
                      : slides[currentSlide].ctaLink || `/store/${shopId}/products`}
                    className={getButtonClasses('primary')}
                    style={getButtonStyle('primary')}
                  >
                    {translateButtonText(slides[currentSlide].ctaText)}
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slide Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-white scale-110'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </section>
    );
  };

  const renderHero = (section: HeroSection) => {
    // Handle slideshow variant - now also works with dynamic product slides
    if (section.variant === 'slideshow') {
      return <HeroSlideshow key={section.id} section={section} />;
    }

    // Handle dynamic content for non-slideshow variants (centered, split, minimal)
    if (section.useDynamicContent && products.length > 0) {
      const product = products[0]; // Use first product
      const productImage = product.images?.[0] || product.thumbnail;
      const validImageUrl = isValidImageUrl(productImage) ? getImageUrl(productImage) : null;

      const heightClasses = {
        small: 'min-h-[40vh]',
        medium: 'min-h-[60vh]',
        large: 'min-h-[80vh]',
        full: 'min-h-screen',
      };
      const positionClasses = getContentPositionClasses(section.contentPosition);
      const textAlignClass = getTextAlignmentClass(section.textAlignment);
      const buttonAlignClass = section.textAlignment === 'center'
        ? 'justify-center'
        : section.textAlignment === 'right'
        ? 'justify-end'
        : 'justify-start';

      return (
        <section
          key={section.id}
          className={`relative ${heightClasses[section.height]} flex ${positionClasses.items} ${positionClasses.justify}`}
          style={{
            backgroundImage: validImageUrl ? `url(${validImageUrl})` : undefined,
            background: !validImageUrl ? getThemeGradient() : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className={`relative z-10 max-w-4xl px-6 md:px-12 py-12 ${textAlignClass}`}>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-4 text-white"
              style={{ fontFamily: theme.headingFont }}
            >
              {product.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl mb-4 opacity-90 text-white line-clamp-2"
            >
              {truncateText(product.description || product.shortDescription || '', 100)}
            </motion.p>
            {/* Price */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-bold mb-6"
              style={{ color: theme.accentColor }}
            >
              {product.salePrice && product.salePrice < product.price ? (
                <>
                  <span className="line-through opacity-60 mr-2 text-white">{formatPrice(product.price)}</span>
                  {formatPrice(product.salePrice)}
                </>
              ) : (
                formatPrice(product.price)
              )}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`flex flex-wrap gap-4 ${buttonAlignClass}`}
            >
              <Link
                to={`/store/${shopId}/product/${product.id}`}
                className={getButtonClasses('primary')}
                style={getButtonStyle('primary')}
              >
                {t('common.shopNow')}
              </Link>
            </motion.div>
          </div>
        </section>
      );
    }

    const heightClasses = {
      small: 'min-h-[40vh]',
      medium: 'min-h-[60vh]',
      large: 'min-h-[80vh]',
      full: 'min-h-screen',
    };

    // Use the gradient from section config directly - don't auto-replace
    const backgroundGradient = section.backgroundGradient || getThemeGradient();
    const positionClasses = getContentPositionClasses(section.contentPosition);
    const textAlignClass = getTextAlignmentClass(section.textAlignment);

    // Get button alignment based on text alignment
    const buttonAlignClass = section.textAlignment === 'center'
      ? 'justify-center'
      : section.textAlignment === 'right'
      ? 'justify-end'
      : 'justify-start';

    return (
      <section
        key={section.id}
        className={`relative ${heightClasses[section.height]} flex ${positionClasses.items} ${positionClasses.justify}`}
        style={{
          backgroundImage: section.backgroundType === 'image' && section.backgroundImage
            ? `url(${section.backgroundImage})`
            : section.backgroundType === 'gradient'
            ? backgroundGradient
            : undefined,
          backgroundColor: section.backgroundType === 'color' ? (section.backgroundColor || theme.primaryColor) : undefined,
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
        <div className={`relative z-10 max-w-4xl px-6 md:px-12 py-12 ${textAlignClass}`}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{ fontFamily: theme.headingFont, color: section.overlayOpacity > 30 ? 'white' : theme.textColor }}
          >
            {translateSectionTitle(section.headline)}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl mb-8 opacity-90"
            style={{ color: section.overlayOpacity > 30 ? 'white' : theme.textColor }}
          >
            {translateSectionSubtitle(section.subheadline)}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`flex flex-wrap gap-4 ${buttonAlignClass}`}
          >
            <Link
              to={section.ctaLink?.startsWith('/') ? `/store/${shopId}${section.ctaLink}` : section.ctaLink || `/store/${shopId}/products`}
              className={getButtonClasses('primary')}
              style={getButtonStyle('primary')}
            >
              {translateButtonText(section.ctaText)}
            </Link>
            {section.secondaryCtaText && (
              <Link
                to={section.secondaryCtaLink?.startsWith('/') ? `/store/${shopId}${section.secondaryCtaLink}` : section.secondaryCtaLink || '#'}
                className={getButtonClasses('secondary')}
                style={{
                  ...getButtonStyle('secondary'),
                  ...(section.overlayOpacity > 30 ? { borderColor: 'white', color: 'white' } : {}),
                }}
              >
                {translateButtonText(section.secondaryCtaText)}
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
              {translateSectionTitle(section.title)}
            </h2>
            {section.subtitle && (
              <p className="text-lg opacity-70">{translateSectionSubtitle(section.subtitle)}</p>
            )}
          </div>

          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: `repeat(auto-fill, minmax(250px, 1fr))` }}
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
                <Link to={`/store/${shopId}/product/${product.id}`}>
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {isValidImageUrl(product.images?.[0]) ? (
                      <img
                        src={getImageUrl(product.images?.[0]) || PLACEHOLDER_IMAGE}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-1">{product.name}</h3>
                    {/* 2-line description */}
                    {(product.shortDescription || product.description) && (
                      <p className="text-sm opacity-60 mb-2 line-clamp-2">
                        {product.shortDescription || truncateText(product.description || '', 80)}
                      </p>
                    )}
                    {section.showRating && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm">{Number(product.rating || 5).toFixed(1)}</span>
                      </div>
                    )}
                    {section.showPrice && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: theme.primaryColor }}>
                          {formatPrice(product.salePrice || product.price || 0)}
                        </span>
                        {product.salePrice && product.salePrice < product.price && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.price || 0)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
                {section.showAddToCart && (
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`w-full ${getButtonClasses('primary')}`}
                      style={getButtonStyle('primary')}
                    >
                      {t('common.addToCart')}
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {products.length > (section.limit || 8) && (
            <div className="text-center mt-8">
              <Link
                to={`/store/${shopId}/products`}
                className={`inline-flex items-center gap-2 ${getButtonClasses('secondary')}`}
                style={getButtonStyle('secondary')}
              >
                {t('products.allProducts')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderCategories = (section: CategoriesSection) => {
    const colsClass =
      section.columns === 2
        ? 'grid-cols-2'
        : section.columns === 3
        ? 'grid-cols-2 md:grid-cols-3'
        : section.columns === 6
        ? 'grid-cols-3 md:grid-cols-6'
        : 'grid-cols-2 md:grid-cols-4';

    // Use dynamic categories if useDynamicContent is enabled and categories exist
    const useDynamic = section.useDynamicContent && categories.length > 0;
    const displayCategories = useDynamic
      ? categories.slice(0, section.columns)
      : null;
    // Fallback category names - use translations
    const fallbackCategories = [
      t('products.category') + ' 1',
      t('products.category') + ' 2',
      t('products.category') + ' 3',
      t('products.category') + ' 4',
      t('products.category') + ' 5',
      t('products.category') + ' 6',
    ];

    return (
      <section key={section.id} className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: theme.headingFont }}
            >
              {translateSectionTitle(section.title)}
            </h2>
            {section.subtitle && (
              <p className="text-lg opacity-70">{translateSectionSubtitle(section.subtitle)}</p>
            )}
          </div>

          <div className={`grid ${colsClass} gap-4`}>
            {displayCategories ? (
              // Render dynamic categories
              displayCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/store/${shopId}/products?category=${category.slug}`}
                  className={`group relative aspect-square ${getBorderRadius('large')} overflow-hidden`}
                >
                  {/* Category image or gradient */}
                  {category.image && isValidImageUrl(category.image) ? (
                    <img
                      src={getImageUrl(category.image) || ''}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    {section.showProductCount && category.productCount !== undefined && (
                      <p className="text-sm opacity-80">{category.productCount} {t('about.products')}</p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              // Render fallback/placeholder categories
              fallbackCategories.slice(0, section.columns).map((name, i) => (
                <Link
                  key={i}
                  to={`/store/${shopId}/products`}
                  className={`group relative aspect-square ${getBorderRadius('large')} overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <h3 className="text-lg font-semibold">{name}</h3>
                    {section.showProductCount && (
                      <p className="text-sm opacity-80">{Math.floor(Math.random() * 50) + 10} {t('about.products')}</p>
                    )}
                  </div>
                </Link>
              ))
            )}
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
                alt={translateSectionTitle(section.title)}
                className={`w-full ${getBorderRadius('large')}`}
              />
            </div>
          )}
          <div className="flex-1">
            <h2
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ fontFamily: theme.headingFont }}
            >
              {translateSectionTitle(section.title)}
            </h2>
            <div
              className="prose prose-lg"
              dangerouslySetInnerHTML={{ __html: translateContent(section.content) }}
            />
            {section.stats && section.stats.length > 0 && (
              <div className="grid grid-cols-3 gap-6 mt-8">
                {section.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
                      {stat.value}
                    </div>
                    <div className="text-sm opacity-70">{translateStatLabel(stat.label)}</div>
                  </div>
                ))}
              </div>
            )}
            {section.ctaText && (
              <Link
                to={section.ctaLink?.startsWith('/') ? `/store/${shopId}${section.ctaLink}` : section.ctaLink || '#'}
                className={`inline-flex items-center gap-2 mt-8 ${getButtonClasses('primary')}`}
                style={getButtonStyle('primary')}
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
            {translateSectionTitle(section.title)}
          </h2>
          {section.subtitle && (
            <p className="text-lg opacity-70">{translateSectionSubtitle(section.subtitle)}</p>
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

  const renderNewsletter = (section: NewsletterSection) => {
    // Use theme color if section uses default dark background
    const isDefaultBackground = section.backgroundColor === '#1F2937';
    const backgroundColor = isDefaultBackground ? theme.primaryColor : (section.backgroundColor || theme.primaryColor);

    return (
    <section
      key={section.id}
      className={`py-16 px-6 ${section.variant === 'banner' ? 'text-white' : ''}`}
      style={{
        backgroundColor,
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
          {translateSectionTitle(section.title)}
        </h2>
        {section.subtitle && (
          <p className="text-lg opacity-90 mb-8">{translateSectionSubtitle(section.subtitle)}</p>
        )}
        <form className="flex flex-col sm:flex-row gap-4 justify-center" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder={translatePlaceholder(section.placeholder)}
            className={`flex-1 max-w-md px-4 py-3 ${getBorderRadius('medium')} border-0 focus:ring-2`}
            style={{ backgroundColor: 'white', color: theme.textColor }}
          />
          <button
            type="submit"
            className={`${getButtonClasses('primary')} whitespace-nowrap`}
            style={getButtonStyle('primary')}
          >
            {translateButtonText(section.buttonText)}
          </button>
        </form>
      </div>
    </section>
    );
  };

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
            {translateSectionTitle(section.title)}
          </h2>
          {section.subtitle && (
            <p className="text-lg opacity-90 mb-8">{translateSectionSubtitle(section.subtitle)}</p>
          )}
          {section.ctaText && (
            <Link
              to={section.ctaLink?.startsWith('/') ? `/store/${shopId}${section.ctaLink}` : section.ctaLink || '#'}
              className={`inline-flex items-center gap-2 ${getButtonClasses('primary')}`}
              style={getButtonStyle('primary')}
            >
              {translateButtonText(section.ctaText)}
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
            {translateSectionTitle(section.title)}
          </h2>
          {section.subtitle && (
            <p className="text-lg opacity-70">{translateSectionSubtitle(section.subtitle)}</p>
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
            {translateSectionTitle(section.title)}
          </h2>
          {section.subtitle && (
            <p className="text-lg opacity-70">{translateSectionSubtitle(section.subtitle)}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {section.showForm && (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <input
                type="text"
                placeholder={t('contact.name')}
                className={`w-full px-4 py-3 border ${getBorderRadius('medium')}`}
              />
              <input
                type="email"
                placeholder={t('checkout.email')}
                className={`w-full px-4 py-3 border ${getBorderRadius('medium')}`}
              />
              <textarea
                placeholder={t('contact.message')}
                rows={4}
                className={`w-full px-4 py-3 border ${getBorderRadius('medium')}`}
              />
              <button
                type="submit"
                className={`w-full ${getButtonClasses('primary')}`}
                style={getButtonStyle('primary')}
              >
                {t('contact.sendMessage')}
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
                  <div className="text-sm opacity-70">{t('checkout.email')}</div>
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
                  <div className="text-sm opacity-70">{t('contact.address')}</div>
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
    <>
      {sections
        .filter(s => s.enabled)
        .sort((a, b) => a.order - b.order)
        .map(renderSection)}
    </>
  );
}

export default StorefrontLandingPage;

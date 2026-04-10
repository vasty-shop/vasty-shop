/**
 * Live Preview Component
 * Renders a live preview of the storefront configuration
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  Star,
  ArrowRight,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Heart,
  Store,
} from 'lucide-react';
import type { StorefrontConfig, StorefrontConfigV2, StorefrontSection, PageType, ContentPosition } from '../types';

// Generic section type for renderSection function to handle both landing and page-specific sections
// Using a permissive type to allow property access for all section types
type AnySection = {
  id: string;
  type: string;
  enabled: boolean;
  order: number;
  [key: string]: any;
};

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

// Product interface for type safety
interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  images: string[];
  thumbnail?: string;
  category?: { id: string; name: string };
  status: string;
  createdAt: string;
}

interface ShopData {
  name: string;
  logo?: string;
  banner?: string;
  description?: string;
  tagline?: string;
}

// Category interface for type safety
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

interface LivePreviewProps {
  config: StorefrontConfig | StorefrontConfigV2;
  currentPage?: PageType;
  selectedSectionId: string | null;
  onSelectSection: (id: string | null) => void;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  isFullPreview?: boolean;
  products?: Product[];
  categories?: Category[];
  shopData?: ShopData | null;
  onNavigate?: (page: PageType) => void;
}

// Helper to map URL paths to PageType
const urlToPageType = (url: string): PageType | null => {
  if (!url) return null;
  const path = url.toLowerCase();
  if (path.includes('/cart')) return 'cart';
  if (path.includes('/checkout')) return 'checkout';
  if (path.includes('/wishlist')) return 'wishlist';
  if (path.includes('/profile') || path.includes('/account')) return 'profile';
  if (path.includes('/track') || path.includes('/order')) return 'trackOrder';
  if (path.includes('/about')) return 'about';
  if (path.includes('/contact')) return 'contact';
  if (path.includes('/search')) return 'search';
  if (path.includes('/product/') || path.includes('/products/')) return 'product';
  if (path.includes('/collections')) return 'collections';
  if (path.includes('/collection') || path.includes('/products') || path.includes('/shop')) return 'collection';
  if (path === '/' || path.includes('/home') || path.includes('/landing')) return 'landing';
  return null;
};

// PreviewLink component - handles navigation within preview mode
interface PreviewLinkProps {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onNavigate?: (page: PageType) => void;
}

const PreviewLink: React.FC<PreviewLinkProps> = ({ href, className, style, children, onNavigate }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onNavigate) {
      const pageType = urlToPageType(href);
      if (pageType) {
        onNavigate(pageType);
      }
    }
  };

  return (
    <a href={href} className={className} style={style} onClick={handleClick}>
      {children}
    </a>
  );
};

// Demo products for preview - ensures UI always looks complete
const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-1',
    name: 'Premium Wireless Headphones',
    slug: 'premium-wireless-headphones',
    description: 'High-quality wireless headphones with active noise cancellation and premium sound quality.',
    shortDescription: 'Premium sound with ANC',
    price: 199.99,
    salePrice: 149.99,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'],
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
    category: { id: 'cat-1', name: 'Electronics' },
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    name: 'Classic Cotton T-Shirt',
    slug: 'classic-cotton-tshirt',
    description: 'Comfortable 100% cotton t-shirt perfect for everyday wear.',
    shortDescription: 'Soft & comfortable',
    price: 29.99,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'],
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
    category: { id: 'cat-2', name: 'Clothing' },
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    name: 'Running Sneakers Pro',
    slug: 'running-sneakers-pro',
    description: 'Professional running shoes with advanced cushioning technology.',
    shortDescription: 'Maximum comfort & performance',
    price: 159.99,
    salePrice: 129.99,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'],
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
    category: { id: 'cat-3', name: 'Sports' },
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    name: 'Smart Watch Series 5',
    slug: 'smart-watch-series-5',
    description: 'Feature-packed smartwatch with health tracking and notifications.',
    shortDescription: 'Stay connected & healthy',
    price: 299.99,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'],
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
    category: { id: 'cat-1', name: 'Electronics' },
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    name: 'Leather Messenger Bag',
    slug: 'leather-messenger-bag',
    description: 'Genuine leather messenger bag perfect for work or travel.',
    shortDescription: 'Classic style & durability',
    price: 189.99,
    salePrice: 159.99,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'],
    thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
    category: { id: 'cat-4', name: 'Accessories' },
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-6',
    name: 'Organic Green Tea Set',
    slug: 'organic-green-tea-set',
    description: 'Premium organic green tea collection with ceramic teapot.',
    shortDescription: 'Pure & refreshing',
    price: 49.99,
    images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop'],
    thumbnail: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop',
    category: { id: 'cat-5', name: 'Food & Drinks' },
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-7',
    name: 'Minimalist Desk Lamp',
    slug: 'minimalist-desk-lamp',
    description: 'Modern LED desk lamp with adjustable brightness levels.',
    shortDescription: 'Elegant & functional',
    price: 79.99,
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop'],
    thumbnail: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&h=200&fit=crop',
    category: { id: 'cat-6', name: 'Home & Living' },
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-8',
    name: 'Yoga Mat Premium',
    slug: 'yoga-mat-premium',
    description: 'Extra thick yoga mat with non-slip surface for all exercises.',
    shortDescription: 'Comfort & stability',
    price: 59.99,
    salePrice: 44.99,
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop'],
    thumbnail: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=200&h=200&fit=crop',
    category: { id: 'cat-3', name: 'Sports' },
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

// Demo categories for preview
const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Electronics', slug: 'electronics', description: 'Latest gadgets and tech', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop', productCount: 45 },
  { id: 'cat-2', name: 'Clothing', slug: 'clothing', description: 'Fashion for everyone', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop', productCount: 120 },
  { id: 'cat-3', name: 'Sports', slug: 'sports', description: 'Gear for active lifestyle', image: 'https://images.unsplash.com/photo-1461896836934- voices?w=300&h=300&fit=crop', productCount: 78 },
  { id: 'cat-4', name: 'Accessories', slug: 'accessories', description: 'Complete your look', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=300&h=300&fit=crop', productCount: 56 },
  { id: 'cat-5', name: 'Food & Drinks', slug: 'food-drinks', description: 'Gourmet selections', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop', productCount: 34 },
  { id: 'cat-6', name: 'Home & Living', slug: 'home-living', description: 'Comfort for your space', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=300&h=300&fit=crop', productCount: 89 },
];

export const LivePreview: React.FC<LivePreviewProps> = ({
  config,
  currentPage = 'landing',
  selectedSectionId,
  onSelectSection,
  previewMode,
  isFullPreview = false,
  products: _products = [],
  categories: _categories = [],
  shopData = null,
  onNavigate,
}) => {
  const { theme, header, footer } = config;

  // Always use demo data for preview (real data is used in actual storefront after creation)
  const products = DEMO_PRODUCTS;
  const categories = DEMO_CATEGORIES;

  // Default sections for about page
  const DEFAULT_ABOUT_SECTIONS: AnySection[] = [
    { id: 'about-hero-1', type: 'about-hero', enabled: true, order: 0 },
    { id: 'about-content-1', type: 'about-content', enabled: true, order: 1 },
    { id: 'about-stats-1', type: 'about-stats', enabled: true, order: 2 },
    { id: 'about-values-1', type: 'about-values', enabled: true, order: 3 },
  ];

  // Default sections for contact page
  const DEFAULT_CONTACT_SECTIONS: AnySection[] = [
    { id: 'contact-hero-1', type: 'contact-hero', enabled: true, order: 0 },
    { id: 'contact-form-1', type: 'contact-form', enabled: true, order: 1 },
    { id: 'contact-map-1', type: 'contact-map', enabled: true, order: 2 },
  ];

  // Default sections for search page
  const DEFAULT_SEARCH_SECTIONS: AnySection[] = [
    { id: 'search-page-1', type: 'search-page', enabled: true, order: 0 },
  ];

  // Default sections for track order page
  const DEFAULT_TRACK_ORDER_SECTIONS: AnySection[] = [
    { id: 'track-order-page-1', type: 'track-order-page', enabled: true, order: 0 },
  ];

  // Default sections for checkout page
  const DEFAULT_CHECKOUT_SECTIONS: AnySection[] = [
    { id: 'checkout-page-1', type: 'checkout-page', enabled: true, order: 0 },
  ];

  // Default sections for collections page (all collections)
  const DEFAULT_COLLECTIONS_SECTIONS: AnySection[] = [
    { id: 'collections-page-1', type: 'collections-page', enabled: true, order: 0 },
  ];

  // Get sections based on config version
  const getSections = (): AnySection[] => {
    if ('version' in config && config.version === 2) {
      const v2Config = config as StorefrontConfigV2;
      const pageSections = v2Config.pages?.[currentPage]?.sections || [];

      // If no sections for about/contact/search/trackOrder/checkout/collections pages, use defaults
      if (pageSections.length === 0) {
        if (currentPage === 'about') return DEFAULT_ABOUT_SECTIONS;
        if (currentPage === 'contact') return DEFAULT_CONTACT_SECTIONS;
        if (currentPage === 'search') return DEFAULT_SEARCH_SECTIONS;
        if (currentPage === 'trackOrder') return DEFAULT_TRACK_ORDER_SECTIONS;
        if (currentPage === 'checkout') return DEFAULT_CHECKOUT_SECTIONS;
        if (currentPage === 'collections') return DEFAULT_COLLECTIONS_SECTIONS;
      }

      return pageSections as AnySection[];
    }
    // V1 config - use sections directly
    return (config as StorefrontConfig).sections || [];
  };

  const sections = getSections();

  // Get border radius class based on theme
  const getBorderRadius = (size?: 'small' | 'medium' | 'large') => {
    const radiusMap = {
      none: { small: 'rounded-none', medium: 'rounded-none', large: 'rounded-none' },
      small: { small: 'rounded', medium: 'rounded-md', large: 'rounded-lg' },
      medium: { small: 'rounded-md', medium: 'rounded-lg', large: 'rounded-xl' },
      large: { small: 'rounded-lg', medium: 'rounded-xl', large: 'rounded-2xl' },
      full: { small: 'rounded-xl', medium: 'rounded-2xl', large: 'rounded-3xl' },
    };
    return radiusMap[theme.borderRadius]?.[size || 'medium'] || 'rounded-lg';
  };

  // Get button classes based on theme
  const getButtonClasses = (variant: 'primary' | 'secondary' = 'primary') => {
    const base = `px-6 py-3 font-medium transition-all ${getBorderRadius('medium')}`;
    if (theme.buttonStyle === 'solid') {
      return variant === 'primary'
        ? `${base} text-white`
        : `${base} bg-gray-200 text-gray-800`;
    } else if (theme.buttonStyle === 'outline') {
      return `${base} border-2 bg-transparent`;
    } else {
      return `${base} bg-transparent hover:bg-gray-100`;
    }
  };

  // Section wrapper for selection
  const SectionWrapper: React.FC<{
    id: string;
    children: React.ReactNode;
    className?: string;
  }> = ({ id, children, className = '' }) => {
    const isSelected = selectedSectionId === id;

    if (isFullPreview) {
      return <div className={className}>{children}</div>;
    }

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelectSection(id);
        }}
        className={`relative cursor-pointer transition-all ${className} ${
          isSelected ? 'ring-2 ring-violet-500 ring-offset-2' : 'hover:ring-2 hover:ring-violet-300 hover:ring-offset-1'
        }`}
      >
        {isSelected && (
          <div className="absolute -top-3 left-4 px-2 py-0.5 bg-violet-500 text-white text-xs rounded-full z-10 capitalize">
            {id.includes('-') ? id.split('-')[0] : id}
          </div>
        )}
        {children}
      </div>
    );
  };

  return (
    <div
      className="min-h-full"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.bodyFont,
      }}
    >
      {/* Header */}
      <SectionWrapper id="header">
        {/* Announcement Bar */}
        {header.announcementBar?.enabled && (
          <div
            className="py-2 px-4 text-center text-sm"
            style={{
              backgroundColor: header.announcementBar.backgroundColor,
              color: header.announcementBar.textColor,
            }}
          >
            {header.announcementBar.text}
          </div>
        )}

        {/* Main Header */}
        <header
          className={`py-4 px-6 flex items-center ${
            header.variant === 'centered' ? 'justify-center' : 'justify-between'
          }`}
          style={{
            backgroundColor: header.transparent ? 'transparent' : theme.backgroundColor,
          }}
        >
          {header.variant === 'centered' ? (
            <>
              <nav className="hidden md:flex items-center gap-6">
                {header.menuItems.slice(0, 2).map((item) => (
                  <PreviewLink
                    key={item.id}
                    href={item.link}
                    className="text-sm hover:opacity-70 transition-opacity cursor-pointer"
                    onNavigate={onNavigate}
                  >
                    {item.label}
                  </PreviewLink>
                ))}
              </nav>

              {header.showLogo && (
                <PreviewLink
                  href="/"
                  className="text-xl font-bold mx-8 cursor-pointer"
                  style={{ fontFamily: theme.headingFont }}
                  onNavigate={onNavigate}
                >
                  Store
                </PreviewLink>
              )}

              <nav className="hidden md:flex items-center gap-6">
                {header.menuItems.slice(2).map((item) => (
                  <PreviewLink
                    key={item.id}
                    href={item.link}
                    className="text-sm hover:opacity-70 transition-opacity cursor-pointer"
                    onNavigate={onNavigate}
                  >
                    {item.label}
                  </PreviewLink>
                ))}
              </nav>

              <div className="flex items-center gap-4 ml-8">
                {header.showSearch && <Search className="w-5 h-5 cursor-pointer hover:opacity-70" onClick={() => onNavigate?.('search')} />}
                {header.showAccount && (
                  <User
                    className="w-5 h-5 cursor-pointer hover:opacity-70"
                    onClick={() => onNavigate?.('profile')}
                  />
                )}
                {header.showCart && (
                  <div className="relative cursor-pointer" onClick={() => onNavigate?.('cart')}>
                    <ShoppingCart className="w-5 h-5 hover:opacity-70" />
                    <span
                      className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center text-xs text-white rounded-full"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      0
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-8">
                {header.showLogo && (
                  <PreviewLink
                    href="/"
                    className="text-xl font-bold cursor-pointer"
                    style={{ fontFamily: theme.headingFont }}
                    onNavigate={onNavigate}
                  >
                    Store
                  </PreviewLink>
                )}
                <nav className="hidden md:flex items-center gap-6">
                  {header.menuItems.map((item) => (
                    <PreviewLink
                      key={item.id}
                      href={item.link}
                      className="text-sm hover:opacity-70 transition-opacity cursor-pointer"
                      onNavigate={onNavigate}
                    >
                      {item.label}
                    </PreviewLink>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-4">
                {header.showSearch && <Search className="w-5 h-5 cursor-pointer hover:opacity-70" onClick={() => onNavigate?.('search')} />}
                {header.showAccount && (
                  <User
                    className="w-5 h-5 cursor-pointer hover:opacity-70"
                    onClick={() => onNavigate?.('profile')}
                  />
                )}
                {header.showCart && (
                  <div className="relative cursor-pointer" onClick={() => onNavigate?.('cart')}>
                    <ShoppingCart className="w-5 h-5 hover:opacity-70" />
                    <span
                      className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center text-xs text-white rounded-full"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      0
                    </span>
                  </div>
                )}
                <Menu className="w-5 h-5 md:hidden cursor-pointer" />
              </div>
            </>
          )}
        </header>
      </SectionWrapper>

      {/* Sections */}
      {sections
        .filter((s) => s.enabled)
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <SectionWrapper key={section.id} id={section.id}>
            {renderSection(section, theme, getBorderRadius, getButtonClasses, previewMode, products, categories, shopData, onNavigate)}
          </SectionWrapper>
        ))}

      {/* Footer */}
      <SectionWrapper id="footer">
        <footer
          className="py-12 px-6 border-t"
          style={{ backgroundColor: theme.backgroundColor }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Footer Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              {/* Store Info */}
              {footer.showLogo && (
                <div className="col-span-2 md:col-span-1">
                  <div
                    className="text-xl font-bold flex items-center gap-2"
                    style={{ fontFamily: theme.headingFont, color: theme.textColor }}
                  >
                    <Store className="w-6 h-6" style={{ color: theme.primaryColor }} />
                    {shopData?.name || 'Store'}
                  </div>
                  <p className="mt-3 text-sm opacity-70 line-clamp-3">
                    Your one-stop shop for quality products and exceptional service.
                  </p>
                </div>
              )}

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold mb-4" style={{ color: theme.textColor }}>Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm opacity-70 hover:opacity-100">All Products</a></li>
                  <li><a href="#" className="text-sm opacity-70 hover:opacity-100">Collections</a></li>
                  <li><a href="#" className="text-sm opacity-70 hover:opacity-100">New Arrivals</a></li>
                  <li><a href="#" className="text-sm opacity-70 hover:opacity-100">Sale</a></li>
                </ul>
              </div>

              {/* Customer Service */}
              <div>
                <h4 className="font-semibold mb-4" style={{ color: theme.textColor }}>Customer Service</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm opacity-70 hover:opacity-100">About Us</a></li>
                  <li><a href="#" className="text-sm opacity-70 hover:opacity-100">Contact</a></li>
                  <li><a href="#" className="text-sm opacity-70 hover:opacity-100">FAQ</a></li>
                </ul>
              </div>

              {/* Account */}
              <div>
                <h4 className="font-semibold mb-4" style={{ color: theme.textColor }}>Account</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm opacity-70 hover:opacity-100">My Account</a></li>
                  <li><a href="#" className="text-sm opacity-70 hover:opacity-100">My Orders</a></li>
                  <li><a href="#" className="text-sm opacity-70 hover:opacity-100">Wishlist</a></li>
                  <li><a href="#" className="text-sm opacity-70 hover:opacity-100">Track Order</a></li>
                </ul>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
              <p className="text-sm opacity-70">
                {footer.copyrightText || `© ${new Date().getFullYear()} ${shopData?.name || 'Store'}. All rights reserved.`}
              </p>

              {footer.showSocial && footer.socialLinks && footer.socialLinks.length > 0 && (
                <div className="flex items-center gap-4">
                  {footer.socialLinks.map((link, i) => (
                    <a key={i} href={link.url} className="opacity-70 hover:opacity-100 transition-opacity">
                      {link.platform === 'facebook' && <Facebook className="w-5 h-5" />}
                      {link.platform === 'instagram' && <Instagram className="w-5 h-5" />}
                      {link.platform === 'twitter' && <Twitter className="w-5 h-5" />}
                    </a>
                  ))}
                </div>
              )}

              {/* Powered by */}
              <div className="text-sm opacity-50">
                Powered by <span className="font-semibold" style={{ color: theme.primaryColor }}>Vasty Shop</span>
              </div>
            </div>
          </div>
        </footer>
      </SectionWrapper>
    </div>
  );
};

// Helper function to truncate text to n lines
const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Helper function to format price
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

// Render individual sections
function renderSection(
  section: AnySection,
  theme: StorefrontConfig['theme'],
  getBorderRadius: (size?: 'small' | 'medium' | 'large') => string,
  getButtonClasses: (variant?: 'primary' | 'secondary') => string,
  previewMode: string,
  products: Product[] = [],
  categories: Category[] = [],
  shopData: ShopData | null = null,
  onNavigate?: (page: PageType) => void
) {
  switch (section.type) {
    case 'hero': {
      const hero = section;
      const heightMap = {
        small: 'min-h-[300px]',
        medium: 'min-h-[450px]',
        large: 'min-h-[600px]',
        full: 'min-h-screen',
      };

      // Use section gradient or fallback to theme gradient
      const themeGradient = `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`;
      const backgroundGradient = hero.backgroundGradient || themeGradient;

      // Get text alignment class
      const getTextAlignClass = (alignment: string = 'center') => {
        if (alignment === 'left') return 'text-left';
        if (alignment === 'right') return 'text-right';
        return 'text-center';
      };

      // Dynamic content for non-slideshow variants (centered, split, minimal)
      if (hero.useDynamicContent && hero.variant !== 'slideshow' && products.length > 0) {
        const product = products[0]; // Use first product for single hero
        const productImage = product.images?.[0] || product.thumbnail;
        const validImageUrl = isValidImageUrl(productImage) ? getImageUrl(productImage) : undefined;
        const positionClasses = getContentPositionClasses(hero.contentPosition);
        const textAlignClass = getTextAlignClass(hero.textAlignment);

        return (
          <div
            className={`relative flex ${positionClasses.items} ${positionClasses.justify} ${heightMap[hero.height]} overflow-hidden`}
            style={{
              backgroundImage: validImageUrl ? `url(${validImageUrl})` : undefined,
              background: !validImageUrl ? backgroundGradient : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
            <div className={`relative z-10 px-6 md:px-12 py-12 max-w-4xl ${textAlignClass}`}>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white"
                style={{ fontFamily: theme.headingFont }}
              >
                {product.name}
              </h1>
              <p className="text-lg md:text-xl mb-4 opacity-90 text-white line-clamp-2">
                {truncateText(product.description || product.shortDescription || '', 100)}
              </p>
              {/* Price */}
              <p className="text-2xl font-bold mb-6" style={{ color: theme.accentColor }}>
                {product.salePrice && product.salePrice < product.price ? (
                  <>
                    <span className="line-through opacity-60 mr-2 text-white">{formatPrice(product.price)}</span>
                    {formatPrice(product.salePrice)}
                  </>
                ) : (
                  formatPrice(product.price)
                )}
              </p>
              <a
                href={`/product/${product.slug || product.id}`}
                className={`inline-flex items-center gap-2 px-6 py-3 font-medium ${getBorderRadius('medium')}`}
                style={{
                  backgroundColor: theme.primaryColor,
                  color: '#FFFFFF',
                }}
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        );
      }

      // Slideshow variant - generate dynamic slides from products if useDynamicContent is enabled
      if (hero.variant === 'slideshow') {
        // Determine how many slides to show
        const slideCount = hero.slides?.length || 3;

        // Generate dynamic slides from products
        const dynamicSlides = products.slice(0, slideCount).map((product) => {
          const productImage = product.images?.[0] || product.thumbnail;
          const validImageUrl = isValidImageUrl(productImage) ? getImageUrl(productImage) : undefined;
          return {
            id: `product-slide-${product.id}`,
            headline: product.name,
            subheadline: truncateText(product.description || product.shortDescription || `Discover ${product.name}`, 80),
            ctaText: 'Shop Now',
            ctaLink: `/product/${product.slug || product.id}`,
            backgroundImage: validImageUrl,
            backgroundGradient: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
            overlayOpacity: validImageUrl ? 50 : 0,
            price: product.price,
            salePrice: product.salePrice,
          };
        });

        // Use dynamic slides if useDynamicContent is enabled, otherwise use manual slides
        const slidesToUse = hero.useDynamicContent
          ? dynamicSlides
          : (hero.slides && hero.slides.length > 0) ? hero.slides : dynamicSlides;

        if (slidesToUse.length === 0) {
          // Fallback to shop banner or default gradient
          const positionClasses = getContentPositionClasses(hero.contentPosition);
          const textAlignClass = getTextAlignClass(hero.textAlignment);
          return (
            <div
              className={`relative flex ${positionClasses.items} ${positionClasses.justify} ${heightMap[hero.height]} overflow-hidden`}
              style={{
                background: shopData?.banner
                  ? `url(${shopData.banner})`
                  : backgroundGradient,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className={`relative z-10 px-6 md:px-12 py-12 max-w-4xl ${textAlignClass}`}>
                <h1
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white"
                  style={{ fontFamily: theme.headingFont }}
                >
                  {shopData?.name || 'Welcome to Our Store'}
                </h1>
                <p className="text-lg md:text-xl mb-8 opacity-90 text-white">
                  {shopData?.tagline || shopData?.description || 'Discover amazing products'}
                </p>
                <a
                  href="/products"
                  className={getButtonClasses('primary')}
                  style={{
                    backgroundColor: theme.primaryColor,
                    color: '#FFFFFF',
                  }}
                >
                  Shop Now
                  <ArrowRight className="inline-block ml-2 w-4 h-4" />
                </a>
              </div>
            </div>
          );
        }

        const firstSlide = slidesToUse[0];
        const slideBackground = firstSlide.backgroundImage
          ? { backgroundImage: `url(${firstSlide.backgroundImage})` }
          : { background: firstSlide.backgroundGradient || themeGradient };
        const slideOverlay = firstSlide.overlayOpacity ?? hero.overlayOpacity ?? 50;
        const positionClasses = getContentPositionClasses(hero.contentPosition);
        const textAlignClass = getTextAlignClass(hero.textAlignment);

        return (
          <div className={`relative ${heightMap[hero.height]} overflow-hidden`}>
            {/* Show first slide as preview */}
            <div
              className="absolute inset-0"
              style={{
                ...slideBackground,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {/* Per-slide Overlay */}
            {slideOverlay > 0 && (
              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: slideOverlay / 100 }}
              />
            )}
            {/* Content */}
            <div className={`relative z-10 h-full w-full flex ${positionClasses.items} ${positionClasses.justify} px-6 md:px-12 py-12`}>
              <div className={`max-w-4xl ${textAlignClass}`}>
                <h1
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
                  style={{
                    fontFamily: theme.headingFont,
                    color: slideOverlay > 30 || firstSlide.backgroundImage ? 'white' : theme.textColor,
                  }}
                >
                  {firstSlide.headline}
                </h1>
                <p
                  className="text-lg md:text-xl mb-8 opacity-90 line-clamp-2"
                  style={{ color: slideOverlay > 30 || firstSlide.backgroundImage ? 'white' : theme.textColor }}
                >
                  {firstSlide.subheadline}
                </p>
                {/* Show price if available (for product slides) */}
                {(firstSlide as any).price && (
                  <p className="text-2xl font-bold mb-4" style={{ color: theme.accentColor }}>
                    {(firstSlide as any).salePrice ? (
                      <>
                        <span className="line-through opacity-60 mr-2">{formatPrice((firstSlide as any).price)}</span>
                        {formatPrice((firstSlide as any).salePrice)}
                      </>
                    ) : (
                      formatPrice((firstSlide as any).price)
                    )}
                  </p>
                )}
                {firstSlide.ctaText && (
                  <a
                    href={firstSlide.ctaLink}
                    className={getButtonClasses('primary')}
                    style={{
                      backgroundColor: theme.buttonStyle === 'solid' ? theme.primaryColor : 'transparent',
                      borderColor: theme.primaryColor,
                      color: theme.buttonStyle === 'solid' ? '#FFFFFF' : theme.primaryColor,
                    }}
                  >
                    {firstSlide.ctaText}
                    <ArrowRight className="inline-block ml-2 w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
            {/* Slide indicators */}
            {slidesToUse.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slidesToUse.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        );
      }

      // Standard hero variants
      const positionClasses = getContentPositionClasses(hero.contentPosition);
      const textAlignClass = getTextAlignClass(hero.textAlignment);
      const buttonAlignClass = hero.textAlignment === 'center'
        ? 'justify-center'
        : hero.textAlignment === 'right'
        ? 'justify-end'
        : 'justify-start';

      return (
        <div
          className={`relative flex ${positionClasses.items} ${positionClasses.justify} ${heightMap[hero.height]} overflow-hidden`}
          style={{
            background:
              hero.backgroundType === 'gradient'
                ? backgroundGradient
                : hero.backgroundType === 'color'
                ? (hero.backgroundColor || theme.primaryColor)
                : undefined,
            backgroundImage:
              hero.backgroundType === 'image' && hero.backgroundImage
                ? `url(${hero.backgroundImage})`
                : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay */}
          {hero.overlayOpacity > 0 && (
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: hero.overlayOpacity / 100 }}
            />
          )}

          {/* Content */}
          <div className={`relative z-10 px-6 md:px-12 py-12 max-w-4xl ${textAlignClass}`}>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
              style={{
                fontFamily: theme.headingFont,
                color: hero.overlayOpacity > 30 ? 'white' : theme.textColor,
              }}
            >
              {hero.headline}
            </h1>
            <p
              className="text-lg md:text-xl mb-8 opacity-90"
              style={{ color: hero.overlayOpacity > 30 ? 'white' : theme.textColor }}
            >
              {hero.subheadline}
            </p>
            <div className={`flex gap-4 ${buttonAlignClass}`}>
              <a
                href={hero.ctaLink}
                className={getButtonClasses('primary')}
                style={{
                  backgroundColor: theme.buttonStyle === 'solid' ? theme.primaryColor : 'transparent',
                  borderColor: theme.primaryColor,
                  color: theme.buttonStyle === 'solid' ? '#FFFFFF' : theme.primaryColor,
                }}
              >
                {hero.ctaText}
                <ArrowRight className="inline-block ml-2 w-4 h-4" />
              </a>
              {hero.secondaryCtaText && (
                <a href={hero.secondaryCtaLink} className={getButtonClasses('secondary')}>
                  {hero.secondaryCtaText}
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }

    case 'featured-products': {
      const fp = section;
      const colsClass =
        fp.columns === 2
          ? 'grid-cols-2'
          : fp.columns === 3
          ? 'grid-cols-2 md:grid-cols-3'
          : fp.columns === 5
          ? 'grid-cols-2 md:grid-cols-5'
          : 'grid-cols-2 md:grid-cols-4';

      // Use real products if available
      const displayProducts = products.slice(0, Math.min(fp.limit || 8, products.length));
      const hasRealProducts = displayProducts.length > 0;

      return (
        <div className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-3xl font-bold mb-2"
                style={{ fontFamily: theme.headingFont }}
              >
                {fp.title || 'Recent Products'}
              </h2>
              {fp.subtitle && <p className="opacity-70">{fp.subtitle}</p>}
            </div>

            <div className={`grid ${colsClass} gap-6`}>
              {hasRealProducts ? (
                // Render real products
                displayProducts.map((product) => (
                  <a
                    key={product.id}
                    href={`/product/${product.slug || product.id}`}
                    className={`group ${getBorderRadius('large')} overflow-hidden ${
                      theme.cardStyle === 'elevated'
                        ? 'shadow-lg hover:shadow-xl'
                        : theme.cardStyle === 'bordered'
                        ? 'border hover:border-opacity-60'
                        : ''
                    } transition-all duration-300`}
                    style={{
                      backgroundColor: theme.backgroundColor === '#FFFFFF' ? '#F9FAFB' : 'rgba(255,255,255,0.05)',
                      borderColor: 'rgba(0,0,0,0.1)',
                    }}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      {isValidImageUrl(product.images?.[0] || product.thumbnail) ? (
                        <img
                          src={getImageUrl(product.images?.[0] || product.thumbnail) || PLACEHOLDER_IMAGE}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                      {/* Sale badge */}
                      {product.salePrice && product.salePrice < product.price && (
                        <div
                          className="absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white rounded"
                          style={{ backgroundColor: theme.accentColor }}
                        >
                          Sale
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium mb-1 line-clamp-1">{product.name}</h3>
                      {/* 2-line description */}
                      {(product.shortDescription || product.description) && (
                        <p className="text-sm opacity-60 mb-2 line-clamp-2">
                          {product.shortDescription || truncateText(product.description || '', 80)}
                        </p>
                      )}
                      {fp.showRating && (
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star
                              key={j}
                              className="w-3.5 h-3.5"
                              fill={j < 4 ? theme.accentColor : 'none'}
                              stroke={theme.accentColor}
                            />
                          ))}
                          <span className="text-xs opacity-60 ml-1">(42)</span>
                        </div>
                      )}
                      {fp.showPrice && (
                        <p className="font-semibold" style={{ color: theme.primaryColor }}>
                          {product.salePrice && product.salePrice < product.price ? (
                            <>
                              <span className="line-through opacity-50 mr-2 text-sm">{formatPrice(product.price)}</span>
                              {formatPrice(product.salePrice)}
                            </>
                          ) : (
                            formatPrice(product.price)
                          )}
                        </p>
                      )}
                      {fp.showAddToCart && (
                        <button
                          className={`w-full mt-3 py-2 text-sm ${getBorderRadius('medium')}`}
                          style={{
                            backgroundColor:
                              theme.buttonStyle === 'solid' ? theme.primaryColor : 'transparent',
                            borderWidth: theme.buttonStyle === 'outline' ? 1 : 0,
                            borderColor: theme.primaryColor,
                            color: theme.buttonStyle === 'solid' ? '#FFFFFF' : theme.primaryColor,
                          }}
                        >
                          Shop Now
                        </button>
                      )}
                    </div>
                  </a>
                ))
              ) : (
                // Placeholder products when no real products
                Array.from({ length: Math.min(fp.limit || 8, 8) }).map((_, i) => (
                  <div
                    key={i}
                    className={`group ${getBorderRadius('large')} overflow-hidden ${
                      theme.cardStyle === 'elevated'
                        ? 'shadow-lg'
                        : theme.cardStyle === 'bordered'
                        ? 'border'
                        : ''
                    }`}
                    style={{
                      backgroundColor: theme.backgroundColor === '#FFFFFF' ? '#F9FAFB' : 'rgba(255,255,255,0.05)',
                      borderColor: 'rgba(0,0,0,0.1)',
                    }}
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        Product {i + 1}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium mb-1">Product Name</h3>
                      <p className="text-sm opacity-60 mb-2 line-clamp-2">
                        Product description goes here...
                      </p>
                      {fp.showRating && (
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star
                              key={j}
                              className="w-3.5 h-3.5"
                              fill={j < 4 ? theme.accentColor : 'none'}
                              stroke={theme.accentColor}
                            />
                          ))}
                          <span className="text-xs opacity-60 ml-1">(42)</span>
                        </div>
                      )}
                      {fp.showPrice && (
                        <p className="font-semibold" style={{ color: theme.primaryColor }}>
                          $99.00
                        </p>
                      )}
                      {fp.showAddToCart && (
                        <button
                          className={`w-full mt-3 py-2 text-sm ${getBorderRadius('medium')}`}
                          style={{
                            backgroundColor:
                              theme.buttonStyle === 'solid' ? theme.primaryColor : 'transparent',
                            borderWidth: theme.buttonStyle === 'outline' ? 1 : 0,
                            borderColor: theme.primaryColor,
                            color: theme.buttonStyle === 'solid' ? '#FFFFFF' : theme.primaryColor,
                          }}
                        >
                          Shop Now
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    case 'categories': {
      const cat = section;
      const colsClass =
        cat.columns === 2
          ? 'grid-cols-2'
          : cat.columns === 3
          ? 'grid-cols-2 md:grid-cols-3'
          : cat.columns === 6
          ? 'grid-cols-3 md:grid-cols-6'
          : 'grid-cols-2 md:grid-cols-4';

      // Use dynamic categories if useDynamicContent is enabled and categories exist
      const useDynamic = (cat as any).useDynamicContent && categories.length > 0;
      const displayCategories = useDynamic
        ? categories.slice(0, cat.columns)
        : null;
      const fallbackCategories = ['Clothing', 'Shoes', 'Accessories', 'Electronics', 'Home', 'Beauty'];

      return (
        <div className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-3xl font-bold mb-2"
                style={{ fontFamily: theme.headingFont }}
              >
                {cat.title}
              </h2>
              {cat.subtitle && <p className="opacity-70">{cat.subtitle}</p>}
            </div>

            <div className={`grid ${colsClass} gap-4`}>
              {displayCategories ? (
                // Render dynamic categories
                displayCategories.map((category) => (
                  <a
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className={`group relative aspect-square ${getBorderRadius('large')} overflow-hidden cursor-pointer`}
                  >
                    {/* Category image or gradient */}
                    {category.image && isValidImageUrl(category.image) ? (
                      <img
                        src={getImageUrl(category.image) || ''}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 ${category.image && isValidImageUrl(category.image) ? 'hidden' : ''}`} />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      {cat.showProductCount && category.productCount !== undefined && (
                        <p className="text-sm opacity-80">{category.productCount} products</p>
                      )}
                    </div>
                  </a>
                ))
              ) : (
                // Render fallback/placeholder categories
                fallbackCategories.slice(0, cat.columns).map((name, i) => (
                  <div
                    key={i}
                    className={`group relative aspect-square ${getBorderRadius('large')} overflow-hidden cursor-pointer`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <h3 className="text-lg font-semibold">{name}</h3>
                      {cat.showProductCount && (
                        <p className="text-sm opacity-80">{Math.floor(Math.random() * 50) + 10} products</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    case 'about': {
      const about = section;

      return (
        <div className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            {about.variant === 'split' ? (
              <div className={`flex flex-col md:flex-row gap-12 items-center ${about.imagePosition === 'left' ? 'md:flex-row-reverse' : ''}`}>
                <div className="flex-1">
                  <h2
                    className="text-3xl font-bold mb-4"
                    style={{ fontFamily: theme.headingFont }}
                  >
                    {about.title}
                  </h2>
                  <p className="opacity-80 mb-6 leading-relaxed">{about.content}</p>
                  {about.stats && about.stats.length > 0 && (
                    <div className="flex gap-8 flex-wrap">
                      {about.stats.map((stat, i) => (
                        <div key={i}>
                          <p
                            className="text-3xl font-bold"
                            style={{ color: theme.primaryColor }}
                          >
                            {stat.value}
                          </p>
                          <p className="text-sm opacity-60">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={`flex-1 aspect-[4/3] ${getBorderRadius('large')} overflow-hidden`}>
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400">
                    About Image
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center max-w-3xl mx-auto">
                <h2
                  className="text-3xl font-bold mb-4"
                  style={{ fontFamily: theme.headingFont }}
                >
                  {about.title}
                </h2>
                <p className="opacity-80 leading-relaxed">{about.content}</p>
                {about.stats && about.stats.length > 0 && (
                  <div className="flex gap-8 justify-center mt-8 flex-wrap">
                    {about.stats.map((stat, i) => (
                      <div key={i}>
                        <p
                          className="text-3xl font-bold"
                          style={{ color: theme.primaryColor }}
                        >
                          {stat.value}
                        </p>
                        <p className="text-sm opacity-60">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'testimonials': {
      const test = section;

      return (
        <div className="py-16 px-6" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-3xl font-bold mb-2"
                style={{ fontFamily: theme.headingFont }}
              >
                {test.title}
              </h2>
              {test.subtitle && <p className="opacity-70">{test.subtitle}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(test.testimonials.length > 0 ? test.testimonials : [
                { id: '1', name: 'Customer 1', role: 'Verified Buyer', content: 'Great product and service!', rating: 5 },
                { id: '2', name: 'Customer 2', role: 'Verified Buyer', content: 'Love the quality!', rating: 5 },
                { id: '3', name: 'Customer 3', role: 'Verified Buyer', content: 'Will buy again!', rating: 4 },
              ]).slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className={`p-6 ${getBorderRadius('large')} ${
                    theme.cardStyle === 'elevated'
                      ? 'shadow-lg'
                      : theme.cardStyle === 'bordered'
                      ? 'border'
                      : ''
                  }`}
                  style={{
                    backgroundColor: theme.backgroundColor,
                    borderColor: 'rgba(0,0,0,0.1)',
                  }}
                >
                  {test.showRating && (
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className="w-4 h-4"
                          fill={j < (t.rating || 5) ? theme.accentColor : 'none'}
                          stroke={theme.accentColor}
                        />
                      ))}
                    </div>
                  )}
                  <p className="opacity-80 mb-4 italic">"{t.content}"</p>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    {t.role && <p className="text-sm opacity-60">{t.role}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'newsletter': {
      const news = section;
      // Use theme color if section uses default dark background
      const isDefaultBackground = news.backgroundColor === '#1F2937';
      const backgroundColor = isDefaultBackground ? theme.primaryColor : (news.backgroundColor || theme.primaryColor);

      return (
        <div
          className="py-16 px-6"
          style={{ backgroundColor }}
        >
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: theme.headingFont }}
            >
              {news.title}
            </h2>
            {news.subtitle && <p className="opacity-90 mb-8">{news.subtitle}</p>}

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder={news.placeholder}
                  className={`w-full pl-12 pr-4 py-3 ${getBorderRadius('medium')} bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500`}
                />
              </div>
              <button
                className={`px-8 py-3 font-medium ${getBorderRadius('medium')}`}
                style={{
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                }}
              >
                {news.buttonText}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ==================== COLLECTIONS PAGE (ALL COLLECTIONS) ====================
    case 'collections-page': {
      const getCardBg = () => {
        const isDark = theme.backgroundColor.toLowerCase() === '#000000' ||
                       theme.backgroundColor.toLowerCase() === '#1a1a1a' ||
                       theme.backgroundColor.toLowerCase().includes('rgb(0');
        if (isDark) {
          return 'rgba(255,255,255,0.05)';
        }
        return theme.backgroundColor;
      };

      // Demo collections/categories
      const demoCollections = [
        { id: '1', name: 'Electronics', productCount: 45, image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&h=400&fit=crop' },
        { id: '2', name: 'Clothing', productCount: 128, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop' },
        { id: '3', name: 'Home & Living', productCount: 67, image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop' },
        { id: '4', name: 'Sports & Outdoors', productCount: 34, image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop' },
        { id: '5', name: 'Beauty & Health', productCount: 89, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop' },
        { id: '6', name: 'Books & Media', productCount: 156, image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop' },
        { id: '7', name: 'Toys & Games', productCount: 42, image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop' },
        { id: '8', name: 'Food & Drinks', productCount: 78, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop' },
      ];

      return (
        <div style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
          {/* Hero Section */}
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
                Collections
              </h1>
              <p className="text-lg opacity-70 mb-6" style={{ color: theme.textColor }}>
                Browse all our product collections
              </p>
              {/* Breadcrumb */}
              <div className="flex justify-center gap-2 text-sm" style={{ color: theme.textColor }}>
                <span className="opacity-60 cursor-pointer hover:opacity-100">Home</span>
                <span className="opacity-40">/</span>
                <span style={{ color: theme.primaryColor }}>Collections</span>
              </div>
            </div>
          </div>

          {/* Collections Grid */}
          <div className="py-12 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {demoCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className={`${getBorderRadius('large')} overflow-hidden group transition-all hover:shadow-lg cursor-pointer`}
                    style={{
                      backgroundColor: theme.backgroundColor === '#FFFFFF' ? '#F9FAFB' : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium mb-1 line-clamp-1" style={{ color: theme.textColor }}>
                        {collection.name}
                      </h3>
                      <span className="text-sm" style={{ color: theme.primaryColor }}>
                        {collection.productCount} Products
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ==================== COLLECTION PAGE SECTIONS ====================
    case 'collection-hero': {
      return (
        <div
          className="relative py-16 px-6"
          style={{
            background: `linear-gradient(135deg, ${theme.primaryColor}15 0%, ${theme.secondaryColor}15 100%)`,
          }}
        >
          <div className="max-w-6xl mx-auto text-center">
            <h1
              className="text-4xl font-bold mb-4"
              style={{ fontFamily: theme.headingFont, color: theme.textColor }}
            >
              All Products
            </h1>
            <p className="text-lg opacity-70 mb-6" style={{ color: theme.textColor }}>
              Discover our complete collection of amazing products
            </p>
            <div className="flex justify-center gap-2 text-sm" style={{ color: theme.textColor }}>
              <span className="opacity-60">Home</span>
              <span className="opacity-40">/</span>
              <span style={{ color: theme.primaryColor }}>Products</span>
            </div>
          </div>
        </div>
      );
    }

    case 'collection-filters': {
      return (
        <div className="py-6 px-6 border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                className={`px-4 py-2 text-sm font-medium ${getBorderRadius('medium')}`}
                style={{ backgroundColor: theme.primaryColor + '15', color: theme.primaryColor }}
              >
                Filters
              </button>
              <div className="flex gap-2">
                {['Electronics', 'Clothing', 'Sports'].map((cat) => (
                  <span
                    key={cat}
                    className={`px-3 py-1.5 text-sm ${getBorderRadius('medium')}`}
                    style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: theme.textColor }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm opacity-60">Sort by:</span>
              <select
                className={`px-3 py-2 text-sm ${getBorderRadius('small')}`}
                style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: theme.textColor, border: 'none' }}
              >
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    case 'collection-grid': {
      const displayProducts = products.slice(0, 8);
      return (
        <div className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <div
                  key={product.id}
                  className={`${getBorderRadius('large')} overflow-hidden transition-all hover:shadow-lg`}
                  style={{
                    backgroundColor: theme.backgroundColor === '#FFFFFF' ? '#F9FAFB' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={product.images?.[0] || product.thumbnail || PLACEHOLDER_IMAGE}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                    />
                    {product.salePrice && product.salePrice < product.price && (
                      <div
                        className="absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white rounded"
                        style={{ backgroundColor: theme.accentColor }}
                      >
                        Sale
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-1 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      {product.salePrice ? (
                        <>
                          <span className="font-bold" style={{ color: theme.primaryColor }}>${product.salePrice.toFixed(2)}</span>
                          <span className="text-sm line-through opacity-50">${product.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="font-bold" style={{ color: theme.primaryColor }}>${product.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-8">
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`w-10 h-10 ${getBorderRadius('medium')} text-sm font-medium`}
                  style={{
                    backgroundColor: page === 1 ? theme.primaryColor : 'rgba(0,0,0,0.05)',
                    color: page === 1 ? '#FFFFFF' : theme.textColor,
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ==================== PRODUCT PAGE SECTIONS ====================
    case 'product-gallery': {
      const product = products[0];
      const hasDiscount = product?.salePrice && product.salePrice < product.price;
      const discountPercent = hasDiscount ? Math.round((1 - product.salePrice! / product.price) * 100) : 0;

      return (
        <div className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: theme.textColor, opacity: 0.7 }}>
              <span className="hover:opacity-100" style={{ color: theme.textColor }}>Home</span>
              <span>/</span>
              <span className="hover:opacity-100" style={{ color: theme.textColor }}>Products</span>
              <span>/</span>
              <span style={{ opacity: 0.5 }}>{product?.name || 'Product'}</span>
            </nav>

            <div className="grid lg:grid-cols-12 gap-12">
              {/* Product Images - Left Column */}
              <div className="lg:col-span-7">
                {/* Main Image */}
                <div
                  className={`relative ${getBorderRadius('large')} overflow-hidden aspect-[4/5] mb-4`}
                  style={{ backgroundColor: `${theme.textColor}10` }}
                >
                  <img
                    src={product?.images?.[0] || PLACEHOLDER_IMAGE}
                    alt={product?.name || 'Product'}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                  />
                  {/* Navigation Arrows */}
                  <button
                    className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-md`}
                    style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-md`}
                    style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {/* Sale Badge */}
                  {hasDiscount && (
                    <span
                      className="absolute top-4 left-4 px-3 py-1 text-sm font-bold text-white rounded"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      -{discountPercent}% OFF
                    </span>
                  )}
                  {/* Image Counter */}
                  <div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 text-sm rounded-full"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff' }}
                  >
                    1 / 4
                  </div>
                </div>
                {/* Thumbnails - 6 columns */}
                <div className="grid grid-cols-6 gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      className={`aspect-square ${getBorderRadius('small')} overflow-hidden border-2 transition-all`}
                      style={{
                        borderColor: i === 0 ? theme.primaryColor : `${theme.textColor}20`,
                      }}
                    >
                      <img
                        src={products[i % products.length]?.images?.[0] || PLACEHOLDER_IMAGE}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info - Right Column */}
              <div className="lg:col-span-5 space-y-6">
                {/* Shop Info Card */}
                <div
                  className={`flex items-center gap-3 p-3 ${getBorderRadius('medium')} border`}
                  style={{ borderColor: `${theme.textColor}15`, backgroundColor: theme.backgroundColor === '#FFFFFF' ? '#F9FAFB' : 'rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${theme.primaryColor}20` }}
                  >
                    <svg className="w-6 h-6" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate" style={{ color: theme.textColor }}>Demo Store</span>
                      <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-3 text-xs mt-0.5" style={{ color: theme.textColor, opacity: 0.7 }}>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" style={{ fill: '#FFC107', color: '#FFC107' }} />
                        4.8
                      </span>
                      <span>120 Products</span>
                      <span style={{ color: theme.primaryColor }}>Visit Store</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5" style={{ color: theme.textColor, opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Brand & Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: theme.primaryColor }}>
                    {product?.category?.name || 'Premium Brand'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full border" style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}>
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full border" style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Product Name */}
                <h1
                  className="text-3xl lg:text-4xl font-bold"
                  style={{ fontFamily: theme.headingFont, color: theme.textColor }}
                >
                  {product?.name || 'Premium Product'}
                </h1>

                {/* Rating & SKU */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-5 h-5"
                          style={{ color: star <= 4 ? '#FFC107' : `${theme.textColor}30`, fill: star <= 4 ? '#FFC107' : 'none' }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold">4.5</span>
                  </div>
                  <span className="text-sm hover:opacity-70" style={{ color: theme.primaryColor }}>(128 reviews)</span>
                  <div className="h-4 w-px" style={{ backgroundColor: `${theme.textColor}30` }} />
                  <span className="text-sm" style={{ color: theme.textColor, opacity: 0.7 }}>SKU: PRD-001</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold" style={{ color: theme.textColor }}>
                    ${(product?.salePrice || product?.price || 99.99).toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-2xl line-through" style={{ color: theme.textColor, opacity: 0.4 }}>
                        ${product?.price.toFixed(2)}
                      </span>
                      <span
                        className={`px-2 py-1 text-sm font-bold ${getBorderRadius('small')} text-white`}
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        Save ${(product.price - product.salePrice!).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>

                {/* Stock Status */}
                <div
                  className={`p-4 ${getBorderRadius('medium')} border`}
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)' }}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" style={{ color: '#22C55E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="font-semibold" style={{ color: '#16A34A' }}>In Stock</span>
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block font-semibold mb-3" style={{ color: theme.textColor }}>
                    Color: <span className="font-normal" style={{ opacity: 0.7 }}>Black</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['#000000', '#1E3A8A', '#DC2626', '#059669'].map((color, index) => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-lg transition-all ${index === 0 ? 'ring-2 ring-offset-2' : 'hover:scale-105'}`}
                        style={{
                          backgroundColor: color,
                          '--tw-ring-color': theme.primaryColor,
                        } as React.CSSProperties}
                      />
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div>
                  <label className="block font-semibold mb-3" style={{ color: theme.textColor }}>
                    Size: <span className="font-normal" style={{ opacity: 0.7 }}>M</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['S', 'M', 'L', 'XL'].map((size) => (
                      <button
                        key={size}
                        className={`py-3 ${getBorderRadius('medium')} border-2 text-sm font-medium transition-all`}
                        style={{
                          borderColor: size === 'M' ? theme.primaryColor : `${theme.textColor}20`,
                          backgroundColor: size === 'M' ? theme.primaryColor : 'transparent',
                          color: size === 'M' ? '#fff' : theme.textColor,
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block font-semibold mb-3" style={{ color: theme.textColor }}>Quantity:</label>
                  <div
                    className={`flex items-center ${getBorderRadius('medium')} border w-fit`}
                    style={{ borderColor: `${theme.textColor}20` }}
                  >
                    <button className="p-3 transition-opacity hover:opacity-70" style={{ color: theme.textColor }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-6 font-semibold min-w-[60px] text-center" style={{ color: theme.textColor }}>1</span>
                    <button className="p-3 transition-opacity hover:opacity-70" style={{ color: theme.textColor }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold ${getBorderRadius('medium')} text-white transition-all hover:opacity-90`}
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>

                {/* Trust Badges */}
                <div
                  className={`grid grid-cols-2 gap-4 p-4 ${getBorderRadius('medium')}`}
                  style={{ backgroundColor: theme.backgroundColor === '#FFFFFF' ? '#F9FAFB' : 'rgba(255,255,255,0.05)', border: `1px solid ${theme.textColor}15` }}
                >
                  {[
                    { icon: 'truck', title: 'Free Shipping', desc: '$100+' },
                    { icon: 'shield', title: 'Secure Checkout', desc: '100%' },
                    { icon: 'refresh', title: 'Free Returns', desc: '30 Days' },
                    { icon: 'check', title: 'Buyer Protection', desc: '100%' },
                  ].map((badge, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${theme.primaryColor}15` }}>
                        <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {badge.icon === 'truck' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />}
                          {badge.icon === 'shield' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
                          {badge.icon === 'refresh' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />}
                          {badge.icon === 'check' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />}
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold" style={{ color: theme.textColor }}>{badge.title}</h4>
                        <p className="text-xs" style={{ color: theme.textColor, opacity: 0.7 }}>{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'product-info': {
      return (
        <div className="py-6 px-6">
          <div className="max-w-6xl mx-auto">
            <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <h3 className="font-bold mb-4" style={{ fontFamily: theme.headingFont }}>Product Details</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li>• High-quality materials for durability</li>
                <li>• Comfortable fit for all-day wear</li>
                <li>• Easy care - machine washable</li>
                <li>• Available in multiple sizes</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    case 'product-tabs': {
      return (
        <div className="py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-8 border-b mb-6" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
              {['Description', 'Specifications', 'Reviews'].map((tab, i) => (
                <button
                  key={tab}
                  className="pb-4 text-sm font-medium relative"
                  style={{ color: i === 0 ? theme.primaryColor : theme.textColor, opacity: i === 0 ? 1 : 0.6 }}
                >
                  {tab}
                  {i === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: theme.primaryColor }} />
                  )}
                </button>
              ))}
            </div>
            <div className="text-sm opacity-80 leading-relaxed">
              <p className="mb-4">
                This premium product is crafted with the finest materials to ensure lasting quality and comfort.
                Whether you're looking for everyday essentials or something special, this item delivers on all fronts.
              </p>
              <p>
                Designed with attention to detail, it combines style and functionality perfectly. The versatile design
                makes it suitable for various occasions, from casual outings to more formal settings.
              </p>
            </div>
          </div>
        </div>
      );
    }

    case 'product-reviews': {
      return (
        <div className="py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-xl font-bold mb-6" style={{ fontFamily: theme.headingFont }}>Customer Reviews</h3>
            <div className="space-y-6">
              {[
                { name: 'Sarah M.', rating: 5, text: 'Absolutely love this product! The quality is amazing and it arrived quickly.', date: '2 days ago' },
                { name: 'John D.', rating: 4, text: 'Great product for the price. Would recommend to others.', date: '1 week ago' },
                { name: 'Emily R.', rating: 5, text: 'Exceeded my expectations. Will definitely buy again!', date: '2 weeks ago' },
              ].map((review, i) => (
                <div key={i} className={`p-4 ${getBorderRadius('large')}`} style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: theme.primaryColor + '20', color: theme.primaryColor }}>
                        {review.name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{review.name}</p>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-4 h-4" style={{ color: '#FFC107', fill: star <= review.rating ? '#FFC107' : 'none' }} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm opacity-50">{review.date}</span>
                  </div>
                  <p className="text-sm opacity-80">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'related-products': {
      const relatedProducts = products.slice(0, 4);
      return (
        <div className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 text-center" style={{ fontFamily: theme.headingFont }}>Related Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <div
                  key={product.id}
                  className={`${getBorderRadius('large')} overflow-hidden transition-all hover:shadow-lg`}
                  style={{ backgroundColor: theme.backgroundColor === '#FFFFFF' ? '#F9FAFB' : 'rgba(255,255,255,0.05)' }}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.images?.[0] || PLACEHOLDER_IMAGE}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium mb-1 line-clamp-1">{product.name}</h4>
                    <span className="font-bold" style={{ color: theme.primaryColor }}>${product.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ==================== CART PAGE SECTIONS ====================
    case 'cart-items': {
      const cartProducts = products.slice(0, 3);
      const subtotal = cartProducts.reduce((sum, p) => sum + (p.salePrice || p.price), 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax;

      return (
        <div className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: theme.textColor }}>
              <span className="hover:opacity-70" style={{ opacity: 0.7 }}>Store</span>
              <svg className="w-4 h-4" style={{ opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span style={{ color: theme.primaryColor }}>Shopping Cart</span>
            </nav>

            {/* Header */}
            <div className="mb-8">
              <h1
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{ fontFamily: theme.headingFont, color: theme.textColor }}
              >
                Shopping Cart
              </h1>
              <p style={{ color: theme.textColor, opacity: 0.7 }}>
                {cartProducts.length} items in your cart
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartProducts.map((product, i) => {
                  const hasDiscount = product.salePrice && product.salePrice < product.price;
                  return (
                    <div
                      key={product.id}
                      className={`p-4 md:p-6 ${getBorderRadius('large')} border`}
                      style={{ backgroundColor: theme.backgroundColor, borderColor: `${theme.textColor}15` }}
                    >
                      <div className="flex gap-4 md:gap-6">
                        {/* Product Image */}
                        <div
                          className={`w-24 h-24 md:w-32 md:h-32 ${getBorderRadius('medium')} overflow-hidden flex-shrink-0`}
                          style={{ backgroundColor: `${theme.textColor}10` }}
                        >
                          <img
                            src={product.images?.[0] || PLACEHOLDER_IMAGE}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3
                                className="font-semibold hover:opacity-70 line-clamp-2 text-lg cursor-pointer"
                                style={{ color: theme.textColor }}
                              >
                                {product.name}
                              </h3>
                              {product.category && (
                                <p className="text-sm mt-1" style={{ color: theme.textColor, opacity: 0.7 }}>
                                  {product.category.name || 'Category'}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-sm" style={{ color: theme.textColor, opacity: 0.7 }}>
                              Size: <span style={{ color: theme.textColor }}>M</span>
                            </span>
                            <span className="text-sm" style={{ color: theme.textColor, opacity: 0.7 }}>
                              Color: <span style={{ color: theme.textColor }}>Black</span>
                            </span>
                          </div>

                          {/* Stock Status */}
                          <div className="mb-3">
                            <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: '#22c55e' }}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              In Stock
                            </span>
                          </div>

                          {/* Price and Quantity */}
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            {/* Price */}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold" style={{ color: theme.primaryColor }}>
                                  ${(product.salePrice || product.price).toFixed(2)}
                                </span>
                                {hasDiscount && (
                                  <span className="text-sm line-through" style={{ color: theme.textColor, opacity: 0.5 }}>
                                    ${product.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                              {hasDiscount && (
                                <span className="text-sm font-medium" style={{ color: '#22c55e' }}>
                                  Save ${(product.price - product.salePrice!).toFixed(2)}
                                </span>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex items-center ${getBorderRadius('medium')} border`}
                                style={{ borderColor: `${theme.textColor}20` }}
                              >
                                <button className="p-2" style={{ color: theme.textColor }}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="px-4 font-medium" style={{ color: theme.textColor }}>{i + 1}</span>
                                <button className="p-2" style={{ color: theme.textColor }}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>

                              <button
                                className={`p-2 ${getBorderRadius('medium')}`}
                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Save for Later */}
                          <div className="mt-4 pt-4 border-t" style={{ borderColor: `${theme.textColor}10` }}>
                            <button
                              className="text-sm font-medium flex items-center gap-1"
                              style={{ color: theme.primaryColor }}
                            >
                              <Heart className="w-4 h-4" />
                              Save for Later
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div
                  className={`p-6 ${getBorderRadius('large')} border sticky top-24`}
                  style={{ backgroundColor: theme.backgroundColor, borderColor: `${theme.textColor}15` }}
                >
                  <h2
                    className="text-xl font-bold mb-6"
                    style={{ fontFamily: theme.headingFont, color: theme.textColor }}
                  >
                    Order Summary
                  </h2>

                  {/* Promo Code */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block" style={{ color: theme.textColor }}>
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <div
                        className={`flex-1 flex items-center border ${getBorderRadius('medium')} overflow-hidden`}
                        style={{ borderColor: `${theme.textColor}20` }}
                      >
                        <svg className="w-4 h-4 ml-3" style={{ color: theme.textColor, opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Enter code"
                          className="flex-1 px-3 py-2 bg-transparent outline-none text-sm"
                          style={{ color: theme.textColor }}
                        />
                      </div>
                      <button
                        className={`px-4 py-2 font-medium ${getBorderRadius('medium')} text-white`}
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span style={{ color: theme.textColor, opacity: 0.7 }}>Subtotal ({cartProducts.length} items)</span>
                      <span className="font-medium" style={{ color: theme.textColor }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: theme.textColor, opacity: 0.7 }}>Shipping</span>
                      <span className="font-medium" style={{ color: '#22c55e' }}>FREE</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: theme.textColor, opacity: 0.7 }}>Tax (8.0%)</span>
                      <span className="font-medium" style={{ color: theme.textColor }}>${tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4 mb-6" style={{ borderColor: `${theme.textColor}15` }}>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold" style={{ color: theme.textColor }}>Total</span>
                      <span className="text-2xl font-bold" style={{ color: theme.primaryColor }}>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    className={`w-full flex items-center justify-center gap-2 py-4 font-semibold ${getBorderRadius('medium')} text-white`}
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    Proceed to Checkout
                  </button>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: `${theme.textColor}10` }}>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: 'shield', text: 'Secure Checkout' },
                        { icon: 'refresh', text: '30-Day Returns' },
                        { icon: 'truck', text: 'Free Shipping' },
                        { icon: 'lock', text: 'Privacy Protected' },
                      ].map((badge, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs" style={{ color: theme.textColor, opacity: 0.7 }}>
                          <svg className="w-4 h-4" style={{ color: '#22c55e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {badge.icon === 'shield' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
                            {badge.icon === 'refresh' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />}
                            {badge.icon === 'truck' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />}
                            {badge.icon === 'lock' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
                          </svg>
                          {badge.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'cart-summary': {
      // This is now handled within cart-items, but keep for backwards compatibility
      return (
        <div className="py-6 px-6">
          <div className="max-w-4xl mx-auto">
            <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <h3 className="font-bold mb-4" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ opacity: 0.7, color: theme.textColor }}>Subtotal</span>
                  <span style={{ color: theme.textColor }}>$329.97</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ opacity: 0.7, color: theme.textColor }}>Shipping</span>
                  <span style={{ color: '#22c55e' }}>FREE</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ opacity: 0.7, color: theme.textColor }}>Tax</span>
                  <span style={{ color: theme.textColor }}>$26.40</span>
                </div>
                <div className="border-t pt-3 mt-3" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                  <div className="flex justify-between font-bold text-lg">
                    <span style={{ color: theme.textColor }}>Total</span>
                    <span style={{ color: theme.primaryColor }}>$356.37</span>
                  </div>
                </div>
              </div>
              <button
                className={`w-full mt-6 py-3 font-semibold ${getBorderRadius('medium')}`}
                style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      );
    }

    case 'cart-recommendations': {
      const recProducts = products.slice(4, 8);
      return (
        <div className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-xl font-bold mb-6" style={{ fontFamily: theme.headingFont }}>You May Also Like</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recProducts.map((product) => (
                <div key={product.id} className={`${getBorderRadius('large')} overflow-hidden`} style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  <div className="aspect-square overflow-hidden">
                    <img src={product.images?.[0] || PLACEHOLDER_IMAGE} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }} />
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-medium mb-1 line-clamp-1">{product.name}</h4>
                    <span className="text-sm font-bold" style={{ color: theme.primaryColor }}>${product.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'cart-promo': {
      return (
        <div className="py-6 px-6">
          <div className="max-w-4xl mx-auto">
            <div className={`p-4 ${getBorderRadius('large')}`} style={{ backgroundColor: theme.primaryColor + '10' }}>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  className={`flex-1 px-4 py-2 ${getBorderRadius('medium')} bg-white`}
                  style={{ border: `1px solid ${theme.primaryColor}30` }}
                />
                <button
                  className={`px-6 py-2 font-medium ${getBorderRadius('medium')}`}
                  style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ==================== CHECKOUT PAGE SECTIONS ====================
    case 'checkout-page': {
      // Complete checkout page matching StorefrontCheckoutPage UI
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
        <div className="py-12 px-6" style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb & Security Badge */}
            <div className="flex items-center justify-between mb-8">
              <span
                className="flex items-center gap-2 text-sm cursor-pointer transition-opacity hover:opacity-100"
                style={{ color: theme.textColor, opacity: 0.7 }}
                onClick={() => onNavigate?.('cart')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Cart
              </span>
              <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure Checkout
              </div>
            </div>

            {/* Step Indicator */}
            <div className="mb-12">
              <div className="flex items-center justify-center">
                {[
                  { num: 1, label: 'Shipping', active: true },
                  { num: 2, label: 'Delivery', active: false },
                  { num: 3, label: 'Payment', active: false },
                  { num: 4, label: 'Review', active: false },
                ].map((step, i, arr) => (
                  <React.Fragment key={step.num}>
                    <div className="flex flex-col items-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2"
                        style={{
                          backgroundColor: step.active ? theme.primaryColor : `${theme.textColor}15`,
                          color: step.active ? '#FFFFFF' : theme.textColor,
                        }}
                      >
                        {step.num}
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{ color: step.active ? theme.primaryColor : theme.textColor, opacity: step.active ? 1 : 0.6 }}
                      >
                        {step.label}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="w-16 md:w-24 h-0.5 mx-2 mb-6" style={{ backgroundColor: `${theme.textColor}15` }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Main Content - Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Form */}
              <div className="lg:col-span-7">
                <h1
                  className="text-2xl md:text-3xl font-bold mb-6"
                  style={{ fontFamily: theme.headingFont, color: theme.textColor }}
                >
                  Shipping Address
                </h1>

                <div
                  className={`${getBorderRadius('large')} border p-6 md:p-8`}
                  style={{ backgroundColor: getCardBg(), borderColor: `${theme.textColor}15` }}
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name', placeholder: 'John Doe', span: 2 },
                      { label: 'Email', placeholder: 'john@example.com', span: 1 },
                      { label: 'Phone', placeholder: '+1 234 567 8900', span: 1 },
                      { label: 'Address', placeholder: '123 Main Street', span: 2 },
                      { label: 'City', placeholder: 'New York', span: 1 },
                      { label: 'State', placeholder: 'NY', span: 1 },
                      { label: 'ZIP Code', placeholder: '10001', span: 1 },
                      { label: 'Country', placeholder: 'United States', span: 1 },
                    ].map((field) => (
                      <div key={field.label} className={field.span === 2 ? 'md:col-span-2' : ''}>
                        <label className="text-sm font-medium mb-1.5 block" style={{ color: theme.textColor, opacity: 0.8 }}>
                          {field.label}
                        </label>
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          className={`w-full px-4 py-2.5 ${getBorderRadius('medium')} focus:outline-none focus:ring-2`}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: `1px solid ${theme.textColor}20`,
                            color: theme.textColor,
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Save for future checkbox */}
                  <label className="flex items-center gap-2 mt-6 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded"
                      style={{ accentColor: theme.primaryColor }}
                    />
                    <span className="text-sm" style={{ color: theme.textColor }}>Save this address for future orders</span>
                  </label>
                </div>

                {/* Navigation Buttons */}
                <div className="mt-6 flex items-center justify-end">
                  <button
                    className={`flex items-center gap-2 px-8 py-3 font-medium ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90`}
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Continue to Delivery
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-5">
                <div
                  className={`${getBorderRadius('large')} border p-6 sticky top-6`}
                  style={{ backgroundColor: getCardBg(), borderColor: `${theme.textColor}15` }}
                >
                  <h3 className="font-bold mb-4" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>
                    Order Summary
                  </h3>

                  {/* Products */}
                  <div className="space-y-4 mb-6">
                    {products.slice(0, 2).map((product) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className={`w-16 h-16 ${getBorderRadius('small')} overflow-hidden bg-gray-100`}>
                          <img
                            src={product.images?.[0] || PLACEHOLDER_IMAGE}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1" style={{ color: theme.textColor }}>{product.name}</p>
                          <p className="text-xs" style={{ color: theme.textColor, opacity: 0.6 }}>Qty: 1</p>
                        </div>
                        <span className="font-medium" style={{ color: theme.textColor }}>${product.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code */}
                  <div className="mb-6">
                    <div className={`flex gap-2 ${getBorderRadius('medium')} overflow-hidden border`} style={{ borderColor: `${theme.textColor}20` }}>
                      <input
                        type="text"
                        placeholder="Promo code"
                        className="flex-1 px-4 py-2.5 focus:outline-none text-sm"
                        style={{ backgroundColor: '#FFFFFF', color: theme.textColor }}
                      />
                      <button
                        className="px-4 py-2.5 font-medium text-sm"
                        style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t pt-4 space-y-2" style={{ borderColor: `${theme.textColor}15` }}>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: theme.textColor, opacity: 0.7 }}>Subtotal</span>
                      <span style={{ color: theme.textColor }}>$229.98</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: theme.textColor, opacity: 0.7 }}>Shipping</span>
                      <span style={{ color: theme.accentColor }}>FREE</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: theme.textColor, opacity: 0.7 }}>Tax</span>
                      <span style={{ color: theme.textColor }}>$0.00</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t" style={{ borderColor: `${theme.textColor}15` }}>
                      <span style={{ color: theme.textColor }}>Total</span>
                      <span style={{ color: theme.primaryColor }}>$229.98</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'checkout-steps': {
      return (
        <div className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4">
              {['Shipping', 'Payment', 'Review'].map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: i === 0 ? theme.primaryColor : 'rgba(0,0,0,0.1)',
                        color: i === 0 ? '#FFFFFF' : theme.textColor,
                      }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium" style={{ color: i === 0 ? theme.primaryColor : theme.textColor, opacity: i === 0 ? 1 : 0.6 }}>
                      {step}
                    </span>
                  </div>
                  {i < 2 && <div className="w-16 h-0.5" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'checkout-form': {
      return (
        <div className="py-6 px-6">
          <div className="max-w-4xl mx-auto">
            <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <h3 className="font-bold mb-4" style={{ fontFamily: theme.headingFont }}>Shipping Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {['First Name', 'Last Name', 'Email', 'Phone', 'Address', 'City', 'State', 'ZIP Code'].map((field) => (
                  <div key={field} className={field === 'Address' ? 'md:col-span-2' : ''}>
                    <label className="text-sm font-medium mb-1 block opacity-70">{field}</label>
                    <input
                      type="text"
                      placeholder={field}
                      className={`w-full px-4 py-2.5 ${getBorderRadius('medium')}`}
                      style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'checkout-summary': {
      return (
        <div className="py-6 px-6">
          <div className="max-w-4xl mx-auto">
            <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <h3 className="font-bold mb-4" style={{ fontFamily: theme.headingFont }}>Order Summary</h3>
              <div className="space-y-3">
                {products.slice(0, 2).map((product) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${getBorderRadius('small')} overflow-hidden`}>
                      <img src={product.images?.[0] || PLACEHOLDER_IMAGE} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                      <p className="text-xs opacity-60">Qty: 1</p>
                    </div>
                    <span className="font-medium">${product.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 space-y-2" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Subtotal</span>
                  <span>$229.98</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Shipping</span>
                  <span style={{ color: theme.accentColor }}>FREE</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span style={{ color: theme.primaryColor }}>$229.98</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'checkout-payment': {
      return (
        <div className="py-6 px-6">
          <div className="max-w-4xl mx-auto">
            <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <h3 className="font-bold mb-4" style={{ fontFamily: theme.headingFont }}>Payment Method</h3>
              <div className="space-y-3">
                {['Credit Card', 'PayPal', 'Apple Pay'].map((method, i) => (
                  <div
                    key={method}
                    className={`p-4 ${getBorderRadius('medium')} cursor-pointer`}
                    style={{
                      backgroundColor: i === 0 ? theme.primaryColor + '10' : '#FFFFFF',
                      border: `2px solid ${i === 0 ? theme.primaryColor : 'rgba(0,0,0,0.1)'}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: i === 0 ? theme.primaryColor : 'rgba(0,0,0,0.2)' }}
                      >
                        {i === 0 && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />}
                      </div>
                      <span className="font-medium">{method}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className={`w-full mt-6 py-3 font-semibold ${getBorderRadius('medium')}`}
                style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ==================== WISHLIST PAGE SECTIONS ====================
    case 'wishlist-header': {
      return (
        <div className="py-8 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: theme.headingFont }}>My Wishlist</h1>
            <p className="opacity-70">You have 4 items in your wishlist</p>
          </div>
        </div>
      );
    }

    case 'wishlist-items': {
      const wishlistProducts = products.slice(0, 4);
      return (
        <div className="py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className={`${getBorderRadius('large')} overflow-hidden relative`}
                  style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                >
                  <button
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10"
                    style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  >
                    <Heart className="w-4 h-4" style={{ color: '#EF4444', fill: '#EF4444' }} />
                  </button>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.images?.[0] || PLACEHOLDER_IMAGE}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-1 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: theme.primaryColor }}>${product.price.toFixed(2)}</span>
                      <button
                        className={`px-3 py-1.5 text-sm font-medium ${getBorderRadius('medium')}`}
                        style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'wishlist-share': {
      return (
        <div className="py-8 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: theme.primaryColor + '10' }}>
              <h3 className="font-bold mb-2">Share Your Wishlist</h3>
              <p className="text-sm opacity-70 mb-4">Let friends and family know what you're wishing for</p>
              <div className="flex justify-center gap-3">
                <button className={`px-4 py-2 ${getBorderRadius('medium')}`} style={{ backgroundColor: '#1877F2', color: '#FFFFFF' }}>Facebook</button>
                <button className={`px-4 py-2 ${getBorderRadius('medium')}`} style={{ backgroundColor: '#1DA1F2', color: '#FFFFFF' }}>Twitter</button>
                <button className={`px-4 py-2 ${getBorderRadius('medium')}`} style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}>Copy Link</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ==================== PROFILE PAGE SECTIONS ====================
    case 'profile-sidebar': {
      // Complete profile page matching StorefrontProfilePage UI
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
        <div className="py-12 px-6" style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
          <div className="max-w-6xl mx-auto">
            {/* Page Title */}
            <h1
              className="text-3xl md:text-4xl font-bold mb-8"
              style={{ fontFamily: theme.headingFont, color: theme.textColor }}
            >
              My Account
            </h1>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* LEFT: Sidebar */}
              <div className="lg:col-span-1">
                <div
                  className={`p-6 ${getBorderRadius('large')} border`}
                  style={{ backgroundColor: getCardBg(), borderColor: `${theme.textColor}15` }}
                >
                  {/* User Info with Avatar */}
                  <div className="text-center mb-6">
                    <div className="relative inline-block mb-3">
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center border-4"
                        style={{ backgroundColor: `${theme.primaryColor}20`, borderColor: `${theme.primaryColor}30` }}
                      >
                        <span className="text-3xl font-bold" style={{ color: theme.primaryColor }}>JD</span>
                      </div>
                      {/* Camera Button */}
                      <button
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </div>
                    <h3 className="font-semibold" style={{ color: theme.textColor }}>John Doe</h3>
                    <p className="text-sm" style={{ color: theme.textColor, opacity: 0.7 }}>john@email.com</p>
                  </div>

                  {/* Navigation Tabs */}
                  <nav className="space-y-2">
                    {[
                      { icon: 'user', label: 'Profile', active: true, page: 'profile' as PageType },
                      { icon: 'package', label: 'Orders', active: false, page: 'trackOrder' as PageType },
                      { icon: 'heart', label: 'Wishlist', active: false, page: 'wishlist' as PageType },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (onNavigate && item.page) {
                            onNavigate(item.page);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 ${getBorderRadius('medium')} text-left transition-colors`}
                        style={{
                          backgroundColor: item.active ? `${theme.primaryColor}15` : 'transparent',
                          color: item.active ? theme.primaryColor : theme.textColor,
                          opacity: item.active ? 1 : 0.7,
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {item.icon === 'user' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                          {item.icon === 'package' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />}
                          {item.icon === 'heart' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />}
                        </svg>
                        <span className={item.active ? 'font-semibold' : ''}>{item.label}</span>
                      </button>
                    ))}

                    {/* Logout Button */}
                    <button
                      className={`w-full flex items-center gap-3 px-4 py-3 ${getBorderRadius('medium')} text-left`}
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>

                    {/* Delete Account Button */}
                    <button
                      className={`w-full flex items-center gap-3 px-4 py-3 ${getBorderRadius('medium')} text-left mt-2`}
                      style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Account
                    </button>
                  </nav>
                </div>
              </div>

              {/* RIGHT: Personal Information Only */}
              <div className="lg:col-span-3">
                <div
                  className={`p-6 ${getBorderRadius('large')} border`}
                  style={{ backgroundColor: getCardBg(), borderColor: `${theme.textColor}15` }}
                >
                  <h2
                    className="text-xl font-bold mb-6"
                    style={{ fontFamily: theme.headingFont, color: theme.textColor }}
                  >
                    Personal Information
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { label: 'First Name', value: 'John', disabled: false },
                      { label: 'Last Name', value: 'Doe', disabled: false },
                      { label: 'Email', value: 'john@email.com', disabled: true },
                      { label: 'Phone', value: '+1 234 567 890', disabled: false },
                    ].map((field) => (
                      <div key={field.label}>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: theme.textColor }}
                        >
                          {field.label}
                        </label>
                        <input
                          type="text"
                          defaultValue={field.value}
                          disabled={field.disabled}
                          className={`w-full px-4 py-2 border ${getBorderRadius('medium')} focus:outline-none focus:ring-2`}
                          style={{
                            backgroundColor: field.disabled ? `${theme.textColor}05` : getCardBg(),
                            borderColor: `${theme.textColor}20`,
                            color: theme.textColor,
                            opacity: field.disabled ? 0.7 : 1,
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    className={`flex items-center gap-2 mt-6 px-6 py-3 font-medium ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90`}
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'profile-info': {
      return (
        <div className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <h3 className="font-bold mb-6" style={{ fontFamily: theme.headingFont }}>Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: 'First Name', value: 'John' },
                  { label: 'Last Name', value: 'Doe' },
                  { label: 'Email', value: 'john@email.com' },
                  { label: 'Phone', value: '+1 234 567 890' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-sm font-medium mb-1 block opacity-70">{field.label}</label>
                    <input
                      type="text"
                      value={field.value}
                      readOnly
                      className={`w-full px-4 py-2.5 ${getBorderRadius('medium')}`}
                      style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)' }}
                    />
                  </div>
                ))}
              </div>
              <button
                className={`mt-6 px-6 py-2.5 font-medium ${getBorderRadius('medium')}`}
                style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      );
    }

    case 'profile-orders': {
      return (
        <div className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-bold mb-6" style={{ fontFamily: theme.headingFont }}>Order History</h3>
            <div className="space-y-4">
              {[
                { id: '#12345', date: 'Jan 10, 2026', status: 'Delivered', total: '$149.99', color: '#22C55E' },
                { id: '#12344', date: 'Jan 05, 2026', status: 'Shipped', total: '$89.50', color: '#3B82F6' },
                { id: '#12343', date: 'Dec 28, 2025', status: 'Processing', total: '$225.00', color: '#F59E0B' },
              ].map((order) => (
                <div key={order.id} className={`p-4 ${getBorderRadius('large')}`} style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm opacity-60">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: order.color + '20', color: order.color }}>
                        {order.status}
                      </span>
                      <p className="font-bold mt-1" style={{ color: theme.primaryColor }}>{order.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'profile-addresses': {
      return (
        <div className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold" style={{ fontFamily: theme.headingFont }}>Saved Addresses</h3>
              <button
                className={`px-4 py-2 text-sm font-medium ${getBorderRadius('medium')}`}
                style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
              >
                Add New
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Home', address: '123 Main Street, Apt 4B', city: 'New York, NY 10001', default: true },
                { label: 'Office', address: '456 Business Ave', city: 'New York, NY 10002', default: false },
              ].map((addr) => (
                <div key={addr.label} className={`p-4 ${getBorderRadius('large')}`} style={{ backgroundColor: 'rgba(0,0,0,0.02)', border: addr.default ? `2px solid ${theme.primaryColor}` : 'none' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{addr.label}</span>
                    {addr.default && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.primaryColor + '20', color: theme.primaryColor }}>Default</span>}
                  </div>
                  <p className="text-sm opacity-70">{addr.address}</p>
                  <p className="text-sm opacity-70">{addr.city}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'profile-settings': {
      return (
        <div className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-bold mb-6" style={{ fontFamily: theme.headingFont }}>Account Settings</h3>
            <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <div className="space-y-4">
                {[
                  { label: 'Email Notifications', desc: 'Receive order updates via email', enabled: true },
                  { label: 'Push Notifications', desc: 'Receive push notifications', enabled: true },
                  { label: 'Marketing Emails', desc: 'Receive promotional emails', enabled: false },
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm opacity-60">{setting.desc}</p>
                    </div>
                    <div
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors`}
                      style={{ backgroundColor: setting.enabled ? theme.primaryColor : 'rgba(0,0,0,0.2)' }}
                    >
                      <div
                        className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                        style={{ left: setting.enabled ? '26px' : '2px' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ==================== TRACK ORDER PAGE SECTIONS ====================
    case 'track-order-page': {
      // Complete track order page matching StorefrontTrackOrderPage UI
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
          {/* Gradient Search Header */}
          <div
            className="py-12 px-6"
            style={{ background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)` }}
          >
            <div className="max-w-2xl mx-auto text-center text-white">
              <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: theme.headingFont }}>Track Your Order</h1>
              <p className="opacity-90 mb-6">Enter your order number to track delivery status</p>
              <div className={`flex gap-2 ${getBorderRadius('large')} p-2 bg-white`}>
                <input
                  type="text"
                  placeholder="Order Number"
                  className="flex-1 px-4 py-2 text-gray-900 focus:outline-none"
                />
                <button
                  className={`px-6 py-2 font-medium ${getBorderRadius('medium')}`}
                  style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
                >
                  Track Order
                </button>
              </div>
            </div>
          </div>

          <div className="py-8 px-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Order Details Card */}
              <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: getCardBg(), border: `1px solid ${theme.textColor}10` }}>
                <h3 className="font-bold mb-4" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>
                  Order Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="opacity-60 mb-1">Order Number</p>
                    <p className="font-medium" style={{ color: theme.textColor }}>#FLX-2026-28738</p>
                  </div>
                  <div>
                    <p className="opacity-60 mb-1">Order Date</p>
                    <p className="font-medium" style={{ color: theme.textColor }}>January 10, 2026</p>
                  </div>
                  <div>
                    <p className="opacity-60 mb-1">Estimated Delivery</p>
                    <p className="font-bold" style={{ color: theme.primaryColor }}>January 14, 2026</p>
                  </div>
                  <div>
                    <p className="opacity-60 mb-1">Tracking Number</p>
                    <p className="font-medium font-mono" style={{ color: theme.textColor }}>TRK-9876543210</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address with Map */}
              <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: getCardBg(), border: `1px solid ${theme.textColor}10` }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>
                  <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Shipping Address
                </h3>
                <div className="text-sm mb-4" style={{ color: theme.textColor, opacity: 0.8 }}>
                  <p className="font-medium">John Doe</p>
                  <p>123 Main Street, Apt 4B</p>
                  <p>Dhaka, Bangladesh 1205</p>
                </div>

                {/* Map Placeholder */}
                <div
                  className={`h-64 ${getBorderRadius('large')} flex items-center justify-center relative overflow-hidden`}
                  style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 opacity-50" />
                  <div className="relative text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primaryColor }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium" style={{ color: theme.textColor }}>Live Delivery Tracking</p>
                    <p className="text-xs opacity-60" style={{ color: theme.textColor }}>ETA: 25 mins • 2.3 km away</p>
                  </div>
                </div>
              </div>

              {/* Timeline Events */}
              <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: getCardBg(), border: `1px solid ${theme.textColor}10` }}>
                <h3 className="font-bold mb-4" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>
                  Timeline
                </h3>
                <div className="space-y-4">
                  {[
                    { status: 'OUT FOR DELIVERY', description: 'Your package is on the way', timestamp: 'Jan 14, 2026, 10:30 AM', active: true },
                    { status: 'SHIPPED', description: 'Package has left the warehouse', timestamp: 'Jan 13, 2026, 2:15 PM', active: false },
                    { status: 'PROCESSING', description: 'Order is being prepared', timestamp: 'Jan 12, 2026, 9:00 AM', active: false },
                    { status: 'ORDER PLACED', description: 'Order confirmed successfully', timestamp: 'Jan 10, 2026, 3:45 PM', active: false },
                  ].map((event, index, arr) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: index === 0 ? theme.primaryColor : `${theme.textColor}30` }}
                        />
                        {index < arr.length - 1 && (
                          <div className="w-0.5 flex-1 min-h-[40px]" style={{ backgroundColor: `${theme.textColor}20` }} />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium" style={{ color: theme.textColor }}>{event.status}</p>
                        <p className="text-sm" style={{ color: theme.textColor, opacity: 0.7 }}>{event.description}</p>
                        <p className="text-xs" style={{ color: theme.textColor, opacity: 0.5 }}>{event.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Section */}
              <div
                className={`p-6 ${getBorderRadius('large')}`}
                style={{ backgroundColor: `${theme.primaryColor}10` }}
              >
                <h3 className="font-bold mb-2" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>
                  Need Help?
                </h3>
                <p className="text-sm opacity-70 mb-4" style={{ color: theme.textColor }}>
                  Our support team is available 24/7 to assist you.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    className={`px-6 py-2.5 font-medium ${getBorderRadius('medium')}`}
                    style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
                  >
                    Contact Support
                  </button>
                  <button
                    className={`px-6 py-2.5 font-medium ${getBorderRadius('medium')}`}
                    style={{ backgroundColor: '#FFFFFF', color: theme.primaryColor, border: `1px solid ${theme.primaryColor}` }}
                  >
                    Call Us
                  </button>
                </div>
              </div>

              {/* Back to Shopping */}
              <div className="text-center">
                <span
                  className="text-sm cursor-pointer transition-opacity hover:opacity-100"
                  style={{ color: theme.primaryColor }}
                  onClick={() => onNavigate?.('collection')}
                >
                  Continue Shopping →
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'order-search': {
      return (
        <div
          className="py-12 px-6"
          style={{ background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)` }}
        >
          <div className="max-w-2xl mx-auto text-center text-white">
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: theme.headingFont }}>Track Your Order</h1>
            <p className="opacity-90 mb-6">Enter your order number to track delivery status</p>
            <div className={`flex gap-2 ${getBorderRadius('large')} p-2 bg-white`}>
              <input
                type="text"
                placeholder="Enter order number (e.g., #12345)"
                className="flex-1 px-4 py-2 text-gray-900 focus:outline-none"
              />
              <button
                className={`px-6 py-2 font-medium ${getBorderRadius('medium')}`}
                style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
              >
                Track
              </button>
            </div>
          </div>
        </div>
      );
    }

    case 'order-timeline': {
      return (
        <div className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <h3 className="font-bold mb-6" style={{ fontFamily: theme.headingFont }}>Order Status</h3>
              <div className="space-y-4">
                {[
                  { label: 'Order Placed', done: true },
                  { label: 'Confirmed', done: true },
                  { label: 'Shipped', done: true, current: true },
                  { label: 'Out for Delivery', done: false },
                  { label: 'Delivered', done: false },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: step.done ? theme.primaryColor : 'rgba(0,0,0,0.1)',
                        boxShadow: step.current ? `0 0 12px ${theme.primaryColor}60` : 'none',
                      }}
                    >
                      {step.done ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium" style={{ color: theme.textColor, opacity: 0.5 }}>{i + 1}</span>
                      )}
                    </div>
                    <span className="font-medium" style={{ color: step.done ? theme.textColor : theme.textColor, opacity: step.done ? 1 : 0.5 }}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'order-details': {
      return (
        <div className="py-6 px-6">
          <div className="max-w-4xl mx-auto">
            <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <h3 className="font-bold mb-4" style={{ fontFamily: theme.headingFont }}>Order Details</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="opacity-60 mb-1">Order Number</p>
                  <p className="font-medium">#12345</p>
                </div>
                <div>
                  <p className="opacity-60 mb-1">Order Date</p>
                  <p className="font-medium">January 10, 2026</p>
                </div>
                <div>
                  <p className="opacity-60 mb-1">Estimated Delivery</p>
                  <p className="font-bold" style={{ color: theme.primaryColor }}>January 14, 2026</p>
                </div>
                <div>
                  <p className="opacity-60 mb-1">Tracking Number</p>
                  <p className="font-medium font-mono">TRK-9876543210</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'order-support': {
      return (
        <div className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: theme.primaryColor + '10' }}>
              <h3 className="font-bold mb-2" style={{ fontFamily: theme.headingFont }}>Need Help?</h3>
              <p className="text-sm opacity-70 mb-4">Our support team is available 24/7 to assist you.</p>
              <div className="flex gap-3">
                <button
                  className={`px-6 py-2.5 font-medium ${getBorderRadius('medium')}`}
                  style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
                >
                  Contact Support
                </button>
                <button
                  className={`px-6 py-2.5 font-medium ${getBorderRadius('medium')}`}
                  style={{ backgroundColor: '#FFFFFF', color: theme.primaryColor, border: `1px solid ${theme.primaryColor}` }}
                >
                  Call Us
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ==================== ABOUT PAGE SECTIONS ====================
    case 'about-hero': {
      return (
        <div
          className="py-16 px-6"
          style={{ background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)` }}
        >
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: theme.headingFont }}>About Us</h1>
            <p className="text-lg opacity-90">
              Discover our story, our mission, and what drives us to deliver exceptional experiences.
            </p>
          </div>
        </div>
      );
    }

    case 'about-content': {
      return (
        <div className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>Our Story</h2>
                <div className="space-y-4 opacity-80" style={{ color: theme.textColor }}>
                  <p>
                    We started with a simple mission: to bring you the best products with exceptional service. Every item in our store is carefully selected to ensure quality and value.
                  </p>
                  <p>
                    From humble beginnings, we've grown into a trusted destination for customers who value quality, authenticity, and great customer service.
                  </p>
                  <p>
                    Our team is passionate about what we do, and we're committed to continuously improving your shopping experience.
                  </p>
                </div>
              </div>
              <div className={`aspect-[4/3] ${getBorderRadius('large')} overflow-hidden`}>
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=450&fit=crop"
                  alt="Our Team"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'about-stats': {
      return (
        <div className="py-12 px-6" style={{ backgroundColor: theme.primaryColor + '08' }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '10K+', label: 'Happy Customers' },
                { value: '500+', label: 'Products' },
                { value: '50+', label: 'Countries' },
                { value: '5+', label: 'Years Experience' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: theme.primaryColor }}>{stat.value}</p>
                  <p className="text-sm font-medium" style={{ color: theme.textColor, opacity: 0.7 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'about-values': {
      return (
        <div className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Quality', description: 'We never compromise on quality. Every product is carefully vetted to meet our high standards.', icon: '⭐' },
                { title: 'Innovation', description: 'We constantly evolve and adapt, bringing you the latest and best products on the market.', icon: '💡' },
                { title: 'Customer First', description: 'Your satisfaction is our top priority. We go above and beyond to ensure a great experience.', icon: '❤️' },
              ].map((value) => (
                <div
                  key={value.title}
                  className={`p-6 text-center ${getBorderRadius('large')}`}
                  style={{ backgroundColor: theme.backgroundColor, border: `1px solid ${theme.textColor}15` }}
                >
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: theme.textColor }}>{value.title}</h3>
                  <p className="text-sm opacity-70" style={{ color: theme.textColor }}>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ==================== CONTACT PAGE SECTIONS ====================
    case 'contact-hero': {
      return (
        <div
          className="py-12 px-6"
          style={{ background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)` }}
        >
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: theme.headingFont }}>Contact Us</h1>
            <p className="opacity-90">We'd love to hear from you. Get in touch with our team.</p>
          </div>
        </div>
      );
    }

    case 'contact-form': {
      return (
        <div className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>Send us a message</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor }}>First Name</label>
                      <input
                        type="text"
                        placeholder="John"
                        className={`w-full px-4 py-3 ${getBorderRadius('medium')}`}
                        style={{ backgroundColor: theme.backgroundColor, border: `1px solid ${theme.textColor}20`, color: theme.textColor }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor }}>Last Name</label>
                      <input
                        type="text"
                        placeholder="Doe"
                        className={`w-full px-4 py-3 ${getBorderRadius('medium')}`}
                        style={{ backgroundColor: theme.backgroundColor, border: `1px solid ${theme.textColor}20`, color: theme.textColor }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor }}>Email</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className={`w-full px-4 py-3 ${getBorderRadius('medium')}`}
                      style={{ backgroundColor: theme.backgroundColor, border: `1px solid ${theme.textColor}20`, color: theme.textColor }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor }}>Subject</label>
                    <input
                      type="text"
                      placeholder="How can we help?"
                      className={`w-full px-4 py-3 ${getBorderRadius('medium')}`}
                      style={{ backgroundColor: theme.backgroundColor, border: `1px solid ${theme.textColor}20`, color: theme.textColor }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor }}>Message</label>
                    <textarea
                      rows={5}
                      placeholder="Your message..."
                      className={`w-full px-4 py-3 ${getBorderRadius('medium')} resize-none`}
                      style={{ backgroundColor: theme.backgroundColor, border: `1px solid ${theme.textColor}20`, color: theme.textColor }}
                    />
                  </div>
                  <button
                    className={`w-full py-3 font-medium ${getBorderRadius('medium')}`}
                    style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
                  >
                    Send Message
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>Get in touch</h2>
                <div className="space-y-6">
                  {[
                    { icon: '📍', title: 'Visit Us', info: '123 Commerce Street, New York, NY 10001' },
                    { icon: '📧', title: 'Email Us', info: 'support@store.com' },
                    { icon: '📞', title: 'Call Us', info: '+1 (555) 123-4567' },
                    { icon: '🕐', title: 'Business Hours', info: 'Mon - Fri: 9AM - 6PM EST' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 flex items-center justify-center ${getBorderRadius('medium')} flex-shrink-0`}
                        style={{ backgroundColor: theme.primaryColor + '15' }}
                      >
                        <span className="text-xl">{item.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-medium" style={{ color: theme.textColor }}>{item.title}</h3>
                        <p className="text-sm opacity-70" style={{ color: theme.textColor }}>{item.info}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'contact-info': {
      return (
        <div className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: '📍', title: 'Address', info: '123 Commerce St, New York, NY' },
                { icon: '📧', title: 'Email', info: 'support@store.com' },
                { icon: '📞', title: 'Phone', info: '+1 (555) 123-4567' },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`p-6 text-center ${getBorderRadius('large')}`}
                  style={{ backgroundColor: theme.backgroundColor, border: `1px solid ${theme.textColor}15` }}
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-medium mb-1" style={{ color: theme.textColor }}>{item.title}</h3>
                  <p className="text-sm opacity-70" style={{ color: theme.textColor }}>{item.info}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'contact-map': {
      return (
        <div className="py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <div
              className={`w-full h-64 md:h-80 ${getBorderRadius('large')} flex items-center justify-center`}
              style={{ backgroundColor: theme.textColor + '10' }}
            >
              <div className="text-center">
                <span className="text-4xl mb-2 block">📍</span>
                <p className="text-sm opacity-70" style={{ color: theme.textColor }}>Map Preview</p>
                <p className="text-xs opacity-50 mt-1" style={{ color: theme.textColor }}>123 Commerce Street, New York, NY</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ==================== SEARCH PAGE ====================
    case 'search-page': {
      const categories = ['Clothing', 'Electronics', 'Home & Living', 'Accessories', 'Sports'];
      const sizes = ['XS', 'S', 'M', 'L', 'XL'];

      return (
        <div className="py-8 px-4 md:px-6" style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>
                All Products
              </h1>
              <p style={{ color: theme.textColor, opacity: 0.7 }}>Showing 24 results</p>
            </div>

            <div className="flex gap-8">
              {/* Desktop Sidebar */}
              <aside className="hidden lg:block w-[260px] flex-shrink-0">
                <div className={`p-4 border ${getBorderRadius('large')}`} style={{ borderColor: `${theme.textColor}15`, backgroundColor: theme.backgroundColor }}>
                  {/* Categories Filter */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3" style={{ color: theme.textColor, fontFamily: theme.headingFont }}>Categories</h3>
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: theme.primaryColor }} />
                          <span className="text-sm group-hover:opacity-80" style={{ color: theme.textColor }}>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3" style={{ color: theme.textColor, fontFamily: theme.headingFont }}>Price Range</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className={`flex-1 px-3 py-2 text-sm border ${getBorderRadius('small')} outline-none`}
                        style={{ backgroundColor: 'transparent', borderColor: `${theme.textColor}20`, color: theme.textColor }}
                      />
                      <span style={{ color: theme.textColor, opacity: 0.5 }}>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        className={`flex-1 px-3 py-2 text-sm border ${getBorderRadius('small')} outline-none`}
                        style={{ backgroundColor: 'transparent', borderColor: `${theme.textColor}20`, color: theme.textColor }}
                      />
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3" style={{ color: theme.textColor, fontFamily: theme.headingFont }}>Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          className={`px-3 py-1 text-sm border ${getBorderRadius('small')} transition-all`}
                          style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: theme.textColor, fontFamily: theme.headingFont }}>Rating</h3>
                    <div className="space-y-2">
                      {[4, 3, 2, 1].map((rating) => (
                        <label key={rating} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: theme.primaryColor }} />
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : ''}`} style={{ color: i >= rating ? `${theme.textColor}30` : undefined }} fill={i < rating ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            ))}
                            <span className="text-sm ml-1" style={{ color: theme.textColor, opacity: 0.7 }}>& Up</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1 min-w-0">
                {/* Toolbar */}
                <div className={`flex flex-wrap items-center justify-between gap-4 mb-6 p-4 border ${getBorderRadius('medium')}`} style={{ borderColor: `${theme.textColor}15`, backgroundColor: theme.backgroundColor }}>
                  {/* Search Input */}
                  <div className="flex-1 min-w-[200px] max-w-md relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.textColor, opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search products..."
                      className={`w-full pl-10 pr-4 py-2 border ${getBorderRadius('medium')} focus:outline-none`}
                      style={{ backgroundColor: 'transparent', borderColor: `${theme.textColor}20`, color: theme.textColor }}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Sort Dropdown */}
                    <select
                      className={`px-3 py-2 border ${getBorderRadius('medium')} focus:outline-none`}
                      style={{ backgroundColor: 'transparent', borderColor: `${theme.textColor}20`, color: theme.textColor }}
                    >
                      <option>Featured</option>
                      <option>Newest</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Top Rated</option>
                    </select>

                    {/* View Mode Buttons */}
                    <div className={`flex border ${getBorderRadius('medium')} overflow-hidden`} style={{ borderColor: `${theme.textColor}20` }}>
                      <button className="p-2" style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                      <button className="p-2" style={{ color: theme.textColor }}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className={`${getBorderRadius('large')} overflow-hidden border group`}
                      style={{ backgroundColor: theme.backgroundColor, borderColor: `${theme.textColor}15` }}
                    >
                      <div className="relative">
                        <div className="aspect-square overflow-hidden" style={{ backgroundColor: `${theme.textColor}10` }}>
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-12 h-12" style={{ color: theme.textColor, opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        {/* Wishlist Button */}
                        <button className={`absolute top-2 right-2 p-2 rounded-full shadow-md`} style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                        {/* Sale Badge */}
                        {i % 2 === 0 && (
                          <span className="absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded" style={{ backgroundColor: theme.primaryColor }}>SALE</span>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-semibold line-clamp-2" style={{ color: theme.textColor }}>Sample Product {i}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span className="text-sm" style={{ color: theme.textColor }}>4.{i}</span>
                          <span className="text-xs" style={{ color: theme.textColor, opacity: 0.5 }}>(12{i})</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-lg font-bold" style={{ color: theme.primaryColor }}>${(29.99 * i).toFixed(2)}</span>
                          {i % 2 === 0 && (
                            <span className="text-sm line-through" style={{ color: theme.textColor, opacity: 0.4 }}>${(39.99 * i).toFixed(2)}</span>
                          )}
                        </div>
                        <button
                          className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 font-medium ${getBorderRadius('medium')} text-white`}
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className={`mt-8 p-4 flex flex-col md:flex-row items-center justify-between gap-4 border ${getBorderRadius('medium')}`} style={{ borderColor: `${theme.textColor}15`, backgroundColor: theme.backgroundColor }}>
                  <p className="text-sm" style={{ color: theme.textColor, opacity: 0.7 }}>
                    Showing <span className="font-semibold" style={{ color: theme.textColor }}>1</span> to <span className="font-semibold" style={{ color: theme.textColor }}>6</span> of <span className="font-semibold" style={{ color: theme.textColor }}>24</span> products
                  </p>
                  <div className="flex items-center gap-2">
                    <button className={`p-2 border ${getBorderRadius('small')}`} style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className={`min-w-[36px] py-1 ${getBorderRadius('small')} text-white`} style={{ backgroundColor: theme.primaryColor }}>1</button>
                    <button className={`min-w-[36px] py-1 ${getBorderRadius('small')}`} style={{ color: theme.textColor }}>2</button>
                    <button className={`min-w-[36px] py-1 ${getBorderRadius('small')}`} style={{ color: theme.textColor }}>3</button>
                    <button className={`min-w-[36px] py-1 ${getBorderRadius('small')}`} style={{ color: theme.textColor }}>4</button>
                    <button className={`p-2 border ${getBorderRadius('small')}`} style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      );
    }

    default:
      return (
        <div className="py-16 px-6 text-center opacity-50">
          <p>Section preview: {section.type}</p>
        </div>
      );
  }
}

export default LivePreview;

/**
 * Storefront Editor
 * Main editor page with full customization capabilities
 * Inspired by Wix/Shopify store builders
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Save,
  Upload,
  Undo2,
  Redo2,
  Plus,
  Settings,
  Palette,
  Layout,
  Search,
  Type,
  Image,
  GripVertical,
  Trash2,
  Copy,
  EyeOff,
  ChevronRight,
  Sparkles,
  Check,
  X,
  ExternalLink,
  Code,
  FileText,
  Globe,
  Home,
  Grid3X3,
  Package,
  ShoppingCart,
  CreditCard,
  Heart,
  User,
  Truck,
  FileStack,
  Info,
  Mail,
  LayoutGrid,
} from 'lucide-react';
import type {
  StorefrontConfig,
  StorefrontSection,
  StorefrontTheme,
  StorefrontEditorState,
  SectionType,
  ThemePreset,
  HeroSection,
  HeroSlide,
  // V2 Types
  PageType,
  StorefrontConfigV2,
  StorefrontEditorStateV2,
  PageSectionType,
  BasePageSection,
} from './types';
import {
  THEME_PRESETS,
  SECTION_TEMPLATES,
  FONT_OPTIONS,
  createDefaultStorefrontConfig,
  // V2 Constants
  PAGE_TYPES,
  PAGE_SECTION_TEMPLATES,
  createFullStorefrontTemplate,
  migrateConfigV1ToV2,
} from './constants';
import { SectionEditor } from './components/SectionEditor';
import { ThemeEditor } from './components/ThemeEditor';
import { LivePreview } from './components/LivePreview';
import { HeaderEditor } from './components/HeaderEditor';
import { FooterEditor } from './components/FooterEditor';
import { SEOEditor } from './components/SEOEditor';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useShopStore } from '@/stores/useShopStore';
import { useTranslation } from 'react-i18next';

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

// Page type icons
const PAGE_ICONS: Record<PageType, React.ReactNode> = {
  landing: <Home className="w-4 h-4" />,
  collection: <Grid3X3 className="w-4 h-4" />,
  collections: <LayoutGrid className="w-4 h-4" />,
  product: <Package className="w-4 h-4" />,
  cart: <ShoppingCart className="w-4 h-4" />,
  checkout: <CreditCard className="w-4 h-4" />,
  wishlist: <Heart className="w-4 h-4" />,
  profile: <User className="w-4 h-4" />,
  trackOrder: <Truck className="w-4 h-4" />,
  about: <Info className="w-4 h-4" />,
  contact: <Mail className="w-4 h-4" />,
  search: <Search className="w-4 h-4" />,
};

// Section type icons (including page-specific sections)
const SECTION_ICONS: Record<string, React.ReactNode> = {
  // Landing page sections
  hero: <Layout className="w-4 h-4" />,
  'featured-products': <Layout className="w-4 h-4" />,
  categories: <Layout className="w-4 h-4" />,
  about: <FileText className="w-4 h-4" />,
  testimonials: <FileText className="w-4 h-4" />,
  newsletter: <FileText className="w-4 h-4" />,
  banner: <Image className="w-4 h-4" />,
  'product-grid': <Layout className="w-4 h-4" />,
  collection: <Layout className="w-4 h-4" />,
  video: <Image className="w-4 h-4" />,
  gallery: <Image className="w-4 h-4" />,
  faq: <FileText className="w-4 h-4" />,
  contact: <FileText className="w-4 h-4" />,
  'custom-html': <Code className="w-4 h-4" />,
  // Collection page sections
  'collection-hero': <Layout className="w-4 h-4" />,
  'collection-filters': <Settings className="w-4 h-4" />,
  'collection-grid': <Grid3X3 className="w-4 h-4" />,
  // Product page sections
  'product-gallery': <Image className="w-4 h-4" />,
  'product-info': <FileText className="w-4 h-4" />,
  'product-tabs': <FileStack className="w-4 h-4" />,
  'product-reviews': <FileText className="w-4 h-4" />,
  'related-products': <Layout className="w-4 h-4" />,
  // Cart page sections
  'cart-items': <ShoppingCart className="w-4 h-4" />,
  'cart-summary': <FileText className="w-4 h-4" />,
  'cart-recommendations': <Layout className="w-4 h-4" />,
  'cart-promo': <FileText className="w-4 h-4" />,
  // Checkout page sections
  'checkout-steps': <Layout className="w-4 h-4" />,
  'checkout-form': <FileText className="w-4 h-4" />,
  'checkout-summary': <FileText className="w-4 h-4" />,
  'checkout-payment': <CreditCard className="w-4 h-4" />,
  // Wishlist page sections
  'wishlist-header': <FileText className="w-4 h-4" />,
  'wishlist-items': <Heart className="w-4 h-4" />,
  'wishlist-share': <FileText className="w-4 h-4" />,
  // Profile page sections
  'profile-sidebar': <Layout className="w-4 h-4" />,
  'profile-info': <User className="w-4 h-4" />,
  'profile-orders': <ShoppingCart className="w-4 h-4" />,
  'profile-addresses': <FileText className="w-4 h-4" />,
  'profile-settings': <Settings className="w-4 h-4" />,
  // Track order sections
  'order-search': <Search className="w-4 h-4" />,
  'order-timeline': <Layout className="w-4 h-4" />,
  'order-details': <FileText className="w-4 h-4" />,
  'order-support': <FileText className="w-4 h-4" />,
};

export const StorefrontEditor: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { shopId } = useParams<{ shopId: string }>();
  const { fetchUserShops } = useShopStore();

  // Current page being edited
  const [currentPage, setCurrentPage] = useState<PageType>('landing');

  // Editor state (V2 with pages support)
  const [editorState, setEditorState] = useState<StorefrontEditorStateV2>(() => {
    // Try to get AI-generated config from session storage
    const savedConfig = sessionStorage.getItem('storefrontConfig');

    let config: StorefrontConfigV2;
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      // Check if it's V1 or V2
      if (parsed.version === 2 && parsed.pages) {
        config = parsed;
      } else {
        // Migrate V1 to V2
        config = migrateConfigV1ToV2(parsed, 'My Store');
      }
    } else {
      config = createFullStorefrontTemplate(shopId || 'default', 'My Store');
    }

    return {
      config,
      currentPage: 'landing',
      selectedSectionId: null,
      activePanel: 'sections',
      previewMode: 'desktop',
      isDirty: false,
      isSaving: false,
      isPublishing: false,
      undoStack: [],
      redoStack: [],
    };
  });

  const [showAddSection, setShowAddSection] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shopData, setShopData] = useState<{
    name: string;
    logo?: string;
    banner?: string;
    description?: string;
    tagline?: string;
  } | null>(null);

  // Get current page sections
  const getCurrentPageSections = useCallback(() => {
    return editorState.config.pages[currentPage]?.sections || [];
  }, [editorState.config.pages, currentPage]);

  // Get current page config
  const getCurrentPageConfig = useCallback(() => {
    return editorState.config.pages[currentPage];
  }, [editorState.config.pages, currentPage]);

  // Load existing storefront config, products, and shop data on mount
  useEffect(() => {
    const loadStorefrontData = async () => {
      try {
        // Fetch products, categories, and shop data in parallel
        const [productsResult, categoriesResult, shopResult] = await Promise.all([
          api.getProducts({ shopId, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => {
            return { data: [], total: 0 };
          }),
          api.getCategories().catch(() => {
            return [];
          }),
          api.getShop(shopId || '').catch(() => null),
        ]);

        // Set products
        if (productsResult?.data) {
          setProducts(productsResult.data);
        }

        // Set categories
        if (categoriesResult && Array.isArray(categoriesResult)) {
          setCategories(categoriesResult);
        }

        // Set shop data
        if (shopResult) {
          setShopData({
            name: shopResult.name || 'My Store',
            logo: shopResult.logo,
            banner: shopResult.banner,
            description: shopResult.description,
            tagline: shopResult.tagline,
          });
        }

        // Check if there's a saved AI-generated config in session storage (from AIPromptPage)
        const savedConfig = sessionStorage.getItem('storefrontConfig');
        if (savedConfig) {
          // Clear session storage after reading
          sessionStorage.removeItem('storefrontConfig');
          sessionStorage.removeItem('storefrontGenerationPrompt');
          setIsLoading(false);
          return;
        }

        // Load existing config from backend
        const result = await api.getStorefrontConfig();
        if (result?.config && Object.keys(result.config).length > 0) {
          // Check if V1 or V2 and migrate if needed
          let loadedConfig: StorefrontConfigV2;
          if (result.config.version === 2 && result.config.pages) {
            loadedConfig = result.config as StorefrontConfigV2;
          } else {
            // Migrate V1 to V2
            loadedConfig = migrateConfigV1ToV2(
              result.config,
              result.shopName || 'My Store'
            );
          }

          setEditorState(prev => ({
            ...prev,
            config: {
              ...loadedConfig,
              shopId: result.shopId,
              shopName: result.shopName,
              published: result.published,
              publishedAt: result.publishedAt,
            },
          }));
        }
      } catch (error) {
        // No existing storefront config, using default
      } finally {
        setIsLoading(false);
      }
    };

    loadStorefrontData();
  }, [shopId]);

  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorState]);

  // Update config with undo support
  const updateConfig = useCallback((updates: Partial<StorefrontConfigV2>) => {
    setEditorState(prev => {
      const updatedConfig: StorefrontConfigV2 = {
        ...prev.config,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        config: updatedConfig,
        isDirty: true,
        undoStack: [...prev.undoStack, prev.config],
        redoStack: [],
      };
    });
  }, []);

  // Update section (page-aware)
  const updateSection = useCallback((sectionId: string, updates: Partial<BasePageSection>) => {
    setEditorState(prev => {
      const currentPageConfig = prev.config.pages[currentPage];
      const updatedSections = currentPageConfig.sections.map(s =>
        s.id === sectionId ? ({ ...s, ...updates }) : s
      );
      const updatedConfig: StorefrontConfigV2 = {
        ...prev.config,
        pages: {
          ...prev.config.pages,
          [currentPage]: {
            ...currentPageConfig,
            sections: updatedSections,
          },
        },
        updatedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        config: updatedConfig,
        isDirty: true,
        undoStack: [...prev.undoStack, prev.config],
        redoStack: [],
      };
    });
  }, [currentPage]);

  // Add section (page-aware)
  const addSection = useCallback((template: { id: string; type: string; name: string; description: string; defaultConfig: Record<string, unknown> }) => {
    const currentPageConfig = editorState.config.pages[currentPage];
    const baseSection = {
      id: `${template.type}-${Date.now()}`,
      type: template.type as PageSectionType,
      enabled: true,
      order: currentPageConfig.sections.length,
    };
    const newSection = { ...baseSection, ...template.defaultConfig };

    setEditorState(prev => {
      const pageConfig = prev.config.pages[currentPage];
      const updatedConfig: StorefrontConfigV2 = {
        ...prev.config,
        pages: {
          ...prev.config.pages,
          [currentPage]: {
            ...pageConfig,
            sections: [...pageConfig.sections, newSection],
          },
        },
        updatedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        config: updatedConfig,
        selectedSectionId: newSection.id,
        isDirty: true,
        undoStack: [...prev.undoStack, prev.config],
        redoStack: [],
      };
    });
    setShowAddSection(false);
  }, [editorState.config.pages, currentPage]);

  // Delete section (page-aware)
  const deleteSection = useCallback((sectionId: string) => {
    setEditorState(prev => {
      const pageConfig = prev.config.pages[currentPage];
      return {
        ...prev,
        config: {
          ...prev.config,
          pages: {
            ...prev.config.pages,
            [currentPage]: {
              ...pageConfig,
              sections: pageConfig.sections.filter(s => s.id !== sectionId),
            },
          },
          updatedAt: new Date().toISOString(),
        },
        selectedSectionId: prev.selectedSectionId === sectionId ? null : prev.selectedSectionId,
        isDirty: true,
        undoStack: [...prev.undoStack, prev.config],
        redoStack: [],
      };
    });
  }, [currentPage]);

  // Duplicate section (page-aware)
  const duplicateSection = useCallback((sectionId: string) => {
    const currentPageConfig = editorState.config.pages[currentPage];
    const section = currentPageConfig.sections.find(s => s.id === sectionId);
    if (!section) return;

    const newSection = {
      ...section,
      id: `${section.type}-${Date.now()}`,
      order: currentPageConfig.sections.length,
    };

    setEditorState(prev => {
      const pageConfig = prev.config.pages[currentPage];
      return {
        ...prev,
        config: {
          ...prev.config,
          pages: {
            ...prev.config.pages,
            [currentPage]: {
              ...pageConfig,
              sections: [...pageConfig.sections, newSection],
            },
          },
          updatedAt: new Date().toISOString(),
        },
        selectedSectionId: newSection.id,
        isDirty: true,
        undoStack: [...prev.undoStack, prev.config],
        redoStack: [],
      };
    });
  }, [editorState.config.pages, currentPage]);

  // Toggle section visibility (page-aware)
  const toggleSectionVisibility = useCallback((sectionId: string) => {
    const currentPageConfig = editorState.config.pages[currentPage];
    updateSection(sectionId, {
      enabled: !currentPageConfig.sections.find(s => s.id === sectionId)?.enabled,
    });
  }, [editorState.config.pages, currentPage, updateSection]);

  // Reorder sections (page-aware)
  const handleReorder = useCallback((newOrder: BasePageSection[]) => {
    const reorderedSections = newOrder.map((section, index) => ({
      ...section,
      order: index,
    }));

    setEditorState(prev => {
      const pageConfig = prev.config.pages[currentPage];
      return {
        ...prev,
        config: {
          ...prev.config,
          pages: {
            ...prev.config.pages,
            [currentPage]: {
              ...pageConfig,
              sections: reorderedSections,
            },
          },
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
        undoStack: [...prev.undoStack, prev.config],
        redoStack: [],
      };
    });
  }, [currentPage]);

  // Handle theme preset selection - add slideshow for bold theme
  const handlePresetSelect = useCallback((preset: ThemePreset) => {
    const lc = preset.layoutConfig;
    const currentConfig = editorState.config;

    // Deep clone pages for modification
    const updatedPages = JSON.parse(JSON.stringify(currentConfig.pages));

    // ============ UPDATE LANDING PAGE SECTIONS ============
    const landingPage = updatedPages.landing;

    // Update Hero Section
    const heroSection = landingPage.sections.find((s: any) => s.type === 'hero');
    if (heroSection) {
      heroSection.variant = lc.hero.variant;
      heroSection.height = lc.hero.height;
      heroSection.textAlignment = lc.hero.textAlignment;
      heroSection.contentPosition = lc.hero.contentPosition;
      heroSection.overlayOpacity = lc.hero.overlayOpacity;

      // Add slides for slideshow variant
      if (lc.hero.variant === 'slideshow') {
        if (!heroSection.slides || heroSection.slides.length === 0) {
          // Check if this is the Playful Fun theme for grocery-specific content
          if (preset.id === 'playful-fun') {
            heroSection.slides = [
              {
                id: `slide-${Date.now()}-1`,
                headline: '🥬 Fresh Vegetables',
                subheadline: 'Farm fresh produce delivered daily - Up to 30% off!',
                ctaText: 'Shop Vegetables',
                ctaLink: '/products?category=vegetables',
                backgroundImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&q=80',
                backgroundGradient: `linear-gradient(135deg, ${preset.theme.primaryColor} 0%, ${preset.theme.secondaryColor} 100%)`,
                overlayOpacity: lc.hero.overlayOpacity,
              },
              {
                id: `slide-${Date.now()}-2`,
                headline: '🍎 Weekly Deals',
                subheadline: 'Save big on fruits, dairy & essentials',
                ctaText: 'View Offers',
                ctaLink: '/products?filter=sale',
                backgroundImage: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=1920&q=80',
                backgroundGradient: `linear-gradient(135deg, ${preset.theme.secondaryColor} 0%, ${preset.theme.accentColor} 100%)`,
                overlayOpacity: lc.hero.overlayOpacity,
              },
              {
                id: `slide-${Date.now()}-3`,
                headline: '🛒 Free Delivery',
                subheadline: 'On orders above $50 - Shop now!',
                ctaText: 'Start Shopping',
                ctaLink: '/products',
                backgroundImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1920&q=80',
                backgroundGradient: `linear-gradient(135deg, ${preset.theme.accentColor} 0%, ${preset.theme.primaryColor} 100%)`,
                overlayOpacity: lc.hero.overlayOpacity,
              },
            ];
            // Faster autoplay for grocery deals
            heroSection.autoplayInterval = 4;
          } else {
            // Default fashion/retail slides
            heroSection.slides = [
              {
                id: `slide-${Date.now()}-1`,
                headline: 'New Arrivals',
                subheadline: 'Discover our latest collection',
                ctaText: 'Shop Now',
                ctaLink: '/products?sort=newest',
                backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
                backgroundGradient: `linear-gradient(135deg, ${preset.theme.primaryColor} 0%, ${preset.theme.secondaryColor} 100%)`,
                overlayOpacity: lc.hero.overlayOpacity,
              },
              {
                id: `slide-${Date.now()}-2`,
                headline: 'Trending Products',
                subheadline: 'See what everyone is loving',
                ctaText: 'Explore',
                ctaLink: '/products?sort=popular',
                backgroundImage: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1920&q=80',
                backgroundGradient: `linear-gradient(135deg, ${preset.theme.secondaryColor} 0%, ${preset.theme.accentColor} 100%)`,
                overlayOpacity: lc.hero.overlayOpacity,
              },
              {
                id: `slide-${Date.now()}-3`,
                headline: 'Exclusive Deals',
                subheadline: 'Limited time offers just for you',
                ctaText: 'View Deals',
                ctaLink: '/products?filter=sale',
                backgroundImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&q=80',
                backgroundGradient: `linear-gradient(135deg, ${preset.theme.accentColor} 0%, ${preset.theme.primaryColor} 100%)`,
                overlayOpacity: lc.hero.overlayOpacity,
              },
            ];
            heroSection.autoplayInterval = 5;
          }
        }
        heroSection.autoplay = true;
      } else {
        // For non-slideshow variants, set appropriate background
        heroSection.slides = undefined;
        heroSection.autoplay = false;

        // Furniture-specific hero content (Professional Clean)
        if (preset.id === 'professional-clean') {
          heroSection.backgroundType = 'image';
          heroSection.backgroundImage = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=80';
          heroSection.headline = 'Timeless Elegance for Your Home';
          heroSection.subheadline = 'Handcrafted furniture designed to inspire and endure for generations';
          heroSection.ctaText = 'Explore Collection';
          heroSection.secondaryCtaText = 'Our Story';
          heroSection.secondaryCtaLink = '/about';
        } else {
          heroSection.backgroundType = 'gradient';
          heroSection.backgroundGradient = `linear-gradient(135deg, ${preset.theme.primaryColor} 0%, ${preset.theme.secondaryColor} 100%)`;
        }
      }
    }

    // Update Featured Products Section
    const featuredSection = landingPage.sections.find((s: any) => s.type === 'featured-products');
    if (featuredSection) {
      featuredSection.variant = lc.featuredProducts.variant;
      featuredSection.columns = lc.featuredProducts.columns;
      featuredSection.showAddToCart = lc.featuredProducts.showAddToCart;
      featuredSection.showRating = lc.featuredProducts.showRating;
      // Theme-specific titles
      if (preset.id === 'playful-fun') {
        featuredSection.title = '🔥 Daily Deals';
        featuredSection.subtitle = 'Fresh products at the best prices';
      } else if (preset.id === 'professional-clean') {
        featuredSection.title = 'Curated Collections';
        featuredSection.subtitle = 'Discover pieces that define modern living';
      }
    }

    // Update Categories Section
    const categoriesSection = landingPage.sections.find((s: any) => s.type === 'categories');
    if (categoriesSection) {
      categoriesSection.variant = lc.categories.variant;
      categoriesSection.columns = lc.categories.columns;
      // Theme-specific titles
      if (preset.id === 'playful-fun') {
        categoriesSection.title = '🛒 Shop by Category';
        categoriesSection.subtitle = 'Find what you need quickly';
      } else if (preset.id === 'professional-clean') {
        categoriesSection.title = 'Shop by Room';
        categoriesSection.subtitle = 'Find the perfect piece for every space';
      }
    }

    // Update Testimonials Section
    const testimonialsSection = landingPage.sections.find((s: any) => s.type === 'testimonials');
    if (testimonialsSection) {
      testimonialsSection.variant = lc.testimonials.variant;
      testimonialsSection.enabled = lc.defaultSections.showTestimonials;
    }

    // Update Newsletter Section
    const newsletterSection = landingPage.sections.find((s: any) => s.type === 'newsletter');
    if (newsletterSection) {
      newsletterSection.variant = lc.newsletter.variant;
      newsletterSection.enabled = lc.defaultSections.showNewsletter;
    }

    // Update About Section
    const aboutSection = landingPage.sections.find((s: any) => s.type === 'about');
    if (aboutSection) {
      aboutSection.enabled = lc.defaultSections.showAbout;
      // Furniture-specific about content (Professional Clean)
      if (preset.id === 'professional-clean') {
        aboutSection.title = 'Crafted with Passion';
        aboutSection.content = 'For over two decades, we have been crafting furniture that combines timeless design with exceptional quality. Each piece is thoughtfully created by skilled artisans using sustainably sourced materials.';
        aboutSection.variant = 'split';
        aboutSection.image = 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80';
        aboutSection.stats = [
          { label: 'Years of Craftsmanship', value: '25+' },
          { label: 'Happy Homes', value: '10,000+' },
          { label: 'Artisan Partners', value: '50+' },
        ];
      }
    }

    // ============ UPDATE COLLECTION PAGE ============
    const collectionPage = updatedPages.collection;
    collectionPage.filterPosition = lc.collection.filterPosition;

    const collectionGrid = collectionPage.sections?.find((s: any) => s.type === 'collection-grid');
    if (collectionGrid) {
      collectionGrid.productCardStyle = lc.collection.productCardStyle;
      collectionGrid.columns = lc.collection.columns;
      collectionGrid.gap = lc.collection.gap;
    }

    const collectionFilters = collectionPage.sections?.find((s: any) => s.type === 'collection-filters');
    if (collectionFilters) {
      collectionFilters.position = lc.collection.filterPosition;
    }

    // ============ UPDATE PRODUCT PAGE ============
    const productPage = updatedPages.product;
    productPage.galleryPosition = lc.product.galleryPosition;
    productPage.tabsLayout = lc.product.tabsLayout;

    const productGallery = productPage.sections?.find((s: any) => s.type === 'product-gallery');
    if (productGallery) {
      productGallery.layout = lc.product.galleryLayout;
    }

    const productTabs = productPage.sections?.find((s: any) => s.type === 'product-tabs');
    if (productTabs) {
      productTabs.layout = lc.product.tabsLayout;
    }

    // ============ UPDATE CART PAGE ============
    const cartPage = updatedPages.cart;
    cartPage.cartLayout = lc.cart.layout;

    const cartItems = cartPage.sections?.find((s: any) => s.type === 'cart-items');
    if (cartItems) {
      cartItems.layout = lc.cart.itemsLayout;
    }

    // ============ UPDATE CHECKOUT PAGE ============
    const checkoutPage = updatedPages.checkout;
    checkoutPage.style = lc.checkout.style;

    const checkoutForm = checkoutPage.sections?.find((s: any) => s.type === 'checkout-form');
    if (checkoutForm) {
      checkoutForm.layout = lc.checkout.formLayout;
    }

    // ============ UPDATE HEADER ============
    const updatedHeader = {
      ...currentConfig.header,
      variant: lc.header.variant,
      sticky: lc.header.sticky,
      transparent: lc.header.transparent,
      announcementBar: {
        ...currentConfig.header.announcementBar,
        enabled: lc.header.showAnnouncementBar,
      },
    };

    // ============ UPDATE FOOTER ============
    const updatedFooter = {
      ...currentConfig.footer,
      variant: lc.footer.variant,
      showNewsletter: lc.footer.showNewsletter,
      showSocial: lc.footer.showSocial,
      showPaymentIcons: lc.footer.showPaymentIcons,
    };

    // Apply all updates
    setEditorState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        pages: updatedPages,
        header: updatedHeader,
        footer: updatedFooter,
        updatedAt: new Date().toISOString(),
      },
      isDirty: true,
      undoStack: [...prev.undoStack, prev.config],
      redoStack: [],
    }));

    toast.success(`${preset.name} layout applied! Hero: ${lc.hero.variant}, Products: ${lc.featuredProducts.variant}`);
  }, [editorState.config]);

  // Undo/Redo
  const handleUndo = useCallback(() => {
    if (editorState.undoStack.length === 0) return;

    setEditorState(prev => {
      const previousConfig = prev.undoStack[prev.undoStack.length - 1];
      return {
        ...prev,
        config: previousConfig,
        undoStack: prev.undoStack.slice(0, -1),
        redoStack: [...prev.redoStack, prev.config],
        isDirty: true,
      };
    });
  }, [editorState.undoStack.length]);

  const handleRedo = useCallback(() => {
    if (editorState.redoStack.length === 0) return;

    setEditorState(prev => {
      const nextConfig = prev.redoStack[prev.redoStack.length - 1];
      return {
        ...prev,
        config: nextConfig,
        undoStack: [...prev.undoStack, prev.config],
        redoStack: prev.redoStack.slice(0, -1),
        isDirty: true,
      };
    });
  }, [editorState.redoStack.length]);

  // Save
  const handleSave = async () => {
    setEditorState(prev => ({ ...prev, isSaving: true }));

    try {
      // Call API to save storefront config
      await api.saveStorefrontConfig(editorState.config);

      setEditorState(prev => ({
        ...prev,
        isDirty: false,
        isSaving: false,
      }));

      toast.success('Storefront saved successfully');
    } catch (error: any) {
      console.error('Failed to save storefront:', error);
      toast.error(error?.response?.data?.message || 'Failed to save storefront');
      setEditorState(prev => ({ ...prev, isSaving: false }));
    }
  };

  // Publish
  const handlePublish = async () => {
    setEditorState(prev => ({ ...prev, isPublishing: true }));

    try {
      // First save the config
      await api.saveStorefrontConfig(editorState.config);

      // Then publish the storefront
      const result = await api.publishStorefront();

      setEditorState(prev => ({
        ...prev,
        config: {
          ...prev.config,
          published: true,
          publishedAt: result.publishedAt || new Date().toISOString(),
        },
        isDirty: false,
        isPublishing: false,
      }));

      // Refresh shop list to update dropdown in vendor panel
      await fetchUserShops();

      setShowPublishSuccess(true);
      setTimeout(() => setShowPublishSuccess(false), 3000);

      toast.success('Storefront published successfully!');
    } catch (error: any) {
      console.error('Failed to publish storefront:', error);
      toast.error(error?.response?.data?.message || 'Failed to publish storefront');
      setEditorState(prev => ({ ...prev, isPublishing: false }));
    }
  };

  // Get selected section (page-aware)
  const selectedSection = editorState.selectedSectionId
    ? getCurrentPageSections().find(s => s.id === editorState.selectedSectionId)
    : null;

  // Get current page section templates
  const currentPageTemplates = PAGE_SECTION_TEMPLATES[currentPage] || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-lime border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">{t('vendor.storefrontBuilder.loadingStorefront', { defaultValue: 'Loading storefront...' })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/shop/${shopId}/vendor/dashboard`)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">{t('vendor.storefrontBuilder.backToDashboard', { defaultValue: 'Back to Dashboard' })}</span>
          </button>

          <div className="h-6 w-px bg-slate-200" />

          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={editorState.undoStack.length === 0}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Undo (Cmd+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={editorState.redoStack.length === 0}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Redo (Cmd+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setEditorState(prev => ({ ...prev, previewMode: mode }))}
              className={`p-2 rounded-lg transition-colors ${
                editorState.previewMode === mode
                  ? 'bg-primary-lime text-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {mode === 'desktop' && <Monitor className="w-4 h-4" />}
              {mode === 'tablet' && <Tablet className="w-4 h-4" />}
              {mode === 'mobile' && <Smartphone className="w-4 h-4" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">{t('vendor.storefrontBuilder.preview', { defaultValue: 'Preview' })}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!editorState.isDirty || editorState.isSaving}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span className="text-sm">{editorState.isSaving ? t('vendor.storefrontBuilder.saving', { defaultValue: 'Saving...' }) : t('vendor.storefrontBuilder.save', { defaultValue: 'Save' })}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={editorState.isPublishing}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-primary-lime to-emerald-500 text-white hover:from-primary-lime/90 hover:to-emerald-500/90 disabled:opacity-60 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">
              {editorState.isPublishing ? t('vendor.storefrontBuilder.publishing', { defaultValue: 'Publishing...' }) : t('vendor.storefrontBuilder.publish', { defaultValue: 'Publish' })}
            </span>
          </button>
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Sections Panel */}
        <aside className="w-72 border-r border-slate-200 bg-white flex flex-col">
          {/* Panel Tabs */}
          <div className="flex border-b border-slate-200">
            {[
              { id: 'sections', icon: Layout, label: t('vendor.storefrontBuilder.sections', { defaultValue: 'Sections' }) },
              { id: 'theme', icon: Palette, label: t('vendor.storefrontBuilder.theme', { defaultValue: 'Theme' }) },
              { id: 'settings', icon: Settings, label: t('vendor.storefrontBuilder.settings', { defaultValue: 'Settings' }) },
              { id: 'seo', icon: Globe, label: t('vendor.storefrontBuilder.seo', { defaultValue: 'SEO' }) },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setEditorState(prev => ({
                  ...prev,
                  activePanel: tab.id as StorefrontEditorState['activePanel'],
                  selectedSectionId: tab.id !== 'sections' ? null : prev.selectedSectionId,
                }))}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                  editorState.activePanel === tab.id
                    ? 'text-primary-lime border-b-2 border-primary-lime -mb-px'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {editorState.activePanel === 'sections' && (
                <motion.div
                  key="sections"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4"
                >
                  {/* Page Selector */}
                  <div className="mb-4">
                    <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{t('vendor.storefrontBuilder.pages', { defaultValue: 'Pages' })}</h3>
                    <div className="grid grid-cols-4 gap-1">
                      {(Object.keys(PAGE_TYPES) as PageType[]).map((pageType) => {
                        const pageInfo = PAGE_TYPES[pageType];
                        return (
                          <button
                            key={pageType}
                            onClick={() => {
                              setCurrentPage(pageType);
                              setEditorState(prev => ({ ...prev, selectedSectionId: null }));
                            }}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                              currentPage === pageType
                                ? 'bg-primary-lime text-white'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                            }`}
                            title={pageInfo.name}
                          >
                            {PAGE_ICONS[pageType]}
                            <span className="text-[10px] truncate w-full text-center">
                              {pageInfo.name.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Header Section */}
                  <div className="mb-4">
                    <button
                      onClick={() => setEditorState(prev => ({
                        ...prev,
                        selectedSectionId: 'header',
                      }))}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        editorState.selectedSectionId === 'header'
                          ? 'border-primary-lime bg-primary-lime/10'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <Layout className="w-5 h-5 text-primary-lime" />
                      <span className="font-medium text-slate-700">{t('vendor.storefrontBuilder.header', { defaultValue: 'Header' })}</span>
                      <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
                    </button>
                  </div>

                  {/* Sections List */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-slate-600">
                        {PAGE_TYPES[currentPage]?.name || t('vendor.storefrontBuilder.page', { defaultValue: 'Page' })} {t('vendor.storefrontBuilder.sections', { defaultValue: 'Sections' })}
                      </h3>
                      <button
                        onClick={() => setShowAddSection(true)}
                        className="p-1.5 rounded-lg bg-primary-lime hover:bg-primary-lime/90 text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <Reorder.Group
                      axis="y"
                      values={getCurrentPageSections()}
                      onReorder={handleReorder}
                      className="space-y-2"
                    >
                      {getCurrentPageSections().map((section) => (
                        <Reorder.Item
                          key={section.id}
                          value={section}
                          className={`group flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                            editorState.selectedSectionId === section.id
                              ? 'border-primary-lime bg-primary-lime/10'
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                          } ${!section.enabled ? 'opacity-50' : ''}`}
                          onClick={() => setEditorState(prev => ({
                            ...prev,
                            selectedSectionId: section.id,
                          }))}
                        >
                          <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                          {SECTION_ICONS[section.type] || <Layout className="w-4 h-4" />}
                          <span className="flex-1 text-sm truncate capitalize text-slate-700">
                            {section.type.replace(/-/g, ' ')}
                          </span>

                          <div className="hidden group-hover:flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSectionVisibility(section.id);
                              }}
                              className="p-1 rounded hover:bg-slate-200 transition-colors"
                              title={section.enabled ? 'Hide section' : 'Show section'}
                            >
                              {section.enabled ? (
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateSection(section.id);
                              }}
                              className="p-1 rounded hover:bg-slate-200 transition-colors"
                              title="Duplicate section"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSection(section.id);
                              }}
                              className="p-1 rounded hover:bg-red-100 transition-colors"
                              title="Delete section"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>

                    {getCurrentPageSections().length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        <Layout className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">{t('vendor.storefrontBuilder.noSectionsYet', { defaultValue: 'No sections yet' })}</p>
                        <button
                          onClick={() => setShowAddSection(true)}
                          className="mt-2 text-sm text-primary-lime hover:text-primary-lime/80"
                        >
                          {t('vendor.storefrontBuilder.addFirstSection', { defaultValue: 'Add your first section' })}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer Section */}
                  <div>
                    <button
                      onClick={() => setEditorState(prev => ({
                        ...prev,
                        selectedSectionId: 'footer',
                      }))}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        editorState.selectedSectionId === 'footer'
                          ? 'border-primary-lime bg-primary-lime/10'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <Layout className="w-5 h-5 text-primary-lime" />
                      <span className="font-medium text-slate-700">{t('vendor.storefrontBuilder.footer', { defaultValue: 'Footer' })}</span>
                      <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
                    </button>
                  </div>
                </motion.div>
              )}

              {editorState.activePanel === 'theme' && (
                <motion.div
                  key="theme"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <ThemeEditor
                    theme={editorState.config.theme}
                    onChange={(theme) => updateConfig({ theme })}
                    onPresetSelect={handlePresetSelect}
                  />
                </motion.div>
              )}

              {editorState.activePanel === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 space-y-4"
                >
                  <div>
                    <h3 className="text-sm font-medium text-slate-600 mb-3">{t('vendor.storefrontBuilder.generalSettings', { defaultValue: 'General Settings' })}</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-slate-500 mb-1.5">{t('vendor.storefrontBuilder.customCss', { defaultValue: 'Custom CSS' })}</label>
                        <textarea
                          value={editorState.config.customCss || ''}
                          onChange={(e) => updateConfig({ customCss: e.target.value })}
                          placeholder=".my-class { ... }"
                          className="w-full h-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 resize-none focus:outline-none focus:border-primary-lime"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-500 mb-1.5">{t('vendor.storefrontBuilder.customJavascript', { defaultValue: 'Custom JavaScript' })}</label>
                        <textarea
                          value={editorState.config.customJs || ''}
                          onChange={(e) => updateConfig({ customJs: e.target.value })}
                          placeholder="console.log('Hello');"
                          className="w-full h-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 resize-none focus:outline-none focus:border-primary-lime"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {editorState.activePanel === 'seo' && (
                <motion.div
                  key="seo"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SEOEditor
                    seo={editorState.config.seo}
                    onChange={(seo) => updateConfig({ seo })}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* Center - Live Preview Canvas */}
        <main className="flex-1 bg-slate-200 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto p-4">
            <div
              className={`mx-auto bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 ${
                editorState.previewMode === 'desktop'
                  ? 'w-full max-w-6xl'
                  : editorState.previewMode === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[375px]'
              }`}
              style={{ minHeight: '80vh' }}
            >
              <LivePreview
                config={editorState.config}
                currentPage={currentPage}
                selectedSectionId={editorState.selectedSectionId}
                onSelectSection={(id) => setEditorState(prev => ({
                  ...prev,
                  selectedSectionId: id,
                  activePanel: 'sections',
                }))}
                previewMode={editorState.previewMode}
                products={products}
                categories={categories}
                shopData={shopData}
                onNavigate={setCurrentPage}
              />
            </div>
          </div>
        </main>

        {/* Right Sidebar - Properties Panel */}
        <AnimatePresence>
          {(selectedSection || editorState.selectedSectionId === 'header' || editorState.selectedSectionId === 'footer') && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-slate-200 bg-white overflow-hidden"
            >
              <div className="w-80 h-full overflow-y-auto">
                {editorState.selectedSectionId === 'header' && (
                  <HeaderEditor
                    header={editorState.config.header}
                    onChange={(header) => updateConfig({ header })}
                    onClose={() => setEditorState(prev => ({ ...prev, selectedSectionId: null }))}
                  />
                )}
                {editorState.selectedSectionId === 'footer' && (
                  <FooterEditor
                    footer={editorState.config.footer}
                    onChange={(footer) => updateConfig({ footer })}
                    onClose={() => setEditorState(prev => ({ ...prev, selectedSectionId: null }))}
                  />
                )}
                {selectedSection && (
                  <SectionEditor
                    section={selectedSection}
                    theme={editorState.config.theme}
                    onChange={(updates) => updateSection(selectedSection.id, updates)}
                    onClose={() => setEditorState(prev => ({ ...prev, selectedSectionId: null }))}
                  />
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Add Section Modal */}
      <AnimatePresence>
        {showAddSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAddSection(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{t('vendor.storefrontBuilder.addSection', { defaultValue: 'Add Section' })}</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {t('vendor.storefrontBuilder.addingTo', { defaultValue: 'Adding to' })} {PAGE_TYPES[currentPage]?.name || t('vendor.storefrontBuilder.page', { defaultValue: 'Page' })}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddSection(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {currentPageTemplates.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {currentPageTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => addSection(template)}
                        className="group p-4 rounded-xl border border-slate-200 hover:border-primary-lime bg-slate-50 hover:bg-primary-lime/10 transition-all text-left"
                      >
                        <div className="flex items-center gap-3 mb-2 text-slate-700">
                          {SECTION_ICONS[template.type] || <Layout className="w-4 h-4" />}
                          <span className="font-medium">{template.name}</span>
                        </div>
                        <p className="text-sm text-slate-500">{template.description}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Layout className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>{t('vendor.storefrontBuilder.noTemplatesAvailable', { defaultValue: 'No section templates available for this page' })}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span>{t('vendor.storefrontBuilder.closePreview', { defaultValue: 'Close Preview' })}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/store/${editorState.config.shopId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t('vendor.storefrontBuilder.openInNewTab', { defaultValue: 'Open in new tab' })}
                </a>
              </div>
            </div>

            <div className="h-[calc(100vh-3.5rem)] overflow-auto bg-white">
              <LivePreview
                config={editorState.config}
                currentPage={currentPage}
                selectedSectionId={null}
                onSelectSection={() => {}}
                previewMode="desktop"
                isFullPreview
                products={products}
                categories={categories}
                shopData={shopData}
                onNavigate={setCurrentPage}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Publish Success Toast */}
      <AnimatePresence>
        {showPublishSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-3 px-6 py-4 bg-green-500 rounded-xl shadow-xl text-white">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">{t('vendor.storefrontBuilder.storePublished', { defaultValue: 'Store Published!' })}</p>
                <p className="text-sm text-green-100">{t('vendor.storefrontBuilder.storefrontIsLive', { defaultValue: 'Your storefront is now live' })}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StorefrontEditor;

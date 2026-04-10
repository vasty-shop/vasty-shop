'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Loader2 } from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { toast } from 'sonner';

// Layout Components
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Landing Sections
import { HeroSection } from '@/components/landing/HeroSection';
import CategoryBrowseSection from '@/components/landing/CategoryBrowseSection';
import { FeaturedProductsCarousel } from '@/components/landing/FeaturedProductsCarousel';
import {
  HorizontalPromoBanners,
  LargeFeatureBanners,
  CategoryIconsRow,
} from '@/components/landing/PromoBanners';
import { FlashSaleSection } from '@/components/landing/FlashSaleSection';
import BestSellersSection from '@/components/landing/BestSellersSection';
import BlogSection from '@/components/landing/BlogSection';
import { SellOnVastySection } from '@/components/landing/SellOnVastySection';

// Product Grid Components
import {
  PopularProductsGrid,
  TodaysForYouGrid,
} from '@/components/products/ProductGrid';

// API
import { api } from '@/lib/api';

// Types
import type { Product } from '@/types';

/**
 * LandingPage Component
 *
 * A comprehensive landing page that assembles all sections in the correct order:
 * 1. Header (sticky navigation)
 * 2. HeroSection (main banner with categories)
 * 3. CategoryBrowseSection (browse by categories)
 * 4. PopularProductsGrid (popular products)
 * 5. FeaturedProductsCarousel (featured products carousel)
 * 6. HorizontalPromoBanners (3-card promo banners)
 * 7. FlashSaleSection (flash sale with countdown)
 * 8. LargeFeatureBanners (winter collection & mega sale)
 * 9. BestSellersSection (best selling stores)
 * 10. CategoryIconsRow (category icons navigation)
 * 11. TodaysForYouGrid (personalized recommendations)
 * 12. BlogSection (blog updates)
 * 13. Footer (site footer)
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const { addItem: addToCart } = useCartStore();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();

  // State for products
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [todaysForYouProducts, setTodaysForYouProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Wishlist state (for components that expect Set<string>)
  const [wishlistedProducts, setWishlistedProducts] = useState<Set<string>>(
    new Set()
  );

  // Scroll to top button state
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        // Fetch featured products
        const featured = await api.getFeaturedProducts(8);
        const transformedFeatured = featured.map((product: any) => ({
          id: product.id || product._id,
          name: product.name,
          brand: product.brand || 'Unknown',
          price: product.price,
          salePrice: product.salePrice || product.sale_price,
          discountPercent: product.discountPercent || product.discount_percent,
          rating: product.rating || 0,
          category: product.category,
          description: product.description || '',
          images: product.images || [],
          sizes: product.sizes || [],
          colors: product.colors || [],
        }));
        setFeaturedProducts(transformedFeatured);

        // Fetch popular products (using getProducts with limit)
        const popularResponse = await api.getProducts({ limit: 12 });
        const transformedPopular = popularResponse.data.map((product: any) => ({
          id: product.id || product._id,
          name: product.name,
          brand: product.brand || 'Unknown',
          price: product.price,
          salePrice: product.salePrice || product.sale_price,
          discountPercent: product.discountPercent || product.discount_percent,
          rating: product.rating || 0,
          category: product.category,
          description: product.description || '',
          images: product.images || [],
          sizes: product.sizes || [],
          colors: product.colors || [],
        }));
        setPopularProducts(transformedPopular);

        // Use same for "Today's for you" (in real app, this would be personalized)
        setTodaysForYouProducts(transformedPopular.slice(0, 8));
      } catch (error) {
        console.error('Error fetching products:', error);
        // Set empty arrays on error
        setFeaturedProducts([]);
        setPopularProducts([]);
        setTodaysForYouProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle scroll events for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Product interaction handlers
  const handleWishlistToggle = (productId: string) => {
    // Find the product to get full data
    const product = [...popularProducts, ...todaysForYouProducts, ...featuredProducts].find(p => p.id === productId);
    if (product) {
      toggleWishlist(product);
    }
    // Update local state for UI
    setWishlistedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleAddToCart = (product: Product) => {
    // Use default size 'M' if sizes array is empty, otherwise use first size
    const defaultSize = (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M') as import('@/types').Size;
    // Colors are string array according to Product type
    const defaultColor = product.colors?.[0];
    addToCart(product, defaultSize, defaultColor);
    toast.success(`${product.name} added to cart`);
  };

  const handleProductClick = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

  const handleQuickView = (product: Product) => {
    // Navigate to product detail page for quick view
    navigate(`/products/${product.id}`);
  };

  const handleSeeAll = (section: string) => {
    // Navigate based on section type
    switch (section) {
      case 'popular':
        navigate('/products?sort=popular');
        break;
      case 'featured':
        navigate('/products?featured=true');
        break;
      case 'todays-for-you':
        navigate('/products?recommended=true');
        break;
      default:
        navigate('/products');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Enable smooth scrolling */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Header - Sticky Navigation */}
      <Header />

      {/* Main Content */}
      <main className="w-full">
        {/* 1. Hero Section */}
        <section className="w-full">
          <HeroSection />
        </section>

        {/* 2. Category Browse Section */}
        <section className="w-full py-8 md:py-12">
          <CategoryBrowseSection />
        </section>

        {/* 2.5 Sell on Vasty Section */}
        <SellOnVastySection />

        {/* Loading State for Products */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary-lime" />
          </div>
        )}

        {/* 3. Popular Products Grid */}
        {!isLoading && popularProducts.length > 0 && (
          <section className="w-full py-8 md:py-12 px-4 md:px-6 max-w-7xl mx-auto">
            <PopularProductsGrid
              products={popularProducts}
              onWishlistToggle={handleWishlistToggle}
              onAddToCart={handleAddToCart}
              onProductClick={handleProductClick}
              wishlistedProducts={Array.from(wishlistedProducts)}
              onSeeAllClick={() => handleSeeAll('popular')}
            />
          </section>
        )}

        {/* 4. Featured Products Carousel */}
        <section className="w-full py-8 md:py-12">
          <FeaturedProductsCarousel
            onWishlistToggle={handleWishlistToggle}
            onAddToCart={handleAddToCart}
            onQuickView={handleQuickView}
            onSeeAll={() => handleSeeAll('featured')}
            wishlistedProducts={wishlistedProducts}
          />
        </section>

        {/* 5. Horizontal Promo Banners (3 Cards) */}
        <section className="w-full py-8 md:py-12">
          <HorizontalPromoBanners />
        </section>

        {/* 6. Flash Sale Section */}
        <section className="w-full py-8 md:py-16">
          <FlashSaleSection />
        </section>

        {/* 7. Large Feature Banners (Winter Collection & Mega Sale) */}
        <section className="w-full py-8 md:py-12">
          <LargeFeatureBanners />
        </section>

        {/* 8. Best Sellers Section */}
        <section className="w-full py-8 md:py-16">
          <BestSellersSection />
        </section>

        {/* 9. Category Icons Row */}
        <section className="w-full py-8 md:py-12">
          <CategoryIconsRow />
        </section>

        {/* 10. Today's For You Grid */}
        <section className="w-full py-8 md:py-12 px-4 md:px-6 max-w-7xl mx-auto">
          <TodaysForYouGrid
            products={todaysForYouProducts}
            onWishlistToggle={handleWishlistToggle}
            onAddToCart={handleAddToCart}
            onProductClick={handleProductClick}
            wishlistedProducts={Array.from(wishlistedProducts)}
            onSeeAllClick={() => handleSeeAll('todays-for-you')}
          />
        </section>

        {/* 11. Blog Section */}
        <section className="w-full py-8 md:py-16">
          <BlogSection />
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Fixed App Store Buttons - Right Center */}
      <div
        className="flex flex-col gap-3"
        style={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 9999
        }}
      >
        {/* Google Play Button */}
        <a
          href="#"
          className="flex items-center gap-2 bg-black hover:bg-gray-800 rounded-l-xl px-4 py-3 transition-all shadow-xl hover:shadow-2xl"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white flex-shrink-0" fill="currentColor">
            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
          </svg>
          <div className="text-left">
            <div className="text-[9px] text-gray-400 leading-none uppercase tracking-wide">GET IT ON</div>
            <div className="text-sm text-white font-semibold leading-tight">Google Play</div>
          </div>
        </a>

        {/* App Store Button */}
        <a
          href="#"
          className="flex items-center gap-2 bg-black hover:bg-gray-800 rounded-l-xl px-4 py-3 transition-all shadow-xl hover:shadow-2xl"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white flex-shrink-0" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <div className="text-left">
            <div className="text-[9px] text-gray-400 leading-none">Download on the</div>
            <div className="text-sm text-white font-semibold leading-tight">App Store</div>
            <div className="text-[10px] text-primary-lime font-medium">Coming Soon</div>
          </div>
        </a>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 md:w-14 md:h-14 bg-primary-lime hover:bg-primary-lime-dark text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-6 h-6 md:w-7 md:h-7 group-hover:-translate-y-1 transition-transform duration-200" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

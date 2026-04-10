import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Clock,
  Percent,
  Zap,
  Gift,
  Star,
  ShoppingCart,
  Heart,
  ArrowRight,
  Tag,
  Flame,
  Sparkles,
  Package,
  Bell,
  Smartphone,
  X,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

// Types
interface Deal {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  endTime?: Date;
  badge?: string;
  icon: React.ElementType;
  color: string;
  image: string;
}

interface CountdownTimerProps {
  endTime: Date;
}

interface OfferProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onWishlistToggle: (productId: string) => void;
  isWishlisted: boolean;
}

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

// Countdown Timer Component
const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4" />
      <div className="flex items-center gap-1">
        <span className="bg-white/20 backdrop-blur-sm rounded px-2 py-1 text-sm font-bold min-w-[32px] text-center">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="font-bold">:</span>
        <span className="bg-white/20 backdrop-blur-sm rounded px-2 py-1 text-sm font-bold min-w-[32px] text-center">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="font-bold">:</span>
        <span className="bg-white/20 backdrop-blur-sm rounded px-2 py-1 text-sm font-bold min-w-[32px] text-center">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

// Filter Button Component
const FilterButton: React.FC<FilterButtonProps> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'px-4 py-2 rounded-full border-2 transition-all duration-300 font-medium whitespace-nowrap',
      active
        ? 'border-primary-lime bg-primary-lime text-white shadow-lg'
        : 'border-gray-300 bg-white text-text-secondary hover:border-primary-lime hover:text-primary-lime'
    )}
  >
    {label}
  </button>
);

// Offer Product Card Component
const OfferProductCard: React.FC<OfferProductCardProps> = ({
  product,
  onAddToCart,
  onWishlistToggle,
  isWishlisted,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const discount = product.discountPercent || 0;
  const displayPrice = product.salePrice || product.price;
  const isOnSale = !!product.salePrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="group relative overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <Link to={`/products/${product.id}`}>
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </Link>

          {/* Discount Badge */}
          {isOnSale && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-primary-lime text-white font-bold text-sm px-3 py-1 shadow-lg">
                -{discount}%
              </Badge>
            </div>
          )}

          {/* Out of Stock Badge */}
          {Math.random() > 0.9 && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-red-500 text-white font-bold text-sm px-3 py-1 shadow-lg">
                Out of Stock
              </Badge>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={() => onWishlistToggle(product.id)}
            className="absolute top-3 right-3 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
          >
            <Heart
              className={cn(
                'w-5 h-5 transition-all duration-300',
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
              )}
            />
          </button>

          {/* Quick Add to Cart - Shows on Hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-3 left-3 right-3 z-10"
              >
                <Button
                  onClick={() => onAddToCart(product)}
                  className="w-full bg-primary-lime text-white hover:bg-primary-lime-dark shadow-xl"
                  size="sm"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Limited Time Offer Timer */}
          {Math.random() > 0.7 && isOnSale && (
            <div className="absolute bottom-3 left-3 right-3 z-10 bg-red-500 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold">
              <Flame className="w-4 h-4" />
              Ends in 2h 34m
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="mb-2">
            <p className="text-xs text-text-secondary font-medium mb-1">{product.brand}</p>
            <Link to={`/products/${product.id}`}>
              <h3 className="text-sm font-bold text-text-primary line-clamp-2 hover:text-primary-lime transition-colors">
                {product.name}
              </h3>
            </Link>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-text-primary">{product.rating}</span>
            <span className="text-xs text-text-secondary">({Math.floor(Math.random() * 500 + 50)})</span>
          </div>

          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2">
              {isOnSale && (
                <span className="text-lg font-bold text-primary-lime">
                  ${displayPrice.toFixed(2)}
                </span>
              )}
              <span
                className={cn(
                  'font-semibold',
                  isOnSale ? 'text-sm text-gray-400 line-through' : 'text-lg text-text-primary'
                )}
              >
                ${product.price.toFixed(2)}
              </span>
            </div>
            {isOnSale && (
              <p className="text-xs text-green-600 font-semibold mt-1">
                Save ${(product.price - displayPrice).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Featured Deal Card Component
const FeaturedDealCard: React.FC<{ deal: Deal; delay: number }> = ({ deal, delay }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const Icon = deal.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
    >
      <Card
        className="relative overflow-hidden h-full group cursor-pointer hover:shadow-2xl transition-all duration-500"
        style={{ background: `linear-gradient(135deg, ${deal.color}20 0%, ${deal.color}40 100%)` }}
      >
        <div className="relative h-full p-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${deal.color.replace('#', '')}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          {/* Badge */}
          {deal.badge && (
            <div className="mb-4">
              <Badge className="bg-white text-text-primary font-bold shadow-md">
                {deal.badge}
              </Badge>
            </div>
          )}

          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: deal.color }}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>

          {/* Content */}
          <h3 className="text-2xl font-bold text-text-primary mb-2">{deal.title}</h3>
          <p className="text-text-secondary mb-4">{deal.subtitle}</p>

          {/* Discount */}
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-5xl font-bold text-text-primary">{deal.discount}</span>
            <span className="text-2xl text-text-secondary">OFF</span>
          </div>

          {/* Timer */}
          {deal.endTime && (
            <div className="mb-6">
              <CountdownTimer endTime={deal.endTime} />
            </div>
          )}

          {/* CTA Button */}
          <Button
            className="group/btn"
            style={{ backgroundColor: deal.color }}
          >
            Shop Now
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Background Image */}
        <div className="absolute right-0 bottom-0 w-1/2 h-1/2 opacity-20">
          <img
            src={deal.image}
            alt={deal.title}
            className="w-full h-full object-cover"
          />
        </div>
      </Card>
    </motion.div>
  );
};

export const OffersPage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDiscount, setSelectedDiscount] = useState('All');
  const [sortBy, setSortBy] = useState<'ending-soon' | 'biggest-discount' | 'newest'>('ending-soon');
  const [wishlistedProducts, setWishlistedProducts] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [offers, setOffers] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch offers and sale products from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch active offers and products in parallel
        const [offersResponse, productsResponse] = await Promise.all([
          api.getActiveOffers().catch(() => []),
          api.getProducts({ limit: 100 }).catch(() => ({ data: [], total: 0 })),
        ]);

        // Set offers
        setOffers(Array.isArray(offersResponse) ? offersResponse : ((offersResponse as any)?.data || []));

        // Extract and filter products with sale prices
        const allProducts = Array.isArray(productsResponse)
          ? productsResponse
          : productsResponse?.data || [];

        const saleProducts = allProducts.filter((p: any) => p.salePrice);
        setProducts(saleProducts);
      } catch (err: any) {
        console.error('Failed to fetch offers:', err);
        setError('Failed to load offers');
        toast.error('Failed to load offers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Featured Deals Data
  const featuredDeals: Deal[] = [
    {
      id: 'flash-sale',
      title: 'Flash Sale',
      subtitle: 'Limited time mega deals on top products',
      discount: '60%',
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      badge: 'LIVE NOW',
      icon: Zap,
      color: '#FF6B6B',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
    },
    {
      id: 'summer-sale',
      title: 'Summer Sale',
      subtitle: 'Refresh your wardrobe with summer essentials',
      discount: '50%',
      icon: Sparkles,
      color: '#FFA500',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
    },
    {
      id: 'clearance',
      title: 'Clearance Sale',
      subtitle: 'Last chance to grab these amazing deals',
      discount: '70%',
      badge: 'FINAL CALL',
      icon: Tag,
      color: '#9C27B0',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    },
    {
      id: 'new-user',
      title: 'New User Offer',
      subtitle: 'Special welcome discount for first-time shoppers',
      discount: '30%',
      badge: 'NEW',
      icon: Gift,
      color: '#84cc16',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
    },
  ];

  // Categories
  const categories = ['All', 'Fashion', 'Electronics', 'Home', 'Beauty', 'Sports', 'Accessories'];
  const discountRanges = ['All', '10-25%', '25-50%', '50%+'];

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Discount filter
    if (selectedDiscount !== 'All') {
      filtered = filtered.filter(p => {
        const discount = p.discountPercent || 0;
        switch (selectedDiscount) {
          case '10-25%':
            return discount >= 10 && discount < 25;
          case '25-50%':
            return discount >= 25 && discount < 50;
          case '50%+':
            return discount >= 50;
          default:
            return true;
        }
      });
    }

    // Sort
    switch (sortBy) {
      case 'biggest-discount':
        filtered.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'ending-soon':
      default:
        // Keep current order for ending soon
        break;
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, selectedDiscount, sortBy]);

  // Handlers
  const handleWishlistToggle = (productId: string) => {
    setWishlistedProducts(prev => {
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
    toast.success(`${product.name} added to cart`);
    // Implement cart logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNavigation items={[{ label: 'Offers & Deals' }]} />
      </div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-primary-lime via-accent-blue to-primary-lime-dark py-16 md:py-24"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
                <Percent className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Exclusive Deals</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              Special Offers & Deals
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8"
            >
              Save big on your favorite products with our exclusive deals and limited-time offers
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for deals..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                />
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-primary-lime hover:bg-gray-100"
                  size="sm"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filter Section - Collapsible */}
      <AnimatePresence>
        {showFilters && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-b overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filters */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-text-secondary mb-3">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <FilterButton
                      key={category}
                      label={category}
                      active={selectedCategory === category}
                      onClick={() => setSelectedCategory(category)}
                    />
                  ))}
                </div>
              </div>

              {/* Discount Filters */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-text-secondary mb-3">Discount Range</p>
                <div className="flex flex-wrap gap-2">
                  {discountRanges.map(range => (
                    <FilterButton
                      key={range}
                      label={range}
                      active={selectedDiscount === range}
                      onClick={() => setSelectedDiscount(range)}
                    />
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <p className="text-sm font-semibold text-text-secondary mb-3">Sort By</p>
                <div className="flex flex-wrap gap-2">
                  <FilterButton
                    label="Ending Soon"
                    active={sortBy === 'ending-soon'}
                    onClick={() => setSortBy('ending-soon')}
                  />
                  <FilterButton
                    label="Biggest Discount"
                    active={sortBy === 'biggest-discount'}
                    onClick={() => setSortBy('biggest-discount')}
                  />
                  <FilterButton
                    label="Newest"
                    active={sortBy === 'newest'}
                    onClick={() => setSortBy('newest')}
                  />
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading && (
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-pulse">
              <div className="h-8 w-32 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="h-12 w-96 bg-gray-200 rounded mx-auto mb-4" />
              <div className="h-6 w-64 bg-gray-200 rounded mx-auto" />
            </div>
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl h-64" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Error Banner */}
      {error && !loading && (
        <section className="py-6 bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <p className="text-yellow-800 text-sm">
                {error}. Showing available sale products instead.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-yellow-900 underline text-sm hover:text-yellow-700"
              >
                Retry
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Deals Section */}
      {!loading && (
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 bg-primary-lime/10 rounded-full px-4 py-2 mb-4">
                <Flame className="w-5 h-5 text-primary-lime" />
                <span className="text-primary-lime font-semibold">Hot Deals</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
                Featured Deals
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Don't miss out on these limited-time offers and exclusive discounts
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {featuredDeals.map((deal, index) => (
                <FeaturedDealCard key={deal.id} deal={deal} delay={index * 0.1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Offers Grid Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
                All Offers
              </h2>
              <p className="text-lg text-text-secondary">
                {filteredProducts.length} products on sale
              </p>
            </motion.div>
          )}

          {/* Loading Grid */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg aspect-[3/4] mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {!loading && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <OfferProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onWishlistToggle={handleWishlistToggle}
                  isWishlisted={wishlistedProducts.has(product.id)}
                />
              ))}
            </div>
          ) : !loading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-12 text-center"
            >
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold text-text-primary mb-2">No offers found</h3>
              <p className="text-text-secondary mb-6">
                Try adjusting your filters to see more deals
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedDiscount('All');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : null}
        </div>
      </section>

      {/* Deal Categories Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
              Deal Categories
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Explore our curated collections of deals organized by type
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Daily Deals',
                description: 'Fresh deals every day',
                icon: Clock,
                color: '#FF6B6B',
                count: 12,
              },
              {
                title: 'Weekly Specials',
                description: 'Handpicked weekly offers',
                icon: Star,
                color: '#FFA500',
                count: 24,
              },
              {
                title: 'Clearance Items',
                description: 'Last chance deals',
                icon: Tag,
                color: '#9C27B0',
                count: 36,
              },
              {
                title: 'Bundle Offers',
                description: 'Save more on bundles',
                icon: Gift,
                color: '#84cc16',
                count: 8,
              },
            ].map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 border-transparent hover:border-primary-lime">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: category.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">{category.title}</h3>
                    <p className="text-text-secondary mb-4">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary-lime/10 text-primary-lime">
                        {category.count} items
                      </Badge>
                      <ArrowRight className="w-5 h-5 text-primary-lime group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Banner */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #84cc16 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 bg-primary-lime/20 rounded-full px-6 py-2 mb-6">
                <Bell className="w-5 h-5 text-primary-lime" />
                <span className="text-primary-lime font-semibold">Stay Updated</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Get Exclusive Deals in Your Inbox
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Subscribe to our newsletter and never miss out on special offers, flash sales, and
                early access to new deals
              </p>

              <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white w-5 h-5 z-10" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-4 rounded-lg border-2 border-white/20 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime focus:border-transparent backdrop-blur-sm"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-primary-lime text-white hover:bg-primary-lime-dark"
                >
                  Subscribe
                </Button>
              </form>

              <div className="flex items-center justify-center gap-6 text-gray-400 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-lime rounded-full" />
                  <span>Exclusive Deals</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-lime rounded-full" />
                  <span>Early Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-lime rounded-full" />
                  <span>No Spam</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* App Download Banner */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary-lime to-accent-blue relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex-1 text-center md:text-left"
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <Smartphone className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">Mobile App</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Download App for Extra 10% Off
              </h2>
              <p className="text-lg text-white/90 mb-6">
                Get exclusive app-only deals and early access to flash sales. Shop on the go!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" className="bg-white text-primary-lime hover:bg-gray-100">
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  App Store
                </Button>
                <Button
                  size="lg"
                  className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary-lime"
                >
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
                  </svg>
                  Google Play
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex-shrink-0"
            >
              <div className="relative">
                <div className="w-64 h-64 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                  <Smartphone className="w-32 h-32 text-white" />
                </div>
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary-lime rounded-full flex items-center justify-center">
                      <Percent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary-lime">10%</div>
                      <div className="text-xs text-text-secondary">Extra Off</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OffersPage;

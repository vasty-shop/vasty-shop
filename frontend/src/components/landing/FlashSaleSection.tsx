import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface FlashSaleProduct {
  id: string;
  name: string;
  image: string;
  currentPrice: number;
  oldPrice: number;
  sold: number;
  total: number;
}

interface Campaign {
  id: string;
  name: string;
  campaign_type: string;
  start_date: string;
  end_date: string;
  status: string;
  target_products: any[];
  discount_type?: string;
  discount_value?: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (targetDate: Date): TimeLeft => {
  const difference = +targetDate - +new Date();

  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return { days: 0, hours: 0, minutes: 0, seconds: 0 };
};

interface CountdownTimerProps {
  endDate: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endDate }) => {
  const [targetDate] = useState(() => new Date(endDate));
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  const TimerUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <motion.div
      key={value}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg">
        <span className="text-white text-xl md:text-2xl font-bold">{formatNumber(value)}</span>
      </div>
      <span className="text-xs text-text-secondary mt-1 uppercase tracking-wide">{label}</span>
    </motion.div>
  );

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <TimerUnit value={timeLeft.days} label="Days" />
      <span className="text-2xl font-bold text-text-secondary -mt-6">:</span>
      <TimerUnit value={timeLeft.hours} label="Hours" />
      <span className="text-2xl font-bold text-text-secondary -mt-6">:</span>
      <TimerUnit value={timeLeft.minutes} label="Minutes" />
    </div>
  );
};

const ProductCard: React.FC<{ product: FlashSaleProduct }> = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const soldPercentage = (product.sold / product.total) * 100;
  const discount = Math.round(((product.oldPrice - product.currentPrice) / product.oldPrice) * 100);

  const formatPrice = (price: number): string => {
    return `Rp${price.toLocaleString('id-ID')}`;
  };

  return (
    <motion.div
      className="flex-shrink-0 w-64 md:w-72 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-card shadow-card overflow-hidden h-full">
        {/* Product Image */}
        <Link to={`/product/${product.id}`} className="block">
          <div className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = '/images/default-product.png';
              }}
            />

            {/* Discount Badge */}
            <div className="absolute top-3 left-3 bg-badge-sale text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              -{discount}%
            </div>
          </div>
        </Link>

        {/* Wishlist Button */}
        <motion.button
          className={cn(
            "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors z-10",
            isWishlisted ? "bg-red-500" : "bg-white"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-colors",
              isWishlisted ? "fill-white text-white" : "text-gray-600"
            )}
          />
        </motion.button>

        {/* Quick Actions on Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 z-10"
            >
              <Link to={`/product/${product.id}`}>
                <motion.button
                  className="w-full bg-white text-text-primary font-semibold py-3 rounded-button hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Quick View
                </motion.button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Info */}
        <div className="p-4">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-sm font-semibold text-text-primary line-clamp-2 mb-3 min-h-[40px] hover:text-primary-lime transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>

          {/* Pricing */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-badge-sale">
              {formatPrice(product.currentPrice)}
            </span>
            <span className="text-sm text-text-secondary line-through">
              {formatPrice(product.oldPrice)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">
                Sold: {product.sold}/{product.total}
              </span>
              <span className="font-semibold text-badge-sale">
                {product.total - product.sold} left!
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${soldPercentage}%` }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Urgency Message */}
          {product.total - product.sold <= 2 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs text-badge-sale font-semibold flex items-center gap-1"
            >
              <Zap className="w-3 h-3 fill-current" />
              Almost sold out!
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const FlashSaleSection: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [products, setProducts] = useState<FlashSaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignEndDate, setCampaignEndDate] = useState<string | null>(null);

  // Fetch flash sale data from API
  useEffect(() => {
    const fetchFlashSaleProducts = async () => {
      try {
        setLoading(true);

        // Get active campaigns and filter for flash_sale type
        const campaignsResponse = await api.getActiveCampaigns();
        const campaigns = Array.isArray(campaignsResponse) ? campaignsResponse : ((campaignsResponse as any)?.data || []);
        const flashSaleCampaigns = campaigns.filter(
          (campaign: Campaign) => campaign.campaign_type === 'flash_sale' && campaign.status === 'active'
        );

        if (flashSaleCampaigns.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Use the first flash sale campaign
        const flashSaleCampaign = flashSaleCampaigns[0];
        setCampaignEndDate(flashSaleCampaign.end_date);

        // Get products from the campaign
        const targetProductIds = flashSaleCampaign.target_products || [];

        if (targetProductIds.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Fetch products data
        const productsResponse = await api.getProducts({ limit: 100 });
        const allProducts = productsResponse.data || [];

        // Filter and map products that are in the flash sale
        const flashSaleProducts: FlashSaleProduct[] = allProducts
          .filter((product: any) => targetProductIds.includes(product.id))
          .map((product: any) => {
            // Calculate discount based on campaign settings
            let currentPrice = product.price;
            const oldPrice = product.compare_price || product.price;

            if (flashSaleCampaign.discount_type === 'percentage' && flashSaleCampaign.discount_value) {
              currentPrice = product.price * (1 - flashSaleCampaign.discount_value / 100);
            } else if (flashSaleCampaign.discount_type === 'fixed' && flashSaleCampaign.discount_value) {
              currentPrice = Math.max(0, product.price - flashSaleCampaign.discount_value);
            }

            // Use product sale_price if available and lower than calculated price
            if (product.sale_price && product.sale_price < currentPrice) {
              currentPrice = product.sale_price;
            }

            // Get primary image - handle both string URLs and object format
            const images = product.images || [];
            let primaryImage = '/images/default-product.png';
            if (images.length > 0) {
              // First try to find a primary image
              const primary = images.find((img: any) => img?.isPrimary);
              if (primary) {
                primaryImage = typeof primary === 'string' ? primary : primary.url || primaryImage;
              } else {
                // Fall back to first image
                const firstImg = images[0];
                primaryImage = typeof firstImg === 'string' ? firstImg : firstImg?.url || primaryImage;
              }
            }

            // Use real inventory data from product
            const stockQuantity = product.stock_quantity || product.stockQuantity || product.inventory || 0;
            const initialStock = product.initial_stock || product.initialStock || product.total_stock || stockQuantity || 100;
            const sold = Math.max(0, initialStock - stockQuantity);
            const total = initialStock;

            return {
              id: product.id,
              name: product.name,
              image: primaryImage,
              currentPrice: Math.round(currentPrice),
              oldPrice: Math.round(oldPrice),
              sold,
              total,
            };
          });

        setProducts(flashSaleProducts);
      } catch (error) {
        console.error('Failed to fetch flash sale products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSaleProducts();
  }, []);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScrollButtons);
    window.addEventListener('resize', checkScrollButtons);

    return () => {
      container.removeEventListener('scroll', checkScrollButtons);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  // Don't render if loading or no products
  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-pink-50 via-red-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show the section if no flash sales are active
  }

  return (
    <section className="py-12 bg-gradient-to-br from-pink-50 via-red-50 to-orange-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              <Zap className="w-6 h-6 text-white fill-white" />
            </motion.div>
            <div>
              <h2 className="text-h2 text-text-primary">Flash Sale</h2>
              <p className="text-sm text-text-secondary">Hurry up! Limited time offers</p>
            </div>
          </div>

          {/* Countdown Timer */}
          {campaignEndDate && <CountdownTimer endDate={campaignEndDate} />}
        </div>

        {/* Products Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors -ml-5"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-6 h-6 text-text-primary" />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors -mr-5"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="w-6 h-6 text-text-primary" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Scrollable Products Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-2 py-2"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-8">
          <Link to="/campaigns">
            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-button shadow-lg hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All Flash Sale Products
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FlashSaleSection;

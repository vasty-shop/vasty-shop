import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shirt, Calendar, Bookmark, Eye, ChevronRight, Thermometer, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/useUserStore';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatTemperature } from '@/lib/utils';

interface FeaturedProduct {
  id: string;
  name: string;
  brand?: string;
  images: string[];
  price: number;
  salePrice?: number;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const stats = useUserStore((state) => state.stats);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const temperature = 16;

  // Fetch featured products
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.getProducts({ limit: 4, isFeatured: true });
        setFeaturedProducts(response.data || []);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const statCards = [
    {
      title: 'OUTFITS',
      value: stats.outfits,
      icon: Shirt,
      bg: 'bg-accent-blue',
      textColor: 'text-white',
    },
    {
      title: 'WITH EVENTS',
      value: stats.outfitsWithEvents,
      icon: Calendar,
      bg: 'bg-card-black',
      textColor: 'text-white',
    },
    {
      title: 'SAVED',
      value: stats.savedOutfits,
      icon: Bookmark,
      bg: 'bg-white',
      textColor: 'text-text-primary',
      border: 'border border-gray-200',
    },
  ];

  return (
    <div className="min-h-screen bg-cloud-gradient pb-24">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-h1 font-bold text-text-primary mb-2">Vasty Shop</h1>
          <p className="text-body text-text-secondary">Your personal style assistant</p>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h3 font-semibold text-text-primary">
              {user ? `Welcome back, ${user.name || 'there'}!` : 'Discover Fashion'}
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex-shrink-0"
            >
              <button onClick={() => navigate('/products')} className="block text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-lime shadow-lg bg-primary-lime flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-white" />
                </div>
                <p className="text-caption text-center mt-1 w-16 truncate">Products</p>
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0"
            >
              <button onClick={() => navigate('/categories')} className="block text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-accent-blue shadow-lg bg-accent-blue flex items-center justify-center">
                  <Shirt className="w-7 h-7 text-white" />
                </div>
                <p className="text-caption text-center mt-1 w-16 truncate">Categories</p>
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-shrink-0"
            >
              <button onClick={() => navigate('/offers')} className="block text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-badge-sale shadow-lg bg-badge-sale flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <p className="text-caption text-center mt-1 w-16 truncate">Offers</p>
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex-shrink-0"
            >
              <button onClick={() => navigate('/outfits')} className="block text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500 shadow-lg bg-purple-500 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <p className="text-caption text-center mt-1 w-16 truncate">Outfits</p>
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Your Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-h3 font-semibold text-text-primary mb-4">Your stats</h2>
          <div className="grid grid-cols-3 gap-3">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className={cn('p-4', stat.bg, stat.border)}>
                    <div className="flex flex-col items-center text-center">
                      <Icon className={cn('w-6 h-6 mb-2', stat.textColor)} />
                      <div className={cn('text-2xl font-bold mb-1', stat.textColor)}>{stat.value}</div>
                      <div className={cn('text-caption', stat.textColor, 'opacity-80')}>{stat.title}</div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Featured Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h3 font-semibold text-text-primary">Featured Products</h2>
            <Link to="/products" className="text-sm text-accent-blue font-medium hover:underline flex items-center gap-1">
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-3">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </Card>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="aspect-square bg-gray-100 relative">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Shirt className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      {product.salePrice && product.salePrice < product.price && (
                        <span className="absolute top-2 left-2 bg-badge-sale text-white text-xs px-2 py-0.5 rounded-full">
                          Sale
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-text-secondary font-medium truncate">
                        {product.brand || 'VASTY'}
                      </p>
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'text-sm font-bold',
                          product.salePrice ? 'text-badge-sale' : 'text-text-primary'
                        )}>
                          ${(product.salePrice || product.price).toFixed(2)}
                        </span>
                        {product.salePrice && (
                          <span className="text-xs text-text-secondary line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Shirt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-text-secondary">No featured products yet</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => navigate('/products')}
              >
                Browse All Products
              </Button>
            </Card>
          )}
        </motion.div>

        {/* AI Outfit Suggestion Promo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-primary-lime text-white overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Coming Soon</span>
              </div>
              <h3 className="text-xl font-bold mb-2">AI Style Assistant</h3>
              <p className="text-sm opacity-90 mb-4">
                Get personalized outfit recommendations based on weather, events, and your unique style preferences.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={() => navigate('/outfits')}
              >
                Learn More
              </Button>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-20">
              <Sparkles className="w-32 h-32" />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

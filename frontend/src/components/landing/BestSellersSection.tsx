import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ShoppingBag, BadgeCheck, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
}

interface Store {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  verified: boolean;
  products: Product[];
}

const BestSellersSection: React.FC = () => {
  const { t } = useTranslation();
  const [featuredStore, setFeaturedStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStoresAndProducts();
  }, []);

  const fetchStoresAndProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch shops from API
      const shopsResponse = await api.getShops({ limit: 5 });
      const shopsData = shopsResponse.data || shopsResponse || [];

      if (!Array.isArray(shopsData) || shopsData.length === 0) {
        setError('No stores available');
        return;
      }

      // Process shops data
      const processedStores: Store[] = [];

      for (let i = 0; i < shopsData.length && i < 5; i++) {
        const shop = shopsData[i];

        // Fetch products for this shop (limit to top 3)
        let products: Product[] = [];
        try {
          const productsResponse = await api.getProducts({
            shopId: shop.id,
            limit: 3,
            status: 'active',
          });
          const productsData = productsResponse.data || [];

          products = productsData.map((product: any) => {
            // Handle images array - can be strings or objects with url property
            let imageUrl = '';
            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
              const firstImage = product.images[0];
              if (typeof firstImage === 'string' && firstImage.trim()) {
                imageUrl = firstImage;
              } else if (firstImage && typeof firstImage === 'object' && firstImage.url) {
                imageUrl = firstImage.url;
              }
            } else if (product.image) {
              imageUrl = product.image;
            } else if (product.thumbnail) {
              imageUrl = product.thumbnail;
            }

            return {
              id: product.id,
              name: product.name || product.title || 'Unnamed Product',
              image: imageUrl,
              price: product.price || 0,
            };
          });
        } catch (err) {
          console.error(`Failed to fetch products for shop ${shop.id}:`, err);
          // Continue with empty products array
        }

        const storeData: Store = {
          id: shop.id,
          name: shop.name || shop.shopName || 'Unnamed Store',
          tagline: shop.tagline || shop.description || shop.bio || 'Quality products for you',
          logo: shop.logo || shop.image || '',
          verified: shop.verified || shop.isVerified || false,
          products,
        };

        processedStores.push(storeData);
      }

      // Set featured store (first store) and remaining stores (up to 4)
      if (processedStores.length > 0) {
        setFeaturedStore(processedStores[0]);
        setStores(processedStores.slice(1, 5)); // Take up to 4 more stores
      }
    } catch (err: any) {
      console.error('Failed to fetch stores:', err);
      setError(err.message || 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return `Rp${price.toLocaleString('id-ID')}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  // Loading state
  if (loading) {
    return (
      <section className="w-full py-12 md:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              {t('platform.bestSellers.title')}
            </h2>
          </motion.div>

          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error || !featuredStore) {
    return (
      <section className="w-full py-12 md:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              {t('platform.bestSellers.title')}
            </h2>
          </motion.div>

          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-500 text-lg">
              {error || t('platform.bestSellers.noStoresAvailableNow')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            {t('platform.bestSellers.title')}
          </h2>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
        >
          {/* Featured Store Card (Left) */}
          <motion.div variants={itemVariants}>
            <Card
              className={cn(
                'h-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600',
                'hover:shadow-xl transition-all duration-300 cursor-pointer',
                'group'
              )}
            >
              <div className="relative h-full p-8 md:p-10 flex flex-col justify-between min-h-[400px]">
                {/* Store Header */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl md:text-3xl font-bold text-white">
                          {featuredStore.name}
                        </h3>
                        {featuredStore.verified && (
                          <BadgeCheck className="w-6 h-6 text-blue-200 fill-blue-200" />
                        )}
                      </div>
                      <p className="text-lg md:text-xl text-white/90 font-medium">
                        {featuredStore.tagline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shopping Bags Illustration */}
                <div className="flex justify-center items-center flex-1 py-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl"></div>
                    <ShoppingBag className="w-32 h-32 md:w-40 md:h-40 text-white/30 relative" />
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
              </div>
            </Card>
          </motion.div>

          {/* Store Grid (Right) */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6"
          >
            {stores.length > 0 ? (
              stores.map((store) => (
                <motion.div
                  key={store.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={cn(
                      'bg-white overflow-hidden',
                      'hover:shadow-lg transition-all duration-300 cursor-pointer',
                      'group h-full'
                    )}
                  >
                    <div className="p-4 md:p-5 space-y-4">
                      {/* Store Header */}
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-1.5 mb-1">
                            <h4 className="text-sm md:text-base font-bold text-gray-900 line-clamp-1">
                              {store.name}
                            </h4>
                            {store.verified && (
                              <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-1">
                            {store.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Mini Product Cards */}
                      <div className="grid grid-cols-3 gap-2">
                        {store.products.length > 0 ? (
                          store.products.map((product) => (
                            <Link
                              key={product.id}
                              to={`/product/${product.id}`}
                              className="bg-gray-50 rounded-lg overflow-hidden group/product hover:shadow-md transition-shadow cursor-pointer block"
                            >
                              {/* Product Image */}
                              <div className="relative aspect-square bg-gray-200">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <ShoppingBag className="w-6 h-6 text-gray-400" />
                                </div>
                                {/* Placeholder for actual image */}
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover opacity-0 group-hover/product:opacity-100 transition-opacity"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                              {/* Product Price */}
                              <div className="p-1.5">
                                <p className="text-xs font-semibold text-gray-900 truncate">
                                  {formatPrice(product.price)}
                                </p>
                              </div>
                            </Link>
                          ))
                        ) : (
                          // Placeholder for stores with no products
                          <>
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="bg-gray-50 rounded-lg overflow-hidden"
                              >
                                <div className="relative aspect-square bg-gray-200">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-gray-400" />
                                  </div>
                                </div>
                                <div className="p-1.5">
                                  <p className="text-xs font-semibold text-gray-400 truncate">
                                    {t('platform.bestSellers.noProduct')}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              // Placeholder grid when fewer than 5 shops exist
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg border border-gray-200 p-4 md:p-5 space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-gray-300" />
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="bg-gray-50 rounded-lg overflow-hidden">
                          <div className="aspect-square bg-gray-200"></div>
                          <div className="p-1.5">
                            <div className="h-3 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default BestSellersSection;

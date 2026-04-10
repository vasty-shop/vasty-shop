import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, Shirt, Heart, ShoppingCart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFilterStore } from '@/stores/useFilterStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Pill } from '@/components/ui/pill';
import { FilterModal } from '@/components/filters/FilterModal';
import { TAB_OPTIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  salePrice?: number;
  images: string[];
  category?: string;
  rating?: number;
}

export const OutfitFeedPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('outfits');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [outfitSuggestions, setOutfitSuggestions] = useState<Product[][]>([]);

  const filters = useFilterStore((state) => state.filters);
  const removeFilter = useFilterStore((state) => state.removeFilter);
  const addToCart = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  const activeFilters: Array<{ type: 'style' | 'weather' | 'event' | 'season'; value: string; label: string }> = [
    ...filters.styles.map((s) => ({ type: 'style' as const, value: s, label: s })),
    ...filters.weather.map((w) => ({ type: 'weather' as const, value: w, label: w })),
    ...(filters.event ? [{ type: 'event' as const, value: filters.event, label: filters.event }] : []),
  ];

  if (filters.temperature.min !== 10 || filters.temperature.max !== 25) {
    activeFilters.push({
      type: 'weather',
      value: 'temperature-range',
      label: `${filters.temperature.min}-${filters.temperature.max}°C`,
    });
  }

  // Fetch products and create outfit suggestions
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.getProducts({ limit: 20, isFeatured: true });
        // Handle both array and { data: [...] } response formats
        const productList: Product[] = Array.isArray(response)
          ? response
          : (response?.data || []);
        setProducts(productList);

        // Create outfit suggestions by grouping products
        if (productList.length >= 3) {
          const suggestions: Product[][] = [];
          for (let i = 0; i < Math.min(4, Math.floor(productList.length / 3)); i++) {
            suggestions.push(productList.slice(i * 3, (i + 1) * 3));
          }
          setOutfitSuggestions(suggestions);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products by search query
  const filteredProducts = products.filter((product) =>
    !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isInWishlist = (productId: string) => wishlistItems.some((item) => item.product.id === productId);

  const handleWishlistToggle = async (product: Product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      // Create a full Product object for wishlist
      const fullProduct = {
        id: product.id,
        name: product.name,
        brand: product.brand || '',
        price: product.price,
        salePrice: product.salePrice,
        images: product.images,
        sizes: ['S', 'M', 'L', 'XL'] as const,
        rating: product.rating || 0,
        category: product.category || '',
      };
      await addToWishlist(fullProduct as any);
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCart = async (product: Product) => {
    // Create a full Product object for cart
    const fullProduct = {
      id: product.id,
      name: product.name,
      brand: product.brand || '',
      price: product.price,
      salePrice: product.salePrice,
      images: product.images,
      sizes: ['S', 'M', 'L', 'XL'] as const,
      rating: product.rating || 0,
      category: product.category || '',
    };
    await addToCart(fullProduct as any, 'M');
    toast.success('Added to cart');
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div className="relative aspect-[3/4] bg-gray-100">
        <img
          src={product.images[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistToggle(product);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
      <div className="p-4">
        {product.brand && (
          <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">{product.brand}</p>
        )}
        <h3 className="text-sm font-medium text-text-primary line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${product.salePrice ? 'text-red-600' : 'text-text-primary'}`}>
            ${(product.salePrice || product.price).toFixed(2)}
          </span>
          {product.salePrice && (
            <span className="text-sm text-text-secondary line-through">${product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );

  const OutfitCard = ({ outfit, index }: { outfit: Product[]; index: number }) => {
    const totalPrice = outfit.reduce((sum, p) => sum + (p.salePrice || p.price), 0);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">Outfit {index + 1}</h3>
          <span className="text-sm text-primary-lime font-medium">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {outfit.map((product) => (
            <div
              key={product.id}
              className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 ring-primary-lime transition-all"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <img
                src={product.images[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="space-y-1 mb-4">
          {outfit.map((product) => (
            <div key={product.id} className="flex items-center justify-between text-sm">
              <span className="text-text-secondary truncate flex-1">{product.name}</span>
              <span className="text-text-primary font-medium ml-2">
                ${(product.salePrice || product.price).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <Button
          className="w-full"
          onClick={() => {
            outfit.forEach((product) => handleAddToCart(product));
            toast.success('Outfit added to cart!');
          }}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add Outfit to Cart
        </Button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-cloud-gradient pb-24">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            {TAB_OPTIONS.map((tab) => (
              <TabsTrigger key={tab.label.toLowerCase()} value={tab.label.toLowerCase()}>
                {tab.label} ({tab.label.toLowerCase() === 'outfits' ? outfitSuggestions.length : tab.count})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <Input
            type="text"
            placeholder={t('common.placeholders.searchProducts')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-14"
          />
          <button
            onClick={() => setIsFilterOpen(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5 text-text-primary" />
          </button>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 flex-wrap mb-6"
          >
            {activeFilters.map((filter) => (
              <Pill
                key={`${filter.type}-${filter.value}`}
                label={filter.label}
                selected
                removable
                onRemove={() => removeFilter(filter.type, filter.value)}
              />
            ))}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-lime animate-spin" />
          </div>
        )}

        {/* Content */}
        {!loading && (
          <Tabs value={selectedTab} className="w-full">
            <TabsContent value="outfits" className="mt-0">
              {outfitSuggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {outfitSuggestions.map((outfit, index) => (
                    <OutfitCard key={index} outfit={outfit} index={index} />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 px-4"
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-primary-lime/10 rounded-full flex items-center justify-center">
                    <Shirt className="w-10 h-10 text-primary-lime" />
                  </div>
                  <h3 className="text-h2 font-bold text-text-primary mb-3">No Outfits Available</h3>
                  <p className="text-body text-text-secondary mb-6 max-w-md mx-auto">
                    Browse our products to discover amazing outfit combinations.
                  </p>
                  <Button onClick={() => navigate('/products')} className="gap-2">
                    <Shirt className="w-4 h-4" />
                    Browse Products
                  </Button>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="items" className="mt-0">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-h3 text-text-secondary mb-2">No items found</p>
                  <p className="text-body text-text-secondary">Try adjusting your search or filters</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="lookbook" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {outfitSuggestions.slice(0, 2).map((outfit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="grid grid-cols-3 gap-1">
                      {outfit.map((product) => (
                        <div key={product.id} className="aspect-square bg-gray-100">
                          <img
                            src={product.images[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-text-primary mb-2">Lookbook {index + 1}</h3>
                      <p className="text-sm text-text-secondary mb-4">
                        A curated collection of {outfit.length} items perfect for any occasion.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedTab('outfits')}
                      >
                        View Outfit Details
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal open={isFilterOpen} onOpenChange={setIsFilterOpen} />
    </div>
  );
};

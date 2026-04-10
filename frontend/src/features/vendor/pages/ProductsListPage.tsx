import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  TrendingUp,
  TrendingDown,
  Package,
  Grid3x3,
  List,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { LoadingState, ProductCardSkeleton } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { api } from '../../../lib/api';
import { toast } from 'sonner';
import { useActiveShop } from '../../../hooks/useActiveShop';
import { useShopStore } from '../../../stores/useShopStore';
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { AlertDialog } from '../../../components/ui/AlertDialog';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sales: number;
  image: string;
  status: 'active' | 'draft' | 'out_of_stock';
  trend: number;
  rating: number;
  reviews: number;
}

export const ProductsListPage: React.FC = () => {
  const { t } = useTranslation();
  const dialog = useDialog();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'price' | 'stock' | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  // Bulk edit form state
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [bulkDiscount, setBulkDiscount] = useState<string>('');
  const [bulkCategory, setBulkCategory] = useState<string>('');
  const [bulkInventoryAction, setBulkInventoryAction] = useState<string>('');
  const [bulkInventoryValue, setBulkInventoryValue] = useState<string>('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const categories = ['all', 'Electronics', 'Fashion', 'Sports', 'Home'];
  const statuses = ['all', 'active', 'draft', 'out_of_stock'];

  // Get active shop from unified hook (works with both vendor and customer auth)
  const { shop, shopId, isLoading: shopsLoading, hasShops } = useActiveShop();
  // Also get userShops for the error state
  const { shops: userShops } = useShopStore();

  // Set shop context in API client for automatic header injection
  useEffect(() => {
    if (shopId) {
      api.setShopId(shopId);
    }
  }, [shopId]);

  // Handle add product navigation
  const handleAddProduct = () => {
    if (shopId) {
      navigate(`/shop/${shopId}/vendor/products/add`);
    }
  };

  const fetchProducts = async () => {
    if (!shop?.id) {
      setError('Shop context not found. Please login again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // shopId will be automatically added via x-shop-id header in api-client.ts
      const response = await api.getVendorProducts({
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        limit: 100
      });

      // Transform API response to match component interface
      const transformedProducts: Product[] = (response.data || []).map((product: any) => ({
        id: product.id,
        name: product.name || 'Unnamed Product',
        category: product.category?.name || 'Uncategorized',
        price: product.price || 0,
        stock: product.inventory?.quantity || product.stock || 0,
        sales: product.salesCount || 0,
        image: product.images?.[0]?.url || product.image || '',
        status: product.status === 'published' ? 'active' :
                product.stock === 0 ? 'out_of_stock' :
                product.status || 'draft',
        trend: product.trendPercentage || 0,
        rating: product.averageRating || 0,
        reviews: product.reviewsCount || 0
      }));

      setProducts(transformedProducts);
    } catch (err: any) {
      console.error('[ProductsListPage] Failed to fetch products:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load products';
      setError(errorMessage);
      // Don't show toast here, let the error state handle it
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, selectedStatus]);

  const filteredProducts = products.filter((product) => {
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Price range filter
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min) && product.price < min) {
      return false;
    }
    if (!isNaN(max) && product.price > max) {
      return false;
    }

    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'draft':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'out_of_stock':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-700 bg-red-100';
    if (stock < 10) return 'text-yellow-700 bg-yellow-100';
    if (stock < 50) return 'text-blue-700 bg-blue-100';
    return 'text-green-700 bg-green-100';
  };

  const getStockLabel = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    if (stock < 50) return 'In Stock';
    return 'Well Stocked';
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmed = await dialog.showConfirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      await api.deleteProduct(productId);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err: any) {
      toast.error('Failed to delete product', {
        description: err?.response?.data?.message || 'An error occurred'
      });
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = await dialog.showConfirm({
      title: 'Delete Products',
      message: `Are you sure you want to delete ${selectedProducts.length} product(s)? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      await Promise.all(selectedProducts.map(id => api.deleteProduct(id)));
      toast.success(`Successfully deleted ${selectedProducts.length} product(s)`);
      setSelectedProducts([]);
      fetchProducts();
    } catch (err: any) {
      toast.error('Failed to delete products', {
        description: err?.response?.data?.message || 'An error occurred'
      });
    }
  };

  const handleBulkEdit = () => {
    setShowBulkEditModal(true);
  };

  const handleViewProduct = (productId: string) => {
    if (!shopId) {
      toast.error('Error', { description: 'Shop context not found' });
      return;
    }
    // Navigate to product detail page (customer view)
    navigate(`/products/${productId}`);
  };

  const handleEditProduct = (productId: string) => {
    if (!shopId) {
      toast.error('Error', { description: 'Shop context not found' });
      return;
    }
    // Navigate to edit page
    navigate(`/shop/${shopId}/vendor/products/edit/${productId}`);
  };

  const handleQuickEdit = (productId: string, field: 'price' | 'stock', currentValue: number) => {
    setEditingProductId(productId);
    setEditingField(field);
    setEditValue(currentValue.toString());
  };

  const handleSaveQuickEdit = async () => {
    if (!editingProductId || !editingField) return;

    try {
      const value = parseFloat(editValue);
      if (isNaN(value) || value < 0) {
        toast.error('Invalid value', { description: 'Please enter a valid number' });
        return;
      }

      if (editingField === 'price') {
        await api.updateProduct(editingProductId, { price: value });
      } else {
        await api.updateProductInventory(editingProductId, { quantity: value });
      }

      toast.success(`${editingField === 'price' ? 'Price' : 'Stock'} updated successfully`);
      setEditingProductId(null);
      setEditingField(null);
      setEditValue('');
      fetchProducts();
    } catch (err: any) {
      toast.error('Failed to update', {
        description: err?.response?.data?.message || 'An error occurred'
      });
    }
  };

  const handleCancelQuickEdit = () => {
    setEditingProductId(null);
    setEditingField(null);
    setEditValue('');
  };

  const handleClearPriceFilter = () => {
    setMinPrice('');
    setMaxPrice('');
  };

  // Loading State (including shops loading)
  if (loading || shopsLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex space-x-3">
            <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <GlassCard hover={false}>
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
        </GlassCard>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </motion.div>
    );
  }

  // Error State
  if (error && !error.includes('Shop context not found')) {
    return (
      <ErrorState
        title={t('vendor.products.failedToLoad')}
        message={error}
        onRetry={fetchProducts}
        type="error"
        showDetails={false}
      />
    );
  }

  // No Shop Context
  if (!shop?.id) {
    // Check if user has shops but shopId doesn't match
    const hasOtherShops = userShops.length > 0;
    return (
      <ErrorState
        title={t('vendor.products.shopNotFound')}
        message={hasOtherShops
          ? t('vendor.products.shopNotFoundMessage')
          : t('vendor.products.createShopMessage')
        }
        onRetry={() => (window.location.href = hasOtherShops ? '/vendor/shops' : '/vendor/create-shop')}
        retryLabel={hasOtherShops ? t('vendor.products.selectShop') : t('vendor.products.createShop')}
        type="forbidden"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('vendor.products.title', { defaultValue: 'Products' })}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('vendor.products.subtitle', { defaultValue: 'Manage your product inventory' })} ({filteredProducts.length} {t('vendor.products.title', { defaultValue: 'products' }).toLowerCase()})
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('vendor.common.refresh', { defaultValue: 'Refresh' })}</span>
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>{t('vendor.common.export', { defaultValue: 'Export' })}</span>
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>{t('vendor.products.import', { defaultValue: 'Import' })}</span>
          </button>
          <button
            onClick={handleAddProduct}
            className="px-6 py-2 bg-primary-lime text-white rounded-xl font-medium hover:bg-primary-lime/90 transition-all shadow-md flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t('vendor.products.addProduct', { defaultValue: 'Add Product' })}</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <GlassCard hover={false}>
        <div className="space-y-4">
          {/* Search & View Toggle */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('vendor.products.searchProducts', { defaultValue: 'Search products...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 focus:border-primary-lime/50 transition-all"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl transition-all flex items-center space-x-2 text-gray-700 ${
                  showFilters ? 'bg-primary-lime/10 border border-primary-lime/30' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>{t('vendor.common.filter', { defaultValue: 'Filters' })}</span>
              </button>

              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-primary-lime/20 text-primary-lime' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-primary-lime/20 text-primary-lime' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">{t('vendor.products.category', { defaultValue: 'Category' })}</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">{t('vendor.common.status', { defaultValue: 'Status' })}</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-500">{t('vendor.products.priceRange', { defaultValue: 'Price Range' })}</label>
                      {(minPrice || maxPrice) && (
                        <button
                          onClick={handleClearPriceFilter}
                          className="text-xs text-primary-lime hover:text-primary-lime/80 transition-colors"
                        >
                          {t('vendor.products.clear', { defaultValue: 'Clear' })}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder={t('vendor.placeholders.min')}
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                      />
                      <input
                        type="number"
                        placeholder={t('vendor.placeholders.max')}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-primary-lime/10 border border-primary-lime/30 rounded-xl"
            >
              <span className="text-gray-900 font-medium">
                {selectedProducts.length} {t('vendor.products.productsSelected', { defaultValue: 'product(s) selected' })}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkEdit}
                  className="px-4 py-2 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-lg transition-all text-sm font-medium shadow-md"
                >
                  {t('vendor.products.bulkEdit', { defaultValue: 'Bulk Edit' })}
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all text-sm font-medium text-white shadow-md"
                >
                  {t('vendor.products.deleteSelected', { defaultValue: 'Delete Selected' })}
                </button>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </GlassCard>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          type="products"
          title={searchQuery ? t('vendor.products.noProductsFound') : t('vendor.products.noProductsYet')}
          message={
            searchQuery
              ? t('vendor.products.noProductsMatchSearch')
              : t('vendor.products.startBuildingInventory')
          }
          onAction={searchQuery ? undefined : handleAddProduct}
          actionLabel={t('vendor.products.addProduct')}
          onSecondaryAction={searchQuery ? () => setSearchQuery('') : undefined}
          secondaryActionLabel={searchQuery ? t('vendor.products.clearSearch') : undefined}
        />
      ) : viewMode === 'grid' ? (
        /* Products Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard hover={true}>
                <div className="space-y-4">
                  {/* Image */}
                  <div
                    className="relative aspect-square rounded-xl overflow-hidden group"
                    onMouseEnter={() => setHoveredImage(product.id)}
                    onMouseLeave={() => setHoveredImage(null)}
                  >
                    {product.image ? (
                      <>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Image Preview Overlay */}
                        {hoveredImage === product.id && (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="max-w-full max-h-full object-contain p-4"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewProduct(product.id)}
                          className="p-2 bg-gradient-to-r from-purple-500/90 to-pink-500/90 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all shadow-lg"
                        >
                          <Eye className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="p-2 bg-gradient-to-r from-blue-500/90 to-cyan-500/90 hover:from-blue-600 hover:to-cyan-600 rounded-lg transition-all shadow-lg"
                        >
                          <Edit className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 bg-gradient-to-r from-red-500/90 to-pink-500/90 hover:from-red-600 hover:to-pink-600 rounded-lg transition-all shadow-lg"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="absolute top-3 left-3 w-5 h-5 rounded bg-white/20 border-2 border-white/40 cursor-pointer accent-purple-500"
                    />
                    <span
                      className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                        product.status
                      )}`}
                    >
                      {product.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                  </div>

                  {/* Stats with Quick Edit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('vendor.products.price', { defaultValue: 'Price' })}</p>
                      {editingProductId === product.id && editingField === 'price' ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-16 px-2 py-1 text-sm bg-gray-100 border border-primary-lime/50 rounded text-gray-900"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveQuickEdit}
                            className="text-green-600 hover:text-green-500"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelQuickEdit}
                            className="text-red-600 hover:text-red-500"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <p
                          onClick={() => handleQuickEdit(product.id, 'price', product.price)}
                          className="text-lg font-bold text-gray-900 cursor-pointer hover:text-primary-lime transition-colors"
                        >
                          ${product.price}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('vendor.products.stock', { defaultValue: 'Stock' })}</p>
                      {editingProductId === product.id && editingField === 'stock' ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-16 px-2 py-1 text-sm bg-gray-100 border border-primary-lime/50 rounded text-gray-900"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveQuickEdit}
                            className="text-green-600 hover:text-green-500"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelQuickEdit}
                            className="text-red-600 hover:text-red-500"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p
                            onClick={() => handleQuickEdit(product.id, 'stock', product.stock)}
                            className="text-lg font-bold text-gray-900 cursor-pointer hover:text-primary-lime transition-colors"
                          >
                            {product.stock}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded ${getStockColor(product.stock)}`}>
                            {getStockLabel(product.stock)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t('vendor.products.sales', { defaultValue: 'Sales' })}</p>
                      <p className="text-sm font-semibold text-gray-900">{product.sales}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t('vendor.products.trend', { defaultValue: 'Trend' })}</p>
                      <p
                        className={`text-sm font-semibold flex items-center space-x-1 ${
                          product.trend > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {product.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{Math.abs(product.trend)}%</span>
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Products List View */
        <GlassCard hover={false}>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 text-sm text-gray-500 font-medium">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-300 cursor-pointer accent-primary-lime"
                    />
                  </th>
                  <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('vendor.products.product', { defaultValue: 'Product' })}</th>
                  <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('vendor.products.category', { defaultValue: 'Category' })}</th>
                  <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('vendor.products.price', { defaultValue: 'Price' })}</th>
                  <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('vendor.products.stock', { defaultValue: 'Stock' })}</th>
                  <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('vendor.products.sales', { defaultValue: 'Sales' })}</th>
                  <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('vendor.common.status', { defaultValue: 'Status' })}</th>
                  <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('vendor.common.actions', { defaultValue: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all group"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-300 cursor-pointer accent-primary-lime"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover ring-2 ring-gray-200 group-hover:ring-primary-lime/50 transition-all"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 ring-2 ring-gray-200 flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-primary-lime transition-colors">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.rating > 0 ? `⭐ ${product.rating} (${product.reviews} reviews)` : 'No reviews'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{product.category}</td>
                    <td className="p-4">
                      {editingProductId === product.id && editingField === 'price' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-20 px-2 py-1 text-sm bg-gray-100 border border-primary-lime/50 rounded text-gray-900"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveQuickEdit}
                            className="text-green-600 hover:text-green-500 text-lg"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelQuickEdit}
                            className="text-red-600 hover:text-red-500 text-lg"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <p
                          onClick={() => handleQuickEdit(product.id, 'price', product.price)}
                          className="text-gray-900 font-semibold cursor-pointer hover:text-primary-lime transition-colors"
                        >
                          ${product.price}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      {editingProductId === product.id && editingField === 'stock' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-20 px-2 py-1 text-sm bg-gray-100 border border-primary-lime/50 rounded text-gray-900"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveQuickEdit}
                            className="text-green-600 hover:text-green-500 text-lg"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelQuickEdit}
                            className="text-red-600 hover:text-red-500 text-lg"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p
                            onClick={() => handleQuickEdit(product.id, 'stock', product.stock)}
                            className="text-gray-900 cursor-pointer hover:text-primary-lime transition-colors font-medium"
                          >
                            {product.stock}
                          </p>
                          <span className={`px-2 py-0.5 rounded text-xs ${getStockColor(product.stock)}`}>
                            {getStockLabel(product.stock)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-gray-900 font-medium">{product.sales}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(product.status)}`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewProduct(product.id)}
                          className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Bulk Edit Modal */}
      <AnimatePresence>
        {showBulkEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowBulkEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">{t('vendor.products.bulkEditProducts', { defaultValue: 'Bulk Edit Products' })}</h3>
                <button
                  onClick={() => setShowBulkEditModal(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-500 text-sm">
                  {t('vendor.products.editing', { defaultValue: 'Editing' })} {selectedProducts.length} {t('vendor.products.products', { defaultValue: 'product(s)' })}
                </p>

                {/* Action Type */}
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">{t('vendor.products.actionType', { defaultValue: 'Action Type' })}</label>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                  >
                    <option value="">{t('vendor.products.selectAction', { defaultValue: 'Select Action...' })}</option>
                    <option value="update_status">{t('vendor.products.updateStatus', { defaultValue: 'Update Status' })}</option>
                    <option value="update_price">{t('vendor.products.updatePrice', { defaultValue: 'Update Price' })}</option>
                    <option value="update_inventory">{t('vendor.products.updateInventory', { defaultValue: 'Update Inventory' })}</option>
                    <option value="delete">{t('vendor.products.deleteProducts', { defaultValue: 'Delete Products' })}</option>
                  </select>
                </div>

                {/* Status Update Options */}
                {bulkAction === 'update_status' && (
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">{t('vendor.products.newStatus', { defaultValue: 'New Status' })}</label>
                    <select
                      value={bulkStatus}
                      onChange={(e) => setBulkStatus(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                    >
                      <option value="">{t('vendor.products.selectStatus', { defaultValue: 'Select Status...' })}</option>
                      <option value="active">{t('vendor.common.active', { defaultValue: 'Active' })} ({t('vendor.common.published', { defaultValue: 'Published' })})</option>
                      <option value="draft">{t('vendor.common.draft', { defaultValue: 'Draft' })}</option>
                      <option value="archived">{t('vendor.products.archived', { defaultValue: 'Archived' })}</option>
                    </select>
                  </div>
                )}

                {/* Price Update Options */}
                {bulkAction === 'update_price' && (
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">{t('vendor.products.applyDiscount', { defaultValue: 'Apply Discount (%)' })}</label>
                    <input
                      type="number"
                      value={bulkDiscount}
                      onChange={(e) => setBulkDiscount(e.target.value)}
                      placeholder={t('vendor.products.discountPlaceholder', { defaultValue: 'e.g., 10 for 10% off' })}
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                    />
                    <p className="text-xs text-gray-400 mt-1">{t('vendor.products.discountHint', { defaultValue: 'Enter percentage to reduce prices by' })}</p>
                  </div>
                )}

                {/* Inventory Update Options */}
                {bulkAction === 'update_inventory' && (
                  <>
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.products.inventoryAction', { defaultValue: 'Inventory Action' })}</label>
                      <select
                        value={bulkInventoryAction}
                        onChange={(e) => setBulkInventoryAction(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                      >
                        <option value="">{t('vendor.products.selectAction', { defaultValue: 'Select Action...' })}</option>
                        <option value="set">{t('vendor.products.setToValue', { defaultValue: 'Set to specific value' })}</option>
                        <option value="increase">{t('vendor.products.increaseByAmount', { defaultValue: 'Increase by amount' })}</option>
                        <option value="decrease">{t('vendor.products.decreaseByAmount', { defaultValue: 'Decrease by amount' })}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.products.value', { defaultValue: 'Value' })}</label>
                      <input
                        type="number"
                        value={bulkInventoryValue}
                        onChange={(e) => setBulkInventoryValue(e.target.value)}
                        placeholder={t('vendor.products.enterQuantity', { defaultValue: 'Enter quantity' })}
                        min="0"
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                      />
                    </div>
                  </>
                )}

                {/* Delete Warning */}
                {bulkAction === 'delete' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      {t('vendor.products.deleteWarning', { defaultValue: 'This will archive the selected product(s). This action can be reversed from the archived products section.', count: selectedProducts.length })}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowBulkEditModal(false);
                      setBulkAction('');
                      setBulkStatus('');
                      setBulkDiscount('');
                      setBulkCategory('');
                      setBulkInventoryAction('');
                      setBulkInventoryValue('');
                    }}
                    disabled={isBulkProcessing}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all disabled:opacity-50"
                  >
                    {t('vendor.common.cancel', { defaultValue: 'Cancel' })}
                  </button>
                  <button
                    onClick={async () => {
                      if (!bulkAction) {
                        toast.error('Please select an action');
                        return;
                      }

                      // Validate action-specific fields
                      if (bulkAction === 'update_status' && !bulkStatus) {
                        toast.error('Please select a status');
                        return;
                      }
                      if (bulkAction === 'update_price' && !bulkDiscount) {
                        toast.error('Please enter a discount percentage');
                        return;
                      }
                      if (bulkAction === 'update_inventory' && (!bulkInventoryAction || !bulkInventoryValue)) {
                        toast.error('Please select inventory action and enter a value');
                        return;
                      }

                      setIsBulkProcessing(true);
                      try {
                        const requestData: any = {
                          productIds: selectedProducts,
                          action: bulkAction,
                        };

                        if (bulkAction === 'update_status') {
                          requestData.status = bulkStatus;
                        } else if (bulkAction === 'update_price') {
                          requestData.priceAdjustmentType = 'percentage_decrease';
                          requestData.priceValue = parseFloat(bulkDiscount);
                        } else if (bulkAction === 'update_inventory') {
                          requestData.inventoryAdjustmentType = bulkInventoryAction;
                          requestData.inventoryValue = parseInt(bulkInventoryValue, 10);
                        }

                        const result = await api.bulkEditProducts(requestData);

                        if (result.successCount > 0) {
                          toast.success(`Successfully updated ${result.successCount} product${result.successCount > 1 ? 's' : ''}`);
                        }
                        if (result.failedCount > 0) {
                          toast.warning(`${result.failedCount} product${result.failedCount > 1 ? 's' : ''} failed to update`);
                        }

                        // Reset and refresh
                        setShowBulkEditModal(false);
                        setSelectedProducts([]);
                        setBulkAction('');
                        setBulkStatus('');
                        setBulkDiscount('');
                        setBulkCategory('');
                        setBulkInventoryAction('');
                        setBulkInventoryValue('');
                        fetchProducts();
                      } catch (err: any) {
                        toast.error('Bulk edit failed', {
                          description: err?.response?.data?.message || 'An error occurred'
                        });
                      } finally {
                        setIsBulkProcessing(false);
                      }
                    }}
                    disabled={isBulkProcessing || !bulkAction}
                    className="flex-1 px-4 py-2 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl transition-all shadow-md font-medium disabled:opacity-50 flex items-center justify-center"
                  >
                    {isBulkProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      t('vendor.products.applyChanges', { defaultValue: 'Apply Changes' })
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog Components */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </motion.div>
  );
};

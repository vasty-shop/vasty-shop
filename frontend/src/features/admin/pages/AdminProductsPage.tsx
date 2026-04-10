import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Package,
  Store,
  Tag,
  DollarSign,
  Archive,
  CheckCircle,
  FileEdit,
  AlertTriangle,
  Eye,
  MoreVertical,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2
} from 'lucide-react';
import { GlassCard } from '../../vendor/components/GlassCard';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  shopName: string;
  shopId: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'draft' | 'out_of_stock';
  image: string | null;
  createdAt: string;
}

type StatusFilter = 'all' | 'active' | 'draft' | 'out_of_stock';

export const AdminProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getProducts({ limit: 100 });
      const productsData: any[] = Array.isArray(response) ? response : (response?.data || []);

      // Transform API response to match Product interface
      const transformedProducts: Product[] = productsData.map((product: any) => ({
        id: product.id,
        name: product.name || 'Unnamed Product',
        shopName: product.shopName || product.shop?.name || 'Unknown Shop',
        shopId: product.shopId || product.shop_id || '',
        category: product.category?.name || product.categoryName || product.category || 'Uncategorized',
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        status: product.stock === 0 ? 'out_of_stock' : (product.status || 'active'),
        image: product.images?.[0]?.url || product.thumbnail || product.image || null,
        createdAt: product.createdAt || product.created_at || new Date().toISOString()
      }));

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(query) ||
          product.shopName.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && product.status !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && product.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, statusFilter, categoryFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter((p) => p.status === 'active').length,
      draft: products.filter((p) => p.status === 'draft').length,
      outOfStock: products.filter((p) => p.status === 'out_of_stock').length
    };
  }, [products]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Refresh handler
  const handleRefresh = () => {
    fetchProducts();
  };

  // View product details
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'out_of_stock':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Format status label
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.products.title')}</h1>
          <p className="text-gray-500 mt-1">
            {t('admin.products.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all flex items-center space-x-2 text-gray-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('admin.common.refresh')}</span>
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all flex items-center space-x-2 text-gray-700">
            <Download className="w-4 h-4" />
            <span>{t('admin.common.export')}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{t('admin.products.allProducts')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{t('admin.common.active')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{t('admin.cms.draft')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.draft}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <FileEdit className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{t('common.outOfStock')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.outOfStock}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters & Search */}
      <GlassCard hover={false}>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.products.searchProducts')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>

            {/* Filter Toggle & Status Filter */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl transition-all flex items-center space-x-2 ${
                  showFilters
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>{t('admin.common.filters')}</span>
              </button>

              <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
                {(['all', 'active', 'draft', 'out_of_stock'] as StatusFilter[]).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                        statusFilter === status
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {formatStatus(status)}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Extended Filters */}
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
                    <label className="text-sm text-gray-500 mb-2 block">{t('admin.products.category')}</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === 'all' ? t('admin.categories.allCategories') : cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* Products Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">{t('admin.common.loading')}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? t('admin.products.noProducts')
              : t('admin.products.noProductsYet')}
          </h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? t('admin.products.noProductsMatch')
              : t('admin.products.productsWillAppear')}
          </p>
          {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
            >
              {t('admin.common.clearFilters')}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-4 text-sm text-gray-600 font-medium">
                      {t('admin.products.productName')}
                    </th>
                    <th className="text-left p-4 text-sm text-gray-600 font-medium">{t('admin.products.shop')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-medium">
                      {t('admin.products.category')}
                    </th>
                    <th className="text-left p-4 text-sm text-gray-600 font-medium">{t('admin.products.price')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-medium">{t('admin.products.stock')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-medium">{t('admin.products.status')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-medium">
                      {t('admin.common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                    >
                      {/* Product Info */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">
                              {t('admin.products.added')} {formatDate(product.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Shop */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Store className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{product.shopName}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{product.category}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Archive className="w-4 h-4 text-gray-400" />
                          <span
                            className={`font-medium ${
                              product.stock === 0
                                ? 'text-red-600'
                                : product.stock < 10
                                ? 'text-yellow-600'
                                : 'text-gray-900'
                            }`}
                          >
                            {product.stock}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusBadge(
                            product.status
                          )}`}
                        >
                          {formatStatus(product.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all"
                            title={t('admin.common.viewDetails')}
                          >
                            <Eye className="w-4 h-4 text-indigo-600" />
                          </button>
                          <button
                            className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all"
                            title="More Actions"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm">
                {t('admin.common.showing')} {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} {t('admin.common.of')} {filteredProducts.length}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white hover:bg-gray-50 rounded-lg transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg transition-all text-sm font-medium ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white hover:bg-gray-50 rounded-lg transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Product Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowDetailsModal(false);
              setSelectedProduct(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                <div className="flex items-center space-x-4">
                  {selectedProduct.image ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-gray-500">{selectedProduct.shopName}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedProduct(null);
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusBadge(
                      selectedProduct.status
                    )}`}
                  >
                    {formatStatus(selectedProduct.status)}
                  </span>
                  <p className="text-sm text-gray-500">
                    Added: {formatDate(selectedProduct.createdAt)}
                  </p>
                </div>

                {/* Product Details */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Package className="w-5 h-5 text-indigo-600" />
                    <span>{t('admin.products.productDetails')}</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">{t('admin.products.category')}</p>
                      <p className="text-gray-900 font-medium">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">{t('admin.products.price')}</p>
                      <p className="text-gray-900 font-medium">
                        {formatPrice(selectedProduct.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">{t('admin.products.stock')}</p>
                      <p
                        className={`font-medium ${
                          selectedProduct.stock === 0
                            ? 'text-red-600'
                            : selectedProduct.stock < 10
                            ? 'text-yellow-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {selectedProduct.stock} units
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">{t('admin.products.shop')}</p>
                      <p className="text-gray-900 font-medium">{selectedProduct.shopName}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                  >
                    {t('admin.common.close')}
                  </button>
                  <button className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all">
                    {t('admin.products.viewProduct')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

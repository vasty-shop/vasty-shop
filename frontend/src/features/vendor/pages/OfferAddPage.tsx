import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Percent,
  DollarSign,
  Truck,
  Gift,
  Calendar,
  Users,
  Tag,
  Package,
  Loader2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../../lib/api';
import { extractRouteContext } from '../../../lib/navigation-utils';
import { GlassCard } from '../components/GlassCard';

interface FormData {
  name: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping' | 'buy_x_get_y';
  discountValue: number;
  minPurchase: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  perCustomerLimit: number;
  products: string[];
  categories: string[];
  applyTo: 'all' | 'categories' | 'products';
}

export const OfferAddPage: React.FC = () => {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const { shopId } = extractRouteContext(params);
  const offerId = params.offerId;
  const isEditMode = !!offerId;

  const [loading, setLoading] = useState(false);
  const [loadingOffer, setLoadingOffer] = useState(isEditMode);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    type: 'percentage',
    discountValue: 0,
    minPurchase: 0,
    startDate: '',
    endDate: '',
    usageLimit: 0,
    perCustomerLimit: 1,
    products: [],
    categories: [],
    applyTo: 'all',
  });

  // Fetch categories and products
  useEffect(() => {
    const fetchData = async () => {
      if (!shopId) return;

      try {
        setLoadingData(true);
        const [categoriesRes, productsRes] = await Promise.all([
          api.getVendorCategories(),
          api.getVendorProducts({ limit: 1000 })
        ]);

        setCategories(Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes as any)?.data || []);
        setProducts(Array.isArray(productsRes) ? productsRes : (productsRes as any)?.data || []);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load categories and products');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [shopId]);

  // Load offer for edit mode
  useEffect(() => {
    const loadOffer = async () => {
      if (!offerId || !shopId) return;

      try {
        setLoadingOffer(true);
        const offer = await api.getOffer(offerId);

        setFormData({
          name: offer.name || '',
          code: offer.code || '',
          type: offer.type || 'percentage',
          discountValue: offer.value || 0,
          minPurchase: offer.minPurchase || 0,
          startDate: offer.validFrom ? offer.validFrom.split('T')[0] : '',
          endDate: offer.validTo ? offer.validTo.split('T')[0] : '',
          usageLimit: offer.totalUsageLimit || 0,
          perCustomerLimit: offer.perUserLimit || 1,
          products: offer.specificProducts || [],
          categories: offer.specificCategories || [],
          applyTo:
            (offer.specificCategories && offer.specificCategories.length > 0) ? 'categories' :
            (offer.specificProducts && offer.specificProducts.length > 0) ? 'products' :
            'all'
        });
      } catch (error: any) {
        console.error('Failed to load offer:', error);
        toast.error('Failed to load offer');
        navigate(`/shop/${shopId}/vendor/offers`);
      } finally {
        setLoadingOffer(false);
      }
    };

    loadOffer();
  }, [offerId, shopId, navigate]);

  const generateCode = () => {
    const code = 'PROMO' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData({ ...formData, code });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Offer name is required');
      return;
    }
    if (!formData.code.trim() || formData.code.length < 3) {
      toast.error('Coupon code must be at least 3 characters');
      return;
    }
    if (formData.type !== 'free_shipping' && formData.discountValue <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }
    if (formData.type === 'percentage' && formData.discountValue > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error('Start and end dates are required');
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }
    if (formData.perCustomerLimit < 1) {
      toast.error('Per customer limit must be at least 1');
      return;
    }

    try {
      setLoading(true);

      // Map form data to backend DTO
      const offerData = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        type: formData.type,
        value: formData.discountValue,
        minPurchase: formData.minPurchase || 0,
        validFrom: new Date(formData.startDate + 'T00:00:00').toISOString(),
        validTo: new Date(formData.endDate + 'T23:59:59').toISOString(),
        totalUsageLimit: formData.usageLimit > 0 ? formData.usageLimit : null,
        perUserLimit: formData.perCustomerLimit,
        specificProducts: formData.applyTo === 'products' ? formData.products : [],
        specificCategories: formData.applyTo === 'categories' ? formData.categories : [],
      };

      if (isEditMode && offerId) {
        await api.updateOffer(offerId, offerData);
        toast.success('Offer updated successfully');
      } else {
        await api.createOffer(offerData);
        toast.success('Offer created successfully');
      }

      navigate(`/shop/${shopId}/vendor/offers`);
    } catch (error: any) {
      console.error('Error saving offer:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save offer';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const offerTypes = [
    { value: 'percentage', label: 'Percentage Off', icon: Percent, description: 'Discount by percentage' },
    { value: 'fixed', label: 'Fixed Amount', icon: DollarSign, description: 'Fixed dollar discount' },
    { value: 'free_shipping', label: 'Free Shipping', icon: Truck, description: 'Free delivery' },
    { value: 'buy_x_get_y', label: 'Buy One Get One', icon: Gift, description: 'BOGO deals' }
  ];

  if (loadingOffer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary-lime" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/shop/${shopId}/vendor/offers`)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Offer' : 'Create New Offer'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditMode ? 'Update offer details' : 'Set up a new promotional offer'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-all shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{isEditMode ? 'Update Offer' : 'Create Offer'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <GlassCard hover={false}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500 mb-2 block">Offer Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                placeholder={t('vendor.placeholders.offerName')}
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-2 block">Coupon Code *</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                  placeholder="SUMMER24"
                  required
                />
                <button
                  type="button"
                  onClick={generateCode}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all whitespace-nowrap"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Offer Type */}
        <GlassCard hover={false}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Offer Type *</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {offerTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  setFormData({ ...formData, type: type.value as any });
                }}
                className={`p-4 rounded-xl transition-all text-left border-2 ${
                  formData.type === type.value
                    ? 'bg-primary-lime/10 border-primary-lime shadow-lg'
                    : 'bg-gray-100 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <type.icon className={`w-6 h-6 mb-2 ${
                  formData.type === type.value ? 'text-primary-lime' : 'text-gray-500'
                }`} />
                <h3 className={`font-medium text-sm ${
                  formData.type === type.value ? 'text-gray-900' : 'text-gray-700'
                }`}>{type.label}</h3>
                <p className={`text-xs mt-1 ${
                  formData.type === type.value ? 'text-gray-600' : 'text-gray-500'
                }`}>{type.description}</p>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Discount Configuration */}
        <GlassCard hover={false}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Discount Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formData.type !== 'free_shipping' && (
              <div>
                <label className="text-sm text-gray-500 mb-2 block">
                  {formData.type === 'percentage' ? 'Discount Percentage *' : 'Discount Amount *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                    placeholder="25"
                    min="0"
                    max={formData.type === 'percentage' ? 100 : undefined}
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    {formData.type === 'percentage' ? '%' : '$'}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-500 mb-2 block">Minimum Purchase Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                  placeholder="50"
                  min="0"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Leave 0 for no minimum</p>
            </div>
          </div>
        </GlassCard>

        {/* Apply To */}
        <GlassCard hover={false}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply To</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, applyTo: 'all', products: [], categories: [] })}
                className={`p-4 rounded-xl transition-all text-left border-2 ${
                  formData.applyTo === 'all'
                    ? 'bg-primary-lime/10 border-primary-lime shadow-lg'
                    : 'bg-gray-100 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Tag className={`w-5 h-5 mb-2 ${
                  formData.applyTo === 'all' ? 'text-primary-lime' : 'text-gray-500'
                }`} />
                <h3 className={`font-medium ${
                  formData.applyTo === 'all' ? 'text-gray-900' : 'text-gray-700'
                }`}>All Products</h3>
                <p className={`text-sm mt-1 ${
                  formData.applyTo === 'all' ? 'text-gray-600' : 'text-gray-500'
                }`}>Apply to entire store</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, applyTo: 'categories', products: [] })}
                className={`p-4 rounded-xl transition-all text-left border-2 ${
                  formData.applyTo === 'categories'
                    ? 'bg-primary-lime/10 border-primary-lime shadow-lg'
                    : 'bg-gray-100 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Package className={`w-5 h-5 mb-2 ${
                  formData.applyTo === 'categories' ? 'text-primary-lime' : 'text-gray-500'
                }`} />
                <h3 className={`font-medium ${
                  formData.applyTo === 'categories' ? 'text-gray-900' : 'text-gray-700'
                }`}>Specific Categories</h3>
                <p className={`text-sm mt-1 ${
                  formData.applyTo === 'categories' ? 'text-gray-600' : 'text-gray-500'
                }`}>Select categories</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, applyTo: 'products', categories: [] })}
                className={`p-4 rounded-xl transition-all text-left border-2 ${
                  formData.applyTo === 'products'
                    ? 'bg-primary-lime/10 border-primary-lime shadow-lg'
                    : 'bg-gray-100 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Package className={`w-5 h-5 mb-2 ${
                  formData.applyTo === 'products' ? 'text-primary-lime' : 'text-gray-500'
                }`} />
                <h3 className={`font-medium ${
                  formData.applyTo === 'products' ? 'text-gray-900' : 'text-gray-700'
                }`}>Specific Products</h3>
                <p className={`text-sm mt-1 ${
                  formData.applyTo === 'products' ? 'text-gray-600' : 'text-gray-500'
                }`}>Choose products</p>
              </button>
            </div>

            {/* Category Selection */}
            {formData.applyTo === 'categories' && (
              <div>
                <label className="text-sm text-gray-500 mb-2 block">Select Categories</label>
                <select
                  multiple
                  value={formData.categories}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({ ...formData, categories: selected });
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 min-h-[200px]"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="py-2">
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple categories</p>
                {formData.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.categories.map((catId) => {
                      const cat = categories.find(c => c.id === catId);
                      return cat ? (
                        <span key={catId} className="px-3 py-1 bg-primary-lime/10 text-primary-lime rounded-lg text-sm flex items-center space-x-1">
                          <span>{cat.name}</span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, categories: formData.categories.filter(id => id !== catId) })}
                            className="hover:text-primary-lime/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Product Selection */}
            {formData.applyTo === 'products' && (
              <div>
                <label className="text-sm text-gray-500 mb-2 block">Select Products</label>
                <select
                  multiple
                  value={formData.products}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({ ...formData, products: selected });
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 min-h-[200px]"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id} className="py-2">
                      {product.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple products</p>
                {formData.products.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.products.map((prodId) => {
                      const product = products.find(p => p.id === prodId);
                      return product ? (
                        <span key={prodId} className="px-3 py-1 bg-primary-lime/10 text-primary-lime rounded-lg text-sm flex items-center space-x-1">
                          <span>{product.name}</span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, products: formData.products.filter(id => id !== prodId) })}
                            className="hover:text-primary-lime/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </GlassCard>

        {/* Schedule */}
        <GlassCard hover={false}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500 mb-2 block">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-2 block">End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                required
              />
            </div>
          </div>

          {formData.startDate && formData.endDate && (
            <div className="flex items-center space-x-3 p-4 bg-gray-100 rounded-xl mt-4 border border-gray-200">
              <Calendar className="w-5 h-5 text-primary-lime" />
              <div>
                <p className="text-gray-900 font-medium">Duration</p>
                <p className="text-gray-500 text-sm">
                  {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Usage Limits */}
        <GlassCard hover={false}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500 mb-2 block">Total Usage Limit</label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                placeholder="1000"
                min="0"
              />
              <p className="text-xs text-gray-400 mt-1">Leave 0 for unlimited</p>
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-2 block">Per Customer Limit *</label>
              <input
                type="number"
                value={formData.perCustomerLimit}
                onChange={(e) => setFormData({ ...formData, perCustomerLimit: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                placeholder="1"
                min="1"
                required
              />
              <p className="text-xs text-gray-400 mt-1">How many times each customer can use this offer</p>
            </div>
          </div>
        </GlassCard>
      </form>
    </div>
  );
};

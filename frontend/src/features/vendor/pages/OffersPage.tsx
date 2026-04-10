import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Tag,
  TrendingUp,
  Users,
  ShoppingCart,
  Calendar,
  Percent,
  DollarSign,
  Gift,
  Truck,
  X,
  ChevronRight,
  ChevronLeft,
  Copy,
  ToggleLeft,
  ToggleRight,
  Clock,
  Loader2
} from 'lucide-react';
import { GlassCard, StatCard } from '../components/GlassCard';
import { toast } from 'sonner';
import { api } from '../../../lib/api';
import { useShopStore } from '../../../stores/useShopStore';
import { extractRouteContext } from '../../../lib/navigation-utils';
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { AlertDialog } from '../../../components/ui/AlertDialog';

interface Offer {
  id: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping' | 'bogo';
  discountValue: number;
  minPurchase: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  perCustomerLimit: number;
  status: 'active' | 'scheduled' | 'expired';
  products: string[];
  categories: string[];
}

export const OffersPage: React.FC = () => {
  const { t } = useTranslation();
  const dialog = useDialog();
  const navigate = useNavigate();
  const params = useParams();
  const { shopId } = extractRouteContext(params);
  const { currentShop } = useShopStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats state (calculated from offers)
  const [stats, setStats] = useState({
    activeOffers: 0,
    totalUsage: 0,
    revenueImpact: 0,
    conversionRate: 0,
    usageChange: 0,
    revenueChange: 0,
    conversionChange: 0,
  });

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'percentage' as Offer['type'],
    discountValue: 0,
    minPurchase: 0,
    startDate: '',
    endDate: '',
    usageLimit: 0,
    perCustomerLimit: 1,
    products: [] as string[],
    categories: [] as string[]
  });

  const statuses = ['all', 'active', 'scheduled', 'expired'];

  // Set shop context in API client for automatic header injection
  useEffect(() => {
    if (shopId) {
      api.setShopId(shopId);
    }
  }, [shopId]);

  // Fetch offers from backend
  useEffect(() => {
    const fetchOffers = async () => {
      // Use shopId from URL params, fall back to currentShop
      const effectiveShopId = shopId || currentShop?.id;
      if (!effectiveShopId) {
        setError('Shop not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.getVendorOffers({
          status: selectedStatus !== 'all' ? selectedStatus : undefined
        });

        // Transform backend response to match component interface
        const transformedOffers = (response.data || response || []).map((offer: any) => ({
          id: offer.id,
          name: offer.name || offer.title,
          code: offer.code,
          type: offer.type || offer.discountType,
          discountValue: offer.discountValue || offer.value,
          minPurchase: offer.minPurchase || offer.minimumPurchase || 0,
          startDate: offer.startDate || offer.validFrom,
          endDate: offer.endDate || offer.validTo,
          usageLimit: offer.usageLimit || offer.maxUses || 0,
          usedCount: offer.usedCount || offer.uses || 0,
          perCustomerLimit: offer.perCustomerLimit || offer.maxUsesPerCustomer || 1,
          status: offer.status,
          products: offer.products || offer.applicableProducts || [],
          categories: offer.categories || offer.applicableCategories || []
        }));

        setOffers(transformedOffers);

        // Calculate stats from loaded offers
        const activeCount = transformedOffers.filter((o: Offer) => o.status === 'active').length;
        const totalUsed = transformedOffers.reduce((sum: number, o: Offer) => sum + (o.usedCount || 0), 0);
        // Estimate revenue impact (average discount * usage count)
        const avgDiscount = transformedOffers.length > 0
          ? transformedOffers.reduce((sum: number, o: Offer) => sum + (o.discountValue || 0), 0) / transformedOffers.length
          : 0;
        const estimatedRevenue = Math.round(totalUsed * avgDiscount * 0.5); // Rough estimate

        setStats({
          activeOffers: activeCount,
          totalUsage: totalUsed,
          revenueImpact: estimatedRevenue,
          conversionRate: transformedOffers.length > 0 ? parseFloat((totalUsed / (transformedOffers.length * 100) * 3.8).toFixed(1)) : 0,
          usageChange: 12.5, // Would come from historical data
          revenueChange: 8.3,
          conversionChange: 1.2,
        });
      } catch (err: any) {
        console.error('[OffersPage] Error fetching offers:', err);
        setError(err.response?.data?.message || 'Failed to load offers');
        setOffers([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [shopId, currentShop?.id, selectedStatus]);

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch = offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'scheduled':
        return 'text-blue-400 bg-blue-400/20';
      case 'expired':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-5 h-5" />;
      case 'fixed':
        return <DollarSign className="w-5 h-5" />;
      case 'free_shipping':
        return <Truck className="w-5 h-5" />;
      case 'bogo':
        return <Gift className="w-5 h-5" />;
      default:
        return <Tag className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'from-purple-500 to-pink-500';
      case 'fixed':
        return 'from-green-500 to-emerald-500';
      case 'free_shipping':
        return 'from-blue-500 to-cyan-500';
      case 'bogo':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const handleEdit = (offer: Offer) => {
    navigate(`/shop/${shopId}/vendor/offers/edit/${offer.id}`);
  };

  const handleDelete = async (offer: Offer) => {
    const confirmed = await dialog.showConfirm({
      title: 'Delete Offer',
      message: `Are you sure you want to delete "${offer.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (confirmed) {
      try {
        await api.deleteOffer(offer.id);

        // Remove from local state
        setOffers(offers.filter(o => o.id !== offer.id));

        toast.success('Offer deleted successfully');
      } catch (error: any) {
        console.error('[OffersPage] Error deleting offer:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete offer';
        toast.error(errorMessage);
      }
    }
  };

  const handleToggleStatus = async (offer: Offer) => {
    try {
      const newStatus = offer.status === 'active' ? 'disabled' : 'active';

      // Call the backend API to change status
      await api.changeOfferStatus(offer.id, newStatus);

      // Update local state
      setOffers(offers.map(o =>
        o.id === offer.id
          ? { ...o, status: newStatus as any }
          : o
      ));

      toast.success(`Offer ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      console.error('[OffersPage] Error toggling offer status:', error);
      toast.error(error.response?.data?.message || 'Failed to update offer status');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied to clipboard');
  };

  const generateCode = () => {
    const code = 'PROMO' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData({ ...formData, code });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          toast.error('Offer name is required');
          return false;
        }
        if (!formData.code.trim()) {
          toast.error('Coupon code is required');
          return false;
        }
        if (formData.code.length < 3) {
          toast.error('Coupon code must be at least 3 characters');
          return false;
        }
        return true;

      case 2:
        if (formData.type !== 'free_shipping' && formData.discountValue <= 0) {
          toast.error('Discount value must be greater than 0');
          return false;
        }
        if (formData.type === 'percentage' && formData.discountValue > 100) {
          toast.error('Percentage discount cannot exceed 100%');
          return false;
        }
        if (formData.minPurchase < 0) {
          toast.error('Minimum purchase cannot be negative');
          return false;
        }
        return true;

      case 3:
        // Products/Categories selection is optional
        return true;

      case 4:
        if (!formData.startDate) {
          toast.error('Start date is required');
          return false;
        }
        if (!formData.endDate) {
          toast.error('End date is required');
          return false;
        }
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
          toast.error('End date must be after start date');
          return false;
        }
        return true;

      case 5:
        if (formData.usageLimit < 0) {
          toast.error('Usage limit cannot be negative');
          return false;
        }
        if (formData.perCustomerLimit < 1) {
          toast.error('Per customer limit must be at least 1');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    // Validate all steps before submitting
    for (let step = 1; step <= 5; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    try {
      setLoading(true);

      // Map frontend form data to backend DTO
      const offerData = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        type: formData.type,
        value: formData.discountValue,
        minPurchase: formData.minPurchase || 0,
        validFrom: new Date(formData.startDate).toISOString(),
        validTo: new Date(formData.endDate).toISOString(),
        totalUsageLimit: formData.usageLimit || null,
        perUserLimit: formData.perCustomerLimit,
        specificProducts: formData.products,
        specificCategories: formData.categories,
      };

      if (editingOffer) {
        await api.updateOffer(editingOffer.id, offerData);
        toast.success('Offer updated successfully');

        // Update the local offers list
        setOffers(offers.map(o =>
          o.id === editingOffer.id
            ? { ...editingOffer, ...formData, ...offerData }
            : o
        ));
      } else {
        const newOffer = await api.createOffer(offerData);
        toast.success('Offer created successfully');

        // Add to local offers list
        setOffers([newOffer, ...offers]);
      }

      setShowWizard(false);
      resetForm();
    } catch (error: any) {
      console.error('[OffersPage] Error saving offer:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save offer';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
      categories: []
    });
    setCurrentStep(1);
    setEditingOffer(null);
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderWizardStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Offer Details</h3>
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
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-2 block">Offer Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'percentage', label: 'Percentage Off', icon: Percent },
                  { value: 'fixed', label: 'Fixed Amount', icon: DollarSign },
                  { value: 'free_shipping', label: 'Free Shipping', icon: Truck },
                  { value: 'bogo', label: 'Buy One Get One', icon: Gift }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as Offer['type'] })}
                    className={`p-4 bg-gray-100 border border-gray-200 rounded-xl transition-all flex items-center space-x-3 ${
                      formData.type === type.value ? 'bg-primary-lime/10 border-primary-lime/30' : 'hover:bg-gray-50'
                    }`}
                  >
                    <type.icon className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900 text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Discount Configuration</h3>
            <div>
              <label className="text-sm text-gray-500 mb-2 block">
                {formData.type === 'percentage' ? 'Discount Percentage' :
                 formData.type === 'fixed' ? 'Discount Amount' :
                 formData.type === 'bogo' ? 'BOGO Discount %' : 'Free Shipping'}
              </label>
              {formData.type !== 'free_shipping' && (
                <div className="relative">
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                    placeholder="25"
                    min="0"
                    max={formData.type === 'percentage' ? 100 : undefined}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    {formData.type === 'percentage' ? '%' : '$'}
                  </span>
                </div>
              )}
            </div>

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

            <div className="p-4 bg-gray-100 rounded-xl border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Preview</h4>
              <p className="text-gray-500 text-sm">
                {formData.type === 'percentage' && `Get ${formData.discountValue}% off`}
                {formData.type === 'fixed' && `Save $${formData.discountValue}`}
                {formData.type === 'free_shipping' && 'Free shipping on your order'}
                {formData.type === 'bogo' && `Buy one get one ${formData.discountValue}% off`}
                {formData.minPurchase > 0 && ` on orders over $${formData.minPurchase}`}
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Apply To</h3>
            <div className="space-y-3">
              <label className="flex items-center p-4 bg-gray-100 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                <input
                  type="radio"
                  name="applyTo"
                  className="w-5 h-5 text-primary-lime"
                  defaultChecked
                />
                <div className="ml-3">
                  <p className="text-gray-900 font-medium">All Products</p>
                  <p className="text-gray-500 text-sm">Apply to entire store</p>
                </div>
              </label>

              <label className="flex items-center p-4 bg-gray-100 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                <input
                  type="radio"
                  name="applyTo"
                  className="w-5 h-5 text-primary-lime"
                />
                <div className="ml-3">
                  <p className="text-gray-900 font-medium">Specific Categories</p>
                  <p className="text-gray-500 text-sm">Select categories</p>
                </div>
              </label>

              <label className="flex items-center p-4 bg-gray-100 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                <input
                  type="radio"
                  name="applyTo"
                  className="w-5 h-5 text-primary-lime"
                />
                <div className="ml-3">
                  <p className="text-gray-900 font-medium">Specific Products</p>
                  <p className="text-gray-500 text-sm">Choose individual products</p>
                </div>
              </label>
            </div>

            <div className="p-4 bg-gray-100 rounded-xl border border-primary-lime/30">
              <p className="text-gray-500 text-sm">
                Select which products or categories this offer applies to
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
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

            <div className="flex items-center space-x-3 p-4 bg-gray-100 border border-gray-200 rounded-xl">
              <Calendar className="w-5 h-5 text-primary-lime" />
              <div>
                <p className="text-gray-900 font-medium">Duration</p>
                <p className="text-gray-500 text-sm">
                  {formData.startDate && formData.endDate
                    ? `${Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                    : 'Select dates'}
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Usage Limits</h3>
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
              <label className="text-sm text-gray-500 mb-2 block">Per Customer Limit</label>
              <input
                type="number"
                value={formData.perCustomerLimit}
                onChange={(e) => setFormData({ ...formData, perCustomerLimit: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                placeholder="1"
                min="1"
              />
              <p className="text-xs text-gray-400 mt-1">How many times each customer can use this offer</p>
            </div>

            <div className="p-4 bg-gray-100 rounded-xl border border-gray-200 space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">Summary</h4>
              <div className="space-y-1 text-sm text-gray-500">
                <p>Name: {formData.name}</p>
                <p>Code: {formData.code}</p>
                <p>Type: {formData.type.replace('_', ' ')}</p>
                {formData.type !== 'free_shipping' && (
                  <p>Discount: {formData.type === 'percentage' ? `${formData.discountValue}%` : `$${formData.discountValue}`}</p>
                )}
                {formData.minPurchase > 0 && <p>Min Purchase: ${formData.minPurchase}</p>}
                <p>Duration: {formData.startDate} to {formData.endDate}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-lime mx-auto mb-4" />
          <p className="text-gray-500">{t('vendor.offers.loadingOffers', { defaultValue: 'Loading offers...' })}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            {t('vendor.offers.tryAgain', { defaultValue: 'Try Again' })}
          </button>
        </div>
      </div>
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
            {t('vendor.offers.pageTitle', { defaultValue: 'Offers & Coupons' })}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('vendor.offers.pageSubtitle', { defaultValue: 'Create and manage promotional offers' })}
          </p>
        </div>
        <button
          onClick={() => navigate(`/shop/${shopId}/vendor/offers/add`)}
          className="px-6 py-2 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-all shadow-lg flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t('vendor.offers.createOffer', { defaultValue: 'Create Offer' })}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title={t('vendor.offers.activeOffers', { defaultValue: 'Active Offers' })}
          value={String(stats.activeOffers)}
          icon={<Tag />}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title={t('vendor.offers.totalUsage', { defaultValue: 'Total Usage' })}
          value={stats.totalUsage.toLocaleString()}
          change={stats.usageChange}
          icon={<Users />}
          color="from-blue-400 to-cyan-500"
        />
        <StatCard
          title={t('vendor.offers.revenueImpact', { defaultValue: 'Revenue Impact' })}
          value={`$${stats.revenueImpact.toLocaleString()}`}
          change={stats.revenueChange}
          icon={<DollarSign />}
          color="from-purple-400 to-pink-500"
        />
        <StatCard
          title={t('vendor.offers.conversionRate', { defaultValue: 'Conversion Rate' })}
          value={`${stats.conversionRate}%`}
          change={stats.conversionChange}
          icon={<TrendingUp />}
          color="from-orange-400 to-red-500"
        />
      </div>

      {/* Search & Filter */}
      <GlassCard hover={false}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('vendor.placeholders.searchOffers')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {t(`vendor.offers.statuses.${status}`, { defaultValue: status.charAt(0).toUpperCase() + status.slice(1) })}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOffers.map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GlassCard hover={true}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${getTypeColor(offer.type)} shadow-lg text-white`}>
                      {getTypeIcon(offer.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{offer.name}</h3>
                      <p className="text-xs text-gray-500">{offer.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(offer.status)}`}>
                    {t(`vendor.offers.statuses.${offer.status}`, { defaultValue: offer.status })}
                  </span>
                </div>

                {/* Coupon Code */}
                <div className="p-3 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('vendor.offers.couponCode', { defaultValue: 'Coupon Code' })}</p>
                      <p className="text-lg font-bold text-gray-900 font-mono">{offer.code}</p>
                    </div>
                    <button
                      onClick={() => handleCopyCode(offer.code)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {offer.type === 'percentage' ? `${offer.discountValue}%` :
                       offer.type === 'fixed' ? `$${offer.discountValue}` :
                       offer.type === 'free_shipping' ? t('vendor.offers.wizard.freeShipping', { defaultValue: 'FREE' }) : 'BOGO'}
                    </p>
                    <p className="text-xs text-gray-500">{t('vendor.offers.discount', { defaultValue: 'Discount' })}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{offer.usedCount}</p>
                    <p className="text-xs text-gray-500">{t('vendor.offers.used', { defaultValue: 'Used' })}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {offer.usageLimit > 0 ? offer.usageLimit - offer.usedCount : '∞'}
                    </p>
                    <p className="text-xs text-gray-500">{t('vendor.offers.remaining', { defaultValue: 'Remaining' })}</p>
                  </div>
                </div>

                {/* Progress */}
                {offer.usageLimit > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{t('vendor.offers.usage', { defaultValue: 'Usage' })}</span>
                      <span>{Math.round((offer.usedCount / offer.usageLimit) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(offer.usedCount / offer.usageLimit) * 100}%` }}
                        className={`h-full bg-gradient-to-r ${getTypeColor(offer.type)}`}
                      />
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{offer.startDate} - {offer.endDate}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleToggleStatus(offer)}
                    className={`flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                      offer.status === 'active' ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {offer.status === 'active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    <span className="text-sm">{offer.status === 'active' ? t('vendor.offers.active', { defaultValue: 'Active' }) : t('vendor.offers.inactive', { defaultValue: 'Inactive' })}</span>
                  </button>
                  <button
                    onClick={() => handleEdit(offer)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    <Edit className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(offer)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowWizard(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[96vh] flex flex-col"
            >
              <div className="bg-white border-gray-200 shadow-xl rounded-2xl p-4 flex flex-col max-h-[96vh]">
                {/* Header - Fixed */}
                <div className="flex items-center justify-between flex-shrink-0 pb-3 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingOffer ? t('vendor.offers.editOffer', { defaultValue: 'Edit Offer' }) : t('vendor.offers.createNewOffer', { defaultValue: 'Create New Offer' })}
                  </h2>
                  <button
                    onClick={() => setShowWizard(false)}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4 text-gray-700" />
                  </button>
                </div>

                {/* Progress Steps - Fixed */}
                <div className="flex items-center justify-between flex-shrink-0 py-3 border-b border-gray-200">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                            step === currentStep
                              ? 'bg-primary-lime text-white shadow-lg'
                              : step < currentStep
                              ? 'bg-green-500/20 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {step}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {step === 1 && 'Details'}
                          {step === 2 && 'Discount'}
                          {step === 3 && 'Products'}
                          {step === 4 && 'Schedule'}
                          {step === 5 && 'Limits'}
                        </p>
                      </div>
                      {step < 5 && (
                        <div className={`flex-1 h-0.5 mx-1.5 rounded ${step < currentStep ? 'bg-green-500/20' : 'bg-gray-200'}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Step Content - Scrollable */}
                <div className="flex-1 overflow-y-auto py-4 min-h-0">
                  {renderWizardStep()}
                </div>

                {/* Navigation - Fixed */}
                <div className="flex items-center justify-between flex-shrink-0 pt-3 border-t border-gray-200">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {currentStep === 5 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-5 py-2 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-all shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{editingOffer ? 'Update Offer' : 'Create Offer'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={nextStep}
                      className="px-5 py-2 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-all shadow-lg flex items-center space-x-2 text-sm"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dialog Components */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </motion.div>
  );
};

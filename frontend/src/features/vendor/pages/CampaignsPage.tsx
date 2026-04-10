import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Eye,
  MousePointer,
  ShoppingCart,
  Clock,
  Zap,
  Snowflake,
  Gift,
  Star,
  Sparkles,
  X,
  Upload,
  Mail,
  Check,
  RefreshCw,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { GlassCard, StatCard } from '../components/GlassCard';
import { toast } from 'sonner';
import { api } from '../../../lib/api';
import { useShopStore } from '../../../stores/useShopStore';
import { extractRouteContext } from '../../../lib/navigation-utils';
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { AlertDialog } from '../../../components/ui/AlertDialog';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'flash_sale' | 'seasonal' | 'clearance' | 'new_arrival' | 'holiday' | 'exclusive';
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'completed' | 'draft';
  bannerImage: string;
  products: string[];
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  emailNotification: boolean;
}

export const CampaignsPage: React.FC = () => {
  const { t } = useTranslation();
  const dialog = useDialog();
  const params = useParams();
  const { shopId } = extractRouteContext(params);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set shop context in API client for automatic header injection
  useEffect(() => {
    if (shopId) {
      api.setShopId(shopId);
    }
  }, [shopId]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'flash_sale' as Campaign['type'],
    startDate: '',
    endDate: '',
    emailNotification: false,
    products: [] as string[]
  });

  const statuses = ['all', 'active', 'scheduled', 'completed', 'draft'];

  // Get shop from shop store
  const { currentShop } = useShopStore();

  const fetchCampaigns = async () => {
    const effectiveShopId = shopId || currentShop?.id;
    if (!effectiveShopId) {
      setError('Shop context not found. Please login again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // shopId will be automatically added via x-shop-id header in api-client.ts
      const response = await api.getVendorCampaigns({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        limit: 100
      });

      // Transform API response to match component interface
      const transformedCampaigns: Campaign[] = (response.data || response || []).map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name || 'Unnamed Campaign',
        description: campaign.description || '',
        type: campaign.type || 'flash_sale',
        startDate: campaign.startDate || new Date().toISOString().split('T')[0],
        endDate: campaign.endDate || new Date().toISOString().split('T')[0],
        status: campaign.status || 'draft',
        bannerImage: campaign.bannerImage || campaign.banner || '',
        products: campaign.products || [],
        impressions: campaign.impressions || campaign.analytics?.impressions || 0,
        clicks: campaign.clicks || campaign.analytics?.clicks || 0,
        conversions: campaign.conversions || campaign.analytics?.conversions || 0,
        revenue: campaign.revenue || campaign.analytics?.revenue || 0,
        emailNotification: campaign.emailNotification || false
      }));

      setCampaigns(transformedCampaigns);
    } catch (err: any) {
      console.error('Failed to fetch campaigns:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to load campaigns';
      setError(errorMessage);
      toast.error('Error', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [selectedStatus]);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'scheduled':
        return 'text-blue-400 bg-blue-400/20';
      case 'completed':
        return 'text-gray-400 bg-gray-400/20';
      case 'draft':
        return 'text-yellow-400 bg-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flash_sale':
        return <Zap className="w-5 h-5" />;
      case 'seasonal':
        return <Snowflake className="w-5 h-5" />;
      case 'clearance':
        return <TrendingUp className="w-5 h-5" />;
      case 'new_arrival':
        return <Sparkles className="w-5 h-5" />;
      case 'holiday':
        return <Gift className="w-5 h-5" />;
      case 'exclusive':
        return <Star className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flash_sale':
        return 'from-orange-500 to-red-500';
      case 'seasonal':
        return 'from-blue-500 to-cyan-500';
      case 'clearance':
        return 'from-green-500 to-emerald-500';
      case 'new_arrival':
        return 'from-purple-500 to-pink-500';
      case 'holiday':
        return 'from-red-500 to-pink-500';
      case 'exclusive':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      emailNotification: campaign.emailNotification,
      products: campaign.products
    });
    setSelectedImage(campaign.bannerImage);
    setShowModal(true);
  };

  const handleDelete = async (campaign: Campaign) => {
    const confirmed = await dialog.showConfirm({
      title: 'Delete Campaign',
      message: `Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      await api.deleteCampaign(campaign.id);
      toast.success('Campaign deleted successfully');
      fetchCampaigns();
    } catch (err: any) {
      toast.error('Failed to delete campaign', {
        description: err?.response?.data?.message || 'An error occurred'
      });
    }
  };

  const handleDuplicate = (campaign: Campaign) => {
    setFormData({
      name: `${campaign.name} (Copy)`,
      description: campaign.description,
      type: campaign.type,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      emailNotification: campaign.emailNotification,
      products: campaign.products
    });
    setSelectedImage(campaign.bannerImage);
    setEditingCampaign(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const campaignData = {
        ...formData,
        bannerImage: selectedImage,
        shopId: shopId || currentShop?.id
      };

      if (editingCampaign) {
        await api.updateCampaign(editingCampaign.id, campaignData);
        toast.success('Campaign updated successfully');
      } else {
        await api.createCampaign(campaignData);
        toast.success('Campaign created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchCampaigns();
    } catch (err: any) {
      toast.error('Failed to save campaign', {
        description: err?.response?.data?.message || 'An error occurred'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'flash_sale',
      startDate: '',
      endDate: '',
      emailNotification: false,
      products: []
    });
    setSelectedImage('');
    setEditingCampaign(null);
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return 0;
    return ((clicks / impressions) * 100).toFixed(2);
  };

  const calculateConversionRate = (conversions: number, clicks: number) => {
    if (clicks === 0) return 0;
    return ((conversions / clicks) * 100).toFixed(2);
  };

  // Calculate aggregate statistics
  const statistics = {
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalImpressions: campaigns.reduce((sum, c) => sum + c.impressions, 0),
    averageCTR: campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + parseFloat(String(calculateCTR(c.clicks, c.impressions))), 0) / campaigns.length
      : 0,
    totalRevenue: campaigns.reduce((sum, c) => sum + c.revenue, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
          <p className="text-white/60">{t('vendor.campaigns.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <GlassCard hover={false}>
          <div className="text-center space-y-4 p-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{t('vendor.campaigns.failedToLoad')}</h3>
              <p className="text-white/60 mb-4">{error}</p>
              <button
                onClick={fetchCampaigns}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                {t('vendor.common.retry')}
              </button>
            </div>
          </div>
        </GlassCard>
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t('vendor.campaigns.marketingCampaigns')}
          </h1>
          <p className="text-white/60 mt-1">
            {t('vendor.campaigns.createAndManage')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCampaigns}
            className="px-4 py-2 glass hover:bg-white/10 rounded-xl transition-all flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('vendor.campaigns.refresh')}</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t('vendor.campaigns.createCampaign')}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title={t('vendor.campaigns.activeCampaigns')}
          value={statistics.activeCampaigns.toString()}
          icon={<Zap />}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title={t('vendor.campaigns.totalImpressions')}
          value={`${(statistics.totalImpressions / 1000).toFixed(1)}K`}
          icon={<Eye />}
          color="from-blue-400 to-cyan-500"
        />
        <StatCard
          title={t('vendor.campaigns.clickThroughRate')}
          value={`${statistics.averageCTR.toFixed(1)}%`}
          icon={<MousePointer />}
          color="from-purple-400 to-pink-500"
        />
        <StatCard
          title={t('vendor.campaigns.campaignRevenue')}
          value={`$${(statistics.totalRevenue / 1000).toFixed(1)}K`}
          icon={<ShoppingCart />}
          color="from-orange-400 to-red-500"
        />
      </div>

      {/* Search & Filter */}
      <GlassCard hover={false}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder={t('vendor.placeholders.searchCampaigns')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 glass border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 glass border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Campaigns Timeline */}
      {filteredCampaigns.length === 0 ? (
        <GlassCard hover={false}>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{t('vendor.campaigns.noCampaigns')}</h3>
            <p className="text-white/60">
              {searchQuery
                ? t('vendor.campaigns.noMatchSearch')
                : t('vendor.campaigns.startCreatingFirst')}
            </p>
          </div>
        </GlassCard>
      ) : (
        <GlassCard hover={false}>
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span>{t('vendor.campaigns.timeline')}</span>
          </h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />

            {/* Timeline items */}
            <div className="space-y-6">
              {filteredCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start space-x-6"
                >
                  {/* Timeline dot */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTypeColor(campaign.type)} flex items-center justify-center shadow-lg flex-shrink-0 z-10`}>
                    {getTypeIcon(campaign.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 glass rounded-xl p-6 hover:bg-white/5 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-white">{campaign.name}</h4>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-sm text-white/60 mb-3">{campaign.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-white/50">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{campaign.startDate}</span>
                          </div>
                          <span>→</span>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{campaign.endDate}</span>
                          </div>
                          {campaign.emailNotification && (
                            <div className="flex items-center space-x-1 text-purple-400">
                              <Mail className="w-3 h-3" />
                              <span>{t('vendor.campaigns.emailEnabled')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDuplicate(campaign)}
                          className="p-2 glass hover:bg-white/10 rounded-lg transition-all"
                          title={t('vendor.campaigns.duplicateCampaign')}
                        >
                          <Copy className="w-4 h-4 text-white/70" />
                        </button>
                        <button
                          onClick={() => handleEdit(campaign)}
                          className="p-2 glass hover:bg-white/10 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(campaign)}
                          className="p-2 glass hover:bg-white/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Banner Preview */}
                    {campaign.bannerImage && (
                      <div className="mb-4">
                        <img
                          src={campaign.bannerImage}
                          alt={campaign.name}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Analytics */}
                    {campaign.status !== 'draft' && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-white/10">
                        <div>
                          <p className="text-xs text-white/50 mb-1">{t('vendor.campaigns.impressions')}</p>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3 text-blue-400" />
                            <p className="text-sm font-semibold text-white">{campaign.impressions.toLocaleString()}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-white/50 mb-1">{t('vendor.campaigns.clicks')}</p>
                          <div className="flex items-center space-x-1">
                            <MousePointer className="w-3 h-3 text-purple-400" />
                            <p className="text-sm font-semibold text-white">{campaign.clicks.toLocaleString()}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-white/50 mb-1">{t('vendor.campaigns.ctr')}</p>
                          <p className="text-sm font-semibold text-white">
                            {calculateCTR(campaign.clicks, campaign.impressions)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/50 mb-1">{t('vendor.campaigns.conversions')}</p>
                          <div className="flex items-center space-x-1">
                            <ShoppingCart className="w-3 h-3 text-green-400" />
                            <p className="text-sm font-semibold text-white">{campaign.conversions}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-white/50 mb-1">{t('vendor.campaigns.revenue')}</p>
                          <p className="text-sm font-semibold text-green-400">
                            ${campaign.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <GlassCard hover={false}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                      {editingCampaign ? t('vendor.campaigns.editCampaign') : t('vendor.campaigns.createCampaign')}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="p-2 glass hover:bg-white/10 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-white/60 mb-2 block">{t('vendor.campaigns.campaignName')} *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 glass border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        placeholder={t('vendor.placeholders.campaignName')}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm text-white/60 mb-2 block">{t('vendor.campaigns.description')}</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 glass border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                        rows={3}
                        placeholder={t('vendor.placeholders.campaignDescription')}
                      />
                    </div>

                    <div>
                      <label className="text-sm text-white/60 mb-2 block">{t('vendor.campaigns.campaignType')} *</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { value: 'flash_sale', label: t('vendor.campaigns.flashSale'), icon: Zap },
                          { value: 'seasonal', label: t('vendor.campaigns.seasonal'), icon: Snowflake },
                          { value: 'clearance', label: t('vendor.campaigns.clearance'), icon: TrendingUp },
                          { value: 'new_arrival', label: t('vendor.campaigns.newArrival'), icon: Sparkles },
                          { value: 'holiday', label: t('vendor.campaigns.holiday'), icon: Gift },
                          { value: 'exclusive', label: t('vendor.campaigns.exclusive'), icon: Star }
                        ].map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: type.value as Campaign['type'] })}
                            className={`p-3 glass rounded-xl transition-all flex items-center space-x-2 ${
                              formData.type === type.value ? 'bg-purple-500/20 border-purple-500/30' : 'hover:bg-white/5'
                            }`}
                          >
                            <type.icon className="w-4 h-4 text-white/70" />
                            <span className="text-white text-sm">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-white/60 mb-2 block">{t('vendor.campaigns.startDate')} *</label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full px-4 py-3 glass border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm text-white/60 mb-2 block">{t('vendor.campaigns.endDate')} *</label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full px-4 py-3 glass border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-white/60 mb-2 block">{t('vendor.campaigns.bannerImageUrl')}</label>
                      <input
                        type="url"
                        value={selectedImage}
                        onChange={(e) => setSelectedImage(e.target.value)}
                        className="w-full px-4 py-3 glass border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        placeholder={t('vendor.placeholders.bannerImageUrl')}
                      />
                      {selectedImage && (
                        <img
                          src={selectedImage}
                          alt="Banner preview"
                          className="mt-3 w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>

                    <div className="flex items-center space-x-2 p-4 glass rounded-xl">
                      <input
                        type="checkbox"
                        id="emailNotification"
                        checked={formData.emailNotification}
                        onChange={(e) => setFormData({ ...formData, emailNotification: e.target.checked })}
                        className="w-5 h-5 rounded bg-white/20 border-2 border-white/40 cursor-pointer"
                      />
                      <label htmlFor="emailNotification" className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-purple-400" />
                          <span className="text-white font-medium">{t('vendor.campaigns.sendEmailNotification')}</span>
                        </div>
                        <p className="text-xs text-white/60 mt-1">
                          {t('vendor.campaigns.notifyCustomers')}
                        </p>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 glass hover:bg-white/10 rounded-xl transition-all"
                    >
                      {t('vendor.campaigns.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30"
                    >
                      {editingCampaign ? t('vendor.campaigns.updateCampaign') : t('vendor.campaigns.createCampaign')}
                    </button>
                  </div>
                </form>
              </GlassCard>
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

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Gift,
  Users,
  TrendingUp,
  DollarSign,
  Search,
  Filter,
  Download,
  RefreshCw,
  Check,
  X,
  Clock,
  AlertTriangle,
  Loader2,
  Settings,
  Copy,
  ExternalLink,
  Award,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  UserCheck,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ReferralConfig {
  isEnabled: boolean;
  referrerRewardType: 'credit' | 'discount' | 'percentage';
  referrerRewardValue: number;
  referrerMaxReward?: number;
  refereeRewardType: 'credit' | 'discount' | 'percentage';
  refereeRewardValue: number;
  refereeMaxReward?: number;
  rewardTrigger?: 'signup' | 'first_purchase' | 'any_purchase';
  minOrderAmount: number;
  expiryDays: number;
  maxReferralsPerUser: number;
}

interface Referral {
  id: string;
  referrerUserId: string;
  referrerName: string;
  referrerEmail: string;
  refereeUserId: string;
  refereeName: string;
  refereeEmail: string;
  code: string;
  status: 'pending' | 'qualified' | 'rewarded' | 'expired' | 'cancelled';
  referrerRewardAmount: number;
  refereeRewardAmount: number;
  createdAt: string;
  qualifiedAt?: string;
  rewardedAt?: string;
}

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  qualifiedReferrals: number;
  rewardedReferrals: number;
  totalRewardsGiven: number;
  conversionRate: number;
  topReferrers: {
    userId: string;
    name: string;
    email: string;
    totalReferrals: number;
    qualifiedReferrals: number;
    rewardsEarned: number;
  }[];
  recentActivity: {
    date: string;
    newReferrals: number;
    qualifications: number;
    rewards: number;
  }[];
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  qualified: { label: 'Qualified', color: 'bg-blue-100 text-blue-700', icon: UserCheck },
  rewarded: { label: 'Rewarded', color: 'bg-green-100 text-green-700', icon: Check },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-500', icon: X },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: Ban },
};

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <span
            className={`text-sm font-medium flex items-center gap-1 ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${change < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </motion.div>
  );
}

function ReferralRow({ referral, onStatusChange }: { referral: Referral; onStatusChange: () => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const statusConfig = STATUS_CONFIG[referral.status];
  const StatusIcon = statusConfig.icon;

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-gray-100 hover:bg-gray-50/50"
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-lime/20 to-emerald-500/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-lime">
              {referral.referrerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{referral.referrerName}</div>
            <div className="text-xs text-gray-500">{referral.referrerEmail}</div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-600">
              {referral.refereeName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{referral.refereeName}</div>
            <div className="text-xs text-gray-500">{referral.refereeEmail}</div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{referral.code}</code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(referral.code);
              toast.success('Code copied!');
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </td>
      <td className="p-4">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
        >
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </span>
      </td>
      <td className="p-4">
        <div className="text-sm">
          <span className="text-gray-500">Referrer:</span> ${referral.referrerRewardAmount}
          <br />
          <span className="text-gray-500">Referee:</span> ${referral.refereeRewardAmount}
        </div>
      </td>
      <td className="p-4 text-sm text-gray-500">
        {new Date(referral.createdAt).toLocaleDateString()}
      </td>
      <td className="p-4">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 min-w-[150px]"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                {referral.status === 'qualified' && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      toast.success('Marked as rewarded');
                      onStatusChange();
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                  >
                    <Check className="w-4 h-4" />
                    Mark Rewarded
                  </button>
                )}
                {referral.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        toast.success('Marked as qualified');
                        onStatusChange();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                    >
                      <UserCheck className="w-4 h-4" />
                      Mark Qualified
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        toast.success('Referral cancelled');
                        onStatusChange();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Ban className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>
    </motion.tr>
  );
}

function TopReferrerCard({
  referrer,
  rank,
}: {
  referrer: ReferralStats['topReferrers'][0];
  rank: number;
}) {
  const rankColors = ['bg-yellow-400', 'bg-gray-400', 'bg-amber-600'];
  const rankColor = rankColors[rank - 1] || 'bg-gray-300';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1 }}
      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
    >
      <div
        className={`w-8 h-8 rounded-full ${rankColor} flex items-center justify-center text-white text-sm font-bold`}
      >
        {rank}
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{referrer.name}</div>
        <div className="text-xs text-gray-500">{referrer.email}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-gray-900">{referrer.qualifiedReferrals}</div>
        <div className="text-xs text-gray-500">qualified</div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-green-600">${referrer.rewardsEarned}</div>
        <div className="text-xs text-gray-500">earned</div>
      </div>
    </motion.div>
  );
}

export function AdminReferralsPage() {
  const { t } = useTranslation();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [editConfig, setEditConfig] = useState<ReferralConfig | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [referralsData, statsData, configData] = await Promise.all([
        api.getAllReferrals({ limit: 100 }).catch(() => []),
        api.getReferralProgramStats().catch(() => null),
        api.getReferralConfig().catch(() => null),
      ]);

      setReferrals(Array.isArray(referralsData) ? referralsData : []);
      setStats(statsData);
      setConfig(configData);
      setEditConfig(configData);
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveConfig = async () => {
    if (!editConfig) return;

    setIsSavingConfig(true);
    try {
      await api.updateReferralConfig(editConfig);
      setConfig(editConfig);
      setShowSettings(false);
      toast.success('Referral settings updated!');
    } catch (error) {
      console.error('Failed to save config:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const filteredReferrals = referrals.filter((referral) => {
    const matchesSearch =
      referral.referrerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.refereeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.referrerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.refereeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || referral.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-lime animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.referrals.title')}</h1>
          <p className="text-gray-500 mt-1">{t('admin.referrals.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t('admin.common.refresh')}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            {t('admin.common.export')}
          </Button>
          <Button onClick={() => setShowSettings(true)} className="gap-2 bg-primary-lime hover:bg-primary-lime/90">
            <Settings className="w-4 h-4" />
            {t('admin.referrals.settings')}
          </Button>
        </div>
      </div>

      {/* Program Status Banner */}
      {config && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 flex items-center justify-between ${
            config.isEnabled ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {config.isEnabled ? (
              <Check className="w-6 h-6 text-green-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            )}
            <div>
              <span className={`font-medium ${config.isEnabled ? 'text-green-800' : 'text-yellow-800'}`}>
                Referral Program is {config.isEnabled ? 'Active' : 'Disabled'}
              </span>
              <p className={`text-sm ${config.isEnabled ? 'text-green-600' : 'text-yellow-600'}`}>
                {config.isEnabled
                  ? `Referrer gets $${config.referrerRewardValue || 0}, Referee gets $${config.refereeRewardValue || 0}`
                  : 'Enable the program in settings to start rewarding referrals'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            className={config.isEnabled ? 'border-green-300 text-green-700' : 'border-yellow-300 text-yellow-700'}
          >
            Configure
          </Button>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Referrals"
          value={stats?.totalReferrals || 0}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Qualified Referrals"
          value={stats?.qualifiedReferrals || 0}
          icon={UserCheck}
          color="bg-green-500"
        />
        <StatCard
          title="Total Rewards Given"
          value={`$${stats?.totalRewardsGiven?.toFixed(2) || '0.00'}`}
          icon={DollarSign}
          color="bg-purple-500"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats?.conversionRate?.toFixed(1) || 0}%`}
          icon={TrendingUp}
          color="bg-amber-500"
        />
      </div>

      {/* Top Referrers */}
      {stats?.topReferrers && stats.topReferrers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Top Referrers</h2>
          </div>
          <div className="space-y-3">
            {stats.topReferrers.slice(0, 5).map((referrer, index) => (
              <TopReferrerCard key={referrer.userId} referrer={referrer} rank={index + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Referrals Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('admin.referrals.allReferrals')}</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('admin.common.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-lime/20 focus:border-primary-lime outline-none w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-lime/20 focus:border-primary-lime outline-none"
              >
                <option value="all">{t('admin.referrals.allStatus')}</option>
                <option value="pending">{t('admin.referrals.pending')}</option>
                <option value="qualified">{t('admin.referrals.qualified')}</option>
                <option value="rewarded">{t('admin.referrals.rewarded')}</option>
                <option value="expired">{t('admin.referrals.expired')}</option>
                <option value="cancelled">{t('admin.referrals.cancelled')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left p-4 font-medium text-gray-600 text-sm">{t('admin.referrals.referrer')}</th>
                <th className="text-left p-4 font-medium text-gray-600 text-sm">{t('admin.referrals.referred')}</th>
                <th className="text-left p-4 font-medium text-gray-600 text-sm">{t('admin.referrals.code')}</th>
                <th className="text-left p-4 font-medium text-gray-600 text-sm">{t('admin.referrals.status')}</th>
                <th className="text-left p-4 font-medium text-gray-600 text-sm">{t('admin.referrals.reward')}</th>
                <th className="text-left p-4 font-medium text-gray-600 text-sm">{t('admin.referrals.date')}</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.length > 0 ? (
                filteredReferrals.map((referral) => (
                  <ReferralRow key={referral.id} referral={referral} onStatusChange={fetchData} />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t('admin.referrals.noReferrals')}</p>
                    {searchQuery && (
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                        }}
                        className="mt-2"
                      >
                        {t('admin.referrals.clearFilters')}
                      </Button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && editConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">{t('admin.referrals.settings')}</h2>
                <p className="text-gray-500 text-sm mt-1">{t('admin.referrals.subtitle')}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-900">Enable Program</label>
                    <p className="text-sm text-gray-500">Allow users to refer others</p>
                  </div>
                  <button
                    onClick={() => setEditConfig({ ...editConfig, isEnabled: !editConfig.isEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editConfig.isEnabled ? 'bg-primary-lime' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editConfig.isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Reward Type */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">{t('admin.referrals.rewardType')}</label>
                  <select
                    value={editConfig.referrerRewardType || 'credit'}
                    onChange={(e) => {
                      const type = e.target.value as ReferralConfig['referrerRewardType'];
                      setEditConfig({ ...editConfig, referrerRewardType: type, refereeRewardType: type });
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-lime/20 focus:border-primary-lime outline-none"
                  >
                    <option value="credit">{t('admin.referrals.storeCredit')}</option>
                    <option value="discount">{t('admin.referrals.fixedDiscount')}</option>
                    <option value="percentage">{t('admin.referrals.percentageDiscount')}</option>
                  </select>
                </div>

                {/* Referrer Reward */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">{t('admin.referrals.referrerReward')}</label>
                  <div className="relative">
                    {editConfig.referrerRewardType === 'percentage' ? (
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    ) : (
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    )}
                    <input
                      type="number"
                      value={editConfig.referrerRewardValue || 0}
                      onChange={(e) =>
                        setEditConfig({ ...editConfig, referrerRewardValue: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-lime/20 focus:border-primary-lime outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('admin.referrals.amountGivenToReferrer')}</p>
                </div>

                {/* Referee Reward */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">{t('admin.referrals.refereeReward')}</label>
                  <div className="relative">
                    {editConfig.refereeRewardType === 'percentage' ? (
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    ) : (
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    )}
                    <input
                      type="number"
                      value={editConfig.refereeRewardValue || 0}
                      onChange={(e) =>
                        setEditConfig({ ...editConfig, refereeRewardValue: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-lime/20 focus:border-primary-lime outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('admin.referrals.amountGivenToReferee')}</p>
                </div>

                {/* Min Order Amount */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">Minimum Order Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={editConfig.minOrderAmount || 0}
                      onChange={(e) =>
                        setEditConfig({ ...editConfig, minOrderAmount: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-lime/20 focus:border-primary-lime outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Referee must make a purchase of this amount to qualify</p>
                </div>

                {/* Max Referrals */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">Max Referrals Per User</label>
                  <input
                    type="number"
                    value={editConfig.maxReferralsPerUser || 0}
                    onChange={(e) =>
                      setEditConfig({ ...editConfig, maxReferralsPerUser: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-lime/20 focus:border-primary-lime outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 for unlimited</p>
                </div>

                {/* Expiry Days */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">Referral Expiry (Days)</label>
                  <input
                    type="number"
                    value={editConfig.expiryDays || 30}
                    onChange={(e) =>
                      setEditConfig({ ...editConfig, expiryDays: parseInt(e.target.value) || 30 })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-lime/20 focus:border-primary-lime outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Days within which referee must make a qualifying purchase</p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  {t('admin.common.cancel')}
                </Button>
                <Button
                  onClick={handleSaveConfig}
                  disabled={isSavingConfig}
                  className="bg-primary-lime hover:bg-primary-lime/90"
                >
                  {isSavingConfig ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('admin.common.loading')}
                    </>
                  ) : (
                    t('admin.common.save')
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminReferralsPage;

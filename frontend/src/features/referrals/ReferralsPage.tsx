'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Gift,
  Copy,
  Check,
  Share2,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Loader2,
  Link2,
  Edit3,
  Sparkles,
  ChevronRight,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ReferralCode {
  id: string;
  code: string;
  isCustom: boolean;
  usageCount: number;
  maxUsages: number | null;
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
}

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  qualifiedReferrals: number;
  rewardedReferrals: number;
  totalEarned: number;
  pendingEarnings: number;
  referralCode: string;
}

interface Referral {
  id: string;
  refereeId: string;
  refereeName?: string;
  refereeEmail?: string;
  status: 'pending' | 'qualified' | 'rewarded' | 'expired';
  orderAmount?: number;
  rewardAmount?: number;
  createdAt: string;
  qualifiedAt?: string;
  rewardedAt?: string;
}

interface ReferralConfig {
  isEnabled: boolean;
  referrerRewardType: string;
  referrerRewardValue: number;
  refereeRewardType: string;
  refereeRewardValue: number;
  rewardTrigger: string;
  minOrderAmount: number;
}

function StatCard({ icon: Icon, label, value, subValue, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm text-gray-500">{label}</p>
      {subValue && (
        <p className="text-xs text-gray-400 mt-1">{subValue}</p>
      )}
    </motion.div>
  );
}

function ReferralCard({ referral }: { referral: Referral }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    qualified: 'bg-blue-100 text-blue-700',
    rewarded: 'bg-green-100 text-green-700',
    expired: 'bg-gray-100 text-gray-500',
  };

  const statusIcons = {
    pending: Clock,
    qualified: CheckCircle2,
    rewarded: Gift,
    expired: XCircle,
  };

  const StatusIcon = statusIcons[referral.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-lime/20 to-emerald-500/20 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary-lime">
            {(referral.refereeName || referral.refereeEmail || 'User').charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h4 className="font-medium text-gray-900">
            {referral.refereeName || referral.refereeEmail || 'Anonymous User'}
          </h4>
          <p className="text-xs text-gray-400">
            Joined {new Date(referral.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {referral.rewardAmount !== undefined && referral.status === 'rewarded' && (
          <div className="text-right">
            <p className="text-sm font-semibold text-green-600">
              +${referral.rewardAmount.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">Earned</p>
          </div>
        )}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[referral.status]}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span className="capitalize">{referral.status}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function ReferralsPage() {
  const { t } = useTranslation();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isCreatingCustomCode, setIsCreatingCustomCode] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [isSubmittingCustomCode, setIsSubmittingCustomCode] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [codeResponse, statsResponse, referralsResponse, configResponse] = await Promise.all([
        api.getMyReferralCode().catch(() => null),
        api.getMyReferralStats().catch(() => null),
        api.getMyReferrals().catch(() => []),
        api.getReferralConfig().catch(() => null),
      ]);

      setReferralCode(codeResponse);
      setStats(statsResponse);
      setReferrals(referralsResponse || []);
      setConfig(configResponse);
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      toast.error(t('referrals.failedToLoad', { defaultValue: 'Failed to load referral information' }));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const referralLink = referralCode
    ? `${window.location.origin}/signup?ref=${referralCode.code}`
    : '';

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(t('referrals.copiedToClipboard', { defaultValue: 'Copied to clipboard!' }));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('referrals.failedToCopy', { defaultValue: 'Failed to copy' }));
    }
  };

  const handleShare = async () => {
    if (!referralCode) return;

    const shareText = `Join me on Vasty Shop and get ${config?.refereeRewardType === 'percentage' ? `${config.refereeRewardValue}%` : `$${config?.refereeRewardValue}`} off your first order! Use my code: ${referralCode.code}`;

    try {
      await navigator.share({
        title: 'Join Vasty Shop',
        text: shareText,
        url: referralLink,
      });
    } catch {
      copyToClipboard(referralLink);
    }
  };

  const handleCreateCustomCode = async () => {
    if (!customCode.trim()) {
      toast.error(t('referrals.enterCustomCode', { defaultValue: 'Please enter a custom code' }));
      return;
    }

    if (customCode.length < 4 || customCode.length > 20) {
      toast.error(t('referrals.codeLengthError', { defaultValue: 'Code must be 4-20 characters' }));
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(customCode)) {
      toast.error(t('referrals.codeCharError', { defaultValue: 'Code can only contain letters, numbers, underscores, and hyphens' }));
      return;
    }

    setIsSubmittingCustomCode(true);
    try {
      const response = await api.createCustomReferralCode(customCode.toUpperCase());
      setReferralCode(response);
      setIsCreatingCustomCode(false);
      setCustomCode('');
      toast.success(t('referrals.customCodeCreated', { defaultValue: 'Custom referral code created!' }));
    } catch (error: any) {
      toast.error(error.message || t('referrals.failedToCreateCode', { defaultValue: 'Failed to create custom code' }));
    } finally {
      setIsSubmittingCustomCode(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-lime animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t('referrals.loading', { defaultValue: 'Loading referral program...' })}</p>
        </div>
      </div>
    );
  }

  if (!config?.isEnabled) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <Gift className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('referrals.comingSoon', { defaultValue: 'Referral Program Coming Soon' })}
          </h1>
          <p className="text-gray-500 max-w-md mx-auto">
            {t('referrals.comingSoonDesc', { defaultValue: 'Our referral program is currently being set up. Check back soon to start earning rewards!' })}
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-lime/10 via-emerald-500/5 to-teal-500/10 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary-lime/20 flex items-center justify-center mx-auto mb-6">
              <Gift className="w-8 h-8 text-primary-lime" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('referrals.title', { defaultValue: 'Refer Friends, Earn Rewards' })}
            </h1>
            <p className="text-gray-600 text-lg">
              {t('referrals.subtitle', { defaultValue: 'Share your unique code with friends. When they make their first purchase, you both get rewarded!' })}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Referral Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {t('referrals.yourCode', { defaultValue: 'Your Referral Code' })}
              </h2>
              <p className="text-gray-500 text-sm">
                {t('referrals.shareCodeDesc', { defaultValue: 'Share this code or link with your friends' })}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Code Display */}
              <div className="relative">
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl px-6 py-4 flex items-center justify-between gap-4 min-w-[200px]">
                  <span className="text-2xl font-bold text-primary-lime tracking-wider">
                    {referralCode?.code || 'LOADING'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(referralCode?.code || '')}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {referralCode?.isCustom && (
                  <span className="absolute -top-2 -right-2 bg-primary-lime text-white text-xs px-2 py-0.5 rounded-full">
                    {t('referrals.custom', { defaultValue: 'Custom' })}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleShare}
                  className="bg-primary-lime hover:bg-primary-lime/90 text-white gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  {t('referrals.share', { defaultValue: 'Share' })}
                </Button>
                {!referralCode?.isCustom && (
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingCustomCode(true)}
                    className="gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    {t('referrals.customize', { defaultValue: 'Customize' })}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Share Link */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <label className="text-sm text-gray-500 mb-2 block">{t('referrals.referralLink', { defaultValue: 'Referral Link' })}</label>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
              <Link2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none truncate"
              />
              <button
                onClick={() => copyToClipboard(referralLink)}
                className="text-primary-lime text-sm font-medium hover:underline"
              >
                {t('referrals.copyLink', { defaultValue: 'Copy Link' })}
              </button>
            </div>
          </div>

          {/* Quick Share Options */}
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`mailto:?subject=Join Vasty Shop&body=${encodeURIComponent(`Use my referral code ${referralCode?.code} to get ${config?.refereeRewardType === 'percentage' ? `${config.refereeRewardValue}%` : `$${config?.refereeRewardValue}`} off! ${referralLink}`)}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              {t('referrals.email', { defaultValue: 'Email' })}
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Join Vasty Shop with my code ${referralCode?.code} and get ${config?.refereeRewardType === 'percentage' ? `${config.refereeRewardValue}%` : `$${config?.refereeRewardValue}`} off your first order! ${referralLink}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 rounded-full text-sm text-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t('referrals.whatsapp', { defaultValue: 'WhatsApp' })}
            </a>
          </div>
        </motion.div>

        {/* Custom Code Modal */}
        <AnimatePresence>
          {isCreatingCustomCode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setIsCreatingCustomCode(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 w-full max-w-md"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-lime/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-lime" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{t('referrals.createCustomCode', { defaultValue: 'Create Custom Code' })}</h3>
                    <p className="text-sm text-gray-500">{t('referrals.makeItMemorable', { defaultValue: 'Make it memorable!' })}</p>
                  </div>
                </div>

                <input
                  type="text"
                  value={customCode}
                  onChange={e => setCustomCode(e.target.value.toUpperCase())}
                  placeholder={t('referrals.codePlaceholder', { defaultValue: 'e.g., MYCODE2024' })}
                  maxLength={20}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-lime/50 uppercase tracking-wider"
                />
                <p className="text-xs text-gray-400 mt-2">
                  {t('referrals.codeHint', { defaultValue: '4-20 characters. Letters, numbers, underscores, and hyphens only.' })}
                </p>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingCustomCode(false)}
                    className="flex-1"
                  >
                    {t('common.cancel', { defaultValue: 'Cancel' })}
                  </Button>
                  <Button
                    onClick={handleCreateCustomCode}
                    disabled={isSubmittingCustomCode}
                    className="flex-1 bg-primary-lime hover:bg-primary-lime/90 text-white"
                  >
                    {isSubmittingCustomCode ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      t('common.create', { defaultValue: 'Create' })
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label={t('referrals.stats.totalReferrals', { defaultValue: 'Total Referrals' })}
            value={stats?.totalReferrals || 0}
            subValue={`${stats?.pendingReferrals || 0} ${t('referrals.stats.pending', { defaultValue: 'pending' })}`}
            color="bg-blue-500"
          />
          <StatCard
            icon={CheckCircle2}
            label={t('referrals.stats.qualified', { defaultValue: 'Qualified' })}
            value={stats?.qualifiedReferrals || 0}
            subValue={t('referrals.stats.completedFirstOrder', { defaultValue: 'Completed first order' })}
            color="bg-green-500"
          />
          <StatCard
            icon={DollarSign}
            label={t('referrals.stats.totalEarned', { defaultValue: 'Total Earned' })}
            value={`$${(stats?.totalEarned || 0).toFixed(2)}`}
            subValue={`$${(stats?.pendingEarnings || 0).toFixed(2)} ${t('referrals.stats.pending', { defaultValue: 'pending' })}`}
            color="bg-primary-lime"
          />
          <StatCard
            icon={TrendingUp}
            label={t('referrals.stats.conversionRate', { defaultValue: 'Conversion Rate' })}
            value={stats?.totalReferrals ? `${Math.round((stats.qualifiedReferrals / stats.totalReferrals) * 100)}%` : '0%'}
            subValue={t('referrals.stats.signupsToOrders', { defaultValue: 'Sign-ups to orders' })}
            color="bg-purple-500"
          />
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t('referrals.howItWorks', { defaultValue: 'How It Works' })}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: t('referrals.steps.step1Title', { defaultValue: 'Share Your Code' }),
                description: t('referrals.steps.step1Desc', { defaultValue: 'Send your unique referral code or link to friends and family' }),
                icon: Share2,
              },
              {
                step: 2,
                title: t('referrals.steps.step2Title', { defaultValue: 'Friend Signs Up' }),
                description: t('referrals.steps.step2Desc', { reward: config?.refereeRewardType === 'percentage' ? `${config?.refereeRewardValue}%` : `$${config?.refereeRewardValue}`, defaultValue: `They get ${config?.refereeRewardType === 'percentage' ? `${config?.refereeRewardValue}%` : `$${config?.refereeRewardValue}`} off their first order` }),
                icon: Users,
              },
              {
                step: 3,
                title: t('referrals.steps.step3Title', { defaultValue: 'You Earn Rewards' }),
                description: t('referrals.steps.step3Desc', { reward: config?.referrerRewardType === 'percentage' ? `${config?.referrerRewardValue}%` : `$${config?.referrerRewardValue}`, defaultValue: `You earn ${config?.referrerRewardType === 'percentage' ? `${config?.referrerRewardValue}%` : `$${config?.referrerRewardValue}`} when they complete their purchase` }),
                icon: Gift,
              },
            ].map(item => (
              <div key={item.step} className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-lime/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-primary-lime" />
                </div>
                <div>
                  <div className="text-xs text-primary-lime font-semibold mb-1">
                    {t('referrals.step', { defaultValue: 'Step' })} {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Referrals List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{t('referrals.yourReferrals', { defaultValue: 'Your Referrals' })}</h2>
            {referrals.length > 0 && (
              <span className="text-sm text-gray-500">
                {referrals.length} {t('referrals.total', { defaultValue: 'total' })}
              </span>
            )}
          </div>

          {referrals.length > 0 ? (
            <div className="space-y-3">
              {referrals.map(referral => (
                <ReferralCard key={referral.id} referral={referral} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('referrals.noReferralsYet', { defaultValue: 'No referrals yet' })}
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {t('referrals.shareToEarn', { defaultValue: 'Share your code with friends to start earning rewards!' })}
              </p>
            </div>
          )}
        </motion.div>

        {/* Terms */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>
            {config?.minOrderAmount && config.minOrderAmount > 0 && (
              <>{t('referrals.minOrderRequired', { amount: config.minOrderAmount, defaultValue: `Minimum order of $${config.minOrderAmount} required.` })} </>
            )}
            {t('referrals.rewardsAfterCompletion', { defaultValue: 'Rewards are credited after order completion.' })}{' '}
            <button className="text-primary-lime hover:underline">
              {t('referrals.viewTerms', { defaultValue: 'View full terms' })}
            </button>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ReferralsPage;

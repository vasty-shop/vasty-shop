import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Gift,
  Package,
  ExternalLink,
  AlertTriangle,
  Link2,
  Unlink,
  CreditCard,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useDeliveryAuthStore } from '@/stores/useDeliveryAuthStore';
import { deliveryApi } from '../api/deliveryApi';
import type { EarningsTransaction } from '../types/delivery.types';
import { toast } from 'sonner';

interface StripeAccountStatus {
  accountId: string | null;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: any;
  currentDeadline: number | null;
}

interface StripeBalance {
  available: number;
  pending: number;
  currency: string;
}

interface SupportedCountry {
  code: string;
  name: string;
  flag: string;
}

type TimePeriod = 'today' | 'week' | 'month' | 'all';

interface EarningsData {
  totalEarnings: number;
  pendingEarnings: number;
  cashInHand: number;
  periodEarnings: number;
  periodDeliveryFees: number;
  periodTips: number;
  periodDeliveries: number;
  recentWithdrawals: any[];
  recentDeliveries: any[];
}

export const DeliveryEarningsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { deliveryMan } = useDeliveryAuthStore();
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [transactions, setTransactions] = useState<EarningsTransaction[]>([]);
  const [period, setPeriod] = useState<TimePeriod>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cash' | 'stripe'>('bank');
  const [paymentDetails, setPaymentDetails] = useState({
    accountNumber: '',
    accountName: '',
    bankName: '',
  });

  const [hasSynced, setHasSynced] = useState(false);

  // Stripe Connect State
  const [stripeStatus, setStripeStatus] = useState<StripeAccountStatus | null>(null);
  const [stripeBalance, setStripeBalance] = useState<StripeBalance | null>(null);
  const [stripeTransfers, setStripeTransfers] = useState<any[]>([]);
  const [supportedCountries, setSupportedCountries] = useState<SupportedCountry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [isSettingUpStripe, setIsSettingUpStripe] = useState(false);
  const [isDisconnectingStripe, setIsDisconnectingStripe] = useState(false);
  const [showStripeSetupModal, setShowStripeSetupModal] = useState(false);

  useEffect(() => {
    loadEarningsData();
  }, [deliveryMan, period]);

  // Auto-sync earnings on first load
  useEffect(() => {
    if (deliveryMan?.id && !hasSynced) {
      syncEarningsData();
    }
  }, [deliveryMan?.id]);

  // Load Stripe Connect data
  useEffect(() => {
    if (deliveryMan?.id) {
      loadStripeData();
      loadSupportedCountries();
    }
  }, [deliveryMan?.id]);

  // Handle URL params from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const refresh = searchParams.get('refresh');

    if (success === 'true') {
      toast.success('Stripe account setup completed! Refreshing status...');
      loadStripeData();
    } else if (refresh === 'true') {
      toast.info('Please complete your Stripe account setup.');
      loadStripeData();
    }
  }, [searchParams]);

  // Auto-select Stripe as payment method if connected
  useEffect(() => {
    if (stripeStatus?.payoutsEnabled) {
      setPaymentMethod('stripe');
    }
  }, [stripeStatus?.payoutsEnabled]);

  const loadStripeData = async () => {
    if (!deliveryMan?.id) return;

    try {
      // Load account status
      const statusRes = await deliveryApi.getStripeAccountStatus(deliveryMan.id);
      const statusData = statusRes.data?.data;
      setStripeStatus(statusData);

      // If connected, load balance and transfers
      if (statusData?.accountId) {
        try {
          const balanceRes = await deliveryApi.getStripeBalance(deliveryMan.id);
          setStripeBalance(balanceRes.data?.data);
        } catch {
          // Ignore balance errors
        }

        try {
          const transfersRes = await deliveryApi.getStripeTransfers(deliveryMan.id, 10);
          setStripeTransfers(transfersRes.data?.data || []);
        } catch {
          // Ignore transfer errors
        }
      }
    } catch (error) {
      console.error('Failed to load Stripe data:', error);
    }
  };

  const loadSupportedCountries = async () => {
    try {
      const res = await deliveryApi.getSupportedCountries();
      setSupportedCountries(res.data?.data || []);
    } catch {
      // Use default if API fails
      setSupportedCountries([
        { code: 'US', name: 'United States', flag: '' },
        { code: 'GB', name: 'United Kingdom', flag: '' },
        { code: 'CA', name: 'Canada', flag: '' },
      ]);
    }
  };

  const handleSetupStripeConnect = async () => {
    if (!deliveryMan?.id) return;

    setIsSettingUpStripe(true);
    try {
      const res = await deliveryApi.createStripeConnectAccount(deliveryMan.id, {
        country: selectedCountry,
      });

      const onboardingUrl = res.data?.data?.onboardingUrl;
      if (onboardingUrl) {
        window.location.href = onboardingUrl;
      } else {
        toast.error('Failed to get onboarding URL');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to setup Stripe Connect');
    } finally {
      setIsSettingUpStripe(false);
      setShowStripeSetupModal(false);
    }
  };

  const handleContinueOnboarding = async () => {
    if (!deliveryMan?.id) return;

    setIsSettingUpStripe(true);
    try {
      const res = await deliveryApi.getStripeOnboardingLink(deliveryMan.id);
      const onboardingUrl = res.data?.data?.onboardingUrl;
      if (onboardingUrl) {
        window.location.href = onboardingUrl;
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to get onboarding link');
    } finally {
      setIsSettingUpStripe(false);
    }
  };

  const handleOpenStripeDashboard = async () => {
    if (!deliveryMan?.id) return;

    try {
      const res = await deliveryApi.getStripeDashboardLink(deliveryMan.id);
      const url = res.data?.data?.url;
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to open dashboard');
    }
  };

  const handleDisconnectStripe = async () => {
    if (!deliveryMan?.id || !confirm('Are you sure you want to disconnect your Stripe account?')) return;

    setIsDisconnectingStripe(true);
    try {
      await deliveryApi.disconnectStripeAccount(deliveryMan.id);
      toast.success('Stripe account disconnected');
      setStripeStatus(null);
      setStripeBalance(null);
      setStripeTransfers([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to disconnect');
    } finally {
      setIsDisconnectingStripe(false);
    }
  };

  const handleStripeWithdraw = async () => {
    if (!deliveryMan?.id || !withdrawAmount) return;

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const availableBalance = earningsData?.pendingEarnings || 0;
    if (amount > availableBalance) {
      toast.error(`Insufficient balance. Available: $${availableBalance.toFixed(2)}`);
      return;
    }

    setIsWithdrawing(true);
    try {
      await deliveryApi.initiateStripePayout(deliveryMan.id, {
        amount,
        description: 'Earnings withdrawal',
      });
      toast.success('Payout initiated successfully! Funds will be transferred to your Stripe account.');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      loadEarningsData(true);
      loadStripeData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to initiate payout');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const syncEarningsData = async () => {
    if (!deliveryMan?.id) return;
    try {
      await deliveryApi.syncEarnings(deliveryMan.id);
      setHasSynced(true);
      // Reload earnings after sync
      loadEarningsData();
    } catch (error) {
      console.error('Failed to sync earnings:', error);
    }
  };

  const loadEarningsData = async (showRefresh = false) => {
    if (!deliveryMan?.id) return;

    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await deliveryApi.getEarnings(deliveryMan.id, period);
      const data = response.data?.data;

      if (data) {
        // Calculate pending earnings from period data if main values are 0
        const totalEarnings = Number(data.totalEarnings) || Number(data.periodEarnings) || 0;
        const pendingEarnings = Number(data.pendingEarnings) || totalEarnings || 0;

        setEarningsData({
          totalEarnings,
          pendingEarnings,
          cashInHand: Number(data.cashInHand) || 0,
          periodEarnings: Number(data.periodEarnings) || 0,
          periodDeliveryFees: Number(data.periodDeliveryFees) || 0,
          periodTips: Number(data.periodTips) || 0,
          periodDeliveries: Number(data.periodDeliveries) || 0,
          recentWithdrawals: data.recentWithdrawals || [],
          recentDeliveries: data.recentDeliveries || [],
        });

        // Build transactions from recent deliveries and withdrawals
        const deliveryTransactions: EarningsTransaction[] = (data.recentDeliveries || []).map((d: any) => ({
          id: d.id,
          type: 'DELIVERY_FEE' as const,
          amount: Number(d.total) || Number(d.deliveryFee) || 0,
          orderId: d.orderId,
          orderNumber: d.orderId?.slice(-8)?.toUpperCase() || 'N/A',
          description: `Delivery completed${Number(d.tip) > 0 ? ` (+$${Number(d.tip).toFixed(2)} tip)` : ''}`,
          status: 'COMPLETED' as const,
          createdAt: d.deliveredAt,
          deliveryFee: Number(d.deliveryFee) || 0,
          tip: Number(d.tip) || 0,
        }));

        const withdrawalTransactions: EarningsTransaction[] = (data.recentWithdrawals || []).map((w: any) => {
          const withdrawalStatus: 'COMPLETED' | 'PENDING' = w.status?.toUpperCase() === 'COMPLETED' ? 'COMPLETED' : 'PENDING';
          return {
            id: `withdrawal-${w.id}`,
            type: 'WITHDRAWAL' as const,
            amount: -(Number(w.amount) || 0),
            description: `Withdrawal via ${w.payment_method || w.paymentMethod || 'Bank Transfer'}`,
            status: withdrawalStatus,
            createdAt: w.created_at || w.createdAt,
          };
        });

        const allTransactions = [...deliveryTransactions, ...withdrawalTransactions]
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        setTransactions(allTransactions);
      }
    } catch (error) {
      console.error('Failed to load earnings:', error);
      toast.error(t('delivery.earnings.loadFailed'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!deliveryMan?.id || !withdrawAmount) return;

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t('delivery.earnings.invalidAmount'));
      return;
    }

    // Use pendingEarnings or fallback to periodEarnings if available
    const availableBalance = earningsData?.pendingEarnings || earningsData?.periodEarnings || 0;

    if (amount > availableBalance) {
      toast.error(`${t('delivery.earnings.insufficientBalance')}: $${availableBalance.toFixed(2)}`);
      return;
    }

    // Validate payment details for bank
    if (paymentMethod === 'bank' && (!paymentDetails.accountNumber || !paymentDetails.bankName)) {
      toast.error(t('delivery.earnings.enterBankDetails'));
      return;
    }

    setIsWithdrawing(true);
    try {
      await deliveryApi.requestWithdrawal(deliveryMan.id, {
        amount,
        paymentMethod,
        paymentDetails: {
          ...paymentDetails,
          method: paymentMethod,
        },
      });
      toast.success(t('delivery.earnings.withdrawalSuccess'));
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setPaymentDetails({ accountNumber: '', accountName: '', bankName: '' });
      loadEarningsData(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('delivery.earnings.withdrawalFailed'));
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Sync first, then load
      await deliveryApi.syncEarnings(deliveryMan!.id);
      await loadEarningsData(true);
    } catch (error) {
      console.error('Failed to refresh:', error);
      toast.error(t('delivery.earnings.refreshFailed'));
    }
  };

  const getTransactionIcon = (type: EarningsTransaction['type']) => {
    switch (type) {
      case 'DELIVERY_FEE':
        return <ArrowDownCircle className="w-5 h-5 text-green-500" />;
      case 'TIP':
        return <ArrowDownCircle className="w-5 h-5 text-blue-500" />;
      case 'BONUS':
        return <ArrowDownCircle className="w-5 h-5 text-purple-500" />;
      case 'WITHDRAWAL':
        return <ArrowUpCircle className="w-5 h-5 text-red-500" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('delivery.earnings.title')}</h1>
          <p className="text-gray-500 mt-1">{t('delivery.earnings.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={!(earningsData?.pendingEarnings || earningsData?.periodEarnings)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('delivery.earnings.withdrawFunds')}
          </button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex items-center space-x-2">
        <Calendar className="w-5 h-5 text-gray-400" />
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['today', 'week', 'month', 'all'] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(`delivery.earnings.${p}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">{t('delivery.earnings.totalEarnings')}</p>
              <p className="text-3xl font-bold mt-2">
                ${earningsData?.totalEarnings.toFixed(2) || '0.00'}
              </p>
            </div>
            <Wallet className="w-12 h-12 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{t('delivery.earnings.availableBalance')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${earningsData?.pendingEarnings.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-green-600 mt-1">{t('delivery.earnings.readyToWithdraw')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{t('delivery.earnings.cashInHand')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${earningsData?.cashInHand.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-400 mt-1">{t('delivery.earnings.toBeDeposited')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm capitalize">{period === 'all' ? t('delivery.earnings.allTime') : period === 'week' ? t('delivery.earnings.thisWeek') : period === 'month' ? t('delivery.earnings.thisMonth') : t('delivery.earnings.today')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${earningsData?.periodEarnings.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {earningsData?.periodDeliveries || 0} {t('delivery.dashboard.deliveries')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stripe Connect Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Stripe Connect</h3>
              <p className="text-sm text-gray-500">Receive payouts directly to your bank account</p>
            </div>
          </div>

          {stripeStatus?.accountId && stripeStatus.payoutsEnabled && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              <CheckCircle className="w-4 h-4" />
              Connected
            </span>
          )}
          {stripeStatus?.accountId && !stripeStatus.payoutsEnabled && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
              <AlertTriangle className="w-4 h-4" />
              Setup Required
            </span>
          )}
        </div>

        {/* Not Connected */}
        {!stripeStatus?.accountId && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Link2 className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Connect your Stripe account</h4>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Link your Stripe account to receive automatic payouts for your deliveries. Fast, secure, and convenient.
            </p>
            <button
              onClick={() => setShowStripeSetupModal(true)}
              className="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
            >
              <Link2 className="w-5 h-5" />
              Connect with Stripe
            </button>
          </div>
        )}

        {/* Connected but needs onboarding */}
        {stripeStatus?.accountId && !stripeStatus.payoutsEnabled && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Complete your account setup</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your Stripe account needs additional information before you can receive payouts.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleContinueOnboarding}
                disabled={isSettingUpStripe}
                className="flex-1 px-4 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSettingUpStripe ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ExternalLink className="w-5 h-5" />
                )}
                Continue Setup
              </button>
              <button
                onClick={handleDisconnectStripe}
                disabled={isDisconnectingStripe}
                className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Unlink className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Fully Connected */}
        {stripeStatus?.accountId && stripeStatus.payoutsEnabled && (
          <div className="space-y-6">
            {/* Stripe Balance */}
            {stripeBalance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-600 mb-1">Stripe Available</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${stripeBalance.available.toFixed(2)} {stripeBalance.currency}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-600 mb-1">Stripe Pending</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ${stripeBalance.pending.toFixed(2)} {stripeBalance.currency}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleOpenStripeDashboard}
                className="px-4 py-2.5 bg-purple-100 text-purple-700 font-medium rounded-xl hover:bg-purple-200 transition-colors inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Stripe Dashboard
              </button>
              <button
                onClick={handleDisconnectStripe}
                disabled={isDisconnectingStripe}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isDisconnectingStripe ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlink className="w-4 h-4" />
                )}
                Disconnect
              </button>
            </div>

            {/* Recent Stripe Transfers */}
            {stripeTransfers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Stripe Transfers</h4>
                <div className="space-y-2">
                  {stripeTransfers.slice(0, 5).map((transfer) => (
                    <div
                      key={transfer.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          ${transfer.amount.toFixed(2)} {transfer.currency}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transfer.created).toLocaleDateString()}
                        </p>
                      </div>
                      {transfer.reversed ? (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                          Reversed
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Period Breakdown */}
      {earningsData && (earningsData.periodDeliveryFees > 0 || earningsData.periodTips > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
            {period === 'all' ? t('delivery.earnings.allTime') : period === 'week' ? t('delivery.earnings.thisWeek') : period === 'month' ? t('delivery.earnings.thisMonth') : t('delivery.earnings.today')} {t('delivery.earnings.breakdown')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('delivery.earnings.deliveryFees')}</p>
                <p className="text-xl font-bold text-gray-900">
                  ${earningsData.periodDeliveryFees.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Gift className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('delivery.earnings.tips')}</p>
                <p className="text-xl font-bold text-gray-900">
                  ${earningsData.periodTips.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('delivery.earnings.total')}</p>
                <p className="text-xl font-bold text-orange-600">
                  ${earningsData.periodEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{t('delivery.earnings.recentTransactions')}</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        transaction.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : transaction.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {transaction.status === 'COMPLETED' ? t('delivery.earnings.completed') : t('delivery.earnings.pending')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('delivery.earnings.noTransactions')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('delivery.earnings.withdrawFunds')}</h3>

            {/* Available Balance */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <p className="text-sm text-green-600 mb-1">{t('delivery.earnings.availableBalance')}</p>
              <p className="text-3xl font-bold text-green-700">
                ${earningsData?.pendingEarnings.toFixed(2) || '0.00'}
              </p>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('delivery.earnings.withdrawalAmount')}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">$</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  max={earningsData?.pendingEarnings || 0}
                  step="0.01"
                  className="w-full pl-10 pr-4 py-4 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              {earningsData && earningsData.pendingEarnings > 0 && (
                <button
                  onClick={() => setWithdrawAmount(earningsData.pendingEarnings.toFixed(2))}
                  className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  {t('delivery.earnings.withdrawAll')} (${earningsData.pendingEarnings.toFixed(2)})
                </button>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('delivery.earnings.paymentMethod')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Stripe Option */}
                <button
                  type="button"
                  onClick={() => stripeStatus?.payoutsEnabled && setPaymentMethod('stripe')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === 'stripe'
                      ? 'border-orange-500 bg-orange-50'
                      : !stripeStatus?.payoutsEnabled
                      ? 'border-gray-200 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-1 block">💳</span>
                  <span className={`font-medium text-sm ${paymentMethod === 'stripe' ? 'text-orange-700' : 'text-gray-700'}`}>
                    Stripe
                  </span>
                  {stripeStatus?.payoutsEnabled ? (
                    <span className="block text-xs text-green-600 mt-1">Recommended</span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowWithdrawModal(false);
                        setShowStripeSetupModal(true);
                      }}
                      className="block text-xs text-purple-600 mt-1 hover:text-purple-700 font-medium underline"
                    >
                      Connect Now
                    </button>
                  )}
                </button>

                {/* Bank Transfer Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === 'bank'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-1 block">🏦</span>
                  <span className={`font-medium text-sm ${paymentMethod === 'bank' ? 'text-orange-700' : 'text-gray-700'}`}>
                    Bank Transfer
                  </span>
                </button>

                {/* Cash Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === 'cash'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-1 block">💵</span>
                  <span className={`font-medium text-sm ${paymentMethod === 'cash' ? 'text-orange-700' : 'text-gray-700'}`}>
                    Cash
                  </span>
                </button>
              </div>
            </div>

            {/* Payment Details */}
            {paymentMethod === 'bank' && (
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('delivery.earnings.bankName')}
                  </label>
                  <input
                    type="text"
                    value={paymentDetails.bankName}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                    placeholder={t('delivery.earnings.enterBankName')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('delivery.earnings.accountNumber')}
                  </label>
                  <input
                    type="text"
                    value={paymentDetails.accountNumber}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })}
                    placeholder={t('delivery.earnings.enterAccountNumber')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('delivery.earnings.accountHolderName')}
                  </label>
                  <input
                    type="text"
                    value={paymentDetails.accountName}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, accountName: e.target.value })}
                    placeholder={t('delivery.earnings.nameOnBankAccount')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'stripe' && stripeStatus?.payoutsEnabled && (
              <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-sm text-purple-700">
                  Funds will be transferred to your connected Stripe account. From there, Stripe will automatically pay out to your linked bank account.
                </p>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                <p className="text-sm text-yellow-700">
                  {t('delivery.earnings.cashWithdrawalNote')}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount('');
                  setPaymentDetails({ accountNumber: '', accountName: '', bankName: '' });
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                {t('delivery.common.cancel')}
              </button>
              <button
                onClick={paymentMethod === 'stripe' ? handleStripeWithdraw : handleWithdraw}
                disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isWithdrawing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('delivery.earnings.processing')}
                  </>
                ) : (
                  <>
                    <ArrowUpCircle className="w-5 h-5" />
                    {t('delivery.earnings.withdraw')} ${withdrawAmount || '0.00'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stripe Setup Modal */}
      {showStripeSetupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect with Stripe</h3>
            <p className="text-gray-500 mb-6">
              Connect your Stripe account to receive automatic payouts for your deliveries.
            </p>

            {/* Country Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select your country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                {supportedCountries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
              <p className="text-sm text-blue-700">
                You will be redirected to Stripe to complete your account setup. This includes verifying your identity and linking your bank account.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowStripeSetupModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSetupStripeConnect}
                disabled={isSettingUpStripe}
                className="flex-1 px-4 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSettingUpStripe ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    Continue to Stripe
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

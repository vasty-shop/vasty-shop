/**
 * Payment Settings Page
 * Manage Stripe Connect integration for receiving payments
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Wallet,
  TrendingUp,
  Clock,
  DollarSign,
  XCircle,
  RefreshCw,
  ChevronDown,
  Building,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { stripeConnectApi } from '../api/stripeConnectApi';
import type {
  ConnectAccountStatus,
  VendorBalance,
  VendorTransfer,
  VendorPayout,
  SupportedCountry,
} from '../api/stripeConnectApi';

const PaymentSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { shopId } = useParams<{ shopId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [loading, setLoading] = useState(true);
  const [connectStatus, setConnectStatus] = useState<ConnectAccountStatus | null>(null);
  const [balance, setBalance] = useState<VendorBalance | null>(null);
  const [transfers, setTransfers] = useState<VendorTransfer[]>([]);
  const [payouts, setPayouts] = useState<VendorPayout[]>([]);
  const [countries, setCountries] = useState<SupportedCountry[]>([]);

  // Form state
  const [selectedCountry, setSelectedCountry] = useState<SupportedCountry | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Loading states
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load initial data
  useEffect(() => {
    if (shopId) {
      loadData();
      loadCountries();
    }
  }, [shopId]);

  // Handle success/refresh URL params
  useEffect(() => {
    const success = searchParams.get('success');
    const refresh = searchParams.get('refresh');

    if (success === 'true') {
      toast.success('Stripe Connect setup completed successfully!');
      loadData();
      // Clean up URL params
      searchParams.delete('success');
      setSearchParams(searchParams, { replace: true });
    }

    if (refresh === 'true') {
      loadData();
      searchParams.delete('refresh');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  const loadData = async () => {
    if (!shopId) return;

    setLoading(true);
    try {
      const status = await stripeConnectApi.getAccountStatus(shopId);
      setConnectStatus(status);

      // Load additional data if account is connected
      if (status.accountId && status.chargesEnabled) {
        const [balanceData, transfersData, payoutsData] = await Promise.all([
          stripeConnectApi.getVendorBalance(shopId).catch(() => null),
          stripeConnectApi.getVendorTransfers(shopId).catch(() => []),
          stripeConnectApi.getPayoutHistory(shopId).catch(() => []),
        ]);

        if (balanceData) setBalance(balanceData);
        setTransfers(transfersData);
        setPayouts(payoutsData);
      }
    } catch (error) {
      console.error('Failed to load connect status:', error);
      // Set default not-connected state
      setConnectStatus({
        accountId: null,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        requirements: null,
        currentDeadline: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const { countries: countryList } = await stripeConnectApi.getSupportedCountries();
      setCountries(countryList);
      // Set default country
      const defaultCountry = countryList.find(c => c.code === 'US');
      if (defaultCountry) setSelectedCountry(defaultCountry);
    } catch (error) {
      console.error('Failed to load countries:', error);
    }
  };

  const handleCreateAccount = async () => {
    if (!shopId || !selectedCountry) {
      toast.error('Please select your business country');
      return;
    }

    setCreatingAccount(true);
    try {
      const { onboardingUrl } = await stripeConnectApi.createConnectAccount(shopId, {
        country: selectedCountry.code,
        businessName: businessName || undefined,
      });

      // Redirect to Stripe onboarding
      window.location.href = onboardingUrl;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create Stripe account');
    } finally {
      setCreatingAccount(false);
    }
  };

  const handleContinueOnboarding = async () => {
    if (!shopId) return;

    try {
      const { onboardingUrl } = await stripeConnectApi.getOnboardingLink(shopId);
      window.location.href = onboardingUrl;
    } catch (error: any) {
      toast.error(error.message || 'Failed to get onboarding link');
    }
  };

  const handleOpenDashboard = async () => {
    if (!shopId) return;

    try {
      const { url } = await stripeConnectApi.getDashboardLink(shopId);
      window.open(url, '_blank');
    } catch (error: any) {
      toast.error(error.message || 'Failed to open dashboard');
    }
  };

  const handleDisconnect = async () => {
    if (!shopId) return;

    const confirmed = window.confirm(
      'Are you sure you want to disconnect your Stripe account? You will not be able to receive card payments until you reconnect.'
    );

    if (!confirmed) return;

    setDisconnecting(true);
    try {
      await stripeConnectApi.disconnectAccount(shopId);
      toast.success('Stripe account disconnected');
      setConnectStatus({
        accountId: null,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        requirements: null,
        currentDeadline: null,
      });
      setBalance(null);
      setTransfers([]);
      setPayouts([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to disconnect account');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  // Format currency - handle JPY and other zero-decimal currencies correctly
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    // JPY and other zero-decimal currencies should show no decimal places
    const isZeroDecimal = ['JPY', 'KRW', 'VND', 'BIF', 'CLP', 'DJF', 'GNF', 'ISK',
      'KMF', 'PYG', 'RWF', 'UGX', 'VUV', 'XAF', 'XOF', 'XPF'].includes(currency.toUpperCase());

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; icon: React.ReactNode }> = {
      pending: { className: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
      processing: { className: 'bg-blue-100 text-blue-700', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
      paid: { className: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
      failed: { className: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" /> },
      cancelled: { className: 'bg-gray-100 text-gray-700', icon: <XCircle className="w-3 h-3" /> },
    };

    const { className, icon } = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-lime" />
      </div>
    );
  }

  const isConnected = connectStatus?.accountId && connectStatus?.chargesEnabled && connectStatus?.payoutsEnabled;
  const needsOnboarding = connectStatus?.accountId && !connectStatus?.onboardingComplete;
  const isRestricted = connectStatus?.accountId && connectStatus?.onboardingComplete &&
    (!connectStatus?.chargesEnabled || !connectStatus?.payoutsEnabled);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('vendor.paymentSettings.title', 'Payment Settings')}
          </h1>
          <p className="mt-1 text-gray-500">
            {t('vendor.paymentSettings.subtitle', 'Connect your Stripe account to receive payments')}
          </p>
        </div>
        {connectStatus?.accountId && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {/* Connection Status Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <CreditCard className="w-5 h-5 text-primary-lime" />
          <h2 className="text-lg font-semibold text-gray-900">
            {t('vendor.paymentSettings.stripeConnect', 'Stripe Connect')}
          </h2>
        </div>

        {/* Not Connected State */}
        {!connectStatus?.accountId && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-lime/10 flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 text-primary-lime" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Connect with Stripe</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Set up Stripe Connect to accept card payments from customers. Funds will be automatically
                    deposited to your bank account.
                  </p>
                </div>
              </div>
            </div>

            {/* Country Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Country *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                  >
                    {selectedCountry ? (
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{selectedCountry.flag}</span>
                        <span>{selectedCountry.name}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">Select your country...</span>
                    )}
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showCountryDropdown && (
                    <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(country);
                            setShowCountryDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 ${
                            selectedCountry?.code === country.code ? 'bg-primary-lime/10' : ''
                          }`}
                        >
                          <span className="text-xl">{country.flag}</span>
                          <span>{country.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name (Optional)
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your business name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                />
              </div>
            </div>

            <Button
              onClick={handleCreateAccount}
              disabled={creatingAccount || !selectedCountry}
              className="bg-primary-lime hover:bg-primary-lime/90 gap-2"
            >
              {creatingAccount ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4" />
                  Set Up Stripe Connect
                </>
              )}
            </Button>
          </div>
        )}

        {/* Needs Onboarding State */}
        {needsOnboarding && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Complete Your Setup</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Your Stripe account is created but setup is incomplete. Please continue the onboarding
                    process to start accepting payments.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleContinueOnboarding}
                className="bg-primary-lime hover:bg-primary-lime/90 gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Continue Setup
              </Button>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                Disconnect
              </Button>
            </div>
          </div>
        )}

        {/* Restricted State */}
        {isRestricted && (
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Account Restricted</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Your Stripe account has restrictions. Please visit your Stripe dashboard to resolve
                    any pending requirements.
                  </p>
                  {connectStatus.currentDeadline && (
                    <p className="text-sm text-orange-600 mt-2">
                      Deadline: {formatDate(new Date(connectStatus.currentDeadline * 1000).toISOString())}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleOpenDashboard}
                className="bg-primary-lime hover:bg-primary-lime/90 gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Stripe Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={handleContinueOnboarding}
                className="gap-2"
              >
                Continue Onboarding
              </Button>
            </div>
          </div>
        )}

        {/* Fully Connected State */}
        {isConnected && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-100 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Stripe Connected</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Your Stripe account is fully connected and ready to receive payments.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Account ID: {connectStatus.accountId}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Charges enabled
                  </span>
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Payouts enabled
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleOpenDashboard}
                className="bg-primary-lime hover:bg-primary-lime/90 gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Stripe Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Balance Card - Only show if connected */}
      {isConnected && balance && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <Wallet className="w-5 h-5 text-primary-lime" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t('vendor.paymentSettings.balance', 'Account Balance')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Available Balance</span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(balance.available, balance.currency)}
              </p>
              <p className="text-sm text-gray-500 mt-1">Ready for payout</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Pending Balance</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(balance.pending, balance.currency)}
              </p>
              <p className="text-sm text-gray-500 mt-1">Arriving soon</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transfers - Only show if connected */}
      {isConnected && transfers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary-lime" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t('vendor.paymentSettings.recentTransfers', 'Recent Transfers')}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transfer.created)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      +{formatCurrency(transfer.amount, transfer.currency)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transfer.description || 'Payment transfer'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                      {transfer.id.slice(0, 20)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payout History - Only show if connected */}
      {isConnected && payouts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <DollarSign className="w-5 h-5 text-primary-lime" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t('vendor.paymentSettings.payoutHistory', 'Payout History')}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform Fee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payout.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      +{formatCurrency(payout.amount, payout.currency)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatCurrency(payout.platformFee, payout.currency)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(payout.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payout.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">How Stripe Connect Works</h3>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li>
                <strong>1. Connect:</strong> Set up your Stripe account with your business details
              </li>
              <li>
                <strong>2. Accept Payments:</strong> Customers pay with cards on your storefront
              </li>
              <li>
                <strong>3. Get Paid:</strong> Funds are automatically transferred to your bank account (minus platform fee)
              </li>
              <li>
                <strong>Platform Fee:</strong> A 1% platform fee is deducted from each transaction
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PaymentSettingsPage };
export default PaymentSettingsPage;

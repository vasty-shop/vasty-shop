'use client';

/**
 * Storefront Profile Page
 * Uses storefront theme for profile display - no header/footer (provided by StorefrontLayout)
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  LogOut,
  Edit2,
  Loader2,
  Trash2,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import api from '@/lib/api';
import { useStorefront } from '../StorefrontLayout';
import { useTranslation } from 'react-i18next';

type Tab = 'profile' | 'orders' | 'wishlist';

export function StorefrontProfilePage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { theme } = useStorefront();
  const { storeCustomer, isStoreAuthenticated, storeLogout } = useStoreAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Check if user is authenticated for this specific store
  const isAuthenticated = shopId ? isStoreAuthenticated(shopId) : false;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (storeCustomer) {
      const nameParts = storeCustomer.name?.split(' ') || [];
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: storeCustomer.email || '',
        phone: storeCustomer.phone || '',
      });
      setAvatarUrl(storeCustomer.avatar || storeCustomer.avatarUrl || null);
    }
  }, [storeCustomer]);

  if (!theme) return null;

  const getBorderRadius = (size: 'small' | 'medium' | 'large' = 'medium') => {
    const radiusMap: Record<string, Record<string, string>> = {
      none: { small: 'rounded-none', medium: 'rounded-none', large: 'rounded-none' },
      small: { small: 'rounded', medium: 'rounded-md', large: 'rounded-lg' },
      medium: { small: 'rounded-md', medium: 'rounded-lg', large: 'rounded-xl' },
      large: { small: 'rounded-lg', medium: 'rounded-xl', large: 'rounded-2xl' },
      full: { small: 'rounded-xl', medium: 'rounded-2xl', large: 'rounded-3xl' },
    };
    return radiusMap[theme.borderRadius]?.[size] || 'rounded-lg';
  };

  const getSecondaryTextStyle = () => ({
    color: theme.textColor,
    opacity: 0.7,
  });

  const getCardBg = () => {
    const isDark = theme.backgroundColor.toLowerCase() === '#000000' ||
                   theme.backgroundColor.toLowerCase() === '#1a1a1a' ||
                   theme.backgroundColor.toLowerCase().includes('rgb(0');
    if (isDark) {
      return 'rgba(255,255,255,0.05)';
    }
    return theme.backgroundColor;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !shopId) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.invalidImageType') || 'Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.imageTooLarge') || 'Image size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post(`/auth/store/${shopId}/avatar`, formData);
      const newAvatarUrl = response.data?.avatarUrl || response.data?.avatar || response.avatarUrl || response.avatar;

      if (newAvatarUrl) {
        setAvatarUrl(newAvatarUrl);
        toast.success(t('profile.avatarUpdated') || 'Avatar updated successfully');
      }
    } catch (error: any) {
      toast.error(error.message || t('profile.avatarUpdateFailed') || 'Failed to update avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!shopId) return;

    setLoading(true);
    try {
      // Call store-specific profile update endpoint
      await api.put(`/auth/store/${shopId}/profile`, {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
      });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!shopId || deleteConfirmText !== 'DELETE') return;

    setIsDeleting(true);
    try {
      await api.delete(`/auth/store/${shopId}/account`);
      toast.success('Account deleted successfully');
      storeLogout(shopId);
      window.location.href = `/store/${shopId}`;
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account. Please contact support.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: t('common.profile'), icon: <User className="w-5 h-5" /> },
    { id: 'orders', label: t('common.orders'), icon: <Package className="w-5 h-5" /> },
    { id: 'wishlist', label: t('common.wishlist'), icon: <Heart className="w-5 h-5" /> },
  ];

  if (!isAuthenticated) {
    return (
      <div className="py-20 px-6" style={{ color: theme.textColor }}>
        <div className="max-w-2xl mx-auto text-center">
          <User
            className="w-20 h-20 mx-auto mb-6"
            style={{ color: theme.textColor, opacity: 0.2 }}
          />
          <h1
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: theme.headingFont, color: theme.textColor }}
          >
            {t('auth.signInToContinue')}
          </h1>
          <p className="text-lg mb-8" style={getSecondaryTextStyle()}>
            {t('profile.myProfile')}
          </p>
          <Link
            to={`/store/${shopId}/login`}
            className={`inline-flex items-center gap-2 px-6 py-3 font-medium ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90`}
            style={{ backgroundColor: theme.primaryColor }}
          >
            {t('common.login')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-6" style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
      <div className="max-w-6xl mx-auto">
        <h1
          className="text-3xl md:text-4xl font-bold mb-8"
          style={{ fontFamily: theme.headingFont, color: theme.textColor }}
        >
          {t('header.myAccount')}
        </h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div
              className={`p-6 ${getBorderRadius('large')} border`}
              style={{
                backgroundColor: getCardBg(),
                borderColor: `${theme.textColor}15`,
              }}
            >
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="relative inline-block mb-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={storeCustomer?.name || 'User'}
                      className="w-24 h-24 rounded-full object-cover border-4"
                      style={{ borderColor: `${theme.primaryColor}30` }}
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center border-4"
                      style={{ backgroundColor: `${theme.primaryColor}20`, borderColor: `${theme.primaryColor}30` }}
                    >
                      <span className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
                        {storeCustomer?.name?.charAt(0) || storeCustomer?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  {/* Camera Button */}
                  <label
                    className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>
                </div>
                <h3 className="font-semibold" style={{ color: theme.textColor }}>
                  {storeCustomer?.name || 'User'}
                </h3>
                <p className="text-sm" style={getSecondaryTextStyle()}>
                  {storeCustomer?.email}
                </p>
              </div>

              {/* Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'orders') {
                        window.location.href = `/store/${shopId}/orders`;
                      } else if (tab.id === 'wishlist') {
                        window.location.href = `/store/${shopId}/wishlist`;
                      } else {
                        setActiveTab(tab.id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 ${getBorderRadius('medium')} transition-colors text-left`}
                    style={{
                      backgroundColor: activeTab === tab.id ? `${theme.primaryColor}15` : 'transparent',
                      color: activeTab === tab.id ? theme.primaryColor : theme.textColor,
                      opacity: activeTab === tab.id ? 1 : 0.7,
                    }}
                  >
                    {tab.icon}
                    <span className={activeTab === tab.id ? 'font-semibold' : ''}>
                      {tab.label}
                    </span>
                  </button>
                ))}

                <button
                  onClick={() => shopId && storeLogout(shopId)}
                  className={`w-full flex items-center gap-3 px-4 py-3 ${getBorderRadius('medium')} text-red-500 transition-colors text-left`}
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <LogOut className="w-5 h-5" />
                  {t('common.logout')}
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className={`w-full flex items-center gap-3 px-4 py-3 ${getBorderRadius('medium')} text-red-600 transition-colors text-left mt-2`}
                  style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
                >
                  <Trash2 className="w-5 h-5" />
                  {t('profile.deleteAccount')}
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div
              className={`p-6 ${getBorderRadius('large')} border`}
              style={{
                backgroundColor: getCardBg(),
                borderColor: `${theme.textColor}15`,
              }}
            >
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2
                    className="text-xl font-bold"
                    style={{ fontFamily: theme.headingFont, color: theme.textColor }}
                  >
                    {t('profile.personalInfo')}
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: theme.textColor }}
                      >
                        {t('checkout.firstName')}
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={`w-full px-4 py-2 border ${getBorderRadius('medium')} focus:outline-none focus:ring-2`}
                        style={{
                          backgroundColor: getCardBg(),
                          borderColor: `${theme.textColor}20`,
                          color: theme.textColor,
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: theme.textColor }}
                      >
                        {t('checkout.lastName')}
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={`w-full px-4 py-2 border ${getBorderRadius('medium')} focus:outline-none focus:ring-2`}
                        style={{
                          backgroundColor: getCardBg(),
                          borderColor: `${theme.textColor}20`,
                          color: theme.textColor,
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: theme.textColor }}
                      >
                        {t('checkout.email')}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className={`w-full px-4 py-2 border ${getBorderRadius('medium')}`}
                        style={{
                          backgroundColor: `${theme.textColor}05`,
                          borderColor: `${theme.textColor}20`,
                          color: theme.textColor,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: theme.textColor }}
                      >
                        {t('checkout.phone')}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full px-4 py-2 border ${getBorderRadius('medium')} focus:outline-none focus:ring-2`}
                        style={{
                          backgroundColor: getCardBg(),
                          borderColor: `${theme.textColor}20`,
                          color: theme.textColor,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className={`flex items-center gap-2 px-6 py-3 font-medium ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90 disabled:opacity-50`}
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
                    {t('profile.editProfile')}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`p-6 max-w-md w-full ${getBorderRadius('large')}`}
            style={{ backgroundColor: theme.backgroundColor }}
          >
            <div className="flex items-center space-x-3 text-red-500 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold" style={{ color: theme.textColor }}>
                {t('profile.deleteAccount')}
              </h3>
            </div>
            <p className="mb-4" style={{ color: theme.textColor, opacity: 0.8 }}>
              {t('profile.deleteAccountWarning')}
            </p>
            <ul className="mb-4 list-disc list-inside space-y-1" style={{ color: theme.textColor, opacity: 0.8 }}>
              <li>{t('profile.personalInfo')}</li>
              <li>{t('orders.orderHistory')}</li>
              <li>{t('profile.savedAddresses')}</li>
              <li>{t('wishlist.myWishlist')}</li>
            </ul>
            <p className="font-medium mb-2" style={{ color: theme.textColor }}>
              Type <span className="text-red-500 font-bold">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className={`w-full px-4 py-3 border ${getBorderRadius('medium')} focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 mb-4`}
              style={{
                backgroundColor: getCardBg(),
                borderColor: `${theme.textColor}20`,
                color: theme.textColor,
              }}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className={`flex-1 px-4 py-3 font-medium ${getBorderRadius('medium')} transition-colors`}
                style={{
                  backgroundColor: `${theme.textColor}10`,
                  color: theme.textColor,
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className={`flex-1 px-4 py-3 bg-red-500 text-white font-medium ${getBorderRadius('medium')} hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t('profile.deleteAccount')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StorefrontProfilePage;

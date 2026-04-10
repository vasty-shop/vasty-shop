import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Camera, Save, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useVendorAuthStore } from '@/stores/useVendorAuthStore';
import { api } from '@/lib/api';

export const VendorProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { vendor, setVendor, logout } = useVendorAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
    bio: ''
  });

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const vendorProfile = await api.getVendorProfile();
        setProfile({
          firstName: vendorProfile.firstName || '',
          lastName: vendorProfile.lastName || '',
          email: vendorProfile.email || '',
          phone: vendorProfile.phone || '',
          address: vendorProfile.address || '',
          avatar: vendorProfile.avatar || '',
          bio: vendorProfile.bio || ''
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Fallback to vendor store data
        if (vendor) {
          setProfile({
            firstName: vendor.firstName || '',
            lastName: vendor.lastName || '',
            email: vendor.email || '',
            phone: vendor.phone || '',
            address: '',
            avatar: '',
            bio: ''
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [vendor]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('vendor.profile.selectImageFile'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('vendor.profile.imageSizeLimit'));
      return;
    }

    try {
      setUploading(true);
      const result = await api.uploadAvatar(file);
      setProfile(prev => ({ ...prev, avatar: result.url }));

      // Immediately update vendor store so header avatar updates
      if (vendor) {
        setVendor({
          ...vendor,
          avatar: result.url
        });
      }

      toast.success(t('vendor.profile.avatarUploadSuccess'));
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error(t('vendor.profile.avatarUploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedProfile = await api.updateVendorProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        address: profile.address,
        bio: profile.bio,
        avatar: profile.avatar
      });

      // Update the vendor store with new data (including avatar)
      if (vendor) {
        setVendor({
          ...vendor,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          avatar: profile.avatar  // Update avatar in store for header
        });
      }

      toast.success(t('vendor.profile.profileUpdateSuccess'));
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(t('vendor.profile.profileUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setIsDeleting(true);
    try {
      await api.delete('/auth/vendor/account');
      toast.success(t('vendor.profile.deleteAccount.success'));
      logout();
      navigate('/vendor/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error(t('vendor.profile.deleteAccount.failed'));
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-lime animate-spin" />
      </div>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || 'Your Name';

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('vendor.profile.title')}</h1>
          <p className="text-gray-500 mt-1">{t('vendor.profile.subtitle')}</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Avatar Section */}
          <div className="bg-gradient-to-r from-primary-lime to-green-500 p-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-4 border-white shadow-lg">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={handleImageClick}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{fullName}</h2>
                <p className="text-white/80">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6 space-y-6">
            {/* First Name & Last Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('vendor.profile.firstName')}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-lime/50 focus:border-primary-lime"
                    placeholder={t('vendor.placeholders.firstName')}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('vendor.profile.lastName')}
                </label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-lime/50 focus:border-primary-lime"
                  placeholder={t('vendor.placeholders.lastName')}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('vendor.profile.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={profile.email}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-lime/50 focus:border-primary-lime bg-gray-50"
                  placeholder={t('vendor.placeholders.email')}
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{t('vendor.profile.emailCannotChange')}</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('vendor.profile.phone')}
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-lime/50 focus:border-primary-lime"
                  placeholder={t('vendor.placeholders.phone')}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('vendor.profile.address')}
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  rows={3}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-lime/50 focus:border-primary-lime resize-none"
                  placeholder={t('vendor.placeholders.address')}
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('vendor.profile.bio')}
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-lime/50 focus:border-primary-lime resize-none"
                placeholder={t('vendor.placeholders.bio')}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary-lime text-white rounded-xl font-medium hover:bg-primary-lime/90 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? t('vendor.profile.saving') : t('vendor.profile.saveChanges')}
              </button>
            </div>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
            <Trash2 className="w-5 h-5 mr-2" />
            {t('vendor.profile.deleteAccount.title')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('vendor.profile.deleteAccount.description')}
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
          >
            {t('vendor.profile.deleteAccount.button')}
          </button>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center space-x-3 text-red-500 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">{t('vendor.profile.deleteAccount.modalTitle')}</h3>
            </div>
            <p className="text-gray-600 mb-4">
              {t('vendor.profile.deleteAccount.modalDescription')}
            </p>
            <ul className="text-gray-600 mb-4 list-disc list-inside space-y-1">
              <li>{t('vendor.profile.deleteAccount.profileInfo')}</li>
              <li>{t('vendor.profile.deleteAccount.shopsAndProducts')}</li>
              <li>{t('vendor.profile.deleteAccount.orderHistory')}</li>
              <li>{t('vendor.profile.deleteAccount.earningsRecords')}</li>
            </ul>
            <p className="text-gray-700 font-medium mb-2" dangerouslySetInnerHTML={{ __html: t('vendor.profile.deleteAccount.confirmPrompt') }} />
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={t('vendor.placeholders.typeDelete')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                {t('vendor.profile.deleteAccount.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t('vendor.profile.deleteAccount.confirm')
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

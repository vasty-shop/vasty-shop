import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Save,
  Loader2,
  Clock,
  RefreshCw,
  Camera,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDeliveryAuthStore } from '@/stores/useDeliveryAuthStore';
import { deliveryApi } from '../api/deliveryApi';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export const DeliveryProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { deliveryManId } = useParams<{ deliveryManId: string }>();
  const { deliveryMan, updateProfile, logout } = useDeliveryAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileCreatedAt, setProfileCreatedAt] = useState(deliveryMan?.createdAt || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: deliveryMan?.firstName || '',
    lastName: deliveryMan?.lastName || '',
    phone: deliveryMan?.phone || '',
  });

  // Fetch fresh profile data on mount
  const fetchProfileData = async () => {
    // Use URL param or fall back to store
    const id = deliveryManId || deliveryMan?.id;
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch fresh profile data
      const response = await deliveryApi.getProfile(id);
      const profileData = response.data?.data || response.data;

      if (profileData) {
        // Update createdAt from API
        if (profileData.createdAt) {
          setProfileCreatedAt(profileData.createdAt);
        }

        // Only update editable profile fields in store, preserve stats
        updateProfile({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          avatar: profileData.avatar || profileData.imageUrl,
        });

        // Update form data
        setFormData({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          phone: profileData.phone || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [deliveryManId, deliveryMan?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!deliveryMan?.id) return;

    setIsSaving(true);
    try {
      // Backend expects 'name' as single field, combine firstName + lastName
      const updateData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
      };
      await deliveryApi.updateProfile(deliveryMan.id, updateData);
      updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      toast.success(t('delivery.profile.profileUpdated'));
      setIsEditing(false);
    } catch (error) {
      toast.error(t('delivery.profile.updateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !deliveryMan?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('delivery.profile.selectImageFile'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('delivery.profile.imageSizeLimit'));
      return;
    }

    setIsUploadingImage(true);
    try {
      // Upload image
      const { url } = await api.uploadAvatar(file);

      // Update profile with new image URL
      await deliveryApi.updateProfile(deliveryMan.id, { imageUrl: url });
      updateProfile({ avatar: url });

      toast.success(t('delivery.profile.imageUpdated'));
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error(t('delivery.profile.uploadFailed'));
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!deliveryMan?.id || deleteConfirmText !== 'DELETE') return;

    setIsDeleting(true);
    try {
      await api.delete(`/delivery-man/${deliveryMan.id}`);
      toast.success(t('delivery.profile.accountDeleted'));
      logout();
      navigate('/delivery/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error(t('delivery.profile.deleteFailed'));
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-300 to-amber-300 rounded-2xl p-6 animate-pulse h-40" />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-48 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('delivery.profile.title')}</h1>
          <p className="text-gray-500 mt-1">{t('delivery.profile.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchProfileData}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
            title={t('delivery.common.refreshProfile')}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors"
            >
              {t('delivery.profile.editProfile')}
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                {t('delivery.common.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {t('delivery.settings.saveChanges')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden">
              {isUploadingImage ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : deliveryMan?.avatar ? (
                <img
                  src={deliveryMan.avatar}
                  alt={deliveryMan.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-orange-500" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">
              {deliveryMan?.firstName} {deliveryMan?.lastName}
            </h2>
            <p className="text-orange-100 mt-1">{deliveryMan?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>{t('delivery.profile.memberSince')} {new Date(profileCreatedAt || deliveryMan?.createdAt || '').getFullYear()}</span>
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <User className="w-5 h-5 mr-2 text-orange-500" />
          {t('delivery.profile.personalInfo')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('delivery.profile.firstName')}</label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            ) : (
              <p className="text-gray-900">{deliveryMan?.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('delivery.profile.lastName')}</label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            ) : (
              <p className="text-gray-900">{deliveryMan?.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('delivery.profile.email')}</label>
            <div className="flex items-center space-x-2 text-gray-900">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{deliveryMan?.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('delivery.profile.phone')}</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            ) : (
              <div className="flex items-center space-x-2 text-gray-900">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{deliveryMan?.phone || t('delivery.profile.notProvided')}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Account Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-red-100 p-6"
      >
        <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
          <Trash2 className="w-5 h-5 mr-2" />
          {t('delivery.profile.deleteAccount')}
        </h3>
        <p className="text-gray-600 mb-4">
          {t('delivery.profile.deleteWarning')}
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
        >
          {t('delivery.profile.deleteMyAccount')}
        </button>
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
              <h3 className="text-xl font-bold">{t('delivery.profile.deleteAccount')}</h3>
            </div>
            <p className="text-gray-600 mb-4">
              {t('delivery.profile.deleteConfirmMessage')}
            </p>
            <ul className="text-gray-600 mb-4 list-disc list-inside space-y-1">
              <li>{t('delivery.profile.deleteItem1')}</li>
              <li>{t('delivery.profile.deleteItem2')}</li>
              <li>{t('delivery.profile.deleteItem3')}</li>
            </ul>
            <p className="text-gray-700 font-medium mb-2">
              {t('delivery.profile.typeDelete')} <span className="text-red-500 font-bold">DELETE</span> {t('delivery.profile.toConfirm')}:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={t('delivery.profile.typeDeletePlaceholder')}
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
                {t('delivery.common.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t('delivery.profile.deleteAccount')
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

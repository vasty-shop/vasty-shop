import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  MapPin,
  CreditCard,
  Package,
  Heart,
  Settings,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Shield,
  Edit2,
  Plus,
  Trash2,
  Check,
  Upload,
  Loader2,
  Camera,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useUserStore } from '@/stores/useUserStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { cn } from '@/lib/utils';

type Tab =
  | 'dashboard'
  | 'personal-info'
  | 'addresses'
  | 'payment-methods'
  | 'order-history'
  | 'wishlist'
  | 'settings';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex';
  lastFourDigits: string;
  expiryDate: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'delivered' | 'processing' | 'shipped' | 'cancelled';
  total: number;
  items: number;
}

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: authUser, logout, refreshUser } = useAuth();
  const stats = useUserStore((state) => state.stats);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form state for personal info
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // State for orders, addresses, and payment methods
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [paymentMethodsError, setPaymentMethodsError] = useState<string | null>(null);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Load user data when component mounts or authUser changes
  useEffect(() => {
    if (authUser) {
      setFormData({
        firstName: authUser.metadata?.firstName || authUser.name?.split(' ')[0] || '',
        lastName: authUser.metadata?.lastName || authUser.name?.split(' ')[1] || '',
        email: authUser.email || '',
        phone: authUser.phone || authUser.metadata?.phone || '',
      });
      // Load avatar from user metadata
      setAvatarUrl(authUser.metadata?.avatarUrl || authUser.avatar || null);
    }
  }, [authUser]);

  // Handle profile photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('profilePage.toasts.selectImageFile', { defaultValue: 'Please select an image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profilePage.toasts.imageTooLarge', { defaultValue: 'Image must be less than 5MB' }));
      return;
    }

    setPhotoUploading(true);
    try {
      // Upload the image
      const uploadResponse = await api.uploadProductImage(file);
      const imageUrl = uploadResponse.url;

      // Update user metadata with new avatar URL
      await api.updateProfile({
        metadata: {
          ...authUser?.metadata,
          avatarUrl: imageUrl,
        },
      });

      setAvatarUrl(imageUrl);
      toast.success(t('profilePage.toasts.photoUpdated', { defaultValue: 'Profile photo updated successfully' }));

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error: any) {
      console.error('Failed to upload photo:', error);
      toast.error(error?.response?.data?.message || t('profilePage.toasts.photoUploadFailed', { defaultValue: 'Failed to upload photo' }));
    } finally {
      setPhotoUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // If no user is authenticated, show loading or redirect
  if (!authUser) {
    return (
      <div className="min-h-screen bg-cloud-gradient flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <p className="text-text-secondary mb-4">{t('profilePage.notAuthenticated.message', { defaultValue: 'Please log in to view your profile' })}</p>
            <Link to="/auth/login">
              <Button>{t('profilePage.notAuthenticated.goToLogin', { defaultValue: 'Go to Login' })}</Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const user = authUser;

  // Fetch orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const response = await api.getOrders({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
      const ordersData = response.data || [];

      // Transform API response to match Order interface
      const transformedOrders: Order[] = ordersData.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber || order.order_number,
        date: order.createdAt || order.created_at,
        status: order.status as Order['status'],
        total: parseFloat(order.total),
        items: order.items?.length || 0,
      }));

      setOrders(transformedOrders);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      setOrdersError(error?.response?.data?.message || 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    setAddressesLoading(true);
    setAddressesError(null);
    try {
      const addressesData = await api.getAddresses();

      // Transform API response to match Address interface
      const transformedAddresses: Address[] = (addressesData || []).map((addr: any) => ({
        id: addr.id,
        name: addr.fullName || addr.full_name,
        phone: addr.phoneNumber || addr.phone_number,
        address: `${addr.addressLine1 || addr.address_line_1}${addr.addressLine2 || addr.address_line_2 ? ', ' + (addr.addressLine2 || addr.address_line_2) : ''}`,
        city: addr.city,
        state: addr.state,
        zipCode: addr.postalCode || addr.postal_code,
        isDefault: addr.isDefault || addr.is_default || false,
      }));

      setAddresses(transformedAddresses);
    } catch (error: any) {
      console.error('Failed to fetch addresses:', error);
      setAddressesError(error?.response?.data?.message || 'Failed to load addresses');
    } finally {
      setAddressesLoading(false);
    }
  };

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    setPaymentMethodsLoading(true);
    setPaymentMethodsError(null);
    try {
      const response = await api.getPaymentMethods();
      // Note: The payment methods endpoint returns available payment types, not saved cards
      // For now, we'll set an empty array as the backend doesn't store saved payment methods
      setPaymentMethods([]);
    } catch (error: any) {
      console.error('Failed to fetch payment methods:', error);
      setPaymentMethodsError(error?.response?.data?.message || 'Failed to load payment methods');
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  // Fetch data when component mounts or when tab changes
  useEffect(() => {
    if (authUser) {
      if (activeTab === 'dashboard' || activeTab === 'order-history') {
        fetchOrders();
      }
      if (activeTab === 'dashboard' || activeTab === 'addresses') {
        fetchAddresses();
      }
      if (activeTab === 'payment-methods') {
        fetchPaymentMethods();
      }
    }
  }, [authUser, activeTab]);

  const navigationItems = [
    {
      id: 'dashboard' as Tab,
      label: t('profilePage.nav.dashboard', { defaultValue: 'Dashboard' }),
      icon: LayoutDashboard,
    },
    {
      id: 'personal-info' as Tab,
      label: t('profilePage.nav.personalInfo', { defaultValue: 'Personal Info' }),
      icon: User,
    },
    {
      id: 'addresses' as Tab,
      label: t('profilePage.nav.addresses', { defaultValue: 'Addresses' }),
      icon: MapPin,
    },
    {
      id: 'payment-methods' as Tab,
      label: t('profilePage.nav.paymentMethods', { defaultValue: 'Payment Methods' }),
      icon: CreditCard,
    },
    {
      id: 'order-history' as Tab,
      label: t('profilePage.nav.orderHistory', { defaultValue: 'Order History' }),
      icon: Package,
    },
    {
      id: 'wishlist' as Tab,
      label: t('profilePage.nav.wishlist', { defaultValue: 'Wishlist' }),
      icon: Heart,
    },
    {
      id: 'settings' as Tab,
      label: t('profilePage.nav.settings', { defaultValue: 'Settings' }),
      icon: Settings,
    },
  ];

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {t('profilePage.dashboard.welcome', { name: user.name?.split(' ')[0] || t('profilePage.dashboard.defaultUser', { defaultValue: 'User' }), defaultValue: 'Welcome back, {{name}}!' })}
        </h2>
        <p className="text-text-secondary">
          {t('profilePage.dashboard.subtitle', { defaultValue: "Here's what's happening with your account" })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">{t('profilePage.dashboard.stats.totalOrders', { defaultValue: 'Total Orders' })}</p>
              <p className="text-2xl font-bold text-text-primary">24</p>
            </div>
            <div className="p-3 bg-accent-blue/10 rounded-button">
              <ShoppingBag className="w-6 h-6 text-accent-blue" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">{t('profilePage.dashboard.stats.activeOrders', { defaultValue: 'Active Orders' })}</p>
              <p className="text-2xl font-bold text-text-primary">2</p>
            </div>
            <div className="p-3 bg-primary-lime/10 rounded-button">
              <Package className="w-6 h-6 text-primary-lime" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">{t('profilePage.dashboard.stats.wishlistItems', { defaultValue: 'Wishlist Items' })}</p>
              <p className="text-2xl font-bold text-text-primary">{stats.savedOutfits}</p>
            </div>
            <div className="p-3 bg-badge-sale/10 rounded-button">
              <Heart className="w-6 h-6 text-badge-sale" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">{t('profilePage.dashboard.stats.rewardPoints', { defaultValue: 'Reward Points' })}</p>
              <p className="text-2xl font-bold text-text-primary">1,250</p>
            </div>
            <div className="p-3 bg-badge-trending/10 rounded-button">
              <Shield className="w-6 h-6 text-badge-trending" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-primary">{t('profilePage.dashboard.recentOrders.title', { defaultValue: 'Recent Orders' })}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('order-history')}
          >
            {t('profilePage.dashboard.recentOrders.viewAll', { defaultValue: 'View All' })}
          </Button>
        </div>
        <div className="space-y-4">
          {ordersLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-lime"></div>
              <p className="mt-2 text-sm text-text-secondary">{t('profilePage.loading.orders', { defaultValue: 'Loading orders...' })}</p>
            </div>
          ) : ordersError ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-600">{ordersError}</p>
              <Button variant="outline" size="sm" onClick={fetchOrders} className="mt-2">
                {t('profilePage.common.retry', { defaultValue: 'Retry' })}
              </Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto mb-2 text-text-secondary" />
              <p className="text-sm text-text-secondary">{t('profilePage.dashboard.recentOrders.noOrders', { defaultValue: 'No orders yet' })}</p>
            </div>
          ) : (
            orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-button hover:border-primary-lime transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">{order.orderNumber}</p>
                  <p className="text-sm text-text-secondary">
                    {new Date(order.date).toLocaleDateString()} • {order.items} items
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">
                      ${order.total.toFixed(2)}
                    </p>
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        getStatusColor(order.status)
                      )}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Primary Address */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-primary">{t('profilePage.dashboard.primaryAddress.title', { defaultValue: 'Primary Address' })}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('addresses')}
          >
            {t('profilePage.dashboard.primaryAddress.manage', { defaultValue: 'Manage' })}
          </Button>
        </div>
        {addressesLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-lime"></div>
            <p className="mt-2 text-sm text-text-secondary">{t('profilePage.loading.address', { defaultValue: 'Loading address...' })}</p>
          </div>
        ) : addressesError ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-600">{addressesError}</p>
            <Button variant="outline" size="sm" onClick={fetchAddresses} className="mt-2">
              {t('profilePage.common.retry', { defaultValue: 'Retry' })}
            </Button>
          </div>
        ) : addresses.find((addr) => addr.isDefault) ? (
          <div className="p-4 border border-gray-200 rounded-button">
            <p className="font-semibold text-text-primary mb-1">
              {addresses.find((addr) => addr.isDefault)!.name}
            </p>
            <p className="text-sm text-text-secondary">
              {addresses.find((addr) => addr.isDefault)!.address}
            </p>
            <p className="text-sm text-text-secondary">
              {addresses.find((addr) => addr.isDefault)!.city},{' '}
              {addresses.find((addr) => addr.isDefault)!.state}{' '}
              {addresses.find((addr) => addr.isDefault)!.zipCode}
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-text-secondary" />
            <p className="text-sm text-text-secondary mb-2">{t('profilePage.dashboard.primaryAddress.noAddress', { defaultValue: 'No address saved' })}</p>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('addresses')}>
              {t('profilePage.dashboard.primaryAddress.addAddress', { defaultValue: 'Add Address' })}
            </Button>
          </div>
        )}
      </Card>

      {/* Account Security */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">
          {t('profilePage.dashboard.security.title', { defaultValue: 'Account Security' })}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm text-text-primary">{t('profilePage.dashboard.security.emailVerified', { defaultValue: 'Email Verified' })}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm text-text-primary">{t('profilePage.dashboard.security.phoneVerified', { defaultValue: 'Phone Verified' })}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm text-text-primary">
                {t('profilePage.dashboard.security.twoFactorActive', { defaultValue: 'Two-Factor Authentication Active' })}
              </span>
            </div>
            <Button variant="outline" size="sm">
              {t('profilePage.dashboard.security.manage', { defaultValue: 'Manage' })}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);

    try {
      const updateData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        metadata: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        },
      };

      await api.updateProfile(updateData);
      await refreshUser(); // Refresh user data from server

      toast.success(t('profilePage.toasts.profileUpdated', { defaultValue: 'Profile Updated' }), {
        description: t('profilePage.toasts.profileUpdatedDesc', { defaultValue: 'Your profile has been updated successfully' }),
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(t('profilePage.toasts.updateFailed', { defaultValue: 'Update Failed' }), {
        description: error?.response?.data?.message || t('profilePage.toasts.failedToUpdate', { defaultValue: 'Failed to update profile' }),
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setIsDeleting(true);
    try {
      await api.delete('/auth/account');
      toast.success(t('profilePage.toasts.accountDeleted', { defaultValue: 'Account deleted successfully' }));
      logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error(t('profilePage.toasts.deleteAccountFailed', { defaultValue: 'Failed to delete account. Please contact support.' }));
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const renderPersonalInfo = () => (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-text-primary mb-6">{t('profilePage.personalInfo.title', { defaultValue: 'Personal Information' })}</h2>
      <form className="space-y-6" onSubmit={handleUpdateProfile}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName">{t('profilePage.personalInfo.firstName', { defaultValue: 'First Name' })}</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={updateLoading}
            />
          </div>
          <div>
            <Label htmlFor="lastName">{t('profilePage.personalInfo.lastName', { defaultValue: 'Last Name' })}</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={updateLoading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">{t('profilePage.personalInfo.email', { defaultValue: 'Email Address' })}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={updateLoading}
          />
        </div>

        <div>
          <Label htmlFor="phone">{t('profilePage.personalInfo.phone', { defaultValue: 'Phone Number' })}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            disabled={updateLoading}
          />
        </div>

        <div>
          <Label htmlFor="photo">{t('profilePage.personalInfo.profilePhoto', { defaultValue: 'Profile Photo' })}</Label>
          <div className="flex items-center gap-4 mt-2">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name || t('profilePage.personalInfo.profileAlt', { defaultValue: 'Profile' })}
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary-lime"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-lime text-white flex items-center justify-center text-2xl font-bold">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
              {photoUploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <Button
                variant="outline"
                size="sm"
                type="button"
                disabled={photoUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {photoUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('profilePage.personalInfo.uploading', { defaultValue: 'Uploading...' })}
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    {t('profilePage.personalInfo.uploadNewPhoto', { defaultValue: 'Upload New Photo' })}
                  </>
                )}
              </Button>
              <p className="text-xs text-text-secondary">{t('profilePage.personalInfo.photoRequirements', { defaultValue: 'JPG, PNG or GIF. Max 5MB.' })}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setFormData({
                firstName: authUser.metadata?.firstName || authUser.name?.split(' ')[0] || '',
                lastName: authUser.metadata?.lastName || authUser.name?.split(' ')[1] || '',
                email: authUser.email || '',
                phone: authUser.phone || authUser.metadata?.phone || '',
              });
            }}
            disabled={updateLoading}
          >
            {t('profilePage.common.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button type="submit" disabled={updateLoading}>
            {updateLoading ? t('profilePage.personalInfo.saving', { defaultValue: 'Saving...' }) : t('profilePage.personalInfo.saveChanges', { defaultValue: 'Save Changes' })}
          </Button>
        </div>
      </form>
    </Card>
  );

  const renderAddresses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">{t('profilePage.addresses.title', { defaultValue: 'Saved Addresses' })}</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('profilePage.addresses.addNew', { defaultValue: 'Add New Address' })}
        </Button>
      </div>

      {addressesLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-lime"></div>
          <p className="mt-4 text-text-secondary">{t('profilePage.loading.addresses', { defaultValue: 'Loading addresses...' })}</p>
        </div>
      ) : addressesError ? (
        <Card className="p-12 text-center">
          <p className="text-red-600 mb-4">{addressesError}</p>
          <Button variant="outline" onClick={fetchAddresses}>
            {t('profilePage.common.retry', { defaultValue: 'Retry' })}
          </Button>
        </Card>
      ) : addresses.length === 0 ? (
        <Card className="p-12 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
          <p className="text-text-secondary mb-4">{t('profilePage.addresses.noAddresses', { defaultValue: 'No saved addresses' })}</p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t('profilePage.addresses.addFirst', { defaultValue: 'Add Your First Address' })}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-text-primary">{address.name}</h3>
                    {address.isDefault && (
                      <span className="text-xs px-2 py-1 bg-primary-lime text-white rounded-full">
                        {t('profilePage.common.default', { defaultValue: 'Default' })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mb-1">{address.phone}</p>
                  <p className="text-sm text-text-secondary">{address.address}</p>
                  <p className="text-sm text-text-secondary">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit2 className="w-4 h-4 mr-2" />
                  {t('profilePage.common.edit', { defaultValue: 'Edit' })}
                </Button>
                {!address.isDefault && (
                  <Button variant="outline" size="sm">
                    {t('profilePage.common.setDefault', { defaultValue: 'Set Default' })}
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">{t('profilePage.paymentMethods.title', { defaultValue: 'Payment Methods' })}</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('profilePage.paymentMethods.addNew', { defaultValue: 'Add New Card' })}
        </Button>
      </div>

      {paymentMethodsLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-lime"></div>
          <p className="mt-4 text-text-secondary">{t('profilePage.loading.paymentMethods', { defaultValue: 'Loading payment methods...' })}</p>
        </div>
      ) : paymentMethodsError ? (
        <Card className="p-12 text-center">
          <p className="text-red-600 mb-4">{paymentMethodsError}</p>
          <Button variant="outline" onClick={fetchPaymentMethods}>
            {t('profilePage.common.retry', { defaultValue: 'Retry' })}
          </Button>
        </Card>
      ) : paymentMethods.length === 0 ? (
        <Card className="p-12 text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
          <p className="text-text-secondary mb-2">{t('profilePage.paymentMethods.noMethods', { defaultValue: 'No saved payment methods' })}</p>
          <p className="text-sm text-text-secondary mb-4">
            {t('profilePage.paymentMethods.secureMessage', { defaultValue: 'Payment methods are processed securely at checkout' })}
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t('profilePage.paymentMethods.addMethod', { defaultValue: 'Add Payment Method' })}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-lime to-accent-blue rounded-button flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary capitalize">
                        {method.type}
                      </h3>
                      {method.isDefault && (
                        <span className="text-xs px-2 py-1 bg-primary-lime text-white rounded-full">
                          {t('profilePage.common.default', { defaultValue: 'Default' })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary">
                      **** **** **** {method.lastFourDigits}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {t('profilePage.paymentMethods.expires', { defaultValue: 'Expires' })} {method.expiryDate}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {!method.isDefault && (
                  <Button variant="outline" size="sm" className="flex-1">
                    {t('profilePage.common.setDefault', { defaultValue: 'Set Default' })}
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderOrderHistory = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-primary">{t('profilePage.orderHistory.title', { defaultValue: 'Order History' })}</h2>

      {ordersLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-lime"></div>
          <p className="mt-4 text-text-secondary">{t('profilePage.loading.orders', { defaultValue: 'Loading orders...' })}</p>
        </div>
      ) : ordersError ? (
        <Card className="p-12 text-center">
          <p className="text-red-600 mb-4">{ordersError}</p>
          <Button variant="outline" onClick={fetchOrders}>
            {t('profilePage.common.retry', { defaultValue: 'Retry' })}
          </Button>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
          <p className="text-text-secondary mb-4">{t('profilePage.orderHistory.noOrders', { defaultValue: 'No orders yet' })}</p>
          <Link to="/products">
            <Button>{t('profilePage.orderHistory.startShopping', { defaultValue: 'Start Shopping' })}</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-text-primary">{order.orderNumber}</h3>
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        getStatusColor(order.status)
                      )}
                    >
                      {t(`profilePage.orderHistory.status.${order.status}`, { defaultValue: order.status })}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {t('profilePage.orderHistory.placedOn', { date: new Date(order.date).toLocaleDateString(), defaultValue: 'Placed on {{date}}' })}
                  </p>
                  <p className="text-sm text-text-secondary">{t('profilePage.orderHistory.items', { count: order.items, defaultValue: '{{count}} items' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-text-primary mb-2">
                    ${order.total.toFixed(2)}
                  </p>
                  <Button variant="outline" size="sm">
                    {t('profilePage.orderHistory.viewDetails', { defaultValue: 'View Details' })}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderWishlist = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-primary">{t('profilePage.wishlist.title', { defaultValue: 'My Wishlist' })}</h2>
      <Card className="p-12 text-center">
        <Heart className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
        <p className="text-text-secondary mb-4">{t('profilePage.wishlist.empty', { defaultValue: 'Your wishlist is empty' })}</p>
        <Button>
          <Link to="/products">{t('profilePage.wishlist.browseProducts', { defaultValue: 'Browse Products' })}</Link>
        </Button>
      </Card>
    </div>
  );

  const renderSettingsRedirect = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-primary">{t('profilePage.settingsTab.title', { defaultValue: 'Settings' })}</h2>
      <Card className="p-6">
        <Settings className="w-12 h-12 mb-4 text-text-secondary" />
        <p className="text-text-secondary mb-4">
          {t('profilePage.settingsTab.description', { defaultValue: 'Manage your account settings and preferences' })}
        </p>
        <Link to="/settings">
          <Button>{t('profilePage.settingsTab.goToSettings', { defaultValue: 'Go to Settings' })}</Button>
        </Link>
      </Card>

      {/* Delete Account Section */}
      <Card className="p-6 border-red-200">
        <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
          <Trash2 className="w-5 h-5 mr-2" />
          {t('profilePage.deleteAccount.title', { defaultValue: 'Delete Account' })}
        </h3>
        <p className="text-text-secondary mb-4">
          {t('profilePage.deleteAccount.warning', { defaultValue: 'Once you delete your account, all of your data will be permanently removed. This action cannot be undone.' })}
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
        >
          {t('profilePage.deleteAccount.button', { defaultValue: 'Delete My Account' })}
        </button>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'personal-info':
        return renderPersonalInfo();
      case 'addresses':
        return renderAddresses();
      case 'payment-methods':
        return renderPaymentMethods();
      case 'order-history':
        return renderOrderHistory();
      case 'wishlist':
        return renderWishlist();
      case 'settings':
        return renderSettingsRedirect();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-cloud-gradient flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNavigation
          items={[
            { label: t('profilePage.breadcrumb.account', { defaultValue: 'Account' }), href: '/profile' },
            { label: navigationItems.find((item) => item.id === activeTab)?.label || t('profilePage.nav.dashboard', { defaultValue: 'Dashboard' }) },
          ]}
        />
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden pb-24">
        <div className="container mx-auto px-4 py-6">
          {/* Mobile Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary-lime">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || t('profilePage.dashboard.defaultUser', { defaultValue: 'User' })}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-lime text-white flex items-center justify-center text-2xl font-bold">
                      {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-h2 font-bold text-text-primary">{user.name || t('profilePage.dashboard.defaultUser', { defaultValue: 'User' })}</h1>
                  <p className="text-body text-text-secondary">{user.email}</p>
                  <p className="text-sm text-text-secondary mt-1">{t('profilePage.memberSince', { year: '2023', defaultValue: 'Member since {{year}}' })}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Mobile Menu Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <Card
                    className={cn(
                      'p-4 hover:shadow-lg transition-all cursor-pointer',
                      activeTab === item.id && 'border-2 border-primary-lime'
                    )}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-accent-blue/10 rounded-button">
                        <Icon className="w-5 h-5 text-accent-blue" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-primary">{item.label}</h3>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {/* Logout Button */}
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={logout}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-button">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-600">{t('profilePage.logout', { defaultValue: 'Logout' })}</h3>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-8">
            {/* Left Sidebar (25%) */}
            <div className="w-1/4">
              <Card className="p-6 sticky top-24">
                {/* Profile Photo */}
                <div className="text-center mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-lime mx-auto mb-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || t('profilePage.dashboard.defaultUser', { defaultValue: 'User' })}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-lime text-white flex items-center justify-center text-4xl font-bold">
                        {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-text-primary mb-1">
                    {user.name || t('profilePage.dashboard.defaultUser', { defaultValue: 'User' })}
                  </h2>
                  <p className="text-sm text-text-secondary mb-2">{user.email}</p>
                  <p className="text-xs text-text-secondary">{t('profilePage.memberSince', { year: '2023', defaultValue: 'Member since {{year}}' })}</p>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 rounded-button transition-all text-left',
                          activeTab === item.id
                            ? 'bg-primary-lime text-white font-semibold'
                            : 'text-text-primary hover:bg-gray-100'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}

                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-button transition-all text-left text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t('profilePage.logout', { defaultValue: 'Logout' })}</span>
                  </button>
                </nav>
              </Card>
            </div>

            {/* Main Content Area (75%) */}
            <div className="flex-1">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

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
              <h3 className="text-xl font-bold">{t('profilePage.deleteModal.title', { defaultValue: 'Delete Account' })}</h3>
            </div>
            <p className="text-gray-600 mb-4">
              {t('profilePage.deleteModal.description', { defaultValue: 'This will permanently delete your account and all associated data including:' })}
            </p>
            <ul className="text-gray-600 mb-4 list-disc list-inside space-y-1">
              <li>{t('profilePage.deleteModal.items.profile', { defaultValue: 'Your profile information' })}</li>
              <li>{t('profilePage.deleteModal.items.orders', { defaultValue: 'Order history' })}</li>
              <li>{t('profilePage.deleteModal.items.addresses', { defaultValue: 'Saved addresses and payment methods' })}</li>
              <li>{t('profilePage.deleteModal.items.wishlist', { defaultValue: 'Wishlist items' })}</li>
            </ul>
            <p className="text-gray-700 font-medium mb-2">
              {t('profilePage.deleteModal.confirmPrompt', { defaultValue: 'Type' })} <span className="text-red-500 font-bold">DELETE</span> {t('profilePage.deleteModal.toConfirm', { defaultValue: 'to confirm:' })}
            </p>
            <Input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={t('profilePage.deleteModal.placeholder', { defaultValue: 'Type DELETE' })}
              className="mb-4"
            />
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
              >
                {t('profilePage.common.cancel', { defaultValue: 'Cancel' })}
              </Button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t('profilePage.deleteModal.confirmButton', { defaultValue: 'Delete Account' })
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

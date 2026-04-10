import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Truck,
  Package,
  MapPin,
  Clock,
  DollarSign,
  Globe,
  X,
  Check,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Info,
  Users,
  Phone,
  UserPlus,
  Circle,
  ChevronDown
} from 'lucide-react';
import { GlassCard, StatCard } from '../components/GlassCard';
import { toast } from 'sonner';
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { AlertDialog } from '../../../components/ui/AlertDialog';
import { api } from '@/lib/api';
import { extractRouteContext } from '../../../lib/navigation-utils';
import { useShopStore } from '@/stores/useShopStore';

interface DeliveryMethod {
  id: string;
  type: string;
  name: string;
  baseCost: number;
  rate?: number; // Alias for baseCost for UI compatibility
  estimatedDays: number | string;
  description: string;
  isActive?: boolean;
  carrier?: string;
  trackingEnabled?: boolean;
  zones?: string[];
}

interface DeliveryZoneItem {
  id: string;
  shopId?: string;
  name: string;
  description?: string;
  type: 'polygon' | 'circle' | 'city' | 'postal_code';
  radius?: number;
  city?: string;
  state?: string;
  country?: string;
  isActive: boolean;
}

interface Shipment {
  id: string;
  orderId: string;
  customer: string;
  method: string;
  carrier: string;
  trackingNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippedDate: string;
  estimatedDelivery: string;
}

export const DeliveryPage: React.FC = () => {
  const { t } = useTranslation();
  const dialog = useDialog();
  const params = useParams();
  const { shopId } = extractRouteContext(params);
  const { currentShop } = useShopStore();
  const effectiveShopId = shopId || currentShop?.id;

  const [activeTab, setActiveTab] = useState<'methods' | 'zones' | 'tracking' | 'deliverymen'>('methods');
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<DeliveryMethod | null>(null);
  const [editingZone, setEditingZone] = useState<DeliveryZoneItem | null>(null);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  // Data states
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [vendorDeliveryZones, setVendorDeliveryZones] = useState<DeliveryZoneItem[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<{ id: string; name: string; description?: string }[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Order search dropdown state
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);

  // Stats state (fetched from API)
  const [stats, setStats] = useState({
    activeMethodsCount: 0,
    shippedToday: 0,
    inTransit: 0,
    avgDeliveryTime: '0',
    shippedTodayChange: 0,
    avgDeliveryTimeChange: 0,
  });

  // Fetch delivery methods from API
  const fetchDeliveryMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getDeliveryMethods();
      // Map API response to our interface - use actual data from API
      const methods = (response || []).map((method: any) => ({
        id: method.id || method.type,
        type: method.type,
        name: method.name,
        baseCost: method.baseCost || 0,
        rate: method.baseCost || 0,
        estimatedDays: method.estimatedDays || '3-5',
        description: method.description || '',
        isActive: method.isActive !== undefined ? method.isActive : true,
        carrier: method.carrier || '',
        trackingEnabled: method.trackingEnabled !== undefined ? method.trackingEnabled : true,
        zones: method.zones || ['domestic']
      }));
      setDeliveryMethods(methods);

      // Calculate stats from delivery methods
      const activeCount = methods.filter((m: DeliveryMethod) => m.isActive).length;

      // Calculate average delivery time from methods
      const avgDays = methods.length > 0
        ? methods.reduce((sum: number, m: DeliveryMethod) => {
            const days = typeof m.estimatedDays === 'string'
              ? parseInt(m.estimatedDays.split('-')[0]) || 0
              : m.estimatedDays;
            return sum + days;
          }, 0) / methods.length
        : 0;

      setStats(prev => ({
        ...prev,
        activeMethodsCount: activeCount,
        avgDeliveryTime: avgDays.toFixed(1),
      }));
    } catch (err: any) {
      console.error('Failed to fetch delivery methods:', err);
      setError('Failed to load delivery methods');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch shipment stats from API
  const fetchShipmentStats = useCallback(async () => {
    try {
      // Try to fetch shipment statistics if endpoint exists
      const statsResponse = await api.getShopStatistics();
      if (statsResponse) {
        setStats(prev => ({
          ...prev,
          shippedToday: statsResponse.ordersToday || statsResponse.shippedToday || 0,
          inTransit: statsResponse.pendingOrders || statsResponse.inTransit || 0,
          shippedTodayChange: statsResponse.ordersChange || 0,
          avgDeliveryTimeChange: statsResponse.deliveryTimeChange || 0,
        }));
      }
    } catch (err) {
      // Stats endpoint may not exist, use calculated values
    }
  }, []);

  // Fetch vendor's delivery zones from API
  const fetchVendorDeliveryZones = useCallback(async () => {
    if (!effectiveShopId) return;
    try {
      const response = await api.get(`/zones?shopId=${effectiveShopId}&includeInactive=true`);
      const zonesData = response.data?.data || response.data || [];
      const zones = (Array.isArray(zonesData) ? zonesData : []).map((zone: any) => ({
        id: zone.id,
        shopId: zone.shopId,
        name: zone.name,
        description: zone.description || '',
        type: zone.type || 'city',
        radius: zone.radius || 0,
        city: zone.city || '',
        state: zone.state || '',
        country: zone.country || '',
        isActive: zone.isActive !== false
      }));
      setVendorDeliveryZones(zones);
    } catch (err) {
      // Could not fetch vendor delivery zones
    }
  }, [effectiveShopId]);

  // Fetch delivery zones for delivery men assignment (vendor's zones)
  const fetchDeliveryZones = useCallback(async () => {
    if (!effectiveShopId) return;
    try {
      const response = await api.get(`/zones?shopId=${effectiveShopId}`);
      const zonesData = response.data?.data || response.data || [];
      const zones = (Array.isArray(zonesData) ? zonesData : []).map((zone: any) => ({
        id: zone.id,
        name: zone.name,
        description: zone.description || ''
      }));
      setDeliveryZones(zones);
    } catch (err) {
      // Could not fetch delivery zones
    }
  }, [effectiveShopId]);

  // Fetch shipments from API
  const fetchShipments = useCallback(async () => {
    try {
      const response = await api.getVendorShipments({});
      const shipmentsData = (response || []).map((shipment: any) => ({
        id: shipment.id,
        orderId: shipment.orderId,
        customer: shipment.customer || shipment.customerName || '',
        method: shipment.method || shipment.deliveryMethod || '',
        carrier: shipment.carrier || '',
        trackingNumber: shipment.trackingNumber || '',
        status: shipment.status,
        shippedDate: shipment.shippedDate || shipment.createdAt || '',
        estimatedDelivery: shipment.estimatedDelivery || shipment.estimatedDeliveryDate || ''
      }));
      setShipments(shipmentsData);
    } catch (err) {
      // Could not fetch shipments
    }
  }, []);

  // Fetch orders available for tracking (pending/processing orders without tracking)
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const fetchAvailableOrders = useCallback(async () => {
    try {
      // Use getVendorOrders which respects x-shop-id header
      const response = await api.getVendorOrders({ limit: 50 });
      const orders = Array.isArray(response) ? response : (response?.data || []);
      // Filter to show orders that can be tracked (not yet delivered/cancelled)
      const trackableOrders = orders.filter((o: any) => {
        const status = (o.status || '').toLowerCase();
        return ['pending', 'processing', 'confirmed', 'shipped'].includes(status);
      });
      setAvailableOrders(trackableOrders);
    } catch (err) {
      // Could not fetch available orders
    }
  }, []);

  // Filter orders based on search query
  const filteredOrders = React.useMemo(() => {
    if (!orderSearchQuery.trim()) {
      return availableOrders.slice(0, 20); // Show first 20 if no search
    }
    const query = orderSearchQuery.toLowerCase();
    return availableOrders.filter((order: any) => {
      const orderNumber = (order.orderNumber || order.order_number || order.id || '').toLowerCase();
      const customerName = (order.customer?.name || order.shippingAddress?.name || '').toLowerCase();
      return orderNumber.includes(query) || customerName.includes(query);
    }).slice(0, 20); // Limit to 20 results
  }, [availableOrders, orderSearchQuery]);

  useEffect(() => {
    fetchDeliveryMethods();
    fetchShipmentStats();
    fetchVendorDeliveryZones();
    fetchDeliveryZones();
    fetchShipments();
    fetchAvailableOrders();
  }, [fetchDeliveryMethods, fetchShipmentStats, fetchVendorDeliveryZones, fetchDeliveryZones, fetchShipments, fetchAvailableOrders]);

  // Close order dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.order-search-dropdown')) {
        setShowOrderDropdown(false);
      }
    };
    if (showOrderDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOrderDropdown]);

  const [methodFormData, setMethodFormData] = useState({
    name: '',
    type: 'standard',
    rate: 0,
    estimatedDays: '',
    carrier: '',
    trackingEnabled: false
  });

  const [zoneFormData, setZoneFormData] = useState({
    name: '',
    description: '',
    type: 'city' as 'polygon' | 'circle' | 'city' | 'postal_code',
    radius: 10,
    city: '',
    state: '',
    country: '',
    isActive: true
  });

  const [trackingFormData, setTrackingFormData] = useState({
    orderId: '',
    customer: '',
    customerPhone: '',
    customerAddress: '',
    zone: '',
    method: '',
    carrier: '',
    deliveryManId: '',
    deliveryManName: '',
    deliveryFee: '5.00', // Default delivery fee
    trackingNumber: '',
    status: 'pending' as Shipment['status'],
    estimatedDelivery: ''
  });

  // Country codes for phone dropdown
  const countryCodes = [
    { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
    { code: '+1', country: 'CA', flag: '🇨🇦', name: 'Canada' },
    { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+880', country: 'BD', flag: '🇧🇩', name: 'Bangladesh' },
    { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
    { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
    { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
    { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
    { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
    { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
    { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy' },
    { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain' },
    { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
    { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
    { code: '+52', country: 'MX', flag: '🇲🇽', name: 'Mexico' },
    { code: '+7', country: 'RU', flag: '🇷🇺', name: 'Russia' },
    { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' },
    { code: '+966', country: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
    { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
    { code: '+60', country: 'MY', flag: '🇲🇾', name: 'Malaysia' },
    { code: '+62', country: 'ID', flag: '🇮🇩', name: 'Indonesia' },
    { code: '+63', country: 'PH', flag: '🇵🇭', name: 'Philippines' },
    { code: '+66', country: 'TH', flag: '🇹🇭', name: 'Thailand' },
    { code: '+84', country: 'VN', flag: '🇻🇳', name: 'Vietnam' },
    { code: '+92', country: 'PK', flag: '🇵🇰', name: 'Pakistan' },
    { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa' },
    { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria' },
    { code: '+20', country: 'EG', flag: '🇪🇬', name: 'Egypt' },
    { code: '+90', country: 'TR', flag: '🇹🇷', name: 'Turkey' },
    { code: '+48', country: 'PL', flag: '🇵🇱', name: 'Poland' },
    { code: '+31', country: 'NL', flag: '🇳🇱', name: 'Netherlands' },
    { code: '+46', country: 'SE', flag: '🇸🇪', name: 'Sweden' },
    { code: '+47', country: 'NO', flag: '🇳🇴', name: 'Norway' },
    { code: '+45', country: 'DK', flag: '🇩🇰', name: 'Denmark' },
    { code: '+358', country: 'FI', flag: '🇫🇮', name: 'Finland' },
    { code: '+41', country: 'CH', flag: '🇨🇭', name: 'Switzerland' },
    { code: '+43', country: 'AT', flag: '🇦🇹', name: 'Austria' },
    { code: '+32', country: 'BE', flag: '🇧🇪', name: 'Belgium' },
    { code: '+351', country: 'PT', flag: '🇵🇹', name: 'Portugal' },
    { code: '+30', country: 'GR', flag: '🇬🇷', name: 'Greece' },
    { code: '+353', country: 'IE', flag: '🇮🇪', name: 'Ireland' },
    { code: '+64', country: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
    { code: '+972', country: 'IL', flag: '🇮🇱', name: 'Israel' },
    { code: '+98', country: 'IR', flag: '🇮🇷', name: 'Iran' },
    { code: '+54', country: 'AR', flag: '🇦🇷', name: 'Argentina' },
    { code: '+56', country: 'CL', flag: '🇨🇱', name: 'Chile' },
    { code: '+57', country: 'CO', flag: '🇨🇴', name: 'Colombia' },
    { code: '+51', country: 'PE', flag: '🇵🇪', name: 'Peru' },
  ];


  // Generate tracking number for Own Delivery Man
  const generateTrackingNumber = () => {
    const prefix = 'ODM';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  // Delivery men state
  const [deliveryMen, setDeliveryMen] = useState<Array<{ id: string; name: string; phone: string; countryCode: string; status?: string; zoneId?: string; zoneName?: string; }>>([]);
  const [deliveryManSearch, setDeliveryManSearch] = useState('');
  const [showDeliveryManDropdown, setShowDeliveryManDropdown] = useState(false);
  const [showAddDeliveryMan, setShowAddDeliveryMan] = useState(false);
  const [newDeliveryMan, setNewDeliveryMan] = useState({ name: '', email: '', phone: '', countryCode: '+880', zoneId: '', password: '' });
  const [isAddingDeliveryMan, setIsAddingDeliveryMan] = useState(false);
  const [createdDeliveryManId, setCreatedDeliveryManId] = useState<string | null>(null);
  const [editingDeliveryManZone, setEditingDeliveryManZone] = useState<{ id: string; name: string; currentZoneId?: string } | null>(null);
  const [selectedZoneForEdit, setSelectedZoneForEdit] = useState('');

  // Fetch delivery men from API
  const fetchDeliveryMen = useCallback(async () => {
    try {
      // Fetch all delivery men (active and pending) so vendors can assign them
      const response = await api.getDeliveryMen({ limit: 100 });
      const data = response?.data || response || [];
      const men = (Array.isArray(data) ? data : []).map((dm: any) => {
        // Find zone name from deliveryZones
        const zone = deliveryZones.find(z => z.id === (dm.zoneId || dm.zone_id));
        return {
          id: dm.id,
          name: dm.name || (dm.first_name && dm.last_name ? `${dm.first_name} ${dm.last_name}` : dm.firstName && dm.lastName ? `${dm.firstName} ${dm.lastName}` : 'Unknown'),
          phone: dm.phone || '',
          countryCode: dm.countryCode || '+880',
          status: dm.status,
          zoneId: dm.zoneId || dm.zone_id,
          zoneName: zone?.name || undefined
        };
      }).filter((dm: any) => dm.status === 'active' || dm.status === 'pending'); // Show active and pending
      setDeliveryMen(men);
    } catch (err) {
      // Fallback to localStorage
      const saved = localStorage.getItem('shop-delivery-men');
      if (saved) {
        try {
          setDeliveryMen(JSON.parse(saved));
        } catch {
          setDeliveryMen([]);
        }
      }
    }
  }, [deliveryZones]);

  useEffect(() => {
    fetchDeliveryMen();
    fetchAvailableOrders();
  }, [fetchDeliveryMen, fetchAvailableOrders]);

  // Save delivery men to localStorage
  const saveDeliveryMen = (men: typeof deliveryMen) => {
    localStorage.setItem('shop-delivery-men', JSON.stringify(men));
    setDeliveryMen(men);
  };

  // Add new delivery man
  const handleAddDeliveryMan = async () => {
    if (!newDeliveryMan.name.trim() || !newDeliveryMan.phone.trim()) {
      toast.error(t('vendor.delivery.pleaseEnterNamePhone'));
      return;
    }
    if (!newDeliveryMan.email.trim()) {
      toast.error(t('vendor.delivery.pleaseEnterEmail'));
      return;
    }
    if (!newDeliveryMan.password || newDeliveryMan.password.length < 6) {
      toast.error(t('vendor.delivery.pleaseEnterPassword'));
      return;
    }

    setIsAddingDeliveryMan(true);
    try {
      // Call backend API to register delivery man with user account
      const result = await api.registerDeliveryMan({
        name: newDeliveryMan.name.trim(),
        email: newDeliveryMan.email.trim(),
        phone: `${newDeliveryMan.countryCode}${newDeliveryMan.phone.trim()}`,
        password: newDeliveryMan.password,
        zoneId: newDeliveryMan.zoneId || undefined,
        type: 'freelancer',
      });

      const createdId = result?.data?.id || result?.id;

      if (createdId) {
        setCreatedDeliveryManId(createdId);
        // Update tracking form with new delivery man
        setTrackingFormData({
          ...trackingFormData,
          deliveryManId: createdId,
          deliveryManName: newDeliveryMan.name.trim()
        });
        toast.success(t('vendor.delivery.deliveryManRegistered'));
        // Refresh delivery men list
        fetchDeliveryMen();
      } else {
        toast.success(t('vendor.delivery.deliveryManAdded'));
        setShowAddDeliveryMan(false);
      }

      setNewDeliveryMan({ name: '', email: '', phone: '', countryCode: '+880', zoneId: '', password: '' });
    } catch (error: any) {
      console.error('Failed to register delivery man:', error);
      toast.error(error?.response?.data?.message || t('vendor.delivery.failedToRegister'));
    } finally {
      setIsAddingDeliveryMan(false);
    }
  };

  // Filter delivery men based on search
  const filteredDeliveryMen = deliveryMen.filter(dm =>
    dm.name.toLowerCase().includes(deliveryManSearch.toLowerCase()) ||
    dm.phone.includes(deliveryManSearch)
  );

  // UI constants for dropdown options - standard carrier names + own delivery
  const carriers = ['Own Delivery Man', 'USPS', 'FedEx', 'UPS', 'DHL', 'Pathao', 'Steadfast', 'RedX', 'Paperfly'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-400 bg-green-400/20';
      case 'shipped':
        return 'text-blue-400 bg-blue-400/20';
      case 'processing':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'pending':
        return 'text-orange-400 bg-orange-400/20';
      case 'cancelled':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleEditMethod = (method: DeliveryMethod) => {
    setEditingMethod(method);
    setMethodFormData({
      name: method.name,
      type: method.type,
      rate: method.rate || method.baseCost || 0,
      estimatedDays: String(method.estimatedDays),
      carrier: method.carrier || '',
      trackingEnabled: method.trackingEnabled || false
    });
    setShowMethodModal(true);
  };

  const handleDeleteMethod = async (method: DeliveryMethod) => {
    const confirmed = await dialog.showConfirm({
      title: t('vendor.delivery.deleteMethod'),
      message: t('vendor.delivery.confirmDeleteMethod'),
      confirmText: t('vendor.delivery.delete'),
      cancelText: t('vendor.delivery.cancel'),
      variant: 'danger'
    });

    if (confirmed) {
      try {
        await api.deleteDeliveryMethod(method.id);
        toast.success(t('vendor.delivery.deliveryMethodDeleted'));
        // Refresh the list
        fetchDeliveryMethods();
      } catch (error: any) {
        console.error('Failed to delete delivery method:', error);
        toast.error(t('vendor.delivery.failedToDeleteMethod'), {
          description: error?.response?.data?.message || t('common.tryAgain')
        });
      }
    }
  };

  const handleToggleMethod = async (method: DeliveryMethod) => {
    const newStatus = !method.isActive;
    try {
      await api.toggleDeliveryMethod(method.id);
      setDeliveryMethods(deliveryMethods.map(m =>
        m.id === method.id ? { ...m, isActive: newStatus } : m
      ));
      toast.success(`Delivery method ${newStatus ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      console.error('Failed to toggle delivery method:', error);
      toast.error('Failed to update delivery method status');
    }
  };

  const handleSubmitMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMethod) {
        // Update existing method
        await api.updateDeliveryMethod(editingMethod.id, {
          name: methodFormData.name,
          type: methodFormData.type,
          baseCost: methodFormData.rate,
          estimatedDays: methodFormData.estimatedDays,
          carrier: methodFormData.carrier,
          trackingEnabled: methodFormData.trackingEnabled
        });
        toast.success(t('vendor.delivery.deliveryMethodUpdated'));
      } else {
        // Create new method
        await api.createDeliveryMethod({
          name: methodFormData.name,
          type: methodFormData.type,
          baseCost: methodFormData.rate,
          estimatedDays: methodFormData.estimatedDays,
          carrier: methodFormData.carrier,
          trackingEnabled: methodFormData.trackingEnabled
        });
        toast.success(t('vendor.delivery.deliveryMethodCreated'));
      }
      setShowMethodModal(false);
      resetMethodForm();
      // Refresh the list
      fetchDeliveryMethods();
    } catch (error: any) {
      console.error('Failed to save delivery method:', error);
      toast.error(t('vendor.delivery.failedToSaveMethod'), {
        description: error?.response?.data?.message || t('common.tryAgain')
      });
    }
  };

  const resetMethodForm = () => {
    setMethodFormData({
      name: '',
      type: 'standard',
      rate: 0,
      estimatedDays: '',
      carrier: '',
      trackingEnabled: false
    });
    setEditingMethod(null);
  };

  const handleSubmitZone = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!zoneFormData.name.trim()) {
      toast.error(t('vendor.delivery.zoneNameRequired'));
      return;
    }

    if (!effectiveShopId) {
      toast.error(t('vendor.delivery.shopNotFound'));
      return;
    }

    try {
      const payload: any = {
        shopId: effectiveShopId,
        name: zoneFormData.name,
        description: zoneFormData.description || undefined,
        type: zoneFormData.type,
        isActive: zoneFormData.isActive
      };

      // Add type-specific fields
      if (zoneFormData.type === 'circle') {
        payload.radius = zoneFormData.radius;
      }
      if (zoneFormData.city) payload.city = zoneFormData.city;
      if (zoneFormData.state) payload.state = zoneFormData.state;
      if (zoneFormData.country) payload.country = zoneFormData.country;

      if (editingZone) {
        await api.put(`/zones/${editingZone.id}`, payload);
        toast.success(t('vendor.delivery.deliveryZoneUpdated'));
      } else {
        await api.post('/zones', payload);
        toast.success(t('vendor.delivery.deliveryZoneCreated'));
      }
      setShowZoneModal(false);
      resetZoneForm();
      // Refresh the lists
      fetchVendorDeliveryZones();
      fetchDeliveryZones();
    } catch (error: any) {
      console.error('Failed to save delivery zone:', error);
      const status = error?.response?.status;
      if (status === 401) {
        toast.error(t('vendor.delivery.sessionExpired'), {
          description: t('vendor.delivery.pleaseLogInAgain')
        });
      } else {
        toast.error(t('vendor.delivery.failedToSaveZone'), {
          description: error?.response?.data?.message || t('common.tryAgain')
        });
      }
    }
  };

  const resetZoneForm = () => {
    setZoneFormData({
      name: '',
      description: '',
      type: 'city',
      radius: 10,
      city: '',
      state: '',
      country: '',
      isActive: true
    });
    setEditingZone(null);
  };

  const handleSubmitTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShipment) {
        // Update existing shipment
        await api.updateShipment(editingShipment.id, {
          orderId: trackingFormData.orderId,
          customer: trackingFormData.customer,
          method: trackingFormData.method,
          carrier: trackingFormData.carrier,
          trackingNumber: trackingFormData.trackingNumber,
          status: trackingFormData.status,
          estimatedDelivery: trackingFormData.estimatedDelivery
        });
        toast.success(t('vendor.delivery.shipmentTrackingUpdated'));
      } else {
        // Create new shipment tracking
        await api.createShipment({
          orderId: trackingFormData.orderId,
          customer: trackingFormData.customer,
          method: trackingFormData.method,
          carrier: trackingFormData.carrier,
          deliveryManName: trackingFormData.deliveryManName,
          trackingNumber: trackingFormData.trackingNumber,
          status: trackingFormData.status,
          estimatedDelivery: trackingFormData.estimatedDelivery
        });

        // If using Own Delivery Man, also create delivery assignment
        // Check method instead of carrier since carrier might be set to delivery man's name
        if (trackingFormData.method === 'own_delivery_man' && trackingFormData.deliveryManId) {
          try {
            const deliveryFee = parseFloat(trackingFormData.deliveryFee) || 5.00;
            await api.assignOrderToDeliveryMan(
              trackingFormData.orderId,
              trackingFormData.deliveryManId,
              `Tracking: ${trackingFormData.trackingNumber}`,
              deliveryFee
            );
            toast.success(t('vendor.delivery.orderAssigned') + ` ${t('vendor.delivery.deliveryFee')}: $${deliveryFee.toFixed(2)}`);
          } catch (assignError: any) {
            console.error('Failed to assign order to delivery man:', assignError);
            toast.warning(t('vendor.delivery.failedToAssign'), {
              description: assignError?.response?.data?.message || t('vendor.delivery.pleaseAssignManually')
            });
          }
        }

        toast.success(t('vendor.delivery.shipmentTrackingCreated'));
      }
      setShowTrackingModal(false);
      resetTrackingForm();
      fetchShipments();
    } catch (error: any) {
      console.error('Failed to save shipment tracking:', error);
      toast.error(t('vendor.delivery.failedToSaveTracking'), {
        description: error?.response?.data?.message || t('common.tryAgain')
      });
    }
  };

  const resetTrackingForm = () => {
    setTrackingFormData({
      orderId: '',
      customer: '',
      customerPhone: '',
      customerAddress: '',
      zone: '',
      method: '',
      carrier: '',
      deliveryManId: '',
      deliveryManName: '',
      deliveryFee: '5.00',
      trackingNumber: '',
      status: 'pending',
      estimatedDelivery: ''
    });
    setEditingShipment(null);
    setOrderSearchQuery('');
    setShowOrderDropdown(false);
    setDeliveryManSearch('');
    setShowDeliveryManDropdown(false);
    setShowAddDeliveryMan(false);
  };

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
            {t('vendor.delivery.title')}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('vendor.delivery.subtitle')}
          </p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'methods') {
              resetMethodForm();
              setShowMethodModal(true);
            } else if (activeTab === 'zones') {
              resetZoneForm();
              setShowZoneModal(true);
            } else if (activeTab === 'tracking') {
              resetTrackingForm();
              setShowTrackingModal(true);
            }
          }}
          className="px-6 py-2 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-all shadow-lg flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>
            {activeTab === 'methods' ? t('vendor.delivery.addMethod', { defaultValue: 'Add Method' }) : activeTab === 'zones' ? t('vendor.delivery.addZone', { defaultValue: 'Add Zone' }) : t('vendor.delivery.addTracking', { defaultValue: 'Track Shipment' })}
          </span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title={t('vendor.delivery.activeMethods', { defaultValue: 'Active Methods' })}
          value={String(stats.activeMethodsCount)}
          icon={<Truck />}
          color="from-blue-400 to-cyan-500"
        />
        <StatCard
          title={t('vendor.delivery.shippedToday', { defaultValue: 'Shipped Today' })}
          value={String(stats.shippedToday)}
          change={stats.shippedTodayChange}
          icon={<Package />}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title={t('vendor.delivery.inTransit', { defaultValue: 'In Transit' })}
          value={String(stats.inTransit)}
          icon={<Clock />}
          color="from-purple-400 to-pink-500"
        />
        <StatCard
          title={t('vendor.delivery.avgDeliveryTime', { defaultValue: 'Avg Delivery Time' })}
          value={`${stats.avgDeliveryTime} ${t('vendor.delivery.days', { defaultValue: 'days' })}`}
          change={stats.avgDeliveryTimeChange}
          icon={<TrendingUp />}
          color="from-orange-400 to-red-500"
        />
      </div>

      {/* Tabs */}
      <GlassCard hover={false}>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'methods', label: t('vendor.delivery.tabs.methods', { defaultValue: 'Methods' }), icon: Truck },
            { id: 'zones', label: t('vendor.delivery.tabs.zones', { defaultValue: 'Zones' }), icon: MapPin },
            { id: 'deliverymen', label: t('vendor.delivery.tabs.deliveryMen', { defaultValue: 'Delivery Men' }), icon: Users },
            { id: 'tracking', label: t('vendor.delivery.tabs.tracking', { defaultValue: 'Tracking' }), icon: Package }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                activeTab === tab.id ? 'bg-primary-lime/10 text-primary-lime border border-primary-lime/30' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Tab Content */}
      {activeTab === 'methods' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {deliveryMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard hover={true}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl ${method.isActive ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gray-500/20'} shadow-lg`}>
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{method.name}</h3>
                        <p className="text-xs text-gray-500 capitalize">{method.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={method.isActive}
                        onChange={() => handleToggleMethod(method)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-lime after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('vendor.delivery.rate', { defaultValue: 'Rate' })}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {method.rate === 0 ? t('vendor.delivery.free', { defaultValue: 'FREE' }) : `$${method.rate}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('vendor.delivery.delivery', { defaultValue: 'Delivery' })}</p>
                      <p className="text-lg font-bold text-gray-900">{method.estimatedDays} {t('vendor.delivery.days', { defaultValue: 'days' })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('vendor.delivery.carrier', { defaultValue: 'Carrier' })}</p>
                      <p className="text-lg font-bold text-gray-900">{method.carrier || t('vendor.common.na', { defaultValue: 'N/A' })}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{method.zones.length} {t('vendor.delivery.zones', { defaultValue: 'zones' })}</span>
                    </div>
                    {method.trackingEnabled && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Check className="w-4 h-4" />
                        <span>{t('vendor.delivery.trackingEnabled', { defaultValue: 'Tracking enabled' })}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEditMethod(method)}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <Edit className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">{t('vendor.delivery.edit', { defaultValue: 'Edit' })}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteMethod(method)}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span className="text-sm">{t('vendor.delivery.delete', { defaultValue: 'Delete' })}</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'zones' && (
        <div className="space-y-6">
          {vendorDeliveryZones.length === 0 ? (
            <GlassCard hover={false}>
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-lime/10 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary-lime" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('vendor.delivery.noDeliveryZones', { defaultValue: 'No Delivery Zones' })}</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {t('vendor.delivery.createZonesDescription', { defaultValue: 'Create delivery zones to define where your delivery men can deliver. Click "Add Zone" to get started.' })}
                </p>
              </div>
            </GlassCard>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendorDeliveryZones.map((zone, index) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard hover={true}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                        {zone.description && (
                          <p className="text-xs text-gray-500">{zone.description}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      zone.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {zone.type === 'city' ? 'City' : zone.type === 'circle' ? 'Radius' : zone.type}
                      </span>
                    </div>

                    {zone.city && (
                      <p className="text-sm text-gray-600">
                        {zone.city}{zone.state ? `, ${zone.state}` : ''}{zone.country ? ` - ${zone.country}` : ''}
                      </p>
                    )}

                    {zone.type === 'circle' && zone.radius && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Circle className="w-4 h-4 mr-1" />
                        <span>{zone.radius} km coverage radius</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setEditingZone(zone);
                        setZoneFormData({
                          name: zone.name,
                          description: zone.description || '',
                          type: zone.type,
                          radius: zone.radius || 10,
                          city: zone.city || '',
                          state: zone.state || '',
                          country: zone.country || '',
                          isActive: zone.isActive
                        });
                        setShowZoneModal(true);
                      }}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <Edit className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Delete zone "${zone.name}"?`)) {
                          try {
                            await api.delete(`/zones/${zone.id}`);
                            toast.success('Zone deleted');
                            fetchVendorDeliveryZones();
                            fetchDeliveryZones();
                          } catch (error: any) {
                            toast.error(error?.response?.data?.message || 'Failed to delete zone');
                          }
                        }
                      }}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
          </div>
          )}
        </div>
      )}

      {activeTab === 'tracking' && (
        <GlassCard hover={false}>
          {shipments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-lime/10 flex items-center justify-center">
                <Package className="w-8 h-8 text-primary-lime" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Shipments</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                When you ship orders, their tracking information will appear here.
                Create tracking records from the Orders page.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('vendor.delivery.tableHeaders.orderId', { defaultValue: 'Order ID' })}</th>
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('vendor.delivery.tableHeaders.customer', { defaultValue: 'Customer' })}</th>
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('vendor.delivery.tableHeaders.method', { defaultValue: 'Method' })}</th>
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('vendor.delivery.tableHeaders.carrier', { defaultValue: 'Carrier' })}</th>
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('vendor.delivery.tableHeaders.trackingNumber', { defaultValue: 'Tracking Number' })}</th>
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('vendor.delivery.tableHeaders.status', { defaultValue: 'Status' })}</th>
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('vendor.delivery.tableHeaders.estDelivery', { defaultValue: 'Est. Delivery' })}</th>
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('vendor.delivery.tableHeaders.actions', { defaultValue: 'Actions' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((shipment, index) => (
                    <motion.tr
                      key={shipment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                    >
                      <td className="p-4">
                        <span className="font-medium text-gray-900">{shipment.orderId}</span>
                      </td>
                      <td className="p-4 text-gray-600">{shipment.customer}</td>
                      <td className="p-4 text-gray-600">{shipment.method}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-600">
                          {shipment.carrier}
                        </span>
                      </td>
                      <td className="p-4">
                        <code className="text-xs text-primary-lime bg-primary-lime/10 px-2 py-1 rounded">
                          {shipment.trackingNumber}
                        </code>
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium w-fit ${getStatusColor(shipment.status)}`}>
                          {getStatusIcon(shipment.status)}
                          <span className="capitalize">{shipment.status}</span>
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {shipment.estimatedDelivery
                          ? new Date(shipment.estimatedDelivery).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : '-'}
                      </td>
                      <td className="p-4">
                        {shipment.status === 'delivered' ? (
                          <span className="px-3 py-1 bg-gray-100 text-gray-400 text-xs rounded-lg font-medium">
                            {t('vendor.delivery.delivered', { defaultValue: 'Delivered' })}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-lg font-medium">
                            {shipment.carrier || t('vendor.delivery.assigned', { defaultValue: 'Assigned' })}
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {/* Delivery Men Tab */}
      {activeTab === 'deliverymen' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('vendor.delivery.myDeliveryMen', { defaultValue: 'My Delivery Men' })}</h2>
              <p className="text-sm text-gray-500">{t('vendor.delivery.manageYourDeliveryTeam', { defaultValue: 'Manage your delivery team' })}</p>
            </div>
            <button
              onClick={() => {
                setNewDeliveryMan({ name: '', email: '', phone: '', countryCode: '+880', zoneId: '', password: '' });
                setShowAddDeliveryMan(true);
                setCreatedDeliveryManId(null);
              }}
              className="px-4 py-2 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-all shadow-lg flex items-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>{t('vendor.delivery.addDeliveryMan', { defaultValue: 'Add Delivery Man' })}</span>
            </button>
          </div>

          {/* Add Delivery Man Form */}
          {showAddDeliveryMan && (
            <GlassCard hover={false}>
              {createdDeliveryManId ? (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">{t('vendor.delivery.deliveryManCreatedSuccess', { defaultValue: 'Delivery Man Created Successfully!' })}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-200 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">{t('vendor.delivery.loginInstructions', { defaultValue: 'Login Instructions for Delivery Person:' })}</p>
                      <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                        <li>{t('vendor.delivery.loginStep1', { defaultValue: 'Go to' })} <code className="bg-gray-100 px-1 rounded">/login</code></li>
                        <li>{t('vendor.delivery.loginStep2', { defaultValue: 'Login with the email and password you provided' })}</li>
                        <li>{t('vendor.delivery.loginStep3', { defaultValue: 'They will be automatically redirected to their delivery panel' })}</li>
                      </ol>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        {t('vendor.delivery.deliveryManIdLabel', { defaultValue: 'Delivery Man ID:' })} <code className="bg-gray-100 px-1 rounded">{createdDeliveryManId}</code>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedDeliveryManId(null);
                      setShowAddDeliveryMan(false);
                    }}
                    className="w-full mt-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-all"
                  >
                    {t('vendor.delivery.close', { defaultValue: 'Close' })}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t('vendor.delivery.registerNewDeliveryMan', { defaultValue: 'Register New Delivery Man' })}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.fullName', { defaultValue: 'Full Name' })} *</label>
                      <input
                        type="text"
                        value={newDeliveryMan.name}
                        onChange={(e) => setNewDeliveryMan({ ...newDeliveryMan, name: e.target.value })}
                        placeholder={t('vendor.delivery.enterFullName', { defaultValue: 'Enter full name' })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.email', { defaultValue: 'Email' })} *</label>
                      <input
                        type="email"
                        value={newDeliveryMan.email}
                        onChange={(e) => setNewDeliveryMan({ ...newDeliveryMan, email: e.target.value })}
                        placeholder={t('vendor.delivery.enterEmailAddress', { defaultValue: 'Enter email address' })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.phone', { defaultValue: 'Phone' })} *</label>
                      <div className="flex gap-2">
                        <select
                          value={newDeliveryMan.countryCode}
                          onChange={(e) => setNewDeliveryMan({ ...newDeliveryMan, countryCode: e.target.value })}
                          className="w-36 px-2 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                        >
                          {countryCodes.map((cc) => (
                            <option key={`${cc.country}-${cc.code}`} value={cc.code}>
                              {cc.flag} {cc.code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          value={newDeliveryMan.phone}
                          onChange={(e) => setNewDeliveryMan({ ...newDeliveryMan, phone: e.target.value })}
                          placeholder={t('vendor.delivery.enterPhoneNumber', { defaultValue: 'Enter phone number' })}
                          className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.deliveryZoneOptional', { defaultValue: 'Delivery Zone (Optional)' })}</label>
                      <select
                        value={newDeliveryMan.zoneId}
                        onChange={(e) => setNewDeliveryMan({ ...newDeliveryMan, zoneId: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                      >
                        <option value="">{t('vendor.delivery.selectDeliveryZoneOpt', { defaultValue: 'Select delivery zone' })}</option>
                        {deliveryZones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name}
                          </option>
                        ))}
                      </select>
                      {deliveryZones.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {t('vendor.delivery.noZonesAvailable', { defaultValue: 'No delivery zones available. Admin needs to create zones first.' })}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.password', { defaultValue: 'Password' })} *</label>
                      <input
                        type="password"
                        value={newDeliveryMan.password}
                        onChange={(e) => setNewDeliveryMan({ ...newDeliveryMan, password: e.target.value })}
                        placeholder={t('vendor.delivery.createPassword', { defaultValue: 'Create a password (min 6 chars)' })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddDeliveryMan(false);
                        setNewDeliveryMan({ name: '', email: '', phone: '', countryCode: '+880', zoneId: '', password: '' });
                      }}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                      disabled={isAddingDeliveryMan}
                    >
                      {t('vendor.delivery.cancel', { defaultValue: 'Cancel' })}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddDeliveryMan}
                      disabled={isAddingDeliveryMan}
                      className="flex-1 py-3 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                      {isAddingDeliveryMan ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('vendor.delivery.registering', { defaultValue: 'Registering...' })}
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          {t('vendor.delivery.registerDeliveryMan', { defaultValue: 'Register Delivery Man' })}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>
          )}

          {/* Delivery Men List */}
          {deliveryMen.length === 0 ? (
            <GlassCard hover={false}>
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-lime/10 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary-lime" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('vendor.delivery.noDeliveryMenYet', { defaultValue: 'No Delivery Men Yet' })}</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-4">
                  {t('vendor.delivery.addDeliveryMenDesc', { defaultValue: 'Add delivery men to your team to assign orders for delivery.' })}
                </p>
                <button
                  onClick={() => setShowAddDeliveryMan(true)}
                  className="px-6 py-2 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-all"
                >
                  {t('vendor.delivery.addFirstDeliveryMan', { defaultValue: 'Add Your First Delivery Man' })}
                </button>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveryMen.map((dm, index) => (
                <motion.div
                  key={dm.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard hover={true}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-lime to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                            {dm.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{dm.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              dm.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {t(`vendor.delivery.statuses.${dm.status || 'pending'}`, { defaultValue: dm.status || 'pending' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{dm.countryCode} {dm.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className={dm.zoneName ? 'text-green-600 font-medium' : 'text-gray-400'}>
                            {dm.zoneName || t('vendor.delivery.noZoneAssigned', { defaultValue: 'No zone assigned' })}
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          ID: {dm.id.slice(0, 12)}...
                        </code>
                        <button
                          onClick={() => {
                            setEditingDeliveryManZone({ id: dm.id, name: dm.name, currentZoneId: dm.zoneId });
                            setSelectedZoneForEdit(dm.zoneId || '');
                          }}
                          className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          {t('vendor.delivery.editZone', { defaultValue: 'Edit Zone' })}
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delivery Method Modal */}
      <AnimatePresence>
        {showMethodModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowMethodModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <GlassCard hover={false}>
                <form onSubmit={handleSubmitMethod} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingMethod ? t('vendor.delivery.editMethod', { defaultValue: 'Edit Delivery Method' }) : t('vendor.delivery.addMethod', { defaultValue: 'Add Delivery Method' })}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowMethodModal(false)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.methodName', { defaultValue: 'Method Name' })} *</label>
                      <input
                        type="text"
                        value={methodFormData.name}
                        onChange={(e) => setMethodFormData({ ...methodFormData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                        placeholder={t('vendor.delivery.standardShipping', { defaultValue: 'Standard Shipping' })}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.type', { defaultValue: 'Type' })} *</label>
                      <select
                        value={methodFormData.type}
                        onChange={(e) => setMethodFormData({ ...methodFormData, type: e.target.value as DeliveryMethod['type'] })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                      >
                        <option value="own_delivery">{t('vendor.delivery.methodTypes.ownDelivery', { defaultValue: 'Own Delivery Man' })}</option>
                        <option value="flat_rate">{t('vendor.delivery.methodTypes.flatRate', { defaultValue: 'Flat Rate' })}</option>
                        <option value="free">{t('vendor.delivery.methodTypes.freeShipping', { defaultValue: 'Free Shipping' })}</option>
                        <option value="local_pickup">{t('vendor.delivery.methodTypes.localPickup', { defaultValue: 'Local Pickup' })}</option>
                        <option value="express">{t('vendor.delivery.methodTypes.express', { defaultValue: 'Express' })}</option>
                        <option value="same_day">{t('vendor.delivery.methodTypes.sameDay', { defaultValue: 'Same Day Delivery' })}</option>
                        <option value="next_day">{t('vendor.delivery.methodTypes.nextDay', { defaultValue: 'Next Day Delivery' })}</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.rateLabel', { defaultValue: 'Rate ($)' })}</label>
                        <input
                          type="number"
                          value={methodFormData.rate}
                          onChange={(e) => setMethodFormData({ ...methodFormData, rate: Number(e.target.value) })}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                          placeholder="9.99"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.estDeliveryDays', { defaultValue: 'Est. Delivery (days)' })}</label>
                        <input
                          type="text"
                          value={methodFormData.estimatedDays}
                          onChange={(e) => setMethodFormData({ ...methodFormData, estimatedDays: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                          placeholder="5-7"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.carrier', { defaultValue: 'Carrier' })}</label>
                      <select
                        value={methodFormData.carrier}
                        onChange={(e) => setMethodFormData({ ...methodFormData, carrier: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                      >
                        <option value="">{t('vendor.delivery.selectCarrier', { defaultValue: 'Select carrier' })}</option>
                        {carriers.map((carrier) => (
                          <option key={carrier} value={carrier}>{carrier}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="trackingEnabled"
                        checked={methodFormData.trackingEnabled}
                        onChange={(e) => setMethodFormData({ ...methodFormData, trackingEnabled: e.target.checked })}
                        className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-300 cursor-pointer"
                      />
                      <label htmlFor="trackingEnabled" className="text-gray-900 cursor-pointer">
                        {t('vendor.delivery.enableTracking', { defaultValue: 'Enable tracking' })}
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowMethodModal(false)}
                      className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
                    >
                      {t('vendor.delivery.cancel', { defaultValue: 'Cancel' })}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSubmitMethod(e as any)}
                      className="px-6 py-2 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-all shadow-lg"
                    >
                      {editingMethod ? t('vendor.delivery.updateMethod', { defaultValue: 'Update Method' }) : t('vendor.delivery.createMethod', { defaultValue: 'Create Method' })}
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shipping Zone Modal */}
      <AnimatePresence>
        {showZoneModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowZoneModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <GlassCard hover={false}>
                <form onSubmit={handleSubmitZone} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingZone ? t('vendor.delivery.editZone', { defaultValue: 'Edit Delivery Zone' }) : t('vendor.delivery.addZone', { defaultValue: 'Add Delivery Zone' })}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowZoneModal(false)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.zoneName', { defaultValue: 'Zone Name' })} *</label>
                      <input
                        type="text"
                        value={zoneFormData.name}
                        onChange={(e) => setZoneFormData({ ...zoneFormData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                        placeholder={t('vendor.delivery.zoneNamePlaceholder', { defaultValue: 'e.g., New York City Downtown' })}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.description', { defaultValue: 'Description' })}</label>
                      <textarea
                        value={zoneFormData.description}
                        onChange={(e) => setZoneFormData({ ...zoneFormData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 resize-none"
                        placeholder={t('vendor.delivery.zoneDescriptionPlaceholder', { defaultValue: 'Brief description of this delivery zone...' })}
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.zoneType', { defaultValue: 'Zone Type' })} *</label>
                      <select
                        value={zoneFormData.type}
                        onChange={(e) => setZoneFormData({ ...zoneFormData, type: e.target.value as any })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                      >
                        <option value="city">{t('vendor.delivery.zoneTypes.city', { defaultValue: 'City' })}</option>
                        <option value="circle">{t('vendor.delivery.zoneTypes.circle', { defaultValue: 'Circle (Radius)' })}</option>
                        <option value="postal_code">{t('vendor.delivery.zoneTypes.postalCode', { defaultValue: 'Postal Code' })}</option>
                      </select>
                    </div>

                    {zoneFormData.type === 'circle' && (
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.coverageRadius', { defaultValue: 'Coverage Radius (km)' })} *</label>
                        <input
                          type="number"
                          value={zoneFormData.radius}
                          onChange={(e) => setZoneFormData({ ...zoneFormData, radius: parseFloat(e.target.value) || 0 })}
                          min={0.1}
                          step={0.1}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                          placeholder="10"
                          required
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.city', { defaultValue: 'City' })}</label>
                        <input
                          type="text"
                          value={zoneFormData.city}
                          onChange={(e) => setZoneFormData({ ...zoneFormData, city: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                          placeholder={t('vendor.delivery.cityPlaceholder', { defaultValue: 'e.g., New York' })}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.stateProvince', { defaultValue: 'State / Province' })}</label>
                        <input
                          type="text"
                          value={zoneFormData.state}
                          onChange={(e) => setZoneFormData({ ...zoneFormData, state: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                          placeholder={t('vendor.delivery.statePlaceholder', { defaultValue: 'e.g., NY' })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.country', { defaultValue: 'Country' })}</label>
                      <input
                        type="text"
                        value={zoneFormData.country}
                        onChange={(e) => setZoneFormData({ ...zoneFormData, country: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                        placeholder={t('vendor.delivery.countryPlaceholder', { defaultValue: 'e.g., USA' })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{t('vendor.delivery.activeStatus', { defaultValue: 'Active Status' })}</p>
                        <p className="text-sm text-gray-500">{t('vendor.delivery.enableZoneForDelivery', { defaultValue: 'Enable this zone for delivery assignment' })}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setZoneFormData({ ...zoneFormData, isActive: !zoneFormData.isActive })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          zoneFormData.isActive ? 'bg-primary-lime' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                            zoneFormData.isActive ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowZoneModal(false)}
                      className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
                    >
                      {t('vendor.delivery.cancel', { defaultValue: 'Cancel' })}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-all shadow-lg"
                    >
                      {editingZone ? t('vendor.delivery.updateZone', { defaultValue: 'Update Zone' }) : t('vendor.delivery.createZone', { defaultValue: 'Create Zone' })}
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Delivery Man Zone Modal */}
      <AnimatePresence>
        {editingDeliveryManZone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditingDeliveryManZone(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md"
            >
              <GlassCard hover={false}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                      {t('vendor.delivery.editZoneAssignment', { defaultValue: 'Edit Zone Assignment' })}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setEditingDeliveryManZone(null)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      {t('vendor.delivery.assigningZoneFor', { defaultValue: 'Assigning zone for:' })} <span className="font-semibold">{editingDeliveryManZone.name}</span>
                    </p>

                    <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.selectDeliveryZone', { defaultValue: 'Select Delivery Zone' })}</label>
                    <select
                      value={selectedZoneForEdit}
                      onChange={(e) => setSelectedZoneForEdit(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                    >
                      <option value="">{t('vendor.delivery.noZone', { defaultValue: 'No zone' })}</option>
                      {deliveryZones.map((zone) => (
                        <option key={zone.id} value={zone.id}>{zone.name}</option>
                      ))}
                    </select>

                    {deliveryZones.length === 0 && (
                      <p className="text-xs text-orange-500 mt-2">
                        {t('vendor.delivery.noZonesAvailable', { defaultValue: 'No zones available. Create a zone in the "Zones" tab first.' })}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setEditingDeliveryManZone(null)}
                      className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
                    >
                      {t('vendor.delivery.cancel', { defaultValue: 'Cancel' })}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await api.put(`/delivery-man/${editingDeliveryManZone.id}`, {
                            zoneId: selectedZoneForEdit || null
                          });
                          toast.success(t('vendor.delivery.zoneAssignmentUpdated', { defaultValue: 'Zone assignment updated' }));
                          setEditingDeliveryManZone(null);
                          fetchDeliveryMen();
                        } catch (error: any) {
                          console.error('Failed to update zone:', error);
                          toast.error(error?.response?.data?.message || t('vendor.delivery.failedToUpdateZone', { defaultValue: 'Failed to update zone' }));
                        }
                      }}
                      className="px-6 py-2 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-all shadow-lg"
                    >
                      {t('vendor.common.save', { defaultValue: 'Save' })}
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Track Shipment Modal */}
      <AnimatePresence>
        {showTrackingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowTrackingModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <GlassCard hover={false}>
                <form onSubmit={handleSubmitTracking} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingShipment ? t('vendor.delivery.editTracking', { defaultValue: 'Edit Shipment Tracking' }) : t('vendor.delivery.addShipmentTracking', { defaultValue: 'Add Shipment Tracking' })}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowTrackingModal(false)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative order-search-dropdown">
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.selectOrder', { defaultValue: 'Select Order *' })}</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={orderSearchQuery}
                            onChange={(e) => {
                              setOrderSearchQuery(e.target.value);
                              setShowOrderDropdown(true);
                            }}
                            onFocus={() => setShowOrderDropdown(true)}
                            placeholder={trackingFormData.orderId ?
                              (availableOrders.find(o => o.id === trackingFormData.orderId)?.orderNumber ||
                               availableOrders.find(o => o.id === trackingFormData.orderId)?.order_number ||
                               t('vendor.delivery.orderSelected', { defaultValue: 'Order selected' })) :
                              t('vendor.delivery.searchOrders', { defaultValue: 'Search orders...' })}
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                          />
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        {showOrderDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {filteredOrders.length === 0 ? (
                              <div className="px-4 py-3 text-gray-500 text-sm">{t('vendor.delivery.noOrdersFound', { defaultValue: 'No orders found' })}</div>
                            ) : (
                              filteredOrders.map((order: any) => {
                                const customerName = order.customer?.name || order.shippingAddress?.fullName || order.shippingAddress?.name || '';
                                const customerPhone = order.customer?.phone || order.shippingAddress?.phone || order.shippingAddress?.phoneNumber || '';
                                const shippingAddr = order.shippingAddress || {};
                                const customerAddress = [
                                  shippingAddr.address || shippingAddr.street || shippingAddr.addressLine1,
                                  shippingAddr.city,
                                  shippingAddr.state,
                                  shippingAddr.postalCode || shippingAddr.zipCode
                                ].filter(Boolean).join(', ') || '';

                                return (
                                  <div
                                    key={order.id}
                                    onClick={() => {
                                      setTrackingFormData({
                                        ...trackingFormData,
                                        orderId: order.id || '',
                                        customer: customerName || '',
                                        customerPhone: customerPhone || '',
                                        customerAddress: customerAddress || ''
                                      });
                                      setOrderSearchQuery('');
                                      setShowOrderDropdown(false);
                                    }}
                                    className={`px-4 py-3 cursor-pointer hover:bg-primary-lime/10 transition-colors ${
                                      trackingFormData.orderId === order.id ? 'bg-primary-lime/20' : ''
                                    }`}
                                  >
                                    <div className="font-medium text-gray-900">
                                      {order.orderNumber || order.order_number || order.id.slice(0,8)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {customerName || 'Customer'} - ${(Number(order.total) || 0).toFixed(2)}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.customerName', { defaultValue: 'Customer Name' })}</label>
                        <input
                          type="text"
                          value={trackingFormData.customer || ''}
                          onChange={(e) => setTrackingFormData({ ...trackingFormData, customer: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                          placeholder={t('vendor.delivery.autoFilledFromOrder', { defaultValue: 'Auto-filled from order' })}
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Customer Phone and Address */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.customerPhone', { defaultValue: 'Customer Phone' })}</label>
                        <input
                          type="text"
                          value={trackingFormData.customerPhone || ''}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                          placeholder={t('vendor.delivery.autoFilledFromOrder', { defaultValue: 'Auto-filled from order' })}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.deliveryZone', { defaultValue: 'Delivery Zone *' })}</label>
                        <select
                          value={trackingFormData.zone || ''}
                          onChange={(e) => setTrackingFormData({ ...trackingFormData, zone: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                          required
                        >
                          <option value="">{t('vendor.delivery.selectZone', { defaultValue: 'Select zone' })}</option>
                          {vendorDeliveryZones.length > 0 ? (
                            vendorDeliveryZones.map((zone) => (
                              <option key={zone.id} value={zone.name}>{zone.name}</option>
                            ))
                          ) : (
                            <option value="" disabled>{t('vendor.delivery.noZonesAdded', { defaultValue: 'No zones added - Add in Zones tab' })}</option>
                          )}
                        </select>
                        {vendorDeliveryZones.length === 0 && (
                          <p className="text-xs text-orange-500 mt-1">
                            {t('vendor.delivery.pleaseAddZonesFirst', { defaultValue: 'Please add delivery zones in the "Zones" tab first' })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customer Address */}
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.deliveryAddress', { defaultValue: 'Delivery Address' })}</label>
                      <textarea
                        value={trackingFormData.customerAddress || ''}
                        onChange={(e) => setTrackingFormData({ ...trackingFormData, customerAddress: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 resize-none"
                        placeholder={t('vendor.delivery.autoFilledFromOrder', { defaultValue: 'Auto-filled from order' })}
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.deliveryMethod', { defaultValue: 'Delivery Method *' })}</label>
                      <select
                        value={trackingFormData.method || ''}
                        onChange={(e) => {
                          const selectedValue = e.target.value;
                          const isOwnDelivery = selectedValue === 'own_delivery_man';
                          const selectedMethod = deliveryMethods.find(m => m.name === selectedValue);
                          const carrier = isOwnDelivery ? 'Own Delivery Man' : (selectedMethod?.carrier || '');

                          setTrackingFormData({
                            ...trackingFormData,
                            method: selectedValue,
                            carrier: carrier,
                            deliveryManId: '',
                            deliveryManName: '',
                            trackingNumber: isOwnDelivery ? generateTrackingNumber() : ''
                          });
                        }}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                        required
                      >
                        <option value="">{t('vendor.delivery.selectMethod', { defaultValue: 'Select method' })}</option>
                        <option value="own_delivery_man">{t('vendor.delivery.ownDeliveryMan', { defaultValue: '🚴 Own Delivery Man' })}</option>
                        {deliveryMethods.filter(m => m.isActive).map((method) => (
                          <option key={method.id} value={method.name}>
                            {method.name} {method.carrier ? `(${method.carrier})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Delivery Man Selection - only show when Own Delivery Man is selected */}
                    {trackingFormData.carrier === 'Own Delivery Man' && (
                      <div className="relative">
                        <label className="text-sm text-gray-500 mb-2 block">Select Delivery Man *</label>
                        {!showAddDeliveryMan ? (
                          <>
                            <div className="relative">
                              <input
                                type="text"
                                value={deliveryManSearch}
                                onChange={(e) => {
                                  setDeliveryManSearch(e.target.value);
                                  setShowDeliveryManDropdown(true);
                                }}
                                onFocus={() => setShowDeliveryManDropdown(true)}
                                placeholder={trackingFormData.deliveryManName || "Search delivery man..."}
                                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                              />
                              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            {showDeliveryManDropdown && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                {filteredDeliveryMen.length === 0 && !deliveryManSearch ? (
                                  <div className="px-4 py-3 text-gray-500 text-sm text-center">
                                    No delivery men added yet
                                  </div>
                                ) : filteredDeliveryMen.length === 0 ? (
                                  <div className="px-4 py-3 text-gray-500 text-sm text-center">
                                    No matching delivery man found
                                  </div>
                                ) : (
                                  filteredDeliveryMen.map((dm) => {
                                    const countryFlag = countryCodes.find(c => c.code === dm.countryCode)?.flag || '📱';
                                    return (
                                      <div
                                        key={dm.id}
                                        onClick={() => {
                                          setTrackingFormData({
                                            ...trackingFormData,
                                            deliveryManId: dm.id,
                                            deliveryManName: dm.name
                                          });
                                          setDeliveryManSearch('');
                                          setShowDeliveryManDropdown(false);
                                        }}
                                        className={`px-4 py-3 cursor-pointer hover:bg-primary-lime/10 transition-colors ${
                                          trackingFormData.deliveryManId === dm.id ? 'bg-primary-lime/20' : ''
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium text-gray-900">{dm.name}</span>
                                          {dm.status && (
                                            <span className={`text-xs px-2 py-0.5 rounded ${
                                              dm.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                            }`}>
                                              {dm.status}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-sm text-gray-500">{countryFlag} {dm.countryCode} {dm.phone}</div>
                                      </div>
                                    );
                                  })
                                )}
                                <div
                                  onClick={async () => {
                                    try {
                                      toast.info('Syncing delivery men from auth users...');
                                      const result = await api.syncDeliveryMenFromAuth();
                                      toast.success(result?.message || 'Synced successfully');
                                      fetchDeliveryMen(); // Refresh the list
                                      setShowDeliveryManDropdown(false);
                                    } catch (err: any) {
                                      toast.error('Failed to sync: ' + (err?.response?.data?.message || err.message));
                                    }
                                  }}
                                  className="px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors border-t border-gray-100 flex items-center gap-2 text-blue-600"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  <span className="font-medium">Sync from Auth Users</span>
                                </div>
                                <div
                                  onClick={() => {
                                    setShowDeliveryManDropdown(false);
                                    setShowAddDeliveryMan(true);
                                  }}
                                  className="px-4 py-3 cursor-pointer hover:bg-green-50 transition-colors border-t border-gray-100 flex items-center gap-2 text-primary-lime"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span className="font-medium">Add New Delivery Man</span>
                                </div>
                              </div>
                            )}
                          </>
                        ) : createdDeliveryManId ? (
                          // Show created delivery man ID
                          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="font-medium text-green-800">Delivery Man Created Successfully!</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-green-200">
                              <p className="text-xs text-gray-500 mb-1">Delivery Man ID (Share with delivery person)</p>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 text-sm font-mono bg-gray-100 px-3 py-2 rounded text-gray-800 break-all">
                                  {createdDeliveryManId}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(createdDeliveryManId);
                                    toast.success('ID copied to clipboard!');
                                  }}
                                  className="px-3 py-2 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-lg text-xs font-medium"
                                >
                                  Copy
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                The delivery person can use this ID to access their panel at: <br />
                                <code className="bg-gray-100 px-1 rounded">/delivery/{createdDeliveryManId}</code>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCreatedDeliveryManId(null);
                                setShowAddDeliveryMan(false);
                              }}
                              className="w-full mt-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-all"
                            >
                              {t('vendor.delivery.close', { defaultValue: 'Close' })}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">{t('vendor.delivery.name', { defaultValue: 'Name *' })}</label>
                              <input
                                type="text"
                                value={newDeliveryMan.name}
                                onChange={(e) => setNewDeliveryMan({ ...newDeliveryMan, name: e.target.value })}
                                placeholder={t('vendor.delivery.enterFullName', { defaultValue: 'Enter full name' })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">{t('vendor.delivery.emailLabel', { defaultValue: 'Email *' })}</label>
                              <input
                                type="email"
                                value={newDeliveryMan.email}
                                onChange={(e) => setNewDeliveryMan({ ...newDeliveryMan, email: e.target.value })}
                                placeholder={t('vendor.delivery.enterEmailAddress', { defaultValue: 'Enter email address' })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">{t('vendor.delivery.phoneLabel', { defaultValue: 'Phone *' })}</label>
                              <div className="flex gap-2">
                                <select
                                  value={newDeliveryMan.countryCode}
                                  onChange={(e) => setNewDeliveryMan({ ...newDeliveryMan, countryCode: e.target.value })}
                                  className="w-32 px-2 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                                >
                                  {countryCodes.map((cc) => (
                                    <option key={`${cc.country}-${cc.code}`} value={cc.code}>
                                      {cc.flag} {cc.code}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="tel"
                                  value={newDeliveryMan.phone}
                                  onChange={(e) => setNewDeliveryMan({ ...newDeliveryMan, phone: e.target.value })}
                                  placeholder={t('vendor.delivery.enterPhoneNumber', { defaultValue: 'Enter phone number' })}
                                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">{t('vendor.delivery.deliveryZoneOptional', { defaultValue: 'Delivery Zone (Optional)' })}</label>
                              <select
                                value={newDeliveryMan.zoneId}
                                onChange={(e) => setNewDeliveryMan({ ...newDeliveryMan, zoneId: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                              >
                                <option value="">{t('vendor.delivery.selectDeliveryZoneOpt', { defaultValue: 'Select delivery zone' })}</option>
                                {deliveryZones.map((zone) => (
                                  <option key={zone.id} value={zone.id}>
                                    {zone.name}
                                  </option>
                                ))}
                              </select>
                              {deliveryZones.length === 0 && (
                                <p className="text-xs text-orange-500 mt-1">
                                  {t('vendor.delivery.noDeliveryZonesAvailable', { defaultValue: 'No delivery zones available.' })}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowAddDeliveryMan(false);
                                  setNewDeliveryMan({ name: '', email: '', phone: '', countryCode: '+880', zoneId: '', password: '' });
                                }}
                                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-all"
                                disabled={isAddingDeliveryMan}
                              >
                                {t('vendor.delivery.cancel', { defaultValue: 'Cancel' })}
                              </button>
                              <button
                                type="button"
                                onClick={handleAddDeliveryMan}
                                disabled={isAddingDeliveryMan}
                                className="flex-1 py-2 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                              >
                                {isAddingDeliveryMan ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('vendor.delivery.registering', { defaultValue: 'Registering...' })}
                                  </>
                                ) : (
                                  t('vendor.delivery.registerAndSelect', { defaultValue: 'Register & Select' })
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Delivery Fee - only show when Own Delivery Man is selected */}
                    {trackingFormData.carrier === 'Own Delivery Man' && (
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">Delivery Fee ($) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={trackingFormData.deliveryFee || '5.00'}
                          onChange={(e) => setTrackingFormData({ ...trackingFormData, deliveryFee: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                          placeholder="5.00"
                          required
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          {t('vendor.delivery.deliveryFeeHint', { defaultValue: 'This amount will be paid to the delivery person for this order.' })}
                        </p>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-500">{t('vendor.delivery.trackingNumberRequired', { defaultValue: 'Tracking Number *' })}</label>
                        {trackingFormData.carrier === 'Own Delivery Man' && (
                          <button
                            type="button"
                            onClick={() => setTrackingFormData({
                              ...trackingFormData,
                              trackingNumber: generateTrackingNumber()
                            })}
                            className="text-xs text-primary-lime hover:underline"
                          >
                            {t('vendor.delivery.regenerate', { defaultValue: 'Regenerate' })}
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={trackingFormData.trackingNumber || ''}
                        onChange={(e) => setTrackingFormData({ ...trackingFormData, trackingNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                        placeholder={trackingFormData.carrier === 'Own Delivery Man'
                          ? t('vendor.delivery.trackingAutoPlaceholder', { defaultValue: 'Auto-generated (e.g., ODM-M7GYZ5S-A1B2)' })
                          : t('vendor.delivery.trackingCarrierPlaceholder', { defaultValue: 'Enter carrier tracking number (e.g., 1Z999AA10123456784)' })}
                        required
                        readOnly={trackingFormData.carrier === 'Own Delivery Man'}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {trackingFormData.carrier === 'Own Delivery Man'
                          ? t('vendor.delivery.trackingAutoHint', { defaultValue: 'Auto-generated tracking ID for your own delivery. Customer will use this to track.' })
                          : t('vendor.delivery.trackingCarrierHint', { defaultValue: 'Enter the tracking number provided by the carrier. Customer will use this to track their order.' })}
                      </p>
                    </div>

                    <div className={`grid ${editingShipment ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                      {/* Status dropdown - only show when editing */}
                      {editingShipment && (
                        <div>
                          <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.status', { defaultValue: 'Status' })}</label>
                          <select
                            value={trackingFormData.status || 'pending'}
                            onChange={(e) => setTrackingFormData({ ...trackingFormData, status: e.target.value as Shipment['status'] })}
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                          >
                            <option value="pending">{t('vendor.delivery.statuses.pending', { defaultValue: 'Pending' })}</option>
                            <option value="processing">{t('vendor.delivery.statuses.processing', { defaultValue: 'Processing' })}</option>
                            <option value="shipped">{t('vendor.delivery.statuses.shipped', { defaultValue: 'Shipped' })}</option>
                            <option value="delivered">{t('vendor.delivery.statuses.delivered', { defaultValue: 'Delivered' })}</option>
                            <option value="cancelled">{t('vendor.delivery.statuses.cancelled', { defaultValue: 'Cancelled' })}</option>
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.delivery.estimatedDelivery', { defaultValue: 'Estimated Delivery' })}</label>
                        <input
                          type="date"
                          value={trackingFormData.estimatedDelivery || ''}
                          onChange={(e) => setTrackingFormData({ ...trackingFormData, estimatedDelivery: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowTrackingModal(false)}
                      className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
                    >
                      {t('vendor.delivery.cancel', { defaultValue: 'Cancel' })}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSubmitTracking(e as any)}
                      className="px-6 py-2 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-all shadow-lg"
                    >
                      {editingShipment ? t('vendor.delivery.updateTracking', { defaultValue: 'Update Tracking' }) : t('vendor.delivery.createTracking', { defaultValue: 'Create Tracking' })}
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

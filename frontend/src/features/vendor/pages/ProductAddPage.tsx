import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  X,
  AlertCircle,
  ArrowLeft,
  Image as ImageIcon,
  DollarSign,
  Package,
  Tag,
  TrendingUp,
  Search,
  Plus,
  Trash2,
  Calendar,
  Eye,
  Upload,
  Check,
  Info,
  Percent,
  BarChart3,
  Link as LinkIcon,
  Hash,
  FileText,
  Globe,
  Star,
  Clock,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Palette,
  Ruler,
  List,
  Settings,
  Layers,
  Truck,
  Shield,
  AlertTriangle,
  Crown,
  ArrowRight
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { toast } from 'sonner';
import { api } from '../../../lib/api';
import { useActiveShop } from '../../../hooks/useActiveShop';
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { AlertDialog } from '../../../components/ui/AlertDialog';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '@/lib/api/billing-api';
import { canAddProduct, getPlanLimits, type PlanTier } from '@/types/billing';

interface ImageUpload {
  id: string;
  url: string;
  file?: File;
  isPrimary: boolean;
  order: number;
}

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorCode: string;
  sku: string;
  price: number;
  quantity: number;
}

interface FormData {
  // Basic Info
  name: string;
  brand: string;
  description: string;
  sku: string;
  barcode: string;

  // Pricing
  price: number;
  compareAtPrice: number;
  costPerItem: number;
  taxable: boolean;
  taxRate: number;

  // Inventory
  trackInventory: boolean;
  quantity: number;
  lowStockThreshold: number;
  allowBackorders: boolean;
  stockStatus: 'in_stock' | 'out_of_stock' | 'low_stock';

  // Categories
  categoryId: string;
  tags: string[];

  // Features & Specifications
  features: string[];
  specifications: { key: string; value: string }[];
  material: string;

  // Campaigns/Offers
  campaignIds: string[];
  offerIds: string[];
  isFlashSale: boolean;
  flashSalePrice: number;
  flashSaleEndDate: string;

  // SEO
  metaTitle: string;
  metaDescription: string;
  slug: string;

  // Variants
  sizes: string[];
  colors: { name: string; code: string }[];
  hasVariants: boolean;

  // Care & Size Guide
  careInstructions: string[];
  sizeChart: { size: string; chest: string; waist: string; hips: string; length: string }[];

  // Shipping & Returns
  shippingInfo: {
    freeShippingThreshold: number;
    standardDays: string;
    expressDays: string;
    expressCost: number;
    nextDayCost: number;
  };
  returnPolicy: {
    returnDays: number;
    conditions: string[];
    freeReturns: boolean;
    refundDays: string;
  };

  // Sidebar
  status: 'draft' | 'published';
  scheduledPublishDate: string;
  isFeatured: boolean;
  visibility: 'public' | 'private' | 'password';
  password: string;
}

type TabType = 'product' | 'shipping' | 'marketing';

export const ProductAddPage: React.FC = () => {
  const { t } = useTranslation();
  const dialog = useDialog();
  const navigate = useNavigate();
  const params = useParams();
  const productId = params.productId; // Extract productId for edit mode
  const isEditMode = !!productId; // Determine if we're editing or creating

  // Get active shop from unified hook (works with both vendor and customer auth)
  const { shop, shopId, isLoading: shopsLoading, hasShops } = useActiveShop();

  // Subscription and product limits
  const { data: subscription } = useSubscription();
  // Use shop.totalProducts for accurate count instead of API call with limit
  const currentProductCount = shop?.totalProducts || 0;
  const currentPlan = subscription?.plan as PlanTier | undefined;
  const planLimits = getPlanLimits(currentPlan);
  const canCreate = isEditMode || canAddProduct(currentProductCount, currentPlan);
  const remainingProducts = planLimits.products === Infinity ? Infinity : planLimits.products - currentProductCount;

  const [activeTab, setActiveTab] = useState<TabType>('product');

  // Set shop context in API client for automatic header injection
  useEffect(() => {
    if (shopId) {
      api.setShopId(shopId);
    }
  }, [shopId]);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEditMode); // Loading state for fetching product
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    brand: '',
    description: '',
    sku: '',
    barcode: '',
    price: 0,
    compareAtPrice: 0,
    costPerItem: 0,
    taxable: true,
    taxRate: 0,
    trackInventory: true,
    quantity: 0,
    lowStockThreshold: 10,
    allowBackorders: false,
    stockStatus: 'in_stock',
    categoryId: '',
    tags: [],
    features: [],
    specifications: [],
    material: '',
    campaignIds: [],
    offerIds: [],
    isFlashSale: false,
    flashSalePrice: 0,
    flashSaleEndDate: '',
    metaTitle: '',
    metaDescription: '',
    slug: '',
    sizes: [],
    colors: [],
    hasVariants: false,
    careInstructions: [],
    sizeChart: [],
    shippingInfo: {
      freeShippingThreshold: 100,
      standardDays: '5-7',
      expressDays: '2-3',
      expressCost: 15.99,
      nextDayCost: 29.99,
    },
    returnPolicy: {
      returnDays: 30,
      conditions: [],
      freeReturns: true,
      refundDays: '5-7',
    },
    status: 'draft',
    scheduledPublishDate: '',
    isFeatured: false,
    visibility: 'public',
    password: ''
  });

  // Feature and Specification input states
  const [featureInput, setFeatureInput] = useState('');
  const [specKeyInput, setSpecKeyInput] = useState('');
  const [specValueInput, setSpecValueInput] = useState('');

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [colorCodeInput, setColorCodeInput] = useState('#000000');

  // Care & Size Chart inputs
  const [careInput, setCareInput] = useState('');
  const [returnConditionInput, setReturnConditionInput] = useState('');
  const [sizeChartInput, setSizeChartInput] = useState({ size: '', chest: '', waist: '', hips: '', length: '' });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Load initial data
  useEffect(() => {
    if (shop?.id) {
      loadCategories();
      loadCampaigns();
      loadOffers();

      // Load product data if in edit mode
      if (isEditMode) {
        loadProduct();
      } else {
        // Only load draft for new products
        loadFromLocalStorage();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop?.id, productId]);

  // Show limit modal when product limit is reached (only for new products)
  useEffect(() => {
    if (!isEditMode && currentProductCount > 0 && !canCreate) {
      setShowLimitModal(true);
    }
  }, [isEditMode, currentProductCount, canCreate]);

  // Handle upgrade button click - navigate to billing page
  const handleUpgradeClick = () => {
    setShowLimitModal(false);
    navigate('/vendor/billing');
  };

  // Auto-save to localStorage (only for new products, not when editing)
  useEffect(() => {
    if (!shop?.id || isEditMode) return; // Don't auto-save drafts when editing an existing product

    const timer = setTimeout(() => {
      saveToLocalStorage();
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, images, shop?.id, isEditMode]);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.name]);

  // Handle click outside category dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown]);

  // Auto-generate SKU
  const generateSKU = () => {
    const prefix = shop?.name?.substring(0, 3).toUpperCase() || 'PRD';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sku = `${prefix}-${random}`;
    setFormData(prev => ({ ...prev, sku }));
    toast.success('SKU generated', { description: sku });
  };

  const loadCategories = async () => {
    if (!shop?.id) return;
    try {
      const data = await api.getVendorCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      // Silently handle 404 - categories are optional
      if (err.response?.status !== 404) {
        console.error('Failed to load categories:', err);
      }
      setCategories([]);
    }
  };

  // Load product data for edit mode
  const loadProduct = async () => {
    if (!productId || !shopId) return;

    // Clear any existing draft when loading a product for editing
    // This prevents draft data from persisting when user goes back to Add Product page
    clearLocalStorage();

    try {
      setLoadingProduct(true);
      const product = await api.getProduct(productId);

      // Populate form data
      // Backend uses Shopify convention: price = selling price, compareAtPrice = original
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        description: product.description || '',
        price: product.price || 0,
        compareAtPrice: product.compareAtPrice || product.compare_at_price || product.compare_price || 0,
        costPerItem: product.costPerItem || product.cost_per_item || 0,
        sku: product.sku || '',
        barcode: product.barcode || '',
        trackInventory: product.trackInventory ?? true,
        quantity: product.quantity || 0,
        lowStockThreshold: product.lowStockThreshold || 0,
        allowBackorders: product.allowBackorders ?? false,
        stockStatus: product.stockStatus || 'in_stock',
        categoryId: product.categories?.[0] || '',
        tags: product.tags || [],
        features: product.features || [],
        specifications: product.specifications
          ? Object.entries(product.specifications).map(([key, value]) => ({ key, value: String(value) }))
          : [],
        material: product.material || '',
        campaignIds: product.campaignIds || [],
        offerIds: product.offerIds || [],
        isFlashSale: product.isFlashSale ?? false,
        flashSalePrice: product.flashSalePrice || 0,
        flashSaleEndDate: product.flashSaleEndDate || '',
        status: product.status === 'active' ? 'published' : 'draft',
        isFeatured: product.isFeatured ?? false,
        scheduledPublishDate: product.scheduledPublishDate || '',
        visibility: product.visibility === 'visible' ? 'public' : 'private',
        password: '',
        taxable: product.taxable ?? true,
        taxRate: product.taxRate || 0,
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        slug: product.slug || '',
        sizes: product.sizes || [],
        colors: (product.colors || []).filter((c: any) => c?.name && c?.code),
        hasVariants: product.hasVariants ?? (product.sizes?.length > 0 || product.colors?.length > 0),
        careInstructions: product.careInstructions || [],
        sizeChart: product.sizeChart || [],
        shippingInfo: product.shippingInfo || {
          freeShippingThreshold: 100,
          standardDays: '5-7',
          expressDays: '2-3',
          expressCost: 15.99,
          nextDayCost: 29.99,
        },
        returnPolicy: product.returnPolicy || {
          returnDays: 30,
          conditions: [],
          freeReturns: true,
          refundDays: '5-7',
        },
      });

      // Populate images
      if (product.images && product.images.length > 0) {
        setImages(product.images.map((img: any, idx: number) => ({
          id: img.id || `img-${idx}`,
          url: img.url,
          isPrimary: img.isPrimary || idx === 0,
          order: img.order ?? idx,
        })));
      }

    } catch (error: any) {
      console.error('[ProductAddPage] Failed to load product:', error);
      toast.error('Failed to load product', {
        description: error?.response?.data?.message || 'Could not load product data'
      });
      // Navigate back to products list on error
      navigate(`/shop/${shopId}/vendor/products`);
    } finally {
      setLoadingProduct(false);
    }
  };

  const loadCampaigns = async () => {
    if (!shop?.id) return;
    try {
      const response = await api.getVendorCampaigns({ status: 'active' });
      // Handle both response.data structure and direct data array
      const campaignsData = response.data || response || [];
      setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
    } catch (err: any) {
      // Silently handle 404 - campaigns are optional
      if (err.response?.status !== 404) {
        console.error('Failed to load campaigns:', err);
      }
      setCampaigns([]);
    }
  };

  const loadOffers = async () => {
    if (!shop?.id) return;
    try {
      const response = await api.getVendorOffers({ status: 'active' });
      // Handle both response.data structure and direct data array
      const offersData = response.data || response || [];
      setOffers(Array.isArray(offersData) ? offersData : []);
    } catch (err: any) {
      // Silently handle 404 - offers are optional
      if (err.response?.status !== 404) {
        console.error('Failed to load offers:', err);
      }
      setOffers([]);
    }
  };

  const saveToLocalStorage = () => {
    try {
      // Only save URLs, not file objects or data URLs to avoid quota issues
      const data = {
        formData,
        images: images.map(img => ({
          url: img.url,
          isPrimary: img.isPrimary,
          order: img.order,
          // Don't save file objects or large data
          id: img.id
        })),
        timestamp: new Date().toISOString()
      };

      const dataString = JSON.stringify(data);

      // Check size before saving (localStorage limit is ~5-10MB)
      if (dataString.length > 4 * 1024 * 1024) { // 4MB limit
        console.warn('Draft too large to save to localStorage');
        return;
      }

      localStorage.setItem('product_draft', dataString);
      setLastSaved(new Date());
    } catch (err) {
      // Handle quota exceeded error gracefully
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old draft');
        // Try to clear and save again
        try {
          localStorage.removeItem('product_draft');
        } catch (e) {
          console.error('Failed to clear localStorage:', e);
        }
      } else {
        console.error('Failed to save to localStorage:', err);
      }
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('product_draft');
      if (saved) {
        const data = JSON.parse(saved);

        // Check if draft has meaningful content
        const hasContent = data.formData && (
          data.formData.name?.trim() ||
          data.formData.description?.trim() ||
          (data.images && data.images.length > 0)
        );

        // Only restore if there's actual content
        if (!hasContent) {
          localStorage.removeItem('product_draft');
          return;
        }

        // Check if draft is older than 5 minutes (meaningful work)
        const draftAge = data.timestamp ? Date.now() - new Date(data.timestamp).getTime() : 0;
        const fiveMinutes = 5 * 60 * 1000;

        if (data.formData) setFormData(data.formData);
        if (data.images) {
          setImages(data.images.map((img: any, idx: number) => ({
            id: `img-${idx}`,
            url: img.url,
            isPrimary: img.isPrimary,
            order: img.order
          })));
        }

        // Only show notification if draft is meaningful (older than 5 minutes)
        if (draftAge > fiveMinutes) {
          toast.info(t('vendor.productAdd.toast.draftRestored', { defaultValue: 'Draft restored' }), {
            description: t('vendor.productAdd.toast.draftRestoredDescription', { defaultValue: 'Your previous work has been restored' }),
            duration: 3000
          });
        }
      }
    } catch (err) {
      console.error('Failed to load from localStorage:', err);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('product_draft');
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Upload each file to the server
    for (const file of Array.from(files)) {
      try {
        // Create a temporary image entry with loading state
        const tempId = `img-${Date.now()}-${Math.random()}`;
        const reader = new FileReader();

        reader.onload = (event) => {
          const previewUrl = event.target?.result as string;
          setImages(prev => [...prev, {
            id: tempId,
            url: previewUrl, // Temporary preview
            file,
            isPrimary: images.length === 0,
            order: images.length
          }]);
        };
        reader.readAsDataURL(file);

        // Upload to server in the background
        const uploadResult = await api.uploadProductImage(file);

        // Update the image with the server URL
        setImages(prev => prev.map(img =>
          img.id === tempId
            ? { ...img, url: uploadResult.url, file: undefined } // Replace with server URL, remove file
            : img
        ));

        toast.success('Image uploaded', {
          description: `${file.name} uploaded successfully`
        });
      } catch (error: any) {
        console.error('Failed to upload image:', error);
        toast.error('Upload failed', {
          description: error?.response?.data?.message || 'Failed to upload image. Please try again.'
        });
      }
    }
  };

  const handleSetPrimaryImage = (imageId: string) => {
    setImages(prev =>
      prev.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      }))
    );
  };

  const handleRemoveImage = (imageId: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== imageId);
      if (filtered.length > 0 && !filtered.some(img => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered.map((img, idx) => ({ ...img, order: idx }));
    });
  };

  const handleReorderImages = (dragIndex: number, dropIndex: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const [removed] = newImages.splice(dragIndex, 1);
      newImages.splice(dropIndex, 0, removed);
      return newImages.map((img, idx) => ({ ...img, order: idx }));
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    handleInputChange('tags', formData.tags.filter(t => t !== tag));
  };

  const calculateProfitMargin = () => {
    if (formData.price && formData.costPerItem) {
      const margin = ((formData.price - formData.costPerItem) / formData.price) * 100;
      return margin.toFixed(2);
    }
    return '0.00';
  };

  const calculateProfit = () => {
    if (formData.price && formData.costPerItem) {
      return (formData.price - formData.costPerItem).toFixed(2);
    }
    return '0.00';
  };

  // Generate variant combinations from sizes and colors
  const generateVariantCombinations = () => {
    const variants: any[] = [];
    const sizes = formData.sizes.length > 0 ? formData.sizes : [''];
    const colors = formData.colors.length > 0 ? formData.colors : [{ name: '', code: '' }];

    sizes.forEach(size => {
      colors.forEach(color => {
        // Skip if both are empty
        if (!size && !color.name) return;

        const variantName = [size, color.name].filter(Boolean).join(' - ');
        variants.push({
          name: variantName,
          options: [
            ...(size ? [{ name: t('vendor.productAdd.variantAttributes.size', { defaultValue: 'Size' }), value: size }] : []),
            ...(color.name ? [{ name: t('vendor.productAdd.variantAttributes.color', { defaultValue: 'Color' }), value: color.name }] : []),
          ],
          price: formData.price, // Use base price
          sku: formData.sku ? `${formData.sku}-${variantName.replace(/\s+/g, '-').toUpperCase()}` : '',
          inventory: formData.quantity,
        });
      });
    });

    return variants;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Only name and price are required
    if (!formData.name.trim()) {
      newErrors.name = t('vendor.productAdd.validation.productNameRequired', { defaultValue: 'Product name is required' });
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = t('vendor.productAdd.validation.priceMustBePositive', { defaultValue: 'Price must be greater than 0' });
    }

    // Auto-generate slug if empty
    if (!formData.slug.trim() && formData.name.trim()) {
      const autoSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }

    // Description, Image, and Category are optional

    if (formData.trackInventory && formData.quantity < 0) {
      newErrors.quantity = t('vendor.productAdd.validation.quantityCannotBeNegative', { defaultValue: 'Quantity cannot be negative' });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check product limit before proceeding - show modal (only for new products)
    if (!isEditMode && !canCreate) {
      setShowLimitModal(true);
      return;
    }

    if (!validateForm()) {
      toast.error(t('vendor.productAdd.toast.validationError', { defaultValue: 'Validation Error' }), { description: t('vendor.productAdd.toast.fixErrorsDescription', { defaultValue: 'Please fix the errors before submitting' }) });
      return;
    }

    if (!shop?.id) {
      toast.error(t('vendor.productAdd.toast.error', { defaultValue: 'Error' }), { description: t('vendor.productAdd.toast.shopContextNotFound', { defaultValue: 'Shop context not found' }) });
      return;
    }

    setLoading(true);

    try {
      // Map ALL frontend form data to backend DTO fields
      // Backend uses Shopify convention:
      // - price = current selling price (what customer pays)
      // - compareAtPrice = original price (shown crossed out if higher than price)
      const productData = {
        // Required fields
        shopId: shop.id,
        name: formData.name,
        brand: formData.brand,
        description: formData.description,
        price: formData.price,
        compareAtPrice: formData.compareAtPrice > 0 ? formData.compareAtPrice : undefined,
        images: images.map(img => ({
          url: img.url,
          alt: formData.name || t('vendor.productAdd.productImage', { defaultValue: 'Product image' }),
          isPrimary: img.isPrimary,
          order: img.order
        })),
        categoryId: formData.categoryId,

        // Optional basic info
        shortDescription: formData.description,
        sku: formData.sku,
        barcode: formData.barcode,

        // Pricing & Tax
        costPerItem: formData.costPerItem,
        taxable: formData.taxable,
        taxRate: formData.taxRate,

        // Categories & Tags
        tags: formData.tags,

        // Features & Specifications
        features: formData.features,
        specifications: formData.specifications.reduce((acc, spec) => {
          acc[spec.key] = spec.value;
          return acc;
        }, {} as Record<string, string>),
        material: formData.material,

        // Campaigns & Offers
        campaignIds: formData.campaignIds,
        offerIds: formData.offerIds,
        isFlashSale: formData.isFlashSale,
        flashSalePrice: formData.flashSalePrice,
        flashSaleEndDate: formData.flashSaleEndDate,

        // Status & Visibility - Map frontend values to backend enums
        status: formData.status === 'published' ? 'active' as const : 'draft' as const,
        isFeatured: formData.isFeatured,
        scheduledPublishDate: formData.scheduledPublishDate,
        visibility: formData.visibility === 'public' ? 'visible' as const : 'hidden' as const,
        password: formData.password,

        // Inventory - Send individual fields (backend accepts them)
        trackInventory: formData.trackInventory,
        quantity: formData.quantity,
        lowStockThreshold: formData.lowStockThreshold,
        allowBackorders: formData.allowBackorders,

        // SEO
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        slug: formData.slug,

        // Variants - Size & Color (auto-detect based on sizes/colors)
        hasVariants: formData.sizes.length > 0 || formData.colors.length > 0,
        sizes: formData.sizes,
        colors: formData.colors,
        variants: (formData.sizes.length > 0 || formData.colors.length > 0)
          ? generateVariantCombinations()
          : [],

        // Care & Size Guide
        careInstructions: formData.careInstructions,
        sizeChart: formData.sizeChart,

        // Shipping & Returns
        shippingInfo: formData.shippingInfo,
        returnPolicy: formData.returnPolicy,
      };

      if (isEditMode && productId) {
        // Update existing product
        await api.updateProduct(productId, productData);
        toast.success(t('vendor.productAdd.productUpdated', { defaultValue: 'Product updated successfully' }));
      } else {
        // Create new product
        await api.createProduct(productData);
        toast.success(t('vendor.productAdd.productCreated', { defaultValue: 'Product created successfully' }));
        clearLocalStorage();
      }

      navigate(`/shop/${shop.id}/vendor/products`);
    } catch (err: any) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} product:`, err);
      const errorTitle = isEditMode
        ? t('vendor.productAdd.failedToUpdate', { defaultValue: 'Failed to update product' })
        : t('vendor.productAdd.failedToCreate', { defaultValue: 'Failed to create product' });
      toast.error(errorTitle, {
        description: err?.response?.data?.message || t('vendor.productAdd.anErrorOccurred', { defaultValue: 'An error occurred' })
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const confirmed = await dialog.showConfirm({
      title: t('vendor.productAdd.discardProduct', { defaultValue: 'Discard Product' }),
      message: t('vendor.productAdd.discardMessage', { defaultValue: 'Are you sure you want to discard this product? All unsaved changes will be lost.' }),
      confirmText: t('vendor.productAdd.discard', { defaultValue: 'Discard' }),
      cancelText: t('vendor.productAdd.keepEditing', { defaultValue: 'Keep Editing' }),
      variant: 'warning'
    });

    if (confirmed) {
      clearLocalStorage();
      navigate(`/shop/${shop?.id}/vendor/products`);
    }
  };

  const tabs = [
    { id: 'product' as TabType, label: t('vendor.products.tabs.productInfo', { defaultValue: 'Product Info' }), icon: Package },
    { id: 'shipping' as TabType, label: t('vendor.products.tabs.shippingCare', { defaultValue: 'Shipping & Care' }), icon: Truck },
    { id: 'marketing' as TabType, label: t('vendor.products.tabs.marketingSeo', { defaultValue: 'Marketing & SEO' }), icon: TrendingUp },
  ];

  if (!shop?.id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <GlassCard hover={false}>
          <div className="text-center space-y-4 p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('vendor.products.shopNotConfigured', { defaultValue: 'Shop Not Configured' })}</h3>
              <p className="text-gray-500 mb-4">{t('vendor.products.shopNotConfiguredDesc', { defaultValue: 'Please ensure you are logged in with a valid shop account.' })}</p>
              <button
                onClick={() => navigate('/vendor/login')}
                className="px-6 py-2 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-all"
              >
                {t('vendor.common.goToLogin', { defaultValue: 'Go to Login' })}
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Show loading state while fetching product
  if (loadingProduct) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary-lime/30 border-t-primary-lime rounded-full animate-spin mx-auto" />
          <p className="text-gray-500">{t('vendor.products.loadingProduct', { defaultValue: 'Loading product...' })}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/shop/${shop?.id}/vendor/products`)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? t('vendor.products.editProduct', { defaultValue: 'Edit Product' }) : t('vendor.products.addProduct', { defaultValue: 'Add New Product' })}
            </h1>
            {lastSaved && !isEditMode && (
              <p className="text-gray-500 text-sm mt-1">
                {t('vendor.products.lastSaved', { defaultValue: 'Last saved' })}: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>{t('common.cancel', { defaultValue: 'Cancel' })}</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (!isEditMode && !canCreate)}
            className="px-6 py-2 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-all shadow-md flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{t('common.saving', { defaultValue: 'Saving...' })}</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{t('vendor.products.saveProduct', { defaultValue: 'Save Product' })}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Limit Reached Banner */}
      {!isEditMode && !canCreate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">
                {t('vendor.productAdd.limits.title', { defaultValue: 'Product Limit Reached' })}
              </h3>
              <p className="text-amber-800 text-sm mt-1">
                {t('vendor.productAdd.limits.description', {
                  defaultValue: 'You have added {{current}} out of {{max}} products allowed on your {{plan}} plan.',
                  current: currentProductCount,
                  max: planLimits.products === Infinity ? '∞' : planLimits.products,
                  plan: currentPlan || 'free'
                })}
              </p>
              <Link
                to="/vendor/billing"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                <Crown className="w-4 h-4" />
                {t('vendor.productAdd.limits.upgradeButton', { defaultValue: 'Upgrade Plan' })}
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Product Usage Info (when can still create) */}
      {!isEditMode && canCreate && remainingProducts !== Infinity && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <p className="text-blue-800 text-sm">
            {t('vendor.productAdd.limits.remaining', {
              defaultValue: 'You can add {{remaining}} more product(s) ({{max}} total on your plan)',
              remaining: remainingProducts,
              max: planLimits.products
            })}
          </p>
          <button
            onClick={() => navigate(`/shop/${shopId}/vendor/billing`)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 whitespace-nowrap"
          >
            {t('vendor.productAdd.limits.upgrade', { defaultValue: 'Upgrade Plan' })}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <GlassCard hover={false}>
            <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar pb-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap
                      ${activeTab === tab.id
                        ? 'bg-primary-lime text-white shadow-md'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Product Info Tab - All in One */}
              {activeTab === 'product' && (
                <>
                  {/* Category Section - At Top */}
                  <GlassCard hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Tag className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.products.categoryTags', { defaultValue: 'Category & Tags' })}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Category Selector */}
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.products.category', { defaultValue: 'Category' })}</label>
                        <div className="relative" ref={categoryDropdownRef}>
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                          <input
                            type="text"
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            onFocus={() => setShowCategoryDropdown(true)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                            placeholder={t('vendor.productAdd.searchCategories', { defaultValue: 'Search categories...' })}
                          />
                          {showCategoryDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl max-h-64 overflow-y-auto custom-scrollbar z-20 shadow-lg">
                              {categories
                                .filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                                .map(cat => (
                                  <button
                                    key={cat.id}
                                    onClick={() => {
                                      handleInputChange('categoryId', cat.id);
                                      setCategorySearch(cat.name);
                                      setShowCategoryDropdown(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-all ${formData.categoryId === cat.id ? 'bg-primary-lime/10' : ''}`}
                                  >
                                    <p className="text-gray-900 font-medium">{cat.name}</p>
                                  </button>
                                ))}
                              {categories.length === 0 && (
                                <div className="px-4 py-6 text-center text-gray-400">
                                  <p>{t('vendor.productAdd.noCategoriesFound', { defaultValue: 'No categories found' })}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {formData.categoryId && (
                          <div className="mt-2">
                            <span className="px-3 py-1 bg-primary-lime/10 border border-primary-lime/30 rounded-lg text-primary-lime text-sm">
                              {categories.find(c => c.id === formData.categoryId)?.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.tags', { defaultValue: 'Tags' })}</label>
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                            className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                            placeholder={t('vendor.productAdd.addTagPlaceholder', { defaultValue: 'Add tag & press Enter' })}
                          />
                          <button onClick={handleAddTag} className="px-4 py-3 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl transition-all">
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        {formData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map(tag => (
                              <div key={tag} className="flex items-center space-x-2 px-3 py-1 bg-gray-100 border border-gray-200 rounded-lg">
                                <span className="text-gray-700 text-sm">{tag}</span>
                                <button onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>

                  {/* Basic Info Section */}
                  <GlassCard hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.productAdd.basicInfo', { defaultValue: 'Basic Information' })}</span>
                    </h3>
                    <div className="space-y-4">
                      {/* Product Name & Brand */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.productName', { defaultValue: 'Product Name' })} <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`w-full px-4 py-3 bg-gray-100 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all`}
                            placeholder={t('vendor.productAdd.enterProductName', { defaultValue: 'Enter product name' })}
                          />
                          {errors.name && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertCircle className="w-4 h-4" /><span>{errors.name}</span></p>}
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.brand', { defaultValue: 'Brand' })}</label>
                          <input
                            type="text"
                            value={formData.brand}
                            onChange={(e) => handleInputChange('brand', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                            placeholder={t('vendor.productAdd.brandPlaceholder', { defaultValue: 'e.g., Nike, Apple, Samsung' })}
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.description', { defaultValue: 'Description' })}</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder={t('vendor.productAdd.descriptionPlaceholder', { defaultValue: 'Describe your product...' })}
                          rows={6}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all resize-none"
                        />
                      </div>

                      {/* SKU & Barcode */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.sku', { defaultValue: 'SKU' })}</label>
                          <div className="flex space-x-2">
                            <input type="text" value={formData.sku} onChange={(e) => handleInputChange('sku', e.target.value)} className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all" placeholder="SKU-12345" />
                            <button onClick={generateSKU} className="px-4 py-3 bg-primary-lime/10 hover:bg-primary-lime/20 border border-primary-lime/30 rounded-xl transition-all" title={t('vendor.productAdd.generateSKU', { defaultValue: 'Generate SKU' })}>
                              <Sparkles className="w-5 h-5 text-primary-lime" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.barcode', { defaultValue: 'Barcode' })}</label>
                          <input type="text" value={formData.barcode} onChange={(e) => handleInputChange('barcode', e.target.value)} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all" placeholder="123456789012" />
                        </div>
                      </div>

                      {/* Material */}
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block flex items-center space-x-1"><Layers className="w-4 h-4" /><span>{t('vendor.productAdd.material', { defaultValue: 'Material' })}</span></label>
                        <input
                          type="text"
                          value={formData.material}
                          onChange={(e) => handleInputChange('material', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                          placeholder={t('vendor.productAdd.materialPlaceholder', { defaultValue: 'e.g., 100% Cotton, Polyester blend, etc.' })}
                        />
                      </div>
                    </div>
                  </GlassCard>

                  {/* Features Section */}
                  <GlassCard hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <List className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.productAdd.features', { defaultValue: 'Features' })}</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={featureInput}
                          onChange={(e) => setFeatureInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
                                handleInputChange('features', [...formData.features, featureInput.trim()]);
                                setFeatureInput('');
                              }
                            }
                          }}
                          className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                          placeholder={t('vendor.productAdd.addFeaturePlaceholder', { defaultValue: 'Add a feature (press Enter)' })}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
                              handleInputChange('features', [...formData.features, featureInput.trim()]);
                              setFeatureInput('');
                            }
                          }}
                          className="px-4 py-3 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl transition-all"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      {formData.features.length > 0 && (
                        <div className="space-y-2">
                          {formData.features.map((feature, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                              <div className="flex items-center space-x-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-gray-700">{feature}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleInputChange('features', formData.features.filter((_, i) => i !== index))}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </GlassCard>

                  {/* Specifications Section */}
                  <GlassCard hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Settings className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.productAdd.specifications', { defaultValue: 'Specifications' })}</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={specKeyInput}
                          onChange={(e) => setSpecKeyInput(e.target.value)}
                          className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                          placeholder={t('vendor.productAdd.specificationName', { defaultValue: 'Specification name' })}
                        />
                        <input
                          type="text"
                          value={specValueInput}
                          onChange={(e) => setSpecValueInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (specKeyInput.trim() && specValueInput.trim()) {
                                handleInputChange('specifications', [...formData.specifications, { key: specKeyInput.trim(), value: specValueInput.trim() }]);
                                setSpecKeyInput('');
                                setSpecValueInput('');
                              }
                            }
                          }}
                          className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                          placeholder={t('vendor.productAdd.specificationValue', { defaultValue: 'Specification value' })}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (specKeyInput.trim() && specValueInput.trim()) {
                              handleInputChange('specifications', [...formData.specifications, { key: specKeyInput.trim(), value: specValueInput.trim() }]);
                              setSpecKeyInput('');
                              setSpecValueInput('');
                            }
                          }}
                          className="px-4 py-3 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl transition-all flex items-center justify-center space-x-2"
                        >
                          <Plus className="w-5 h-5" />
                          <span>{t('common.add', { defaultValue: 'Add' })}</span>
                        </button>
                      </div>
                      {formData.specifications.length > 0 && (
                        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">{t('vendor.productAdd.specification', { defaultValue: 'Specification' })}</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">{t('vendor.productAdd.value', { defaultValue: 'Value' })}</th>
                                <th className="w-12"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {formData.specifications.map((spec, index) => (
                                <tr key={index} className="border-t border-gray-200">
                                  <td className="px-4 py-3 text-gray-700 font-medium">{spec.key}</td>
                                  <td className="px-4 py-3 text-gray-600">{spec.value}</td>
                                  <td className="px-4 py-3">
                                    <button
                                      type="button"
                                      onClick={() => handleInputChange('specifications', formData.specifications.filter((_, i) => i !== index))}
                                      className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'weight', label: t('vendor.productAdd.specPresets.weight', { defaultValue: 'Weight' }) },
                          { id: 'dimensions', label: t('vendor.productAdd.specPresets.dimensions', { defaultValue: 'Dimensions' }) },
                          { id: 'brand', label: t('vendor.productAdd.specPresets.brand', { defaultValue: 'Brand' }) },
                          { id: 'countryOfOrigin', label: t('vendor.productAdd.specPresets.countryOfOrigin', { defaultValue: 'Country of Origin' }) },
                        ].map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              if (!formData.specifications.some(s => s.key === preset.label)) {
                                setSpecKeyInput(preset.label);
                              }
                            }}
                            disabled={formData.specifications.some(s => s.key === preset.label)}
                            className={`px-3 py-1 text-xs rounded-lg transition-all ${formData.specifications.some(s => s.key === preset.label) ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}
                          >
                            + {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </GlassCard>

                  {/* Pricing Section */}
                  <GlassCard hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.productAdd.pricing', { defaultValue: 'Pricing' })}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.sellingPrice', { defaultValue: 'Selling Price' })} <span className="text-red-500">*</span></label>
                        <p className="text-xs text-gray-400 mb-1">{t('vendor.productAdd.sellingPriceHint', { defaultValue: 'Price customer pays' })}</p>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input type="number" step="0.01" value={formData.price || ''} onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)} className={`w-full pl-12 pr-4 py-3 bg-gray-100 border ${errors.price ? 'border-red-500' : 'border-gray-200'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all`} placeholder="0.00" />
                        </div>
                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.originalPrice', { defaultValue: 'Original Price' })}</label>
                        <p className="text-xs text-gray-400 mb-1">{t('vendor.productAdd.originalPriceHint', { defaultValue: 'Shows as crossed out (for discounts)' })}</p>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input type="number" step="0.01" value={formData.compareAtPrice || ''} onChange={(e) => handleInputChange('compareAtPrice', parseFloat(e.target.value) || 0)} className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all" placeholder="0.00" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.costPerItem', { defaultValue: 'Cost per Item' })}</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input type="number" step="0.01" value={formData.costPerItem || ''} onChange={(e) => handleInputChange('costPerItem', parseFloat(e.target.value) || 0)} className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all" placeholder="0.00" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.taxRate', { defaultValue: 'Tax Rate (%) - Optional' })}</label>
                        <div className="relative">
                          <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input type="number" step="0.01" value={formData.taxRate || ''} onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)} className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all" placeholder="0" />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{t('vendor.productAdd.taxRateHint', { defaultValue: 'Leave 0 to use shop default tax rate' })}</p>
                      </div>
                    </div>
                    {formData.price > 0 && formData.costPerItem > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                        <span className="text-gray-700">{t('vendor.productAdd.profitMargin', { defaultValue: 'Profit Margin' })}:</span>
                        <span className="font-bold text-green-600">${calculateProfit()} ({calculateProfitMargin()}%)</span>
                      </div>
                    )}
                  </GlassCard>

                  {/* Images Section */}
                  <GlassCard hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <ImageIcon className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.productAdd.productImages', { defaultValue: 'Product Images' })}</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <input type="file" id="image-upload" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <label htmlFor="image-upload" className="block p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-lime/50 transition-all cursor-pointer text-center">
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">{t('vendor.productAdd.clickToUpload', { defaultValue: 'Click to upload images' })}</p>
                          <p className="text-gray-400 text-sm">{t('vendor.productAdd.imageFormats', { defaultValue: 'JPG, PNG, GIF (Max 5MB)' })}</p>
                        </label>
                      </div>
                      {images.length > 0 && (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {images.map((image, index) => (
                            <motion.div key={image.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                <img src={image.url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                              </div>
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-1">
                                <button onClick={() => handleSetPrimaryImage(image.id)} className={`p-1.5 rounded-md transition-all ${image.isPrimary ? 'bg-primary-lime text-white' : 'bg-white/20 hover:bg-white/40 text-white'}`}><Star className="w-3 h-3" /></button>
                                <button onClick={() => handleRemoveImage(image.id)} className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-md transition-all"><Trash2 className="w-3 h-3" /></button>
                              </div>
                              {image.isPrimary && <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary-lime text-white text-xs rounded font-medium">{t('vendor.productAdd.primary', { defaultValue: 'Primary' })}</div>}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </GlassCard>

                  {/* Inventory Section */}
                  <GlassCard hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Package className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.productAdd.inventory', { defaultValue: 'Inventory' })}</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" id="trackInventory" checked={formData.trackInventory} onChange={(e) => handleInputChange('trackInventory', e.target.checked)} className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-300 cursor-pointer accent-primary-lime" />
                        <label htmlFor="trackInventory" className="text-gray-700 cursor-pointer">{t('vendor.productAdd.trackInventory', { defaultValue: 'Track inventory' })}</label>
                      </div>
                      {formData.trackInventory && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.stockQuantity', { defaultValue: 'Stock Quantity' })}</label>
                            <input type="number" value={formData.quantity || ''} onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all" placeholder="0" />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.lowStockAlert', { defaultValue: 'Low Stock Alert' })}</label>
                            <input type="number" value={formData.lowStockThreshold || ''} onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value) || 0)} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all" placeholder="10" />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.stockStatus', { defaultValue: 'Stock Status' })}</label>
                            <select value={formData.stockStatus} onChange={(e) => handleInputChange('stockStatus', e.target.value as any)} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all">
                              <option value="in_stock">{t('vendor.productAdd.inStock', { defaultValue: 'In Stock' })}</option>
                              <option value="low_stock">{t('vendor.productAdd.lowStock', { defaultValue: 'Low Stock' })}</option>
                              <option value="out_of_stock">{t('vendor.productAdd.outOfStock', { defaultValue: 'Out of Stock' })}</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </GlassCard>

                  {/* Size & Color Section */}
                  <GlassCard hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Palette className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.productAdd.variants', { defaultValue: 'Variants (Size & Color)' })}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Sizes */}
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block flex items-center space-x-1"><Ruler className="w-4 h-4" /><span>{t('vendor.productAdd.sizes', { defaultValue: 'Sizes' })}</span></label>
                        <div className="flex items-center space-x-2 mb-2">
                          <input type="text" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (sizeInput.trim() && !formData.sizes.includes(sizeInput.trim())) { handleInputChange('sizes', [...formData.sizes, sizeInput.trim()]); setSizeInput(''); } } }} className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all text-sm" placeholder={t('vendor.productAdd.addSizePlaceholder', { defaultValue: 'Add size...' })} />
                          <button type="button" onClick={() => { if (sizeInput.trim() && !formData.sizes.includes(sizeInput.trim())) { handleInputChange('sizes', [...formData.sizes, sizeInput.trim()]); setSizeInput(''); } }} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {['S', 'M', 'L', 'XL', 'XXL'].map(size => (<button key={size} type="button" onClick={() => { if (!formData.sizes.includes(size)) handleInputChange('sizes', [...formData.sizes, size]); }} disabled={formData.sizes.includes(size)} className={`px-2 py-1 text-xs rounded transition-all ${formData.sizes.includes(size) ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}>{size}</button>))}
                        </div>
                        {formData.sizes.length > 0 && (<div className="flex flex-wrap gap-1">{formData.sizes.map(size => (<span key={size} className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white rounded text-xs"><span>{size}</span><button type="button" onClick={() => handleInputChange('sizes', formData.sizes.filter(s => s !== size))} className="hover:text-blue-200"><X className="w-3 h-3" /></button></span>))}</div>)}
                      </div>
                      {/* Colors */}
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block flex items-center space-x-1"><Palette className="w-4 h-4" /><span>{t('vendor.productAdd.colors', { defaultValue: 'Colors' })}</span></label>
                        <div className="flex items-center space-x-2 mb-2">
                          <input type="color" value={colorCodeInput} onChange={(e) => setColorCodeInput(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                          <input type="text" value={colorInput} onChange={(e) => setColorInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (colorInput.trim()) { const exists = formData.colors.some(c => c?.name?.toLowerCase() === colorInput.trim().toLowerCase()); if (!exists) { handleInputChange('colors', [...formData.colors.filter(c => c?.name && c?.code), { name: colorInput.trim(), code: colorCodeInput }]); setColorInput(''); setColorCodeInput('#000000'); } } } }} className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all text-sm" placeholder={t('vendor.productAdd.colorName', { defaultValue: 'Color name' })} />
                          <button type="button" onClick={() => { if (colorInput.trim()) { const exists = formData.colors.some(c => c?.name?.toLowerCase() === colorInput.trim().toLowerCase()); if (!exists) { handleInputChange('colors', [...formData.colors.filter(c => c?.name && c?.code), { name: colorInput.trim(), code: colorCodeInput }]); setColorInput(''); setColorCodeInput('#000000'); } } }} className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {[{ name: 'Black', code: '#000000' }, { name: 'White', code: '#FFFFFF' }, { name: 'Red', code: '#EF4444' }, { name: 'Blue', code: '#3B82F6' }, { name: 'Green', code: '#22C55E' }].map(color => { const exists = formData.colors.some(c => c?.name?.toLowerCase() === color.name.toLowerCase()); return (<button key={color.name} type="button" onClick={() => { if (!exists) handleInputChange('colors', [...formData.colors.filter(c => c?.name && c?.code), color]); }} disabled={exists} className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-all ${exists ? 'bg-gray-200 text-gray-400' : 'bg-purple-100 hover:bg-purple-200 text-purple-700'}`}><span className="w-3 h-3 rounded-full border" style={{ backgroundColor: color.code }} /><span>{color.name}</span></button>); })}
                        </div>
                        {formData.colors.filter(c => c?.name && c?.code).length > 0 && (<div className="flex flex-wrap gap-1">{formData.colors.filter(c => c?.name && c?.code).map(color => (<span key={color.name} className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-500 text-white rounded text-xs"><span className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: color.code }} /><span>{color.name}</span><button type="button" onClick={() => handleInputChange('colors', formData.colors.filter(c => c?.name !== color.name))} className="hover:text-purple-200"><X className="w-3 h-3" /></button></span>))}</div>)}
                      </div>
                    </div>
                  </GlassCard>
                </>
              )}

              {/* Shipping & Care Tab */}
              {activeTab === 'shipping' && (
                <>
                  {/* Care Instructions */}
                  <GlassCard hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.productAdd.careInstructions', { defaultValue: 'Care Instructions' })}</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={careInput}
                          onChange={(e) => setCareInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (careInput.trim() && !formData.careInstructions.includes(careInput.trim())) {
                                handleInputChange('careInstructions', [...formData.careInstructions, careInput.trim()]);
                                setCareInput('');
                              }
                            }
                          }}
                          className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                          placeholder={t('vendor.productAdd.addCareInstructionPlaceholder', { defaultValue: 'Add care instruction (e.g., Machine wash cold)' })}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (careInput.trim() && !formData.careInstructions.includes(careInput.trim())) {
                              handleInputChange('careInstructions', [...formData.careInstructions, careInput.trim()]);
                              setCareInput('');
                            }
                          }}
                          className="p-3 bg-primary-lime hover:bg-primary-lime/90 text-black rounded-xl transition-all"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'machineWashCold', label: t('vendor.productAdd.carePresets.machineWashCold', { defaultValue: 'Machine wash cold' }) },
                          { key: 'doNotBleach', label: t('vendor.productAdd.carePresets.doNotBleach', { defaultValue: 'Do not bleach' }) },
                          { key: 'tumbleDryLow', label: t('vendor.productAdd.carePresets.tumbleDryLow', { defaultValue: 'Tumble dry low' }) },
                          { key: 'ironOnLowHeat', label: t('vendor.productAdd.carePresets.ironOnLowHeat', { defaultValue: 'Iron on low heat' }) },
                          { key: 'dryCleanOnly', label: t('vendor.productAdd.carePresets.dryCleanOnly', { defaultValue: 'Dry clean only' }) }
                        ].map(preset => (
                          <button
                            key={preset.key}
                            type="button"
                            onClick={() => {
                              if (!formData.careInstructions.includes(preset.label)) {
                                handleInputChange('careInstructions', [...formData.careInstructions, preset.label]);
                              }
                            }}
                            disabled={formData.careInstructions.includes(preset.label)}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${formData.careInstructions.includes(preset.label) ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      {formData.careInstructions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.careInstructions.map((instruction, idx) => (
                            <span key={idx} className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm">
                              <span>{instruction}</span>
                              <button type="button" onClick={() => handleInputChange('careInstructions', formData.careInstructions.filter((_, i) => i !== idx))} className="hover:text-blue-200">
                                <X className="w-4 h-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </GlassCard>

                  {/* Size Chart */}
                  <GlassCard hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Ruler className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.productAdd.sizeChart', { defaultValue: 'Size Chart' })}</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-5 gap-2">
                        <input type="text" value={sizeChartInput.size} onChange={(e) => setSizeChartInput({ ...sizeChartInput, size: e.target.value })} className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm" placeholder={t('vendor.productAdd.sizePlaceholder', { defaultValue: 'Size (S, M, L)' })} />
                        <input type="text" value={sizeChartInput.chest} onChange={(e) => setSizeChartInput({ ...sizeChartInput, chest: e.target.value })} className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm" placeholder={t('vendor.productAdd.chestPlaceholder', { defaultValue: 'Chest (34-36")' })} />
                        <input type="text" value={sizeChartInput.waist} onChange={(e) => setSizeChartInput({ ...sizeChartInput, waist: e.target.value })} className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm" placeholder={t('vendor.productAdd.waistPlaceholder', { defaultValue: 'Waist (28-30")' })} />
                        <input type="text" value={sizeChartInput.hips} onChange={(e) => setSizeChartInput({ ...sizeChartInput, hips: e.target.value })} className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm" placeholder={t('vendor.productAdd.hipsPlaceholder', { defaultValue: 'Hips (36-38")' })} />
                        <input type="text" value={sizeChartInput.length} onChange={(e) => setSizeChartInput({ ...sizeChartInput, length: e.target.value })} className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm" placeholder={t('vendor.productAdd.lengthPlaceholder', { defaultValue: 'Length (27")' })} />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (sizeChartInput.size) {
                            handleInputChange('sizeChart', [...formData.sizeChart, sizeChartInput]);
                            setSizeChartInput({ size: '', chest: '', waist: '', hips: '', length: '' });
                          }
                        }}
                        className="px-4 py-2 bg-primary-lime hover:bg-primary-lime/90 text-black rounded-lg text-sm font-medium transition-all flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t('vendor.productAdd.addSize', { defaultValue: 'Add Size' })}</span>
                      </button>
                      {formData.sizeChart.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-3 font-semibold">{t('vendor.productAdd.sizeHeader', { defaultValue: 'Size' })}</th>
                                <th className="text-left py-2 px-3 font-semibold">{t('vendor.productAdd.chestHeader', { defaultValue: 'Chest' })}</th>
                                <th className="text-left py-2 px-3 font-semibold">{t('vendor.productAdd.waistHeader', { defaultValue: 'Waist' })}</th>
                                <th className="text-left py-2 px-3 font-semibold">{t('vendor.productAdd.hipsHeader', { defaultValue: 'Hips' })}</th>
                                <th className="text-left py-2 px-3 font-semibold">{t('vendor.productAdd.lengthHeader', { defaultValue: 'Length' })}</th>
                                <th className="w-10"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {formData.sizeChart.map((row, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                  <td className="py-2 px-3">{row.size}</td>
                                  <td className="py-2 px-3">{row.chest}</td>
                                  <td className="py-2 px-3">{row.waist}</td>
                                  <td className="py-2 px-3">{row.hips}</td>
                                  <td className="py-2 px-3">{row.length}</td>
                                  <td className="py-2 px-3">
                                    <button type="button" onClick={() => handleInputChange('sizeChart', formData.sizeChart.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </GlassCard>

                  {/* Shipping Information */}
                  <GlassCard hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Truck className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.productAdd.shippingInfo', { defaultValue: 'Shipping Information' })}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.freeShippingThreshold', { defaultValue: 'Free Shipping Threshold ($)' })}</label>
                        <input type="number" value={formData.shippingInfo.freeShippingThreshold} onChange={(e) => handleInputChange('shippingInfo', { ...formData.shippingInfo, freeShippingThreshold: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all" placeholder="100" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.standardShippingDays', { defaultValue: 'Standard Shipping Days' })}</label>
                        <input type="text" value={formData.shippingInfo.standardDays} onChange={(e) => handleInputChange('shippingInfo', { ...formData.shippingInfo, standardDays: e.target.value })} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all" placeholder="5-7" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.expressShippingDays', { defaultValue: 'Express Shipping Days' })}</label>
                        <input type="text" value={formData.shippingInfo.expressDays} onChange={(e) => handleInputChange('shippingInfo', { ...formData.shippingInfo, expressDays: e.target.value })} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all" placeholder="2-3" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.expressShippingCost', { defaultValue: 'Express Shipping Cost ($)' })}</label>
                        <input type="number" step="0.01" value={formData.shippingInfo.expressCost} onChange={(e) => handleInputChange('shippingInfo', { ...formData.shippingInfo, expressCost: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all" placeholder="15.99" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.nextDayDeliveryCost', { defaultValue: 'Next Day Delivery Cost ($)' })}</label>
                        <input type="number" step="0.01" value={formData.shippingInfo.nextDayCost} onChange={(e) => handleInputChange('shippingInfo', { ...formData.shippingInfo, nextDayCost: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all" placeholder="29.99" />
                      </div>
                    </div>
                  </GlassCard>

                  {/* Return Policy */}
                  <GlassCard hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <RefreshCw className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.productAdd.returnPolicy', { defaultValue: 'Return Policy' })}</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.returnWindow', { defaultValue: 'Return Window (Days)' })}</label>
                          <input type="number" value={formData.returnPolicy.returnDays} onChange={(e) => handleInputChange('returnPolicy', { ...formData.returnPolicy, returnDays: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all" placeholder="30" />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.refundProcessingDays', { defaultValue: 'Refund Processing Days' })}</label>
                          <input type="text" value={formData.returnPolicy.refundDays} onChange={(e) => handleInputChange('returnPolicy', { ...formData.returnPolicy, refundDays: e.target.value })} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all" placeholder="5-7" />
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" checked={formData.returnPolicy.freeReturns} onChange={(e) => handleInputChange('returnPolicy', { ...formData.returnPolicy, freeReturns: e.target.checked })} className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-300 cursor-pointer accent-primary-lime" />
                            <span className="text-gray-700">{t('vendor.productAdd.freeReturnShipping', { defaultValue: 'Free Return Shipping' })}</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.returnConditions', { defaultValue: 'Return Conditions' })}</label>
                        <div className="flex items-center space-x-2 mb-3">
                          <input
                            type="text"
                            value={returnConditionInput}
                            onChange={(e) => setReturnConditionInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (returnConditionInput.trim() && !formData.returnPolicy.conditions.includes(returnConditionInput.trim())) {
                                  handleInputChange('returnPolicy', { ...formData.returnPolicy, conditions: [...formData.returnPolicy.conditions, returnConditionInput.trim()] });
                                  setReturnConditionInput('');
                                }
                              }
                            }}
                            className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                            placeholder={t('vendor.productAdd.addReturnConditionPlaceholder', { defaultValue: 'Add return condition' })}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (returnConditionInput.trim() && !formData.returnPolicy.conditions.includes(returnConditionInput.trim())) {
                                handleInputChange('returnPolicy', { ...formData.returnPolicy, conditions: [...formData.returnPolicy.conditions, returnConditionInput.trim()] });
                                setReturnConditionInput('');
                              }
                            }}
                            className="p-3 bg-primary-lime hover:bg-primary-lime/90 text-black rounded-xl transition-all"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { key: 'unwornWithTags', label: t('vendor.productAdd.returnPresets.unwornWithTags', { defaultValue: 'Items must be unworn with original tags' }) },
                            { key: 'originalPackaging', label: t('vendor.productAdd.returnPresets.originalPackaging', { defaultValue: 'Original packaging required' }) },
                            { key: 'noFinalSale', label: t('vendor.productAdd.returnPresets.noFinalSale', { defaultValue: 'No final sale items' }) }
                          ].map(preset => (
                            <button
                              key={preset.key}
                              type="button"
                              onClick={() => {
                                if (!formData.returnPolicy.conditions.includes(preset.label)) {
                                  handleInputChange('returnPolicy', { ...formData.returnPolicy, conditions: [...formData.returnPolicy.conditions, preset.label] });
                                }
                              }}
                              disabled={formData.returnPolicy.conditions.includes(preset.label)}
                              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${formData.returnPolicy.conditions.includes(preset.label) ? 'bg-gray-200 text-gray-400' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                        {formData.returnPolicy.conditions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {formData.returnPolicy.conditions.map((condition, idx) => (
                              <span key={idx} className="inline-flex items-center space-x-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm">
                                <span>{condition}</span>
                                <button type="button" onClick={() => handleInputChange('returnPolicy', { ...formData.returnPolicy, conditions: formData.returnPolicy.conditions.filter((_, i) => i !== idx) })} className="hover:text-green-200">
                                  <X className="w-4 h-4" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </>
              )}

              {/* Marketing & SEO Tab */}
              {activeTab === 'marketing' && (
                <>
                  {/* Campaigns & Offers */}
                  <GlassCard hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.productAdd.campaignsOffers', { defaultValue: 'Campaigns & Offers' })}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.linkToCampaigns', { defaultValue: 'Link to Campaigns' })}</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {campaigns.length > 0 ? campaigns.map(campaign => (
                            <label key={campaign.id} className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 cursor-pointer transition-all">
                              <input type="checkbox" checked={formData.campaignIds.includes(campaign.id)} onChange={(e) => { const newCampaignIds = e.target.checked ? [...formData.campaignIds, campaign.id] : formData.campaignIds.filter(id => id !== campaign.id); handleInputChange('campaignIds', newCampaignIds); }} className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-300 cursor-pointer accent-primary-lime" />
                              <div className="flex-1"><p className="text-gray-900 font-medium">{campaign.name}</p></div>
                            </label>
                          )) : <p className="text-gray-400 text-center py-4">{t('vendor.productAdd.noActiveCampaigns', { defaultValue: 'No active campaigns' })}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.linkToOffers', { defaultValue: 'Link to Offers' })}</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {offers.length > 0 ? offers.map(offer => (
                            <label key={offer.id} className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 cursor-pointer transition-all">
                              <input type="checkbox" checked={formData.offerIds.includes(offer.id)} onChange={(e) => { const newOfferIds = e.target.checked ? [...formData.offerIds, offer.id] : formData.offerIds.filter(id => id !== offer.id); handleInputChange('offerIds', newOfferIds); }} className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-300 cursor-pointer accent-primary-lime" />
                              <div className="flex-1"><p className="text-gray-900 font-medium">{offer.code}</p></div>
                            </label>
                          )) : <p className="text-gray-400 text-center py-4">{t('vendor.productAdd.noActiveOffers', { defaultValue: 'No active offers' })}</p>}
                        </div>
                      </div>
                    </div>
                    {/* Flash Sale */}
                    <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2"><Sparkles className="w-5 h-5 text-orange-500" /><h4 className="text-gray-900 font-semibold">{t('vendor.productAdd.flashSale', { defaultValue: 'Flash Sale' })}</h4></div>
                        <input type="checkbox" checked={formData.isFlashSale} onChange={(e) => handleInputChange('isFlashSale', e.target.checked)} className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-300 cursor-pointer accent-orange-500" />
                      </div>
                      {formData.isFlashSale && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.flashSalePrice', { defaultValue: 'Flash Sale Price' })}</label>
                            <div className="relative"><DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="number" step="0.01" value={formData.flashSalePrice || ''} onChange={(e) => handleInputChange('flashSalePrice', parseFloat(e.target.value) || 0)} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" placeholder="0.00" /></div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.endDateTime', { defaultValue: 'End Date & Time' })}</label>
                            <input type="datetime-local" value={formData.flashSaleEndDate} onChange={(e) => handleInputChange('flashSaleEndDate', e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" />
                          </div>
                        </div>
                      )}
                    </div>
                  </GlassCard>

                  {/* SEO */}
                  <GlassCard hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.productAdd.seoSettings', { defaultValue: 'SEO Settings' })}</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.metaTitle', { defaultValue: 'Meta Title' })}</label>
                          <input type="text" value={formData.metaTitle} onChange={(e) => handleInputChange('metaTitle', e.target.value)} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all" placeholder={t('vendor.productAdd.seoTitlePlaceholder', { defaultValue: 'SEO title' })} maxLength={60} />
                          <p className="text-gray-400 text-xs mt-1">{formData.metaTitle.length}/60</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.urlSlug', { defaultValue: 'URL Slug' })}</label>
                          <input type="text" value={formData.slug} onChange={(e) => handleInputChange('slug', e.target.value)} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all" placeholder="product-url-slug" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-2 block">{t('vendor.productAdd.metaDescription', { defaultValue: 'Meta Description' })}</label>
                        <textarea value={formData.metaDescription} onChange={(e) => handleInputChange('metaDescription', e.target.value)} rows={3} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all resize-none" placeholder={t('vendor.productAdd.seoDescriptionPlaceholder', { defaultValue: 'Brief description for search results' })} maxLength={160} />
                        <p className="text-gray-400 text-xs mt-1">{formData.metaDescription.length}/160</p>
                      </div>
                    </div>
                  </GlassCard>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <GlassCard hover={false}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('vendor.products.status', { defaultValue: 'Status' })}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-2 block">{t('vendor.products.publicationStatus', { defaultValue: 'Publication Status' })}</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                >
                  <option value="draft">{t('vendor.products.statuses.draft', { defaultValue: 'Draft' })}</option>
                  <option value="published">{t('vendor.products.statuses.published', { defaultValue: 'Published' })}</option>
                </select>
              </div>

              {/* Scheduled Publishing */}
              <div>
                <label className="text-sm text-gray-500 mb-2 block flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{t('vendor.products.schedulePublishing', { defaultValue: 'Schedule Publishing' })}</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledPublishDate}
                  onChange={(e) => handleInputChange('scheduledPublishDate', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                />
              </div>
            </div>
          </GlassCard>

          {/* Visibility */}
          <GlassCard hover={false}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('vendor.products.visibility', { defaultValue: 'Visibility' })}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-2 block">{t('vendor.products.whoCanSee', { defaultValue: 'Who can see this?' })}</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => handleInputChange('visibility', e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                >
                  <option value="public">{t('vendor.products.visibilityOptions.public', { defaultValue: 'Public' })}</option>
                  <option value="private">{t('vendor.products.visibilityOptions.private', { defaultValue: 'Private' })}</option>
                </select>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-700">{t('vendor.products.featuredProduct', { defaultValue: 'Featured Product' })}</span>
                </div>
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-300 cursor-pointer accent-primary-lime"
                />
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard hover={false}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('vendor.products.quickActions', { defaultValue: 'Quick Actions' })}</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const preview = window.open('', '_blank');
                  if (preview) {
                    preview.document.write(`
                      <html>
                        <head><title>Product Preview</title></head>
                        <body>
                          <h1>${formData.name}</h1>
                          <p>${formData.description}</p>
                          <p>Price: $${formData.price}</p>
                        </body>
                      </html>
                    `);
                  }
                }}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all flex items-center justify-center space-x-2 text-gray-700"
              >
                <Eye className="w-4 h-4" />
                <span>{t('vendor.products.preview', { defaultValue: 'Preview' })}</span>
              </button>
              <button
                onClick={saveToLocalStorage}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all flex items-center justify-center space-x-2 text-gray-700"
              >
                <Save className="w-4 h-4" />
                <span>{t('vendor.products.saveDraft', { defaultValue: 'Save Draft' })}</span>
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Dialog Components */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />

      {/* Product Limit Reached Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={() => setShowLimitModal(false)}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Content */}
                <div className="p-8 text-center">
                  {/* Icon */}
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-10 h-10 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {t('vendor.productAdd.limits.title', { defaultValue: 'Product Limit Reached' })}
                  </h3>

                  {/* Message */}
                  <p className="text-gray-600 mb-6">
                    {t('vendor.productAdd.limits.modalDescription', {
                      defaultValue: 'You have added {{current}} out of {{max}} products allowed on your {{plan}} plan. Upgrade your plan to add more products.',
                      current: currentProductCount,
                      max: planLimits.products === Infinity ? '∞' : planLimits.products,
                      plan: (currentPlan || 'free').charAt(0).toUpperCase() + (currentPlan || 'free').slice(1)
                    })}
                  </p>

                  {/* Plan info */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{t('vendor.productAdd.limits.currentPlan', { defaultValue: 'Current Plan' })}</span>
                      <span className="font-semibold text-gray-900 capitalize">{currentPlan || 'free'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-500">{t('vendor.productAdd.limits.productsUsed', { defaultValue: 'Products Used' })}</span>
                      <span className="font-semibold text-gray-900">
                        {currentProductCount} / {planLimits.products === Infinity ? '∞' : planLimits.products}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowLimitModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      {t('common.cancel', { defaultValue: 'Cancel' })}
                    </button>
                    <button
                      onClick={handleUpgradeClick}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Crown className="w-5 h-5" />
                      {t('vendor.productAdd.limits.upgradeButton', { defaultValue: 'Upgrade Plan' })}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

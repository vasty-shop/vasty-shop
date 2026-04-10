/**
 * Comprehensive Vendor API Module
 * Centralized API client for all vendor operations
 * Uses the main API client from /lib/api.ts with proper error handling
 */

import { api } from '@/lib/api';
import { apiClient } from '@/lib/api-client';

// ============================================
// DASHBOARD ANALYTICS
// ============================================

export interface DashboardStats {
  revenue: {
    total: number;
    change: number;
    data: Array<{ date: string; value: number }>;
  };
  orders: {
    total: number;
    change: number;
    statusBreakdown: {
      pending: number;
      processing: number;
      completed: number;
      cancelled: number;
    };
  };
  products: {
    total: number;
    active: number;
    draft: number;
    outOfStock: number;
  };
  customers: {
    total: number;
    new: number;
    change: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    trend: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    product: string;
    amount: number;
    status: string;
    time: string;
  }>;
  revenueData: Array<{
    name: string;
    revenue: number;
    orders: number;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  performanceMetrics: {
    avgOrderValue: { value: number; change: number };
    conversionRate: { value: number; change: number };
    storeViews: { value: number; change: number };
    avgRating: { value: number; change: number };
  };
}

export const getDashboardStats = async (shopId: string): Promise<DashboardStats> => {
  console.log('[vendorApi] getDashboardStats called, shopId from apiClient:', apiClient.getShopId());
  const response = await apiClient.get(`/shops/current/statistics`);
  console.log('[vendorApi] getDashboardStats response:', response.data);
  return response.data;
};

// ============================================
// ANALYTICS
// ============================================

export interface AnalyticsData {
  revenue: Array<{ month: string; revenue: number; orders: number; customers: number }>;
  categoryPerformance: Array<{ category: string; sales: number; revenue: number; growth: number }>;
  customerInsights: Array<{ metric: string; value: number }>;
  trafficSources: Array<{ name: string; value: number; color: string }>;
}

export const getAnalytics = async (shopId: string, timeRange: string = '6m'): Promise<AnalyticsData> => {
  const response = await apiClient.get(`/shops/current/statistics`, {
    params: { timeRange }
  });
  return response.data;
};

// ============================================
// RE-EXPORT EXISTING API METHODS
// ============================================

// Products
export const getVendorProducts = api.getVendorProducts.bind(api);
export const createProduct = api.createProduct.bind(api);
export const updateProduct = api.updateProduct.bind(api);
export const deleteProduct = api.deleteProduct.bind(api);
export const updateProductStatus = api.updateProductStatus.bind(api);
export const updateProductInventory = api.updateProductInventory.bind(api);

// Orders
export const getVendorOrders = api.getVendorOrders.bind(api);
export const getVendorOrderStatistics = api.getVendorOrderStatistics.bind(api);
export const updateOrderStatus = api.updateOrderStatus.bind(api);
export const acceptOrder = api.acceptOrder.bind(api);
export const markOrderAsShipped = api.markOrderAsShipped.bind(api);
export const cancelOrderByVendor = api.cancelOrderByVendor.bind(api);

// Customers
export const getVendorCustomers = api.getVendorCustomers.bind(api);
export const getVendorCustomerDetails = api.getVendorCustomerDetails.bind(api);
export const getVendorCustomerOrders = api.getVendorCustomerOrders.bind(api);
export const exportVendorCustomers = api.exportVendorCustomers.bind(api);

// Offers
export const getVendorOffers = api.getVendorOffers.bind(api);
export const createOffer = api.createOffer.bind(api);
export const updateOffer = api.updateOffer.bind(api);
export const deleteOffer = api.deleteOffer.bind(api);
export const changeOfferStatus = api.changeOfferStatus.bind(api);

// Campaigns
export const getVendorCampaigns = api.getVendorCampaigns.bind(api);
export const createCampaign = api.createCampaign.bind(api);
export const updateCampaign = api.updateCampaign.bind(api);
export const deleteCampaign = api.deleteCampaign.bind(api);
export const updateCampaignStatus = api.updateCampaignStatus.bind(api);
export const getCampaignAnalytics = api.getCampaignAnalytics.bind(api);

// Categories
export const getVendorCategories = api.getVendorCategories.bind(api);
export const createCategory = api.createCategory.bind(api);
export const updateCategory = api.updateCategory.bind(api);
export const deleteCategory = api.deleteCategory.bind(api);
export const toggleCategoryFeatured = api.toggleCategoryFeatured.bind(api);

// Reviews
export const getVendorReviews = api.getVendorReviews.bind(api);
export const replyToReview = api.replyToReview.bind(api);
export const updateReviewReply = api.updateReviewReply.bind(api);
export const toggleReviewFeatured = api.toggleReviewFeatured.bind(api);
export const toggleReviewVisibility = api.toggleReviewVisibility.bind(api);
export const reportReview = api.reportReview.bind(api);
export const getReviewStatistics = api.getReviewStatistics.bind(api);

// Team
export const getVendorTeam = api.getVendorTeam.bind(api);
export const getTeamInvitations = api.getTeamInvitations.bind(api);
export const getAvailableRoles = api.getAvailableRoles.bind(api);
export const inviteTeamMember = api.inviteTeamMember.bind(api);
export const updateTeamMember = api.updateTeamMember.bind(api);
export const updateTeamMemberRole = api.updateTeamMemberRole.bind(api);
export const removeTeamMember = api.removeTeamMember.bind(api);
export const resendInvitation = api.resendInvitation.bind(api);
export const cancelInvitation = api.cancelInvitation.bind(api);
export const suspendTeamMember = api.suspendTeamMember.bind(api);
export const activateTeamMember = api.activateTeamMember.bind(api);
export const getTeamActivity = api.getTeamActivity.bind(api);

// Delivery
export const getVendorDeliveryMethods = api.getVendorDeliveryMethods.bind(api);
export const createDeliveryMethod = api.createDeliveryMethod.bind(api);
export const updateDeliveryMethod = api.updateDeliveryMethod.bind(api);
export const deleteDeliveryMethod = api.deleteDeliveryMethod.bind(api);
export const toggleDeliveryMethod = api.toggleDeliveryMethod.bind(api);
export const getVendorShippingZones = api.getVendorShippingZones.bind(api);
export const createShippingZone = api.createShippingZone.bind(api);
export const updateShippingZone = api.updateShippingZone.bind(api);
export const deleteShippingZone = api.deleteShippingZone.bind(api);
export const getVendorShipments = api.getVendorShipments.bind(api);

// Shop
export const getShop = api.getShop.bind(api);
export const updateShop = api.updateShop.bind(api);
export const uploadShopImage = api.uploadShopImage.bind(api);

export default {
  // Dashboard
  getDashboardStats,
  getAnalytics,

  // Products
  getVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  updateProductInventory,

  // Orders
  getVendorOrders,
  getVendorOrderStatistics,
  updateOrderStatus,
  acceptOrder,
  markOrderAsShipped,
  cancelOrderByVendor,

  // Customers
  getVendorCustomers,
  getVendorCustomerDetails,
  getVendorCustomerOrders,
  exportVendorCustomers,

  // Offers
  getVendorOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  changeOfferStatus,

  // Campaigns
  getVendorCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  updateCampaignStatus,
  getCampaignAnalytics,

  // Categories
  getVendorCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryFeatured,

  // Reviews
  getVendorReviews,
  replyToReview,
  updateReviewReply,
  toggleReviewFeatured,
  toggleReviewVisibility,
  reportReview,
  getReviewStatistics,

  // Team
  getVendorTeam,
  getTeamInvitations,
  getAvailableRoles,
  inviteTeamMember,
  updateTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
  resendInvitation,
  cancelInvitation,
  suspendTeamMember,
  activateTeamMember,
  getTeamActivity,

  // Delivery
  getVendorDeliveryMethods,
  createDeliveryMethod,
  updateDeliveryMethod,
  deleteDeliveryMethod,
  toggleDeliveryMethod,
  getVendorShippingZones,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone,
  getVendorShipments,

  // Shop
  getShop,
  updateShop,
  uploadShopImage
};

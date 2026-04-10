import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { StoreAuthProvider } from './contexts/StoreAuthContext';
import { PlatformSettingsProvider } from './contexts/PlatformSettingsContext';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ProtectedStoreRoute } from './components/auth/ProtectedStoreRoute';
import { LandingPage, PlatformLandingPage } from './features/home';
import { ExplorePage } from './features/explore';
import { OutfitFeedPage } from './features/outfits/OutfitFeedPage';
import { ProductDetailPage } from './features/products/ProductDetailPage';
import { ProductsPage } from './features/products/ProductsPage';
import { CategoriesPage } from './features/categories';
import { ARTryOnPage } from './features/ar-tryon/ARTryOnPage';
import { CartPage } from './features/cart/CartPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { ContactPage } from './features/contact/ContactPage';
import { FAQPage } from './features/faq/FAQPage';
import { HelpCenterPage } from './features/help/HelpCenterPage';
import { AboutPage } from './features/about';
import { TermsPage } from './features/legal/TermsPage';
import { PrivacyPage } from './features/legal/PrivacyPage';
import { CookiesPage } from './features/legal/CookiesPage';
import { ShippingPage } from './features/legal/ShippingPage';
import { DataDeletionPage } from './features/legal/DataDeletionPage';
import { SitemapPage } from './features/legal/SitemapPage';
import { PressPage, StoresPage, SizeGuidePage } from './features/pages';
import { TrackOrderPage } from './features/orders/TrackOrderPage';
import { OrdersPage } from './features/orders/OrdersPage';
import { CheckoutPage, OrderConfirmationPage } from './features/checkout';
import { PaymentSuccessPage } from './features/checkout/PaymentSuccessPage';
import { PaymentFailedPage } from './features/checkout/PaymentFailedPage';
import { WishlistPage } from './features/wishlist';
import { SettingsPage } from './features/settings';
import { OffersPage } from './features/offers';
import { CampaignPage } from './features/campaigns';
import { NotificationsPage } from './features/notifications';
import { LoginPage, SignUpPage, ForgotPasswordPage, ResetPasswordPage, EmailVerificationPage } from './features/auth';
import OAuthCallback from './features/auth/OAuthCallback';
import { VendorRegisterPage } from './features/vendor-auth';
import {
  DeliveryLayout,
  DeliveryDashboardPage,
  DeliveryOrdersPage,
  DeliveryEarningsPage,
  DeliveryHistoryPage,
  DeliveryNotificationsPage,
  DeliveryProfilePage,
  DeliverySettingsPage,
  DeliveryReviewsPage,
  DeliveryZonesPage,
} from './features/delivery';
import { VendorLayout } from './features/vendor/layout/VendorLayout';
import { VendorDashboardPage } from './features/vendor/pages/VendorDashboardPage';
import { ProductsListPage } from './features/vendor/pages/ProductsListPage';
import { ProductAddPage } from './features/vendor/pages/ProductAddPage';
import { OrdersListPage } from './features/vendor/pages/OrdersListPage';
import { AnalyticsPage } from './features/vendor/pages/AnalyticsPage';
import { ShopSettingsPage } from './features/vendor/pages/ShopSettingsPage';
import { ShopSelectionPage } from './features/vendor/pages/ShopSelectionPage';
import { CreateShopPage } from './features/vendor/pages/CreateShopPage';
import { ShopOnboardingWizard } from './features/vendor/pages/ShopOnboardingWizard';
import { ReviewsPage } from './features/vendor/pages/ReviewsPage';
import { DeliveryPage } from './features/vendor/pages/DeliveryPage';
import { OffersPage as VendorOffersPage } from './features/vendor/pages/OffersPage';
import { OfferAddPage } from './features/vendor/pages/OfferAddPage';
import { CampaignsPage as VendorCampaignsPage } from './features/vendor/pages/CampaignsPage';
import { CustomersPage } from './features/vendor/pages/CustomersPage';
import { TeamPage } from './features/vendor/pages/TeamPage';
import { BillingPage } from './features/vendor/pages/BillingPage';
import { PaymentSettingsPage } from './features/vendor/pages/PaymentSettingsPage';
import { VendorProfilePage } from './features/vendor/pages/VendorProfilePage';
import { VendorNotificationsPage } from './features/vendor/pages/VendorNotificationsPage';
import { StorefrontPreviewPage } from './features/vendor/pages/StorefrontPreviewPage';
import { AIPromptPage, StorefrontEditor } from './features/vendor/storefront-builder';
import { MobileAppEditor } from './features/vendor/mobile-app-builder';
// import { VastyChatbot } from './components/chat/VastyChatbot';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { SubdomainRouter } from './components/routing';
// Admin imports
import { AdminLayout } from './features/admin/layout/AdminLayout';
import { AdminDashboardPage } from './features/admin/pages/AdminDashboardPage';
import { ShopApprovalsPage } from './features/admin/pages/ShopApprovalsPage';
import { UserModerationPage } from './features/admin/pages/UserModerationPage';
import { PlatformAnalyticsPage } from './features/admin/pages/PlatformAnalyticsPage';
import { GlobalSettingsPage } from './features/admin/pages/GlobalSettingsPage';
import { AdminOrdersPage } from './features/admin/pages/AdminOrdersPage';
import { AdminProductsPage } from './features/admin/pages/AdminProductsPage';
import { AdminCategoriesPage } from './features/admin/pages/AdminCategoriesPage';
import { AdminPaymentsPage } from './features/admin/pages/AdminPaymentsPage';
import { AdminReviewsPage } from './features/admin/pages/AdminReviewsPage';
import { AdminNotificationsPage } from './features/admin/pages/AdminNotificationsPage';
import { AdminReportsPage } from './features/admin/pages/AdminReportsPage';
import { AdminReferralsPage } from './features/admin/pages/AdminReferralsPage';
import { ShopProfilePage } from './features/store';
import { ReferralsPage } from './features/referrals';
import { FeaturesPage } from './features/features-page';
import { BlogList, BlogPost, CreateBlog, UpdateBlog, MyBlogs } from './features/blog';
import { PublicStorefront } from './features/storefront';
import { StorefrontLayout } from './features/storefront/StorefrontLayout';
import { NotFoundPage } from './features/error';
import {
  StorefrontLandingPage,
  StorefrontCartPage,
  StorefrontWishlistPage,
  StorefrontProductsPage,
  StorefrontCheckoutPage,
  StorefrontProfilePage,
  StorefrontOrdersPage,
  StorefrontTrackOrderPage,
  StorefrontProductDetailPage,
  StorefrontAboutPage,
  StorefrontContactPage,
  StorefrontCollectionsPage,
  StorefrontFAQPage,
} from './features/storefront/pages';
import { StorefrontLoginPage } from './features/storefront/pages/StorefrontLoginPage';
import { StorefrontRegisterPage } from './features/storefront/pages/StorefrontRegisterPage';
import './index.css';
import { ScrollToTop } from './components/utils/ScrollToTop';
import { FeatureAnnouncementProvider } from './providers/FeatureAnnouncementProvider';

/**
 * Redirect component for /store/:shopId/vendor/* to /shop/:shopId/vendor/*
 * Handles legacy URLs or incorrect navigation patterns
 */
const StoreToShopRedirect: React.FC = () => {
  const location = window.location;
  // Replace /store/ with /shop/ in the current path
  const newPath = location.pathname.replace('/store/', '/shop/');
  return <Navigate to={newPath + location.search} replace />;
};

/**
 * Redirect /shop/:shopId to /store/:shopId for customer-facing pages
 * All customer shopping should go through /store/ routes for store-specific auth
 */
const ShopToStoreRedirect: React.FC = () => {
  const location = window.location;
  // Replace /shop/ with /store/ in the current path
  const newPath = location.pathname.replace('/shop/', '/store/');
  return <Navigate to={newPath + location.search} replace />;
};

/**
 * Smart Store Page - Renders PublicStorefront if published, otherwise ShopProfilePage
 */
const SmartStorePage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const [hasStorefront, setHasStorefront] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkStorefront = async () => {
      if (!shopId) {
        setHasStorefront(false);
        setLoading(false);
        return;
      }

      try {
        // Import api dynamically to avoid circular deps
        const { api } = await import('./lib/api');
        const result = await api.getPublicStorefront(shopId);
        // Check if storefront is published and has content
        const isPublished = result?.published === true;
        const hasContent = result?.config && Object.keys(result.config).length > 0 && result.config.theme;
        setHasStorefront(isPublished && hasContent);
      } catch (error) {
        setHasStorefront(false);
      } finally {
        setLoading(false);
      }
    };

    checkStorefront();
  }, [shopId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-lime border-t-transparent rounded-full" />
      </div>
    );
  }

  // Render PublicStorefront if has published storefront, otherwise ShopProfilePage
  return hasStorefront ? <PublicStorefront /> : <ShopProfilePage />;
};

const AppContent: React.FC = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PlatformLandingPage />} />
        <Route path="/shop" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/outfits" element={<OutfitFeedPage />} />
        <Route path="/outfit/:id" element={<ProductDetailPage />} />
        <Route path="/category/:categorySlug" element={<CategoriesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/faqs" element={<Navigate to="/faq" replace />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/data-deletion" element={<DataDeletionPage />} />
        <Route path="/sitemap" element={<SitemapPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/press" element={<PressPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/size-guide" element={<SizeGuidePage />} />
        <Route path="/categories" element={<CategoriesPage />} />

        {/* Blog Routes */}
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route
          path="/blog/create"
          element={
            <ProtectedRoute>
              <CreateBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog/edit/:id"
          element={
            <ProtectedRoute>
              <UpdateBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog/my-posts"
          element={
            <ProtectedRoute>
              <MyBlogs />
            </ProtectedRoute>
          }
        />

        {/* Store-specific Auth Pages (outside StorefrontLayout for standalone experience) */}
        <Route path="/store/:shopId/login" element={<StorefrontLoginPage />} />
        <Route path="/store/:shopId/register" element={<StorefrontRegisterPage />} />

        {/* Public Store with Multi-page Storefront Layout */}
        <Route path="/store/:shopId" element={<StorefrontLayout />}>
          {/* Public routes - no auth required */}
          <Route index element={<StorefrontLandingPage />} />
          <Route path="products" element={<StorefrontProductsPage />} />
          <Route path="product/:productId" element={<StorefrontProductDetailPage />} />
          <Route path="collections" element={<StorefrontCollectionsPage />} />
          <Route path="collection/:collectionId" element={<StorefrontProductsPage />} />
          <Route path="category/:categoryId" element={<StorefrontProductsPage />} />
          <Route path="sale" element={<StorefrontProductsPage />} />
          <Route path="new-arrivals" element={<StorefrontProductsPage />} />
          <Route path="about" element={<StorefrontAboutPage />} />
          <Route path="contact" element={<StorefrontContactPage />} />
          <Route path="faq" element={<StorefrontFAQPage />} />
          <Route path="search" element={<StorefrontProductsPage />} />

          {/* Protected store routes - require store-specific auth */}
          <Route path="cart" element={<ProtectedStoreRoute><StorefrontCartPage /></ProtectedStoreRoute>} />
          <Route path="wishlist" element={<ProtectedStoreRoute><StorefrontWishlistPage /></ProtectedStoreRoute>} />
          <Route path="checkout" element={<ProtectedStoreRoute><StorefrontCheckoutPage /></ProtectedStoreRoute>} />
          <Route path="profile" element={<ProtectedStoreRoute><StorefrontProfilePage /></ProtectedStoreRoute>} />
          <Route path="orders" element={<ProtectedStoreRoute><StorefrontOrdersPage /></ProtectedStoreRoute>} />
          <Route path="track-order" element={<ProtectedStoreRoute><StorefrontTrackOrderPage /></ProtectedStoreRoute>} />
        </Route>

        {/* Redirect /shop/:shopId to /store/:shopId for store-specific auth */}
        <Route path="/shop/:shopId" element={<ShopToStoreRedirect />} />

        {/* Redirect /store/:shopId/vendor/* to /shop/:shopId/vendor/* */}
        <Route
          path="/store/:shopId/vendor/*"
          element={<StoreToShopRedirect />}
        />

        {/* Legacy: Public Custom Storefront */}
        <Route path="/shop/:shopId/storefront" element={<PublicStorefront />} />


        {/* Public AR Try-On - kept for direct access, also available as modal */}
        <Route path="/ar-tryon/:id" element={<ARTryOnPage />} />

        {/* Guest-Friendly Routes (no auth required) */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />

        {/* Protected Customer Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/confirmation"
          element={
            <ProtectedRoute>
              <OrderConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/success"
          element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/failed"
          element={
            <ProtectedRoute>
              <PaymentFailedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-history"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/referrals"
          element={
            <ProtectedRoute>
              <ReferralsPage />
            </ProtectedRoute>
          }
        />

        {/* Public Offer/Campaign Pages */}
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/campaign" element={<CampaignPage />} />

        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token?" element={<EmailVerificationPage />} />

        {/* Vendor Auth Pages - redirect to main login */}
        <Route path="/vendor/login" element={<Navigate to="/login" replace />} />
        <Route path="/vendor/register" element={<Navigate to="/login" replace />} />

        {/* Delivery Partner Protected Routes */}
        <Route
          path="/delivery/:deliveryManId"
          element={
            <ProtectedRoute requiredRole="delivery_man">
              <DeliveryLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DeliveryDashboardPage />} />
          <Route path="orders" element={<DeliveryOrdersPage />} />
          <Route path="earnings" element={<DeliveryEarningsPage />} />
          <Route path="history" element={<DeliveryHistoryPage />} />
          <Route path="notifications" element={<DeliveryNotificationsPage />} />
          <Route path="reviews" element={<DeliveryReviewsPage />} />
          <Route path="zones" element={<DeliveryZonesPage />} />
          <Route path="profile" element={<DeliveryProfilePage />} />
          <Route path="settings" element={<DeliverySettingsPage />} />
        </Route>

        {/* Vendor Shop Selection */}
        <Route
          path="/vendor/shops"
          element={
            <ProtectedRoute requiredRole="vendor">
              <ShopSelectionPage />
            </ProtectedRoute>
          }
        />

        {/* Shop Creation - Multi-step onboarding wizard */}
        <Route
          path="/vendor/create-shop"
          element={
            <ProtectedRoute>
              <ShopOnboardingWizard />
            </ProtectedRoute>
          }
        />

        {/* Legacy simple shop creation form */}
        <Route
          path="/vendor/create-shop/simple"
          element={
            <ProtectedRoute>
              <CreateShopPage />
            </ProtectedRoute>
          }
        />

        {/* Mobile App Builder - Full screen experience */}
        <Route
          path="/shop/:shopId/vendor/mobile-app-builder"
          element={
            <ProtectedRoute requiredRole="vendor">
              <AIPromptPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop/:shopId/vendor/mobile-app-builder/editor"
          element={
            <ProtectedRoute requiredRole="vendor">
              <MobileAppEditor />
            </ProtectedRoute>
          }
        />

        {/* Vendor Protected Routes - Shop-aware routing */}
        <Route
          path="/shop/:shopId/vendor"
          element={
            <ProtectedRoute requiredRole="vendor">
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<VendorDashboardPage />} />
          <Route path="storefront" element={<StorefrontPreviewPage />} />
          <Route path="storefront-builder" element={<AIPromptPage />} />
          <Route path="storefront-builder/editor" element={<StorefrontEditor />} />
          <Route path="products" element={<ProductsListPage />} />
          <Route path="products/add" element={<ProductAddPage />} />
          <Route path="products/edit/:productId" element={<ProductAddPage />} />
          <Route path="orders" element={<OrdersListPage />} />
          <Route path="offers" element={<VendorOffersPage />} />
          <Route path="offers/add" element={<OfferAddPage />} />
          <Route path="offers/edit/:offerId" element={<OfferAddPage />} />
          <Route path="delivery" element={<DeliveryPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="campaigns" element={<VendorCampaignsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<ShopSettingsPage />} />
          <Route path="payment-settings" element={<PaymentSettingsPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="profile" element={<VendorProfilePage />} />
          <Route path="notifications" element={<VendorNotificationsPage />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="shops" element={<ShopApprovalsPage />} />
          <Route path="shops/pending" element={<ShopApprovalsPage />} />
          <Route path="shops/approved" element={<ShopApprovalsPage />} />
          <Route path="shops/rejected" element={<ShopApprovalsPage />} />
          <Route path="shop-approvals" element={<ShopApprovalsPage />} />
          <Route path="users" element={<UserModerationPage />} />
          <Route path="users/vendors" element={<UserModerationPage />} />
          <Route path="users/customers" element={<UserModerationPage />} />
          <Route path="users/admins" element={<UserModerationPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="analytics" element={<PlatformAnalyticsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="referrals" element={<AdminReferralsPage />} />
          <Route path="settings" element={<GlobalSettingsPage />} />
        </Route>

        {/* 404 Catch-all Route - Must be last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-center" richColors />
      {/* <VastyChatbot position="bottom-right" primaryColor="#8B5CF6" /> */}
      <MobileBottomNav />
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <PlatformSettingsProvider>
          <AuthProvider>
            <StoreAuthProvider>
              <FeatureAnnouncementProvider>
                <SubdomainRouter>
                  <AppContent />
                </SubdomainRouter>
              </FeatureAnnouncementProvider>
            </StoreAuthProvider>
          </AuthProvider>
        </PlatformSettingsProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

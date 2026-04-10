'use client';

/**
 * Storefront Checkout Page
 * Uses storefront theme for checkout display - no header/footer (provided by StorefrontLayout)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, ShoppingBag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/useCartStore';
import { StepIndicator } from '@/features/checkout/components/StepIndicator';
import { ShippingForm } from '@/features/checkout/components/ShippingForm';
import { DeliveryOptions, DeliveryMethodOption } from '@/features/checkout/components/DeliveryOptions';
import { PaymentForm } from '@/features/checkout/components/PaymentForm';
import { OrderReview } from '@/features/checkout/components/OrderReview';
import { OrderSummary } from '@/features/checkout/components/OrderSummary';
import { api } from '@/lib/api';
import { apiClient } from '@/lib/api-client';
import { useStorefront } from '../StorefrontLayout';
import type { CheckoutStep, CheckoutState } from '@/types';

const STORAGE_KEY = 'vasty-checkout-data';

export function StorefrontCheckoutPage() {
  const { t } = useTranslation();
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { theme } = useStorefront();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Filter cart items for this shop - be strict about shopId matching
  const shopItems = items.filter(item => {
    const itemShopId = item.product?.shopId;
    // Only include items that have a shopId AND it matches current shop
    return itemShopId && itemShopId === shopId;
  });

  // Initialize state from localStorage or defaults
  const [checkoutState, setCheckoutState] = useState<CheckoutState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved checkout data:', e);
      }
    }
    return {
      currentStep: 1,
      shippingInfo: {
        fullName: '',
        email: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US',
        saveForFuture: false,
      },
      deliveryMethod: 'standard',
      paymentMethod: 'card',
      cardInfo: {
        cardNumber: '',
        cardholderName: '',
        expirationDate: '',
        cvv: '',
        saveCard: false,
      },
      billingAddress: {
        sameAsShipping: true,
      },
      termsAccepted: false,
      orderPlaced: false,
    };
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState<string | undefined>();
  const [discount, setDiscount] = useState(0);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethodOption[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [shopTaxRate, setShopTaxRate] = useState<number>(0);

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

  // Fetch delivery and payment methods
  useEffect(() => {
    const fetchVendorSettings = async () => {
      try {
        setLoadingSettings(true);
        if (shopId) {
          apiClient.setShopId(shopId);
        }

        // Fetch shop settings for tax rate only (shipping comes from delivery methods)
        try {
          const shopData = await api.getShop(shopId);
          const shopSettings = shopData?.settings || {};
          const taxRate = shopSettings.taxRate ?? shopSettings.tax_rate ?? 0;
          setShopTaxRate(taxRate);
        } catch (settingsErr) {
          // Settings fetch failed, using defaults
        }

        const deliveryResponse = await api.getDeliveryMethods();
        if (deliveryResponse && Array.isArray(deliveryResponse) && deliveryResponse.length > 0) {
          const mappedMethods: DeliveryMethodOption[] = deliveryResponse
            .filter((m: any) => m.isActive !== false)
            .map((method: any) => ({
              id: method.id || method.type || 'standard',
              name: method.name || 'Standard Shipping',
              description: method.description || '',
              price: method.baseCost || method.rate || 0,
              estimatedDays: typeof method.estimatedDays === 'string'
                ? parseInt(method.estimatedDays.split('-')[0]) || 5
                : method.estimatedDays || 5,
              freeShippingThreshold: method.freeShippingThreshold,
              enabled: method.isActive !== false,
            }));
          setDeliveryMethods(mappedMethods);
        }

        if (shopId) {
          try {
            const paymentResponse = await api.getPaymentMethods();
            if (paymentResponse && typeof paymentResponse === 'object') {
              const enabledMethods = Object.entries(paymentResponse)
                .filter(([key, value]: [string, any]) => value?.enabled === true)
                .map(([key]) => key);
              if (enabledMethods.length > 0) {
                setPaymentMethods(enabledMethods);
              }
            }
          } catch (paymentErr) {
            // Payment methods fetch failed, using defaults
          }
        }
      } catch (err) {
        // Vendor settings fetch failed, using defaults
      } finally {
        setLoadingSettings(false);
      }
    };

    if (shopItems.length > 0) {
      fetchVendorSettings();
    } else {
      setLoadingSettings(false);
    }
  }, [shopItems.length, shopId]);

  const getShippingCost = useMemo(() => {
    const cartTotal = shopItems.reduce((sum, item) => {
      const price = item.product?.salePrice || item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    // Use delivery methods for shipping (configured in Delivery page)
    const selectedMethod = deliveryMethods.find(m => m.id === checkoutState.deliveryMethod);
    if (selectedMethod) {
      if (selectedMethod.freeShippingThreshold && cartTotal >= selectedMethod.freeShippingThreshold) {
        return 0;
      }
      return selectedMethod.price || 0;
    }

    // If no delivery methods configured, default to free shipping
    return 0;
  }, [checkoutState.deliveryMethod, deliveryMethods, shopItems]);

  useEffect(() => {
    if (shopItems.length === 0 && !checkoutState.orderPlaced) {
      navigate(`/store/${shopId}/cart`);
    }
  }, [shopItems.length, navigate, checkoutState.orderPlaced, shopId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkoutState));
  }, [checkoutState]);

  const updateCheckoutState = (updates: Partial<CheckoutState>) => {
    setCheckoutState((prev) => ({ ...prev, ...updates }));
  };

  const goToStep = (step: CheckoutStep) => {
    updateCheckoutState({ currentStep: step });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (checkoutState.currentStep < 4) {
      goToStep((checkoutState.currentStep + 1) as CheckoutStep);
    }
  };

  const handleBack = () => {
    if (checkoutState.currentStep > 1) {
      goToStep((checkoutState.currentStep - 1) as CheckoutStep);
    }
  };

  const handleApplyPromo = async (code: string) => {
    try {
      const cartTotal = shopItems.reduce((sum, item) => {
        const price = item.product?.salePrice || item.product?.price || 0;
        return sum + (price * item.quantity);
      }, 0);
      const response = await api.validateCoupon(code.toUpperCase(), cartTotal);
      const discountAmount = response.discount || 0;
      setPromoCode(code.toUpperCase());
      setDiscount(discountAmount);
      toast.success(response.message || t('cart.promoApplied', { code: code.toUpperCase() }));
    } catch (error: any) {
      toast.error(error.message || t('cart.invalidPromoCode'));
    }
  };

  const handleRemovePromo = () => {
    setPromoCode(undefined);
    setDiscount(0);
    toast.info(t('cart.promoRemoved'));
  };

  const handlePlaceOrder = async () => {
    if (!checkoutState.termsAccepted) {
      toast.error(t('checkout.acceptTermsError'));
      return;
    }

    if (shopItems.length === 0) {
      toast.error(t('cart.emptyCart'));
      return;
    }

    setIsProcessing(true);

    try {
      // Clear backend cart first to ensure we only have current items
      try {
        await api.clearCart();
      } catch (clearError) {
        // Cart may already be empty
      }

      // Add current shop items to backend cart
      for (const item of shopItems) {
        try {
          await api.addToCart(item.product.id, item.quantity, item.size, item.color);
        } catch (syncError) {
          // Item may already be in cart
        }
      }

      const backendCart = await api.getCart();
      if (!backendCart || !backendCart.id) {
        throw new Error('Cart not found. Please add items to cart again.');
      }

      const paymentMethodMap: Record<string, string> = {
        'card': 'credit_card',
        'credit_card': 'credit_card',
        'paypal': 'paypal',
        'cod': 'cash_on_delivery',
        'cash_on_delivery': 'cash_on_delivery',
        'bank': 'bank_transfer',
        'applepay': 'stripe',
        'googlepay': 'stripe',
      };

      const mappedPaymentMethod = paymentMethodMap[checkoutState.paymentMethod] || 'credit_card';
      console.log('[Storefront Checkout] Payment method:', checkoutState.paymentMethod, '→', mappedPaymentMethod);

      const orderData = {
        cartId: backendCart.id,
        shippingAddress: {
          fullName: checkoutState.shippingInfo.fullName,
          phone: checkoutState.shippingInfo.phone,
          addressLine1: checkoutState.shippingInfo.addressLine1,
          addressLine2: checkoutState.shippingInfo.addressLine2 || '',
          city: checkoutState.shippingInfo.city,
          state: checkoutState.shippingInfo.state,
          postalCode: checkoutState.shippingInfo.zipCode,
          country: checkoutState.shippingInfo.country,
        },
        paymentMethod: mappedPaymentMethod,
        customerNote: (checkoutState as any).customerNote || '',
      };

      console.log('[Storefront Checkout] Sending order data:', JSON.stringify(orderData, null, 2));
      const order = await api.createOrder(orderData);

      // Debug logging
      console.log('========== STOREFRONT CHECKOUT DEBUG ==========');
      console.log('[Storefront Checkout] Order response:', order);
      console.log('[Storefront Checkout] stripePayment:', order?.stripePayment);
      console.log('================================================');

      // Handle potential nested response
      const orderResult = order?.data || order;
      const stripePayment = orderResult?.stripePayment;

      // Handle Stripe Connect payment - redirect to Stripe Checkout
      if (stripePayment?.checkoutUrl && stripePayment?.useCheckoutSession) {
        console.log('[Storefront Checkout] Redirecting to Stripe:', stripePayment.checkoutUrl);
        toast.info('Redirecting to payment...');

        // Store order info for confirmation page
        localStorage.setItem('pending-order', JSON.stringify({
          orderId: orderResult.id,
          orderNumber: orderResult.orderNumber || orderResult.id,
          sessionId: stripePayment.sessionId,
          shopId,
          shippingInfo: checkoutState.shippingInfo,
          deliveryMethod: checkoutState.deliveryMethod,
          total: orderResult.total,
        }));

        // Set orderPlaced to true BEFORE clearing cart
        updateCheckoutState({ orderPlaced: true });
        clearCart();
        localStorage.removeItem(STORAGE_KEY);

        // Redirect to Stripe Checkout
        window.location.href = stripePayment.checkoutUrl;
        return;
      }

      // Set orderPlaced to true BEFORE clearing cart to prevent redirect to cart
      updateCheckoutState({ orderPlaced: true });

      clearCart();
      localStorage.removeItem(STORAGE_KEY);

      navigate(`/store/${shopId}/orders`, {
        state: {
          orderNumber: orderResult.orderNumber || orderResult.id,
          orderId: orderResult.id,
          success: true,
          justPlaced: true,
        },
      });

      toast.success(t('checkout.orderPlaced'));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || t('checkout.orderFailed');
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepTitle = () => {
    switch (checkoutState.currentStep) {
      case 1: return t('checkout.shippingAddress');
      case 2: return t('checkout.shippingMethod');
      case 3: return t('checkout.paymentDetails');
      case 4: return t('checkout.orderReview');
      default: return t('checkout.checkout');
    }
  };

  const canProceed = () => {
    switch (checkoutState.currentStep) {
      case 1: return isFormValid;
      case 2: return true;
      case 3: return checkoutState.paymentMethod !== 'card' || isFormValid;
      case 4: return checkoutState.termsAccepted;
      default: return false;
    }
  };

  const getButtonText = () => {
    if (checkoutState.currentStep === 4) {
      return isProcessing ? t('checkout.processing') : t('checkout.placeOrder');
    }
    switch (checkoutState.currentStep) {
      case 1: return t('checkout.continueToDelivery');
      case 2: return t('checkout.continueToPayment');
      case 3: return t('checkout.reviewOrder');
      default: return t('common.continue');
    }
  };

  // Empty cart state
  if (shopItems.length === 0) {
    return (
      <div className="py-20 px-6" style={{ color: theme.textColor }}>
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag
            className="w-20 h-20 mx-auto mb-6"
            style={{ color: theme.textColor, opacity: 0.2 }}
          />
          <h1
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: theme.headingFont, color: theme.textColor }}
          >
            {t('cart.emptyCart')}
          </h1>
          <p className="text-lg mb-8" style={getSecondaryTextStyle()}>
            {t('checkout.addItemsBeforeCheckout')}
          </p>
          <Link
            to={`/store/${shopId}/products`}
            className={`inline-flex items-center gap-2 px-6 py-3 font-medium ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90`}
            style={{ backgroundColor: theme.primaryColor }}
          >
            {t('cart.browseProducts')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-6" style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb & Security Badge */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to={`/store/${shopId}/cart`}
            className="flex items-center gap-2 text-sm transition-opacity hover:opacity-100"
            style={getSecondaryTextStyle()}
          >
            <ArrowLeft className="w-4 h-4" />
            {t('checkout.backToCart')}
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <Lock className="w-4 h-4" />
            {t('cart.secureCheckout')}
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-12">
          <StepIndicator
            currentStep={checkoutState.currentStep}
            completedSteps={Array.from(
              { length: checkoutState.currentStep - 1 },
              (_, i) => (i + 1) as CheckoutStep
            )}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Form Steps */}
          <div className="lg:col-span-7">
            <div className="mb-6">
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ fontFamily: theme.headingFont, color: theme.textColor }}
              >
                {getStepTitle()}
              </h1>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={checkoutState.currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`${getBorderRadius('large')} border p-6 md:p-8`}
                  style={{
                    backgroundColor: getCardBg(),
                    borderColor: `${theme.textColor}15`,
                  }}
                >
                  {checkoutState.currentStep === 1 && (
                    <ShippingForm
                      formData={checkoutState.shippingInfo}
                      onChange={(data) => updateCheckoutState({ shippingInfo: data })}
                      onValidate={setIsFormValid}
                    />
                  )}

                  {checkoutState.currentStep === 2 && (
                    loadingSettings ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.primaryColor }} />
                        <span className="ml-3" style={getSecondaryTextStyle()}>{t('checkout.loadingDeliveryOptions')}</span>
                      </div>
                    ) : (
                      <DeliveryOptions
                        selectedMethod={checkoutState.deliveryMethod}
                        onSelect={(method) => updateCheckoutState({ deliveryMethod: method })}
                        options={deliveryMethods.length > 0 ? deliveryMethods : undefined}
                      />
                    )
                  )}

                  {checkoutState.currentStep === 3 && (
                    <PaymentForm
                      paymentMethod={checkoutState.paymentMethod}
                      cardInfo={checkoutState.cardInfo}
                      billingAddress={checkoutState.billingAddress}
                      shippingAddress={checkoutState.shippingInfo}
                      onPaymentMethodChange={(method) => updateCheckoutState({ paymentMethod: method })}
                      onCardInfoChange={(info) => updateCheckoutState({ cardInfo: info })}
                      onBillingAddressChange={(address) => updateCheckoutState({ billingAddress: address })}
                      onValidate={setIsFormValid}
                      amount={Math.round((shopItems.reduce((sum, item) => sum + ((item.product?.salePrice || item.product?.price || 0) * item.quantity), 0) - discount) * 100)}
                      onPaymentSuccess={(data) => updateCheckoutState({ paymentData: data } as any)}
                      availablePaymentMethods={paymentMethods.length > 0 ? paymentMethods : undefined}
                    />
                  )}

                  {checkoutState.currentStep === 4 && (
                    <OrderReview
                      shippingInfo={checkoutState.shippingInfo}
                      deliveryMethod={checkoutState.deliveryMethod}
                      paymentMethod={checkoutState.paymentMethod}
                      cardInfo={checkoutState.cardInfo}
                      termsAccepted={checkoutState.termsAccepted}
                      onTermsChange={(accepted) => updateCheckoutState({ termsAccepted: accepted })}
                      onEdit={goToStep}
                    />
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-6 flex items-center justify-between gap-4">
                  {checkoutState.currentStep > 1 ? (
                    <button
                      onClick={handleBack}
                      className={`flex items-center gap-2 px-4 py-2 border ${getBorderRadius('medium')} transition-opacity hover:opacity-70`}
                      style={{ color: theme.textColor, borderColor: `${theme.textColor}20` }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t('common.back')}
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    onClick={checkoutState.currentStep === 4 ? handlePlaceOrder : handleNext}
                    disabled={!canProceed() || isProcessing}
                    className={`flex items-center gap-2 px-8 py-3 font-medium ${getBorderRadius('medium')} text-white disabled:opacity-50 transition-opacity hover:opacity-90`}
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {getButtonText()}
                    {checkoutState.currentStep < 4 && <ArrowRight className="w-4 h-4" />}
                    {checkoutState.currentStep === 4 && isProcessing && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-5">
            <OrderSummary
              deliveryMethod={checkoutState.deliveryMethod}
              shippingCost={getShippingCost}
              taxRate={shopTaxRate}
              promoCode={promoCode}
              discount={discount}
              onApplyPromo={handleApplyPromo}
              onRemovePromo={handleRemovePromo}
              sticky
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StorefrontCheckoutPage;

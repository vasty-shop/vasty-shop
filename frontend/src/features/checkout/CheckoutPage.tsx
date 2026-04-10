import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, ShoppingBag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/useCartStore';
import { StepIndicator } from './components/StepIndicator';
import { ShippingForm } from './components/ShippingForm';
import { DeliveryOptions, DeliveryMethodOption } from './components/DeliveryOptions';
import { PaymentForm } from './components/PaymentForm';
import { OrderReview } from './components/OrderReview';
import { OrderSummary } from './components/OrderSummary';
import { api } from '@/lib/api';
import { apiClient } from '@/lib/api-client';
import type {
  CheckoutStep,
  CheckoutState,
} from '@/types';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const STORAGE_KEY = 'vasty-checkout-data';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

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

  // Dynamic delivery and payment methods from vendor
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethodOption[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Fetch delivery and payment methods from vendor settings
  useEffect(() => {
    const fetchVendorSettings = async () => {
      try {
        setLoadingSettings(true);

        // Get shop ID from cart items (all items should be from the same shop)
        let shopId = items[0]?.product?.shopId || items[0]?.product?.shop_id;

        // If shopId is not in cart product, try to fetch it from the product API
        if (!shopId && items[0]?.product?.id) {
          try {
            const productData = await api.getProduct(items[0].product.id);
            shopId = productData.shopId || productData.shop_id;
          } catch (err) {
            // Could not fetch product
          }
        }

        // Set shop ID in API client for x-shop-id header
        if (shopId) {
          apiClient.setShopId(shopId);
        }

        // Fetch delivery methods first (works even without shopId, returns all methods)
        const deliveryResponse = await api.getDeliveryMethods();

        if (deliveryResponse && Array.isArray(deliveryResponse) && deliveryResponse.length > 0) {
          // Get shopId from delivery method if we don't have it yet
          if (!shopId && deliveryResponse[0]?.shopId) {
            shopId = deliveryResponse[0].shopId;
            apiClient.setShopId(shopId);
          }

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

          // Set default delivery method if not already set
          if (mappedMethods.length > 0 && !checkoutState.deliveryMethod) {
            updateCheckoutState({ deliveryMethod: mappedMethods[0].id });
          }
        }

        // Fetch payment methods (requires shopId to get shop-specific settings)
        if (shopId) {
          try {
            const paymentResponse = await api.getPaymentMethods();

            // Handle object format: { card: { enabled: true }, paypal: { enabled: false } }
            let enabledMethods: string[] = [];

            if (paymentResponse && typeof paymentResponse === 'object') {
              enabledMethods = Object.entries(paymentResponse)
                .filter(([key, value]: [string, any]) => value?.enabled === true)
                .map(([key]) => key);
            }

            if (enabledMethods.length > 0) {
              setPaymentMethods(enabledMethods);
            }
          } catch (paymentErr) {
            // Could not fetch payment methods, using defaults
          }
        }
      } catch (err) {
        // Could not fetch vendor settings, using defaults
      } finally {
        setLoadingSettings(false);
      }
    };

    if (items.length > 0) {
      fetchVendorSettings();
    } else {
      setLoadingSettings(false);
    }
  }, [items]);

  // Get shipping cost based on selected delivery method
  const getShippingCost = useMemo(() => {
    const selectedMethod = deliveryMethods.find(m => m.id === checkoutState.deliveryMethod);
    if (selectedMethod) {
      const cartTotal = useCartStore.getState().getTotalPrice();
      // Check for free shipping threshold
      if (selectedMethod.freeShippingThreshold && cartTotal >= selectedMethod.freeShippingThreshold) {
        return 0;
      }
      return selectedMethod.price || 0;
    }
    // Fallback to old logic if no methods loaded
    return checkoutState.deliveryMethod === 'standard' ? 0 : checkoutState.deliveryMethod === 'express' ? 15 : 35;
  }, [checkoutState.deliveryMethod, deliveryMethods]);

  // Get tax rate from products (use first product's tax rate, all items should be from same shop)
  const getTaxRate = useMemo(() => {
    const firstItem = items[0];
    if (firstItem?.product?.taxRate !== undefined) {
      return firstItem.product.taxRate;
    }
    // Default to 0% if no tax rate is set
    return 0;
  }, [items]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !checkoutState.orderPlaced) {
      navigate('/cart');
    }
  }, [items.length, navigate, checkoutState.orderPlaced]);

  // Save state to localStorage
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
    // Validate promo code with API
    try {
      const cartTotal = useCartStore.getState().getTotalPrice();
      const response = await api.validateCoupon(code.toUpperCase(), cartTotal);

      const discountAmount = response.discount || 0;
      setPromoCode(code.toUpperCase());
      setDiscount(discountAmount);

      toast.success(response.message || `Promo code applied! ${response.discountPercent ? `${response.discountPercent}% off` : `$${discountAmount} off`}`);
    } catch (error: any) {
      toast.error(error.message || 'Invalid promo code');
    }
  };

  const handleRemovePromo = () => {
    setPromoCode(undefined);
    setDiscount(0);
    toast.info('Promo code removed');
  };

  const handlePlaceOrder = async () => {
    if (!checkoutState.termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      // First, sync local cart items to backend
      for (const item of items) {
        try {
          await api.addToCart(item.product.id, item.quantity, item.size, item.color);
        } catch (syncError) {
          // Item may already be in cart
        }
      }

      // Fetch backend cart to get cartId
      const backendCart = await api.getCart();
      if (!backendCart || !backendCart.id) {
        console.error('[Checkout] Cart has no ID:', backendCart);
        throw new Error('Cart not found. Please add items to cart again.');
      }

      // Map payment method to backend format
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

      const orderData = {
        cartId: backendCart.id,
        shippingAddress: {
          fullName: checkoutState.shippingInfo.fullName,
          phone: checkoutState.shippingInfo.phone,
          addressLine1: checkoutState.shippingInfo.addressLine1,
          addressLine2: checkoutState.shippingInfo.addressLine2 || '',
          city: checkoutState.shippingInfo.city,
          state: checkoutState.shippingInfo.state,
          postalCode: checkoutState.shippingInfo.zipCode, // Backend expects postalCode
          country: checkoutState.shippingInfo.country,
        },
        paymentMethod: paymentMethodMap[checkoutState.paymentMethod] || 'credit_card',
        customerNote: (checkoutState as any).customerNote || '',
      };

      // Create order via API
      const order = await api.createOrder(orderData);

      // Debug: Log order response - VERY DETAILED
      console.log('========== CHECKOUT DEBUG ==========');
      console.log('[Checkout] Raw order response:', order);
      console.log('[Checkout] Order type:', typeof order);
      console.log('[Checkout] Order keys:', Object.keys(order || {}));
      console.log('[Checkout] order.stripePayment:', order?.stripePayment);
      console.log('[Checkout] order.data:', order?.data);
      console.log('[Checkout] order.data?.stripePayment:', order?.data?.stripePayment);
      console.log('====================================');

      // Handle potential nested response (order might be in order.data)
      const orderData2 = order?.data || order;
      const stripePayment = orderData2?.stripePayment;

      console.log('[Checkout] Resolved orderData:', orderData2);
      console.log('[Checkout] Resolved stripePayment:', stripePayment);

      // Handle Stripe Connect payment - redirect to Stripe Checkout
      if (stripePayment?.checkoutUrl && stripePayment?.useCheckoutSession) {
        console.log('[Checkout] Redirecting to Stripe Checkout:', stripePayment.checkoutUrl);
        toast.info('Redirecting to payment...');

        // Store order info in localStorage for the confirmation page
        localStorage.setItem('pending-order', JSON.stringify({
          orderId: orderData2.id,
          orderNumber: orderData2.orderNumber || orderData2.id,
          sessionId: stripePayment.sessionId,
          shippingInfo: checkoutState.shippingInfo,
          deliveryMethod: checkoutState.deliveryMethod,
          items,
          total: orderData2.total,
        }));

        // Clear cart now since order is created
        clearCart();

        // Clear checkout data
        localStorage.removeItem(STORAGE_KEY);

        // Redirect to Stripe Checkout
        window.location.href = stripePayment.checkoutUrl;
        return;
      }

      // Legacy: Handle PaymentIntent flow (if shop doesn't use Checkout Session)
      if (stripePayment?.clientSecret && !stripePayment?.useCheckoutSession) {
        console.log('[Checkout] Legacy PaymentIntent flow detected');
        toast.info('Processing payment...');

        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Stripe failed to load. Please refresh and try again.');
        }

        const paymentData = (checkoutState as any).paymentData;
        const paymentMethodId = typeof paymentData === 'string'
          ? paymentData
          : paymentData?.paymentMethodId;

        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          order.stripePayment.clientSecret,
          {
            payment_method: paymentMethodId || undefined,
          }
        );

        if (confirmError) {
          console.error('Payment confirmation failed:', confirmError);
          toast.error(`Payment failed: ${confirmError.message}. Your order has been saved but requires payment.`);
          navigate(`/orders/${orderData2.id}`, {
            state: { paymentPending: true },
          });
          return;
        }

        if (paymentIntent?.status === 'succeeded') {
          toast.success('Payment successful!');
          try {
            await apiClient.post(`/orders/${orderData2.id}/confirm-payment`, {
              paymentIntentId: paymentIntent.id,
            });
          } catch (updateError) {
            console.error('Failed to update order payment status:', updateError);
          }
        }
      }

      // Clear cart
      clearCart();

      // Clear checkout data
      localStorage.removeItem(STORAGE_KEY);

      // Navigate to confirmation page with order details
      navigate('/checkout/confirmation', {
        state: {
          orderNumber: orderData2.orderNumber || orderData2.id,
          orderId: orderData2.id,
          shippingInfo: checkoutState.shippingInfo,
          deliveryMethod: checkoutState.deliveryMethod,
          items,
          total: orderData2.total,
        },
      });

      toast.success('Order placed successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place order. Please try again.';
      const errorDetails = error.response?.data;
      console.error('Order placement error:', error);
      console.error('Error details:', errorDetails);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepTitle = () => {
    switch (checkoutState.currentStep) {
      case 1:
        return 'Shipping Information';
      case 2:
        return 'Delivery Method';
      case 3:
        return 'Payment Details';
      case 4:
        return 'Review & Place Order';
      default:
        return 'Checkout';
    }
  };

  const canProceed = () => {
    switch (checkoutState.currentStep) {
      case 1:
        return isFormValid;
      case 2:
        return true; // Delivery method always has a default
      case 3:
        return checkoutState.paymentMethod !== 'card' || isFormValid;
      case 4:
        return checkoutState.termsAccepted;
      default:
        return false;
    }
  };

  const getButtonText = () => {
    if (checkoutState.currentStep === 4) {
      return isProcessing ? 'Processing...' : 'Place Order';
    }
    switch (checkoutState.currentStep) {
      case 1:
        return 'Continue to Delivery';
      case 2:
        return 'Continue to Payment';
      case 3:
        return 'Review Order';
      default:
        return 'Continue';
    }
  };

  // If cart is empty, show empty state
  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Your cart is empty</h2>
            <p className="text-text-secondary mb-6">
              Add some items to your cart before checking out
            </p>
            <Link to="/products">
              <Button size="lg">Browse Products</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb & Security Badge */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/cart"
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary-lime transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Link>

            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <Lock className="w-4 h-4" />
              Secure Checkout
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

          {/* Main Content - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Form Steps (60%) */}
            <div className="lg:col-span-7">
              {/* Step Title */}
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                  {getStepTitle()}
                </h1>
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={checkoutState.currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
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
                          <Loader2 className="w-8 h-8 animate-spin text-primary-lime" />
                          <span className="ml-3 text-text-secondary">Loading delivery options...</span>
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
                        onPaymentMethodChange={(method) =>
                          updateCheckoutState({ paymentMethod: method })
                        }
                        onCardInfoChange={(info) => updateCheckoutState({ cardInfo: info })}
                        onBillingAddressChange={(address) =>
                          updateCheckoutState({ billingAddress: address })
                        }
                        onValidate={setIsFormValid}
                        amount={Math.round((useCartStore.getState().getTotalPrice() - discount) * 100)}
                        onPaymentSuccess={(data) => {
                          // Store payment data for order processing
                          console.log('[CheckoutPage] onPaymentSuccess received:', data);
                          updateCheckoutState({ paymentData: data } as any);
                          console.log('[CheckoutPage] Updated checkoutState with paymentData');
                        }}
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
                        onTermsChange={(accepted) =>
                          updateCheckoutState({ termsAccepted: accepted })
                        }
                        onEdit={goToStep}
                      />
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="mt-6 flex items-center justify-between gap-4">
                    {checkoutState.currentStep > 1 ? (
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                    ) : (
                      <div />
                    )}

                    <Button
                      onClick={checkoutState.currentStep === 4 ? handlePlaceOrder : handleNext}
                      disabled={!canProceed() || isProcessing}
                      size="lg"
                      className="flex items-center gap-2 px-8"
                    >
                      {getButtonText()}
                      {checkoutState.currentStep < 4 && <ArrowRight className="w-4 h-4" />}
                      {checkoutState.currentStep === 4 && isProcessing && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column - Order Summary (40%) */}
            <div className="lg:col-span-5">
              <OrderSummary
                deliveryMethod={checkoutState.deliveryMethod}
                shippingCost={getShippingCost}
                taxRate={getTaxRate}
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

      <Footer />
    </>
  );
};

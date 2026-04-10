import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { StripePaymentForm } from '@/components/payment/StripePaymentForm';
import { PayPalCheckout } from '@/components/payment/PayPalCheckout';
import { ApplePayButton } from '@/components/payment/ApplePayButton';
import { GooglePayButton } from '@/components/payment/GooglePayButton';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import { toast } from 'sonner';
import type { PaymentMethod, CardDetails, BillingAddress, ShippingAddress, CardType, ValidationErrors } from '@/types';

// Stripe publishable key from environment variable
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
const APPLE_PAY_MERCHANT_ID = import.meta.env.VITE_APPLE_PAY_MERCHANT_ID || '';
const GOOGLE_PAY_MERCHANT_ID = import.meta.env.VITE_GOOGLE_PAY_MERCHANT_ID || '';
const GOOGLE_PAY_MERCHANT_NAME = import.meta.env.VITE_GOOGLE_PAY_MERCHANT_NAME || 'Vasty Shop';

interface PaymentFormProps {
  paymentMethod: string;
  cardInfo: CardDetails;
  billingAddress: BillingAddress;
  shippingAddress: ShippingAddress;
  onPaymentMethodChange: (method: string) => void;
  onCardInfoChange: (info: CardDetails) => void;
  onBillingAddressChange: (address: BillingAddress) => void;
  onValidate?: (isValid: boolean) => void;
  onPaymentSuccess?: (data: any) => void;
  amount?: number;
  availablePaymentMethods?: string[];
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentMethod,
  cardInfo,
  billingAddress,
  shippingAddress,
  onPaymentMethodChange,
  onCardInfoChange,
  onBillingAddressChange,
  onValidate,
  onPaymentSuccess,
  amount = 0,
  availablePaymentMethods,
}) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [cardType, setCardType] = useState<CardType>('unknown');
  const [showCVVTooltip, setShowCVVTooltip] = useState(false);
  const [useIntegratedPayments, setUseIntegratedPayments] = useState(true);

  // Detect card type from number
  const detectCardType = (number: string): CardType => {
    const digits = number.replace(/\s/g, '');
    if (/^4/.test(digits)) return 'visa';
    if (/^5[1-5]/.test(digits)) return 'mastercard';
    if (/^3[47]/.test(digits)) return 'amex';
    if (/^6(?:011|5)/.test(digits)) return 'discover';
    return 'unknown';
  };

  // Format card number with spaces
  const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\s/g, '');
    const type = detectCardType(digits);
    setCardType(type);

    // Amex has 4-6-5 format, others have 4-4-4-4
    if (type === 'amex') {
      return digits.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3').trim();
    }
    return digits.replace(/(\d{4})/g, '$1 ').trim();
  };

  // Format expiration date
  const formatExpirationDate = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    }
    return digits;
  };

  // Validation
  const validateCardNumber = (number: string): boolean => {
    const digits = number.replace(/\s/g, '');
    return digits.length >= 13 && digits.length <= 19;
  };

  const validateExpirationDate = (date: string): boolean => {
    const [month, year] = date.split('/');
    if (!month || !year) return false;

    const monthNum = parseInt(month, 10);
    const yearNum = parseInt('20' + year, 10);
    const now = new Date();
    const expiry = new Date(yearNum, monthNum - 1);

    return monthNum >= 1 && monthNum <= 12 && expiry > now;
  };

  const validateCVV = (cvv: string): boolean => {
    const length = cardType === 'amex' ? 4 : 3;
    return cvv.length === length && /^\d+$/.test(cvv);
  };

  const validateForm = (): boolean => {
    // COD and Bank Transfer don't need card validation
    if (paymentMethod === 'cod' || paymentMethod === 'bank' || paymentMethod === 'paypal' || paymentMethod === 'applepay' || paymentMethod === 'googlepay') {
      onValidate?.(true);
      return true;
    }

    // Only validate for card payments
    if (paymentMethod !== 'card') {
      onValidate?.(true);
      return true;
    }

    const newErrors: ValidationErrors = {};

    if (!cardInfo.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCardNumber(cardInfo.cardNumber)) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!cardInfo.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (!cardInfo.expirationDate.trim()) {
      newErrors.expirationDate = 'Expiration date is required';
    } else if (!validateExpirationDate(cardInfo.expirationDate)) {
      newErrors.expirationDate = 'Invalid or expired date';
    }

    if (!cardInfo.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!validateCVV(cardInfo.cvv)) {
      newErrors.cvv = `CVV must be ${cardType === 'amex' ? '4' : '3'} digits`;
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    onValidate?.(isValid);
    return isValid;
  };

  useEffect(() => {
    validateForm();
  }, [cardInfo, paymentMethod]);

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleCardChange = (field: keyof CardDetails, value: any) => {
    onCardInfoChange({
      ...cardInfo,
      [field]: value,
    });
  };

  const handleBillingChange = (field: keyof BillingAddress, value: any) => {
    onBillingAddressChange({
      ...billingAddress,
      [field]: value,
    });
  };

  const showError = (field: keyof ValidationErrors) => {
    return touched[field] && errors[field];
  };

  const getCardIcon = (type: CardType) => {
    const icons: Record<CardType, string> = {
      visa: '💳 VISA',
      mastercard: '💳 MC',
      amex: '💳 AMEX',
      discover: '💳 DISC',
      unknown: '💳',
    };
    return icons[type] || icons.unknown;
  };

  // Handle payment success
  const handlePaymentSuccess = (data: any) => {
    console.log('[PaymentForm] handlePaymentSuccess called with:', data);
    toast.success('Payment method ready');
    if (onPaymentSuccess) {
      console.log('[PaymentForm] Calling onPaymentSuccess with:', data);
      onPaymentSuccess(data);
    }
    if (onValidate) {
      onValidate(true);
    }
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    toast.error(error);
    if (onValidate) {
      onValidate(false);
    }
  };

  // Check if integrated payment components should be used
  const shouldUseIntegratedPayments = () => {
    return useIntegratedPayments && (
      (paymentMethod === 'card' && STRIPE_PUBLISHABLE_KEY) ||
      (paymentMethod === 'paypal' && PAYPAL_CLIENT_ID) ||
      (paymentMethod === 'applepay' && APPLE_PAY_MERCHANT_ID) ||
      (paymentMethod === 'googlepay' && GOOGLE_PAY_MERCHANT_ID)
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {t('checkout.paymentMethodTitle')}
        </h3>
        <p className="text-sm text-text-secondary">
          {t('checkout.allTransactionsSecure')}
        </p>
      </div>

      <PaymentMethodSelector
        selectedMethod={paymentMethod}
        onMethodChange={(method) => onPaymentMethodChange(method)}
        availableMethods={availablePaymentMethods}
      >
        <Tabs value={paymentMethod} onValueChange={(v) => onPaymentMethodChange(v as PaymentMethod)}>
          <TabsList className="hidden">
            <TabsTrigger value="card">Credit Card</TabsTrigger>
            <TabsTrigger value="paypal">PayPal</TabsTrigger>
            <TabsTrigger value="applepay">Apple Pay</TabsTrigger>
            <TabsTrigger value="googlepay">Google Pay</TabsTrigger>
          </TabsList>

        {/* Credit/Debit Card */}
        <TabsContent value="card" className="space-y-6 mt-6">
          {shouldUseIntegratedPayments() && STRIPE_PUBLISHABLE_KEY ? (
            <StripePaymentForm
              publishableKey={STRIPE_PUBLISHABLE_KEY}
              amount={amount}
              currency="usd"
              customerEmail={shippingAddress.email}
              customerName={shippingAddress.fullName}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          ) : (
            <>
              {/* Security Badge */}
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Lock className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {t('checkout.paymentSecure')}
                </span>
              </div>

          {/* Accepted Cards */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-text-secondary">{t('checkout.weAccept')}:</span>
            <div className="flex items-center gap-2">
              {['VISA', 'MC', 'AMEX', 'DISC'].map((card) => (
                <div
                  key={card}
                  className="px-3 py-1.5 border-2 border-gray-200 rounded-lg bg-white text-xs font-bold text-text-primary"
                >
                  {card}
                </div>
              ))}
            </div>
          </div>

          {/* Card Number */}
          <div>
            <Label htmlFor="cardNumber">
              {t('checkout.cardNumber')} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="cardNumber"
                type="text"
                maxLength={cardType === 'amex' ? 17 : 19}
                value={cardInfo.cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  handleCardChange('cardNumber', formatted);
                }}
                onBlur={() => handleBlur('cardNumber')}
                placeholder="1234 5678 9012 3456"
                className={cn(
                  showError('cardNumber') && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              {cardType !== 'unknown' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                  {getCardIcon(cardType)}
                </div>
              )}
            </div>
            {showError('cardNumber') && (
              <p className="text-sm text-red-500 mt-1">{errors.cardNumber}</p>
            )}
          </div>

          {/* Cardholder Name */}
          <div>
            <Label htmlFor="cardholderName">
              {t('checkout.cardholderName')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cardholderName"
              type="text"
              value={cardInfo.cardholderName}
              onChange={(e) => handleCardChange('cardholderName', e.target.value.toUpperCase())}
              onBlur={() => handleBlur('cardholderName')}
              placeholder="NAME AS ON CARD"
              className={cn(
                showError('cardholderName') && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
            {showError('cardholderName') && (
              <p className="text-sm text-red-500 mt-1">{errors.cardholderName}</p>
            )}
          </div>

          {/* Expiration Date & CVV */}
          <div className="grid grid-cols-2 gap-4">
            {/* Expiration Date */}
            <div>
              <Label htmlFor="expirationDate">
                {t('checkout.expirationDate')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="expirationDate"
                type="text"
                maxLength={5}
                value={cardInfo.expirationDate}
                onChange={(e) => {
                  const formatted = formatExpirationDate(e.target.value);
                  handleCardChange('expirationDate', formatted);
                }}
                onBlur={() => handleBlur('expirationDate')}
                placeholder="MM/YY"
                className={cn(
                  showError('expirationDate') && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              {showError('expirationDate') && (
                <p className="text-sm text-red-500 mt-1">{errors.expirationDate}</p>
              )}
            </div>

            {/* CVV */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="cvv">
                  CVV <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setShowCVVTooltip(true)}
                    onMouseLeave={() => setShowCVVTooltip(false)}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  {showCVVTooltip && (
                    <div className="absolute z-10 left-0 bottom-full mb-2 w-48 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                      <p className="mb-1">{t('checkout.cvvTooltip1')}</p>
                      <p>{t('checkout.cvvTooltip2')}</p>
                    </div>
                  )}
                </div>
              </div>
              <Input
                id="cvv"
                type="text"
                maxLength={cardType === 'amex' ? 4 : 3}
                value={cardInfo.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  handleCardChange('cvv', value);
                }}
                onBlur={() => handleBlur('cvv')}
                placeholder={cardType === 'amex' ? '1234' : '123'}
                className={cn(
                  showError('cvv') && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              {showError('cvv') && (
                <p className="text-sm text-red-500 mt-1">{errors.cvv}</p>
              )}
            </div>
          </div>

          {/* Save Card Checkbox */}
          <div className="flex items-start space-x-3 pt-4 border-t">
            <Checkbox
              id="saveCard"
              checked={cardInfo.saveCard}
              onCheckedChange={(checked) => handleCardChange('saveCard', checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="saveCard"
                className="text-sm font-medium text-text-primary cursor-pointer"
              >
                {t('checkout.saveCardFuture')}
              </label>
              <p className="text-sm text-text-secondary">
                {t('checkout.cardSecurelyEncrypted')}
              </p>
            </div>
          </div>

          </>
          )}
        </TabsContent>

        {/* PayPal */}
        <TabsContent value="paypal" className="space-y-4 mt-6">
          {shouldUseIntegratedPayments() && PAYPAL_CLIENT_ID ? (
            <PayPalCheckout
              clientId={PAYPAL_CLIENT_ID}
              amount={amount}
              currency="USD"
              description="Order payment"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          ) : (
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">💙</span>
              </div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">
                {t('checkout.payWithPaypal')}
              </h4>
              <p className="text-sm text-text-secondary mb-6">
                {t('checkout.paypalRedirect')}
              </p>
              <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                <span className="font-bold">Pay</span>
                <span className="font-bold text-blue-700">Pal</span>
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Apple Pay */}
        <TabsContent value="applepay" className="space-y-4 mt-6">
          {shouldUseIntegratedPayments() && APPLE_PAY_MERCHANT_ID ? (
            <ApplePayButton
              merchantId={APPLE_PAY_MERCHANT_ID}
              amount={amount}
              currency="USD"
              countryCode="US"
              description="Order payment"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          ) : (
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
                <span className="text-3xl">🍎</span>
              </div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">
                {t('checkout.payWithApplePay')}
              </h4>
              <p className="text-sm text-text-secondary mb-6">
                {t('checkout.applePayDesc')}
              </p>
              <Button className="bg-black hover:bg-gray-900 text-white">
                <span className="mr-2">🍎</span> Pay
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Google Pay */}
        <TabsContent value="googlepay" className="space-y-4 mt-6">
          {shouldUseIntegratedPayments() && GOOGLE_PAY_MERCHANT_ID ? (
            <GooglePayButton
              merchantId={GOOGLE_PAY_MERCHANT_ID}
              merchantName={GOOGLE_PAY_MERCHANT_NAME}
              gatewayMerchantId={STRIPE_PUBLISHABLE_KEY}
              amount={amount}
              currency="USD"
              countryCode="US"
              description="Order payment"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              environment="TEST"
            />
          ) : (
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">G</span>
              </div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">
                {t('checkout.payWithGooglePay')}
              </h4>
              <p className="text-sm text-text-secondary mb-6">
                {t('checkout.googlePayDesc')}
              </p>
              <Button className="bg-white border-2 border-gray-300 text-gray-800 hover:bg-gray-50">
                <span className="mr-2">G</span> Pay
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Cash on Delivery */}
        <TabsContent value="cod" className="space-y-4 mt-6">
          <div className="p-8 border-2 border-dashed border-green-300 rounded-lg text-center bg-green-50">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">💵</span>
            </div>
            <h4 className="text-lg font-semibold text-text-primary mb-2">
              {t('checkout.codTitle')}
            </h4>
            <p className="text-sm text-text-secondary mb-4">
              {t('checkout.codDesc')}
            </p>
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <ul className="text-sm text-left text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {t('checkout.codBenefit1')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {t('checkout.codBenefit2')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {t('checkout.codBenefit3')}
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>

        {/* Bank Transfer */}
        <TabsContent value="bank" className="space-y-4 mt-6">
          <div className="p-8 border-2 border-dashed border-blue-300 rounded-lg text-center bg-blue-50">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🏦</span>
            </div>
            <h4 className="text-lg font-semibold text-text-primary mb-2">
              {t('checkout.bankTransferTitle')}
            </h4>
            <p className="text-sm text-text-secondary mb-4">
              {t('checkout.bankTransferDesc')}
            </p>
            <div className="p-4 bg-white rounded-lg border border-blue-200 text-left">
              <p className="text-sm text-gray-600 mb-3">
                {t('checkout.bankTransferInfo')}
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  {t('checkout.bankTransferBenefit1')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  {t('checkout.bankTransferBenefit2')}
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      </PaymentMethodSelector>

      {/* Billing Address - Shows for all payment methods */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="text-base font-semibold text-text-primary mb-4">
          {t('checkout.billingAddress')}
        </h4>

        <div className="flex items-start space-x-3 mb-4">
          <Checkbox
            id="sameAsShippingMain"
            checked={billingAddress.sameAsShipping}
            onCheckedChange={(checked) => handleBillingChange('sameAsShipping', checked)}
          />
          <label
            htmlFor="sameAsShippingMain"
            className="text-sm font-medium text-text-primary cursor-pointer"
          >
            {t('checkout.sameAsShippingAddress')}
          </label>
        </div>

        {!billingAddress.sameAsShipping && (
          <div className="space-y-4 pl-8">
            <Input
              placeholder={`${t('checkout.fullName')} *`}
              value={billingAddress.fullName || ''}
              onChange={(e) => handleBillingChange('fullName', e.target.value)}
            />
            <Input
              placeholder={`${t('checkout.addressLine1')} *`}
              value={billingAddress.addressLine1 || ''}
              onChange={(e) => handleBillingChange('addressLine1', e.target.value)}
            />
            <Input
              placeholder={t('checkout.addressLine2')}
              value={billingAddress.addressLine2 || ''}
              onChange={(e) => handleBillingChange('addressLine2', e.target.value)}
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder={`${t('checkout.city')} *`}
                value={billingAddress.city || ''}
                onChange={(e) => handleBillingChange('city', e.target.value)}
              />
              <Input
                placeholder={`${t('checkout.state')} *`}
                value={billingAddress.state || ''}
                onChange={(e) => handleBillingChange('state', e.target.value)}
              />
              <Input
                placeholder={`${t('checkout.postalCode')} *`}
                value={billingAddress.zipCode || ''}
                onChange={(e) => handleBillingChange('zipCode', e.target.value)}
              />
            </div>
            <Input
              placeholder={`${t('checkout.country')} *`}
              value={billingAddress.country || ''}
              onChange={(e) => handleBillingChange('country', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* PCI Compliance Notice */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">{t('checkout.pciCompliant')}</p>
            <p className="text-gray-600">
              {t('checkout.pciCompliantDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

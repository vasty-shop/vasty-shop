import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, MapPin, Truck, CreditCard, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/useCartStore';
import { Link } from 'react-router-dom';
import type { ShippingAddress, DeliveryMethod, PaymentMethod, CardDetails } from '@/types';

interface OrderReviewProps {
  shippingInfo: ShippingAddress;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  cardInfo?: CardDetails;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  onEdit: (step: 1 | 2 | 3) => void;
}

export const OrderReview: React.FC<OrderReviewProps> = ({
  shippingInfo,
  deliveryMethod,
  paymentMethod,
  cardInfo,
  termsAccepted,
  onTermsChange,
  onEdit,
}) => {
  const { t } = useTranslation();
  const items = useCartStore((state) => state.items);

  const getDeliveryName = (method: DeliveryMethod): string => {
    const names: Record<DeliveryMethod, string> = {
      standard: `${t('checkout.standardShipping')} (${t('checkout.businessDaysRange', { min: 5, max: 7 })})`,
      express: `${t('checkout.expressShipping')} (${t('checkout.businessDaysRange', { min: 2, max: 3 })})`,
      overnight: `${t('checkout.overnightShipping')} (${t('checkout.nextBusinessDay')})`,
    };
    return names[method] || method;
  };

  const getPaymentMethodName = (method: PaymentMethod): string => {
    const names: Record<PaymentMethod, string> = {
      card: t('checkout.creditCard'),
      paypal: t('checkout.paypal'),
      applepay: t('checkout.payWithApplePay'),
      googlepay: t('checkout.payWithGooglePay'),
    };
    return names[method] || method;
  };

  const formatCardNumber = (number: string) => {
    const digits = number.replace(/\s/g, '');
    return `•••• •••• •••• ${digits.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {t('checkout.reviewYourOrder')}
        </h3>
        <p className="text-sm text-text-secondary">
          {t('checkout.reviewOrderDesc')}
        </p>
      </div>

      {/* Order Items */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-semibold text-text-primary">
            {t('checkout.orderItems')} ({items.length})
          </h4>
        </div>

        <div className="space-y-4">
          {items.map((item) => {
            const price = item.product.salePrice || item.product.price;
            const hasDiscount = item.product.salePrice && item.product.salePrice < item.product.price;

            return (
              <div key={`${item.product.id}-${item.size}`} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-text-primary mb-1 line-clamp-2">
                    {item.product.name}
                  </h5>
                  <p className="text-sm text-text-secondary mb-2">
                    {item.product.brand}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-text-secondary">
                      <span>{t('product.size')}: {item.size}</span>
                      {item.color && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{t('product.color')}: {item.color}</span>
                        </>
                      )}
                      <span className="mx-2">•</span>
                      <span>{t('common.qty')}: {item.quantity}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-text-primary">
                        {formatPrice(price * item.quantity)}
                      </div>
                      {hasDiscount && (
                        <div className="text-xs text-text-secondary line-through">
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Shipping Address */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-lime" />
            <h4 className="text-base font-semibold text-text-primary">
              {t('checkout.shippingAddress')}
            </h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(1)}
            className="text-primary-lime hover:text-primary-lime-dark"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            {t('common.edit')}
          </Button>
        </div>

        <div className="text-sm text-text-secondary space-y-1">
          <p className="font-medium text-text-primary">{shippingInfo.fullName}</p>
          <p>{shippingInfo.addressLine1}</p>
          {shippingInfo.addressLine2 && <p>{shippingInfo.addressLine2}</p>}
          <p>
            {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
          </p>
          <p>{shippingInfo.country}</p>
          <p className="pt-2">{shippingInfo.email}</p>
          <p>{shippingInfo.phone}</p>
        </div>
      </Card>

      {/* Delivery Method */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary-lime" />
            <h4 className="text-base font-semibold text-text-primary">
              {t('checkout.shippingMethod')}
            </h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(2)}
            className="text-primary-lime hover:text-primary-lime-dark"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            {t('common.edit')}
          </Button>
        </div>

        <p className="text-sm text-text-secondary">
          {getDeliveryName(deliveryMethod)}
        </p>
      </Card>

      {/* Payment Method */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-lime" />
            <h4 className="text-base font-semibold text-text-primary">
              {t('checkout.paymentMethod')}
            </h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(3)}
            className="text-primary-lime hover:text-primary-lime-dark"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            {t('common.edit')}
          </Button>
        </div>

        <div className="text-sm text-text-secondary space-y-1">
          <p className="font-medium text-text-primary">
            {getPaymentMethodName(paymentMethod)}
          </p>
          {paymentMethod === 'card' && cardInfo && cardInfo.cardNumber && (
            <>
              <p>{formatCardNumber(cardInfo.cardNumber)}</p>
              <p className="capitalize">{cardInfo.cardholderName}</p>
            </>
          )}
        </div>
      </Card>

      {/* Terms & Conditions */}
      <Card className="p-6 bg-gray-50">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => onTermsChange(!!checked)}
            className="mt-1"
          />
          <div className="flex-1">
            <label
              htmlFor="terms"
              className="text-sm font-medium text-text-primary cursor-pointer block mb-2"
            >
              {t('checkout.agreeTerms')}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <p className="text-xs text-text-secondary mb-3">
              {t('checkout.agreeTermsDesc')}
            </p>
            <div className="flex gap-3">
              <Link
                to="/terms"
                target="_blank"
                className="text-xs text-primary-lime hover:text-primary-lime-dark font-medium underline"
              >
                {t('checkout.readTerms')}
              </Link>
              <Link
                to="/privacy"
                target="_blank"
                className="text-xs text-primary-lime hover:text-primary-lime-dark font-medium underline"
              >
                {t('checkout.readPrivacy')}
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Order Policies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
            <Truck className="w-6 h-6 text-green-600" />
          </div>
          <h5 className="text-sm font-semibold text-text-primary mb-1">
            {t('checkout.freeReturns')}
          </h5>
          <p className="text-xs text-text-secondary">
            {t('checkout.returnPolicy')}
          </p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
            <Tag className="w-6 h-6 text-blue-600" />
          </div>
          <h5 className="text-sm font-semibold text-text-primary mb-1">
            {t('checkout.priceMatch')}
          </h5>
          <p className="text-xs text-text-secondary">
            {t('checkout.priceMatchDesc')}
          </p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-purple-600" />
          </div>
          <h5 className="text-sm font-semibold text-text-primary mb-1">
            {t('checkout.secureCheckout')}
          </h5>
          <p className="text-xs text-text-secondary">
            {t('checkout.sslEncrypted')}
          </p>
        </Card>
      </div>

    </div>
  );
};

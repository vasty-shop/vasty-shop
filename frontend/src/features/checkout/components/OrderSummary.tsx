import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Truck, Shield, Lock, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { api } from '@/lib/api';
import { useCartStore } from '@/stores/useCartStore';

interface OrderSummaryProps {
  deliveryMethod: string;
  shippingCost?: number;
  taxRate?: number;
  promoCode?: string;
  discount?: number;
  onApplyPromo?: (code: string) => void;
  onRemovePromo?: () => void;
  sticky?: boolean;
}

// Fallback prices for legacy delivery methods
const deliveryPrices: Record<string, number> = {
  standard: 0,
  express: 15.00,
  overnight: 35.00,
};

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  deliveryMethod,
  shippingCost: customShippingCost,
  taxRate: customTaxRate,
  promoCode: appliedPromoCode,
  discount: appliedDiscount = 0,
  onApplyPromo,
  onRemovePromo,
  sticky = true,
}) => {
  const { t } = useTranslation();
  const [promoCode, setPromoCode] = useState('');
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const subtotal = useCartStore((state) => state.getTotalPrice());

  // Use custom shipping cost if provided, otherwise use fallback
  const shipping = customShippingCost !== undefined
    ? customShippingCost
    : (deliveryPrices[deliveryMethod] ?? 0);
  const discount = appliedDiscount;

  // Calculate tax per product (product tax if set, else shop default)
  const shopTaxRate = customTaxRate !== undefined ? customTaxRate : 0;
  const tax = items.reduce((sum, item) => {
    const price = item.product.salePrice || item.product.price;
    const itemTotal = price * item.quantity;
    // Use product's tax rate if set (> 0), otherwise use shop default
    const productTaxRate = (item.product as any)?.taxRate || (item.product as any)?.tax_rate || 0;
    const effectiveTaxRate = productTaxRate > 0 ? productTaxRate : shopTaxRate;
    return sum + (itemTotal * (effectiveTaxRate / 100));
  }, 0);

  // Calculate effective tax rate for display
  const taxPercent = subtotal > 0 ? (tax / subtotal) * 100 : shopTaxRate;
  const total = subtotal - discount + shipping + tax;

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !onApplyPromo) return;

    setIsPromoLoading(true);
    try {
      // Validate promo code with API
      await api.validatePromoCode(promoCode.trim());
      onApplyPromo(promoCode);
      setPromoCode('');
    } catch (error) {
      console.error('Invalid promo code:', error);
    } finally {
      setIsPromoLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Version - Collapsible */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t-2 border-gray-200 shadow-lg">
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary">{t('checkout.orderTotal')}</span>
              <span className="text-xl font-bold text-primary-lime">
                {formatPrice(total)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-lime font-medium">
              {t('checkout.viewDetails')}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
          </button>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary">{t('cart.orderSummary')}</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-4">
              {items.map((item) => {
                const price = item.product.salePrice || item.product.price;
                return (
                  <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-text-primary line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-text-secondary">
                        {t('product.size')}: {item.size} • {t('common.qty')}: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-text-primary mt-1">
                        {formatPrice(price * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">{t('checkout.subtotalItems', { count: totalItems })}</span>
                <span className="font-medium text-text-primary">{formatPrice(subtotal)}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">{t('common.discount')}</span>
                  <span className="font-medium text-green-600">-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">{t('common.shipping')}</span>
                <span className="font-medium text-text-primary">
                  {shipping === 0 ? t('common.free') : formatPrice(shipping)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">{t('common.tax')}</span>
                <span className="font-medium text-text-primary">{formatPrice(tax)}</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t-2">
                <span className="text-base font-bold text-text-primary">{t('common.total')}</span>
                <span className="text-xl font-bold text-primary-lime">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Version - Sticky Sidebar */}
      <div className={`hidden lg:block ${sticky ? 'sticky top-24' : ''}`}>
        <Card className="p-6">
          <h2 className="text-xl font-bold text-text-primary mb-6">{t('cart.orderSummary')}</h2>

          {/* Order Items */}
          <div className="max-h-60 overflow-y-auto space-y-4 mb-6 pr-2">
            {items.map((item) => {
              const price = item.product.salePrice || item.product.price;
              return (
                <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-text-primary line-clamp-2 mb-1">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-text-secondary mb-2">
                      {item.product.brand}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary">
                        {t('product.size')}: {item.size} • {t('common.qty')}: {item.quantity}
                      </span>
                      <span className="text-sm font-semibold text-text-primary">
                        {formatPrice(price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Promo Code */}
          {onApplyPromo && (
            <div className="mb-6 pb-6 border-b">
              <label className="text-sm font-medium text-text-primary mb-2 block">
                {t('cart.promoCode')}
              </label>
              {appliedPromoCode ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {appliedPromoCode}
                    </span>
                  </div>
                  <button
                    onClick={onRemovePromo}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    {t('common.remove')}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <Input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder={t('cart.enterCode')}
                      className="pl-10"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyPromo();
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleApplyPromo}
                    disabled={!promoCode.trim() || isPromoLoading}
                    size="sm"
                    className="px-4"
                  >
                    {isPromoLoading ? t('cart.applying') : t('common.apply')}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Price Breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{t('checkout.subtotalItems', { count: totalItems })}</span>
              <span className="font-medium text-text-primary">{formatPrice(subtotal)}</span>
            </div>

            {appliedDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">{t('common.discount')} ({appliedPromoCode})</span>
                <span className="font-medium text-green-600">-{formatPrice(discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{t('common.shipping')}</span>
              <span className="font-medium text-text-primary">
                {shipping === 0 ? (
                  <span className="text-green-600 font-semibold">{t('common.free')}</span>
                ) : (
                  formatPrice(shipping)
                )}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{t('checkout.taxPercent', { percent: taxPercent })}</span>
              <span className="font-medium text-text-primary">{formatPrice(tax)}</span>
            </div>

            <div className="border-t-2 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-text-primary">{t('common.total')}</span>
                <span className="text-2xl font-bold text-primary-lime">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="pt-6 border-t space-y-3">
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <Lock className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>{t('checkout.secureSSL')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <Truck className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>{t('checkout.freeShippingOver')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>{t('checkout.satisfactionGuarantee')}</span>
            </div>
          </div>
        </Card>

        {/* Help Section */}
        <Card className="mt-4 p-4 bg-gradient-to-br from-primary-lime/10 to-primary-lime/5 border-primary-lime/20">
          <h3 className="text-sm font-semibold text-text-primary mb-2">
            {t('checkout.needHelp')}
          </h3>
          <p className="text-xs text-text-secondary mb-3">
            {t('checkout.customerServiceHelp')}
          </p>
          <Button variant="outline" size="sm" className="w-full border-primary-lime text-primary-lime hover:bg-primary-lime hover:text-white">
            {t('checkout.contactSupport')}
          </Button>
        </Card>
      </div>
    </>
  );
};

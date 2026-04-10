import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Zap, Clock, Package } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { Card } from '@/components/ui/card';

// Delivery method type
export interface DeliveryMethodOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays: number;
  freeShippingThreshold?: number;
  enabled?: boolean;
}

interface DeliveryOptionsProps {
  selectedMethod: string;
  onSelect: (methodId: string) => void;
  options?: DeliveryMethodOption[];
  currency?: string;
}

// Calculate delivery dates
const getDeliveryDate = (businessDays: number): string => {
  const today = new Date();
  let addedDays = 0;
  let currentDate = new Date(today);

  while (addedDays < businessDays) {
    currentDate.setDate(currentDate.getDate() + 1);
    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      addedDays++;
    }
  }

  return currentDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Default delivery options (fallback)
const DEFAULT_DELIVERY_OPTIONS: DeliveryMethodOption[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Free standard delivery to your doorstep',
    price: 0,
    estimatedDays: 7,
    freeShippingThreshold: 50,
    enabled: true,
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: 'Faster delivery for urgent orders',
    price: 15.00,
    estimatedDays: 3,
    enabled: true,
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Get your order tomorrow',
    price: 35.00,
    estimatedDays: 1,
    enabled: true,
  },
];

export const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({
  selectedMethod,
  onSelect,
  options,
  currency = 'USD',
}) => {
  const { t, i18n } = useTranslation();

  // Use provided options or fallback to defaults
  const deliveryOptions = (options && options.length > 0)
    ? options.filter(opt => opt.enabled !== false)
    : DEFAULT_DELIVERY_OPTIONS;

  const getIcon = (option: DeliveryMethodOption) => {
    const days = option.estimatedDays;
    if (days <= 1) return Zap;
    if (days <= 3) return Clock;
    if (days <= 5) return Package;
    return Truck;
  };

  const getDurationText = (days: number): string => {
    if (days === 1) return t('checkout.nextBusinessDay');
    if (days <= 2) return t('checkout.businessDays', { days });
    return t('checkout.businessDaysRange', { min: days - 2, max: days });
  };

  // Get localized delivery date
  const getDeliveryDateLocalized = (businessDays: number): string => {
    const today = new Date();
    let addedDays = 0;
    let currentDate = new Date(today);

    while (addedDays < businessDays) {
      currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        addedDays++;
      }
    }

    return currentDate.toLocaleDateString(i18n.language, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {t('checkout.chooseDeliveryMethod')}
        </h3>
        <p className="text-sm text-text-secondary">
          {t('checkout.selectShippingSpeed')}
        </p>
      </div>

      <div className="space-y-3">
        {deliveryOptions.map((option) => {
          const Icon = getIcon(option);
          const isSelected = selectedMethod === option.id;
          const isFree = option.price === 0;

          return (
            <Card
              key={option.id}
              className={cn(
                "p-5 cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected
                  ? "border-2 border-primary-lime bg-primary-lime/5 shadow-md ring-2 ring-primary-lime/20"
                  : "border-2 border-gray-200 hover:border-primary-lime/50"
              )}
              onClick={() => onSelect(option.id)}
            >
              <div className="flex items-start gap-4">
                {/* Radio Button */}
                <div className="flex-shrink-0 pt-1">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? "border-primary-lime bg-primary-lime"
                        : "border-gray-300 bg-white"
                    )}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
                    isSelected
                      ? "bg-primary-lime text-white"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h4 className="text-base font-semibold text-text-primary">
                      {option.name}
                    </h4>
                    <div className="flex-shrink-0">
                      {isFree ? (
                        <span className="text-base font-bold text-green-600">
                          {t('checkout.freeShipping')}
                        </span>
                      ) : (
                        <span className="text-base font-bold text-text-primary">
                          {formatPrice(option.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {option.description && (
                    <p className="text-sm text-text-secondary mb-2">
                      {option.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium text-text-primary">
                      {getDurationText(option.estimatedDays)}
                    </span>
                    <span className="text-text-secondary">•</span>
                    <span className="text-text-secondary">
                      {t('checkout.arrivesBy')} <span className="font-medium text-text-primary">{getDeliveryDateLocalized(option.estimatedDays)}</span>
                    </span>
                  </div>

                  {/* Special badges */}
                  {isFree && option.freeShippingThreshold && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t('checkout.freeOnOrdersOver', { amount: option.freeShippingThreshold })}
                      </span>
                    </div>
                  )}

                  {option.estimatedDays === 1 && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {t('checkout.orderWithinHours')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Delivery Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-blue-900 mb-1">
              {t('checkout.deliveryInformation')}
            </h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t('checkout.deliveryInfo1')}</li>
              <li>• {t('checkout.deliveryInfo2')}</li>
              <li>• {t('checkout.deliveryInfo3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ProductInfo Component
 *
 * Comprehensive product information and selector components
 * Features: breadcrumbs, category badge, price, rating, delivery timer,
 * size/color selectors, quantity selector, action buttons, and info accordions
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ChevronLeft,
  Heart,
  Share2,
  Star,
  Clock,
  Package,
  Truck,
  Calendar,
  Ruler,
  Shirt,
  Info,
} from 'lucide-react';
import type { Product, Size } from '@/types/product';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface DeliveryInfo {
  cutoffTime: Date; // Cutoff time for next day delivery
  estimatedDeliveryStart: string; // e.g., "10 October 2024"
  estimatedDeliveryEnd: string; // e.g., "12 October 2024"
  deliveryDays: string; // e.g., "3-4 Working Days"
  packageType: string; // e.g., "Regular Package"
}

export interface ColorOption {
  name: string;
  hexCode: string;
  available: boolean;
}

export interface SizeAvailability {
  size: Size;
  available: boolean;
  stockCount?: number;
}

export interface MaterialInfo {
  fabric: string;
  composition: string[];
  careInstructions: string[];
}

export interface FitInfo {
  fit: string;
  modelHeight: string;
  modelSize: string;
  sizeGuideUrl?: string;
}

export interface ProductInfoData {
  product: Product;
  stockStatus: StockStatus;
  stockCount?: number;
  reviewCount: number;
  deliveryInfo: DeliveryInfo;
  colors?: ColorOption[];
  sizeAvailability: SizeAvailability[];
  materialInfo?: MaterialInfo;
  fitInfo?: FitInfo;
  description?: string;
}

export interface ProductInfoProps {
  data: ProductInfoData;
  selectedSize?: Size;
  selectedColor?: string;
  quantity?: number;
  isWishlisted?: boolean;
  onSizeSelect?: (size: Size) => void;
  onColorSelect?: (color: string) => void;
  onQuantityChange?: (quantity: number) => void;
  onAddToCart?: () => void;
  onWishlistToggle?: () => void;
  onShare?: () => void;
  onBack?: () => void;
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

function calculateTimeRemaining(cutoffTime: Date): {
  hours: number;
  minutes: number;
  seconds: number;
  isUrgent: boolean;
} {
  const now = new Date();
  const diff = cutoffTime.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isUrgent: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const isUrgent = hours < 1;

  return { hours, minutes, seconds, isUrgent };
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

function getStockStatusText(status: StockStatus, count?: number): {
  text: string;
  color: string;
} {
  switch (status) {
    case 'in_stock':
      return { text: 'In Stock', color: 'text-green-600' };
    case 'low_stock':
      return {
        text: count ? `Only ${count} left in stock` : 'Low Stock',
        color: 'text-orange-600',
      };
    case 'out_of_stock':
      return { text: 'Out of Stock', color: 'text-red-600' };
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

interface BreadcrumbProps {
  onBack?: () => void;
}

function Breadcrumb({ onBack }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 hover:text-text-primary transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Home</span>
      </button>
      <span>/</span>
      <span className="text-text-primary">Product details</span>
    </div>
  );
}

interface ProductHeaderProps {
  product: Product;
  category: string;
  reviewCount: number;
  stockStatus: StockStatus;
  stockCount?: number;
}

function ProductHeader({
  product,
  category,
  reviewCount,
  stockStatus,
  stockCount,
}: ProductHeaderProps) {
  const stockInfo = getStockStatusText(stockStatus, stockCount);
  const currentPrice = product.salePrice || product.price;
  const hasDiscount = !!product.salePrice;

  return (
    <div className="space-y-3">
      {/* Category Badge */}
      <Badge
        variant="outline"
        className="bg-gray-100 text-text-primary border-gray-200"
      >
        {category}
      </Badge>

      {/* Product Title */}
      <h1 className="text-3xl font-bold text-text-primary">{product.name}</h1>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-text-primary">
          {formatPrice(currentPrice)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-xl text-text-secondary line-through">
              {formatPrice(product.price)}
            </span>
            {product.discountPercent && (
              <Badge variant="sale" className="text-sm">
                -{product.discountPercent}%
              </Badge>
            )}
          </>
        )}
      </div>

      {/* Rating & Reviews */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-text-primary">
            {(Number(product.rating) || 0).toFixed(1)}
          </span>
        </div>
        <span className="text-text-secondary">({reviewCount} reviews)</span>
      </div>

      {/* Stock Status */}
      <div className={cn('font-medium', stockInfo.color)}>
        {stockInfo.text}
      </div>
    </div>
  );
}

interface DeliveryTimerProps {
  deliveryInfo: DeliveryInfo;
}

function DeliveryTimer({ deliveryInfo }: DeliveryTimerProps) {
  const [timeRemaining, setTimeRemaining] = React.useState(() =>
    calculateTimeRemaining(deliveryInfo.cutoffTime)
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deliveryInfo.cutoffTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [deliveryInfo.cutoffTime]);

  const { hours, minutes, seconds, isUrgent } = timeRemaining;

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-4 rounded-lg border transition-colors',
        isUrgent
          ? 'bg-orange-50 border-orange-200'
          : 'bg-blue-50 border-blue-200'
      )}
    >
      <Clock
        className={cn('w-5 h-5', isUrgent ? 'text-orange-600' : 'text-blue-600')}
      />
      <div className="flex-1">
        <span className={cn('font-medium', isUrgent ? 'text-orange-900' : 'text-blue-900')}>
          Order in{' '}
          <span className="tabular-nums">
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:
            {String(seconds).padStart(2, '0')}
          </span>
        </span>
        <span className={cn('ml-1', isUrgent ? 'text-orange-700' : 'text-blue-700')}>
          to get next day delivery
        </span>
      </div>
    </div>
  );
}

interface SizeSelectorProps {
  sizes: SizeAvailability[];
  selectedSize?: Size;
  onSizeSelect?: (size: Size) => void;
  onSizeGuideClick?: () => void;
}

function SizeSelector({
  sizes,
  selectedSize,
  onSizeSelect,
  onSizeGuideClick,
}: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-text-primary">
          Select Size
        </label>
        {onSizeGuideClick && (
          <button
            onClick={onSizeGuideClick}
            className="text-sm text-text-secondary hover:text-text-primary underline transition-colors"
          >
            Size Guide
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map(({ size, available, stockCount }) => {
          const isSelected = selectedSize === size;
          return (
            <button
              key={size}
              onClick={() => available && onSizeSelect?.(size)}
              disabled={!available}
              className={cn(
                'min-w-[60px] px-4 py-2.5 rounded-lg border-2 font-medium text-sm transition-all',
                'hover:scale-105 active:scale-95',
                isSelected
                  ? 'bg-card-black text-white border-card-black'
                  : available
                  ? 'bg-white text-text-primary border-gray-200 hover:border-gray-400'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
              )}
              title={!available ? 'Out of stock' : stockCount ? `${stockCount} in stock` : undefined}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ColorSelectorProps {
  colors: ColorOption[];
  selectedColor?: string;
  onColorSelect?: (color: string) => void;
}

function ColorSelector({
  colors,
  selectedColor,
  onColorSelect,
}: ColorSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-text-primary">
        Select Color
        {selectedColor && (
          <span className="ml-2 font-normal text-text-secondary">
            {selectedColor}
          </span>
        )}
      </label>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const isSelected = selectedColor === color.name;
          return (
            <button
              key={color.name}
              onClick={() => color.available && onColorSelect?.(color.name)}
              disabled={!color.available}
              className={cn(
                'w-10 h-10 rounded-full border-2 transition-all',
                'hover:scale-110 active:scale-95',
                isSelected
                  ? 'border-card-black ring-2 ring-offset-2 ring-card-black'
                  : 'border-gray-300 hover:border-gray-500',
                !color.available && 'opacity-40 cursor-not-allowed'
              )}
              style={{ backgroundColor: color.hexCode }}
              title={color.name}
            />
          );
        })}
      </div>
    </div>
  );
}

interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

function QuantitySelector({
  value,
  min = 1,
  max = 99,
  onChange,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange?.(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange?.(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange?.(newValue);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-text-primary">Quantity</label>
      <div className="flex items-center gap-0 w-fit border-2 border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          className={cn(
            'px-4 py-2.5 font-semibold text-lg transition-colors',
            'hover:bg-gray-100 active:bg-gray-200',
            value <= min && 'opacity-40 cursor-not-allowed'
          )}
        >
          -
        </button>
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          className="w-16 text-center font-semibold text-lg border-x-2 border-gray-200 focus:outline-none"
        />
        <button
          onClick={handleIncrement}
          disabled={value >= max}
          className={cn(
            'px-4 py-2.5 font-semibold text-lg transition-colors',
            'hover:bg-gray-100 active:bg-gray-200',
            value >= max && 'opacity-40 cursor-not-allowed'
          )}
        >
          +
        </button>
      </div>
    </div>
  );
}

interface ActionButtonsProps {
  isWishlisted?: boolean;
  onAddToCart?: () => void;
  onWishlistToggle?: () => void;
  onShare?: () => void;
  disabled?: boolean;
}

function ActionButtons({
  isWishlisted,
  onAddToCart,
  onWishlistToggle,
  onShare,
  disabled,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-3">
      <Button
        onClick={onAddToCart}
        disabled={disabled}
        variant="secondary"
        size="lg"
        className="flex-1"
      >
        Add to Cart
      </Button>
      <Button
        onClick={onWishlistToggle}
        variant="outline"
        size="lg"
        className={cn(
          'px-4',
          isWishlisted && 'bg-red-50 border-red-200 hover:bg-red-100'
        )}
      >
        <Heart
          className={cn(
            'w-5 h-5',
            isWishlisted && 'fill-red-500 text-red-500'
          )}
        />
      </Button>
      {onShare && (
        <Button onClick={onShare} variant="outline" size="lg" className="px-4">
          <Share2 className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

interface ProductAccordionsProps {
  description?: string;
  deliveryInfo: DeliveryInfo;
  materialInfo?: MaterialInfo;
  fitInfo?: FitInfo;
}

function ProductAccordions({
  description,
  deliveryInfo,
  materialInfo,
  fitInfo,
}: ProductAccordionsProps) {
  return (
    <Accordion type="multiple" className="w-full">
      {/* Description & Fit */}
      {description && (
        <AccordionItem value="description">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Description & Fit
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 text-text-secondary">
              <p>{description}</p>
              {fitInfo && (
                <div className="space-y-2">
                  <p className="font-medium text-text-primary">Fit Information:</p>
                  <ul className="space-y-1 text-sm">
                    <li>Fit: {fitInfo.fit}</li>
                    <li>Model Height: {fitInfo.modelHeight}</li>
                    <li>Model is wearing size: {fitInfo.modelSize}</li>
                  </ul>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Shipping */}
      <AccordionItem value="shipping">
        <AccordionTrigger className="text-base font-semibold">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Shipping
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary-lime mt-0.5" />
              <div>
                <p className="font-medium text-text-primary">Delivery Date</p>
                <p className="text-sm text-text-secondary">
                  Deliver by {deliveryInfo.estimatedDeliveryStart} - {deliveryInfo.estimatedDeliveryEnd}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-primary-lime mt-0.5" />
              <div>
                <p className="font-medium text-text-primary">Package Type</p>
                <p className="text-sm text-text-secondary">{deliveryInfo.packageType}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-primary-lime mt-0.5" />
              <div>
                <p className="font-medium text-text-primary">Delivery Time</p>
                <p className="text-sm text-text-secondary">{deliveryInfo.deliveryDays}</p>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Material & Care */}
      {materialInfo && (
        <AccordionItem value="material">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center gap-2">
              <Shirt className="w-5 h-5" />
              Material & Care
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-text-primary mb-2">Fabric:</p>
                <p className="text-sm text-text-secondary">{materialInfo.fabric}</p>
              </div>
              <div>
                <p className="font-medium text-text-primary mb-2">Composition:</p>
                <ul className="space-y-1 text-sm text-text-secondary">
                  {materialInfo.composition.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-text-primary mb-2">Care Instructions:</p>
                <ul className="space-y-1 text-sm text-text-secondary">
                  {materialInfo.careInstructions.map((instruction, index) => (
                    <li key={index}>• {instruction}</li>
                  ))}
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Size & Fit */}
      {fitInfo && (
        <AccordionItem value="size-fit">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Size & Fit
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-text-secondary">
              <p className="text-sm">
                <strong className="text-text-primary">Fit Type:</strong> {fitInfo.fit}
              </p>
              <p className="text-sm">
                <strong className="text-text-primary">Model Measurements:</strong>
              </p>
              <ul className="space-y-1 text-sm">
                <li>• Height: {fitInfo.modelHeight}</li>
                <li>• Wearing Size: {fitInfo.modelSize}</li>
              </ul>
              {fitInfo.sizeGuideUrl && (
                <a
                  href={fitInfo.sizeGuideUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-primary-lime hover:text-primary-lime-dark underline"
                >
                  View Full Size Guide
                </a>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProductInfo({
  data,
  selectedSize,
  selectedColor,
  quantity = 1,
  isWishlisted = false,
  onSizeSelect,
  onColorSelect,
  onQuantityChange,
  onAddToCart,
  onWishlistToggle,
  onShare,
  onBack,
  className,
}: ProductInfoProps) {
  const {
    product,
    stockStatus,
    stockCount,
    reviewCount,
    deliveryInfo,
    colors,
    sizeAvailability,
    materialInfo,
    fitInfo,
    description,
  } = data;

  const maxQuantity = stockCount || 99;
  const isOutOfStock = stockStatus === 'out_of_stock';
  const canAddToCart = !isOutOfStock && selectedSize;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Breadcrumb */}
      <Breadcrumb onBack={onBack} />

      {/* Product Header */}
      <ProductHeader
        product={product}
        category={product.category}
        reviewCount={reviewCount}
        stockStatus={stockStatus}
        stockCount={stockCount}
      />

      {/* Delivery Timer */}
      {!isOutOfStock && <DeliveryTimer deliveryInfo={deliveryInfo} />}

      {/* Size Selector */}
      <SizeSelector
        sizes={sizeAvailability}
        selectedSize={selectedSize}
        onSizeSelect={onSizeSelect}
      />

      {/* Color Selector */}
      {colors && colors.length > 0 && (
        <ColorSelector
          colors={colors}
          selectedColor={selectedColor}
          onColorSelect={onColorSelect}
        />
      )}

      {/* Quantity Selector */}
      {!isOutOfStock && (
        <QuantitySelector
          value={quantity}
          min={1}
          max={maxQuantity}
          onChange={onQuantityChange}
        />
      )}

      {/* Action Buttons */}
      <ActionButtons
        isWishlisted={isWishlisted}
        onAddToCart={onAddToCart}
        onWishlistToggle={onWishlistToggle}
        onShare={onShare}
        disabled={!canAddToCart}
      />

      {/* Product Accordions */}
      <ProductAccordions
        description={description}
        deliveryInfo={deliveryInfo}
        materialInfo={materialInfo}
        fitInfo={fitInfo}
      />
    </div>
  );
}

// ============================================================================
// Export all sub-components for flexibility
// ============================================================================

export {
  Breadcrumb,
  ProductHeader,
  DeliveryTimer,
  SizeSelector,
  ColorSelector,
  QuantitySelector,
  ActionButtons,
  ProductAccordions,
};

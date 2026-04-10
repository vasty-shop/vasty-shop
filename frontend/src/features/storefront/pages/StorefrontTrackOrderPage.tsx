'use client';

/**
 * Storefront Track Order Page
 * Uses storefront theme for order tracking display with live location tracking
 * Updated to match LivePreview editor UI style
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Package, Search, Truck, Clock, MapPin, Box, Loader2, Phone, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useStorefront } from '../StorefrontLayout';
import { useTranslation } from 'react-i18next';
import { useDeliveryLocationTracking } from '@/hooks/useDeliveryLocationTracking';

// Lazy load the map component
const LiveDeliveryMap = lazy(() => import('@/components/maps/LiveDeliveryMap'));

interface OrderTracking {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  shippingAddress?: {
    fullName: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items?: any[];
  timeline?: {
    status: string;
    timestamp: string;
    description: string;
  }[];
}

export function StorefrontTrackOrderPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const [searchParams] = useSearchParams();
  const { theme } = useStorefront();
  const { t } = useTranslation();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Delivery location tracking
  const {
    currentLocation: deliveryLocation,
    eta: deliveryEta,
    deliveryPerson,
    isTracking,
    startTracking,
    stopTracking,
  } = useDeliveryLocationTracking({
    orderId: order?.orderNumber,
  });

  // Start tracking when order is found and is in transit
  useEffect(() => {
    if (order && ['SHIPPED', 'OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(order.status.toUpperCase())) {
      startTracking();
    }
    return () => {
      stopTracking();
    };
  }, [order, startTracking, stopTracking]);

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

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error('Please enter an order number');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await api.trackOrder(orderNumber);
      setOrder(response);
    } catch (error: any) {
      toast.error(error.message || 'Order not found');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
      {/* Gradient Search Header - matches order-search preview */}
      <div
        className="py-12 px-6"
        style={{ background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor || theme.primaryColor} 100%)` }}
      >
        <div className="max-w-2xl mx-auto text-center text-white">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: theme.headingFont }}
          >
            {t('orders.trackOrder')}
          </h1>
          <p className="opacity-90 mb-6">{t('orders.enterOrderNumber')}</p>
          <form onSubmit={handleTrackOrder}>
            <div className={`flex gap-2 ${getBorderRadius('large')} p-2 bg-white`}>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder={t('orders.orderNumber')}
                className="flex-1 px-4 py-2 text-gray-900 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 font-medium ${getBorderRadius('medium')} disabled:opacity-50`}
                style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
              >
                {loading ? t('common.loading') : t('orders.trackOrder')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Results */}
          {loading ? (
            <div
              className={`p-6 ${getBorderRadius('large')} animate-pulse`}
              style={{ backgroundColor: getCardBg() }}
            >
              <div className="h-6 rounded w-1/4 mb-4" style={{ backgroundColor: `${theme.textColor}20` }} />
              <div className="h-4 rounded w-1/2 mb-8" style={{ backgroundColor: `${theme.textColor}20` }} />
              <div className="space-y-4">
                <div className="h-4 rounded w-3/4" style={{ backgroundColor: `${theme.textColor}20` }} />
                <div className="h-4 rounded w-2/4" style={{ backgroundColor: `${theme.textColor}20` }} />
              </div>
            </div>
          ) : order ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Order Details - matches order-details preview */}
              <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: getCardBg() }}>
                <h3 className="font-bold mb-4" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>
                  {t('orders.orderDetails')}
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="opacity-60 mb-1">{t('orders.orderNumber')}</p>
                    <p className="font-medium" style={{ color: theme.textColor }}>#{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="opacity-60 mb-1">{t('orders.orderDate')}</p>
                    <p className="font-medium" style={{ color: theme.textColor }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  {order.estimatedDelivery && (
                    <div>
                      <p className="opacity-60 mb-1">{t('checkout.estimatedDelivery')}</p>
                      <p className="font-bold" style={{ color: theme.primaryColor }}>
                        {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div>
                      <p className="opacity-60 mb-1">{t('orders.trackingNumber')}</p>
                      <p className="font-medium font-mono" style={{ color: theme.textColor }}>{order.trackingNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address with Map */}
              {order.shippingAddress && (
                <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: getCardBg() }}>
                  <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>
                    <MapPin className="w-5 h-5" style={{ color: theme.primaryColor }} />
                    {t('checkout.shippingAddress')}
                  </h3>
                  <div className="text-sm mb-4" style={{ color: theme.textColor, opacity: 0.8 }}>
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  </div>

                  {/* Live Delivery Map */}
                  <Suspense fallback={
                    <div
                      className={`h-64 ${getBorderRadius('large')} flex items-center justify-center`}
                      style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                    >
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" style={{ color: theme.primaryColor }} />
                        <p className="text-sm" style={getSecondaryTextStyle()}>{t('tracking.loadingMap', { defaultValue: 'Loading map...' })}</p>
                      </div>
                    </div>
                  }>
                    <LiveDeliveryMap
                      deliveryLocation={deliveryLocation ? {
                        lat: deliveryLocation.lat,
                        lng: deliveryLocation.lng,
                        timestamp: deliveryLocation.timestamp,
                        address: deliveryLocation.address,
                      } : null}
                      destinationLocation={{
                        lat: 23.8103,
                        lng: 90.4125,
                        address: `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}`,
                      }}
                      deliveryPerson={deliveryPerson ? {
                        name: deliveryPerson.name,
                        phone: deliveryPerson.phone,
                        avatar: deliveryPerson.imageUrl,
                        vehicleType: deliveryPerson.vehicleType,
                      } : null}
                      eta={deliveryEta ? {
                        distance: deliveryEta.distance,
                        duration: deliveryEta.duration,
                      } : undefined}
                      isLive={isTracking && !!deliveryLocation}
                      height="280px"
                      className={getBorderRadius('large')}
                      onCallDelivery={deliveryPerson?.phone ? () => window.open(`tel:${deliveryPerson.phone}`) : undefined}
                    />
                  </Suspense>
                </div>
              )}

              {/* Timeline Events */}
              {order.timeline && order.timeline.length > 0 && (
                <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: getCardBg() }}>
                  <h3 className="font-bold mb-4" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>
                    {t('orders.timeline')}
                  </h3>
                  <div className="space-y-4">
                    {order.timeline.map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: index === 0 ? theme.primaryColor : `${theme.textColor}30` }}
                          />
                          {index < order.timeline!.length - 1 && (
                            <div className="w-0.5 flex-1" style={{ backgroundColor: `${theme.textColor}20` }} />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="font-medium" style={{ color: theme.textColor }}>{event.status.replace(/_/g, ' ')}</p>
                          <p className="text-sm" style={getSecondaryTextStyle()}>{event.description}</p>
                          <p className="text-xs" style={{ color: theme.textColor, opacity: 0.5 }}>
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Support Section - matches order-support preview */}
              <div
                className={`p-6 ${getBorderRadius('large')}`}
                style={{ backgroundColor: `${theme.primaryColor}10` }}
              >
                <h3 className="font-bold mb-2" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>
                  {t('contact.needHelp', { defaultValue: 'Need Help?' })}
                </h3>
                <p className="text-sm opacity-70 mb-4" style={{ color: theme.textColor }}>
                  {t('contact.supportAvailable', { defaultValue: 'Our support team is available 24/7 to assist you.' })}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/store/${shopId}/contact`}
                    className={`px-6 py-2.5 font-medium ${getBorderRadius('medium')}`}
                    style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
                  >
                    {t('contact.contactSupport', { defaultValue: 'Contact Support' })}
                  </Link>
                  <button
                    className={`px-6 py-2.5 font-medium ${getBorderRadius('medium')}`}
                    style={{ backgroundColor: '#FFFFFF', color: theme.primaryColor, border: `1px solid ${theme.primaryColor}` }}
                  >
                    {t('contact.callUs', { defaultValue: 'Call Us' })}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : searched ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textColor, opacity: 0.2 }} />
              <h2 className="text-xl font-semibold mb-2" style={{ color: theme.textColor }}>{t('orders.noOrders')}</h2>
              <p className="mb-6" style={getSecondaryTextStyle()}>{t('common.noResults')}</p>
            </div>
          ) : null}

          {/* Back to Shopping */}
          <div className="text-center mt-8">
            <Link
              to={`/store/${shopId}/products`}
              className="text-sm transition-opacity hover:opacity-100"
              style={{ color: theme.primaryColor }}
            >
              {t('common.shopNow')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StorefrontTrackOrderPage;

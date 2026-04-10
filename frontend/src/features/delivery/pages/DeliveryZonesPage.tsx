import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Circle, CheckCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDeliveryAuthStore } from '@/stores/useDeliveryAuthStore';
import { deliveryApi } from '../api/deliveryApi';

interface DeliveryZone {
  id: string;
  name: string;
  description?: string;
  radius: number;
}

export const DeliveryZonesPage: React.FC = () => {
  const { t } = useTranslation();
  const { deliveryMan, updateProfile } = useDeliveryAuthStore();
  const [myZone, setMyZone] = useState<DeliveryZone | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMyZone();
  }, []);

  const loadMyZone = async () => {
    setIsLoading(true);
    try {
      // Fetch fresh profile data from API to get latest zone assignment
      const profileResponse = await deliveryApi.getMyProfile();
      const freshProfile = profileResponse.data?.data || profileResponse.data;

      // Update store with fresh profile
      if (freshProfile) {
        updateProfile(freshProfile);
      }

      // Get zone_id from fresh profile
      const zoneId = freshProfile?.zoneId || deliveryMan?.zoneId;

      if (zoneId) {
        // Fetch zone details
        const response = await deliveryApi.getZones(false);
        const zonesData = response.data?.data || response.data || [];
        const zones = Array.isArray(zonesData) ? zonesData : [];

        // Find my assigned zone
        const assignedZone = zones.find((z: any) => z.id === zoneId);

        if (assignedZone) {
          setMyZone({
            id: assignedZone.id,
            name: assignedZone.name || 'Unnamed Zone',
            description: assignedZone.description || '',
            radius: Number(assignedZone.radius) || 5,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load zone:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('delivery.zones.myZone')}</h1>
        <p className="text-gray-500 mt-1">{t('delivery.zones.subtitle')}</p>
      </div>

      {/* My Zone Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">{t('delivery.zones.assignedZone')}</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              {t('delivery.zones.active')}
            </span>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gray-200 rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ) : myZone ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                <MapPin className="w-7 h-7 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">{myZone.name}</h4>
                {myZone.description && (
                  <p className="text-sm text-gray-500 mt-1">{myZone.description}</p>
                )}
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-400 flex items-center">
                    <Circle className="w-4 h-4 mr-1" />
                    {myZone.radius} {t('delivery.zones.kmCoverageRadius')}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('delivery.zones.noZoneAssigned')}</h3>
              <p className="text-gray-500">{t('delivery.zones.contactVendor')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
      >
        <h3 className="font-semibold text-blue-900 mb-2">{t('delivery.zones.aboutYourZone')}</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{t('delivery.zones.receiveOrdersInZone')}</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{t('delivery.zones.zoneAssignedByVendor')}</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{t('delivery.zones.contactVendorToChange')}</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

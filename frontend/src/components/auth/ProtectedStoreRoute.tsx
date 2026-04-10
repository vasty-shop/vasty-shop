/**
 * ProtectedStoreRoute - Store-specific route protection
 * Checks if user is authenticated for the specific store
 * Redirects to store login page if not authenticated
 */

import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useStoreAuth } from '../../contexts/StoreAuthContext';

interface ProtectedStoreRouteProps {
  children: React.ReactNode;
}

export const ProtectedStoreRoute: React.FC<ProtectedStoreRouteProps> = ({
  children,
}) => {
  const { shopId } = useParams<{ shopId: string }>();
  const location = useLocation();
  const { isStoreAuthenticated, loading } = useStoreAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-lime mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no shopId, redirect to home
  if (!shopId) {
    return <Navigate to="/" replace />;
  }

  // Check if user is authenticated for this specific store
  const isAuthenticated = isStoreAuthenticated(shopId);

  if (!isAuthenticated) {
    // Redirect to store login page with return path
    return (
      <Navigate
        to={`/store/${shopId}/login`}
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedStoreRoute;

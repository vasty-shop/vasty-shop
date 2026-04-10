import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Store } from 'lucide-react';

/**
 * Vendor Login Page - Redirects to unified login
 *
 * With unified login system, vendors and customers use the same login page.
 * If user has shops, they'll be redirected to vendor dashboard after login.
 */
export const VendorLoginPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to main login page with state indicating vendor intent
    navigate('/login', {
      replace: true,
      state: {
        from: '/vendor/dashboard',
        message: 'Please login to access your vendor dashboard'
      }
    });
  }, [navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-lime/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-primary-lime" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to Login</h2>
        <p className="text-gray-600 mb-4">Please wait...</p>
        <Loader2 className="w-6 h-6 animate-spin text-primary-lime mx-auto" />
      </div>
    </div>
  );
};

export default VendorLoginPage;

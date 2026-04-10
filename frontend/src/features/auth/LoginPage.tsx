import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  Chrome,
  Facebook as FacebookIcon,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';
import { useVendorAuthStore } from '@/stores/useVendorAuthStore';
import { useDeliveryAuthStore } from '@/stores/useDeliveryAuthStore';
import { useShopStore } from '@/stores/useShopStore';
import { deliveryApi } from '@/features/delivery/api/deliveryApi';
import type {
  LoginForm,
  FormErrors,
  FormFieldState,
  SocialAuthProvider,
} from './types';

/**
 * Login Page Component
 *
 * A professional, fully responsive login page for the Vasty e-commerce platform.
 * Features include:
 * - Email/Username and password authentication
 * - Real-time form validation
 * - Password visibility toggle
 * - Remember me functionality
 * - Social authentication (Google, Facebook)
 * - Loading states and error handling
 * - Mobile-first responsive design
 * - Accessibility features
 */
const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, showToast } = useToast();
  const { login, isAuthenticated } = useAuth();
  const { login: vendorLogin } = useVendorAuthStore();
  const { login: deliveryLogin } = useDeliveryAuthStore();
  const { fetchUserShops } = useShopStore();

  // Form state
  const [formData, setFormData] = useState<LoginForm>({
    emailOrUsername: '',
    password: '',
    rememberMe: false,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormFieldState>({
    emailOrUsername: false,
    password: false,
  });

  // Get redirect path from location state
  const from = (location.state as any)?.from?.pathname || '/';

  /**
   * Validate email format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate a single form field
   */
  const validateField = (
    name: keyof LoginForm,
    value: string | boolean
  ): string | undefined => {
    if (name === 'emailOrUsername' && typeof value === 'string') {
      if (!value.trim()) {
        return 'Email or username is required';
      }
      // If it looks like an email, validate email format
      if (value.includes('@') && !isValidEmail(value)) {
        return 'Please enter a valid email address';
      }
      if (value.length < 3) {
        return 'Email or username must be at least 3 characters';
      }
    }

    if (name === 'password' && typeof value === 'string') {
      if (!value) {
        return 'Password is required';
      }
      if (value.length < 6) {
        return 'Password must be at least 6 characters';
      }
    }

    return undefined;
  };

  /**
   * Validate entire form
   */
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    const emailError = validateField('emailOrUsername', formData.emailOrUsername);
    if (emailError) newErrors.emailOrUsername = emailError;

    const passwordError = validateField('password', formData.password);
    if (passwordError) newErrors.password = passwordError;

    return newErrors;
  };

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Validate field in real-time if it has been touched
    if (touched[name as keyof FormFieldState]) {
      const error = validateField(name as keyof LoginForm, value);
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    }
  };

  /**
   * Handle input blur (mark field as touched)
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate field on blur
    const error = validateField(
      name as keyof LoginForm,
      formData[name as keyof LoginForm]
    );
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  /**
   * Handle checkbox change
   */
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  };


  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      emailOrUsername: true,
      password: true,
    });

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Use the unified login method from AuthContext
      // Returns { user, shops } - shops are fetched during login
      const { user, shops: userShops } = await login({
        email: formData.emailOrUsername,
        password: formData.password,
      });

      // Determine redirect based on user role and shops
      const userRole = user?.role || user?.metadata?.role || 'customer';
      let redirectPath = '/';
      const token = localStorage.getItem('accessToken') || '';

      // Get the original destination from location state
      const originalFrom = (location.state as any)?.from || '/';

      // Admin gets admin dashboard
      if (userRole === 'admin') {
        redirectPath = '/admin/dashboard';
      }
      // Delivery man gets delivery dashboard
      else if (userRole === 'delivery_man') {
        try {
          const profileResponse = await deliveryApi.getMyProfile();
          const deliveryManData = profileResponse.data?.data;
          if (deliveryManData && deliveryManData.id) {
            deliveryLogin(deliveryManData, token);
            redirectPath = `/delivery/${deliveryManData.id}/dashboard`;
          } else {
            setErrors({ general: 'Delivery partner profile not found. Please contact support.' });
            return;
          }
        } catch (err) {
          console.error('Failed to fetch delivery profile:', err);
          setErrors({ general: 'Failed to load delivery profile. Please try again.' });
          return;
        }
      }
      // User with shops - they're a vendor
      else if (userShops && userShops.length > 0) {
        // If user was trying to go somewhere specific (not login/home), go there
        if (originalFrom && originalFrom !== '/login' && originalFrom !== '/' && originalFrom !== '/signup') {
          redirectPath = originalFrom;
          showToast({
            variant: 'default',
            title: 'Welcome back!',
            description: 'Redirecting you...',
            duration: 1500,
          });
        } else {
          // Otherwise redirect to vendor dashboard
          showToast({
            variant: 'default',
            title: 'Welcome back!',
            description: `You have ${userShops.length} shop(s). Redirecting to your dashboard...`,
            duration: 2000,
          });
          redirectPath = `/shop/${userShops[0].id}/vendor/dashboard`;
        }
      }
      // New user without shops
      else {
        // If user was trying to create a shop, let them continue
        if (originalFrom && originalFrom.includes('/vendor/create-shop')) {
          redirectPath = '/vendor/create-shop';
          showToast({
            variant: 'default',
            title: 'Welcome!',
            description: 'You can now create your shop.',
            duration: 2000,
          });
        }
        // If user was trying to go somewhere specific, go there
        else if (originalFrom && originalFrom !== '/login' && originalFrom !== '/' && originalFrom !== '/signup') {
          redirectPath = originalFrom;
        }
        // Otherwise go to home
        else {
          redirectPath = '/';
        }
      }

      // Redirect after successful login
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.message || 'Invalid email or password';
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle social authentication
   */
  const handleSocialLogin = (provider: string) => {
    setSocialLoading(provider);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const frontendUrl = encodeURIComponent(window.location.origin);

    switch (provider) {
      case 'github':
        window.location.href = `${apiBaseUrl}/auth/oauth/github?frontendUrl=${frontendUrl}`;
        break;
      case 'google':
        window.location.href = `${apiBaseUrl}/auth/oauth/google?frontendUrl=${frontendUrl}`;
        break;
      default:
        showToast({
          variant: 'error',
          title: 'Error',
          description: `Unknown provider: ${provider}`,
          duration: 5000,
        });
        setSocialLoading('');
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  /**
   * Check if user is already logged in
   * Only redirect if they came from a protected route
   */
  useEffect(() => {
    if (isAuthenticated && location.state?.from) {
      // User is already logged in and came from a protected route, redirect
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, location.state]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <Link
                to="/"
                className="inline-block mb-6 group"
                aria-label="Vasty Home"
              >
                <h1 className="text-4xl font-bold">
                  <span className="text-gray-900 group-hover:text-gray-700 transition-colors">
                    Vasty
                  </span>
                  <span className="text-primary-lime group-hover:text-primary-lime-dark transition-colors">
                    Shop
                  </span>
                </h1>
              </Link>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Sign in to your account to continue
              </p>
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 font-medium">
                    {errors.general}
                  </p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email/Username Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="emailOrUsername"
                  className="text-gray-700 font-semibold"
                >
                  {t('auth.emailOrUsername')}
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <Input
                    id="emailOrUsername"
                    name="emailOrUsername"
                    type="text"
                    value={formData.emailOrUsername}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder={t('auth.placeholders.emailOrUsername')}
                    className={cn(
                      'pl-12 h-12 text-base',
                      errors.emailOrUsername &&
                        touched.emailOrUsername &&
                        'border-red-500 focus-visible:ring-red-500'
                    )}
                    disabled={isSubmitting}
                    autoComplete="username"
                    aria-invalid={!!errors.emailOrUsername}
                    aria-describedby={
                      errors.emailOrUsername
                        ? 'emailOrUsername-error'
                        : undefined
                    }
                  />
                </div>
                {errors.emailOrUsername && touched.emailOrUsername && (
                  <p
                    id="emailOrUsername-error"
                    className="text-sm text-red-600 flex items-center gap-1.5 mt-1.5"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.emailOrUsername}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-semibold">
                  {t('auth.password')}
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder={t('auth.placeholders.password')}
                    className={cn(
                      'pl-12 pr-12 h-12 text-base',
                      errors.password &&
                        touched.password &&
                        'border-red-500 focus-visible:ring-red-500'
                    )}
                    disabled={isSubmitting}
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-lime rounded p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={0}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p
                    id="password-error"
                    className="text-sm text-red-600 flex items-center gap-1.5 mt-1.5"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={handleCheckboxChange}
                    disabled={isSubmitting}
                    aria-label="Remember me for 30 days"
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm text-gray-700 cursor-pointer font-normal"
                  >
                    Keep me signed in for 30 days
                  </Label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary-lime hover:text-primary-lime-dark transition-colors hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold bg-primary-lime hover:bg-primary-lime-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              {/* Google Login */}
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={isSubmitting || socialLoading !== ''}
                className="w-full h-12 px-4 flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
              >
                {socialLoading === 'google' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FaGoogle className="w-5 h-5 text-red-500" />
                )}
                <span>Continue with Google</span>
              </button>

              {/* GitHub Login */}
              <button
                type="button"
                onClick={() => handleSocialLogin('github')}
                disabled={isSubmitting || socialLoading !== ''}
                className="w-full h-12 px-4 flex items-center justify-center gap-3 bg-gray-900 border-2 border-gray-900 rounded-lg font-medium text-white hover:bg-gray-800 hover:border-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
              >
                {socialLoading === 'github' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FaGithub className="w-5 h-5" />
                )}
                <span>Continue with GitHub</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-primary-lime hover:text-primary-lime-dark transition-colors hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Security Badge */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Shield className="w-4 h-4" />
                <span className="text-xs">
                  Secure login with 256-bit encryption
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

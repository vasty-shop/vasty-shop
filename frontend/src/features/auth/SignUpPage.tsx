import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Check,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';

// Type definitions
interface SignUpForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  general?: string;
}

type PasswordStrength = 'weak' | 'medium' | 'strong';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

// Initial form state
const initialFormState: SignUpForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
  subscribeNewsletter: false,
};

const SignUpPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toasts, showToast } = useToast();
  const { register, isAuthenticated } = useAuth();

  // Form state
  const [formData, setFormData] = useState<SignUpForm>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { label: 'At least 8 characters', met: false },
    { label: 'Contains uppercase letter', met: false },
    { label: 'Contains lowercase letter', met: false },
    { label: 'Contains number', met: false },
    { label: 'Contains special character', met: false },
  ]);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength('weak');
      setPasswordRequirements([
        { label: 'At least 8 characters', met: false },
        { label: 'Contains uppercase letter', met: false },
        { label: 'Contains lowercase letter', met: false },
        { label: 'Contains number', met: false },
        { label: 'Contains special character', met: false },
      ]);
      return;
    }

    const password = formData.password;
    const requirements: PasswordRequirement[] = [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { label: 'Contains number', met: /[0-9]/.test(password) },
      { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    setPasswordRequirements(requirements);

    const metCount = requirements.filter((req) => req.met).length;

    if (metCount <= 2) {
      setPasswordStrength('weak');
    } else if (metCount <= 4) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  }, [formData.password]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: keyof SignUpForm) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));

    // Clear error when user checks (only for fields that can have errors)
    if (name !== 'subscribeNewsletter' && errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle field blur for validation
  const handleBlur = (field: keyof SignUpForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // Validate individual field
  const validateField = (field: keyof SignUpForm): boolean => {
    let error = '';

    switch (field) {
      case 'fullName':
        if (!formData.fullName.trim()) {
          error = 'Full name is required';
        } else if (formData.fullName.trim().length < 2) {
          error = 'Full name must be at least 2 characters';
        }
        break;

      case 'email':
        if (!formData.email.trim()) {
          error = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'password':
        if (!formData.password) {
          error = 'Password is required';
        } else if (formData.password.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(formData.password)) {
          error = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(formData.password)) {
          error = 'Password must contain at least one lowercase letter';
        } else if (!/[0-9]/.test(formData.password)) {
          error = 'Password must contain at least one number';
        }
        break;

      case 'confirmPassword':
        if (!formData.confirmPassword) {
          error = 'Please confirm your password';
        } else if (formData.confirmPassword !== formData.password) {
          error = 'Passwords do not match';
        }
        break;

      case 'agreeToTerms':
        if (!formData.agreeToTerms) {
          error = 'You must agree to the Terms of Service and Privacy Policy';
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const fields: (keyof SignUpForm)[] = [
      'fullName',
      'email',
      'password',
      'confirmPassword',
      'agreeToTerms',
    ];

    const validations = fields.map((field) => validateField(field));
    return validations.every((isValid) => isValid);
  };


  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreeToTerms: true,
    });

    // Validate form
    if (!validateForm()) {
      showToast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'error',
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the register method from AuthContext (always register as customer)
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        role: 'customer',
      });

      // Reset form
      setFormData(initialFormState);
      setErrors({});
      setTouched({});

      // Redirect after delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error?.response?.data?.message || 'An error occurred during registration. Please try again.';
      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google OAuth - redirect to backend OAuth endpoint
  const handleGoogleSignUp = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const frontendUrl = encodeURIComponent(window.location.origin);
    window.location.href = `${apiBaseUrl}/auth/oauth/google?frontendUrl=${frontendUrl}`;
  };

  // Handle GitHub OAuth - redirect to backend OAuth endpoint
  const handleGitHubSignUp = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const frontendUrl = encodeURIComponent(window.location.origin);
    window.location.href = `${apiBaseUrl}/auth/oauth/github?frontendUrl=${frontendUrl}`;
  };

  // Get password strength color
  const getPasswordStrengthColor = (): string => {
    switch (passwordStrength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  // Get password strength width
  const getPasswordStrengthWidth = (): string => {
    switch (passwordStrength) {
      case 'weak':
        return 'w-1/3';
      case 'medium':
        return 'w-2/3';
      case 'strong':
        return 'w-full';
      default:
        return 'w-0';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} />

      {/* Main Content */}
      <main className="flex-1 py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-[500px] mx-auto">
            {/* Logo */}
            <div className="text-center mb-6">
              <Link to="/" className="inline-block">
                <div className="text-4xl font-bold">
                  <span className="text-gray-900">Vasty</span>
                  <span className="text-primary-lime">Shop</span>
                </div>
              </Link>
            </div>

            {/* Card Container */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Create Account
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  Start your shopping journey with Vasty Shop
                </p>
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              )}

              {/* Sign Up Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-900">
                    {t('auth.fullName')} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder={t('auth.placeholders.fullName')}
                      value={formData.fullName}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('fullName')}
                      className={cn(
                        'pl-11',
                        touched.fullName && errors.fullName
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : 'focus-visible:ring-primary-lime'
                      )}
                      disabled={isSubmitting}
                    />
                  </div>
                  {touched.fullName && errors.fullName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <X className="w-3.5 h-3.5" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900">
                    {t('auth.emailAddress')} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t('auth.placeholders.email')}
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('email')}
                      className={cn(
                        'pl-11',
                        touched.email && errors.email
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : 'focus-visible:ring-primary-lime'
                      )}
                      disabled={isSubmitting}
                    />
                  </div>
                  {touched.email && errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <X className="w-3.5 h-3.5" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900">
                    {t('auth.password')} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.placeholders.createPassword')}
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('password')}
                      className={cn(
                        'pl-11 pr-11',
                        touched.password && errors.password
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : 'focus-visible:ring-primary-lime'
                      )}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <X className="w-3.5 h-3.5" />
                      {errors.password}
                    </p>
                  )}

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 font-medium">
                          {t('auth.passwordStrength')}:
                        </span>
                        <span
                          className={cn('text-xs font-semibold capitalize', {
                            'text-red-600': passwordStrength === 'weak',
                            'text-yellow-600': passwordStrength === 'medium',
                            'text-green-600': passwordStrength === 'strong',
                          })}
                        >
                          {passwordStrength}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all duration-300',
                            getPasswordStrengthColor(),
                            getPasswordStrengthWidth()
                          )}
                        />
                      </div>

                      {/* Password Requirements */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          {t('auth.passwordRequirements')}:
                        </p>
                        {passwordRequirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            {req.met ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            <span
                              className={cn(
                                req.met ? 'text-green-700' : 'text-gray-600'
                              )}
                            >
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-900">
                    {t('auth.confirmPassword')} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('auth.placeholders.confirmPassword')}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('confirmPassword')}
                      className={cn(
                        'pl-11 pr-11',
                        touched.confirmPassword && errors.confirmPassword
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : 'focus-visible:ring-primary-lime'
                      )}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <X className="w-3.5 h-3.5" />
                      {errors.confirmPassword}
                    </p>
                  )}
                  {formData.confirmPassword &&
                    formData.confirmPassword === formData.password &&
                    !errors.confirmPassword && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Passwords match
                      </p>
                    )}
                </div>

                {/* Terms & Conditions Checkbox */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={() => handleCheckboxChange('agreeToTerms')}
                      disabled={isSubmitting}
                      className={cn(
                        'mt-0.5',
                        touched.agreeToTerms && errors.agreeToTerms
                          ? 'border-red-500'
                          : ''
                      )}
                    />
                    <label
                      htmlFor="agreeToTerms"
                      className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                    >
                      I agree to the{' '}
                      <Link
                        to="/terms"
                        className="text-primary-lime hover:underline font-medium"
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        to="/privacy"
                        className="text-primary-lime hover:underline font-medium"
                      >
                        Privacy Policy
                      </Link>
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                  </div>
                  {touched.agreeToTerms && errors.agreeToTerms && (
                    <p className="text-sm text-red-600 flex items-center gap-1 ml-8">
                      <X className="w-3.5 h-3.5" />
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>

                {/* Newsletter Checkbox */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="subscribeNewsletter"
                    checked={formData.subscribeNewsletter}
                    onCheckedChange={() => handleCheckboxChange('subscribeNewsletter')}
                    disabled={isSubmitting}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="subscribeNewsletter"
                    className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                  >
                    Send me exclusive offers and updates
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary-lime hover:bg-primary-lime-dark text-white font-semibold h-12 text-base transition-all duration-300 shadow-lg hover:shadow-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Create Account</span>
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    Or sign up with
                  </span>
                </div>
              </div>

              {/* Social Sign Up Buttons */}
              <div className="space-y-3">
                {/* Google OAuth */}
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  className="w-full h-12 flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium text-gray-700 shadow-sm hover:shadow"
                  disabled={isSubmitting}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Sign up with Google</span>
                </button>

                {/* GitHub OAuth */}
                <button
                  type="button"
                  onClick={handleGitHubSignUp}
                  className="w-full h-12 flex items-center justify-center gap-3 bg-[#24292F] hover:bg-[#1B1F23] rounded-lg transition-all duration-300 font-medium text-white shadow-sm hover:shadow"
                  disabled={isSubmitting}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>Sign up with GitHub</span>
                </button>
              </div>

              {/* Footer Link */}
              <div className="mt-8 text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-primary-lime hover:underline font-semibold"
                  >
                    Sign in
                  </Link>
                </p>
                <p className="text-sm text-gray-600">
                  Want to sell products?{' '}
                  <span className="text-primary-lime font-semibold">
                    Sign up and create your store!
                  </span>
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our use of cookies and data
                practices outlined in our Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;

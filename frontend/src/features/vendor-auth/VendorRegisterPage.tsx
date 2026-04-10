import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Store,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  Phone,
  Building2,
  MapPin,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/toast';
import { useVendorAuthStore } from '@/stores/useVendorAuthStore';
import { vendorRegister } from './vendorAuthApi';
import type { VendorRegisterForm, VendorFormErrors, RegistrationStep } from './types';

/**
 * Vendor Registration Page
 * Multi-step registration process for new vendors
 */
export const VendorRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login } = useVendorAuthStore();

  // Current step
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);

  // Form state
  const [formData, setFormData] = useState<VendorRegisterForm>({
    // Step 1
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2
    shopName: '',
    businessName: '',
    businessType: 'individual',
    businessEmail: '',
    businessPhone: '',
    // Step 3
    firstName: '',
    lastName: '',
    phone: '',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
    },
    agreeToTerms: false,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<VendorFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Password strength
  const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  };

  // Validation
  const validateField = (name: keyof VendorRegisterForm, value: any): string | undefined => {
    // Step 1 validations
    if (name === 'email' && typeof value === 'string') {
      if (!value.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
    }

    if (name === 'password' && typeof value === 'string') {
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
      if (!/[A-Z]/.test(value)) return 'Must contain uppercase letter';
      if (!/[a-z]/.test(value)) return 'Must contain lowercase letter';
      if (!/[0-9]/.test(value)) return 'Must contain number';
    }

    if (name === 'confirmPassword' && typeof value === 'string') {
      if (!value) return 'Please confirm your password';
      if (value !== formData.password) return 'Passwords do not match';
    }

    // Step 2 validations
    if (name === 'shopName' && typeof value === 'string') {
      if (!value.trim()) return 'Shop name is required';
      if (value.trim().length < 3) return 'Shop name must be at least 3 characters';
    }

    if (name === 'businessName' && typeof value === 'string') {
      if (!value.trim()) return 'Business name is required';
    }

    if (name === 'businessEmail' && typeof value === 'string') {
      if (!value.trim()) return 'Business email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
    }

    // Step 3 validations
    if (name === 'firstName' && typeof value === 'string') {
      if (!value.trim()) return 'First name is required';
    }

    if (name === 'lastName' && typeof value === 'string') {
      if (!value.trim()) return 'Last name is required';
    }

    if (name === 'phone' && typeof value === 'string') {
      if (!value.trim()) return 'Phone number is required';
    }

    if (name === 'agreeToTerms' && typeof value === 'boolean') {
      if (!value) return 'You must agree to the terms';
    }

    return undefined;
  };

  const validateStep = (step: RegistrationStep): boolean => {
    const newErrors: VendorFormErrors = {};

    if (step === 1) {
      const emailError = validateField('email', formData.email);
      if (emailError) newErrors.email = emailError;

      const passwordError = validateField('password', formData.password);
      if (passwordError) newErrors.password = passwordError;

      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      if (confirmError) newErrors.confirmPassword = confirmError;
    }

    if (step === 2) {
      const shopError = validateField('shopName', formData.shopName);
      if (shopError) newErrors.shopName = shopError;

      const businessError = validateField('businessName', formData.businessName);
      if (businessError) newErrors.businessName = businessError;

      const businessEmailError = validateField('businessEmail', formData.businessEmail);
      if (businessEmailError) newErrors.businessEmail = businessEmailError;
    }

    if (step === 3) {
      const firstNameError = validateField('firstName', formData.firstName);
      if (firstNameError) newErrors.firstName = firstNameError;

      const lastNameError = validateField('lastName', formData.lastName);
      if (lastNameError) newErrors.lastName = lastNameError;

      const phoneError = validateField('phone', formData.phone);
      if (phoneError) newErrors.phone = phoneError;

      const termsError = validateField('agreeToTerms', formData.agreeToTerms);
      if (termsError) newErrors.agreeToTerms = termsError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle nested address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        businessAddress: {
          ...prev.businessAddress,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error
    if (errors[name as keyof VendorFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (!name.startsWith('address.')) {
      const error = validateField(name as keyof VendorRegisterForm, formData[name as keyof VendorRegisterForm]);
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    }
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3) as RegistrationStep);
    } else {
      showToast({
        title: 'Validation Error',
        description: 'Please fix the errors before continuing',
        variant: 'error',
      });
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as RegistrationStep);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate final step
    if (!validateStep(3)) {
      showToast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await vendorRegister({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        shopName: formData.shopName,
        businessName: formData.businessName,
        businessType: formData.businessType,
        businessEmail: formData.businessEmail,
        businessPhone: formData.businessPhone,
        businessAddress: formData.businessAddress,
      });

      // Store auth data (login function handles both single shop and array)
      login(response.user, response.shop, response.accessToken);

      // Show success message
      showToast({
        title: 'Registration Successful!',
        description: response.message,
        variant: 'default',
      });

      // Redirect to shop dashboard with newly created shop
      setTimeout(() => {
        // Get the shop (response.shop should be a single object after registration)
        const shopData = Array.isArray(response.shop) ? response.shop : [response.shop];
        const newShop = shopData[0];

        if (newShop && newShop.id) {
          // Redirect to the newly created shop's dashboard
          navigate(`/shop/${newShop.id}/vendor/dashboard`, { replace: true });
        } else {
          // Fallback: redirect to create shop if no shop was created
          navigate('/vendor/create-shop', { replace: true });
        }
      }, 1000);
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setErrors({ general: errorMessage });
      showToast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="your.email@domain.com"
                className={cn('pl-11', errors.email && 'border-red-500')}
              />
            </div>
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Create a strong password"
                className={cn('pl-11 pr-11', errors.password && 'border-red-500')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            {formData.password && (
              <div className="flex gap-1 mt-2">
                {['weak', 'medium', 'strong'].map((level, i) => (
                  <div
                    key={level}
                    className={cn(
                      'h-1 flex-1 rounded',
                      i === 0 && 'bg-red-500',
                      i === 1 && getPasswordStrength(formData.password) !== 'weak' && 'bg-yellow-500',
                      i === 2 && getPasswordStrength(formData.password) === 'strong' && 'bg-green-500',
                      getPasswordStrength(formData.password) === 'weak' && i > 0 && 'bg-gray-200',
                      getPasswordStrength(formData.password) === 'medium' && i === 2 && 'bg-gray-200'
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Re-enter password"
                className={cn('pl-11 pr-11', errors.confirmPassword && 'border-red-500')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
            {formData.confirmPassword && formData.confirmPassword === formData.password && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Passwords match
              </p>
            )}
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-5">
          {/* Shop Name */}
          <div className="space-y-2">
            <Label htmlFor="shopName">Shop Name *</Label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="shopName"
                name="shopName"
                value={formData.shopName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="My Awesome Shop"
                className={cn('pl-11', errors.shopName && 'border-red-500')}
              />
            </div>
            {errors.shopName && <p className="text-sm text-red-600">{errors.shopName}</p>}
          </div>

          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="businessName">Legal Business Name *</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Awesome Enterprises LLC"
                className={cn('pl-11', errors.businessName && 'border-red-500')}
              />
            </div>
            {errors.businessName && <p className="text-sm text-red-600">{errors.businessName}</p>}
          </div>

          {/* Business Email */}
          <div className="space-y-2">
            <Label htmlFor="businessEmail">Business Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="businessEmail"
                name="businessEmail"
                type="email"
                value={formData.businessEmail}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="business@shop.com"
                className={cn('pl-11', errors.businessEmail && 'border-red-500')}
              />
            </div>
            {errors.businessEmail && <p className="text-sm text-red-600">{errors.businessEmail}</p>}
          </div>

          {/* Business Phone */}
          <div className="space-y-2">
            <Label htmlFor="businessPhone">Business Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="businessPhone"
                name="businessPhone"
                value={formData.businessPhone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                className="pl-11"
              />
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="space-y-5">
          {/* First Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="John"
                  className={cn('pl-11', errors.firstName && 'border-red-500')}
                />
              </div>
              {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Doe"
                className={cn(errors.lastName && 'border-red-500')}
              />
              {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="+1 (555) 123-4567"
                className={cn('pl-11', errors.phone && 'border-red-500')}
              />
            </div>
            {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label>Business Address (Optional)</Label>
            <Input
              name="address.street"
              value={formData.businessAddress.street}
              onChange={handleInputChange}
              placeholder="Street address"
              className="mb-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="address.city"
                value={formData.businessAddress.city}
                onChange={handleInputChange}
                placeholder="City"
              />
              <Input
                name="address.state"
                value={formData.businessAddress.state}
                onChange={handleInputChange}
                placeholder="State"
              />
            </div>
            <Input
              name="address.postalCode"
              value={formData.businessAddress.postalCode}
              onChange={handleInputChange}
              placeholder="Postal Code"
              className="mt-2"
            />
          </div>

          {/* Terms */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))}
              />
              <label htmlFor="agreeToTerms" className="text-sm cursor-pointer">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-lime hover:underline font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-lime hover:underline font-medium">
                  Privacy Policy
                </Link>
                <span className="text-red-500 ml-1">*</span>
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-sm text-red-600 ml-8">{errors.agreeToTerms}</p>}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2">
            <Store className="w-6 h-6 text-primary-lime" />
            <h1 className="text-2xl font-bold">
              <span className="text-gray-900">Flux</span>
              <span className="text-primary-lime">ez</span>
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors',
                        step < currentStep && 'bg-green-500 text-white',
                        step === currentStep && 'bg-primary-lime text-white',
                        step > currentStep && 'bg-gray-200 text-gray-500'
                      )}
                    >
                      {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                    </div>
                    <span className="text-xs mt-1 text-gray-600">
                      {step === 1 && 'Account'}
                      {step === 2 && 'Shop Info'}
                      {step === 3 && 'Owner Details'}
                    </span>
                  </div>
                  {step < 3 && (
                    <div
                      className={cn(
                        'flex-1 h-1 mx-2',
                        step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Registration Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Become a Vendor
              </h2>
              <p className="text-gray-600">
                {currentStep === 1 && 'Create your account credentials'}
                {currentStep === 2 && 'Tell us about your shop'}
                {currentStep === 3 && 'Complete your profile'}
              </p>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errors.general}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Previous
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-primary-lime hover:bg-primary-lime-dark"
                  >
                    Next
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary-lime hover:bg-primary-lime-dark"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Store className="w-5 h-5" />
                        Create Vendor Account
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary-lime hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorRegisterPage;

/**
 * Vendor Authentication Types
 */

// Vendor Login Form
export interface VendorLoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Vendor Registration Form (Multi-step)
export interface VendorRegisterForm {
  // Step 1: Account Details
  email: string;
  password: string;
  confirmPassword: string;

  // Step 2: Shop Information
  shopName: string;
  businessName: string;
  businessType: string;
  businessEmail: string;
  businessPhone: string;

  // Step 3: Owner Details
  firstName: string;
  lastName: string;
  phone: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // Terms
  agreeToTerms: boolean;
}

// Shop Information
export interface VendorShop {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  status: 'pending' | 'active' | 'suspended' | 'closed';
  isVerified: boolean;
  totalProducts?: number;
  totalOrders?: number;
  totalSales?: number;
  rating?: number;
}

// Vendor User
export interface VendorUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
  role: 'vendor';
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

// Vendor Authentication State
export interface VendorAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  vendor: VendorUser | null;
  shop: VendorShop | null;
  token: string | null;
}

// API Response Types
export interface VendorLoginResponse {
  user: VendorUser;
  shop: VendorShop;
  accessToken: string;
  refreshToken?: string;
}

export interface VendorRegisterResponse {
  user: VendorUser;
  shop: VendorShop;
  accessToken: string;
  refreshToken?: string;
  message: string;
}

export interface VendorProfileResponse extends VendorUser {
  shop: VendorShop;
}

// Form Errors
export interface VendorFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  shopName?: string;
  businessName?: string;
  businessEmail?: string;
  businessPhone?: string;
  agreeToTerms?: string;
  general?: string;
}

// Registration Steps
export type RegistrationStep = 1 | 2 | 3;

export interface RegistrationStepConfig {
  step: RegistrationStep;
  title: string;
  description: string;
  fields: (keyof VendorRegisterForm)[];
}

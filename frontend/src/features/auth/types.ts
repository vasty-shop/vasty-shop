/**
 * Authentication Feature Type Definitions
 *
 * This file contains all TypeScript interfaces and types used in the authentication feature.
 */

/**
 * Login Form Data Interface
 * Represents the structure of the login form data
 */
export interface LoginForm {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}

/**
 * Form Errors Interface
 * Contains error messages for each form field
 */
export interface FormErrors {
  emailOrUsername?: string;
  password?: string;
  general?: string;
}

/**
 * Form Field State Interface
 * Tracks the touched state of each form field for validation
 */
export interface FormFieldState {
  emailOrUsername: boolean;
  password: boolean;
}

/**
 * Authentication State Interface
 * Represents the current authentication state of the application
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: AuthUser | null;
}

/**
 * Authenticated User Interface
 * Basic user information after successful login
 */
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar?: string;
}

/**
 * Social Auth Provider Type
 * Supported social authentication providers
 */
export type SocialAuthProvider = 'google' | 'facebook';

/**
 * Auth Response Interface
 * Server response structure after authentication attempt
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
}

/**
 * Login Credentials Interface
 * Data sent to the authentication API
 */
export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Social Login Data Interface
 * Data structure for social authentication
 */
export interface SocialLoginData {
  provider: SocialAuthProvider;
  token: string;
}

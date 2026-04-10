/**
 * Authentication API functions
 * These connect to real backend auth endpoints
 */

import { api } from '@/lib/api';

/**
 * Sends a password reset email to the provided email address
 * @param email - User's email address
 * @returns Promise that resolves when email is sent
 */
export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  if (!email.includes('@')) {
    throw new Error('Invalid email address');
  }

  await api.forgotPassword(email);
};

/**
 * Resets user password with a new password
 * @param token - Reset token from URL
 * @param newPassword - New password to set
 * @returns Promise that resolves when password is reset
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  if (!token || token.length < 10) {
    throw new Error('Invalid or expired reset token');
  }

  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  await api.resetPassword(token, newPassword);
};

/**
 * Verifies user email with verification token
 * @param token - Verification token from URL
 * @returns Promise that resolves to true if verification successful, false otherwise
 */
export const verifyEmail = async (token: string): Promise<boolean> => {
  try {
    await api.verifyEmail(token);
    return true;
  } catch (error) {
    console.error('Email verification failed:', error);
    return false;
  }
};

/**
 * Resends verification email to user
 * @param email - User's email address
 * @returns Promise that resolves when email is sent
 */
export const resendVerificationEmail = async (email: string): Promise<void> => {
  if (!email.includes('@')) {
    throw new Error('Invalid email address');
  }

  await api.resendVerificationEmail(email);
};

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Object with validation results
 */
export const validatePasswordStrength = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

/**
 * Checks if password meets all requirements
 * @param password - Password to validate
 * @returns true if password is strong enough
 */
export const isPasswordStrong = (password: string): boolean => {
  const validation = validatePasswordStrength(password);
  return Object.values(validation).every((isValid) => isValid);
};

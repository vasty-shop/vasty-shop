import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

// Helper function for password validation
const validatePasswordStrength = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const { token: pathToken } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { resetPassword } = useAuth();

  // Get token from path param OR query param (Vasty may use either)
  const queryToken = searchParams.get('token');
  const token = pathToken || queryToken;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // Validate token on mount
  useEffect(() => {
    if (!token || token === 'invalid-token' || token.length < 10) {
      setTokenValid(false);
    }
  }, [token]);

  // Calculate password requirements
  const passwordValidation = validatePasswordStrength(newPassword);
  const requirements: PasswordRequirement[] = [
    { label: 'At least 8 characters', met: passwordValidation.minLength },
    { label: 'One uppercase letter', met: passwordValidation.hasUppercase },
    { label: 'One lowercase letter', met: passwordValidation.hasLowercase },
    { label: 'One number', met: passwordValidation.hasNumber },
    { label: 'One special character', met: passwordValidation.hasSpecialChar },
  ];

  // Calculate password strength
  const getPasswordStrength = (): { level: number; label: string; color: string } => {
    if (!newPassword) return { level: 0, label: '', color: '' };

    const metCount = requirements.filter((r) => r.met).length;

    if (metCount === 5) {
      return { level: 5, label: 'Strong', color: 'bg-green-500' };
    } else if (metCount >= 3) {
      return { level: metCount, label: 'Medium', color: 'bg-yellow-500' };
    } else {
      return { level: metCount, label: 'Weak', color: 'bg-red-500' };
    }
  };

  const strength = getPasswordStrength();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setConfirmError('');

    // Validate new password
    if (!newPassword) {
      setPasswordError('Password is required');
      return;
    }

    const allRequirementsMet = requirements.every((r) => r.met);
    if (!allRequirementsMet) {
      setPasswordError('Password does not meet all requirements');
      return;
    }

    // Validate password confirmation
    if (!confirmPassword) {
      setConfirmError('Please confirm your password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match');
      return;
    }

    if (!token) {
      showToast({
        title: 'Error',
        description: 'Invalid reset token',
        variant: 'error',
      });
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, newPassword);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { state: { message: 'Password reset successfully. Please login with your new password.' } });
      }, 2000);
    } catch (error) {
      // Error handling is done in AuthContext
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If token is invalid, show error state
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[450px]"
          >
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                  <X className="w-12 h-12 text-red-500" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h1>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>

              <Link to="/forgot-password">
                <Button className="w-full bg-primary-lime hover:bg-primary-lime-dark">
                  Request New Link
                </Button>
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[450px]"
        >
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Link to="/" className="text-3xl font-bold">
                <span className="text-gray-900">Flux</span>
                <span className="text-primary-lime">ez</span>
              </Link>
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
              <p className="text-gray-600 text-sm">Enter your new password</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-700">
                  {t('auth.newPassword')}
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder={t('auth.placeholders.newPassword')}
                    className={cn(
                      'pl-10 pr-10',
                      passwordError && 'border-red-500 focus-visible:ring-red-500'
                    )}
                    disabled={isLoading}
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p id="password-error" className="text-red-500 text-sm">
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('auth.passwordStrength')}:</span>
                    <span
                      className={cn(
                        'font-semibold',
                        strength.level === 5 && 'text-green-600',
                        strength.level >= 3 && strength.level < 5 && 'text-yellow-600',
                        strength.level < 3 && 'text-red-600'
                      )}
                    >
                      {strength.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          'h-2 flex-1 rounded-full transition-all duration-300',
                          level <= strength.level ? strength.color : 'bg-gray-200'
                        )}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Password Requirements Checklist */}
              {newPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-50 rounded-lg p-4 space-y-2"
                >
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    {t('auth.passwordRequirements')}:
                  </p>
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {requirement.met ? (
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <span
                        className={cn(
                          'text-sm',
                          requirement.met ? 'text-green-700' : 'text-gray-600'
                        )}
                      >
                        {requirement.label}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  {t('auth.confirmNewPassword')}
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setConfirmError('');
                    }}
                    placeholder={t('auth.placeholders.confirmNewPassword')}
                    className={cn(
                      'pl-10 pr-10',
                      confirmError && 'border-red-500 focus-visible:ring-red-500'
                    )}
                    disabled={isLoading}
                    aria-invalid={!!confirmError}
                    aria-describedby={confirmError ? 'confirm-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {confirmError && (
                  <p id="confirm-error" className="text-red-500 text-sm">
                    {confirmError}
                  </p>
                )}
                {!confirmError && confirmPassword && newPassword === confirmPassword && (
                  <p className="text-green-600 text-sm flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary-lime hover:bg-primary-lime-dark"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-primary-lime transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;

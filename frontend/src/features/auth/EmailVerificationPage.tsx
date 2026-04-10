import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { verifyEmail, resendVerificationEmail } from './authApi';

type VerificationState = 'awaiting' | 'success' | 'failed' | 'verifying';

export const EmailVerificationPage: React.FC = () => {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [verificationState, setVerificationState] = useState<VerificationState>('awaiting');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [userEmail] = useState(''); // In real app, get from state/context

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Countdown timer for redirect after success
  useEffect(() => {
    if (verificationState === 'success' && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (verificationState === 'success' && redirectCountdown === 0) {
      navigate('/login', { state: { message: 'Email verified successfully. Please login to continue.' } });
    }
  }, [verificationState, redirectCountdown, navigate]);

  // Verify email token if present
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerificationState('awaiting');
        return;
      }

      setVerificationState('verifying');

      try {
        const isValid = await verifyEmail(token);

        if (isValid) {
          setVerificationState('success');
          // Trigger confetti animation
          triggerConfetti();
        } else {
          setVerificationState('failed');
        }
      } catch (error) {
        setVerificationState('failed');
        showToast({
          title: 'Verification Failed',
          description: 'An error occurred during verification',
          variant: 'error',
        });
      }
    };

    verifyToken();
  }, [token, showToast]);

  // Confetti animation
  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  // Handle resend verification email
  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);

    try {
      await resendVerificationEmail(userEmail);
      setResendCooldown(60);
      showToast({
        title: 'Email Sent',
        description: 'Verification email has been resent',
        variant: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to resend verification email',
        variant: 'error',
      });
    } finally {
      setIsResending(false);
    }
  };

  // Render state: Verifying
  if (verificationState === 'verifying') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[500px] text-center"
          >
            <div className="bg-white rounded-lg shadow-lg p-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 border-4 border-primary-lime border-t-transparent rounded-full animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email...</h1>
              <p className="text-gray-600">Please wait while we verify your email address</p>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // Render state: Success
  if (verificationState === 'success') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-full max-w-[500px] text-center"
          >
            <div className="bg-white rounded-lg shadow-lg p-12">
              {/* Success Icon with Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div className="w-24 h-24 bg-primary-lime/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-16 h-16 text-primary-lime" />
                </div>
              </motion.div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Email Verified!</h1>
                <p className="text-gray-600 mb-8">
                  Your email has been successfully verified. You can now access all features of your account.
                </p>

                {/* Redirect countdown */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">
                    Redirecting to login in{' '}
                    <span className="font-bold text-primary-lime">{redirectCountdown}</span> seconds...
                  </p>
                </div>

                {/* Continue Button */}
                <Link to="/login">
                  <Button className="w-full bg-primary-lime hover:bg-primary-lime-dark mb-4">
                    Continue to Login
                  </Button>
                </Link>

                {/* Home Link */}
                <Link
                  to="/"
                  className="text-sm text-gray-600 hover:text-primary-lime transition-colors"
                >
                  Go to Homepage
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // Render state: Failed
  if (verificationState === 'failed') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[500px] text-center"
          >
            <div className="bg-white rounded-lg shadow-lg p-12">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                  <XCircle className="w-16 h-16 text-red-500" />
                </div>
              </div>

              {/* Error Message */}
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Verification Failed</h1>
              <p className="text-gray-600 mb-8">
                The verification link is invalid or has expired. Please request a new verification email.
              </p>

              {/* Resend Button */}
              <Button
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
                className="w-full bg-primary-lime hover:bg-primary-lime-dark mb-4"
              >
                {isResending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Resending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              {/* Back to Login Link */}
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-gray-600 hover:text-primary-lime transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // Render state: Awaiting (default state when no token)
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[500px] text-center"
        >
          <div className="bg-white rounded-lg shadow-lg p-12">
            {/* Email Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 bg-primary-lime/10 rounded-full flex items-center justify-center"
              >
                <Mail className="w-16 h-16 text-primary-lime" />
              </motion.div>
            </div>

            {/* Awaiting Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Verify Your Email</h1>
            <p className="text-gray-600 mb-2">
              We sent a verification link to your email address:
            </p>
            <p className="text-gray-900 font-semibold text-lg mb-8">{userEmail}</p>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-900 font-semibold mb-2">What's next?</p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Check your inbox for the verification email</li>
                <li>Click the verification link in the email</li>
                <li>You'll be automatically verified</li>
              </ul>
            </div>

            {/* Didn't receive email section */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">Didn't receive the email?</p>
              <Button
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
                variant="outline"
                className="w-full mb-3"
              >
                {isResending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2" />
                    Resending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              {resendCooldown > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-xs text-gray-500"
                >
                  Check your spam folder if you haven't received the email
                </motion.div>
              )}
            </div>

            {/* Change Email Link */}
            <Link
              to="/settings"
              className="text-sm text-gray-600 hover:text-primary-lime transition-colors inline-block mb-4"
            >
              Change Email Address
            </Link>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6" />

            {/* Back to Login Link */}
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-primary-lime transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-6">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <Link to="/contact" className="text-primary-lime hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default EmailVerificationPage;

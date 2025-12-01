'use client'

import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { logError } from '@/lib/errorLogging';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import HoneypotFields from './HoneypotFields';
import { validateHoneypot, HoneypotTracker } from '@/lib/honeypot';

interface SignUpFormProps {
  onSignUpSuccess?: () => void;
}

export default function SignUpForm({ onSignUpSuccess }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tracker] = useState(() => new HoneypotTracker());

  useEffect(() => {
    return () => tracker.cleanup();
  }, [tracker]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      const { error } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - resend({
        type: 'signup',
        email: unverifiedEmail,
      });

      if (error) {
        if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          toast.error('Too many requests. Please wait a few minutes before requesting another verification email.');
        } else {
          toast.error(error.message || 'Failed to resend verification email');
        }
        
        await logError(error, {
          type: 'resend_verification_error',
          context: { email: unverifiedEmail }
        });
      } else {
        toast.success('Verification email sent! Please check your inbox and spam folder.');
        analytics.trackEvent('verification_email_resent', {
          props: { email: unverifiedEmail }
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error('Failed to resend verification email. Please try again.');
      
      await logError(error instanceof Error ? error : new Error('Resend verification failed'), {
        type: 'resend_verification_error',
        context: { email: unverifiedEmail }
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const honeypotCheck = validateHoneypot(formData);

    if (!honeypotCheck.isValid) {
      console.warn('Honeypot validation failed:', honeypotCheck.suspiciousFields);
      toast.error('Form submission failed. Please try again.');
      await logError(new Error('Honeypot validation failed'), {
        type: 'bot_detection',
        context: { suspiciousFields: honeypotCheck.suspiciousFields }
      });
      return;
    }

    const behaviorCheck = tracker.validateSubmission();
    if (!behaviorCheck.isValid) {
      console.warn('Behavioral validation failed:', behaviorCheck);
      toast.error('Form submission appears suspicious. Please try again.');
      await logError(new Error('Behavioral validation failed'), {
        type: 'bot_detection',
        context: behaviorCheck
      });
      return;
    }

    setLoading(true);
    setShowResendOption(false);

    try {
      const { data: authData, error: signUpError } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - signUp({
        email,
        password,
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('No user returned from signup');
      }

      toast.success('Account created! Please check your email to verify your account.');
      analytics.trackEvent('sign_up_success');
      
      // Reset form
      setEmail('');
      setPassword('');
      
      // Call success callback
      if (onSignUpSuccess) {
        onSignUpSuccess();
      }

    } catch (error) {
      console.error('Authentication error:', error);
      
      // Ensure we always have a proper Error object for logging
      let errorToLog: Error;
      if (error instanceof Error) {
        errorToLog = error;
      } else {
        // Convert non-Error objects to proper Error instances
        errorToLog = new Error(typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));
      }
      
      let errorMessage = 'Authentication failed';
      if (errorToLog.message.includes('Failed to fetch') || errorToLog.message.includes('upstream request timeout')) {
        errorMessage = 'Connection failed. Please check your internet connection and try again.';
      } else if (errorToLog.message.includes('email rate limit exceeded') || errorToLog.message.includes('over_email_send_rate_limit')) {
        errorMessage = 'Too many email requests. Please try again in a few minutes.';
      } else if (errorToLog.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (errorToLog.message) {
        errorMessage = errorToLog.message;
      }
      
      // Also check the original error for specific patterns
      if (typeof error === 'object' && error !== null) {
        const errorStr = JSON.stringify(error);
        if (errorStr.includes('upstream request timeout') || errorStr.includes('504')) {
          errorMessage = 'Connection failed. Please check your internet connection and try again.';
        } else if (errorStr.includes('over_email_send_rate_limit') || errorStr.includes('429')) {
          errorMessage = 'Too many email requests. Please try again in a few minutes.';
        }
      }
      
      await logError(errorToLog, {
        type: 'sign_up_error',
        context: {
          email,
          error: errorMessage,
          stack: errorToLog.stack,
          fullError: errorToLog.message,
          originalError: typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error),
          errorType: typeof error,
          isNetworkError: errorToLog.message.includes('Failed to fetch') || 
            errorToLog.message.includes('upstream request timeout') ||
            (typeof error === 'object' && error !== null && JSON.stringify(error).includes('504'))
        }
      });
      
      toast.error(errorMessage);
      analytics.trackEvent('sign_up_error', {
        error: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">
        Create Your Account
      </h2>

      {showResendOption && (
        <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-200 mb-2">Email Verification Required</h3>
              <p className="text-sm text-yellow-100 mb-3">
                Your account exists but your email ({unverifiedEmail}) is not verified. 
                Please check your inbox for the verification link, or request a new one.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Resend Verification Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <HoneypotFields count={2} />

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full bg-gray-800/50 text-white placeholder-gray-400 border ${
              errors.email ? 'border-red-500' : 'border-gray-700'
            } rounded-lg px-4 py-2 focus:outline-none focus:border-[#F4A024] focus:ring-1 focus:ring-[#F4A024]`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full bg-gray-800/50 text-white placeholder-gray-400 border ${
              errors.password ? 'border-red-500' : 'border-gray-700'
            } rounded-lg px-4 py-2 focus:outline-none focus:border-[#F4A024] focus:ring-1 focus:ring-[#F4A024]`}
            placeholder="Enter your password"
            minLength={6}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <LoadingSpinner />
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </div>
  );
}
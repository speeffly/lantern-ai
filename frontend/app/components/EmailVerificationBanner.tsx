'use client';

import { useState, useEffect } from 'react';

interface EmailVerificationBannerProps {
  show?: boolean;
  onResend?: () => void;
}

export default function EmailVerificationBanner({ show = true, onResend }: EmailVerificationBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (show) {
      checkVerificationStatus();
    }
  }, [show]);

  const checkVerificationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verification-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success && !data.data.isVerified) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Failed to check verification status:', error);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please log in to resend verification email');
        setIsResending(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Verification email sent! Please check your inbox.');
      } else {
        setMessage(`❌ ${data.error || 'Failed to resend verification email'}`);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage('❌ Failed to resend verification email');
    } finally {
      setIsResending(false);
    }

    if (onResend) {
      onResend();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Email Verification Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Please verify your email address to access all features. Check your inbox for a verification email.
            </p>
            {message && (
              <p className="mt-2 font-medium">{message}</p>
            )}
          </div>
          <div className="mt-3 flex space-x-3">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className={`text-sm font-medium transition-colors ${
                isResending
                  ? 'text-yellow-600 cursor-not-allowed'
                  : 'text-yellow-800 hover:text-yellow-900 underline'
              }`}
            >
              {isResending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Resend verification email'
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
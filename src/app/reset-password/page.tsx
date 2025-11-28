'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { PrimaryButton } from '@/components/ui';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validatingToken, setValidatingToken] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Check if user came from password reset email
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // User clicked the reset link
        console.log('Password recovery event detected');
        setHasValidToken(true);
        setValidatingToken(false);
      }
    });

    // Set a timeout to redirect to 404 if no valid token is detected
    timeoutId = setTimeout(() => {
      if (!hasValidToken) {
        console.log('No valid password recovery token found, redirecting to 404');
        router.push('/not-found');
      }
      setValidatingToken(false);
    }, 3000); // Wait 3 seconds for the auth state change

    return () => {
      clearTimeout(timeoutId);
      authListener.subscription.unsubscribe();
    };
  }, [router, hasValidToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while validating token
  if (validatingToken) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
        <Navbar />
        <div className="pt-16 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2 font-loubag uppercase">Validating...</h2>
            <p className="text-secondary font-inter">Please wait while we verify your reset link.</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
        <Navbar />
        <div className="pt-16 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2 font-loubag uppercase">Password Reset Successful!</h2>
            <p className="text-secondary font-inter mb-4">Your password has been updated. Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
      <Navbar />

      {/* Two Column Layout */}
      <div className="pt-16 min-h-screen grid lg:grid-cols-2">
        {/* Left Column - Image */}
        <div className="hidden lg:block relative bg-gradient-to-br from-[#F34A23] to-[#d63d1a]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80)' }}
          ></div>
        </div>

        {/* Right Column - Form */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2 font-loubag uppercase">Set New Password</h1>
              <p className="text-secondary font-inter">Enter your new password below</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-inter">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                  New Password *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#F34A23] text-primary"
                  style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                  placeholder="At least 6 characters"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                  Confirm New Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#F34A23] text-primary"
                  style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                  placeholder="Re-enter your password"
                />
              </div>

              {/* Submit Button */}
              <PrimaryButton type="submit" disabled={loading} fullWidth>
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 font-inter">
              Remember your password?{' '}
              <a href="/login" className="text-[#F34A23] hover:underline font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

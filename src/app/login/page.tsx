'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { PrimaryButton } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [loginStatus, setLoginStatus] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginStatus('');
    setLoading(true);

    try {
      console.log('Attempting login with:', formData.email);
      setLoginStatus('Signing in...');

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      console.log('Login response:', { data, error: signInError });

      if (signInError) throw signInError;
      if (!data.user) throw new Error('Failed to login');

      console.log('User logged in:', data.user.id);
      setLoginStatus('Checking restaurant...');

      // Check if user has a restaurant with timeout
      const restaurantCheckPromise = supabase
        .from('restaurants')
        .select('id, name')
        .eq('owner_id', data.user.id)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Restaurant check timed out. Please check your database connection.')), 10000)
      );

      const { data: restaurant, error: restaurantError } = await Promise.race([
        restaurantCheckPromise,
        timeoutPromise
      ]) as any;

      console.log('Restaurant check:', { restaurant, restaurantError });

      if (restaurantError) {
        console.error('Restaurant check error:', restaurantError);
        throw new Error(`Failed to check restaurant: ${restaurantError.message || 'Unknown error'}`);
      }

      if (!restaurant) {
        throw new Error('No restaurant found for this account. Please contact support.');
      }

      console.log('Found restaurant:', restaurant.name, 'slug:', restaurant.slug);

      // Check for demo item and transfer it to the restaurant
      const DEMO_CACHE_KEY = 'ochel_demo_menu_item';
      const cachedDemoItem = localStorage.getItem(DEMO_CACHE_KEY);

      if (cachedDemoItem && restaurant) {
        // Clear localStorage immediately to prevent reuse across accounts
        localStorage.removeItem(DEMO_CACHE_KEY);
        localStorage.removeItem('ochel_demo_template');

        try {
          console.log('Demo item found, transferring to restaurant...');
          setLoginStatus('Transferring your demo item...');
          const demoItem = JSON.parse(cachedDemoItem);

          // Create category for the demo item
          const { data: category, error: categoryError } = await supabase
            .from('categories')
            .insert({
              restaurant_id: restaurant.id,
              title: demoItem.category,
              title_en: demoItem.category,
              title_ar: demoItem.category,
              title_fr: demoItem.category,
              order: 0
            })
            .select()
            .single();

          if (categoryError) {
            console.error('Error creating category:', categoryError);
          } else if (category) {
            // Create subcategory
            const { data: subcategory, error: subcategoryError } = await supabase
              .from('subcategories')
              .insert({
                category_id: category.id,
                title: demoItem.subcategory || 'General',
                title_en: demoItem.subcategory || 'General',
                title_ar: demoItem.subcategory || 'General',
                title_fr: demoItem.subcategory || 'General',
                order: 0
              })
              .select()
              .single();

            if (subcategoryError) {
              console.error('Error creating subcategory:', subcategoryError);
            } else if (subcategory) {
              // Create menu item (excluding image to prevent cross-account image leakage)
              const { error: itemError } = await supabase
                .from('menu_items')
                .insert({
                  category_id: category.id,
                  subcategory_id: subcategory.id,
                  title: demoItem.title,
                  title_en: demoItem.title,
                  title_ar: demoItem.title,
                  title_fr: demoItem.title,
                  description: demoItem.description,
                  description_en: demoItem.description,
                  description_ar: demoItem.description,
                  description_fr: demoItem.description,
                  price: parseFloat(demoItem.price) || 0,
                  image_path: null, // Don't transfer images to prevent cross-account leakage
                  model_3d_url: demoItem.model3dGlbUrl || null,
                  redirect_3d_url: demoItem.model3dUsdzUrl || null,
                  order: 0
                });

              if (itemError) {
                console.error('Error creating menu item:', itemError);
              } else {
                console.log('Demo item successfully transferred!');
              }
            }
          }
        } catch (error) {
          console.error('Error transferring demo item:', error);
          // Don't fail login if demo item transfer fails
        }
      }

      setLoginStatus('Redirecting to admin panel...');

      // Get the full restaurant data to access slug
      const { data: fullRestaurant } = await supabase
        .from('restaurants')
        .select('slug')
        .eq('id', restaurant.id)
        .single();

      const adminUrl = fullRestaurant?.slug
        ? `/${fullRestaurant.slug}/admin`
        : '/admin';

      console.log('Redirecting to:', adminUrl);

      // Small delay to ensure session is saved
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force redirect using window.location
      console.log('Attempting navigation to', adminUrl);
      window.location.href = adminUrl;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
      setLoginStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      console.log('Sending password reset email to:', resetEmail);
      console.log('Redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl,
      });

      console.log('Reset password response:', { data, error });

      if (error) {
        console.error('Reset password error:', error);
        throw error;
      }

      console.log('Password reset email sent successfully');
      setResetSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };

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
              <h1 className="text-3xl font-bold text-primary mb-2 font-loubag uppercase">Sign In</h1>
              <p className="text-secondary font-inter">Enter your credentials to access your account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-inter">{error}</p>
              </div>
            )}

            {loginStatus && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-600 font-inter">{loginStatus}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#F34A23] text-primary"
                  style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                  placeholder="your@email.com"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-inter">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-sm text-[#F34A23] hover:underline font-inter"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#F34A23] text-primary"
                  style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                  placeholder="Your password"
                />
              </div>

              {/* Submit Button */}
              <PrimaryButton type="submit" disabled={loading} fullWidth>
                {loading ? 'Signing in...' : 'Sign In'}
              </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 font-inter">
              Don't have an account?{' '}
              <a href="/signup" className="text-[#F34A23] hover:underline font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-primary mb-2 font-loubag uppercase">Reset Password</h2>
            <p className="text-secondary mb-6 font-inter">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {resetSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2 font-inter">Check your email</h3>
                <p className="text-secondary mb-6 font-inter">
                  We've sent a password reset link to <strong>{resetEmail}</strong>
                </p>
                <PrimaryButton
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetSuccess(false);
                    setResetEmail('');
                  }}
                  fullWidth
                >
                  Close
                </PrimaryButton>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                    Email Address
                  </label>
                  <input
                    id="resetEmail"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#F34A23] text-primary"
                    style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetEmail('');
                      setError('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-medium hover:bg-gray-300 transition-colors font-inter"
                  >
                    Cancel
                  </button>
                  <PrimaryButton type="submit" disabled={resetLoading} className="flex-1">
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </PrimaryButton>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

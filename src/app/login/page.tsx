'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { PrimaryButton } from '@/components/ui';
import { useTranslation } from '@/contexts/LanguageContext';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      setLoginStatus(t('loginPage.status.signingIn'));

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      console.log('Login response:', { data, error: signInError });

      if (signInError) throw signInError;
      if (!data.user) throw new Error('Failed to login');

      console.log('User logged in:', data.user.id);
      setLoginStatus(t('loginPage.status.checkingRestaurant'));

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
      const DEMO_TEMPLATE_KEY = 'ochel_demo_template';
      const FIRST_TIME_CACHE_KEY = 'ochel_first_time_menu_item';
      const FIRST_TIME_TEMPLATE_KEY = 'ochel_first_time_template';

      const cachedDemoItem = localStorage.getItem(DEMO_CACHE_KEY);
      const cachedTemplate = localStorage.getItem(DEMO_TEMPLATE_KEY);

      if (cachedDemoItem && restaurant) {
        // Save to first-time cache as backup and for onboarding
        localStorage.setItem(FIRST_TIME_CACHE_KEY, cachedDemoItem);
        if (cachedTemplate) {
          localStorage.setItem(FIRST_TIME_TEMPLATE_KEY, cachedTemplate);
        }

        // Clear demo cache immediately to prevent reuse across accounts
        localStorage.removeItem(DEMO_CACHE_KEY);
        localStorage.removeItem(DEMO_TEMPLATE_KEY);

        try {
          console.log('Demo item found, transferring to restaurant...');
          setLoginStatus(t('loginPage.status.transferring'));
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

      setLoginStatus(t('loginPage.status.redirecting'));

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
              <h1 className="text-3xl font-bold text-primary mb-2 font-loubag uppercase">{t('loginPage.title')}</h1>
              <p className="text-secondary font-inter">{t('loginPage.subtitle')}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-inter">{error}</p>
              </div>
            )}



            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                  {t('loginPage.email')} *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#F34A23] text-primary"
                  style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                  placeholder={t('loginPage.emailPlaceholder')}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-inter">
                    {t('loginPage.password')} *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-sm text-[#F34A23] hover:underline font-inter"
                  >
                    {t('loginPage.forgotPassword')}
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#F34A23] text-primary pr-12"
                    style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                    placeholder={t('loginPage.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <PrimaryButton type="submit" disabled={loading} fullWidth>
                {loading ? t('loginPage.submitting') : t('loginPage.submit')}
              </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 font-inter">
              {t('loginPage.noAccount')}{' '}
              <a href="/signup" className="text-[#F34A23] hover:underline font-medium">
                {t('loginPage.signup')}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-primary mb-2 font-loubag uppercase">{t('loginPage.reset.title')}</h2>
            <p className="text-secondary mb-6 font-inter">
              {t('loginPage.reset.subtitle')}
            </p>

            {resetSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2 font-inter">{t('loginPage.reset.successTitle')}</h3>
                <p className="text-secondary mb-6 font-inter">
                  {t('loginPage.reset.successMessage')} <strong>{resetEmail}</strong>
                </p>
                <PrimaryButton
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetSuccess(false);
                    setResetEmail('');
                  }}
                  fullWidth
                >
                  {t('loginPage.reset.close')}
                </PrimaryButton>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                    {t('loginPage.reset.emailLabel')}
                  </label>
                  <input
                    id="resetEmail"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#F34A23] text-primary"
                    style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                    placeholder={t('loginPage.emailPlaceholder')}
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
                    {t('loginPage.reset.cancel')}
                  </button>
                  <PrimaryButton type="submit" disabled={resetLoading} className="flex-1">
                    {resetLoading ? t('loginPage.reset.submitting') : t('loginPage.reset.submit')}
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

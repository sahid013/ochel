'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { PrimaryButton } from '@/components/ui';
import { useTranslation } from '@/contexts/LanguageContext';

export default function SignupPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    restaurantName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Auto-generate slug from restaurant name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Starting signup process...');

      // Validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const slug = generateSlug(formData.restaurantName);
      console.log('Generated slug:', slug);

      if (!slug) {
        throw new Error('Please enter a valid restaurant name');
      }

      // Step 1: Check if slug is already taken
      console.log('Checking if slug exists...');

      // Add timeout to prevent indefinite hanging
      const slugCheckPromise = supabase
        .from('restaurants')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timed out. Please check your connection and try again.')), 10000)
      );

      const { data: existingRestaurant, error: checkError } = await Promise.race([
        slugCheckPromise,
        timeoutPromise
      ]) as any;

      console.log('Slug check result:', { existingRestaurant, checkError });

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Slug check error:', checkError);
        throw new Error(`Database error: ${checkError.message || 'Failed to check restaurant name availability'}`);
      }

      if (existingRestaurant) {
        throw new Error('Restaurant name is already taken. Please choose a different name.');
      }

      // Step 2: Create Supabase Auth user
      console.log('Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            restaurant_name: formData.restaurantName,
          }
        }
      });

      console.log('Auth signup result:', { user: authData?.user?.id, session: !!authData?.session, error: authError });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user account');

      // Check if session was created (email confirmation might be required)
      if (!authData.session) {
        throw new Error('Please check your email to confirm your account before proceeding.');
      }

      // Step 3: Create restaurant entry
      console.log('Creating restaurant entry...');
      const restaurantData = {
        name: formData.restaurantName,
        slug: slug,
        email: formData.email,
        phone: formData.phone,
        owner_id: authData.user.id
      };
      console.log('Restaurant data:', restaurantData);

      const { data: newRestaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .insert(restaurantData)
        .select()
        .single();

      console.log('Restaurant insert result:', { newRestaurant, restaurantError });

      if (restaurantError) {
        console.error('Restaurant creation error:', restaurantError);
        throw new Error(`Failed to create restaurant: ${restaurantError.message}`);
      }

      console.log('Signup successful! Restaurant created:', newRestaurant);

      // Step 4: Check for demo item and transfer it to the new restaurant
      const DEMO_CACHE_KEY = 'ochel_demo_menu_item';
      const DEMO_TEMPLATE_KEY = 'ochel_demo_template';
      const FIRST_TIME_CACHE_KEY = 'ochel_first_time_menu_item';
      const FIRST_TIME_TEMPLATE_KEY = 'ochel_first_time_template';

      const cachedDemoItem = localStorage.getItem(DEMO_CACHE_KEY);
      const cachedDemoTemplate = localStorage.getItem(DEMO_TEMPLATE_KEY);

      if (cachedDemoItem && newRestaurant) {
        try {
          console.log('Demo item found, transferring to new restaurant...');
          const demoItem = JSON.parse(cachedDemoItem);

          // Transfer demo item to first-time cache so it's available in admin panel
          localStorage.setItem(FIRST_TIME_CACHE_KEY, cachedDemoItem);
          if (cachedDemoTemplate) {
            localStorage.setItem(FIRST_TIME_TEMPLATE_KEY, cachedDemoTemplate);
          }

          // Clear demo cache to prevent reuse
          localStorage.removeItem(DEMO_CACHE_KEY);
          localStorage.removeItem(DEMO_TEMPLATE_KEY);

          // Create category for the demo item
          const { data: category, error: categoryError } = await supabase
            .from('categories')
            .insert({
              restaurant_id: newRestaurant.id,
              title: demoItem.category,
              title_en: demoItem.category,
              order: 0,
              status: 'active'
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
                restaurant_id: newRestaurant.id,
                category_id: category.id,
                title: demoItem.subcategory || 'General',
                title_en: demoItem.subcategory || 'General',
                order: 0,
                status: 'active'
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
                  restaurant_id: newRestaurant.id,
                  category_id: category.id,
                  subcategory_id: subcategory.id,
                  title: demoItem.title,
                  title_en: demoItem.title,
                  description: demoItem.description,
                  description_en: demoItem.description,
                  price: parseFloat(demoItem.price) || 0,
                  image_path: null, // Don't transfer images to prevent cross-account leakage
                  model_3d_url: demoItem.model3dGlbUrl || null,
                  redirect_3d_url: demoItem.model3dUsdzUrl || null,
                  order: 0,
                  status: 'active'
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
          // Don't fail signup if demo item transfer fails
        }
      }

      // Success!
      setSuccess(true);
      setTimeout(() => {
        const adminUrl = `/${slug}/admin`;
        console.log('Redirecting to', adminUrl);
        window.location.href = adminUrl;
      }, 2000);

    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2 font-loubag uppercase">{t('signupPage.success.title')}</h2>
          <p className="text-secondary font-inter">{t('signupPage.success.message')}</p>
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
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80)' }}
          ></div>
        </div>

        {/* Right Column - Form */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2 font-loubag uppercase">{t('signupPage.title')}</h1>
              <p className="text-secondary font-inter">{t('signupPage.subtitle')}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-inter">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Restaurant Name */}
              <div>
                <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                  {t('signupPage.restaurantName')} *
                </label>
                <input
                  id="restaurantName"
                  type="text"
                  required
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#F34A23] text-primary"
                  style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                  placeholder="e.g., Magnifiko"
                />
                {formData.restaurantName && (
                  <p className="mt-1 text-xs text-gray-500 font-inter">
                    {t('signupPage.urlPreview')} <span className="font-medium">/{generateSlug(formData.restaurantName)}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                  {t('signupPage.email')} *
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

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                  {t('signupPage.phone')} *
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#F34A23] text-primary"
                  style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                  {t('signupPage.password')} *
                </label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#F34A23] text-primary pr-10"
                  style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                  placeholder={t('signupPage.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 top-8"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.879 16.121A4.995 4.995 0 0112 15c1.414 0 2.757.483 3.89 1.354M16.01 11.99a7.504 7.504 0 00-4.504-4.504M3 3l3 3m3 3l3 3m3 3l3 3m3 3l3 3" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                  {t('signupPage.confirmPassword')} *
                </label>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#F34A23] text-primary pr-10"
                  style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                  placeholder={t('signupPage.confirmPasswordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 top-8"
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.879 16.121A4.995 4.995 0 0112 15c1.414 0 2.757.483 3.89 1.354M16.01 11.99a7.504 7.504 0 00-4.504-4.504M3 3l3 3m3 3l3 3m3 3l3 3m3 3l3 3" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Submit Button */}
              <PrimaryButton type="submit" disabled={loading} fullWidth>
                {loading ? t('signupPage.submitting') : t('signupPage.submit')}
              </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 font-inter">
              {t('signupPage.hasAccount')}{' '}
              <a href="/login" className="text-[#F34A23] hover:underline font-medium">
                {t('signupPage.signin')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

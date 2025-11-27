'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LandingLanguageSwitcher } from '@/components/layout/LandingLanguageSwitcher';
import { LandingProfileDropdown } from '@/components/layout/LandingProfileDropdown';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
      const cachedDemoItem = localStorage.getItem(DEMO_CACHE_KEY);

      if (cachedDemoItem && newRestaurant) {
        // Clear localStorage immediately to prevent reuse across accounts
        localStorage.removeItem(DEMO_CACHE_KEY);
        localStorage.removeItem('ochel_demo_template');

        try {
          console.log('Demo item found, transferring to new restaurant...');
          const demoItem = JSON.parse(cachedDemoItem);

          // Create category for the demo item
          const { data: category, error: categoryError } = await supabase
            .from('categories')
            .insert({
              restaurant_id: newRestaurant.id,
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
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8F6] via-white to-[#FFF8F6] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-forum">Success!</h2>
          <p className="text-gray-600">Your restaurant account has been created. Redirecting to admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F6] via-white to-[#FFF8F6]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <a href="/" className="text-3xl font-bold text-gray-900 font-forum tracking-tight">
              Ochel
            </a>

            {/* Language Switcher + Auth Buttons/Profile */}
            <div className="flex items-center gap-4">
              <LandingLanguageSwitcher />

              {!loading && (
                <>
                  {isLoggedIn ? (
                    <LandingProfileDropdown />
                  ) : (
                    <>
                      <a
                        href="/login"
                        className="px-6 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Login
                      </a>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Two Column Layout */}
      <div className="pt-20 min-h-screen grid lg:grid-cols-2">
        {/* Left Column - Image */}
        <div className="hidden lg:block relative bg-gradient-to-br from-[#F34A23] to-[#d63d1a]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80)' }}
          ></div>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Right Column - Form */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-forum">Create Account</h1>
              <p className="text-gray-600">Sign up to manage your restaurant menu</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Restaurant Name */}
              <div>
                <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <input
                  id="restaurantName"
                  type="text"
                  required
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-[#F34A23] text-gray-900"
                  placeholder="e.g., Magnifiko"
                />
                {formData.restaurantName && (
                  <p className="mt-1 text-xs text-gray-500">
                    Your URL will be: <span className="font-medium">/{generateSlug(formData.restaurantName)}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-[#F34A23] text-gray-900"
                  placeholder="your@email.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-[#F34A23] text-gray-900"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-[#F34A23] text-gray-900"
                  placeholder="At least 6 characters"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-[#F34A23] text-gray-900"
                  placeholder="Re-enter your password"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F34A23] text-white py-3 px-6 rounded-xl font-medium hover:bg-[#d63d1a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
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

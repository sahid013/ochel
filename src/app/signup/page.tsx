'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      const { data: existingRestaurant, error: checkError } = await supabase
        .from('restaurants')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();

      console.log('Slug check result:', { existingRestaurant, checkError });

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
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

      // Success!
      setSuccess(true);
      setTimeout(() => {
        console.log('Redirecting to /admin...');
        router.push('/admin');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-600">Your restaurant account has been created. Redirecting to admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Restaurant Account</h1>
          <p className="text-gray-600">Sign up to manage your restaurant menu</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F34A23] focus:border-transparent text-gray-900"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F34A23] focus:border-transparent text-gray-900"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F34A23] focus:border-transparent text-gray-900"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F34A23] focus:border-transparent text-gray-900"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F34A23] focus:border-transparent text-gray-900"
              placeholder="Re-enter your password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F34A23] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#d63d1a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
  );
}

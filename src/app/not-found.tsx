'use client';

import { Navbar } from '@/components/layout/Navbar';
import { PrimaryButton } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
      <Navbar />

      {/* Two Column Layout */}
      <div className="pt-16 min-h-screen grid lg:grid-cols-2">
        {/* Left Column - Image */}
        <div className="hidden lg:block relative bg-gradient-to-br from-[#F34A23] to-[#d63d1a]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80)' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-9xl font-bold font-loubag opacity-20">404</h2>
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#F34A23]/10 mb-6">
                <svg
                  className="w-12 h-12 text-[#F34A23]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-6xl font-bold text-primary mb-4 font-loubag">404</h1>
              <h2 className="text-3xl font-bold text-primary mb-4 font-loubag uppercase">Page Not Found</h2>
              <p className="text-secondary font-inter text-lg mb-2">
                Oops! The page you're looking for doesn't exist.
              </p>
              <p className="text-secondary font-inter">
                It might have been moved or deleted.
              </p>
            </div>

            <div className="space-y-4">
              <PrimaryButton
                onClick={() => router.push('/')}
                fullWidth
              >
                Go to Homepage
              </PrimaryButton>

              <button
                onClick={() => router.back()}
                className="w-full bg-transparent border border-[#F34A23] text-[#F34A23] py-3 px-6 rounded-xl font-medium hover:bg-[#F34A23] hover:text-white transition-colors font-inter"
              >
                Go Back
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-inter">
                Need help?{' '}
                <a href="/login" className="text-[#F34A23] hover:underline font-medium">
                  Sign in
                </a>
                {' '}or{' '}
                <a href="/signup" className="text-[#F34A23] hover:underline font-medium">
                  Create an account
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

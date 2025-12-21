'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PrimaryButton } from '@/components/ui';

interface PublishMenuButtonProps {
  restaurantId: string;
  restaurantSlug: string;
  currentTemplate: string;
  subscriptionStatus?: string | null;
  onPublishComplete?: () => void;
}

/**
 * Button to mark onboarding as complete.
 * If subscribed -> Live.
 * If not -> Redirect to subscribe.
 */
export function PublishMenuButton({ restaurantId, restaurantSlug, currentTemplate, subscriptionStatus, onPublishComplete }: PublishMenuButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if restaurant has at least one menu item
      const { data: menuItems, error: checkError } = await supabase
        .from('menu_items')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .limit(1);

      if (checkError) throw checkError;

      if (!menuItems || menuItems.length === 0) {
        setError('Please add at least one menu item before publishing.');
        setLoading(false);
        return;
      }

      // Mark onboarding as complete and save template
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({
          has_completed_onboarding: true,
          template: currentTemplate
        } as any)
        .eq('id', restaurantId);

      if (updateError) throw updateError;

      // Call the callback if provided (refreshes parent state)
      if (onPublishComplete) {
        onPublishComplete();
      }

      // Check subscription status
      const isActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

      if (isActive) {
        // Redirect to public menu page
        router.push(`/${restaurantSlug}`);
      } else {
        // Redirect to subscription page (Membership Tab in Admin)
        router.push(`/${restaurantSlug}/admin?tab=membership`);
      }

    } catch (err) {
      console.error('Error publishing menu:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish menu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PrimaryButton onClick={handlePublish} disabled={loading} className="py-2">
        {loading ? 'Publishing...' : 'Publish your menu'}
      </PrimaryButton>

      {/* Error Modal */}
      {error && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setError(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setError(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 font-loubag">
                Action Required
              </h3>

              <p className="text-sm text-gray-600 mb-6 font-plus-jakarta-sans">
                {error}
              </p>

              <button
                onClick={() => setError(null)}
                className="w-full bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-medium transition-colors font-plus-jakarta-sans"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

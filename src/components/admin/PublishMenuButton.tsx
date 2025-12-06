'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PrimaryButton } from '@/components/ui';

interface PublishMenuButtonProps {
  restaurantId: string;
  restaurantSlug: string;
  currentTemplate: string;
  onPublishComplete?: () => void;
}

/**
 * Button to mark onboarding as complete and redirect to public menu
 * Items are already in the database, this just completes the onboarding flow
 */
export function PublishMenuButton({ restaurantId, restaurantSlug, currentTemplate, onPublishComplete }: PublishMenuButtonProps) {
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

      // Call the callback if provided
      if (onPublishComplete) {
        onPublishComplete();
      }

      // Redirect to public menu page
      router.push(`/${restaurantSlug}`);
    } catch (err) {
      console.error('Error publishing menu:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish menu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <PrimaryButton onClick={handlePublish} disabled={loading} className="py-2">
        {loading ? 'Publishing...' : 'Publish your menu'}
      </PrimaryButton>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  );
}

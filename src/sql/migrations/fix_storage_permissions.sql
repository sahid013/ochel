-- ============================================================================
-- FIX SUPABASE STORAGE PERMISSIONS FOR MENU IMAGES
-- ============================================================================
-- This migration fixes storage policies to prevent cross-account image access
-- Images are now organized by restaurant_id in folders
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Public can read menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete menu images" ON storage.objects;

-- Policy: Allow public to read all images (menus are public)
CREATE POLICY "Public can read menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

-- Policy: Allow restaurant owners to upload images to their own folder
-- Path format: {restaurant_id}/*
CREATE POLICY "Restaurant owners can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-images' AND
  -- Extract restaurant_id from path (first segment before /)
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

-- Policy: Allow restaurant owners to update their own images
CREATE POLICY "Restaurant owners can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'menu-images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

-- Policy: Allow restaurant owners to delete their own images
CREATE POLICY "Restaurant owners can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

-- Verify the policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- ============================================================================
-- SUPABASE STORAGE SETUP FOR MENU IMAGES
-- ============================================================================
-- This migration creates the menu-images storage bucket and sets up policies
-- Run this in Supabase SQL Editor after creating the bucket in the UI
-- ============================================================================

-- Note: The bucket must be created via Supabase Dashboard UI first
-- Go to Storage > New bucket > Name: "menu-images" > Public bucket: YES

-- Enable public access for reading images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Policy: Allow public to read all images
DROP POLICY IF EXISTS "Public can read menu images" ON storage.objects;
CREATE POLICY "Public can read menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

-- Policy: Allow authenticated users to upload images
DROP POLICY IF EXISTS "Authenticated users can upload menu images" ON storage.objects;
CREATE POLICY "Authenticated users can upload menu images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-images');

-- Policy: Allow authenticated users to update their uploads
DROP POLICY IF EXISTS "Authenticated users can update menu images" ON storage.objects;
CREATE POLICY "Authenticated users can update menu images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'menu-images');

-- Policy: Allow authenticated users to delete their uploads
DROP POLICY IF EXISTS "Authenticated users can delete menu images" ON storage.objects;
CREATE POLICY "Authenticated users can delete menu images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'menu-images');

-- Verify the policies
SELECT * FROM storage.buckets WHERE id = 'menu-images';

-- Migration: Create restaurants table for multi-tenant support
-- This table stores information about each restaurant on the platform

-- Create restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic restaurant information
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL, -- URL-friendly identifier (e.g., 'magnifiko')
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,

  -- Owner/User relationship (links to Supabase Auth)
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Settings and customization (can be expanded later)
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#F34A23', -- Hex color code

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);

-- Create index on owner_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON public.restaurants(owner_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- RLS Policies:
-- 1. Restaurant owners can view their own restaurant
CREATE POLICY "Restaurant owners can view their own restaurant"
  ON public.restaurants
  FOR SELECT
  USING (auth.uid() = owner_id);

-- 2. Restaurant owners can update their own restaurant
CREATE POLICY "Restaurant owners can update their own restaurant"
  ON public.restaurants
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- 3. Anyone can view active restaurants (for public menu pages)
CREATE POLICY "Anyone can view active restaurants"
  ON public.restaurants
  FOR SELECT
  USING (is_active = true);

-- 4. Authenticated users can create restaurants (signup)
CREATE POLICY "Authenticated users can create restaurants"
  ON public.restaurants
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Comments for documentation
COMMENT ON TABLE public.restaurants IS 'Stores restaurant information for multi-tenant platform';
COMMENT ON COLUMN public.restaurants.slug IS 'URL-friendly identifier used in public URLs (e.g., /magnifiko)';
COMMENT ON COLUMN public.restaurants.owner_id IS 'Links to Supabase Auth user who owns this restaurant';

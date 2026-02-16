-- ============================================
-- FinZoo Database Schema for Supabase (Fixed)
-- ============================================

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- PETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT NOT NULL,
  age TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image TEXT,
  description TEXT,
  in_stock BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable Row Level Security
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Pets are viewable by everyone" ON public.pets;
DROP POLICY IF EXISTS "Admin users can insert pets" ON public.pets;
DROP POLICY IF EXISTS "Admin users can update pets" ON public.pets;
DROP POLICY IF EXISTS "Admin users can delete pets" ON public.pets;

-- Pets policies
CREATE POLICY "Pets are viewable by everyone"
  ON public.pets FOR SELECT
  USING (is_visible = true OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admin users can insert pets"
  ON public.pets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin users can update pets"
  ON public.pets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete pets"
  ON public.pets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- INDEXES for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pets_species ON public.pets(species);
CREATE INDEX IF NOT EXISTS idx_pets_featured ON public.pets(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_pets_visible ON public.pets(is_visible) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_pets_in_stock ON public.pets(in_stock);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for pets updated_at
DROP TRIGGER IF EXISTS set_pets_updated_at ON public.pets;
CREATE TRIGGER set_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- STORAGE BUCKET for pet images
-- ============================================

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-images', 'pet-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Pet images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can upload pet images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update pet images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete pet images" ON storage.objects;

-- Storage policies for pet-images bucket
CREATE POLICY "Pet images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pet-images');

CREATE POLICY "Admin users can upload pet images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pet-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin users can update pet images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pet-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete pet images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pet-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SEED DATA (Initial pets)
-- ============================================
INSERT INTO public.pets (name, species, breed, age, price, image, description, in_stock, is_visible, featured)
VALUES
  ('Goldie', 'Fish', 'Goldfish', '6 months', 15.00, 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400&h=300&fit=crop', 'A beautiful golden companion for your aquarium. Goldie is healthy and active.', true, true, true),
  ('Max', 'Dog', 'Golden Retriever', '2 years', 800.00, 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop', 'Friendly and loyal Golden Retriever. Great with kids and other pets.', true, true, true),
  ('Whiskers', 'Cat', 'Persian', '1 year', 450.00, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop', 'Elegant Persian cat with a calm and affectionate personality.', true, true, true),
  ('Tweety', 'Bird', 'Canary', '8 months', 75.00, 'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=400&h=300&fit=crop', 'Bright yellow canary with a beautiful singing voice.', true, true, false),
  ('Hoppy', 'Rabbit', 'Holland Lop', '4 months', 120.00, 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop', 'Adorable Holland Lop bunny with floppy ears and a sweet temperament.', false, true, true),
  ('Nemo', 'Fish', 'Clownfish', '1 year', 35.00, 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&h=300&fit=crop', 'Vibrant clownfish perfect for saltwater aquariums.', true, true, false),
  ('Shell', 'Turtle', 'Red-Eared Slider', '3 years', 85.00, 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=400&h=300&fit=crop', 'Friendly turtle that loves basking in the sun.', true, true, false),
  ('Buddy', 'Dog', 'Labrador', '1 year', 750.00, 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=300&fit=crop', 'Energetic Labrador puppy ready for adventure.', true, true, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- Manually add profile for existing user
-- Run this after the schema is set up
-- ============================================
-- This will create profiles for any users that exist in auth.users but don't have profiles yet
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'name', email) as name,
  'user' as role
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

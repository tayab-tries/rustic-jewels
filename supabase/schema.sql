-- Complete Supabase Database Schema for Rustic Jewels (Multi-Item Listings)
-- Idempotent & Re-executable in Supabase SQL Editor

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

---------------------------------------------------------
-- 1. Create Tables
---------------------------------------------------------

-- A. Admins Table (linked to Supabase Auth.users)
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- B. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    image TEXT, -- Path or URL to category thumbnail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- C. Listings Table (Replaces single Product model)
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    featured_image TEXT NOT NULL, -- Showcase photo containing numbered items
    gallery_images TEXT[] NOT NULL DEFAULT '{}', -- Optional extra photo URLs
    instagram_post_url TEXT,
    featured BOOLEAN NOT NULL DEFAULT false,
    published BOOLEAN NOT NULL DEFAULT true,
    material TEXT,
    collection TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- D. Listing Items Table (One Listing has many Listing Items)
CREATE TABLE IF NOT EXISTS public.listing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    item_number TEXT NOT NULL, -- e.g. "15", "16", "17"
    item_name TEXT, -- Optional item title
    price NUMERIC, -- Nullable represents "Price on Inquiry"
    notes TEXT, -- Optional notes / gemstone details
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- E. Listing Categories Join Table (Many-to-Many Relationship)
CREATE TABLE IF NOT EXISTS public.listing_categories (
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (listing_id, category_id)
);

-- F. Settings Table (Single-row Global Configuration)
CREATE TABLE IF NOT EXISTS public.settings (
    id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true), -- Forces maximum of 1 row
    business_name TEXT NOT NULL DEFAULT 'Rustic Jewels',
    hero_title TEXT NOT NULL DEFAULT 'Shop All',
    hero_subtitle TEXT NOT NULL DEFAULT 'Browse our Collection',
    hero_image TEXT NOT NULL DEFAULT '/bg-pattern-2.png',
    instagram_url TEXT NOT NULL DEFAULT 'https://instagram.com/rustic_jewels_instagram',
    email TEXT NOT NULL DEFAULT 'contact@rusticjewels.com',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

---------------------------------------------------------
-- 2. Create Trigger Functions & Triggers
---------------------------------------------------------

-- Trigger function to automatically update "updated_at" timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers if they already exist before recreating
DROP TRIGGER IF EXISTS update_listings_updated_at ON public.listings;
CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_listing_items_updated_at ON public.listing_items;
CREATE TRIGGER update_listing_items_updated_at
    BEFORE UPDATE ON public.listing_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function & Trigger to auto-register new Supabase Auth users into public.admins table
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.admins (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();

---------------------------------------------------------
-- 3. Indexes for Query Optimization
---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_listings_slug ON public.listings(slug);
CREATE INDEX IF NOT EXISTS idx_listings_published ON public.listings(published);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON public.listings(featured);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_listing_items_listing_id ON public.listing_items(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_items_item_number ON public.listing_items(item_number);

---------------------------------------------------------
-- 4. Enable Row Level Security (RLS)
---------------------------------------------------------
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

---------------------------------------------------------
-- 5. Helper Function & RLS Policies
---------------------------------------------------------

-- Helper function to check if authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins Policy
DROP POLICY IF EXISTS "Allow authenticated admins read access to admins table" ON public.admins;
CREATE POLICY "Allow authenticated admins read access to admins table" 
ON public.admins FOR SELECT TO authenticated USING (public.is_admin());

-- Categories Policies
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
CREATE POLICY "Allow public read access to categories" 
ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin full access to categories" ON public.categories;
CREATE POLICY "Allow admin full access to categories" 
ON public.categories FOR ALL TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Listings Policies
DROP POLICY IF EXISTS "Allow public read access to published listings" ON public.listings;
CREATE POLICY "Allow public read access to published listings" 
ON public.listings FOR SELECT USING (published = true OR public.is_admin());

DROP POLICY IF EXISTS "Allow admin full access to listings" ON public.listings;
CREATE POLICY "Allow admin full access to listings" 
ON public.listings FOR ALL TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Listing Items Policies
DROP POLICY IF EXISTS "Allow public read access to listing items" ON public.listing_items;
CREATE POLICY "Allow public read access to listing items" 
ON public.listing_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.listings 
        WHERE listings.id = listing_items.listing_id 
        AND (listings.published = true OR public.is_admin())
    )
);

DROP POLICY IF EXISTS "Allow admin full access to listing items" ON public.listing_items;
CREATE POLICY "Allow admin full access to listing items" 
ON public.listing_items FOR ALL TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Listing Categories Policies
DROP POLICY IF EXISTS "Allow public read access to listing categories" ON public.listing_categories;
CREATE POLICY "Allow public read access to listing categories" 
ON public.listing_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin full access to listing categories" ON public.listing_categories;
CREATE POLICY "Allow admin full access to listing categories" 
ON public.listing_categories FOR ALL TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Settings Policies
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.settings;
CREATE POLICY "Allow public read access to settings" 
ON public.settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin update access to settings" ON public.settings;
CREATE POLICY "Allow admin update access to settings" 
ON public.settings FOR UPDATE TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

---------------------------------------------------------
-- 6. Storage Bucket Policies
---------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('category-images', 'category-images', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public select of product images" ON storage.objects;
CREATE POLICY "Allow public select of product images" 
ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow admin manage of product images" ON storage.objects;
CREATE POLICY "Allow admin manage of product images" 
ON storage.objects FOR ALL TO authenticated 
USING (bucket_id = 'product-images' AND public.is_admin()) 
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Allow public select of category images" ON storage.objects;
CREATE POLICY "Allow public select of category images" 
ON storage.objects FOR SELECT USING (bucket_id = 'category-images');

DROP POLICY IF EXISTS "Allow admin manage of category images" ON storage.objects;
CREATE POLICY "Allow admin manage of category images" 
ON storage.objects FOR ALL TO authenticated 
USING (bucket_id = 'category-images' AND public.is_admin()) 
WITH CHECK (bucket_id = 'category-images' AND public.is_admin());

-- Populate initial default settings row
INSERT INTO public.settings (id, business_name, hero_title, hero_subtitle)
VALUES (true, 'Rustic Jewels', 'Shop All', 'Browse our Collection')
ON CONFLICT (id) DO NOTHING;

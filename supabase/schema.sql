-- Complete Supabase Database Schema for Rustic Jewels

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

-- C. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC, -- Nullable represents "Price on Inquiry"
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    featured_image TEXT NOT NULL, -- Cover photo URL
    gallery_images TEXT[] NOT NULL DEFAULT '{}', -- Array of extra photo URLs
    instagram_post_url TEXT,
    featured BOOLEAN NOT NULL DEFAULT false,
    published BOOLEAN NOT NULL DEFAULT true, -- Dynamic visibility toggle
    material TEXT, -- e.g. "18K Gold"
    collection TEXT, -- e.g. "Heritage Collection"
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- D. Product Categories Join Table (Many-to-Many Relationship)
CREATE TABLE IF NOT EXISTS public.product_categories (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- E. Settings Table (Single-row Global Configuration)
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

-- Apply timestamp triggers to products and settings
CREATE OR REPLACE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger function to automatically register new Supabase Auth sign-ups into the public.admins table
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.admins (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync auth.users with public.admins
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin();

---------------------------------------------------------
-- 3. Create Indexes for Query Optimization
---------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_prod_cat_product_id ON public.product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_prod_cat_category_id ON public.product_categories(category_id);

---------------------------------------------------------
-- 4. Enable Row Level Security (RLS) & Define Policies
---------------------------------------------------------

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if a user is an authorized Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- A. Admins Policies
CREATE POLICY "Admins list visible to logged-in admins only"
ON public.admins FOR SELECT TO authenticated USING (public.is_admin());

-- B. Categories Policies
CREATE POLICY "Public read access for categories"
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admin write access for categories"
ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- C. Products Policies
CREATE POLICY "Public read access for published products"
ON public.products FOR SELECT
USING (published = true OR (auth.uid() IS NOT NULL AND public.is_admin()));

CREATE POLICY "Admin write access for products"
ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- D. Product Categories Policies
CREATE POLICY "Public read access for product category mappings of published items"
ON public.product_categories FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.published = true)
    OR
    (auth.uid() IS NOT NULL AND public.is_admin())
);

CREATE POLICY "Admin write access for product category mappings"
ON public.product_categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- E. Settings Policies
CREATE POLICY "Public read access for settings"
ON public.settings FOR SELECT USING (true);

CREATE POLICY "Admin write access for settings"
ON public.settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

---------------------------------------------------------
-- 5. Storage Buckets Configuration & RLS Policies
---------------------------------------------------------

-- Create product-images and category-images buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for product-images bucket
CREATE POLICY "Allow public select of product images" 
ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Allow admin manage of product images" 
ON storage.objects FOR ALL TO authenticated 
USING (bucket_id = 'product-images' AND public.is_admin()) 
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- RLS policies for category-images bucket
CREATE POLICY "Allow public select of category images" 
ON storage.objects FOR SELECT USING (bucket_id = 'category-images');

CREATE POLICY "Allow admin manage of category images" 
ON storage.objects FOR ALL TO authenticated 
USING (bucket_id = 'category-images' AND public.is_admin()) 
WITH CHECK (bucket_id = 'category-images' AND public.is_admin());

-- Populate initial default settings row
INSERT INTO public.settings (id, business_name, hero_title, hero_subtitle)
VALUES (true, 'Rustic Jewels', 'Shop All', 'Browse our Collection')
ON CONFLICT (id) DO NOTHING;

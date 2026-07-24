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
    discount_percentage INTEGER NOT NULL DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
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
    bank_name TEXT,
    account_title TEXT,
    account_number TEXT,
    iban TEXT,
    easypaisa_number TEXT,
    jazzcash_number TEXT,
    payment_instructions TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- G. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    instagram_username TEXT,
    email TEXT,
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    notes TEXT,
    subtotal NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending Payment',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- H. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    item_number TEXT NOT NULL,
    price NUMERIC NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    listing_title TEXT NOT NULL,
    listing_image TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure settings columns exist (for existing DB migrations)
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS account_title TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS easypaisa_number TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS jazzcash_number TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS payment_instructions TEXT;

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

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
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
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(email);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

---------------------------------------------------------
-- 4. Enable Row Level Security (RLS)
---------------------------------------------------------
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

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

-- Orders Policies
DROP POLICY IF EXISTS "Allow authenticated admins read/write access to orders" ON public.orders;
CREATE POLICY "Allow authenticated admins read/write access to orders" 
ON public.orders FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow anyone to insert orders" ON public.orders;
CREATE POLICY "Allow anyone to insert orders" 
ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Order Items Policies
DROP POLICY IF EXISTS "Allow authenticated admins read/write access to order_items" ON public.order_items;
CREATE POLICY "Allow authenticated admins read/write access to order_items" 
ON public.order_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow anyone to insert order_items" ON public.order_items;
CREATE POLICY "Allow anyone to insert order_items" 
ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Order tracking search function (Aggregates order items and listing info securely)
CREATE OR REPLACE FUNCTION public.get_orders_by_search(p_order_id text, p_phone text, p_email text)
RETURNS TABLE (
    id UUID,
    order_id TEXT,
    customer_name TEXT,
    phone TEXT,
    instagram_username TEXT,
    email TEXT,
    shipping_address TEXT,
    city TEXT,
    notes TEXT,
    subtotal NUMERIC,
    total NUMERIC,
    status TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    items JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.order_id,
        o.customer_name,
        o.phone,
        o.instagram_username,
        o.email,
        o.shipping_address,
        o.city,
        o.notes,
        o.subtotal,
        o.total,
        o.status,
        o.rejection_reason,
        o.created_at,
        COALESCE(
            (SELECT jsonb_agg(jsonb_build_object(
                'id', oi.id,
                'listing_id', oi.listing_id,
                'item_number', oi.item_number,
                'price', oi.price,
                'quantity', oi.quantity,
                'listing_title', l.title,
                'listing_image', l.featured_image
            ))
             FROM public.order_items oi
             LEFT JOIN public.listings l ON l.id = oi.listing_id
             WHERE oi.order_id = o.id
            ), 
            '[]'::jsonb
        ) AS items
    FROM public.orders o
    WHERE (p_order_id <> '' AND o.order_id = p_order_id)
       OR (p_phone <> '' AND o.phone = p_phone)
       OR (p_email <> '' AND o.email = p_email)
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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


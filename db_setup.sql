-- =============================================================
-- מודלה (Modela) — Supabase SQL Setup
-- Run this in your Supabase SQL Editor
-- =============================================================

-- Categories (supports subcategories via parent_id)
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'box',
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    material TEXT,
    print_time TEXT,
    dimensions TEXT,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add price columns if they don't exist (safe for existing tables)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='price') THEN
        ALTER TABLE products ADD COLUMN price DECIMAL(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sale_price') THEN
        ALTER TABLE products ADD COLUMN sale_price DECIMAL(10,2);
    END IF;
END $$;

-- Product Media (images/videos)
CREATE TABLE IF NOT EXISTS product_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'image' CHECK (type IN ('image', 'video')),
    sort_order INT DEFAULT 0,
    is_cover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Files (downloadable STL, OBJ, etc.)
CREATE TABLE IF NOT EXISTS product_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    file_type TEXT,
    download_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings (key-value store)
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- ── RPC: Increment download count ──
CREATE OR REPLACE FUNCTION increment_download(file_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE product_files SET download_count = download_count + 1 WHERE id = file_id;
END;
$$ LANGUAGE plpgsql;

-- ── Row Level Security ──
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (safe to re-run)
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Public read media" ON product_media;
DROP POLICY IF EXISTS "Public read files" ON product_files;
DROP POLICY IF EXISTS "Public read approved comments" ON comments;
DROP POLICY IF EXISTS "Public read settings" ON site_settings;
DROP POLICY IF EXISTS "Public insert comments" ON comments;
DROP POLICY IF EXISTS "Public insert contact" ON contact_messages;
DROP POLICY IF EXISTS "Admin full categories" ON categories;
DROP POLICY IF EXISTS "Admin full products" ON products;
DROP POLICY IF EXISTS "Admin full media" ON product_media;
DROP POLICY IF EXISTS "Admin full files" ON product_files;
DROP POLICY IF EXISTS "Admin full comments" ON comments;
DROP POLICY IF EXISTS "Admin full contact" ON contact_messages;
DROP POLICY IF EXISTS "Admin full settings" ON site_settings;

-- Public read access for products, categories, media, files
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read media" ON product_media FOR SELECT USING (true);
CREATE POLICY "Public read files" ON product_files FOR SELECT USING (true);
CREATE POLICY "Public read approved comments" ON comments FOR SELECT USING (approved = true);
CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);

-- Public insert for comments and contact
CREATE POLICY "Public insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert contact" ON contact_messages FOR INSERT WITH CHECK (true);

-- Admin full access (authenticated users)
-- Using ALL + USING + WITH CHECK covers both filtering and existing/new records
CREATE POLICY "Admin full categories" ON categories FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin full products" ON products FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin full media" ON product_media FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin full files" ON product_files FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin full comments" ON comments FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin full contact" ON contact_messages FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin full settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_media_product ON product_media(product_id);
CREATE INDEX IF NOT EXISTS idx_files_product ON product_files(product_id);
CREATE INDEX IF NOT EXISTS idx_comments_product ON comments(product_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ── Storage Buckets ──
-- Create buckets automatically (will skip if already exist)
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-videos', 'product-videos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-files', 'product-files', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true) ON CONFLICT (id) DO NOTHING;

-- ── Storage Policies ──
-- Allow public to read files from all buckets
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
    DROP POLICY IF EXISTS "Public read product-videos" ON storage.objects;
    DROP POLICY IF EXISTS "Public read product-files" ON storage.objects;
    DROP POLICY IF EXISTS "Public read site-assets" ON storage.objects;
    DROP POLICY IF EXISTS "Auth upload product-images" ON storage.objects;
    DROP POLICY IF EXISTS "Auth upload product-videos" ON storage.objects;
    DROP POLICY IF EXISTS "Auth upload product-files" ON storage.objects;
    DROP POLICY IF EXISTS "Auth upload site-assets" ON storage.objects;
    DROP POLICY IF EXISTS "Auth update product-images" ON storage.objects;
    DROP POLICY IF EXISTS "Auth update product-videos" ON storage.objects;
    DROP POLICY IF EXISTS "Auth update product-files" ON storage.objects;
    DROP POLICY IF EXISTS "Auth delete product-images" ON storage.objects;
    DROP POLICY IF EXISTS "Auth delete product-videos" ON storage.objects;
    DROP POLICY IF EXISTS "Auth delete product-files" ON storage.objects;
END $$;

-- Public read
CREATE POLICY "Public read product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Public read product-videos" ON storage.objects FOR SELECT USING (bucket_id = 'product-videos');
CREATE POLICY "Public read product-files" ON storage.objects FOR SELECT USING (bucket_id = 'product-files');
CREATE POLICY "Public read site-assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');

-- Authenticated users can upload
CREATE POLICY "Auth upload product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth upload product-videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-videos' AND auth.role() = 'authenticated');
CREATE POLICY "Auth upload product-files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-files' AND auth.role() = 'authenticated');
CREATE POLICY "Auth upload site-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-assets' AND auth.role() = 'authenticated');

-- Authenticated users can update/delete
CREATE POLICY "Auth update product-images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth update product-videos" ON storage.objects FOR UPDATE USING (bucket_id = 'product-videos' AND auth.role() = 'authenticated');
CREATE POLICY "Auth update product-files" ON storage.objects FOR UPDATE USING (bucket_id = 'product-files' AND auth.role() = 'authenticated');
CREATE POLICY "Auth delete product-images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth delete product-videos" ON storage.objects FOR DELETE USING (bucket_id = 'product-videos' AND auth.role() = 'authenticated');
CREATE POLICY "Auth delete product-files" ON storage.objects FOR DELETE USING (bucket_id = 'product-files' AND auth.role() = 'authenticated');

-- ── Seed: Default Categories ──
-- No default categories — create your own via the admin panel at /admin/
-- Categories can have parent-child relationships for subcategories

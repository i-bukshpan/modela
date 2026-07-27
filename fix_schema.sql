-- =================================================================================
-- Modela 3D Print Shop - Schema Fixes & Storage Bucket
-- =================================================================================

-- 1. Ensure new columns exist on 'products' table
ALTER TABLE products ADD COLUMN IF NOT EXISTS cover_image text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated_cost numeric(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS material_weight_g numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS print_time_min integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS infill_percent integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS layer_height_mm numeric;

-- 2. Ensure new columns exist on 'filaments' table
ALTER TABLE filaments ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE filaments ADD COLUMN IF NOT EXISTS low_stock_threshold_g numeric DEFAULT 100;

-- 3. Disable RLS on core tables to ensure admin UI can write to them freely
-- (Assuming this is a personal project where RLS isn't strictly needed for admin)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_media DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE filaments DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE cost_presets DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;

-- 4. Create Storage Bucket for Product Images
-- We need to enable RLS on the storage schema for policies to work, but we will allow anon.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO NOTHING;

-- 5. Add Storage Policies to allow public access and uploads
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'products' );

CREATE POLICY "Allow Public Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'products' );

CREATE POLICY "Allow Public Updates" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'products' );

CREATE POLICY "Allow Public Deletes" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'products' );

-- =================================================================================
-- Modela 3D Print Shop - Complete Database Setup (v5.0 - Modela Schema)
-- 
-- Run this ENTIRE script in your Supabase SQL Editor.
-- It ensures that everything is stored in the 'modela' schema, 
-- resolving any issues with the Next.js app looking for that specific schema.
-- =================================================================================

-- Create the custom schema
CREATE SCHEMA IF NOT EXISTS modela;

-- Grant usage to public roles (so the app can access it)
GRANT USAGE ON SCHEMA modela TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA modela TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA modela TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA modela TO anon, authenticated, service_role;

-- 1. Create Core Tables in modela schema
CREATE TABLE IF NOT EXISTS modela.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  parent_id uuid REFERENCES modela.categories(id),
  sort_order int DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS modela.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category_id uuid REFERENCES modela.categories(id),
  price numeric(10,2),
  sale_price numeric(10,2),
  material text,
  material_color text,
  material_color_hex text,
  print_time text,
  print_time_min integer,
  dimensions text,
  finish_type text,
  printer_model text,
  material_weight_g numeric,
  infill_percent integer,
  layer_height_mm numeric,
  supports_used boolean DEFAULT false,
  post_processing text,
  print_date timestamp with time zone,
  quantity_printed integer DEFAULT 0,
  default_filament_id uuid,
  featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  estimated_cost numeric(10,2),
  cover_image text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS modela.product_media (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES modela.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  type text NOT NULL,
  is_cover boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS modela.product_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES modela.products(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_url text NOT NULL,
  file_size_bytes bigint,
  file_type text,
  mesh_volume_cm3 numeric,
  mesh_surface_cm2 numeric,
  bounding_x_mm numeric,
  bounding_y_mm numeric,
  bounding_z_mm numeric,
  download_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS modela.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES modela.products(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text,
  content text NOT NULL,
  approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS modela.filaments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand text NOT NULL,
  material text NOT NULL,
  color_name text NOT NULL,
  color_hex text NOT NULL,
  spool_weight_g numeric NOT NULL,
  remaining_weight_g numeric NOT NULL,
  cost_per_kg numeric NOT NULL,
  low_stock_threshold_g numeric DEFAULT 100,
  purchase_date date,
  barcode text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS modela.print_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  product_id uuid REFERENCES modela.products(id) ON DELETE SET NULL,
  is_custom_quote boolean DEFAULT false,
  uploaded_file_url text,
  original_filename text,
  calculated_volume_cm3 numeric,
  estimated_weight_g numeric,
  material_requested text,
  infill_percent integer,
  layer_height_mm numeric,
  assigned_printer text,
  filament_id uuid REFERENCES modela.filaments(id) ON DELETE SET NULL,
  estimated_print_time_min integer,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  status text DEFAULT 'pending_quote',
  quoted_price numeric(10,2),
  actual_material_cost numeric(10,2),
  actual_electricity_cost numeric(10,2),
  actual_total_cost numeric(10,2),
  profit_margin_pct numeric,
  paid boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS modela.expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  amount numeric(10,2) NOT NULL,
  date date NOT NULL,
  receipt_url text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS modela.revenue_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  amount numeric(10,2) NOT NULL,
  date date NOT NULL,
  job_id uuid REFERENCES modela.print_jobs(id) ON DELETE SET NULL,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS modela.cost_presets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  electricity_kwh_rate numeric NOT NULL,
  printer_wattage numeric NOT NULL,
  hourly_labor_rate numeric NOT NULL,
  failure_margin_pct numeric NOT NULL,
  default_profit_margin numeric NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert a default preset if none exists
INSERT INTO modela.cost_presets (name, electricity_kwh_rate, printer_wattage, hourly_labor_rate, failure_margin_pct, default_profit_margin, is_default)
SELECT 'Default Profile', 0.65, 200, 60, 10, 30, true
WHERE NOT EXISTS (SELECT 1 FROM modela.cost_presets WHERE is_default = true);

CREATE TABLE IF NOT EXISTS modela.blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  cover_image text,
  author_id uuid, 
  status text DEFAULT 'draft',
  tags text[],
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS modela.contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  subject text,
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add missing columns just in case the tables were created previously
ALTER TABLE modela.products ADD COLUMN IF NOT EXISTS cover_image text;
ALTER TABLE modela.products ADD COLUMN IF NOT EXISTS estimated_cost numeric(10,2);
ALTER TABLE modela.products ADD COLUMN IF NOT EXISTS material_weight_g numeric;
ALTER TABLE modela.products ADD COLUMN IF NOT EXISTS print_time_min integer;
ALTER TABLE modela.products ADD COLUMN IF NOT EXISTS infill_percent integer;
ALTER TABLE modela.products ADD COLUMN IF NOT EXISTS layer_height_mm numeric;

ALTER TABLE modela.filaments ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE modela.filaments ADD COLUMN IF NOT EXISTS low_stock_threshold_g numeric DEFAULT 100;

-- 3. Disable RLS in modela schema (allows anon/authenticated to bypass RLS)
ALTER TABLE modela.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE modela.product_media DISABLE ROW LEVEL SECURITY;
ALTER TABLE modela.product_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE modela.filaments DISABLE ROW LEVEL SECURITY;
ALTER TABLE modela.print_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE modela.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE modela.revenue_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE modela.cost_presets DISABLE ROW LEVEL SECURITY;
ALTER TABLE modela.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE modela.contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE modela.blog_posts DISABLE ROW LEVEL SECURITY;

-- 4. Create Storage Bucket for Product Images (storage schema is used for buckets)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO NOTHING;

-- 5. Add Storage Policies to allow public access and uploads
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'products' );

DROP POLICY IF EXISTS "Allow Public Uploads" ON storage.objects;
CREATE POLICY "Allow Public Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'products' );

DROP POLICY IF EXISTS "Allow Public Updates" ON storage.objects;
CREATE POLICY "Allow Public Updates" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'products' );

DROP POLICY IF EXISTS "Allow Public Deletes" ON storage.objects;
CREATE POLICY "Allow Public Deletes" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'products' );

-- Ensure future tables get permissions automatically (optional but helpful)
ALTER DEFAULT PRIVILEGES IN SCHEMA modela GRANT ALL ON TABLES TO anon, authenticated, service_role;

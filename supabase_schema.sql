-- =================================================================================
-- Modela 3D Print Shop v3.0 - Supabase Schema
-- Paste this script into your Supabase SQL Editor and click 'Run'.
-- It uses "IF NOT EXISTS" so it will only create the tables you are missing.
-- =================================================================================

-- 1. Core Store

CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  parent_id uuid REFERENCES categories(id),
  sort_order int DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category_id uuid REFERENCES categories(id),
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
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_media (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  type text NOT NULL,
  is_cover boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text,
  content text NOT NULL,
  approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Inventory

CREATE TABLE IF NOT EXISTS filaments (
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

-- 3. Print Jobs

CREATE TABLE IF NOT EXISTS print_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  is_custom_quote boolean DEFAULT false,
  uploaded_file_url text,
  original_filename text,
  calculated_volume_cm3 numeric,
  estimated_weight_g numeric,
  material_requested text,
  infill_percent integer,
  layer_height_mm numeric,
  assigned_printer text,
  filament_id uuid REFERENCES filaments(id) ON DELETE SET NULL,
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

-- 4. Finance

CREATE TABLE IF NOT EXISTS expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  amount numeric(10,2) NOT NULL,
  date date NOT NULL,
  receipt_url text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS revenue_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  amount numeric(10,2) NOT NULL,
  date date NOT NULL,
  job_id uuid REFERENCES print_jobs(id) ON DELETE SET NULL,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS cost_presets (
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
INSERT INTO cost_presets (name, electricity_kwh_rate, printer_wattage, hourly_labor_rate, failure_margin_pct, default_profit_margin, is_default)
SELECT 'Default Profile', 0.65, 200, 60, 10, 30, true
WHERE NOT EXISTS (SELECT 1 FROM cost_presets WHERE is_default = true);

-- 5. Blog

CREATE TABLE IF NOT EXISTS blog_posts (
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

CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text,
  content text NOT NULL,
  approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CRM & Site Settings

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  subject text,
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name text NOT NULL,
  author_info text,
  author_avatar_url text,
  author_avatar_init text,
  content text NOT NULL,
  rating integer DEFAULT 5,
  featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update timestamp function for triggers (optional but good practice)
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

-- Triggers for updated_at (optional)
DROP TRIGGER IF EXISTS update_products_modtime ON products;
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_filaments_modtime ON filaments;
CREATE TRIGGER update_filaments_modtime BEFORE UPDATE ON filaments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_print_jobs_modtime ON print_jobs;
CREATE TRIGGER update_print_jobs_modtime BEFORE UPDATE ON print_jobs FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_blog_posts_modtime ON blog_posts;
CREATE TRIGGER update_blog_posts_modtime BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

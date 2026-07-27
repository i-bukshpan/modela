CREATE TABLE IF NOT EXISTS modela.site_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE modela.site_settings DISABLE ROW LEVEL SECURITY;

INSERT INTO modela.site_settings (key, value)
VALUES ('homepage_stats', '{"projects": 500, "customers": 200, "satisfaction": 99, "printers": 8}'::jsonb)
ON CONFLICT (key) DO NOTHING;

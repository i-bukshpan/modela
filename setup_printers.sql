CREATE TABLE IF NOT EXISTS printers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE print_jobs ADD COLUMN IF NOT EXISTS printer_id uuid REFERENCES printers(id) ON DELETE SET NULL;

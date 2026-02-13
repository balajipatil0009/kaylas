-- RUN THIS IN SUPABASE SQL EDITOR
-- The error "Could not find the 'mobile' column" means this column is missing in your database.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS mobile VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Check if columns exist after running:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'leads';

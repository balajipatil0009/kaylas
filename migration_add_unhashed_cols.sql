-- Add unhashed email and phone columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS mobile VARCHAR(50); -- Using 'mobile' to match payload field name

-- Ensure existing rows have null or default values
-- If you want to backfill, you would need the original data which is hashed, so it's not possible to backfill easily.

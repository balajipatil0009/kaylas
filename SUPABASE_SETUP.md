# Quick SQL Query for Supabase

## 📋 Copy and paste this into Supabase SQL Editor

```sql
-- Create the leads table
CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    lead_id VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email_hash VARCHAR(64) NOT NULL,
    phone_hash VARCHAR(64) NOT NULL,
    stage VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_lead_id ON leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-update
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 🔍 How to Run:

1. Go to **[Supabase Dashboard](https://app.supabase.com/)**
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the SQL above
6. Paste into the editor
7. Click **Run** or press `Ctrl+Enter`

## ✅ Verify Table Creation:

```sql
-- Check if table exists
SELECT * FROM leads LIMIT 5;
```

## 📊 View Table Structure:

```sql
-- View table schema
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'leads';
```

## 🗑️ Drop Table (if needed):

```sql
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS leads CASCADE;
```

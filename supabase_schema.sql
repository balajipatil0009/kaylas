-- Create the leads table in Supabase
CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    lead_id VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email_hash VARCHAR(64) NOT NULL,  -- SHA256 produces 64 character hex string
    phone_hash VARCHAR(64) NOT NULL,  -- SHA256 produces 64 character hex string
    stage VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on lead_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_lead_id ON leads(lead_id);

-- Create an index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Optional: Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a trigger to call the function before update
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Enable Row Level Security (RLS) if needed
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Optional: Create a policy for authenticated users
-- CREATE POLICY "Enable read access for authenticated users" 
-- ON leads FOR SELECT 
-- TO authenticated 
-- USING (true);

-- Optional: Create a policy for service role (for your API)
-- CREATE POLICY "Enable insert for service role" 
-- ON leads FOR INSERT 
-- TO service_role 
-- WITH CHECK (true);

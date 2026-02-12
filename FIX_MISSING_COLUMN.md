# ⚠️ Critical Database Fix Required

The server error logs indicate that the **`mobile`** column is missing from your Supabase database.

## Solution

Please run the following SQL command in your [Supabase SQL Editor](https://app.supabase.com/):

```sql
ALTER TABLE leads ADD COLUMN IF NOT EXISTS mobile VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email VARCHAR(255);
```

After running this, **restart your server**:

1. Stop the current server (Ctrl+C).
2. Run `node index.js`.

This will resolve the `PGRST204` error.

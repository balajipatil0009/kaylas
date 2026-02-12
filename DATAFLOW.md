# Data Flow Diagram

## System Architecture

```
┌─────────────────┐
│   Kylas CRM     │
│  (Webhook API)  │
└────────┬────────┘
         │
         │ POST /kylas-webhook
         │ { event: "lead.created", data: {...} }
         │
         ▼
┌─────────────────────────────────────────────┐
│         Express Server (index.js)            │
│  ┌────────────────────────────────────────┐ │
│  │  1. Receive Webhook Data               │ │
│  │     - Validate payload                 │ │
│  │     - Log to kylas_log.txt             │ │
│  └────────────┬───────────────────────────┘ │
│               │                              │
│               ▼                              │
│  ┌────────────────────────────────────────┐ │
│  │  2. Hash Sensitive Data                │ │
│  │     - Email → SHA256 hash (64 chars)   │ │
│  │     - Phone → SHA256 hash (64 chars)   │ │
│  │                                        │ │
│  │  Example:                              │ │
│  │  rahul@email.com →                     │ │
│  │  4373b7c77c318eab2f14859814612c34...   │ │
│  └────────────┬───────────────────────────┘ │
│               │                              │
│               ▼                              │
│  ┌────────────────────────────────────────┐ │
│  │  3. Prepare Data Object                │ │
│  │     {                                  │ │
│  │       lead_id: "123456",               │ │
│  │       first_name: "Rahul",             │ │
│  │       last_name: "Sharma",             │ │
│  │       email_hash: "4373b7c7...",       │ │
│  │       phone_hash: "7619ee8c...",       │ │
│  │       stage: "New Lead",               │ │
│  │       created_at: "2026-02-12..."      │ │
│  │     }                                  │ │
│  └────────────┬───────────────────────────┘ │
│               │                              │
└───────────────┼──────────────────────────────┘
                │
                │ Insert via Supabase Client
                │
                ▼
┌─────────────────────────────────────────────┐
│          Supabase PostgreSQL                │
│  ┌────────────────────────────────────────┐ │
│  │           Table: leads                 │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │ id            │ 1                │  │ │
│  │  │ lead_id       │ "123456"         │  │ │
│  │  │ first_name    │ "Rahul"          │  │ │
│  │  │ last_name     │ "Sharma"         │  │ │
│  │  │ email_hash    │ "4373b7c77..."   │  │ │
│  │  │ phone_hash    │ "7619ee8ce..."   │  │ │
│  │  │ stage         │ "New Lead"       │  │ │
│  │  │ created_at    │ 2026-02-12...    │  │ │
│  │  │ updated_at    │ 2026-02-12...    │  │ │
│  │  └──────────────────────────────────┘  │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Security Flow

```
Original Data          Hashing Process              Stored in DB
─────────────         ──────────────────            ────────────

📧 Email:             SHA256 Algorithm              ✅ Hashed:
rahul@email.com  ──>  (One-way encryption)   ──>   4373b7c77c318e...
                                                     (64 characters)

📱 Phone:             SHA256 Algorithm              ✅ Hashed:
9876543210       ──>  (One-way encryption)   ──>   7619ee8cea4918...
                                                     (64 characters)

❌ Cannot reverse-engineer original data from hash
✅ Same input always produces same hash (for verification)
✅ Different inputs produce different hashes
```

## File Structure

```
kailas/
│
├── 📄 index.js                    ← Main server (webhook handler)
├── 📄 package.json                ← Dependencies & scripts
│
├── 🔐 .env                        ← Supabase credentials (SECRET!)
├── 📋 .env.example                ← Environment template
│
├── 🗄️  supabase_schema.sql        ← Database table creation
├── 📖 SUPABASE_SETUP.md           ← Quick SQL reference
│
├── 🧪 test-hash.js                ← Test hashing functionality
├── 📊 kylas_log.txt               ← Webhook logs (debugging)
│
├── 📚 README.md                   ← Main documentation
├── 📝 IMPLEMENTATION_SUMMARY.md   ← Implementation details
└── 🎨 DATAFLOW.md                 ← This file
```

## Environment Variables Flow

```
1. Create .env file
   ├── SUPABASE_URL=https://xxx.supabase.co
   ├── SUPABASE_ANON_KEY=eyJxxx...
   └── PORT=3000

2. Load in index.js
   require("dotenv").config()
          ↓
   process.env.SUPABASE_URL
   process.env.SUPABASE_ANON_KEY

3. Initialize Supabase Client
   createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

## Request/Response Flow

```
POST Request → Validation → Hashing → Database → Response

┌──────────────┐
│   Request    │
│   Payload    │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ❌ Invalid
│  Validation  │────────────────> 400 Bad Request
└──────┬───────┘
       │ ✅ Valid
       ▼
┌──────────────┐
│   Hashing    │  (SHA256)
└──────┬───────┘
       │
       ▼
┌──────────────┐     ❌ Error
│   Database   │────────────────> 500 Server Error
└──────┬───────┘
       │ ✅ Success
       ▼
┌──────────────┐
│   Response   │  200 OK
│  { status:   │
│   "success"} │
└──────────────┘
```

## Testing Flow

```
1. Run Hash Test:
   $ node test-hash.js
   ✅ Tests SHA256 functionality

2. Start Server:
   $ npm start
   ✅ Server listening on port 3000

3. Send Test Webhook:
   $ curl -X POST localhost:3000/kylas-webhook
   ✅ Check kylas_log.txt for raw data
   ✅ Check Supabase for stored data

4. Verify in Supabase:
   SELECT * FROM leads;
   ✅ See hashed email_hash and phone_hash
```

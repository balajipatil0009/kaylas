require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Middleware to parse JSON
app.use(express.json());

/**
 * Hash a string using SHA256
 * @param {string} data - The data to hash
 * @returns {string} - The hashed string
 */
function hashSHA256(data) {
    if (!data) return null;
    return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Store lead data to Supabase
 * @param {object} lead - The lead data
 */
async function storeToSupabase(lead) {
    try {
        // Hash email and phone
        const hashedEmail = hashSHA256(lead.email);
        const hashedPhone = hashSHA256(lead.mobile);

        // Prepare data for insertion
        const leadData = {
            lead_id: lead.lead_id,
            first_name: lead.first_name,
            last_name: lead.last_name,
            email_hash: hashedEmail,
            phone_hash: hashedPhone,
            stage: lead.stage,
            created_at: new Date().toISOString()
        };

        // Insert to Supabase
        const { data, error } = await supabase
            .from("leads")
            .upsert([leadData], { onConflict: "lead_id" });

        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }

        console.log(`✅ Lead ${lead.lead_id} stored successfully in Supabase`);
        return data;

    } catch (error) {
        console.error("Error storing to Supabase:", error);
        throw error;
    }
}

// Webhook route
app.post("/kylas-webhook", async (req, res) => {
    try {
        const payload = req.body;

        console.log("Request Body:", JSON.stringify(payload, null, 2));

        if (!payload || !payload.event) {
            return res.status(400).json({ message: "Invalid payload" });
        }

        console.log("Webhook received:", payload.event);

        // 🔹 1. Handle Lead Created
        if (payload.event === "lead.created") {
            const lead = payload.data;
            console.log(`Processing New Lead: ${lead.first_name} ${lead.last_name} (ID: ${lead.lead_id})`);

            await storeToSupabase(lead);
        }

        // 🔹 2. Handle Deal Updated
        if (payload.event === "deal.updated") {
            const deal = payload.data;

            const stage = deal.stage?.toLowerCase();

            if (stage === "won" || stage === "interested") {

                console.log(`🎯 Deal moved to ${stage.toUpperCase()}: ${deal.deal_name} (ID: ${deal.deal_id})`);

                const dealData = {
                    deal_id: deal.deal_id,
                    deal_name: deal.deal_name,
                    deal_value: deal.deal_value,
                    stage: deal.stage,
                    owner_id: deal.owner?.id || null,
                    owner_name: deal.owner?.name || null,
                    lead_id: deal.lead?.lead_id || null,
                    updated_at: new Date().toISOString()
                };

                const { error } = await supabase
                    .from("deals")
                    .upsert([dealData], { onConflict: "deal_id" });

                if (error) {
                    console.error("Supabase deal error:", error);
                    throw error;
                }

                console.log(`✅ Deal ${deal.deal_id} stored/updated successfully`);
            }
        }

        return res.status(200).json({ status: "success" });

    } catch (error) {
        console.error("Webhook error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});


// Health check route
app.get("/", (req, res) => {
    res.send("Webhook server running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

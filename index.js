require("dotenv").config();
const express = require("express");
const fs = require("fs");
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
            .insert([leadData]);

        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }

        console.log("✅ Lead stored successfully in Supabase");
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

        // Basic validation
        if (!payload || !payload.event) {
            return res.status(400).json({ message: "Invalid payload" });
        }

        console.log("Webhook received:", payload.event);

        // Log raw payload (for debugging)
        fs.appendFileSync(
            "kylas_log.txt",
            JSON.stringify(payload) + "\n"
        );

        // Handle specific events
        if (payload.event === "lead.created") {
            const lead = payload.data;

            console.log("New Lead:");
            console.log("Name:", lead.first_name, lead.last_name);
            console.log("Email:", lead.email);
            console.log("Mobile:", lead.mobile);

            // Store to Supabase with hashed email and phone
            await storeToSupabase(lead);
        }

        res.status(200).json({ status: "success" });

    } catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Health check route
app.get("/", (req, res) => {
    res.send("Webhook server running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

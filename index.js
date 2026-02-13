require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Meta Configuration
const META_PIXEL_ID = process.env.META_PIXEL_ID;
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_TEST_CODE = process.env.META_TEST_CODE; // Add this for testing

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
    // Normalize data: lowercase and trim whitespace
    const normalizedData = data.trim().toLowerCase();
    return crypto.createHash("sha256").update(normalizedData).digest("hex");
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
            email: lead.email,      // Store actual email
            mobile: lead.mobile,    // Store actual mobile
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
/**
 * Send event to Meta Conversions API
 * @param {object} lead - The lead data
 * @param {string} eventName - The name of the event (e.g., 'Lead', 'Qualified Lead')
 */
async function sendToMetaCAPI(lead, eventName) {
    if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
        console.warn("⚠️ Meta Pixel ID or Access Token missing. Skipping CAPI event.");
        return;
    }

    try {
        // Prepare User Data (Hashed)
        const emailHash = hashSHA256(lead.email);
        const phoneHash = hashSHA256(lead.mobile);

        const payload = {
            data: [
                {
                    event_name: eventName,
                    event_time: Math.floor(Date.now() / 1000),
                    action_source: "website",
                    event_id: lead.lead_id, // Deduplication ID
                    user_data: {
                        em: emailHash,
                        ph: phoneHash,
                        fn: hashSHA256(lead.first_name),
                        ln: hashSHA256(lead.last_name)
                    },
                    custom_data: {
                        lead_stage: lead.stage,
                        value: lead.stage === 'won' ? 100 : 0,
                        currency: "INR"
                    }
                }
            ]
        };

        // Add Test Event Code if available (for testing in Events Manager)
        if (META_TEST_CODE) {
            payload.test_event_code = META_TEST_CODE;
            console.log(`🧪 Sending as Test Event: ${META_TEST_CODE}`);
            console.log(payload);

        }

        const url = `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`;

        const response = await axios.post(url, payload);
        console.log(`✅ Sent '${eventName}' event to Meta CAPI for Lead ${lead.lead_id}`);
        console.log(response.data);

    } catch (error) {
        console.error("❌ Error sending to Meta CAPI:");
        if (error.response) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

app.post("/kylas-webhook", async (req, res) => {
    try {
        const payload = req.body;

        // console.log("Request Body:", JSON.stringify(payload, null, 2));

        if (!payload || !payload.event) {
            return res.status(400).json({ message: "Invalid payload" });
        }

        console.log("Webhook received:", payload.event);

        // 🔹 1. Handle Lead Events (Created or Updated)
        if (payload.event === "LEAD_UPDATED" || payload.event === "lead.updated") {
            const entity = payload.entity || payload.data; // Handle both structures if needed

            if (!entity) {
                console.log("⚠️ No entity/data found in payload");
                return res.status(200).json({ status: "ignored" });
            }

            // Extract Stage
            // Check pipelineStage object or direct field
            let stage = "";
            if (entity.pipelineStage && entity.pipelineStage.value) {
                stage = entity.pipelineStage.value;
            } else if (entity.stage) {
                stage = entity.stage;
            }
            stage = stage.toLowerCase();

            if (stage === "won" || stage === "interested") {
                console.log(`Processing Lead Event(${payload.event}): ${entity.firstName} ${entity.lastName} (ID: ${entity.id})`);

                // Extract Phone (Primary or First)
                let phone = "";
                try {
                    if (entity.phoneNumbers && Array.isArray(entity.phoneNumbers) && entity.phoneNumbers.length > 0) {
                        const primaryPhone = entity.phoneNumbers.find(p => p.primary);
                        phone = primaryPhone ? primaryPhone.value : entity.phoneNumbers[0].value;
                    } else if (entity.mobile) {
                        phone = entity.mobile;
                    }
                    console.log("Extracted Phone:", phone);
                } catch (e) {
                    console.error("Error extracting phone:", e);
                }

                // Extract Email (Primary or First)
                let email = "";
                try {
                    if (entity.emails && Array.isArray(entity.emails) && entity.emails.length > 0) {
                        const primaryEmail = entity.emails.find(e => e.primary);
                        email = primaryEmail ? primaryEmail.value : entity.emails[0].value;
                    } else if (entity.email) {
                        email = entity.email;
                    }


                    console.log("Extracted Email:", email);
                } catch (e) {
                    console.error("Error extracting email:", e);
                }

                try {
                    const leadData = {
                        lead_id: entity.id.toString(), // Ensure ID is string
                        first_name: entity.firstName || entity.first_name,
                        last_name: entity.lastName || entity.last_name,
                        email: email, // Will be hashed in storeToSupabase
                        mobile: phone, // Will be hashed in storeToSupabase
                        stage: stage,
                        // created_at will be handled by storeToSupabase or DB default
                    };
                    console.log("Preparing database insert with:", JSON.stringify(leadData, null, 2));

                    await storeToSupabase(leadData);
                } catch (dbError) {
                    console.error("Error preparing/storing data:", dbError);
                    throw dbError;
                }

                // 🔹 Send to Meta Conversions API
                try {
                    let eventName = "Lead"; // Default
                    if (stage === "won") {
                        eventName = "Purchase"; // Or 'Purchase' if revenue associated
                    } else if (stage === "interested") {
                        eventName = "Schedule";
                    }

                    await sendToMetaCAPI({
                        lead_id: entity.id.toString(),
                        first_name: entity.firstName || entity.first_name,
                        last_name: entity.lastName || entity.last_name,
                        email: email,
                        mobile: phone,
                        stage: stage
                    }, eventName);

                } catch (capiError) {
                    console.error("Error in CAPI step:", capiError);
                }

            } else {
                console.log(`ℹ️ Lead stage '${stage}' not tracked.`);
            }
        }

        // 🔹 2. Handle Deal Updated (If you still need this separate logic, adjust as needed)
        // Note: The sample payload was for LEAD_UPDATED but had pipelineStage "Interested".
        // If "deal.updated" follows similar structure, we should update this too.
        // For now, I'll keep the lead logic robust as that was the main request.

        // 🔹 3. Handle Other Events (Log & Leave)
        else {
            console.log("⚠️ Unhandled Event:", payload.event);
            console.log("Payload State:", JSON.stringify(payload, null, 2));
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
    console.log(`Server running on port ${PORT} `);
});

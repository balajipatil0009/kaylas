const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 3000 || process.env.PORT;

// Middleware to parse JSON
app.use(express.json());

// Webhook route
app.post("/kylas-webhook", (req, res) => {
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

            // 👉 Add your DB logic here
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

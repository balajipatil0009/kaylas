const crypto = require("crypto");

/**
 * Test SHA256 hashing functionality
 */

function hashSHA256(data) {
    if (!data) return null;
    return crypto.createHash("sha256").update(data).digest("hex");
}

// Test data
const testEmail = "rahul@email.com";
const testPhone = "9876543210";

console.log("=== SHA256 Hashing Test ===\n");

console.log("Original Email:", testEmail);
console.log("Hashed Email:  ", hashSHA256(testEmail));
console.log();

console.log("Original Phone:", testPhone);
console.log("Hashed Phone:  ", hashSHA256(testPhone));
console.log();

console.log("Hash Length:", hashSHA256(testEmail).length, "characters");
console.log();

// Verify consistency
console.log("=== Consistency Test ===");
const hash1 = hashSHA256(testEmail);
const hash2 = hashSHA256(testEmail);
console.log("Same input produces same hash:", hash1 === hash2 ? "✅ PASS" : "❌ FAIL");
console.log();

// Verify uniqueness
const differentEmail = "sharma@email.com";
const hash3 = hashSHA256(differentEmail);
console.log("Different inputs produce different hashes:", hash1 !== hash3 ? "✅ PASS" : "❌ FAIL");
console.log();

console.log("=== Test Complete ===");

import mongoose from "mongoose";
import dns from "dns";

// ── DNS Fix ──────────────────────────────────────────────────────────────────
// On Windows, the system DNS server often refuses SRV lookups used by
// mongodb+srv:// URIs, causing "querySrv ECONNREFUSED". Forcing IPv4 and
// overriding the resolver with Google's public DNS (8.8.8.8 / 8.8.4.4)
// fixes this without requiring any infrastructure changes.
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

// Disable buffering so queries fail immediately instead of timing out after 10s
mongoose.set("bufferCommands", false);

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function Connection() {
    const URL = process.env.MONGODB_CONNECTION_STRING;

    if (!URL) {
        throw new Error(
            "MONGODB_CONNECTION_STRING is undefined! Check your .env file."
        );
    }

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`Connecting to MongoDB... (attempt ${attempt}/${MAX_RETRIES})`);
            await mongoose.connect(URL, {
                family: 4,                        // force IPv4 — avoids SRV/IPv6 issues on Windows
                serverSelectionTimeoutMS: 15000,  // fail fast if Atlas unreachable
                connectTimeoutMS: 15000,
            });
            console.log("✅ MongoDB connected successfully.");
            return; // success — exit
        } catch (err) {
            console.error(`❌ Connection attempt ${attempt} failed: ${err.message}`);
            if (attempt < MAX_RETRIES) {
                console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
                await sleep(RETRY_DELAY_MS);
            } else {
                throw err; // all retries exhausted — let server.js handle it
            }
        }
    }
}
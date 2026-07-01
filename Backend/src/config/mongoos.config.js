import mongoose from "mongoose";

// Disable buffering so queries fail immediately instead of timing out after 10s
mongoose.set("bufferCommands", false);

export default async function Connection() {
    const URL = process.env.MONGODB_CONNECTION_STRING;

    if (!URL) {
        throw new Error(
            "MONGODB_CONNECTION_STRING is undefined! Check your .env file."
        );
    }

    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(URL);
        console.log("✅ MongoDB connected successfully.");
    } catch (err) {
        console.error(`❌ MongoDB connection failed: ${err.message}`);
        throw err;
    }
}
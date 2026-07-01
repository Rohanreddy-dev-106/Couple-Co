import "dotenv/config"; // ← MUST be first line so env vars load before anything else
import server from "./index.js";
import Connection from "./src/config/mongoos.config.js";
import seedAdmin from "./src/config/seed.admin.js";
import seedProducts from "./src/config/seed.products.js";

// Debug: confirm the URI is loaded
console.log("MONGODB_CONNECTION_STRING =", process.env.MONGODB_CONNECTION_STRING);

const PORT = process.env.PORT || 4000;

// ✅ Correct startup order:
//    1. Connect to MongoDB
//    2. Run seeds
//    3. Start HTTP server
async function startServer() {
    try {
        await Connection();      // connects DB — throws if it fails
        await seedAdmin();       // only runs after DB is confirmed open
        await seedProducts();    // same

        server.listen(PORT, () => {
            console.log(`✅ Server is Up and Running at PORT ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Startup failed:", error.message);
        process.exit(1);         // don't leave a zombie process running
    }
}

startServer();
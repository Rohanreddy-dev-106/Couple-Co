import Usermodel from "../Users/users.schema.js";
import bcrypt from "bcrypt";

export default async function seedAdmin() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.log("Admin credentials not found in .env, skipping admin seed.");
            return;
        }

        // Check if admin already exists
        const existingAdmin = await Usermodel.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log("Admin account already exists.");
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        const admin = new Usermodel({
            name: "Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
        });

        await admin.save();
        console.log(`Default admin account created: ${adminEmail}`);
    } catch (error) {
        console.log("Admin seed error:", error.message);
    }
}

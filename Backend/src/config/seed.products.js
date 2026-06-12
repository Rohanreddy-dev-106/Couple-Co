import mongoose from "mongoose";
import productmodel from "../products/product.schema.js";
import Usermodel from "../Users/users.schema.js";

export default async function seedProducts() {
    try {
        const admin = await Usermodel.findOne({ email: "admin@gmail.com" });
        if (!admin) {
            console.log("Admin user not found. Please run the server once to seed the admin.");
            return;
        }

        const dummyProducts = [
            {
                name: "Classic White T-Shirt",
                description: "A premium cotton classic white t-shirt for everyday wear.",
                price: 499,
                stock: 150,
                category: "Casual",
                images: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
                sizes: ["S", "M", "L", "XL"],
                createdBy: admin._id
            },
            {
                name: "Midnight Black Tee",
                description: "Sleek and stylish midnight black t-shirt made with breathable fabric.",
                price: 599,
                stock: 120,
                category: "Premium",
                images: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500",
                sizes: ["M", "L", "XL"],
                createdBy: admin._id
            },
            {
                name: "Athletic Performance Shirt",
                description: "Moisture-wicking athletic shirt designed for high-intensity workouts.",
                price: 899,
                stock: 80,
                category: "Sports",
                images: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
                sizes: ["S", "M", "L"],
                createdBy: admin._id
            },
            {
                name: "Vintage Graphic Print",
                description: "Retro-style graphic print t-shirt for a casual weekend look.",
                price: 649,
                stock: 45,
                category: "Casual",
                images: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=500",
                sizes: ["S", "M", "L", "XL", "XXL"],
                createdBy: admin._id
            },
            {
                name: "Organic Cotton Polo",
                description: "Environmentally friendly organic cotton polo shirt with a classic collar.",
                price: 1099,
                stock: 60,
                category: "Premium",
                images: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500",
                sizes: ["M", "L", "XL"],
                createdBy: admin._id
            },
            {
                name: "Summer V-Neck",
                description: "Lightweight and breathable v-neck t-shirt, perfect for summer.",
                price: 399,
                stock: 200,
                category: "Casual",
                images: "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=500",
                sizes: ["S", "M", "L"],
                createdBy: admin._id
            },
             {
                name: "Heavyweight Boxy Tee",
                description: "Streetwear inspired heavyweight boxy fit t-shirt.",
                price: 799,
                stock: 30,
                category: "Premium",
                images: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500",
                sizes: ["M", "L", "XL"],
                createdBy: admin._id
            },
            {
                name: "Quick-Dry Running Tee",
                description: "Ultra-lightweight quick-dry tee for long distance running.",
                price: 949,
                stock: 90,
                category: "Sports",
                images: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500",
                sizes: ["S", "M", "L", "XL"],
                createdBy: admin._id
            }
        ];

        let addedCount = 0;
        for (const product of dummyProducts) {
            const exists = await productmodel.findOne({ name: product.name });
            if (!exists) {
                await productmodel.create(product);
                addedCount++;
                console.log(`Added product: ${product.name}`);
            } else {
                console.log(`Product already exists: ${product.name}`);
            }
        }

        console.log(`Product seeding complete. Added ${addedCount} new products.`);

    } catch (error) {
        console.log("Product seeding error:", error.message);
    }
}

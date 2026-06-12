import dotenv from "dotenv";
dotenv.config();
import Connection from "../config/mongoos.config.js";
import Productrepo from "../products/product.repo.js";

async function run() {
    try {
        await Connection();
        console.log("Connected to MongoDB");
        const repo = new Productrepo();
        const products = await repo.readproducts();
        console.log("Fetched products count:", products.length);
        if (products.length > 0) {
            const firstProduct = products[0];
            console.log("Attempting to delete product:", firstProduct._id, firstProduct.name);
            const res = await repo.deleteproduct(firstProduct._id.toString());
            console.log("Deletion result:", res);
        } else {
            console.log("No products in DB to delete");
        }
        process.exit(0);
    } catch (err) {
        console.error("Test execution failed:", err);
        process.exit(1);
    }
}

run();

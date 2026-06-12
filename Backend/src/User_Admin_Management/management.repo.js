import productmodel from "../products/product.schema.js";
import Deleteplease from "../util/user_admin_management.js";
import orderModel from "../Orders/order.schema.js";
export default class Managementrepo {

    //search product public/admin
    async searchproducts(name, description, category) {
        try {
            const term = name || description || category;
            if (!term || !term.trim()) {
                return await productmodel.find({});
            }
            // Case-insensitive regex search across name, category, and description
            const regex = new RegExp(term.trim(), "i");
            const products = await productmodel.find({
                $or: [
                    { name: { $regex: regex } },
                    { category: { $regex: regex } },
                    { description: { $regex: regex } },
                ]
            });
            return products;
        }
        catch (error) {
            console.log(error.message);
            return [];
        }
    }
    //getallproducts only for admin/Testing
    async getallproducts() {
        try {
            return await productmodel.find({});
        } catch (error) {
            console.log(error.message);
        }
    }
    //public/admin api
    async productdetails(productName) {
        try {
            const product = await productmodel.findOne({
                name: productName,
            });
            return product.description;
        } catch (error) {
            console.log(error.message);
        }
    }
    //public/admin
    async filterproductbycat(category) {
        try {
            const products = await productmodel.find({ category: category });
            return products;
        } catch (error) {
            console.log(error.message);
        }
    }
    //public/admin
 async filterproductbyprice(minprice, maxprice) {
    try {
        const min = Number(minprice) || 0;
        const max = Number(maxprice) || Number.MAX_SAFE_INTEGER;
        const products = await productmodel.find({
            $and: [
                { price: { $gte: min } },
                { price: { $lte: max } }
            ]
        });
        return products;
    } catch (error) {
        console.log("Error filtering products by price:", error.message);
        throw error;
    }
}
    //maneger and admin only
    async Totalproducts(category, limit, skip) {
        try {

            const total = await productmodel.countDocuments({ category: category });
            return total;
        }
        catch (error) {
            console.log(error.message);
            throw error;
        }
    }
    //admin/manager
    async removeusers(userid) {
        return Deleteplease(userid);
    }
    //manager
    async removeadmin(adminid) {
        return Deleteplease(adminid);
    }

   // TODO:Admin DashBoard
   //Per-Admin Revenue (Aggregation)
   //Per-Admin Order Status Breakdown
   //Per-Admin Daily Sale
    async totalrevenue() {
        try {
            const result = await productmodel.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ["$price", "$stock"] } }
                    }
                }
            ]);
            return result.length > 0 ? result[0].total : 0;
        } catch (error) {
            console.log("Error calculating total revenue:", error.message);
            return 0;
        }
    }
    async totalorderstatus(){

    }
    async dailysale(){

    }
    async dailysaleaverage(){

    }

}



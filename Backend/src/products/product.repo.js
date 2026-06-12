import productmodel from "./product.schema.js";
import cardModel from "../Orders/card.schema.js";
import WishlistModel from "../Orders/wishlist.schema.js";
import mongoose from "mongoose";

export default class Productrepo {
    async createproduct(data) {
        try {
            const product = new productmodel(data);
            return await product.save();
        }
        catch (error) {
            console.log(error.message);
            throw error;
        }
    }
    async updateproduct(id, fields) {
        try {
            const updateData = {};
            for (let key in fields) {
                if (fields[key] !== undefined) {
                    updateData[key] = fields[key];
                }
            }
            console.log(updateData);
            
            return await productmodel.findByIdAndUpdate(id, { $set: updateData }, { new: true })


        }
        catch (error) {
            console.log(error.message);
            throw error;
        }

    }


    async readproducts(id) {
        try {
            return await productmodel.find({});
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    }
    async findbyid(id) {
        try {
            return await productmodel.findById(id);
        }
        catch (error) {
            console.log(error.message);
            throw error;
        }
    }

    async deleteproduct(id) {
        try {
            const objectId = new mongoose.Types.ObjectId(id);

            // Delete from all carts
            await cardModel.deleteMany({ product: objectId });
            
            // Remove from all wishlists
            await WishlistModel.updateMany({}, { $pull: { products: objectId } });

            // Finally, delete the product itself
            return await productmodel.findByIdAndDelete(id);
        }
        catch (error) {
            console.log(error.message);
            throw error;
        }
    }
}
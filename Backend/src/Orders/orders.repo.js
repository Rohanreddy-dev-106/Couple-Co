import cardModel from "./card.schema.js";
import orderModel from "./order.schema.js";
import productModel from "../products/product.schema.js"
import mongoose from "mongoose";

export default class OrdersRepo {
    // Create cart items
    async createCard(data) {
        try {
            const result = await this.checkCard(data.user, data.product, data.size);

            if (result) {
                const update = await this.updateQuantity(result._id, data.quantity || 1);
                return {
                    message:
                        "You have already added this item to the cart, so we increased the quantity. If not needed, please decrease it yourself.",
                    update,
                };
            } else {
                const cart = new cardModel(data);
                return await cart.save();
            }
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    }

    async updateQuantity(id, quantity) {
        try {
            return await cardModel.findByIdAndUpdate(
                id,
                { $inc: { quantity: quantity } },
                { new: true }
            );
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    }

    async readCards(userId) {
        try {
            const items = await cardModel.find({ user: userId }).populate("product");
            // Filter out cart items whose product was deleted from the DB
            return items.filter(item => item.product !== null);
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    }

    async deleteCards(cardId) {
        try {
            return await cardModel.findByIdAndDelete(cardId);
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    }

    async checkCard(userId, productId, size) {
        try {
            return await cardModel.findOne({
                user: userId,
                product: productId,
                size: size,
            });
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    }

    async deleteAll(userId) {
        try {
            return await cardModel.deleteMany({ user: userId });
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    }

    //create orders

    async createorders(order) {
        try {
            const EachCardTotal = await cardModel
                .find({ user: order.userId });
            if (!EachCardTotal.length) {
                throw new Error("Cart is empty");
            }
            // Track cart items with valid products only
            const validCartItems = [];
            const orphanedCartIds = [];

            for (let card of EachCardTotal) {
                let product = await productModel.findById(card.product);
                if (!product) {
                    // Product was deleted — remove from cart and skip
                    orphanedCartIds.push(card._id);
                    continue;
                }
                let total = card.quantity * product.price;
                if (product.stock < card.quantity) {
                    throw new Error(`Insufficient stock for "${product.name}"`);
                }
                await productModel.findByIdAndUpdate(
                    card.product,
                    { $inc: { stock: -card.quantity } }
                );
                await cardModel.findByIdAndUpdate(
                    card._id,
                    { $set: { total: total } }
                );
                validCartItems.push(card);
            }

            // Clean up orphaned cart items (deleted products)
            if (orphanedCartIds.length > 0) {
                await cardModel.deleteMany({ _id: { $in: orphanedCartIds } });
            }

            if (validCartItems.length === 0) {
                throw new Error("No valid products in cart. Some items may have been removed.");
            }

            const userProfile = await mongoose.model("Profile").findOne({ user: order.userId });

            // Use validCartItems (already has updated totals in DB, re-fetch to get correct totals)
            const CreateOrders = await cardModel.find({ _id: { $in: validCartItems.map(c => c._id) } });

            for (let orderItem of CreateOrders) {
                let data = {
                    userId: orderItem.user,
                    productId: orderItem.product,
                    quantity: orderItem.quantity,
                    price: orderItem.price,
                    totalAmount: orderItem.total,
                    shippingAddress: userProfile ? {
                        fullName: userProfile.fullName,
                        phone: userProfile.phone,
                        addressLine1: userProfile.addressLine1,
                        addressLine2: userProfile.addressLine2,
                        city: userProfile.city,
                        state: userProfile.state,
                        postalCode: userProfile.postalCode,
                        country: userProfile.country,
                        landmark: userProfile.landmark,
                        addressType: userProfile.addressType
                    } : null
                };
                //order created
                let orderDoc = new orderModel(data);
                await orderDoc.save();
            }
            // Delete only the cart items that were successfully placed as orders
            let orderID = validCartItems.map(card => card._id);
            if (orderID.length !== 0) {
                await cardModel.deleteMany({ _id: { $in: orderID } });
            }
        }
        catch (error) {
            throw error;
        }
    }

    async getAllOrders() {
        try {
            return await orderModel
                .find({})
                .populate("userId", "name email")
                .populate("productId")
                .sort({ createdAt: -1 });
        } catch (error) {
            console.log("getAllOrders Error:", error.message);
            throw error;
        }
    }

    async deleteOrderAdmin(orderId) {
        try {
            return await orderModel.findByIdAndDelete(orderId);
        } catch (error) {
            console.log("deleteOrder Error:", error.message);
            throw error;
        }
    }

}

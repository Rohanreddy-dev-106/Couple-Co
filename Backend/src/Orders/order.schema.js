
import mongoose, { Schema } from "mongoose";

//sub document schema for address

const shippingAddressSchema = new Schema({
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    landmark: String,
    addressType: String
});

const Orders = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        shippingAddress: shippingAddressSchema,
        quantity: { type: Number },
        price: { type: Number },
        totalAmount: { type: Number },
        status: {
            type: String,
            enum: ["Pending", "Payement Done"],
            default: "Pending",
        },
    },
    { timestamps: true },
);

Orders.index({ userId: 1 });

export default mongoose.model("Order", Orders);

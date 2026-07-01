
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
        size: { type: String, default: null },
        price: { type: Number },
        totalAmount: { type: Number },
        status: {
            type: String,
            enum: [
                "Pending",
                "Processing",          // confirmed and being processed
                "Sent to Fulfillment", // pushed to Qikink
                "Shipped",             // Qikink dispatched
                "Delivered",           // delivered to customer
                "Cancelled",
            ],
            default: "Pending",
        },

        // ── Qikink Fulfillment ───────────────────────────
        qikinkOrderId: { type: String, default: null },
        trackingNumber: { type: String, default: null },
        trackingUrl: { type: String, default: null },
        courierName: { type: String, default: null },
        fulfilledAt: { type: Date, default: null },
    },
    { timestamps: true },
);

Orders.index({ userId: 1 });
Orders.index({ qikinkOrderId: 1 });

export default mongoose.model("Order", Orders);

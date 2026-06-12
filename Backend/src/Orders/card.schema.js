import mongoose, { Schema } from "mongoose";

const CartItemSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            default: null
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        quantity: {
            type: Number,
            min: 1,
            max: 3,
            default: 1,
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },
        size: {
            type: String,
            required: true,
        },
        total: {
            type: Number,
            required: true,
            default: 0
        }
    },
    { timestamps: true }
);



export default mongoose.model("CartItem", CartItemSchema);

import mongoose, { Schema } from "mongoose";

const WishlistSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // one wishlist per user
        },

        products: [
            {
                type: Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Wishlist", WishlistSchema);

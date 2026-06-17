import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,      //  makes product name unique

        },

        description: {
            type: String,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        stock: {
            type: Number,
            default: 0,
            min: 0,
        },

        category: {
            type: String,
            required: true
        },

        images: { type: String, required: true },

        sizes: {
            type: [String],
            default: ["S", "M", "L", "XL"]
        },



        // ── Qikink POD Mapping ───────────────────────────
        // Default variant ID (fallback when size-specific mapping is not set)
        qikinkVariantId: {
            type: String,
            default: null,
        },
        // Per-size variant IDs from the Qikink dashboard (e.g. { S: "123", M: "456" })
        qikinkVariantIds: {
            type: Map,
            of: String,
            default: {},
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);
//Search index (text search)
ProductSchema.index({
    name: "text",
    category: "text",
    description: "text",
},
    {
        weights: {
            name: 10,
            category: 5,
            description: 2
        }
    })

export default mongoose.model("Product", ProductSchema);

import mongoose, { Schema } from "mongoose";

const addressSchema = new Schema(
  {

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    postalCode: {
      type: String,
      required: true,
      index: true,
    },

    country: {
      type: String,
      default: "India",
    },

    landmark: {
      type: String,
      trim: true,
    },

    addressType: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
  },
  {
    timestamps: true,
  }
);

export default  mongoose.model("Profile",addressSchema);

import mongoose from "mongoose";

const viewedProductSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    },
    count: {
      type: Number,
      default: 1,
      min: 1
    },
    lastViewedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

viewedProductSchema.index({ user: 1, product: 1 }, { unique: true });

export const ViewedProduct = mongoose.model("ViewedProduct", viewedProductSchema);

import mongoose from "mongoose";
import slugify from "slugify";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    alt: { type: String, default: "" }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 140
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    category: {
      type: String,
      trim: true,
      index: true,
      default: "general"
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    originalPrice: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: "VND"
    },
    images: {
      type: [imageSchema],
      default: []
    },
    stock: {
      type: Number,
      min: 0,
      default: 0
    },
    tags: {
      type: [String],
      default: []
    },
    specs: {
      type: Map,
      of: String,
      default: {}
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

productSchema.pre("validate", function setSlug(next) {
  if (this.name && (!this.slug || this.isModified("name"))) {
    this.slug = slugify(this.name, { lower: true, strict: true, locale: "vi" });
  }
  next();
});

productSchema.index({ name: "text", description: "text", tags: "text", category: "text" });

export const Product = mongoose.model("Product", productSchema);

import { z } from "zod";
import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { ViewedProduct } from "../models/ViewedProduct.js";
import { toProductImage, uploadImageBuffer } from "../services/cloudinary.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination } from "../utils/pagination.js";

export const productSchema = z.object({
  name: z.string().trim().min(2).max(140),
  description: z.string().trim().max(2000).optional().default(""),
  category: z.string().trim().min(1).max(80).optional().default("general"),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative().optional(),
  currency: z.string().trim().min(3).max(3).optional().default("VND"),
  stock: z.number().int().nonnegative().optional().default(0),
  tags: z.array(z.string().trim().min(1).max(40)).optional().default([]),
  specs: z.record(z.string()).optional().default({}),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string().optional(),
        alt: z.string().optional().default("")
      })
    )
    .optional()
    .default([])
});

export const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { isActive: true };

  if (req.query.category) filter.category = req.query.category;
  if (req.query.q) filter.$text = { $search: req.query.q };
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  const sort = req.query.sort === "price_asc"
    ? { price: 1 }
    : req.query.sort === "price_desc"
      ? { price: -1 }
      : { createdAt: -1 };

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter)
  ]);

  res.json({
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const key = req.params.idOrSlug;
  const query = mongoose.isValidObjectId(key) ? { _id: key } : { slug: key };
  const product = await Product.findOne({ ...query, isActive: true });
  if (!product) throw new ApiError(404, "Khong tim thay san pham.");

  if (req.user) {
    await ViewedProduct.findOneAndUpdate(
      { user: req.user._id, product: product._id },
      { $inc: { count: 1 }, $set: { lastViewedAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  res.json({ product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) throw new ApiError(404, "Khong tim thay san pham.");

  Object.assign(product, req.body);
  await product.save();

  res.json({ product });
});

export const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(422, "Vui long chon anh san pham.");

  const product = await Product.findById(req.params.productId);
  if (!product) throw new ApiError(404, "Khong tim thay san pham.");

  const result = await uploadImageBuffer(req.file.buffer);
  const image = toProductImage(result, req.body.alt || product.name);

  product.images.push(image);
  await product.save();

  res.status(201).json({ image, product });
});

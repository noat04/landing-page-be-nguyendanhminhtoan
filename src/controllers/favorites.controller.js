import { Favorite } from "../models/Favorite.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listFavorites = asyncHandler(async (req, res) => {
  const items = await Favorite.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("product");
  res.json({ items });
});

export const addFavorite = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product || !product.isActive) throw new ApiError(404, "Khong tim thay san pham.");

  const favorite = await Favorite.findOneAndUpdate(
    { user: req.user._id, product: product._id },
    { $setOnInsert: { user: req.user._id, product: product._id } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate("product");

  res.status(201).json({ favorite });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  await Favorite.deleteOne({ user: req.user._id, product: req.params.productId });
  res.status(204).send();
});

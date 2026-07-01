import { ViewedProduct } from "../models/ViewedProduct.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination } from "../utils/pagination.js";

export const listViewedProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { user: req.user._id };

  const [items, total] = await Promise.all([
    ViewedProduct.find(filter)
      .sort({ lastViewedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("product"),
    ViewedProduct.countDocuments(filter)
  ]);

  res.json({
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

export const clearViewedProducts = asyncHandler(async (req, res) => {
  await ViewedProduct.deleteMany({ user: req.user._id });
  res.status(204).send();
});

import { z } from "zod";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99).optional().default(1)
});

export const cartQuantitySchema = z.object({
  quantity: z.number().int().min(1).max(99)
});

async function getCart(userId) {
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate("items.product");

  return cart;
}

function cartTotals(cart) {
  const subtotal = cart.items.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + item.product.price * item.quantity;
  }, 0);

  return {
    subtotal,
    currency: cart.items[0]?.product?.currency || "VND",
    totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0)
  };
}

export const showCart = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user._id);
  res.json({ cart, totals: cartTotals(cart) });
});

export const addCartItem = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.body.productId);
  if (!product || !product.isActive) throw new ApiError(404, "Khong tim thay san pham.");
  if (product.stock < req.body.quantity) throw new ApiError(409, "So luong san pham khong du.");

  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { user: req.user._id, items: [] } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const item = cart.items.find((entry) => entry.product.toString() === product._id.toString());
  const nextQuantity = item ? item.quantity + req.body.quantity : req.body.quantity;
  if (product.stock < nextQuantity) throw new ApiError(409, "So luong san pham khong du.");

  if (item) item.quantity = Math.min(nextQuantity, 99);
  else cart.items.push({ product: product._id, quantity: nextQuantity });

  await cart.save();
  await cart.populate("items.product");

  res.status(201).json({ cart, totals: cartTotals(cart) });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Gio hang dang trong.");

  const item = cart.items.find((entry) => entry.product.toString() === req.params.productId);
  if (!item) throw new ApiError(404, "San pham khong co trong gio hang.");

  const product = await Product.findById(req.params.productId);
  if (!product || product.stock < req.body.quantity) {
    throw new ApiError(409, "So luong san pham khong du.");
  }

  item.quantity = req.body.quantity;
  await cart.save();
  await cart.populate("items.product");

  res.json({ cart, totals: cartTotals(cart) });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(204).send();

  cart.items = cart.items.filter((entry) => entry.product.toString() !== req.params.productId);
  await cart.save();
  await cart.populate("items.product");

  res.json({ cart, totals: cartTotals(cart) });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [] } },
    { new: true }
  ).populate("items.product");
  res.json({ cart: cart || { items: [] }, totals: cart ? cartTotals(cart) : { subtotal: 0, currency: "VND", totalItems: 0 } });
});

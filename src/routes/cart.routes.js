import { Router } from "express";
import { addCartItem, cartItemSchema, cartQuantitySchema, clearCart, removeCartItem, showCart, updateCartItem } from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const cartRouter = Router();

cartRouter.use(requireAuth);
cartRouter.get("/", showCart);
cartRouter.post("/items", validate(cartItemSchema), addCartItem);
cartRouter.patch("/items/:productId", validate(cartQuantitySchema), updateCartItem);
cartRouter.delete("/items/:productId", removeCartItem);
cartRouter.delete("/", clearCart);

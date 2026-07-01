import { Router } from "express";
import { productSchema, createProduct, getProduct, listProducts, updateProduct, uploadProductImage } from "../controllers/products.controller.js";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";

export const productsRouter = Router();

productsRouter.get("/", listProducts);
productsRouter.get("/:idOrSlug", optionalAuth, getProduct);
productsRouter.post("/", requireAuth, requireAdmin, validate(productSchema), createProduct);
productsRouter.patch("/:productId", requireAuth, requireAdmin, validate(productSchema.partial()), updateProduct);
productsRouter.post("/:productId/images", requireAuth, requireAdmin, upload.single("image"), uploadProductImage);

import { Router } from "express";
import { clearViewedProducts, listViewedProducts } from "../controllers/viewed.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const viewedRouter = Router();

viewedRouter.use(requireAuth);
viewedRouter.get("/", listViewedProducts);
viewedRouter.delete("/", clearViewedProducts);

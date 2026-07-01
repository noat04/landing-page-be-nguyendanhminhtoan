import { Router } from "express";
import { addFavorite, listFavorites, removeFavorite } from "../controllers/favorites.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const favoritesRouter = Router();

favoritesRouter.use(requireAuth);
favoritesRouter.get("/", listFavorites);
favoritesRouter.post("/:productId", addFavorite);
favoritesRouter.delete("/:productId", removeFavorite);

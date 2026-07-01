import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { cartRouter } from "./routes/cart.routes.js";
import { chatbotRouter } from "./routes/chatbot.routes.js";
import { favoritesRouter } from "./routes/favorites.routes.js";
import { productsRouter } from "./routes/products.routes.js";
import { viewedRouter } from "./routes/viewed.routes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: env.clientOrigin.split(",").map((origin) => origin.trim()),
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "mini-commerce-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/cart", cartRouter);
app.use("/api/viewed", viewedRouter);
app.use("/api/chatbot", chatbotRouter);

app.use(notFound);
app.use(errorHandler);

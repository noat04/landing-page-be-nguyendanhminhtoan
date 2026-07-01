import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

async function resolveUser(req) {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies?.[env.cookieName] || bearer;
  if (!token) return null;

  const payload = jwt.verify(token, env.jwtSecret);
  return User.findById(payload.sub);
}

export async function optionalAuth(req, _res, next) {
  try {
    req.user = await resolveUser(req);
    next();
  } catch (_error) {
    req.user = null;
    next();
  }
}

export async function requireAuth(req, _res, next) {
  try {
    const user = await resolveUser(req);
    if (!user) throw new ApiError(401, "Vui long dang nhap.");
    req.user = user;
    next();
  } catch (error) {
    next(error.name === "JsonWebTokenError" ? new ApiError(401, "Phien dang nhap khong hop le.") : error);
  }
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== "admin") {
    return next(new ApiError(403, "Ban khong co quyen thuc hien thao tac nay."));
  }
  next();
}

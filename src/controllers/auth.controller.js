import { z } from "zod";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { clearAuthCookie, setAuthCookie, signAuthToken } from "../utils/jwt.js";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(6).max(128)
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(6).max(128)
});

export const register = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  const token = signAuthToken(user);
  setAuthCookie(res, token);
  res.status(201).json({ user, token });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+password");
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, "Email hoac mat khau khong dung.");
  }

  const token = signAuthToken(user);
  setAuthCookie(res, token);
  res.json({ user, token });
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Da dang xuat." });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

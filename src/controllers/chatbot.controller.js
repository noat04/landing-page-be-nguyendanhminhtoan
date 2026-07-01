import { z } from "zod";
import { getChatbotReply } from "../services/chatbot.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const chatbotMessageSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  productId: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(1000)
      })
    )
    .optional()
    .default([])
});

export const sendMessage = asyncHandler(async (req, res) => {
  const reply = await getChatbotReply(req.body);
  res.json({ reply });
});

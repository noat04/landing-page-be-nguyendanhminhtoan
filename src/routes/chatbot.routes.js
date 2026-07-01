import { Router } from "express";
import { chatbotMessageSchema, sendMessage } from "../controllers/chatbot.controller.js";
import { validate } from "../middleware/validate.js";

export const chatbotRouter = Router();

chatbotRouter.post("/message", validate(chatbotMessageSchema), sendMessage);

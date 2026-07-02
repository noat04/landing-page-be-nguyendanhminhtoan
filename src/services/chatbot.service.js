import { env } from "../config/env.js";
import { Product } from "../models/Product.js";

function formatMoney(value, currency = "VND") {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

async function buildProductContext(productId, message) {
  if (productId) {
    const product = await Product.findById(productId);
    if (product) return [product];
  }

  const query = message?.trim();
  if (!query) return Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(5);

  const matchedProducts = await Product.find(
    { isActive: true, $text: { $search: query } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(5);

  if (matchedProducts.length) return matchedProducts;

  return Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(5);
}

function productContextText(products) {
  if (!products.length) return "No matching products are available in the current data.";
  return products
    .map((product) => {
      const specs = product.specs ? Object.fromEntries(product.specs) : {};
      return [
        `Name: ${product.name}`,
        `Price: ${formatMoney(product.price, product.currency)}`,
        `Category: ${product.category}`,
        `Stock: ${product.stock}`,
        `Description: ${product.description || "Updating"}`,
        `Specs: ${JSON.stringify(specs)}`
      ].join("\n");
    })
    .join("\n\n");
}

function ruleBasedReply(products, message) {
  if (!products.length) {
    return "I could not find a matching product yet. Could you share the product name, your needs, or your target budget?";
  }

  const product = products[0];
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("price") ||
    lowerMessage.includes("cost") ||
    lowerMessage.includes("how much") ||
    lowerMessage.includes("gia") ||
    lowerMessage.includes("bao nhieu")
  ) {
    return `${product.name} is currently priced at ${formatMoney(product.price, product.currency)}. ${product.stock > 0 ? "This product is in stock." : "This product is currently out of stock."}`;
  }

  if (
    lowerMessage.includes("stock") ||
    lowerMessage.includes("available") ||
    lowerMessage.includes("in stock") ||
    lowerMessage.includes("ton") ||
    lowerMessage.includes("con hang")
  ) {
    return `${product.name} ${product.stock > 0 ? `has ${product.stock} units available.` : "is currently out of stock."}`;
  }

  return `I recommend ${product.name}: ${product.description || "a suitable product to consider."} The current price is ${formatMoney(product.price, product.currency)}. Would you like advice based on your budget or how you plan to use it?`;
}

async function callOpenAI(messages) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.chatbot.openaiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.chatbot.openaiModel,
      input: messages
    })
  });

  if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);
  const data = await response.json();
  return data.output_text || "I do not have a suitable answer yet.";
}

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.chatbot.geminiModel}:generateContent?key=${env.chatbot.geminiApiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "I do not have a suitable answer yet.";
}

export async function getChatbotReply({ message, productId, history = [] }) {
  const products = await buildProductContext(productId, message);
  const context = productContextText(products);
  const systemPrompt = [
    "You are a product advisor chatbot for an ecommerce landing page.",
    "Only answer using the provided product data.",
    "Reply in concise, friendly English.",
    `Product data:\n${context}`
  ].join("\n\n");

  if (env.chatbot.provider === "openai" && env.chatbot.openaiApiKey) {
    try {
      return await callOpenAI([
        { role: "developer", content: systemPrompt },
        ...history.slice(-8),
        { role: "user", content: message }
      ]);
    } catch (_error) {
      return ruleBasedReply(products, message);
    }
  }

  if (env.chatbot.provider === "gemini" && env.chatbot.geminiApiKey) {
    try {
      return await callGemini(`${systemPrompt}\n\nCustomer: ${message}`);
    } catch (_error) {
      return ruleBasedReply(products, message);
    }
  }

  return ruleBasedReply(products, message);
}

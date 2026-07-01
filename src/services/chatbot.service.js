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

  return Product.find(
    { isActive: true, $text: { $search: query } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(5);
}

function productContextText(products) {
  if (!products.length) return "Khong co san pham phu hop trong du lieu hien tai.";
  return products
    .map((product) => {
      const specs = product.specs ? Object.fromEntries(product.specs) : {};
      return [
        `Ten: ${product.name}`,
        `Gia: ${formatMoney(product.price, product.currency)}`,
        `Danh muc: ${product.category}`,
        `Ton kho: ${product.stock}`,
        `Mo ta: ${product.description || "Dang cap nhat"}`,
        `Thong so: ${JSON.stringify(specs)}`
      ].join("\n");
    })
    .join("\n\n");
}

function ruleBasedReply(products, message) {
  if (!products.length) {
    return "Minh chua tim thay san pham phu hop. Ban co the cho minh ten san pham, nhu cau su dung hoac muc gia mong muon khong?";
  }

  const product = products[0];
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("gia") || lowerMessage.includes("bao nhieu")) {
    return `${product.name} hien co gia ${formatMoney(product.price, product.currency)}. ${product.stock > 0 ? "San pham dang con hang." : "San pham tam het hang."}`;
  }

  if (lowerMessage.includes("ton") || lowerMessage.includes("con hang")) {
    return `${product.name} ${product.stock > 0 ? `dang con ${product.stock} san pham.` : "tam thoi het hang."}`;
  }

  return `Minh goi y ${product.name}: ${product.description || "san pham phu hop de tham khao."} Gia hien tai ${formatMoney(product.price, product.currency)}. Ban muon minh tu van theo ngan sach hay nhu cau su dung?`;
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
  return data.output_text || "Minh chua co cau tra loi phu hop.";
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
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Minh chua co cau tra loi phu hop.";
}

export async function getChatbotReply({ message, productId, history = [] }) {
  const products = await buildProductContext(productId, message);
  const context = productContextText(products);
  const systemPrompt = [
    "Ban la chatbot tu van san pham cho landing page thuong mai dien tu.",
    "Chi dua ra thong tin dua tren du lieu san pham duoc cung cap.",
    "Tra loi ngan gon, than thien bang tieng Viet.",
    `Du lieu san pham:\n${context}`
  ].join("\n\n");

  if (env.chatbot.provider === "openai" && env.chatbot.openaiApiKey) {
    return callOpenAI([
      { role: "developer", content: systemPrompt },
      ...history.slice(-8),
      { role: "user", content: message }
    ]);
  }

  if (env.chatbot.provider === "gemini" && env.chatbot.geminiApiKey) {
    return callGemini(`${systemPrompt}\n\nKhach hang: ${message}`);
  }

  return ruleBasedReply(products, message);
}

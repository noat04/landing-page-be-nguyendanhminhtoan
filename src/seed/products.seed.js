import "../config/env.js";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "../config/db.js";
import { Product } from "../models/Product.js";
import { toProductImage, uploadImageFile } from "../services/cloudinary.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "../../public");

const image = (fileName, alt, publicId) => ({
  fileName,
  alt,
  publicId
});

const products = [
  {
    name: "iPhone 18 Pro Dark Cherry",
    category: "iphone",
    price: 34990000,
    originalPrice: 37990000,
    stock: 18,
    description: "iPhone 18 Pro in Dark Cherry with premium design, powerful performance, and a pro camera system.",
    tags: ["iphone", "iphone 18 pro", "dark cherry", "apple"],
    specs: {
      storage: "256GB",
      color: "Dark Cherry",
      screen: "6.3 inch",
      warranty: "12 months"
    },
    images: [image("iphone-18-pro-dark-cherry-removebg-preview.webp", "iPhone 18 Pro Dark Cherry", "iphone-18-pro-dark-cherry")]
  },
  {
    name: "iPhone 18 Pro Black Titanium",
    category: "iphone",
    price: 32990000,
    originalPrice: 35990000,
    stock: 24,
    description: "A clean and durable Black Titanium edition for customers who prefer a bold, minimal look.",
    tags: ["iphone", "iphone 18 pro", "black titanium", "apple"],
    specs: {
      storage: "256GB",
      color: "Black Titanium",
      screen: "6.3 inch",
      warranty: "12 months"
    },
    images: [image("download__6_-removebg-preview.webp", "iPhone 18 Pro Black Titanium", "iphone-18-pro-black-titanium")]
  },
  {
    name: "iPhone 18 Pro Lavender",
    category: "iphone",
    price: 32990000,
    originalPrice: 35990000,
    stock: 20,
    description: "A soft and youthful Lavender finish with a pro camera system and a sharp display.",
    tags: ["iphone", "iphone 18 pro", "lavender", "apple"],
    specs: {
      storage: "256GB",
      color: "Lavender",
      screen: "6.3 inch",
      warranty: "12 months"
    },
    images: [image("download__5_-removebg-preview.webp", "iPhone 18 Pro Lavender", "iphone-18-pro-lavender")]
  },
  {
    name: "iPhone 18 Pro Pink",
    category: "iphone",
    price: 32990000,
    originalPrice: 35990000,
    stock: 22,
    description: "A standout Pink finish with a sleek design and high performance for everyday use.",
    tags: ["iphone", "iphone 18 pro", "pink", "apple"],
    specs: {
      storage: "256GB",
      color: "Pink",
      screen: "6.3 inch",
      warranty: "12 months"
    },
    images: [image("download__4_-removebg-preview.webp", "iPhone 18 Pro Pink", "iphone-18-pro-pink")]
  },
  {
    name: "iPhone 18 Pro Deep Red",
    category: "iphone",
    price: 33990000,
    originalPrice: 36990000,
    stock: 16,
    description: "A premium Deep Red finish that feels distinctive, elegant, and confident.",
    tags: ["iphone", "iphone 18 pro", "deep red", "apple"],
    specs: {
      storage: "256GB",
      color: "Deep Red",
      screen: "6.3 inch",
      warranty: "12 months"
    },
    images: [image("download__1_-removebg-preview.webp", "iPhone 18 Pro Deep Red", "iphone-18-pro-deep-red")]
  },
  {
    name: "iPhone 18 Pro Orange",
    category: "iphone",
    price: 32990000,
    originalPrice: 35990000,
    stock: 14,
    description: "A vibrant Orange finish for customers who want an iPhone with a bold personality.",
    tags: ["iphone", "iphone 18 pro", "orange", "apple"],
    specs: {
      storage: "256GB",
      color: "Orange",
      screen: "6.3 inch",
      warranty: "12 months"
    },
    images: [image("download__3_-removebg-preview.webp", "iPhone 18 Pro Orange", "iphone-18-pro-orange")]
  },
  {
    name: "iPhone 18 Pro Midnight Blue",
    category: "iphone",
    price: 32990000,
    originalPrice: 35990000,
    stock: 26,
    description: "A refined Midnight Blue finish with pro cameras and reliable battery life.",
    tags: ["iphone", "iphone 18 pro", "midnight blue", "apple"],
    specs: {
      storage: "256GB",
      color: "Midnight Blue",
      screen: "6.3 inch",
      warranty: "12 months"
    },
    images: [image("download__2_-removebg-preview.webp", "iPhone 18 Pro Midnight Blue", "iphone-18-pro-midnight-blue")]
  }
];

async function uploadSeedImages(product) {
  const images = await Promise.all(
    product.images.map(async (productImage) => {
      const filePath = path.join(publicDir, productImage.fileName);
      const result = await uploadImageFile(filePath, {
        public_id: productImage.publicId
      });

      return toProductImage(result, productImage.alt);
    })
  );

  return { ...product, images };
}

async function seed() {
  await connectDb();
  const productsWithCloudinaryImages = await Promise.all(products.map(uploadSeedImages));

  await Product.deleteMany({});
  await Product.insertMany(productsWithCloudinaryImages);
  console.log(`Seeded ${productsWithCloudinaryImages.length} products with Cloudinary images`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

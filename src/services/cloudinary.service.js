import path from "path";
import { cloudinary } from "../config/cloudinary.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export function assertCloudinaryConfig() {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    throw new ApiError(500, "Cloudinary is not configured.");
  }
}

function uploadOptions(options = {}) {
  return {
    folder: env.cloudinary.folder,
    resource_type: "image",
    overwrite: true,
    ...options
  };
}

export function toProductImage(result, alt = "") {
  return {
    url: result.secure_url,
    publicId: result.public_id,
    alt
  };
}

export function uploadImageBuffer(buffer, options = {}) {
  assertCloudinaryConfig();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(uploadOptions(options), (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    stream.end(buffer);
  });
}

export async function uploadImageFile(filePath, options = {}) {
  assertCloudinaryConfig();

  const publicId = options.public_id || path.parse(filePath).name;
  return cloudinary.uploader.upload(filePath, uploadOptions({ ...options, public_id: publicId }));
}

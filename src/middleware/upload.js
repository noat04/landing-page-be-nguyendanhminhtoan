import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new ApiError(422, "Chi chap nhan file anh."));
    }
    cb(null, true);
  }
});

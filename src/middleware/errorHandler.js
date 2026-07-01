import { ZodError } from "zod";

export function notFound(req, _res, next) {
  const error = new Error(`Khong tim thay: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(422).json({
      message: "Du lieu khong hop le.",
      details: error.flatten()
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: "Du lieu da ton tai.",
      details: error.keyValue
    });
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || "Co loi xay ra.",
    details: error.details || null
  });
}

import { NextFunction, Request, Response } from "express";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error("🔥 GLOBAL ERROR OCCURRED");
  console.error("URL:", req.method, req.originalUrl);
  console.error("BODY:", req.body);
  console.error("HEADERS:", req.headers);
  console.error("ERROR STACK:", err?.stack || err);
  console.error(next);

  const statusCode = err?.status || err?.statusCode || 500;

 res.status(statusCode).json({
  success: false,
  message: err,
  error: err.message,
  stack: err.stack,
});
}

export default errorHandler;

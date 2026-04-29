import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error("🔥 GLOBAL ERROR:", err);
  console.log(req);
  console.log(next);
  let statusCode = 500;
  let errorMessage = "Internal Server Error";

  // Prisma Validation Error
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "Invalid data type or missing required fields";
  }

  // Prisma Known Errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        statusCode = 400;
        errorMessage = "Duplicate field value violates unique constraint";
        break;

      case "P2003":
        statusCode = 400;
        errorMessage = "Foreign key constraint failed";
        break;

      case "P2025":
        statusCode = 404;
        errorMessage = "Record not found";
        break;

      default:
        statusCode = 400;
        errorMessage = "Database error";
    }
  }

  // Prisma Connection Error
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 500;
    errorMessage = "Database connection failed";
  }

  res.status(statusCode).json({
    success: false,
    message: errorMessage,

    // 🔥 IMPORTANT: show real error ONLY in dev
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
  });
}

export default errorHandler;

import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let errorDetails = err;

  // Prisma Client Validation Error
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provide incorrect field type or missing fields";
  }

  // prisma client known request error
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      errorMessage =
        "An operation failed because of depends on one or more seconds that were required but not found ";
    } else if (err.code === "P2002") {
      statusCode = 400;
      errorMessage = " Duplicate key error";
    } else if (err.code === "P2003") {
      statusCode = 400;
      errorMessage = "Foreign key constraint failed";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Internal Server Error";
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = 401;
      errorMessage = "Authentication Failed . Please check your credentials ";
    } else if (err.errorCode === "P1001") {
      statusCode = 400;
      errorMessage = "Cannot reach database server ";
    }
  }
  res.status(statusCode);
  res.json({
    message: errorMessage,
    error: errorDetails,
  });
}

export default errorHandler;

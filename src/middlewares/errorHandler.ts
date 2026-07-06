// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  stack?: string;
  errors?: any;
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  // If not an AppError, wrap it
  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || "Internal Server Error",
      error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
      false
    );
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    error = new AppError(
      `Validation Error: ${messages.join(", ")}`,
      StatusCodes.BAD_REQUEST
    );
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(
      `${field} already exists`,
      StatusCodes.CONFLICT
    );
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    error = new AppError(
      `Invalid ${err.path}: ${err.value}`,
      StatusCodes.BAD_REQUEST
    );
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token", StatusCodes.UNAUTHORIZED);
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError("Token expired", StatusCodes.UNAUTHORIZED);
  }

  const response: ErrorResponse = {
    success: false,
    message: error.message,
    statusCode: error.statusCode,
  };

  // Include stack trace in development
  if (env.isDevelopment) {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

// 404 Handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};
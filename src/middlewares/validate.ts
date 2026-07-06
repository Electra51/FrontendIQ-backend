// src/middlewares/validate.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/AppError";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // ✅ Zod 4.x: শুধু issues property আছে
        const errors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        const errorMessage = errors.length > 0
          ? `Validation failed: ${errors.map((e) => e.message).join(", ")}`
          : "Validation failed";

        throw new AppError(errorMessage, StatusCodes.BAD_REQUEST);
      }
      next(error);
    }
  };
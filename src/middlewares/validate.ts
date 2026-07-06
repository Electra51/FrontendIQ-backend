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
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw new AppError(
          `Validation failed: ${errors.map((e) => e.message).join(", ")}`,
          StatusCodes.BAD_REQUEST
        );
      }
      next(error);
    }
  };
// src/middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { verifyAccessToken } from "../utils/jwt";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "./asyncHandler";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get token from header or cookie
    let token = req.headers.authorization?.replace("Bearer ", "");

    if (!token && req.cookies) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError(
        "Authentication required. Please login.",
        StatusCodes.UNAUTHORIZED
      );
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError(
        "User no longer exists or is inactive",
        StatusCodes.UNAUTHORIZED
      );
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  }
);

// Role-based authorization
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Not authenticated", StatusCodes.UNAUTHORIZED);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        "You do not have permission to perform this action",
        StatusCodes.FORBIDDEN
      );
    }

    next();
  };
};
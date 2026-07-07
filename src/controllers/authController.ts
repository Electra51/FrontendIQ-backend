// src/controllers/authController.ts
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
} from "../services/authService";
import { COOKIE_OPTIONS } from "../utils/constants";
import { asyncHandler } from "../middlewares/asyncHandler";

// Register user
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user } = await registerUser(req.body);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Registration successful. Please login.",
    data: {
      user,
    },
  });
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body);

  res.cookie("accessToken", accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Login successful",
    data: {
      user,
      accessToken,
    },
  });
});

// Refresh tokens
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Refresh token not found",
    });
    return;
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await refreshTokens(refreshToken);

  res.cookie("accessToken", accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", newRefreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Tokens refreshed",
    data: { accessToken },
  });
});

// Logout user
export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    await logoutUser(req.user.id);
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Logout successful",
  });
});
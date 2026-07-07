import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { updateAvatar } from "../services/userService";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  getDashboardData,
} from "../services/userService";

// ==============================
// Get Current User
// GET /api/users/me
// ==============================

export const getProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await getCurrentUser(req.user!.id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  }
);

// ==============================
// Get Dashboard Stats
// GET /api/users/me/dashboard
// ==============================

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await getDashboardData(req.user!.id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data,
    });
  }
);

// ==============================
// Update Profile
// PATCH /api/users/me
// ==============================

export const updateMyProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const updatedUser = await updateProfile(
      req.user!.id,
      req.body
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  }
);
// ==============================
// Update Avatar
// PATCH /api/users/me/avatar
// ==============================

export const uploadAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    const updatedUser = await updateAvatar(
      req.user!.id,
      req.file as Express.Multer.File
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Avatar updated successfully",
      data: updatedUser,
    });
  }
);

// ==============================
// Change Password
// PATCH /api/users/me/password
// ==============================

export const updatePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    await changePassword(
      req.user!.id,
      currentPassword,
      newPassword
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Password changed successfully",
    });
  }
);
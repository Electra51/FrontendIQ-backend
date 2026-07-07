import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";

import { User } from "../models/User";
import { AppError } from "../utils/AppError";

// ==============================
// Get Current User
// ==============================

export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  return user;
};

// ==============================
// Update Profile
// ==============================

interface UpdateProfilePayload {
  fullName?: string;
  avatar?: string;
}

export const updateProfile = async (
  userId: string,
  payload: UpdateProfilePayload
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  if (payload.fullName !== undefined) {
    user.fullName = payload.fullName;
  }

  if (payload.avatar !== undefined) {
    user.avatar = payload.avatar;
  }

  await user.save();

  return user;
};

// ==============================
// Change Password
// ==============================

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw new AppError(
      "Current password is incorrect",
      StatusCodes.BAD_REQUEST
    );
  }

  user.password = newPassword;

  // pre("save") middleware automatically hash করবে
  await user.save();

  return true;
};
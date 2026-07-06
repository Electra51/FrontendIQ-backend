// src/services/authService.ts
import { StatusCodes } from "http-status-codes";
import { User, IUser } from "../models/User";
import { AppError } from "../utils/AppError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from "../utils/jwt";
import { RegisterInput, LoginInput } from "../validators/authValidator";

// Register new user
export const registerUser = async (data: RegisterInput) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new AppError(
      "An account with this email already exists",
      StatusCodes.CONFLICT
    );
  }

  // Create user (password will be hashed by pre-save hook)
  const user = await User.create({
    fullName: data.fullName,
    email: data.email,
    password: data.password,
  });

  // Generate tokens
  const tokenPayload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

// Login user
export const loginUser = async (data: LoginInput) => {
  // Find user and include password
  const user = await User.findOne({ email: data.email }).select("+password");
  if (!user) {
    throw new AppError(
      "Invalid email or password",
      StatusCodes.UNAUTHORIZED
    );
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError(
      "Your account has been deactivated",
      StatusCodes.FORBIDDEN
    );
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(data.password);
  if (!isPasswordValid) {
    throw new AppError(
      "Invalid email or password",
      StatusCodes.UNAUTHORIZED
    );
  }

  // Generate tokens
  const tokenPayload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

// Refresh tokens
export const refreshTokens = async (oldRefreshToken: string) => {
  try {
    // Verify old refresh token
    const decoded = verifyRefreshToken(oldRefreshToken);

    // Find user
    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user || user.refreshToken !== oldRefreshToken) {
      throw new AppError("Invalid refresh token", StatusCodes.UNAUTHORIZED);
    }

    // Generate new tokens
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Update refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw new AppError("Invalid refresh token", StatusCodes.UNAUTHORIZED);
  }
};

// Logout user
export const logoutUser = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};
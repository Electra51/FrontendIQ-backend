import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";
import { User } from "../models/User";
import { Submission } from "../models/Submission";
import { Quiz } from "../models/Quiz";
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
// Get Dashboard Data
// ==============================

export const getDashboardData = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  // Recent Activity (Submissions)
  const recentActivity = await Submission.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("quiz", "title difficulty"); // assuming quiz category is ObjectId now

  // Upcoming Assessments (Active quizzes the user hasn't attempted)
  const attemptedQuizIds = await Submission.distinct("quiz", { user: userId });
  const upcomingAssessments = await Quiz.find({
    _id: { $nin: attemptedQuizIds },
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("category", "name"); // populate category name

  return {
    stats: user.stats,
    recentActivity,
    upcomingAssessments,
  };
};

// ==============================
// Update Profile
// ==============================

interface UpdateProfilePayload {
  fullName?: string;
  avatar?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  experience?: number;
  skills?: string[];
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
  
  if (payload.bio !== undefined) {
    user.bio = payload.bio;
  }
  
  if (payload.githubUrl !== undefined) {
    user.githubUrl = payload.githubUrl;
  }
  
  if (payload.linkedinUrl !== undefined) {
    user.linkedinUrl = payload.linkedinUrl;
  }
  
  if (payload.portfolioUrl !== undefined) {
    user.portfolioUrl = payload.portfolioUrl;
  }
  
  if (payload.experience !== undefined) {
    user.experience = payload.experience;
  }
  
  if (payload.skills !== undefined) {
    user.skills = payload.skills;
  }

  await user.save();

  return user;
};

export const updateAvatar = async (
  userId: string,
  file: Express.Multer.File
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(
      "User not found",
      StatusCodes.NOT_FOUND
    );
  }

  if (!file) {
    throw new AppError(
      "Avatar image is required",
      StatusCodes.BAD_REQUEST
    );
  }

  const uploadedImage = await uploadToCloudinary(file.buffer);

  user.avatar = uploadedImage.secure_url;

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
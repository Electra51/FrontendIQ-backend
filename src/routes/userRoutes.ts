// src/routes/userRoutes.ts

import { Router } from "express";
import * as UserController from "../controllers/userController";

import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { upload } from "../middlewares/upload";

import {
  updateProfileSchema,
  changePasswordSchema,
} from "../validators/userValidator";

const router = Router();

/**
 * GET Profile
 */
router.get(
  "/me",
  authenticate,
  UserController.getProfile
);

/**
 * GET Dashboard Stats
 */
router.get(
  "/me/dashboard",
  authenticate,
  UserController.getDashboardStats
);

/**
 * Update Profile
 */
router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  UserController.updateMyProfile
);

/**
 * Upload Avatar
 */
router.patch(
  "/me/avatar",
  authenticate,
  upload.single("avatar"),
  UserController.uploadAvatar
);

/**
 * Change Password
 */
router.patch(
  "/me/password",
  authenticate,
  validate(changePasswordSchema),
  UserController.updatePassword
);

export default router;
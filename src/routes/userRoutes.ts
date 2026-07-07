import { Router } from "express";

import * as UserController from "../controllers/userController";

import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { changePasswordSchema, updateProfileSchema } from "../validators/userValidator";



const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get current user profile
router.get("/me", UserController.getProfile);

// Update profile
router.patch(
  "/me",
  validate(updateProfileSchema),
  UserController.updateMyProfile
);

// Change password
router.patch(
  "/me/password",
  validate(changePasswordSchema),
  UserController.updatePassword
);

export default router;
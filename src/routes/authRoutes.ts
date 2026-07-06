// src/routes/authRoutes.ts
import { Router } from "express";
import * as AuthController from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../validators/authValidator";
import { authenticate } from "../middlewares/auth";
import { authLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  AuthController.register
);

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  AuthController.login
);

router.post("/refresh-tokens", AuthController.refresh);
router.post("/logout", authenticate, AuthController.logout);
router.get("/me", authenticate, AuthController.getMe);

export default router;
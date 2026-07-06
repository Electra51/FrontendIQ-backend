// src/routes/quizRoutes.ts
import { Router } from "express";
import * as QuizController from "../controllers/quizController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  createQuizSchema,
  aiGenerateQuizSchema,
} from "../validators/quizValidator";
import { aiLimiter } from "../middlewares/rateLimiter";

const router = Router();

// Public routes
router.get("/", QuizController.getAll);
router.get("/:id", QuizController.getById);

// Protected routes (candidates)
router.post("/:id/submit", authenticate, QuizController.submit);

// Admin routes
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createQuizSchema),
  QuizController.create
);

router.post(
  "/ai-generate",
  authenticate,
  authorize("admin"),
  aiLimiter,
  validate(aiGenerateQuizSchema),
  QuizController.generateWithAI
);

router.post(
  "/ai-save",
  authenticate,
  authorize("admin"),
  QuizController.saveGenerated
);

export default router;
// src/routes/index.ts
import { Router } from "express";
import authRoutes from "./authRoutes";
import quizRoutes from "./quizRoutes";
import userRoutes from "./userRoutes";
const router = Router();

router.use("/auth", authRoutes);
router.use("/quizzes", quizRoutes);
router.use("/users", userRoutes);

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
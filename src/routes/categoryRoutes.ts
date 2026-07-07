import { Router } from "express";
import * as CategoryController from "../controllers/categoryController";
import { authenticate, authorize } from "../middlewares/auth";
import { ROLES } from "../utils/constants";

const router = Router();

// Publicly readable categories (only active ones)
router.get("/", authenticate, CategoryController.getAllCategories);

// Admin only routes
router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  CategoryController.createCategory
);

router.patch(
  "/:id/toggle",
  authenticate,
  authorize(ROLES.ADMIN),
  CategoryController.toggleCategoryStatus
);

export default router;

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Category } from "../models/Category";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../middlewares/asyncHandler";

// Create Category
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;

  const existingCategory = await Category.findOne({ name: name.trim() });
  if (existingCategory) {
    throw new AppError("Category already exists", StatusCodes.CONFLICT);
  }

  const category = await Category.create({
    name: name.trim(),
    description: description.trim(),
    createdBy: req.user!.id,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

// Get All Categories (Active only for candidates, all for admin)
export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
  // If request comes from an admin, they might want to see inactive categories too
  const query = req.user?.role === "admin" ? {} : { isActive: true };
  
  const categories = await Category.find(query).sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({
    success: true,
    data: categories,
  });
});

// Toggle Category Status (Active/Inactive)
export const toggleCategoryStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError("Category not found", StatusCodes.NOT_FOUND);
  }

  category.isActive = !category.isActive;
  await category.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
    data: category,
  });
});

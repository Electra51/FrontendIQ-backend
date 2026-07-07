// src/controllers/quizController.ts
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  generateQuizWithAI,
  saveGeneratedQuestions,
  submitQuiz,
} from "../services/quizService";
import { asyncHandler } from "../middlewares/asyncHandler";

// Create quiz
export const create = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await createQuiz(req.body, req.user!.id);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Quiz created successfully",
    data: quiz,
  });
});

// Get all quizzes
export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const { search, category, difficulty, page, limit } = req.query;

  const result = await getAllQuizzes({
    search: search as string,
    category: category as string,
    difficulty: difficulty as string,
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: result,
  });
});

// Get quiz by ID
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await getQuizById(req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    data: quiz,
  });
});

// Generate quiz with AI
export const generateWithAI = asyncHandler(
  async (req: Request, res: Response) => {
    const questions = await generateQuizWithAI(req.body, req.user!.id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Questions generated successfully",
      data: questions,
    });
  }
);

// Save AI generated quiz
export const saveGenerated = asyncHandler(
  async (req: Request, res: Response) => {
    const { questions, quizData } = req.body;

    const quiz = await saveGeneratedQuestions(
      questions,
      quizData,
      req.user!.id
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Quiz saved successfully",
      data: quiz,
    });
  }
);

// Submit quiz
export const submit = asyncHandler(async (req: Request, res: Response) => {
  const { answers } = req.body;
  const { id: quizId } = req.params;

  const result = await submitQuiz(quizId, req.user!.id, answers);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Quiz submitted successfully",
    data: result,
  });
});
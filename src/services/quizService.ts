// src/services/quizService.ts
import { StatusCodes } from "http-status-codes";
import { Quiz, IQuiz } from "../models/Quiz";
import { Question, IQuestion } from "../models/Question";
import { Submission } from "../models/Submission";
import { AppError } from "../utils/AppError";
import { generateQuizQuestions, GeneratedQuestion } from "./aiService";
import { CreateQuizInput, AIGenerateQuizInput } from "../validators/quizValidator";
import mongoose from "mongoose";

// Create a new quiz
export const createQuiz = async (
  data: CreateQuizInput,
  userId: string
): Promise<IQuiz> => {
  const quiz = await Quiz.create({
    ...data,
    createdBy: userId,
  });

  return quiz;
};

// Get all quizzes with filters and pagination
export const getAllQuizzes = async (filters: {
  search?: string;
  category?: string;
  difficulty?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const query: any = { isActive: true };
  
  if (filters.search) {
    query.title = { $regex: filters.search, $options: "i" };
  }
  if (filters.category) {
    query.category = filters.category; // Now expects ObjectId as string
  }
  if (filters.difficulty) {
    query.difficulty = filters.difficulty;
  }

  const [quizzes, total] = await Promise.all([
    Quiz.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "fullName email"),
    Quiz.countDocuments(query),
  ]);

  return {
    quizzes,
    total,
    pages: Math.ceil(total / limit),
  };
};

// Get quiz by ID
export const getQuizById = async (quizId: string): Promise<IQuiz> => {
  const quiz = await Quiz.findById(quizId)
    .populate("questions")
    .populate("createdBy", "fullName email");

  if (!quiz) {
    throw new AppError("Quiz not found", StatusCodes.NOT_FOUND);
  }

  return quiz;
};

// Generate quiz questions with AI
export const generateQuizWithAI = async (
  data: AIGenerateQuizInput,
  userId: string
): Promise<GeneratedQuestion[]> => {
  const questions = await generateQuizQuestions(data);
  return questions;
};

// Save AI generated questions and create quiz
export const saveGeneratedQuestions = async (
  questions: GeneratedQuestion[],
  quizData: CreateQuizInput,
  userId: string
): Promise<IQuiz> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create questions
    const createdQuestions = await Question.insertMany(
      questions.map((q) => ({
        ...q,
        category: quizData.category,
        createdBy: userId,
        isAIGenerated: true,
      })),
      { session }
    );

    // Create quiz with questions
    const quiz = await Quiz.create(
      [
        {
          ...quizData,
          questions: createdQuestions.map((q) => q._id),
          createdBy: userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return quiz[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Submit quiz and calculate score
export const submitQuiz = async (
  quizId: string,
  userId: string,
  answers: Array<{ questionId: string; answer: string; timeSpent: number }>
) => {
  const quiz = await Quiz.findById(quizId).populate("questions");
  if (!quiz) {
    throw new AppError("Quiz not found", StatusCodes.NOT_FOUND);
  }

  // Check if already submitted
  const existingSubmission = await Submission.findOne({
    quiz: quizId,
    user: userId,
    status: "completed",
  });

  if (existingSubmission) {
    throw new AppError(
      "You have already submitted this quiz",
      StatusCodes.CONFLICT
    );
  }

  // Calculate score
  const questionsMap = new Map<string, IQuestion>();
  (quiz.questions as unknown as IQuestion[]).forEach((q) => {
    questionsMap.set(q._id.toString(), q);
  });

  let totalScore = 0;
  const processedAnswers = answers.map((ans) => {
    const question = questionsMap.get(ans.questionId);
    if (!question) {
      throw new AppError(
        `Question ${ans.questionId} not found`,
        StatusCodes.BAD_REQUEST
      );
    }

    const isCorrect =
      ans.answer.trim().toLowerCase() ===
      question.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      totalScore += question.points;
    }

    return {
      questionId: new mongoose.Types.ObjectId(ans.questionId),
      answer: ans.answer,
      isCorrect,
      pointsEarned: isCorrect ? question.points : 0,
      timeSpent: ans.timeSpent,
    };
  });

  const totalTimeTaken = answers.reduce((sum, a) => sum + a.timeSpent, 0);
  const percentage = Math.round((totalScore / quiz.totalPoints) * 100);
  const passed = percentage >= quiz.passingScore;

  // Create submission
  const submission = await Submission.create({
    quiz: quizId,
    user: userId,
    answers: processedAnswers,
    totalScore,
    maxScore: quiz.totalPoints,
    percentage,
    passed,
    timeTaken: totalTimeTaken,
    status: "completed",
  });

  // Update quiz stats
  quiz.attempts += 1;
  quiz.averageScore =
    ((quiz.averageScore * (quiz.attempts - 1)) + percentage) / quiz.attempts;
  await quiz.save();

  return { submission, quiz };
};
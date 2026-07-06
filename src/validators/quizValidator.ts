// src/validators/quizValidator.ts
import { z } from "zod";

export const createQuizSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  category: z.string().min(1, "Category is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard", "Mixed"]),
  timeLimit: z.number().min(5, "Time limit must be at least 5 minutes"),
  passingScore: z.number().min(0).max(100),
  questions: z.array(z.string()).min(1, "At least one question is required"),
});

export const aiGenerateQuizSchema = z.object({
  topic: z
    .string()
    .min(3, "Topic must be at least 3 characters")
    .max(100, "Topic must be less than 100 characters"),
  difficulty: z.enum(["Easy", "Medium", "Hard", "Mixed"]),
  questionType: z.enum(["mcq", "coding", "mixed"]),
  numberOfQuestions: z.number().min(1).max(20),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type AIGenerateQuizInput = z.infer<typeof aiGenerateQuizSchema>;
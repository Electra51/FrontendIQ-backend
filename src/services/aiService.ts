// src/services/aiService.ts
import Groq from "groq-sdk";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { StatusCodes } from "http-status-codes";
import { AIGenerateQuizInput } from "../validators/quizValidator";

const groq = new Groq({
  apiKey: env.groqApiKey,
});

export interface GeneratedQuestion {
  type: "mcq" | "coding";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  codeStarter?: string;
  testCases?: string[];
}

// Build AI prompt
const buildPrompt = (data: AIGenerateQuizInput): string => {
  return `Generate ${data.numberOfQuestions} ${data.questionType} questions about "${data.topic}" with difficulty level "${data.difficulty}".

Requirements:
- Questions should be practical and real-world focused
- For MCQ: provide exactly 4 options with one correct answer
- For coding: provide starter code and test cases
- Include detailed explanations for each answer
- Points: Easy=5/10, Medium=10/20, Hard=15/30

Return JSON in this exact format:
{
  "questions": [
    {
      "type": "mcq" | "coding",
      "question": "string",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "string",
      "explanation": "string",
      "difficulty": "Easy" | "Medium" | "Hard",
      "points": number,
      "codeStarter": "string",
      "testCases": ["string"]
    }
  ]
}`;
};

// Generate quiz questions using AI
export const generateQuizQuestions = async (
  data: AIGenerateQuizInput
): Promise<GeneratedQuestion[]> => {
  const prompt = buildPrompt(data);

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert frontend developer and technical interviewer. 
          Generate high-quality assessment questions. 
          Always respond with valid JSON only, no markdown or explanations outside JSON.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: env.groqModel,
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new AppError(
        "AI failed to generate response",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    const parsed = JSON.parse(responseContent);
    const questions = parsed.questions as GeneratedQuestion[];

    if (!Array.isArray(questions)) {
      throw new AppError(
        "Invalid AI response format",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return questions;
  } catch (error) {
    if (error instanceof AppError) throw error;

    console.error("AI Generation Error:", error);
    throw new AppError(
      "Failed to generate questions from AI",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// Analyze submission using AI
export const analyzeSubmission = async (
  answers: any[],
  quizCategory: string
) => {
  const prompt = `Analyze this frontend assessment submission for ${quizCategory}:

Answers: ${JSON.stringify(answers, null, 2)}

Provide:
1. Overall score (0-100)
2. Top 3 strengths
3. Top 3 weaknesses
4. 3 specific recommendations for improvement
5. Skill breakdown by subcategory (0-100 each)

Return JSON format:
{
  "overallScore": number,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "skillBreakdown": { "subcategory": number }
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical evaluator. Analyze code submissions and provide detailed feedback. Respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      model: env.groqModel,
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new AppError("AI analysis failed", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return JSON.parse(response);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new AppError(
      "Failed to analyze submission",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
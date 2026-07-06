// src/models/Submission.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubmission extends Document {
  quiz: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  answers: Array<{
    questionId: mongoose.Types.ObjectId;
    answer: string;
    isCorrect: boolean;
    pointsEarned: number;
    timeSpent: number; // in seconds
  }>;
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeTaken: number; // in seconds
  status: "in-progress" | "completed" | "abandoned";
  aiAnalysis?: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    skillBreakdown: Record<string, number>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        answer: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
        pointsEarned: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 0 },
      },
    ],
    totalScore: {
      type: Number,
      default: 0,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    timeTaken: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned"],
      default: "in-progress",
    },
    aiAnalysis: {
      overallScore: Number,
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
      skillBreakdown: { type: Schema.Types.Mixed },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
submissionSchema.index({ user: 1, quiz: 1 });
submissionSchema.index({ quiz: 1, status: 1 });
submissionSchema.index({ createdAt: -1 });

export const Submission: Model<ISubmission> = mongoose.model<ISubmission>(
  "Submission",
  submissionSchema
);
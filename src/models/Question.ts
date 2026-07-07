// src/models/Question.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuestion extends Document {
  title: string;
  type: "mcq" | "coding";
  category: mongoose.Types.ObjectId;
  difficulty: "Easy" | "Medium" | "Hard";
  options?: string[];
  correctAnswer: string;
  explanation: string;
  codeStarter?: string;
  testCases?: string[];
  points: number;
  createdBy: mongoose.Types.ObjectId;
  isAIGenerated: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    title: {
      type: String,
      required: [true, "Question title is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["mcq", "coding"],
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    options: [
      {
        type: String,
      },
    ],
    correctAnswer: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    codeStarter: {
      type: String,
    },
    testCases: [String],
    points: {
      type: Number,
      required: true,
      min: [1, "Points must be at least 1"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
questionSchema.index({ category: 1, difficulty: 1 });
questionSchema.index({ type: 1 });

export const Question: Model<IQuestion> = mongoose.model<IQuestion>(
  "Question",
  questionSchema
);
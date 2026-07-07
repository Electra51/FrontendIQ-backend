// src/models/Quiz.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuiz extends Document {
  title: string;
  description: string;
  category: mongoose.Types.ObjectId;
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  questions: mongoose.Types.ObjectId[];
  timeLimit: number; // in minutes
  passingScore: number;
  totalPoints: number;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  attempts: number;
  averageScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      maxlength: [200, "Title must be less than 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description must be less than 1000 characters"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Mixed"],
      required: true,
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    timeLimit: {
      type: Number,
      required: true,
      min: [5, "Time limit must be at least 5 minutes"],
      default: 30,
    },
    passingScore: {
      type: Number,
      required: true,
      min: [0, "Passing score must be at least 0"],
      max: [100, "Passing score must be at most 100"],
      default: 70,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total points before saving
quizSchema.pre("save", async function (next) {
  if (this.isModified("questions")) {
    const QuestionModel = mongoose.model("Question");
    const questions = await QuestionModel.find({
      _id: { $in: this.questions },
    });
    this.totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  }
  next();
});

// Indexes
quizSchema.index({ category: 1, isActive: 1 });
quizSchema.index({ createdBy: 1 });

export const Quiz: Model<IQuiz> = mongoose.model<IQuiz>("Quiz", quizSchema);
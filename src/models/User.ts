// src/models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: "candidate" | "admin";
  avatar?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  experience?: number;
  skills?: string[];
  isActive: boolean;
  emailVerified: boolean;
  refreshToken?: string;
  stats: {
    totalAssessments: number;
    averageScore: number;
    currentStreak: number;
    rank: number;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [4, "Name must be at least 4 characters"],
      maxlength: [50, "Name must be less than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["candidate", "admin"],
      default: "candidate",
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    githubUrl: {
      type: String,
      match: [/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+$/, "Please enter a valid GitHub URL"],
    },
    linkedinUrl: {
      type: String,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+$/, "Please enter a valid LinkedIn URL"],
    },
    portfolioUrl: {
      type: String,
      match: [/^https?:\/\/.+$/, "Please enter a valid URL"],
    },
    experience: {
      type: Number,
      min: [0, "Experience cannot be negative"],
      max: [50, "Experience must be realistic"],
    },
    skills: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    stats: {
      totalAssessments: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      rank: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret: any) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// ✅ Remove duplicate email index
userSchema.index({ role: 1 });

// ✅ FIXED: Remove 'next' parameter, use async/await
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ✅ Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

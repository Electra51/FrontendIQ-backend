// src/config/env.ts
import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
];

// Validate required env vars
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  // Database
  mongodbUri: process.env.MONGODB_URI!,

  // JWT
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // AI
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "llama-3.1-70b-versatile",

  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
//cloudinary
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME!,
cloudinaryApiKey: process.env.CLOUDINARY_API_KEY!,
cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET!,
};
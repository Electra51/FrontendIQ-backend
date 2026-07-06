// src/utils/constants.ts
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const ROLES = {
  ADMIN: "admin",
  CANDIDATE: "candidate",
} as const;

export const CATEGORIES = [
  "react",
  "typescript",
  "javascript",
  "css",
  "nextjs",
  "testing",
] as const;

export const QUIZ_STATUS = {
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  ABANDONED: "abandoned",
} as const;
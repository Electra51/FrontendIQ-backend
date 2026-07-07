import { z } from "zod";

// ==============================
// Update Profile
// ==============================

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(
      /^[a-zA-Z\s]+$/,
      "Name can only contain letters and spaces"
    )
    .optional(),

  avatar: z
    .string()
    .url("Please enter a valid avatar URL")
    .optional(),
});

// ==============================
// Change Password
// ==============================

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /[A-Z]/,
        "Password must contain at least one uppercase letter"
      )
      .regex(
        /[a-z]/,
        "Password must contain at least one lowercase letter"
      )
      .regex(
        /[0-9]/,
        "Password must contain at least one number"
      )
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your new password"),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

// ==============================
// Types
// ==============================

export type UpdateProfileInput = z.infer<
  typeof updateProfileSchema
>;

export type ChangePasswordInput = z.infer<
  typeof changePasswordSchema
>;
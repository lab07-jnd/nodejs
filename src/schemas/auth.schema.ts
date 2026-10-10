import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(4, "This password is too short"),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  password: z.string(),
});

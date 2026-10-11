import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(4, "This password is too short"),
  phone: z.string().nullish(),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  password: z.string(),
});

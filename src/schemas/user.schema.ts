import z from "zod";

export const updateUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
  email: z.string().trim().email("Invalid email format").optional(),
  password: z.string().min(4, "This password is too short").optional(),
  phone: z.string().trim().optional(),
});

export type DataUpdateUser = z.infer<typeof updateUserSchema> & {
  id: string;
};

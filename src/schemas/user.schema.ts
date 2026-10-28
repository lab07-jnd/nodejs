import { z } from "zod";

export const roles = ["admin", "manager", "employee"] as const;

export const getSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(10),
});

export const updateParamsSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]+$/, { message: "expected hexadecimal id" })
    .length(24),
});

export const updateRoleBodySchema = z.object({
  newRole: z.enum(roles),
});

export const updateStatusBodySchema = z.object({
  newStatus: z.boolean(),
});

export const deleteSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]+$/, { message: "expected hexadecimal id" })
    .length(24),
});

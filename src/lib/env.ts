import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().trim().min(1, "DATABASE_URL é obrigatória"),
  JWT_SECRET: z.string().trim().min(1, "JWT_SECRET é obrigatório"),
  REFRESH_TOKEN_SECRET: z.string().trim().min(1, "JWT_SECRET é obrigatório"),
  PORT: z
    .string()
    .trim()
    .min(1, "PORT é obrigatória")
    .transform(Number)
    .pipe(z.number().int().min(1).max(65535)),
  RESEND_API_KEY: z.string().trim().min(1, "RESEND_API_KEY é obrigatória"),
  RESEND_FROM_EMAIL: z.string().trim().email("RESEND_FROM_EMAIL deve ser um e-mail válido"),
  RESET_PASSWORD_URL: z.string().trim().url("RESET_PASSWORD_URL deve ser uma URL válida"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const issues = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Variáveis de ambiente inválidas:\n${issues.join("\n")}`);
}

export const env = result.data;

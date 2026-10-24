import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().trim().min(1, "DATABASE_URL é obrigatória"),
  JWT_SECRET: z.string().trim().min(1, "JWT_SECRET é obrigatório"),
  PORT: z
    .string()
    .trim()
    .min(1, "PORT é obrigatória")
    .transform(Number)
    .pipe(z.number().int().min(1).max(65535)),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const issues = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Variáveis de ambiente inválidas:\n${issues.join("\n")}`);
}

export const env = result.data;

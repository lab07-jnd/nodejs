import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Resend } from "resend";

export type Role = "admin" | "employee" | "manager";

const JWT_KEY = process.env.JWT_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export const authRole = async (data: Role) => {
  const existingRole = await prisma.user.findFirst({
    where: {
      role: data,
      deletedAt: null,
    },
  });
  if (!existingRole) {
    throw new Error("Acesso negado");
  }

  return existingRole.role;
};

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined");
}

if (!JWT_KEY) {
  throw new Error("JWT_KEY is not defined");
}

const resend = new Resend(RESEND_API_KEY);

export function passwordResetToken(pwdHash: string, userId: string) {
  return jwt.sign({ userId }, JWT_KEY! + pwdHash, { expiresIn: "15m" });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function updateUserPassword(userId: string, password: string) {
  // O hash é feito aqui dentro, garantindo que nunca vá senha pura para o banco
  const passwordHash = await bcrypt.hash(password, 10);

  // Atualiza no banco de dados
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export async function sendPasswordResetToEmail(userEmail: string, RecoveryURL: string) {
  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: [userEmail],
    subject: "Password reset link",
    html: `
    <h1>A password reset has been requested for your account.</h1>
    Click in <a href="${RecoveryURL}">this link</a> to access password reset. If you did not request a password reset, you can ignore this email.
    `,
  });

  if (error) {
    console.error("Error sending email:", error);
    return false;
  }
  return true;
}

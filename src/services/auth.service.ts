import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { Resend } from "resend";
import bcrypt from "bcrypt";
import { env } from "../lib/env.js";

const JWT_SECRET = env.JWT_SECRET;

const RESEND_API_KEY = env.RESEND_API_KEY;
const RESET_PASSWORD_URL = env.RESET_PASSWORD_URL;
const RESEND_FROM_EMAIL = env.RESEND_FROM_EMAIL;

const resend = new Resend(RESEND_API_KEY);

export function generateRefreshToken(userId: string) {
  return jwt.sign({}, env.REFRESH_TOKEN_SECRET, {
    subject: userId,
    expiresIn: "7d",
  });
}

export async function saveRefreshToken(refreshToken: string, userId: string) {
  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
}

export async function validateRefreshToken(refreshToken: string) {
  const payload = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET);

  if (typeof payload === "string" || !payload.sub) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const userId = payload.sub;

  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      userId,
      tokenHash,
      expiresAt: { gt: new Date() },
    },
  });

  if (!storedToken) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  return {
    userId: user.id,
    storedTokenId: storedToken.id,
  };
}

export function passwordResetToken(pwdHash: string, userId: string) {
  return jwt.sign({ userId }, JWT_SECRET! + pwdHash, { expiresIn: "15m" });
}

export async function sendPasswordResetToEmail(userEmail: string, token: string) {
  const resetUrl = new URL(RESET_PASSWORD_URL!);
  resetUrl.searchParams.set("token", token);

  const { error } = await resend.emails.send({
    from: RESEND_FROM_EMAIL!,
    to: [userEmail],
    subject: "Password reset link",
    html: `
    <h1>A password reset has been requested for your account.</h1>
    Click in <a href="${resetUrl.toString()}">this link</a> to access password reset. If you did not request a password reset, you can ignore this email.
    `,
  });

  if (error) {
    console.error("Error sending email:", error);
    return false;
  }
  return true;
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
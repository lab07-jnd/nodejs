import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { Resend } from "resend";
import bcrypt from "bcrypt";

const JWT_KEY = process.env.JWT_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESET_PASSWORD_URL = process.env.RESET_PASSWORD_URL;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

if (!RESET_PASSWORD_URL) {
  throw new Error("RESET_PASSWORD_URL is not configured");
}

if (!RESEND_FROM_EMAIL) {
  throw new Error("RESEND_FROM_EMAIL is not configured");
}

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined");
}

if (!JWT_KEY) {
  throw new Error("JWT_KEY is not defined");
}

const resend = new Resend(RESEND_API_KEY);

export async function validateRefreshToken(refreshToken: string) {
  const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);

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
  return jwt.sign({ userId }, JWT_KEY! + pwdHash, { expiresIn: "15m" });
}

export function generateRefreshToken(userId: string) {
  return jwt.sign({}, process.env.REFRESH_TOKEN_SECRET!, {
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

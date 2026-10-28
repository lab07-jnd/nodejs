import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import type { SignOptions } from "jsonwebtoken";
import type { Role } from "./user.services.js";
const JWT_SECRET = process.env.JWT_SECRET;

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

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export function generateJWT(
  userId: string,
  userRole: Role = "employee",
  expiresTime: SignOptions["expiresIn"] = "1h",
): string {
  return jwt.sign({ userId, role: userRole }, JWT_SECRET!, { expiresIn: expiresTime });
}
export async function logLoginAttempt(email: string, success: boolean, ip: string) {
  const existingUser = await prisma.user.findFirst({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (!existingUser) {
    await prisma.loginAttempts.create({
      data: {
        email,
        success,
        addressIp: ip,
      },
    });
  } else {
    await prisma.loginAttempts.create({
      data: {
        email,
        success,
        userId: existingUser.id,
        addressIp: ip,
      },
    });
  }
}

export async function getLoginAttemptsService() {
  return await prisma.loginAttempts.findMany();
}

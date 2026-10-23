import type { Request, Response } from "express";
import type { SignOptions } from "jsonwebtoken";
import {
  signInSchema,
  signUpSchema,
  passwordResetSchema,
  changePasswordSchema,
} from "../schemas/auth.schema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import {
  findUserByEmail,
  passwordResetToken,
  updateUserPassword,
  sendPasswordResetToEmail,
} from "../services/user.services.js";

const JWT_KEY = process.env.JWT_KEY;

if (!JWT_KEY) {
  throw new Error("JWT_KEY is not defined");
}

async function createUser(
  name: string,
  email: string,
  passwordHash: string,
  phone?: string | null,
) {
  return prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      phone: phone ?? null,
      passwordChangedAt: new Date(),
    },
  });
}

async function getUser(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

function generateJWT(id: string, expiresTime: SignOptions["expiresIn"] = "1h"): string {
  return jwt.sign({ id }, JWT_KEY!, { expiresIn: expiresTime });
}

export async function signUp(req: Request, res: Response) {
  const result = signUpSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: result.error.issues.map((issue) => issue.message),
    });
    return;
  }

  const { name, email, password, phone } = result.data;

  const lowerEmail = email.toLowerCase();

  try {
    if (await getUser(lowerEmail)) {
      res.status(409).json({
        error: "Email already exists",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await createUser(name, lowerEmail, passwordHash, phone);

    const token = generateJWT(String(user.id));

    res.status(201).json({ token });
    return;
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      res.status(409).json({ error: "Email already exists" });
      return;
    }

    console.error(error);

    res.status(500).json({
      error: "Internal Server Error",
    });
    return;
  }
}

export async function signIn(req: Request, res: Response) {
  const result = signInSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: result.error.issues.map((issue) => issue.message),
    });
    return;
  }

  const { email, password } = result.data;

  const lowerEmail = email.toLowerCase();
  try {
    const user = await getUser(lowerEmail);

    if (!user || !user.isActive) {
      res.status(401).json({
        error: "Email or password is incorrect",
      });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      res.status(401).json({
        error: "Email or password is incorrect",
      });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = generateJWT(String(user.id));

    res.json({ token });
    return;
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal Server Error",
    });
    return;
  }
}

export async function passwordReset(req: Request, res: Response) {
  const result = passwordResetSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues.map((issue) => issue.message) });
    return;
  }
  const { email } = result.data;
  try {
    const user = await findUserByEmail(email);
    if (user) {
      const token = passwordResetToken(user.passwordHash, user.id);
      const resetUrl = `https://example.com/reset-password?token=${token}`;
      await sendPasswordResetToEmail(user.email, resetUrl);
    }
    res
      .status(200)
      .json({ message: "If you have an account, you will receive a link to reset your password" });
    return;
  } catch (error) {
    console.error("Error requesting password reset:", error);

    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
}

export async function changePassword(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  const result = changePasswordSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues.map((issue) => issue.message) });
  }

  if (!authHeader) {
    return res.status(401).json({ error: "Token not provided" });
  }

  const [bearer, token] = authHeader.split(" ");
  if (!bearer || bearer.toLowerCase() !== "bearer" || !token) {
    return res.status(401).json({ error: "Invalid authorization header" });
  }
  const { newPassword } = result.data;

  if (!token) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  try {
    const decoded = jwt.decode(token) as { userId: string };
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    jwt.verify(token, process.env.JWT_KEY! + user.passwordHash);

    await updateUserPassword(user.id, newPassword);

    return res.status(200).json({ message: "Password successfully reseted" });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: "Invalid or expired token",
      });
    }

    console.error("Error changing password:", error);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
}

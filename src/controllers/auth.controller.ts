import type { Request, Response } from "express";
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateLoginDate,
} from "../services/user.services.js";
import { signInSchema, signUpSchema } from "../schemas/auth.schema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  generateRefreshToken,
  getLoginAttemptsService,
  logLoginAttempt,
  saveRefreshToken,
  validateRefreshToken,
  generateJWT,
} from "../services/auth.service.js";
import { Prisma } from "@prisma/client";

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
    if (await findUserByEmail(lowerEmail)) {
      res.status(409).json({
        error: "Email already exists",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await createUser(name, lowerEmail, passwordHash, phone);

    res.status(201).json({ msg: "Cadastro realizado com sucesso" });
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

  const ip = req.ip as string;

  if (!result.success) {
    res.status(400).json({
      error: result.error.issues.map((issue) => issue.message),
    });
    return;
  }

  const { email, password } = result.data;

  const lowerEmail = email.toLowerCase();
  try {
    const user = await findUserByEmail(lowerEmail);

    if (!user || !user.isActive) {
      res.status(401).json({
        error: "Email or password is incorrect",
      });
      await logLoginAttempt(email, false, ip);
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      res.status(401).json({
        error: "Email or password is incorrect",
      });
      await logLoginAttempt(email, false, ip);
      return;
    }
    await logLoginAttempt(email, true, ip);

    await updateLoginDate(user.id);

    const accessToken = generateJWT(String(user.id), user.role);

    const refreshToken = generateRefreshToken(String(user.id));

    await saveRefreshToken(refreshToken, String(user.id));

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({ msg: "Logado com sucesso" });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
}

export async function getLoginAttempts(req: Request, res: Response) {
  const logs = await getLoginAttemptsService();
  res.status(200).json({ logs: logs });
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      error: "Refresh token not provided",
    });
  }

  try {
    const { userId } = await validateRefreshToken(refreshToken);
    const user = await findUserById(userId);
    const token = generateJWT(userId, user?.role);

    return res.status(200).json({ token });
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      (error instanceof Error && error.message === "INVALID_REFRESH_TOKEN")
    ) {
      res.clearCookie("refreshToken", { path: "/" });

      return res.status(401).json({
        error: "Refresh token is invalid or expired",
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        res.status(404).json({ error: "Not Found" });
        return;
      }
    }

    console.error(error);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
}

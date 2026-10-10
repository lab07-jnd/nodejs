import type { Request, Response } from "express";
import type { SignOptions } from "jsonwebtoken";
import { signInSchema, signUpSchema } from "../schemas/auth.schema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

const JWT_KEY = process.env.JWT_KEY;

if (!JWT_KEY) {
  throw new Error("JWT_KEY is not defined");
}

async function createUser(email: string, password: string) {
  return prisma.usuario.create({
    data: {
      email,
      senhaHash: password,
    },
  });
}

async function getUser(email: string) {
  return prisma.usuario.findUnique({
    where: {
      email,
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

  const { email, password } = result.data;

  const lowerEmail = email.toLowerCase();

  try {
    if (await getUser(lowerEmail)) {
      res.status(409).json({
        error: "Email already exists",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await createUser(lowerEmail, passwordHash);

    const token = generateJWT(String(user.id));

    res.status(201).json({ token });
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

    if (!user) {
      res.status(401).json({
        error: "Email or password is incorrect",
      });
      return;
    }

    const match = await bcrypt.compare(password, user.senhaHash);

    if (!match) {
      res.status(401).json({
        error: "Email or password is incorrect",
      });
      return;
    }

    const token = generateJWT(String(user.id));

    res.json({ token });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
}

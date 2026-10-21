import type { Request, Response } from "express";
import { signInSchema, signUpSchema } from "../schemas/auth.schema.js";
import bcrypt from "bcrypt";
import {
  createUser,
  findUserById,
  generateJWT,
  updateLoginDate,
} from "../services/user.services.js";

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
    if (await findUserById(lowerEmail)) {
      res.status(409).json({
        error: "Email already exists",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await createUser(name, lowerEmail, passwordHash, phone);

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
    const user = await findUserById(lowerEmail);

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

    await updateLoginDate(user.id);

    const token = generateJWT(String(user.id));

    res.json({ token });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
}

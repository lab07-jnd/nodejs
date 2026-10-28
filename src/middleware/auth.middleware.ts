import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { env } from "../lib/env.js";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json({ message: "Token não fornecido" });

  try {
    jwt.verify(
      token,
      env.JWT_SECRET,
      (err: jwt.VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
        if (err) {
          throw new Error("Token inválido");
        }

        const payload = decoded as { id: string; role: string };
        req.id = payload.id;
        req.roles = payload.role;
      },
    );

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Token inválido" });
  }
};

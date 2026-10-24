import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { env } from "../lib/env.js";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token inválido" });
  }

  try {
    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
      if (err) {
        throw new Error("Token inválido");
      }

      const playload = decoded as { userId: string; role: string };
      req.id = playload.userId;
      req.roles = playload.role;
    });

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Token inválido" });
  }
};

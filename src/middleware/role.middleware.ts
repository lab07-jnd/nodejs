import type { Response, Request, NextFunction } from "express";
import { authRole } from "../services/user.services.js"
import type {Role } from "../services/user.services.js"

const roles: Role[] = ["admin","employee","manager"];

const isRole = (value: string): value is Role => roles.includes(value as Role);

export const authorizeRole = (...allRoles: string[]) => {
  const normalizedAllowedRoles = allRoles.map((role) => role);

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nameRole = req.roles;
      if (!isRole(nameRole)) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const role = await authRole(nameRole);

      if (!normalizedAllowedRoles.includes(role)) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      next();
    } catch (err) {
      if (err instanceof Error) {
        return res.status(403).json({ message: err.message });
      }
      res.status(500).json({ message: "Erro interno" });
    }
  };
};

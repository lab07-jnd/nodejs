import { Router } from "express";
import {
  getUsers,
  changeUserRole,
  changeUserStatus,
  deleteUser,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/role.middleware.js";

const router = Router();

const allowedRoles = ["admin", "manager"];

router.get("/", authMiddleware, authorizeRole(...allowedRoles), getUsers);
router.patch("/:id/role", authMiddleware, authorizeRole(...allowedRoles), changeUserRole);
router.patch("/:id/status", authMiddleware, authorizeRole(...allowedRoles), changeUserStatus);
router.delete("/:id", authMiddleware, authorizeRole(...allowedRoles), deleteUser);

export default router;

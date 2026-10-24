import type { Request, Response } from "express";
import {
  findUsers,
  countUsers,
  updateUserRole,
  updateUserStatus,
  removeUser,
  findUserById,
} from "../services/user.services.js";
import {
  getSchema,
  updateParamsSchema,
  updateRoleBodySchema,
  updateStatusBodySchema,
  deleteSchema,
} from "../schemas/user.schema.js";
import { Prisma } from "@prisma/client";

export async function getUsers(req: Request, res: Response) {
  const result = getSchema.safeParse(req.query);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues.map((issue) => issue.message) });
    return;
  }

  const { page, size } = result.data;

  try {
    const skip = size * (page - 1);

    const users = await findUsers(skip, size);
    const totalUsers = await countUsers();
    const totalPages = Math.ceil(totalUsers / size);
    res.status(200).json({ totalUsers, totalPages, users });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
}

export async function changeUserRole(req: Request, res: Response) {
  const bodyResult = updateRoleBodySchema.safeParse(req.body);
  const paramsResult = updateParamsSchema.safeParse(req.params);

  if (!bodyResult.success) {
    res.status(400).json({ error: bodyResult.error.issues.map((issue) => issue.message) });
    return;
  }

  if (!paramsResult.success) {
    res.status(400).json({ error: paramsResult.error.issues.map((issue) => issue.message) });
    return;
  }
  const { id } = paramsResult.data;
  const { newRole } = bodyResult.data;

  try {
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
    await updateUserRole(id, newRole);
    res.status(200).json({
      message: "updated user role",
    });
    return;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        res.status(404).json({ error: "Not Found" });
        return;
      }
    }
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
}

export async function changeUserStatus(req: Request, res: Response) {
  const bodyResult = updateStatusBodySchema.safeParse(req.body);
  const paramsResult = updateParamsSchema.safeParse(req.params);

  if (!bodyResult.success) {
    res.status(400).json({ error: bodyResult.error.issues.map((issue) => issue.message) });
    return;
  }

  if (!paramsResult.success) {
    res.status(400).json({ error: paramsResult.error.issues.map((issue) => issue.message) });
    return;
  }
  const { id } = paramsResult.data;
  const { newStatus } = bodyResult.data;

  try {
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
    await updateUserStatus(id, newStatus);
    res.status(200).json({
      message: "updated user status",
    });
    return;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        res.status(404).json({ error: "Not Found" });
        return;
      }
    }
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const result = deleteSchema.safeParse(req.params);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues.map((issue) => issue.message) });
    return;
  }

  const { id } = result.data;

  try {
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
    await removeUser(id);

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        res.status(404).json({ error: "Not Found" });
        return;
      }
    }
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
}

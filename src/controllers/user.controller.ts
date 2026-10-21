import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";

import {
  getSchema,
  updateBodySchema,
  updateParamsSchema,
  deleteSchema,
} from "../schemas/user.schema.js";

export async function getUsers(req: Request, res: Response) {
  const result = getSchema.safeParse(req.query);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues.map((issue) => issue.message) });
    return;
  }

  const { page, size } = result.data;

  try {
    const skip = size * (page - 1);

    const users = await prisma.user.findMany({
      skip,
      take: size,
      omit: {
        passwordHash: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    const totalUsers = await prisma.user.count();
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

export async function updateUser(req: Request, res: Response) {
  const bodyResult = updateBodySchema.safeParse(req.body);
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
    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        role: newRole,
      },
    });
    res.status(200).json({
      message: "updated user",
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
    await prisma.user.delete({
      where: {
        id: id,
      },
    });

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

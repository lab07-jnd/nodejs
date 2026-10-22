import { prisma } from "../lib/prisma.js";
export type Role = "admin" | "employee" | "manager";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export function generateJWT(
  userId: string,
  userRole: Role = "employee",
  expiresTime: SignOptions["expiresIn"] = "1h",
): string {
  return jwt.sign({ userId, role: userRole }, JWT_SECRET!, { expiresIn: expiresTime });
}

export const authRole = async (data: Role) => {
  const existingRole = await prisma.user.findFirst({
    where: {
      role: data,
    },
  });
  if (!existingRole) {
    throw new Error("Acesso negado");
  }

  return existingRole.role;
};

export async function createUser(
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

export async function removeUser(id: string) {
  await prisma.user.delete({
    where: {
      id: id,
    },
  });
}

export async function findUserById(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function findUsers(skip: number, size: number) {
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
  return users;
}

export async function countUsers() {
  return await prisma.user.count();
}

export async function updateLoginDate(id: string) {
  await prisma.user.update({
    where: { id: id },
    data: { lastLoginAt: new Date() },
  });
}

export async function updateUserRole(id: string, newRole: Role) {
  await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      role: newRole,
    },
  });
}

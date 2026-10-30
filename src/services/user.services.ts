import { prisma } from "../lib/prisma.js";
export type Role = "admin" | "employee" | "manager";
import bcrypt from "bcrypt";

export const authRole = async (data: Role) => {
  const existingRole = await prisma.user.findFirst({
    where: {
      role: data,
      OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
    },
  });
  console.log("ENTRADA:", data);
  console.log(existingRole);
  if (!existingRole) {
    throw new Error("Acesso negado");
  }

  return existingRole.role;
};

export async function createUser(
  name: string,
  email: string,
  password: string,
  phone?: string | null,
) {
  const passwordHash = await bcrypt.hash(password, 10);

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
  await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export async function findUserByEmail(email: string) {
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
      resetPasswordToken: true,
      resetPasswordExpires: true,
      passwordChangedAt: true,
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

export async function updateUserStatus(id: string, isActive: boolean) {
  await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      isActive: isActive,
    },
  });
}

import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import type { DataUpdateUser } from "../schemas/user.schema.js";

export type Role = "admin" | "employee" | "manager";

export const authRole = async (data: Role) => {
  const existingRole = await prisma.user.findFirst({
    where: {
      role: data,
      deletedAt: null,
    },
  });
  if (!existingRole) {
    throw new Error("Acesso negado");
  }

  return existingRole.role;
};

export const updateUserService = async (data: DataUpdateUser) => {
  const { id, password, ...userData } = data;

  if (userData.email) {
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: userData.email,
      },
    });

    if (existingEmail) {
      throw new Error("Email já cadastrado no sistema", {
        cause: "DUPLICATED_EMAIL",
      });
    }
  }

  const dataToUpdate = {
    ...(userData.name !== undefined && { name: userData.name }),
    ...(userData.email !== undefined && { email: userData.email }),
    ...(userData.phone !== undefined && { phone: userData.phone }),
    ...(password !== undefined && { passwordHash: await bcrypt.hash(password, 10) }),
  };

  await prisma.user.update({
    where: {
      id: id,
    },
    data: dataToUpdate,
  });
};

export const getMeService = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
    },
    select: {
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  });

  if (!user)
    throw new Error("Id inválido", {
      cause: "ID_INVALID",
    });

  return user;
};

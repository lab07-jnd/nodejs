import { prisma } from "../lib/prisma.js";

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

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}
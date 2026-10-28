import type { Request, Response } from "express";
import { updateUserSchema } from "../schemas/user.schema.js";
import { getMeService, updateUserService } from "../services/user.services.js";

export async function updateUser(req: Request, res: Response) {
  try {
    const idUser = req.id;
    if (!idUser) {
      console.log("Deu ruim");
      return;
    }
    const dataUser = updateUserSchema.safeParse(req.body);

    if (!dataUser.success) {
      res.status(400).json({
        error: dataUser.error.issues.map((issue) => issue.message),
      });
      return;
    }

    await updateUserService({ id: idUser, ...dataUser.data });

    return res.status(200).json({ message: "Dados alterados com sucesso" });
  } catch (error) {
    console.log(error);

    if (error instanceof Error) {
      if (error.cause === "DUPLICATED_EMAIL") {
        return res.status(409).json({ error: "E-mail duplicado" });
      }
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const userId = req.id;
    const user = await getMeService(userId);

    return res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      if (error.cause === "ID_INVALID") {
        return res.status(409).json({ error: "Id inválido" });
      }
    }

    return res.status(500).json({ message: "Erro interno no servidor" });
  }
}

import { Router } from "express";
import { getUsers, updateUser, deleteUser } from "../controllers/user.controller.js";
const router = Router();

router.get("/", getUsers);
router.patch("/:id/role", updateUser);
router.delete("/:id", deleteUser);

export default router;

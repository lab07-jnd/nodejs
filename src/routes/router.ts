import express from "express";
import authRouter from "./auth.routes.js";
import logRouter from "./logsLogin.routes.js";
import userRouter from "./user.routes.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/", logRouter);
router.use("/user", authMiddleware, userRouter);

export default router;

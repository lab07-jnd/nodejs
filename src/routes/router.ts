import express from "express";
import authRouter from "./auth.routes.js";
import logRouter from "./logsLogin.routes.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/", logRouter);

export default router;

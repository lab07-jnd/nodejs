import express from "express";
import { getLoginAttempts } from "../controllers/auth.controller.js";
const logRouter = express.Router();

logRouter.get("/logs", getLoginAttempts);

export default logRouter;

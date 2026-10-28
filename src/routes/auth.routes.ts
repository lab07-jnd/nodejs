import express from "express";
import { signUp, signIn, refresh } from "../controllers/auth.controller.js";
const authRouter = express.Router();

authRouter.post("/SignUp", signUp);
authRouter.post("/SignIn", signIn);
authRouter.post("/Refresh", refresh);

export default authRouter;

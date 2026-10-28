import express from "express";
import {
  signUp,
  signIn,
  passwordReset,
  changePassword,
  refresh,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/SignUp", signUp);
authRouter.post("/SignIn", signIn);

authRouter.post("/password-reset", passwordReset);
authRouter.post("/change-password", changePassword);

authRouter.post("/Refresh", refresh);

export default authRouter;

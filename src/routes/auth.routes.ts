import express from "express";
import { signUp, signIn, passwordReset, changePassword } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/SignUp", signUp);
router.post("/SignIn", signIn);
router.post("/password-reset", passwordReset);
router.post("/change-password", changePassword);

export default router;

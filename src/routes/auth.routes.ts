import express from "express";
import { signUp, signIn } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/SignUp", signUp);
router.post("/SignIn", signIn);

export default router;

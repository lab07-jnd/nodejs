import express from "express";
import { signUp, signIn, refresh } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/SignUp", signUp);
router.post("/SignIn", signIn);
router.post("/Refresh", refresh);

export default router;

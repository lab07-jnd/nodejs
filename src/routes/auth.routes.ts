import express from "express";
import {
  signUp,
  signIn,
  passwordReset,
  changePassword,
  refresh,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/SignUp", signUp);
router.post("/SignIn", signIn);
router.post("/password-reset", passwordReset);
router.post("/change-password", changePassword);
router.post("/Refresh", refresh);

export default router;

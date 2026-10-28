import express from "express";
import { getMe, updateUser } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/get-me", getMe);
userRouter.put("/update", updateUser);

export default userRouter;

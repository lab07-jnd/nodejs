import express from "express";
import { updateUser } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.put("/update", updateUser);

export default userRouter;

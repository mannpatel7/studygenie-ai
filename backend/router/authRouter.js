import express from "express";
import { signup, login, logout } from "../controller/authController.js";
const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
export default authRouter;
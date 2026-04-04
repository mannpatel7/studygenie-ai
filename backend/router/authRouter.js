import express from "express";
import { signup, login, logout, googleLogin } from "../controller/authController.js";
const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/google-login", googleLogin);
export default authRouter;
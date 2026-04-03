import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/dbconnect.js";
import authRouter from "./router/authRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());


app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
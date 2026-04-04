import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/dbconnect.js";
import authRouter from "./router/authRouter.js";
import aiRouter from "./router/aiRouter.js";
import dashboardRouter from "./router/dashboardRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());


app.use("/api/auth", authRouter);

app.use("/api", aiRouter);


app.use("/api/dashboard", dashboardRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
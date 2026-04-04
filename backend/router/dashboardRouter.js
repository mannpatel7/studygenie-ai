import express from "express";
import { getDashboard } from "../controller/dashboardController.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/", getDashboard);

export default dashboardRouter;
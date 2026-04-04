import express from "express";
import upload from "../middleware/upload.js"; // ✅ FIX
import { getSummary, getPdfSummary, getPdfQuiz } from "../controller/aiController.js";

const airouter = express.Router();

airouter.post("/summary", getSummary);
airouter.post("/pdf-summary", upload.single("file"), getPdfSummary);

import {
  getFlashcards,
  getPdfFlashcards,
} from "../controller/aiController.js";

airouter.post("/flashcards", getFlashcards);
airouter.post("/pdf-flashcards", upload.single("file"), getPdfFlashcards);
airouter.post("/pdf-quiz", upload.single("file"), getPdfQuiz);

import { saveQuizResult } from "../controller/aiController.js";

airouter.post("/quiz-result", saveQuizResult);

export default airouter;
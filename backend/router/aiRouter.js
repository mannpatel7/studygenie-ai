import express from "express";
import upload from "../middleware/upload.js";
import { getSummary, getPdfSummary, getPdfQuiz, extractPdfText, getStudyPlan } from "../controller/aiController.js";
import { getFlashcards, getPdfFlashcards } from "../controller/aiController.js";
import { saveQuizResult, chatWithAI } from "../controller/aiController.js";

const airouter = express.Router();

// Summary endpoints
airouter.post("/summary", getSummary);
airouter.post("/pdf-summary", upload.single("file"), getPdfSummary);

// Flashcard endpoints
airouter.post("/flashcards", getFlashcards);
airouter.post("/pdf-flashcards", upload.single("file"), getPdfFlashcards);

// Quiz endpoints
airouter.post("/pdf-quiz", upload.single("file"), getPdfQuiz);
airouter.post("/quiz-result", saveQuizResult);

// Study plan endpoint
airouter.post("/study-plan", upload.single("file"), getStudyPlan);

// Chat endpoints
airouter.post("/chat", chatWithAI);
airouter.post("/extract-pdf-text", upload.single("file"), extractPdfText);

export default airouter;
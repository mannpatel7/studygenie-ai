import { generateSummary, generateFlashcards, generateQuiz } from "../services/aiService.js";
import { extractTextFromPDF } from "../services/pdfService.js";
import UserStats from "../models/UserStats.js";
import fs from "fs";

const userId = "demoUser"; // later replace with auth

// ─────────────────────────────────────────
// ✅ UPDATE DASHBOARD HELPER
// ─────────────────────────────────────────
const updateStats = async (update) => {
  await UserStats.findOneAndUpdate(
    { userId },
    update,
    { upsert: true }
  );
};

// ─────────────────────────────────────────
// ✅ TEXT SUMMARY
// ─────────────────────────────────────────
export const getSummary = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const summary = await generateSummary(text.slice(0, 3000));

    await updateStats({
      $push: {
        recentActivity: {
          text: "Generated text summary",
          time: "just now",
        },
      },
    });

    res.json({ summary });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Summary failed" });
  }
};

// ─────────────────────────────────────────
// ✅ PDF SUMMARY
// ─────────────────────────────────────────
export const getPdfSummary = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF required" });
    }

    const filePath = req.file.path;

    const text = await extractTextFromPDF(filePath);
    const summary = await generateSummary(text.slice(0, 3000));

    // 🧠 update stats
    await updateStats({
      $inc: { pdfsUploaded: 1 },
      $push: {
        recentActivity: {
          text: "Generated summary from PDF",
          time: "just now",
        },
      },
    });

    // delete file
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ summary });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "PDF summary failed" });
  }
};

// ─────────────────────────────────────────
// ✅ TEXT FLASHCARDS
// ─────────────────────────────────────────
export const getFlashcards = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text required" });
    }

    const flashcards = await generateFlashcards(text);

    await updateStats({
      $inc: { flashcards: flashcards.length || 10 },
      $push: {
        recentActivity: {
          text: "Generated flashcards",
          time: "just now",
        },
      },
    });

    res.json({ flashcards });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Flashcard failed" });
  }
};

// ─────────────────────────────────────────
// ✅ PDF FLASHCARDS
// ─────────────────────────────────────────
export const getPdfFlashcards = async (req, res) => {
  try {
    const filePath = req.file.path;

    const text = await extractTextFromPDF(filePath);
    const flashcards = await generateFlashcards(text);

    await updateStats({
      $inc: { flashcards: flashcards.length || 10 },
      $push: {
        recentActivity: {
          text: "Generated flashcards from PDF",
          time: "just now",
        },
      },
    });

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ flashcards });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "PDF flashcard failed" });
  }
};

// ─────────────────────────────────────────
// ✅ QUIZ FROM PDF
// ─────────────────────────────────────────
export const getPdfQuiz = async (req, res) => {
  try {
    const filePath = req.file.path;

    const text = await extractTextFromPDF(filePath);
    const quizRaw = await generateQuiz(text);

    // ✅ CLEAN AI RESPONSE (VERY IMPORTANT)
    const cleaned = quizRaw.match(/\[[\s\S]*\]/);

    if (!cleaned) {
      console.error("RAW AI RESPONSE:", quizRaw);
      return res.status(500).json({ message: "AI returned invalid format" });
    }

    const quiz = JSON.parse(cleaned[0]);

    // delete file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ quiz });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Quiz failed" });
  }
};

// ─────────────────────────────────────────
// ✅ SAVE QUIZ RESULT (ADD THIS)
// ─────────────────────────────────────────
export const saveQuizResult = async (req, res) => {
  try {
    const { score } = req.body;

    if (score === undefined) {
      return res.status(400).json({ message: "Score is required" });
    }

    await UserStats.findOneAndUpdate(
      { userId: "demoUser" },
      {
        $inc: {
          quizzesTaken: 1,
          totalScore: score,
          totalQuizzes: 1,
        },
        $push: {
          recentActivity: {
            text: `Completed quiz (score: ${score})`,
            time: "just now",
          },
        },
      },
      { upsert: true }
    );

    res.json({ message: "Quiz result saved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save result" });
  }
};
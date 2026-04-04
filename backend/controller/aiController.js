import { generateSummary, generateFlashcards, generateQuiz, generateStudyPlan } from "../services/aiService.js";
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
// ✅ STUDY PLAN
export const getStudyPlan = async (req, res) => {
  try {
    const { examDate, hoursPerDay } = req.body;

    if (!req.file || !examDate || !hoursPerDay) {
      return res.status(400).json({ message: "Syllabus PDF, exam date, and hours per day are required." });
    }

    const filePath = req.file.path;
    const syllabusText = await extractTextFromPDF(filePath);

    const rawPlan = await generateStudyPlan(syllabusText, examDate, hoursPerDay);
    const cleanedPlan = rawPlan.match(/\{[\s\S]*\}/);

    if (!cleanedPlan) {
      console.error("RAW AI RESPONSE:", rawPlan);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(500).json({ message: "AI returned invalid study plan format." });
    }

    const plan = JSON.parse(cleanedPlan[0]);

    await updateStats({
      $push: {
        recentActivity: {
          text: `Generated study plan from syllabus PDF`,
          time: "just now",
        },
      },
    });

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Study plan generation failed" });
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
    const { score, total } = req.body;

    await UserStats.findOneAndUpdate(
      { userId: "demoUser" },
      {
        $inc: {
          quizzesTaken: 1,
          totalScore: score,
          totalQuestions: total, // ✅ ADD THIS
        },
        $push: {
          recentActivity: {
            text: `Completed quiz (${score}/${total})`,
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

// ─────────────────────────────────────────
// ✅ EXTRACT PDF TEXT FOR CHAT CONTEXT
// ─────────────────────────────────────────
export const extractPdfText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF required" });
    }

    const filePath = req.file.path;

    // Extract full text without summarization
    const text = await extractTextFromPDF(filePath);

    // Delete file after extraction
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Return the full extracted text for use as chat context
    res.json({ 
      text: text.slice(0, 3000), // Limit to 3000 chars to prevent tokens overflow
      fileName: req.file.originalname 
    });

  } catch (error) {
    console.error("PDF extraction error:", error);
    res.status(500).json({ message: "Failed to extract PDF text" });
  }
};

// ─────────────────────────────────────────
// ✅ AI CHATBOT
// ─────────────────────────────────────────
import { generateChatResponse } from "../services/chatService.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Generate AI response
    const response = await generateChatResponse(message, context || null);

    // Update activity stats
    await updateStats({
      $inc: { chatMessages: 1 },
      $push: {
        recentActivity: {
          text: "Had a chat with AI tutor",
          time: "just now",
        },
      },
    });

    res.json({ response });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Failed to get response. Please try again." });
  }
};
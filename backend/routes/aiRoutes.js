const express = require('express');
const router = express.Router();
const {
  generateSummary,
  generateFlashcards,
  generateQuiz,
  generateStudyPlan,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/summary', protect, generateSummary);
router.post('/flashcards', protect, generateFlashcards);
router.post('/quiz', protect, generateQuiz);
router.post('/study-plan', protect, generateStudyPlan);

module.exports = router;
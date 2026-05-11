const { generateAIResponse } = require('../services/openrouterService');
const Summary = require('../models/Summary');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const StudyPlan = require('../models/StudyPlan');

// @desc    Generate summary
// @route   POST /api/ai/summary
// @access  Private
const generateSummary = async (req, res) => {
  const { text, title } = req.body;

  try {
    const prompt = `Please provide a concise summary of the following text:\n\n${text}`;

    const summaryContent = await generateAIResponse(prompt);

    const summary = await Summary.create({
      userId: req.user._id,
      content: summaryContent,
      title: title || 'Summary',
    });

    res.status(201).json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
};

// @desc    Generate flashcards
// @route   POST /api/ai/flashcards
// @access  Private
const generateFlashcards = async (req, res) => {
  const { text, subject, count = 10 } = req.body;

  try {
    const prompt = `Generate ${count} flashcards from the following text. Each flashcard should have a question and answer. Format as JSON array with objects containing "question" and "answer" fields:\n\n${text}`;

    const aiResponse = await generateAIResponse(prompt);

    // Parse the AI response as JSON
    const flashcardsData = JSON.parse(aiResponse);

    const flashcards = await Promise.all(
      flashcardsData.map(card =>
        Flashcard.create({
          userId: req.user._id,
          question: card.question,
          answer: card.answer,
          subject,
        })
      )
    );

    res.status(201).json(flashcards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate flashcards' });
  }
};

// @desc    Generate quiz
// @route   POST /api/ai/quiz
// @access  Private
const generateQuiz = async (req, res) => {
  const { text, subject, count = 10 } = req.body;

  try {
    const prompt = `Generate ${count} multiple choice questions from the following text. Each question should have 4 options and one correct answer. Format as JSON array with objects containing "question", "options" (array), and "correctAnswer" fields:\n\n${text}`;

    const aiResponse = await generateAIResponse(prompt);

    // Parse the AI response as JSON
    const quizData = JSON.parse(aiResponse);

    const quizzes = await Promise.all(
      quizData.map(q =>
        Quiz.create({
          userId: req.user._id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          subject,
        })
      )
    );

    res.status(201).json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate quiz' });
  }
};

// @desc    Generate study plan
// @route   POST /api/ai/study-plan
// @access  Private
const generateStudyPlan = async (req, res) => {
  const { subject, examDate, hoursPerDay } = req.body;

  try {
    const prompt = `Create a study plan for ${subject}. Exam date: ${examDate}. Hours per day: ${hoursPerDay}. Provide a detailed schedule with daily topics and hours. Format as JSON with "schedule" array containing objects with "date", "topics" (array), and "hours" fields.`;

    const aiResponse = await generateAIResponse(prompt);

    // Parse the AI response as JSON
    const planData = JSON.parse(aiResponse);

    const studyPlan = await StudyPlan.create({
      userId: req.user._id,
      subject,
      examDate,
      hoursPerDay,
      schedule: planData.schedule,
    });

    res.status(201).json(studyPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate study plan' });
  }
};

module.exports = {
  generateSummary,
  generateFlashcards,
  generateQuiz,
  generateStudyPlan,
};
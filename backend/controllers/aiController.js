const { generateAIResponse, generateChatResponse } = require('../services/openrouterService');
const Summary = require('../models/Summary');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const StudyPlan = require('../models/StudyPlan');
const multer = require('multer');
const pdfParse = require('pdf-parse');

// Configure multer for in-memory file upload compatible with serverless environments
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const cleanAIResponse = (rawResponse) => {
  let text = rawResponse.trim();
  text = text.replace(/```json|```/gi, '');
  text = text.replace(/(^|\n)\s*(Warning|Error):.*(?=\n|$)/gi, '');
  return text.trim();
};

const findJsonSubstring = (text) => {
  const openChars = ['{', '['];
  for (let i = 0; i < text.length; i += 1) {
    if (!openChars.includes(text[i])) continue;
    const startChar = text[i];
    const endChar = startChar === '{' ? '}' : ']';
    let depth = 0;
    let inString = false;
    let escape = false;

    for (let j = i; j < text.length; j += 1) {
      const char = text[j];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === startChar) depth += 1;
        if (char === endChar) {
          depth -= 1;
          if (depth === 0) {
            return text.slice(i, j + 1);
          }
        }
      }
    }
  }
  return null;
};

const parseAIJson = (rawResponse) => {
  const text = cleanAIResponse(rawResponse);
  try {
    return JSON.parse(text);
  } catch (error) {
    const jsonString = findJsonSubstring(text);
    if (jsonString) {
      return JSON.parse(jsonString);
    }
    throw error;
  }
};

// @desc    Generate multiple content types from PDF
// @route   POST /api/ai/generate
// @access  Private
const generateContent = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let { contentTypes, startDate, examDate } = req.body; // Array of selected types: ['summary', 'flashcards', 'quiz']

    if (typeof contentTypes === 'string') {
      try {
        contentTypes = JSON.parse(contentTypes);
      } catch (parseError) {
        console.error('Failed to parse contentTypes:', parseError);
      }
    }

    if (typeof startDate === 'string') {
      startDate = startDate.trim();
    }
    if (typeof examDate === 'string') {
      examDate = examDate.trim();
    }

    if (!contentTypes || !Array.isArray(contentTypes) || contentTypes.length === 0) {
      return res.status(400).json({ message: 'Please select at least one content type' });
    }

    if (contentTypes.includes('study-plan')) {
      if (!req.user?.isPremium) {
        return res.status(403).json({ message: 'Study Planner is a premium feature. Upgrade to unlock.' });
      }
      if (!startDate || !examDate) {
        return res.status(400).json({ message: 'Study plan requires both start date and exam date' });
      }
    }

    const filename = req.file.originalname;
    const dataBuffer = req.file.buffer;

    if (!Buffer.isBuffer(dataBuffer)) {
      return res.status(400).json({ message: 'Uploaded PDF payload is invalid' });
    }

    const data = await pdfParse(dataBuffer);
    const extractedText = data.text || '';

    const result = {
      filename,
      extractedText,
    };

    // Generate content based on selected types
    if (contentTypes.includes('summary')) {
      const summaryPrompt = `Please provide a well-structured summary of the following text using markdown formatting. 
Use the following structure:
- Use headings (##) for main sections
- Use bullet points (*) for key points under each section
- Use bold (**text**) for important terms
- Use italic (*text*) for emphasis
- Group related information together
- Make it easy to scan and read

Text to summarize:

${extractedText}`;
      const summaryContent = await generateAIResponse(summaryPrompt);
      result.summary = {
        id: Date.now().toString(),
        content: summaryContent,
        title: filename.replace('.pdf', ''),
        createdAt: new Date().toISOString(),
      };
    }

    if (contentTypes.includes('flashcards')) {
      const flashcardsPrompt = `Generate 8-10 flashcards from the following text. Each flashcard should have a question and answer. Return only a JSON array with objects containing \"question\" and \"answer\" fields, with no additional commentary.\n\n${extractedText}`;
      const flashcardsResponse = await generateAIResponse(flashcardsPrompt);
      const flashcardsData = parseAIJson(flashcardsResponse);

      result.flashcards = flashcardsData.map((card, index) => ({
        id: `${Date.now()}-${index}`,
        question: card.question,
        answer: card.answer,
        subject: filename.replace('.pdf', ''),
      }));
    }

    if (contentTypes.includes('quiz')) {
      const quizPrompt = `Generate 8-10 multiple choice questions from the following text. Each question should have 4 answer options and one correct answer. Return only a JSON array with objects containing \"question\", \"options\" (array), and \"correctAnswer\" fields, with no additional commentary.\n\n${extractedText}`;
      const quizResponse = await generateAIResponse(quizPrompt);
      const quizData = parseAIJson(quizResponse);

      result.quiz = quizData.map((q, index) => ({
        id: `${Date.now()}-${index}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        subject: filename.replace('.pdf', ''),
      }));
    }

    if (contentTypes.includes('study-plan')) {
      const studyPlanPrompt = `Based on the following syllabus, create a comprehensive AI-powered study schedule.
Use the start date ${startDate} and exam date ${examDate}.
Return only a valid JSON object with no extra commentary.
The object must include:
- "schedule": array of daily plans where each item contains:
  - "date": date string in YYYY-MM-DD format
  - "topics": array of topics to study that day
  - "hours": recommended hours for that day
  - "description": brief description of what to focus on
- Distribute topics evenly across days
- Allocate more hours to important chapters/topics
- Include review days

Syllabus content:

${extractedText}`;
      const studyPlanResponse = await generateAIResponse(studyPlanPrompt);
      const studyPlanData = parseAIJson(studyPlanResponse);

      result.studyPlan = {
        id: Date.now().toString(),
        content: JSON.stringify(studyPlanData, null, 2),
        title: `Study Plan - ${filename.replace('.pdf', '')}`,
        schedule: Array.isArray(studyPlanData.schedule) ? studyPlanData.schedule : [],
        createdAt: new Date().toISOString(),
      };
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate content' });
  }
};

// @desc    Generate summary
// @route   POST /api/ai/summary
// @access  Private
const generateSummary = async (req, res) => {
  const { text, title } = req.body;

  try {
    const prompt = `Please provide a well-structured summary of the following text using markdown formatting. 
Use the following structure:
- Use headings (##) for main sections
- Use bullet points (*) for key points under each section
- Use bold (**text**) for important terms
- Use italic (*text*) for emphasis
- Group related information together
- Make it easy to scan and read

Text to summarize:

${text}`;

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
    const flashcardsData = parseAIJson(aiResponse);

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
    const quizData = parseAIJson(aiResponse);

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
  if (!req.user?.isPremium) {
    return res.status(403).json({ message: 'Study Planner is a premium feature. Upgrade to unlock.' });
  }

  const { subject, examDate, hoursPerDay } = req.body;

  try {
    const prompt = `Create a study plan for ${subject}. Exam date: ${examDate}. Hours per day: ${hoursPerDay}. Provide a detailed schedule with daily topics and hours. Return only a valid JSON object with a "schedule" array containing objects with "date", "topics" (array), and "hours" fields.`;

    const aiResponse = await generateAIResponse(prompt);

    // Parse the AI response as JSON
    const planData = parseAIJson(aiResponse);

    if (!planData || !Array.isArray(planData.schedule)) {
      throw new Error('AI response did not contain a valid schedule array');
    }

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

// @desc    Chat with AI
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res) => {
  if (!req.user?.isPremium) {
    return res.status(403).json({ message: 'AI Chat is a premium feature. Upgrade to unlock.' });
  }

  const { message, context } = req.body;

  try {
    const aiResponse = await generateChatResponse(message, context);

    res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to chat with AI' });
  }
};

module.exports = {
  generateSummary,
  generateFlashcards,
  generateQuiz,
  generateStudyPlan,
  chatWithAI,
  generateContent,
  upload,
};
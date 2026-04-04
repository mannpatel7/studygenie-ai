import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  text: String,
  time: String,
});

const userStatsSchema = new mongoose.Schema({
  userId: String,

  pdfsUploaded: { type: Number, default: 0 },
  flashcards: { type: Number, default: 0 },
  quizzesTaken: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  totalQuizzes: { type: Number, default: 0 },
  studyHours: { type: Number, default: 0 },
  totalQuestions: {
  type: Number,
  default: 0,
},

  recentActivity: [activitySchema],
});

export default mongoose.model("UserStats", userStatsSchema);
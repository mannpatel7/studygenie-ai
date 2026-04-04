import UserStats from "../models/UserStats.js";

// GET DASHBOARD
export const getDashboard = async (req, res) => {
  try {
    const userId = "demoUser"; // later replace with auth user

    let stats = await UserStats.findOne({ userId });

    if (!stats) {
      stats = await UserStats.create({ userId });
    }

    const avgScore =
      stats.totalQuizzes > 0
        ? Math.round(stats.totalScore / stats.totalQuizzes)
        : 0;

    res.json({
      pdfsUploaded: stats.pdfsUploaded,
      flashcards: stats.flashcards,
      quizzesTaken: stats.quizzesTaken,
      avgScore,
      studyHours: stats.studyHours,
      recentActivity: stats.recentActivity.reverse(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
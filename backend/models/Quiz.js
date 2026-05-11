const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: String,
    required: [true, 'Please add a question'],
  },
  options: [{
    type: String,
    required: true,
  }],
  correctAnswer: {
    type: String,
    required: [true, 'Please add the correct answer'],
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Quiz', quizSchema);
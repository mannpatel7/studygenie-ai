const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: String,
    required: [true, 'Please add a question'],
  },
  answer: {
    type: String,
    required: [true, 'Please add an answer'],
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Flashcard', flashcardSchema);
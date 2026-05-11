const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Please add summary content'],
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Summary', summarySchema);
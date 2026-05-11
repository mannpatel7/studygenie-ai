const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
  },
  examDate: {
    type: Date,
    required: [true, 'Please add an exam date'],
  },
  hoursPerDay: {
    type: Number,
    required: [true, 'Please add hours per day'],
  },
  schedule: [{
    date: {
      type: Date,
      required: true,
    },
    topics: [{
      type: String,
      required: true,
    }],
    hours: {
      type: Number,
      required: true,
    },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
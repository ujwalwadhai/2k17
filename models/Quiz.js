// models/QuizState.js
const mongoose = require('mongoose');

const quizStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    unique: true, // Ensures a user can only have one active quiz at a time
  },
  questions: {
    type: Array,
    required: true,
  },
  currentQuestionIndex: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // This TTL index will automatically delete the document 2 hours after its creation.
    // Perfect for cleaning up quizzes that were started but never finished.
    expires: '2h',
  },
});

module.exports = mongoose.model('QuizState', quizStateSchema);
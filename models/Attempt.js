const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    quiz: { 
      type: String,
      ref: 'Quiz',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    answers: {
      type: [Number],
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
        type: Number,
        required: true,
    }
  },
  {
    timestamps: true,
  }
);

attemptSchema.index({ quiz: 1, user: 1 }, { unique: true });

const Attempt = mongoose.model('Attempt', attemptSchema);

module.exports = Attempt;
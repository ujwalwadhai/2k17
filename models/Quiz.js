const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [val => val.length >= 2, 'A question must have at least 2 options.'],
  },
  correctAnswer: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return v >= 0 && v < this.options.length;
      },
      message: 'Correct answer index is out of bounds.'
    }
  },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A quiz must have a title.'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    questions: [questionSchema],
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
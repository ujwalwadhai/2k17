const Quiz = require('../../models/Quiz');
const Attempt = require('../../models/Attempt');

module.exports = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const userId = req.user._id;
    const userAnswers = req.body.answers;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).send('Quiz not found.');
    }

    let score = 0;
    const parsedAnswers = [];

    quiz.questions.forEach((question, index) => {
      const userAnswerIndex = parseInt(userAnswers[index], 10);
      parsedAnswers.push(userAnswerIndex);
      if (userAnswerIndex === question.correctAnswer) {
        score++;
      }
    });

    const newAttempt = new Attempt({
      quiz: quizId,
      user: userId,
      answers: parsedAnswers,
      score: score,
      totalQuestions: quiz.questions.length,
    });
    await newAttempt.save();

    res.redirect(`/quiz/attempt/${newAttempt._id}`);

  } catch (error) {
    console.error('Error handling attempt:', error);
    res.redirect(`/quiz/${req.params.quizId}`);
  }
};
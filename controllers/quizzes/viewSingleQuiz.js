const Quiz = require('../../models/Quiz');
const Attempt = require('../../models/Attempt');

module.exports = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const userId = req.user._id;

    const existingAttempt = await Attempt.findOne({ quiz: quizId, user: userId });

    if (existingAttempt) {
      return res.redirect(`/quiz/attempt/${existingAttempt._id}`);
    }

    const quiz = await Quiz.findById(quizId).populate("createdBy", "name username");
    if (!quiz) {
      return res.status(404).send('Quiz not found.');
    }

    res.render('pages/quiz/take', {
      quiz: quiz,
    });

  } catch (error) {
    console.error('Error in viewSingleQuiz:', error);
    res.render('pages/404');
  }
};
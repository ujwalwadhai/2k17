const Quiz = require('../../models/Quiz');
const Attempt = require('../../models/Attempt');

module.exports = async (req, res) => {
  try {
    const { quizId } = req.params;

    const [quiz, leaderboard] = await Promise.all([
      Quiz.findById(quizId).select('title description isClosed'),

      Attempt.find({ quiz: quizId })
        .sort({ score: -1, createdAt: 1 })
        .limit(25)
        .populate('user', 'name username')
    ]);

    if (!quiz) {
      return res.status(404).send('Quiz not found.');
    }

    const attempted = leaderboard.some(attempt => attempt.user._id.toString() === req?.user?._id.toString());

    res.render('pages/quiz/leaderboard', {
      title: `Leaderboard for ${quiz.title}`,
      user: req?.user ?? null,
      attempted,
      quiz: quiz,
      leaderboard: leaderboard
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).send('Error loading leaderboard.');
  }
};
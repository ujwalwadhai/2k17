const Quiz = require('../../models/Quiz');

module.exports = async (req, res) => {
  try {
    const quizzes = await Quiz.find({}).sort({ createdAt: -1 }).populate('createdBy', 'name username')

    res.render('pages/quiz/list', {
      title: 'Available Quizzes',
      quizzes: quizzes
    });

  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).send('Error loading the quiz page.');
  }
};
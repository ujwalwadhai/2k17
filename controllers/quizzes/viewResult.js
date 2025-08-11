const Attempt = require('../../models/Attempt');

module.exports = async (req, res) => {
  try {
    const attemptId = req.params.attemptId;
      
    const attempt = await Attempt.findById(attemptId)
        .populate('user', 'name username')
        .populate('quiz');

    if (!attempt) {
      return res.status(404).send('Result not found.');
    }

    res.render('pages/quiz/result', {
      title: attempt.quiz.title,
      attempt,
    });

  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).send('Error loading result page.');
  }
};
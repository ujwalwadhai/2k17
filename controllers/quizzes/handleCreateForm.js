const sendMail = require('../../config/mailer');
const Quiz = require('../../models/Quiz');

module.exports = async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    const formattedQuestions = questions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: parseInt(q.correctAnswer, 10),
    }));

    const newQuiz = new Quiz({
      title,
      description,
      questions: formattedQuestions,
      createdBy: req.user._id,
    });

    await newQuiz.save();
    await sendMail('new_quiz', 'wadhaiujwal@gmail.com', { quiz: { title, description, questions: formattedQuestions.length }, createdBy: req.user.name });

    res.redirect(`/quiz/${newQuiz._id}`);

  } catch (error) {
    console.error('Error creating quiz:', error);
    res.redirect('/quiz/create');
  }
};
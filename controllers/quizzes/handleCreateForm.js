const sendMail = require('../../config/mailer');
const Quiz = require('../../models/Quiz');
const Users = require('../../models/Users');

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
    //const admins = await Users.find({ role: 'admin', username: {$ne: '2k17platform'} }, {email: 1});
    //const adminMails = admins.map(admin => admin.email);
    //await sendMail('new_quiz', adminMails, { quiz: { title, description, questions: formattedQuestions.length }, createdBy: req.user.name });

    res.redirect(`/quiz/${newQuiz._id}`);

  } catch (error) {
    console.error('Error creating quiz:', error);
    res.redirect('/quiz/create');
  }
};
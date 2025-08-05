const express = require('express');
const router = express.Router();
const Users = require('../models/Users');

const QuizState = require('../models/Quiz');

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const formatDob = (dobString) => {
  const [day, month, year] = dobString.split('/');
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' }).format(date);
};

async function generateQuizQuestions(currentUserId) {
  const allUsers = await Users.find({}, 'name dob');
  if (allUsers.length < 4) return [];

  const potentialSubjects = allUsers.filter(user => user._id.toString() !== currentUserId.toString());
  
  const uniqueSubjects = Array.from(
    new Map(shuffleArray(potentialSubjects).map(subject => [subject.name, subject])).values()
  ).slice(0, 15);

  const questions = uniqueSubjects.map(subject => {
    const correctAnswer = formatDob(subject.dob);

    const [day, month, year] = subject.dob.split('/');
    const correctDay = parseInt(day, 10);
    const birthMonth = parseInt(month, 10);
    const birthYear = parseInt(year, 10);

    const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();

    const dayPool = Array.from({ length: daysInMonth }, (_, i) => i + 1)
                         .filter(d => d !== correctDay);

    if (dayPool.length < 3) {
      return null;
    }

    const decoyDays = shuffleArray(dayPool).slice(0, 3);

    const finalDecoys = decoyDays.map(decoyDay => {
      const decoyDobString = `${decoyDay}/${birthMonth}/${birthYear}`;
      return formatDob(decoyDobString);
    });

    return {
      questionSubjectName: subject.name,
      options: shuffleArray([correctAnswer, ...finalDecoys]),
      correctAnswer: correctAnswer,
    };
  }).filter(Boolean);

  return questions;
}

router.get('/', async (req, res) => {
  try {
    if (!req.user) return res.redirect('/login');

    const currentUser = await Users.findById(req.user._id);
    if (currentUser.quizScore !== null) {
      return res.redirect('/quiz/results');
    }

    let activeQuiz = await QuizState.findOne({ userId: req.user._id });

    if (!activeQuiz) {
      const questions = await generateQuizQuestions(req.user._id);
      if (questions.length === 0) {
        return res.render('pages/500', { title: 'Quiz Error', message: 'Not enough player data to create a quiz.' });
      }
      activeQuiz = await QuizState.create({ userId: req.user._id, questions });
    }

    res.render('pages/quiz/quiz', {
      title: 'Birthday Quiz',
      questions: activeQuiz.questions,
    });

  } catch (error) {
    console.error('Quiz GET route error:', error);
    res.status(500).render('pages/500', { title: 'Server Error', message: 'An unexpected error occurred.' });
  }
});

router.post('/submit', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'User not authenticated' });

    const { answers } = req.body;
    const activeQuiz = await QuizState.findOne({ userId: req.user._id });

    if (!activeQuiz) {
      return res.status(404).json({ error: 'No active quiz found.' });
    }

    let score = 0;
    activeQuiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    await Users.findByIdAndUpdate(req.user._id, { quizScore: score });
    await QuizState.deleteOne({ userId: req.user._id });

    res.json({ redirectUrl: '/quiz/results' });

  } catch (error) {
    console.error('Quiz POST submit error:', error);
    res.status(500).json({ error: 'Failed to submit quiz.' });
  }
});

router.get('/results', async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login');
        const currentUser = await Users.findById(req.user._id);
        if (currentUser.quizScore === null) {
            return res.redirect('/quiz');
        }
        const players = await Users.find({ quizScore: { $ne: null } }).sort({ quizScore: 'desc' });
        const rank = players.findIndex(p => p._id.toString() === currentUser._id.toString()) + 1;
        res.render('pages/quiz/quiz_results', {
            title: 'Your Quiz Result',
            score: currentUser.quizScore,
            rank,
            totalPlayers: players.length,
        });
    } catch (error) {
        console.error('Quiz results route error:', error);
        res.status(500).render('pages/500', { title: 'Server Error', message: 'Could not load results.' });
    }
});


router.get('/leaderboard', async (req, res) => {
  try {
    const players = await Users.find({ quizScore: { $ne: null } }).sort({ quizScore: 'desc' });
    res.render('pages/quiz/leaderboard', {
      title: 'Leaderboard',
      players,
      user: req?.user ?? null
    });
  } catch (error) {
    console.error('Leaderboard route error:', error);
    res.redirect('/quiz')
  }
});

module.exports = router;
var express = require('express');
var router = express.Router();
var getController = require('../controllers/getController');
var authController = require('../controllers/auth');
var emailController = require('../controllers/email');
var postsController = require('../controllers/posts');
var reportsController = require('../controllers/reports');
var memoriesController = require('../controllers/memories');
var analyticsController = require('../controllers/analytics');
var usersController = require('../controllers/users');
var adminController = require('../controllers/admin');
var quizController = require('../controllers/quizzes');
var { isLoggedIn } = require('../middlewares/auth');


router.get('/logout', isLoggedIn, authController.logout);

router.get('/login/admin', getController.login);

router.get('/auth/google', authController.google.googleAuth);

router.get('/auth/google/callback', authController.google.googleAuthCallback, authController.google.googleRedirectSuccess);

router.get('/account', isLoggedIn, authController.myAccount);

router.get('/', getController.indexPage);

router.get('/terms-of-service', getController.termsOfService);

router.get('/home', isLoggedIn, getController.home);


router.get('/verify-email/:token', emailController.verifyEmail);


router.get('/login', getController.login);

router.get('/create-account', getController.register);

router.get('/login/email', getController.emailLogin);

router.get('/contribute', getController.contribute);

router.get('/members', isLoggedIn, getController.members);


router.get('/profile', isLoggedIn, getController.viewProfile);

router.get('/profile/edit', isLoggedIn, getController.editProfile);

router.get('/settings', isLoggedIn, getController.settings);

router.get('/reset-password/:token', getController.renderResetPage);


router.get('/post/:id', postsController.viewPost);

router.get('/post/:postId/likes', postsController.fetchPostLikes);


router.get('/admin/report/:id', reportsController.fetchReport);

router.get('/admin/users', adminController.adminUserlist);

router.get('/admin/analytics', getController.analyticsPage);

router.get('/admin/analytics/:date', analyticsController.dayAnalytics)

router.get('/admin', getController.admin);


router.get('/memories', isLoggedIn, memoriesController.showMemories)

router.get('/memories/folder/my-memories', isLoggedIn, memoriesController.showMyMemories)

router.get('/memories/folder/:folderId', isLoggedIn, memoriesController.showFolder)

router.get('/memories/file/:fileId', isLoggedIn, memoriesController.showFile)


router.get('/api/analytics/online-users', analyticsController.onlineUsers);

router.get('/api/analytics/page-stats', analyticsController.pageStats);

router.get('/api/analytics/daily-users', analyticsController.dailyUsers);

router.get('/api/analytics/daily-route-views', analyticsController.dailyRouteViews);

router.get('/api/analytics/monthly-users', analyticsController.monthlyUsers);


router.get('/search-users', isLoggedIn, usersController.searchUsers);


router.get('/quizzes', isLoggedIn, quizController.listAllQuizzes);

router.get('/quiz/create', isLoggedIn, quizController.renderCreateForm);

router.get('/quiz/:quizId', isLoggedIn, quizController.viewSingleQuiz);

router.get('/quiz/attempt/:attemptId', quizController.viewResult);

router.get('/quiz/leaderboard/:quizId', quizController.viewLeaderboard);


router.get('/badges', isLoggedIn, getController.badges)


router.get('/ping', (req, res)=> res.send('pong')) // to keep the website from sleeping

router.get('/2k17platform', (req, res) => res.redirect('/'))

router.get('/500', (req, res) => res.render('pages/500'))

router.get('/404', (req, res) => res.render('pages/404'))

router.get('/football', getController.footballGame)

router.get('/:username', getController.viewProfile);

module.exports = router;
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
var { isLoggedIn } = require('../middlewares/auth');


router.get('/logout', isLoggedIn, authController.logout);

router.get('/login/admin', getController.login);

router.get('/auth/google', authController.google.googleAuth);

router.get('/auth/google/callback', authController.google.googleAuthCallback, authController.google.googleRedirectSuccess);


router.get('/verify-email/:token', emailController.verifyEmail);


router.get('/', getController.indexPage);

router.get('/terms-of-service', getController.termsOfService);

router.get('/home', isLoggedIn, getController.home);

router.get('/admin', getController.admin);

router.get("/pre-register", (req, res) => res.redirect('/create-account'));

router.get('/preregister', (req, res) => res.redirect('/create-account'));

router.get('/login', getController.login);

router.get('/create-account', getController.register);

router.get('/login/email', getController.emailLogin);

router.get('/donate', getController.donate);

router.get('/members', getController.members);


router.get('/profile', isLoggedIn, getController.myProfile);

router.get('/profile/edit', isLoggedIn, getController.editProfile);

router.get('/settings', isLoggedIn, getController.settings);

router.get('/reset-password/:token', getController.renderResetPage);


router.get('/post/:id', postsController.viewPost);

router.get('/post/:postId/likes', postsController.fetchPostLikes);


router.get('/admin/report/:id', reportsController.fetchReport);

router.get('/admin/users', getController.adminUserlist);

router.get('/admin/analytics', getController.analyticsPage);

router.get('/admin/userinfo/:userId', getController.adminUserInfo);



router.get('/memories', memoriesController.showMemories)

router.get('/memories/folder/:folderId', isLoggedIn, memoriesController.showFolder)

router.get('/memories/file/:fileId', isLoggedIn, memoriesController.showFile)


router.get('/api/analytics/online-users', analyticsController.onlineUsers);

router.get('/api/analytics/page-stats', analyticsController.pageStats);

router.get('/api/analytics/daily-users', analyticsController.dailyUsers);

router.get('/api/analytics/daily-route-views', analyticsController.dailyRouteViews);

router.get('/api/analytics/monthly-users', analyticsController.monthlyUsers);

// GET /api/search-users?keyword=ujwal
router.get('/search-users', isLoggedIn, usersController.searchUsers);



router.get('/ping', (req, res)=> res.send('pong')) // to keep the website from sleeping

router.get('/:username', getController.viewProfile);

module.exports = router;
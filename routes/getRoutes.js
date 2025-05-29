var express = require('express');
var router = express.Router();
var getController = require('../controllers/getController');
var authController = require('../controllers/auth');
var emailController = require('../controllers/email');
var postsController = require('../controllers/posts');
var reportsController = require('../controllers/reports');
var { isLoggedIn } = require('../middlewares/auth');


router.get('/logout', isLoggedIn, authController.logout);


router.get('/verify-email/:token', emailController.verifyEmail);


router.get('/', getController.indexPage);

router.get('/terms-of-service', getController.termsOfService);

router.get('/home', isLoggedIn, getController.home);

router.get('/admin', getController.admin);

router.get('/login', getController.login);

router.get('/create-account', getController.createAccount);

router.get('/login/email', getController.emailLogin);

router.get('/donate', getController.donate);

router.get('/members', getController.members);

router.get('/gallery', getController.gallery);

router.get('/u/:username', getController.viewProfile);

router.get('/profile', isLoggedIn, getController.myProfile);

router.get('/profile/edit', isLoggedIn, getController.editProfile);

router.get('/settings', isLoggedIn, getController.settings);

router.get('/reset-password/:token', getController.renderResetPage);


router.get('/post/:id', postsController.viewPost);


router.get('/admin/report/:id', isLoggedIn, reportsController.fetchReport);


router.get('/ping', (req, res)=> res.send('pong')) // to keep the website from sleeping


module.exports = router;
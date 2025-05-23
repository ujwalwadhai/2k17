var express = require('express');
var router = express.Router();
var getController = require('../controllers/getController');
var { isLoggedIn } = require('../middlewares/auth');
var hasRole = require('../middlewares/role');

router.get('/', getController.indexPage);

router.get('/home', isLoggedIn, getController.home);

router.get('/login', getController.login);

router.get('/create-account', getController.createAccount);

router.get('/login/email', getController.emailLogin);

router.get('/donate', getController.donate);

router.get('/members', getController.members);

// router.get('/upload', (req, res) => res.render('pages/upload'))

router.get('/logout', isLoggedIn, getController.logout);

router.get('/verify-email/:token', getController.verifyEmail);

router.get('/gallery', getController.gallery);

router.get('/post/:id', getController.viewPost);

router.get('/u/:username', getController.viewProfile);

router.get('/profile', isLoggedIn, getController.myProfile);

router.get('/profile/edit', isLoggedIn, getController.editProfile);

router.get('/settings', isLoggedIn, getController.settings);

router.get('/reset-password/:token', getController.renderResetPage);

module.exports = router;

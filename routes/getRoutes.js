const express = require('express');
const router = express.Router();
const getController = require('../controllers/getController');
const { isLoggedIn } = require('../middlewares/auth');

router.get('/', getController.indexPage);

router.get('/home', isLoggedIn, getController.home);

router.get('/login', getController.login);

router.get('/create-account', getController.createAccount);

router.get('/login/email', getController.emailLogin);

router.get('/donate', getController.donate);

router.get('/members', getController.members);

router.get('/upload', (req, res) => res.render('pages/upload'))

router.get('/logout', getController.logout);

router.get('/gallery', getController.gallery);

module.exports = router;

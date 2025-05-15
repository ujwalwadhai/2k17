const express = require('express');
const router = express.Router();
const getController = require('../controllers/getController');
const { isLoggedIn } = require('../middlewares/auth');
var hasRole = require('../middlewares/role');

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

router.get('/admin', isLoggedIn, hasRole('admin'), (re1, res) => {
    res.send("Admin page")
});

router.get('/moderator', isLoggedIn, hasRole('moderator'), (req, res) => {
    res.send("Moderator page")
})

module.exports = router;

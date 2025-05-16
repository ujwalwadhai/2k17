const express = require('express');
const router = express.Router();
const getController = require('../controllers/getController');
const { isLoggedIn } = require('../middlewares/auth');
var hasRole = require('../middlewares/role');
var Posts = require('../models/Post');

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

router.get('/create/post', isLoggedIn, async (req, res) => {
    var post = new Posts({
        text: 'Hey there',
        author: req.user._id,
        media: {
            url: '/images/ujwal_profile.jpg',
            type: 'image/jpeg'
        }
    })
    await post.save()
    res.redirect('/home?post=true')
})

module.exports = router;

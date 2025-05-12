const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/login/password', postController.loginPassword);

router.post('/send/otp', postController.sendOTP);

router.post('/login/email', postController.loginEmail);

router.post('/signup', postController.register);

router.post('/check/username', postController.checkUsername);

module.exports = router;

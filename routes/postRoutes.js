const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/login/password', postController.loginPassword);

router.post('/send/otp', postController.sendOTP);

router.post('/login/email', postController.loginEmail);

module.exports = router;

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { upload } = require('../config/cloudinary');

router.post('/login/password', postController.loginPassword);

router.post('/send/otp', postController.sendOTP);

router.post('/login/email', postController.loginEmail);

router.post('/signup', postController.register);

router.post('/check/username', postController.checkUsername);

router.post('/upload/single', upload.single('media'), postController.upload);

module.exports = router;

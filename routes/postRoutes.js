const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { upload } = require('../config/cloudinary');
var { isLoggedIn } = require('../middlewares/auth');

router.post('/login/password', postController.loginPassword);

router.post('/send/otp', postController.sendOTP);

router.post('/login/email', postController.loginEmail);

router.post('/signup', postController.register);

router.post('/check/username', postController.checkUsername);

router.post('/upload/single', isLoggedIn, upload.single('media'), postController.upload);

router.post('/fetch/posts', isLoggedIn, postController.fetchPosts);

router.post('/post/:postId/like', isLoggedIn, postController.likePost);

router.post('/post/:postId/comments', postController.fetchComments)

router.post('/post/:postId/new/comment', isLoggedIn, postController.newComment)

router.post('/post/:postId/comment/:commentId/delete', isLoggedIn, postController.deleteComment)

router.post('/notifications', isLoggedIn, postController.fetchNotifications)

router.post('/notifications/read', isLoggedIn, postController.markReadNotifications)

router.post('/posts', isLoggedIn, postController.fetchPosts)

router.post('/new/post/file', isLoggedIn, upload.single('media'), postController.newPost)

router.post('/new/post', isLoggedIn, postController.newPost)

module.exports = router;

var express = require('express');
var router = express.Router();
var postController = require('../controllers/postController');
var { upload } = require('../config/cloudinary');
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

router.post('/profile/update', isLoggedIn, upload.single('profile'), postController.updateProfile)

router.post('/settings/update', isLoggedIn, postController.updateSettings)

router.post('/report', postController.report)

router.post('/change-password', isLoggedIn, postController.changePassword)

module.exports = router;

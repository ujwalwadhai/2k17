var express = require('express');
var router = express.Router();
var authController = require('../controllers/auth');
var usersController = require('../controllers/users');
var postsController = require('../controllers/posts');
var commentsController = require('../controllers/comments');
var notificationsController = require('../controllers/notifications');
var reportsController = require('../controllers/reports');
var emailController = require('../controllers/email');
var adminController = require('../controllers/admin');
var memoriesController = require('../controllers/memories');
var { upload } = require('../config/cloudinary');
var { isLoggedIn } = require('../middlewares/auth');



router.post('/login/password', authController.loginPassword);

router.post('/send/otp', authController.sendOTP);

router.post('/login/email', authController.loginEmail);

router.post('/signup', authController.register);



router.post('/check/username', usersController.checkUsername);

router.post('/profile/update', isLoggedIn, upload.single('profile'), usersController.updateProfile)

router.post('/settings/update', isLoggedIn, usersController.updateSettings)

router.post('/change-password', isLoggedIn, usersController.changePassword)



router.post('/fetch/posts', isLoggedIn, postsController.fetchPosts);

router.post('/post/:postId/like', isLoggedIn, postsController.likePost);

router.post('/posts', isLoggedIn, postsController.fetchPosts)

router.post('/new/post/file', isLoggedIn, upload.single('media'), postsController.newPost)

router.post('/new/post', isLoggedIn, postsController.newPost)

router.post('/post/delete', isLoggedIn, postsController.deletePost)



router.post('/post/:postId/comments', commentsController.fetchComments)

router.post('/post/:postId/new/comment', isLoggedIn, commentsController.newComment)

router.post('/post/:postId/comment/:commentId/delete', isLoggedIn, commentsController.deleteComment)


 
router.post('/notifications', isLoggedIn, notificationsController.fetchNotifications)

router.post('/notifications/read', isLoggedIn, notificationsController.markReadNotifications)

router.post('/notifications/subscribe', isLoggedIn, notificationsController.subscribePush)

router.post('/notifications/unsubscribe', isLoggedIn, notificationsController.unsubscribePush)



router.post('/report', reportsController.newReport)

router.post('/admin/report/resolve', isLoggedIn, reportsController.resolveReport)



router.post('/update-email', isLoggedIn, emailController.updateEmail)

router.post('/forgotten-password', emailController.requestPasswordReset)

router.post('/reset-password', emailController.resetPassword)

router.post('/contact', emailController.contactForm)

router.post('/newsletter/subscribe', emailController.newsletterSubscribe)


router.post('/admin/logs', adminController.fetchLogs)

router.post('/admin/newsletter/new', adminController.createNewsLetter)


router.post('/memories/folders/:folderId', memoriesController.fetchFolder) // add isLoggedIn middleware after testing

router.post('/memories/root', memoriesController.rootFolder) // add isLoggedIn middleware after testing


module.exports = router;

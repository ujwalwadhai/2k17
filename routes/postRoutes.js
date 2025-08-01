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
var analyticsController = require('../controllers/analytics');
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

router.post('/settings/privacy/update', isLoggedIn, usersController.updatePrivacySettings)

router.post('/change-theme', isLoggedIn, usersController.changeTheme)



router.post('/fetch/posts', isLoggedIn, postsController.fetchPosts);

router.post('/post/:postId/like', isLoggedIn, postsController.likePost);

router.post('/post/:postId/react', isLoggedIn, postsController.toggleReaction);

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


router.post('/admin/users/disablelogin', isLoggedIn, adminController.disableLoginUser)



router.post('/update-email', isLoggedIn, emailController.updateEmail)

router.post('/forgotten-password', emailController.requestPasswordReset)

router.post('/reset-password', emailController.resetPassword)

router.post('/contact', emailController.contactForm)

router.post('/newsletter/subscribe', emailController.newsletterSubscribe)


router.post('/admin/logs', adminController.fetchLogs)

router.post('/admin/newsletter/new', adminController.createNewsLetter)

router.post('/admin/send-notification', adminController.pushNotification)


router.post('/api/analytics/ping', express.text({ type: '*/*' }), analyticsController.ping)

router.post('/api/analytics/deleteAdmin', express.text({ type: '*/*' }), analyticsController.deleteAdminLog)

router.post('/api/analytics/addFileView', express.text({ type: '*/*' }), analyticsController.addFileView)




router.post('/memories/folders/:folderId', isLoggedIn, memoriesController.fetchFolder)

router.post('/memories/root', isLoggedIn, memoriesController.rootFolder)

router.post('/memories/my-memories', isLoggedIn, memoriesController.myMemories)

router.post('/file/:fileId/like', isLoggedIn, memoriesController.likeFile)

router.post('/file/:fileId/comments', isLoggedIn, memoriesController.fetchComments);

router.post('/file/:fileId/new/comment', isLoggedIn, memoriesController.newComment);

router.post('/file/:fileId/comment/:commentId/delete', isLoggedIn, memoriesController.deleteComment);

router.post('/file/:fileId/tag', isLoggedIn, memoriesController.tagFile);

module.exports = router;

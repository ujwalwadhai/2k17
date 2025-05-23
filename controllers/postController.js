var bcrypt = require('bcryptjs');
var Users = require('../models/Users');
var Files = require('../models/Files');
var otps = require('../models/OTP');
var Posts = require('../models/Posts');
var Notifications = require('../models/Notifications');
var Settings = require('../models/Settings');
var Reports = require('../models/Reports');
var sendMail = require('../config/mailer');

exports.loginPassword = async (req, res) => {
  var { username, password } = req.body;

  try {
    var user = await Users.findOne({
      $or: [{ email: username }, { username: username }]
    }).select('+code +password');

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    var isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Incorrect password' });
    }

    req.login(user, (err) => {
      if (err) {
        return res.json({ success: false, message: 'Something went wrong' });
      }
      sendMail('login', user.email, {useragent: req.useragent, method: 'Password'});
      return res.json({ success: true, message: 'Login successful', redirect: '/home' });
    });

  } catch (err) {
    res.json({ success: false, message: 'Something went wrong' });
  }

}

exports.loginEmail = async (req, res) => {
  var { email, otp } = req.body;

  try {
    var user = await Users.findOne({ email: email });

    if (!user) {
      return res.json({ success: false, message: 'No user with this email found!' });
    }

    var otpRecord = await otps.findOne({ email: email, otp: otp });

    if (!otpRecord) {
      return res.json({ success: false, message: 'Invalid or expired OTP' });
    }

    req.login(user, (err) => {
      if (err) {
        return res.json({ success: false, message: 'Something went wrong' });
      }
      sendMail('login', user.email, {useragent: req.useragent, method: 'Email OTP'});
      return res.json({ success: true, message: 'Login successful', redirect: '/home' });
    })

  }
  catch (err) {
    res.json({ success: false, message: 'Something went wrong' });
  }
}

exports.sendOTP = async (req, res) => {
  var { email } = req.body;

  try {
    var user = await Users.findOne({ email: email });

    if (!user) {
      return res.json({ success: false, message: 'No user with this email found!' });
    }

    var otp = Math.floor(100000 + Math.random() * 900000);

    sendMail('otp', email, {otp, useragent: req.useragent});
    var newOtp = new otps({
      email: email,
      otp: otp
    });

    await newOtp.save()
    return res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    res.json({ success: false, message: 'Something went wrong' });
  }
};

exports.register = async (req, res) => {
  var { username, email, code } = req.body;
  try {
    var user = await Users.findOne({ code });
    if (!user) {
      return res.json({ success: false, message: 'Invalid code or already registered' });
    }
    var user2 = await Users.findOne({ username: username });
    if (user2) {
      return res.json({ success: false, message: 'Username already taken' });
    }

    user.username = username;
    user.email = email;
    await user.save();
    req.login(user, (err) => {
      if (err) {
        return res.json({ success: false, message: 'Something went wrong' });
      }
      return res.json({ success: true, message: 'Registration successful', redirect: '/home' });
    })
  } catch (err) {
    res.json({ success: false, message: 'Something went wrong' });
  }
}

exports.changePassword = async (req, res) => {
  var { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.json({ success: false, message: "All fields are required." });
  }

  if (newPassword !== confirmPassword) {
    return res.json({ success: false, message: "New passwords do not match." });
  }

  try {
    var user = await Users.findById(req.user._id).select('+password');

    var isMatch = await user.validatePassword(currentPassword);
    if (!isMatch) {
      return res.json({ success: false, message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Something went wrong." });
  }
};

exports.updateEmail = async (req, res) => {
  try {
    var { newEmail } = req.body;
    if (!newEmail) return res.json({ success: false, message: "Email is required." });

    var token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    var expiry = new Date(Date.now() + 1000 * 60 * 30);

    var settings = await Settings.findOneAndUpdate(
      { user: req.user._id },
      { emailVerification: { newEmail, token, expiry } },
      { new: true, upsert: true }
    );

    var link = `${req.protocol}://${req.get('host')}/verify-email/${token}`;

    await sendMail('verify-new-email', newEmail, {link, name: req.user.name});
    return res.json({ success: true, message: 'Verification email sent.' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Server error.' });
  }
}

exports.checkUsername = async (req, res) => {
  var { username } = req.body;
  try {
    var user = await Users.findOne({ username: username });
    if (user) {
      return res.json({ success: false, message: 'Username already taken' });
    }
    return res.json({ success: true, message: 'Username available' });
  } catch (err) {
    res.json({ success: false, message: 'Something went wrong' });
  }
}

exports.upload = async (req, res) => {
  var { file } = req;
  if (!file) {
    return res.json({ success: false, message: 'No file uploaded' });
  }
  try {
    var newFile = new Files({
      pid: file.filename,
      url: file.path,
      folder: req.query.folder,
      size: file.size,
      type: file.mimetype
    });
    await newFile.save();
    return res.json({ success: true, message: 'File uploaded successfully' });
  } catch (err) {
    return res.json({ success: false, message: 'Something went wrong' });
  }
}

exports.requestPasswordReset = async (req, res) => {
  var { email } = req.body;
  if(!email) return res.json({ success: false, message: "Please enter email." })
  try {
    var user = await Users.findOne({ email });
    if (!user) return res.json({ success: false, message: "Email not registered." });

    var token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    var expiry = Date.now() + 60 * 60 * 1000;

    await Settings.findOneAndUpdate(
      { user: user._id },
      { passwordReset: { token, expiry } }
    );

    var link = `${req.protocol}://${req.get('host')}/reset-password/${token}`;
    await sendMail('reset-password', email, {link, name: user.name});

    res.json({ success: true, message: "Reset link sent to your email." });
  } catch (err) {
    res.json({ success: false, message: "Something went wrong." });
  }
};

exports.resetPassword = async (req, res) => {
  var { token, password, confirmPassword } = req.body;
  var settings = await Settings.findOne({ "passwordReset.token": token }).populate('user');

  if (!settings || settings.passwordReset.expiry < Date.now()) {
    return res.json({ success: false, message: "Token expired or invalid." });
  }

  if(password !== confirmPassword) return res.json({ success: false, message: "Passwords do not match." });

  settings.user.password = password;
  await settings.user.save();

  settings.passwordReset = undefined;
  await settings.save();

  res.json({ success: true, message: "Password updated successfully." });
};

exports.fetchPosts = async (req, res) => {
  try {
    var posts = await Posts.find();
    return res.json({ success: true, posts: posts });
  } catch (err) {
    return res.json({ success: false, message: 'Something went wrong' });
  }
}

exports.likePost = async (req, res) => {
  var userId = req.user._id;
  var { postId } = req.params;

  try {
    var post = await Posts.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    var alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike
      post.likes.pull(userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();
    if(post.author.toString() !== userId.toString() && !alreadyLiked){
      var notification = new Notifications({
        user: post.author,
        type: 'like',
        fromUser: userId,
        message: `${req.user.username} liked your post.`,
        url: `/post/${post._id}`
      })
      await notification.save();
    }

    res.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: post.likes.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

exports.fetchComments = async (req, res) => {
  try {
    var post = await Posts.findById(req.params.postId)
      .populate('comments.user', 'name profile');
    post.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(commentsWithTime);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

exports.newComment = async (req, res) => {
  try {
    var post = await Posts.findById(req.params.postId).populate('author', 'name email');
    if (post.comments) {
      post.comments.push({
        user: req.user._id,
        text: req.body.text
      });
    } else {
      post.comments = []
      post.comments.push({
        user: req.user._id,
        text: req.body.text
      });
    }
    await post.save();
    if(post.author._id.toString() !== req.user._id.toString() && post.author.email){
      sendMail('newcomment', post.author.email, { user: req.user, comment: req.body.text, postLink: `http://localhost:3000/post/${post._id}` });
      var notification = new Notifications({
        user: post.author._id,
        type: 'comment',
        fromUser: req.user._id,
        message: `commented on your post.`,
        url: `/post/${post._id}`
      })
      await notification.save();
    }
    res.json({ success: true, commentsLength: post.comments.length, message: 'Comment added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
}

exports.deleteComment = async (req, res) => {
  var { postId, commentId } = req.params;
  var userId = req.user._id;

  try {
    var post = await Posts.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    var comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (String(comment.user._id) !== String(userId) || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    post.comments = post.comments.filter(comment => comment._id.toString() !== commentId);
    await post.save();
    res.json({ commentsLength: post.comments.length, success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.fetchNotifications = async (req, res) => {
  try {
    var notifications = await Notifications.find({
      $or: [
        { user: req.user._id },
        { user: { $exists: false } }
      ]
    }).sort({ createdAt: -1 }).populate('fromUser', 'username profile');
    return res.json({ success: true, notifications });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Something went wrong' });
  }
};


exports.markReadNotifications = async (req, res) => {
  try {
    await Notifications.updateMany(
      { user: req.user._id, seen: false },
      { $set: { seen: true } }
    );
    return res.json({ success: true, message: 'Notifications marked as read' });
  } catch (err) {
    return res.json({ success: false, message: 'Something went wrong' });
  }
}

exports.fetchPosts = async (req, res) => {
  try {
    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    var posts = await Posts.find({ createdAt: { $gte: sixMonthsAgo } }).sort({ createdAt: -1 });
    return res.json({ success: true, posts });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: 'Something went wrong' });
  }
}

exports.newPost = async (req, res) => {
  try {
    if (req.file) {
      var newPost = new Posts({
        author: req.user._id,
        text: req.body.text,
        media: {
          url: req.file.path,
          type: req.file.mimetype
        },
        likes: [req.user._id],
        comments: []
      });
      await newPost.save();
    } else {
      var newPost = new Posts({
        author: req.user._id,
        text: req.body.text,
        likes: [req.user._id],
        comments: []
      });
      await newPost.save();
    }
    return res.json({ success: true, message: 'Post created' });
  } catch (err) {
    return res.json({ success: false, message: 'Something went wrong' });
  }
}


exports.updateProfile = async (req, res) => {
  try {
    var { username, phone, bio, facebook, linkedin, github, instagram, other } = req.body;
    var update = {
      username, phone, bio,
      socialLinks: {
        facebook,
        linkedin,
        github,
        instagram,
        other
      }
    };

    var userCheck = await Users.findOne({ username });
    if (userCheck && String(userCheck._id) !== String(req.user._id)) {
      return res.json({ success: false, message: 'Username already exists' });
    }

    if (req.file.path) update.profile = req.file.path;

    await Users.findByIdAndUpdate(req.user._id, update);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: "Failed to update profile." });
  }
};
 
exports.updateSettings = async (req, res) => {
  try {
    var userId = req.user._id;

    var notifications = {
      email: req.body.email || false,
      login: req.body.login || false,
      newsletter: req.body.newsletter || false,
    };

    var settings = await Settings.findOneAndUpdate(
      { user: userId },
      { $set: {notifications} },
      { new: true, upsert: true }
    );

    return res.json({ success: true });
  } catch (err) {
    return res.json({ success: false, message: 'Something went wrong' });
  }
};

exports.report = async (req, res) => {
  try {
    var { subject, details } = req.body;
    if (!subject || !details) {
      return res.json({ success: false, message: "All fields are required." });
    }

    var newReport = new Reports({
      user: req.user?._id || null,
      subject,
      details
    });

    await newReport.save();

    var admins = await Users.find({ role: 'admin' }).select('email -_id');
    var adminEmails = admins.map(user => user.email);

    if(req.user?.email) {
      await sendMail('report_user', req.user.email, { subject, details, name: req.user.name });
    }
    await sendMail('report_admins', adminEmails, { subject, details, name: req.user?.name || ''});
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error saving report." });
  }
}
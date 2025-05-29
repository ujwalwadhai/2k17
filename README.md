# 2k17 Platform - Batch-Based Social Media Platform 🎓📱

**2k17 Platform** is a private, full-featured mini social media platform built exclusively for the 2017–2024 batch of JNV Chandrapur. It’s designed for easy interaction, media sharing, event updates, newsletters, and internal communication — all with a modern UI and personalized features.

---

## 🚀 Features

- 🔐 **User Authentication**: Email+OTP and password-based login, secure registration.
- 🖼️ **Posts & Media**: Share images and videos with captions.
- 💬 **Comments**: Comment system with AJAX loading.
- ❤️ **Post Likes**: Like/unlike functionality with real-time feedback.
- 🧑‍💼 **User Profiles**: Editable profiles, profile pictures, bios, and social links.
- 🗂️ **Tabs in Profile**: Posts, Media, and About.
- ⚙️ **Settings Panel**: Control email, password, and notification preferences.
- 📥 **Password Recovery**: Secure reset via email link.
- 📩 **Email Verification**: Change email with link-based verification.
- 🛠️ **Admin Dashboard**: View activity logs, resolve reports, and send newsletters.
- 📝 **Reports System**: Users can report issues, admins can resolve with resolution notes.
- 📊 **Activity Logs**: Track critical user activity (e.g., password/email updates).
- 📧 **Newsletter**: Upload and send rich newsletters to all users.
- 📅 **Birthday Wishes**: Cron job sends personalized midnight greetings in IST.
- ☁️ **Cloudinary Integration**: Media upload, cleanup, and deletion on post removal.
- 🌐 **Responsive Design**: Modern layout with a dark theme, built using SCSS and EJS.

---

## 🛠️ Tech Stack

- **Frontend**: HTML (EJS templates), SCSS, JavaScript (Vanilla + Alpine.js)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **Email Service**: Sendinblue SMTP
- **Media Hosting**: Cloudinary
- **Security**: sanitize-html, secure token generation, OTP expiry, rate limits
- **Scheduler**: Node cron jobs (birthdays, newsletters)

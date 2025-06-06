# 2k17 Platform - Mini Social Media 🎓📱

**2k17 Platform** is a private, full-featured mini social media platform built exclusively for the 2017–2024 batch of JNV Chandrapur. It’s designed for easy interaction, media sharing, event updates, newsletters, and internal communication — all with a modern UI and personalized features.

---

## 🚀 Features

- 🔐 **User Authentication**: Email+OTP and password-based login, secure registration.
- 🖼️ **Posts & Media**: Share images with captions.
- 💬 **Comments**: Comment system with AJAX loading.
- 🔔 **Notifications**: Built-in + email + Push Notifications system with AJAX loading.
- ❤️ **Post Likes**: Like/unlike functionality with real-time feedback.
- 🧑‍💼 **User Profiles**: Editable profiles, profile pictures, bios, and social links.
- 🗂️ **Tabs in Profile**: Posts, Media, and About.
- ⚙️ **Settings Panel**: Control email, password, and notification preferences.
- 📥 **Password Recovery**: Secure reset via email link (tokens).
- 📩 **Email Verification**: Change email with link-based verification.
- 🛠️ **Admin Dashboard**: View activity logs, resolve reports and send newsletters.
- 📝 **Reports System**: Users can report issues, admins can resolve with resolution notes.
- 📝 **Suggestions System**: Users can give suggestions on how platform can be improved.
- 📊 **Activity Logs**: Track critical user activity (e.g., password/email updates).
- 📧 **Newsletter**: Admins can upload and send rich newsletters to all users via email.
- 📅 **Birthday Wishes**: Cron job sends personalized midnight greetings in IST.
- ☁️ **Cloudinary Integration**: Media upload, cleanup, and deletion on content removal.
- 🌐 **Responsive Design**: Modern layout with a dark theme, built using SCSS and EJS.
- 📂 **Memories Section**: All the memories of batch made available in one place.

---

## 🛠️ Tech Stack

- **Frontend**: HTML (EJS templates), SCSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **Email Service**: Nodemailer (Gmail SMTP)
- **Media Hosting**: Cloudinary (Multer as intermediary)
- **Security**: sanitize-html, secure token generation, OTP expiry, rate limits
- **Scheduler**: Node cron jobs (birthdays, newsletters)

---

## 🔎 NPM Libraries Used

- express
- express-session
- mongoose
- nodemailer
- ejs
- multer
- cloudinary
- sanitize-html
- bcryptjs
- dotenv
- cron
- View more in [package.json](https://github.com/ujwalwadhai/2k17/blob/master/package.json)

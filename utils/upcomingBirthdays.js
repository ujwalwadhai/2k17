var Users = require("../models/Users");

async function getUpcomingBirthdays() {
  const allUsers = await Users.find({ dob: { $ne: "" } });

  const today = new Date();
  const todayMonth = today.getMonth() + 1; // 0-indexed
  const todayDate = today.getDate();

  const next30Days = [];

  for (const user of allUsers) {
    const [dd, mm] = user.dob.split("/").map(Number);
    if (!dd || !mm) continue;

    // Use current year
    const birthdayThisYear = new Date(today.getFullYear(), mm - 1, dd);

    // If already passed, set to next year
    if (birthdayThisYear < today) {
      birthdayThisYear.setFullYear(today.getFullYear() + 1);
    }

    const diffInDays = Math.ceil((birthdayThisYear - today) / (1000 * 60 * 60 * 24));

    if (diffInDays >= 0 && diffInDays <= 30) {
      next30Days.push(user);
    }
  }

  return next30Days;
}

module.exports = getUpcomingBirthdays;
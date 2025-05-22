var Users = require("../models/Users");

async function getUpcomingBirthdays() {
  var allUsers = await Users.find({ dob: { $ne: "" } });

  var today = new Date();
  var todayMonth = today.getMonth() + 1; // 0-indexed
  var todayDate = today.getDate();

  var next30Days = [];

  for (var user of allUsers) {
    var [dd, mm] = user.dob.split("/").map(Number);
    if (!dd || !mm) continue;

    // Use current year
    var birthdayThisYear = new Date(today.getFullYear(), mm - 1, dd);

    // If already passed, set to next year
    if (birthdayThisYear < today) {
      birthdayThisYear.setFullYear(today.getFullYear() + 1);
    }

    var diffInDays = Math.ceil((birthdayThisYear - today) / (1000 * 60 * 60 * 24));

    if (diffInDays >= 0 && diffInDays <= 30) {
      next30Days.push(user);
    }
  }

  return next30Days;
}

module.exports = getUpcomingBirthdays;
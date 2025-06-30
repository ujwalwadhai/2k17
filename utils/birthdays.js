var Users = require("../models/Users");

/* async function getUpcomingBirthdays() {
  var allUsers = await Users.find({ dob: { $exists: true} });

  var today = new Date();
  var todayMonth = today.getMonth() + 1;
  var todayDate = today.getDate();
  var daysToConsider = 14 // Days to consider for upcoming birthdays

  var upcomingBirthdays = [];

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

    if (diffInDays >= 0 && diffInDays <= daysToConsider) {
      upcomingBirthdays.push(user);
    }
  }

  return upcomingBirthdays;
} */

  async function getUpcomingBirthdays() {
  const allUsers = await Users.find({ dob: { $exists: true } });

  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // removes time
  const daysToConsider = 14;

  const upcomingBirthdays = [];

  for (const user of allUsers) {
    const [dd, mm] = user.dob.split("/").map(Number);
    if (!dd || !mm) continue;

    // Create birthday for current year (time stripped)
    let birthdayThisYear = new Date(today.getFullYear(), mm - 1, dd);

    // If birthday already passed today, move to next year
    if (birthdayThisYear < todayDateOnly) {
      birthdayThisYear.setFullYear(today.getFullYear() + 1);
    }

    const diffInMs = birthdayThisYear - todayDateOnly;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays >= 0 && diffInDays <= daysToConsider) {
      var isToday = diffInDays === 0;

      var userWithFlag = {
        ...user.toObject(),
        isBirthdayToday: isToday
      };

      upcomingBirthdays.push(userWithFlag);
    }
  }

  return upcomingBirthdays;
}


module.exports = getUpcomingBirthdays;
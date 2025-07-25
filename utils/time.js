function getRelativeTime(date) {
  let inputDate;

  date = date.toString()
  if (date.includes('T') && date.includes('+')) {
    inputDate = new Date(date);
  } else {
    var [datePart, timePart] = date.split(',');
    var [day, month, year] = datePart.trim().split('/').map(Number);
    let hours = 0, minutes = 0;

    if (timePart) {
      var [time, ampm] = timePart.trim().split(' ');
      [hours, minutes] = time.split(':').map(Number);
      if (ampm.toLowerCase() === 'pm' && hours !== 12) hours += 12;
      if (ampm.toLowerCase() === 'am' && hours === 12) hours = 0;
    }

    inputDate = new Date(year, month - 1, day, hours, minutes);
  }

  var now = new Date();
  let diffMs = now - inputDate;
  var isFuture = diffMs < 0;
  diffMs = Math.abs(diffMs);

  var diffMin = Math.round(diffMs / (60 * 1000));
  var diffHr = Math.round(diffMin / 60);
  var diffDay = Math.round(diffHr / 24);
  var diffMo = Math.round(diffDay / 30);
  var diffYr = Math.round(diffDay / 365);

  let result = '';
  if (diffMin < 1) result = 'just now';
  else if (diffMin < 60) result = `${diffMin}m`;
  else if (diffHr < 24) result = `${diffHr}h`;
  else if (diffDay < 30) result = `${diffDay}d`;
  else if (diffDay < 365) result = `${diffMo}mo`;
  else result = `${diffYr}y`;

  return result === 'just now' ? result : (isFuture ? `in ${result}` : result);
}

function formatDOB(dateString) {
  // returns date in format "Date Month" i.e. '12 July' etc
  var [day, month, year] = dateString.split('/').map(Number);
  var date = new Date(year, month - 1, day);

  var options = { day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-In', options);
}


function createDate() {
  // returns date in format "DD/MM/YYYY, HH:MM AM/PM"
  var hour = new Date().getHours();
  var mins = new Date().getMinutes();
  var date = new Date().getDate();
  var month = new Date().getMonth() + 1;
  var year = new Date().getFullYear();
  if (hour > 12) {
    hour = hour - 12;
    if (hour < 10) {
      hour = "0" + hour;
    }
    if (mins < 10) {
      mins = "0" + mins;
    }
    var time = hour + ":" + mins + " PM";
  } else {
    if (hour < 10) {
      hour = "0" + hour;
    }
    if (mins < 10) {
      mins = "0" + mins;
    }
    var time = hour + ":" + mins + " AM"
  }
  if (month < 10) {
    month = "0" + month;
  }
  if (date < 10) {
    date = "0" + date;
  }

  var FinalDate = date + "/" + month + "/" + year + ", " + time;
  return FinalDate;
}

const IST_OFFSET_MINUTES = 330;

function toIST(date) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + IST_OFFSET_MINUTES * 60000);
}

function fromIST(istDate) {
  return new Date(istDate.getTime() - IST_OFFSET_MINUTES * 60000);
}

function subDays(date, days) {
  const ist = toIST(date);
  ist.setDate(ist.getDate() - days);
  return fromIST(ist);
}

function startOfDay(date) {
  const ist = toIST(date);
  ist.setHours(0, 0, 0, 0);
  return fromIST(ist);
}

function endOfDay(date) {
  const ist = toIST(date);
  ist.setHours(23, 59, 59, 999);
  return fromIST(ist);
}

module.exports = { getRelativeTime, formatDOB, createDate, subDays, startOfDay, endOfDay };

const moment = require('moment');

function formatDate(dateString) {
  const parsed = moment(dateString, 'DD/MM/YYYY, hh:mm A');
  if (!parsed.isValid()) return 'Invalid date';
  return parsed.fromNow();
}

function formatDate2(dateString) {
  const [day, month, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  const options = { day: '2-digit', month: 'long'};
  return date.toLocaleDateString('en-In', options);
}


function createDate(){
  var hour = new Date().getHours();
  var mins = new Date().getMinutes();
  var date = new Date().getDate();
  var month = new Date().getMonth() + 1;
  var year = new Date().getFullYear();
  if (hour > 12){
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

function getWeekDay(dateStr) {
    const [datePart, timePart] = dateStr.split(', ');
    const [day, month, year] = datePart.split('-');
    const formattedDateStr = `${year}-${month}-${day}T${convertTo24Hour(timePart)}`;
  
    const date = new Date(formattedDateStr);
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekdays[date.getDay()];
  }
  
function convertTo24Hour(timeStr) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
  
    if (modifier === 'PM' && hours !== '12') {
      hours = String(parseInt(hours, 10) + 12);
    }
    if (modifier === 'AM' && hours === '12') {
      hours = '00';
    }
  
    return `${hours}:${minutes}`;
}

module.exports = { formatDate, formatDate2, createDate, getWeekDay };

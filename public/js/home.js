function getGreeting() {
  const now = new Date();
  const hours = now.getHours();

  if (hours >= 5 && hours < 12) {
    return "Good morning";
  } else if (hours >= 12 && hours < 17) {
    return "Good afternoon";
  } else if (hours >= 17 && hours < 21) {
    return "Good evening";
  } else {
    return "Welcome"; // No greeting (e.g., for night time)
  }
}

var greeting = getGreeting();
document.getElementById("greeting-msg").innerHTML = greeting;
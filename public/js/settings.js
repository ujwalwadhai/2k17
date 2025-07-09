document.getElementById("settings-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var statusBox = document.getElementById("settings-status");
  statusBox.style.color = "green";
  statusBox.innerHTML = "<i class='fal fa-spin fa-circle-notch'></i> &nbsp;Saving settings...";

  var formData = new FormData(this);
  var settings = {};

  for (let [key, value] of formData.entries()) {
    settings[key] = true; // All checkboxes present are "true"
  }

  // Explicitly set unchecked ones to false
  ['email', 'login', 'newsletter', 'push'].forEach(key => {
    if (!settings.hasOwnProperty(key)) settings[key] = false;
  });

  if(document.getElementById('push').checked){
    requestNotificationPermissionAndSubscribe()
  } else {
    unsubscribeUserFromPush()
  }

  fetch("/settings/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(settings)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        statusBox.innerHTML = "<i class='fal fa-check-circle'></i> &nbsp;Settings saved!";
      } else {
        statusBox.style.color = "red";
        statusBox.innerHTML = "<i class='fal fa-times-circle'></i> &nbsp;Failed to save settings.";
      }
    })
    .catch(err => {
      console.log(err);
      statusBox.style.color = "red";
      statusBox.innerHTML = "<i class='fal fa-times-circle'></i> &nbsp;Something went wrong.";
    });
});

function openNotificationSettings(){
  var notificationSettingsPopup = document.getElementById('notification-settings-popup');
  var notificationSettingsOverlay = notificationSettingsPopup.querySelector('.overlay');
  notificationSettingsPopup.classList.add('show');
  notificationSettingsOverlay.classList.add('show');
}

function closeNotificationSettings(){
  var notificationSettingsPopup = document.getElementById('notification-settings-popup');
  var notificationSettingsOverlay = notificationSettingsPopup.querySelector('.overlay');
  notificationSettingsPopup.classList.remove('show');
  notificationSettingsOverlay.classList.remove('show');
}

function openChangeTheme(){
  var changeThemePopup = document.getElementById('change-theme-popup');
  var changeThemeOverlay = changeThemePopup.querySelector('.overlay');
  changeThemePopup.classList.add('show');
  changeThemeOverlay.classList.add('show');
}

function closeChangeTheme(){
  var changeThemePopup = document.getElementById('change-theme-popup');
  var changeThemeOverlay = changeThemePopup.querySelector('.overlay');
  changeThemePopup.classList.remove('show');
  changeThemeOverlay.classList.remove('show');
}

document.getElementById("change-theme-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var statusBox = document.getElementById("change-theme-status");
  statusBox.style.color = "green";
  statusBox.innerHTML = "<span class='fal fa-rotate fa-circle-notch'><span> &nbsp;Changing theme...";

  fetch("/change-theme", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({theme: this.elements['theme'].value})
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.documentElement.setAttribute("data-theme", this.elements['theme'].value);
        statusBox.innerHTML = "<i class='fal fa-check-circle'></i> &nbsp;Theme changed to "+this.elements['theme'].value+"!";
        setTimeout(closeChangeTheme, 2000);
      } else {
        statusBox.style.color = "red";
        statusBox.innerHTML = `<i class='fal fa-times-circle'></i> &nbsp;${data.message || 'Failed to change theme'}`;
      }
    })
    .catch(err => {
      console.log(err);
      statusBox.style.color = "red";
      statusBox.innerHTML = "<i class='fal fa-times-circle'></i> &nbsp;Something went wrong.";
    });
});

document.getElementById("change-password-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var statusBox = document.getElementById("change-password-status");
  statusBox.style.color = "green";
  statusBox.innerHTML = "<span class='fal fa-rotate fa-circle-notch'><span> &nbsp;Changing password...";

  var formData = new FormData(this);
  var data = {
    currentPassword: document.querySelector('#currentPassword').value,
    newPassword: document.querySelector('#newPassword').value,
    confirmPassword: document.querySelector('#confirmPassword').value
  };

  fetch("/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        statusBox.innerHTML = "<i class='fal fa-check-circle'></i> &nbsp;Password Changed!";
        setTimeout(closeChangePassword, 2000);
      } else {
        statusBox.style.color = "red";
        statusBox.innerHTML = `<i class='fal fa-times-circle'></i> &nbsp;${data.message || 'Failed to change password'}`;
      }
    })
    .catch(err => {
      console.log(err);
      statusBox.style.color = "red";
      statusBox.innerHTML = "<i class='fal fa-times-circle'></i> &nbsp;Something went wrong.";
    });
});

function openChangePassword(){
  var changePasswordPopup = document.getElementById('change-password-popup');
  var changePasswordOverlay = changePasswordPopup.querySelector('.overlay');
  changePasswordPopup.classList.add('show');
  changePasswordOverlay.classList.add('show');
}

function closeChangePassword(){
  var changePasswordPopup = document.getElementById('change-password-popup');
  var changePasswordOverlay = changePasswordPopup.querySelector('.overlay');
  changePasswordPopup.classList.remove('show');
  changePasswordOverlay.classList.remove('show');
}

document.getElementById("give-suggestion-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var statusBox = document.getElementById("give-suggestion-status");
  statusBox.style.color = "green";
  statusBox.innerHTML = "<i class='fal fa-circle-notch fa-rotate'></i> &nbsp;Submitting...";

  var data = {
    details: this.elements["details"].value,
    subject: this.elements["subject"].value
  }

  fetch("/report", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        statusBox.innerHTML = "<i class='fal fa-circle-check'></i> &nbsp;Feedback submitted! Thank you for your feedback!";
        statusBox.style.color = "green";
        this.reset();
        setTimeout(closeGiveSuggestion, 2000);
      } else {
        statusBox.innerHTML = "<i class='fal fa-circle-xmark'></i> &nbsp;" + (data.message || "Failed to submit.");
        statusBox.style.color = "red";
      }
    })
    .catch(err => {
      console.log(err);
      statusBox.innerHTML = "<i class='fal fa-times-circle'></i> &nbsp;Something went wrong.";
      statusBox.style.color = "red";
    });
});

function openGiveSuggestion(){
  var giveSuggestionPopup = document.getElementById('give-suggestion-popup');
  var giveSuggestionOverlay = giveSuggestionPopup.querySelector('.overlay');
  giveSuggestionPopup.classList.add('show');
  giveSuggestionOverlay.classList.add('show');
}

function closeGiveSuggestion(){
  var giveSuggestionPopup = document.getElementById('give-suggestion-popup');
  var giveSuggestionOverlay = giveSuggestionPopup.querySelector('.overlay');
  giveSuggestionPopup.classList.remove('show');
  giveSuggestionOverlay.classList.remove('show');
}

document.getElementById("report-problem-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var statusBox = document.getElementById("report-problem-status");
  statusBox.style.color = "green";
  statusBox.innerHTML = "<i class='fal fa-circle-notch fa-rotate'></i> &nbsp;Submitting...";

  var data = {
    details: this.elements["details"].value,
    subject: this.elements["subject"].value
  }

  fetch("/report", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        statusBox.innerHTML = "<i class='fal fa-circle-check'></i> &nbsp;Feedback submitted! Thank you for your feedback!";
        statusBox.style.color = "green";
        this.reset();
        setTimeout(closeReportProblem, 2000);
      } else {
        statusBox.innerHTML = "<i class='fal fa-circle-xmark'></i> &nbsp;" + (data.message || "Failed to submit.");
        statusBox.style.color = "red";
      }
    })
    .catch(err => {
      console.log(err);
      statusBox.innerHTML = "<i class='fal fa-times-circle'></i> &nbsp;Something went wrong.";
      statusBox.style.color = "red";
    });
});

function openReportProblem(){
  var reportProblemPopup = document.getElementById('report-problem-popup');
  var reportProblemOverlay = reportProblemPopup.querySelector('.overlay');
  reportProblemPopup.classList.add('show');
  reportProblemOverlay.classList.add('show');
}

function closeReportProblem(){
  var reportProblemPopup = document.getElementById('report-problem-popup');
  var reportProblemOverlay = reportProblemPopup.querySelector('.overlay');
  reportProblemPopup.classList.remove('show');
  reportProblemOverlay.classList.remove('show');
}

document.getElementById("change-email-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var statusBox = document.getElementById("change-email-status");
  statusBox.style.color = "green";
  statusBox.innerHTML = "<i class='fal fa-circle-notch fa-rotate'></i> &nbsp;Submitting...";

  fetch("/update-email", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({newEmail : this.elements["newEmail"].value})
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        statusBox.innerHTML = "<i class='fal fa-circle-check'></i> &nbsp; Verification email sent! Please check your spam folder too.";
        statusBox.style.color = "green";
        this.reset();
      } else {
        statusBox.innerHTML = "<i class='fal fa-circle-xmark'></i> &nbsp;" + (data.message || "Failed to update.");
        statusBox.style.color = "red";
      }
    })
    .catch(err => {
      console.log(err);
      statusBox.innerHTML = "<i class='fal fa-times-circle'></i> &nbsp;Something went wrong. Please try again later";
      statusBox.style.color = "red";
    });
});

function openChangeEmail(){
  var ChangeEmailPopup = document.getElementById('change-email-popup');
  var ChangeEmailOverlay = ChangeEmailPopup.querySelector('.overlay');
  ChangeEmailPopup.classList.add('show');
  ChangeEmailOverlay.classList.add('show');
}

function closeChangeEmail(){
  var ChangeEmailPopup = document.getElementById('change-email-popup');
  var ChangeEmailOverlay = ChangeEmailPopup.querySelector('.overlay');
  ChangeEmailPopup.classList.remove('show');
  ChangeEmailOverlay.classList.remove('show');
}


document.getElementById("privacy-settings-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var statusBox = document.getElementById("privacy-settings-status");
  statusBox.style.color = "green";
  statusBox.innerHTML = "<i class='fal fa-circle-notch fa-rotate'></i> &nbsp;Updating...";

  var formData = new FormData(this);
  var settings = {};

  for (let [key, value] of formData.entries()) {
    settings[key] = true; // All checkboxes present are "true"
  }

  // Explicitly set unchecked ones to false
  ['email', 'phone', 'dob'].forEach(key => {
    if (!settings.hasOwnProperty(key)) settings[key] = false;
  });

  fetch("/settings/privacy/update", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(settings)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        statusBox.innerHTML = "<i class='fal fa-circle-check'></i> &nbsp;Preferences updated!";
        statusBox.style.color = "green";
        setTimeout(closePrivacySettings, 2000);
      } else {
        statusBox.innerHTML = "<i class='fal fa-circle-xmark'></i> &nbsp;" + (data.message || "Failed to submit.");
        statusBox.style.color = "red";
      }
    })
    .catch(err => {
      console.log(err);
      statusBox.innerHTML = "<i class='fal fa-times-circle'></i> &nbsp;Something went wrong.";
      statusBox.style.color = "red";
    });
});
 
function openPrivacySettings(){
  var privacySettingsPopup = document.getElementById('privacy-settings-popup');
  var privacySettingsOverlay = privacySettingsPopup.querySelector('.overlay');
  privacySettingsPopup.classList.add('show');
  privacySettingsOverlay.classList.add('show');
}

function closePrivacySettings(){
  var privacySettingsPopup = document.getElementById('privacy-settings-popup');
  var privacySettingsOverlay = privacySettingsPopup.querySelector('.overlay');
  privacySettingsPopup.classList.remove('show');
  privacySettingsOverlay.classList.remove('show');
}
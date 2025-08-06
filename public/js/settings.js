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

  if (document.getElementById('push').checked) {
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

function openNotificationSettings() {
  var notificationSettingsPopup = document.getElementById('notification-settings-popup');
  var notificationSettingsOverlay = notificationSettingsPopup.querySelector('.overlay');
  notificationSettingsPopup.classList.add('show');
  notificationSettingsOverlay.classList.add('show');
}

function closeNotificationSettings() {
  var notificationSettingsPopup = document.getElementById('notification-settings-popup');
  var notificationSettingsOverlay = notificationSettingsPopup.querySelector('.overlay');
  notificationSettingsPopup.classList.remove('show');
  notificationSettingsOverlay.classList.remove('show');
}

function openChangeAppearance() {
  var changeAppearancePopup = document.getElementById('change-appearance-popup');
  var changeAppearanceOverlay = changeAppearancePopup.querySelector('.overlay');
  changeAppearancePopup.classList.add('show');
  changeAppearanceOverlay.classList.add('show');
}

function closeChangeAppearance() {
  var changeAppearancePopup = document.getElementById('change-appearance-popup');
  var changeAppearanceOverlay = changeAppearancePopup.querySelector('.overlay');
  changeAppearancePopup.classList.remove('show');
  changeAppearanceOverlay.classList.remove('show');
}

document.getElementById("theme-select").addEventListener("change", function (e) {
  if (this.value == 'purple') {
    document.getElementById("change-preview-para").style.color = "#7b5fc0";
  } else {
    document.getElementById("change-preview-para").style.color = this.value;
  }
})

document.getElementById("font-select").addEventListener("change", function (e) {
  document.getElementById("change-preview-para").style.fontFamily = this.value;
})

document.getElementById("change-appearance-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var statusBox = document.getElementById("change-appearance-status");
  statusBox.style.color = "green";
  statusBox.innerHTML = ''
  statusBox.innerHTML = "<i class='fal fa-rotate fa-circle-notch'><i> &nbsp;Saving preferences...";

  fetch("/change-appearance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ theme: this.elements['theme'].value, font: this.elements['font'].value })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.documentElement.setAttribute("data-theme", this.elements['theme'].value);
        document.documentElement.setAttribute("data-font", this.elements['font'].value);
        statusBox.innerHTML = "<i class='fal fa-check-circle'></i> &nbsp;Preferences saved!";
        setTimeout(closeChangeAppearance, 3000);
      } else {
        statusBox.style.color = "red";
        statusBox.innerHTML = `<i class='fal fa-times-circle'></i> &nbsp;${data.message || 'Failed to save preferences'}`;
      }
    })
    .catch(err => {
      console.log(err);
      statusBox.style.color = "red";
      statusBox.innerHTML = "<i class='fal fa-times-circle'></i> &nbsp;Something went wrong.";
    });
});

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

function openGiveSuggestion() {
  var giveSuggestionPopup = document.getElementById('give-suggestion-popup');
  var giveSuggestionOverlay = giveSuggestionPopup.querySelector('.overlay');
  giveSuggestionPopup.classList.add('show');
  giveSuggestionOverlay.classList.add('show');
}

function closeGiveSuggestion() {
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

function openReportProblem() {
  var reportProblemPopup = document.getElementById('report-problem-popup');
  var reportProblemOverlay = reportProblemPopup.querySelector('.overlay');
  reportProblemPopup.classList.add('show');
  reportProblemOverlay.classList.add('show');
}

function closeReportProblem() {
  var reportProblemPopup = document.getElementById('report-problem-popup');
  var reportProblemOverlay = reportProblemPopup.querySelector('.overlay');
  reportProblemPopup.classList.remove('show');
  reportProblemOverlay.classList.remove('show');
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

function openPrivacySettings() {
  var privacySettingsPopup = document.getElementById('privacy-settings-popup');
  var privacySettingsOverlay = privacySettingsPopup.querySelector('.overlay');
  privacySettingsPopup.classList.add('show');
  privacySettingsOverlay.classList.add('show');
}

function closePrivacySettings() {
  var privacySettingsPopup = document.getElementById('privacy-settings-popup');
  var privacySettingsOverlay = privacySettingsPopup.querySelector('.overlay');
  privacySettingsPopup.classList.remove('show');
  privacySettingsOverlay.classList.remove('show');
}
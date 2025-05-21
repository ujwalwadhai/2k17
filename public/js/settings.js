document.getElementById("settings-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const statusBox = document.getElementById("settings-status");
  statusBox.style.color = "green";
  statusBox.innerHTML = "<i class='fal fa-spin fa-circle-notch'></i> &nbsp;Saving settings...";

  const formData = new FormData(this);
  const settings = {};

  for (let [key, value] of formData.entries()) {
    settings[key] = true; // All checkboxes present are "true"
  }

  // Explicitly set unchecked ones to false
  ['emailNotifications', 'loginAlerts', 'emailUpdates'].forEach(key => {
    if (!settings.hasOwnProperty(key)) settings[key] = false;
  });

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
      console.error(err);
      statusBox.style.color = "red";
      statusBox.innerHTML = "<i class='fal fa-times-circle'></i> &nbsp;Something went wrong.";
    });
});

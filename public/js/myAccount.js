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

function openChangePassword(hasPassword){
  var changePasswordPopup = document.getElementById('change-password-popup');
  var changePasswordOverlay = changePasswordPopup.querySelector('.overlay');
  if(!hasPassword){
    changePasswordPopup.querySelector(".title").innerHTML = `<span class="fal fa-lock"></span> Add password`
    changePasswordPopup.querySelector("#currentPassword").setAttribute('placeholder', 'Enter activation code');
    changePasswordPopup.querySelector(".grey-1").innerHTML = `<span class="fal fa-info-circle"></span> &nbsp; You can still use other methods of logging in like google, email OTP and activation code.`
  }
  changePasswordPopup.classList.add('show');
  changePasswordOverlay.classList.add('show');
}

function closeChangePassword(){
  var changePasswordPopup = document.getElementById('change-password-popup');
  var changePasswordOverlay = changePasswordPopup.querySelector('.overlay');
  changePasswordPopup.classList.remove('show');
  changePasswordOverlay.classList.remove('show');
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
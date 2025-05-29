document.addEventListener("DOMContentLoaded", () => {
  var profileInput = document.getElementById("profilePhoto");
  var profileImg = document.querySelector(".profile-pic");
  var form = document.getElementById("edit-profile-form");
  var statusBox = document.getElementById("edit-profile-status");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusBox.innerHTML = "<span class='fal fa-spin fa-circle-notch'></span> &nbsp;Updating profile...";
    statusBox.style.color = "green";

    var formData = new FormData(form);

    if (profileInput.files.length > 0) {
      formData.append("profile", profileInput.files[0]);
    }

    fetch("/profile/update?folder=profiles", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          statusBox.innerHTML = "<span class='fal fa-check-circle'></span> &nbsp;Profile updated!";
          statusBox.style.color = "green";
        } else {
          statusBox.innerHTML = "<span class='fal fa-circle-xmark'></span> &nbsp;" + (data.message || "Failed to update.")
          statusBox.style.color = "red";
        }
      })
      .catch(err => {
        console.log(err);
        statusBox.innerHTML = "<span class='fal fa-circle-xmark'></span> &nbsp;Something went wrong.";
        statusBox.style.color = "red";
      });

  });



  profileInput.addEventListener("change", (e) => {
    var file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      var reader = new FileReader();
      reader.onload = () => {
        profileImg.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  });


});

function checkUsername(el, username, currentUsername) {
  let cleanValue = '';
  for (let i = 0; i < el.value.length; i++) {
    var char = el.value[i];
    if ((char >= 'a' && char <= 'z') ||
      (char >= 'A' && char <= 'Z') ||
      (char >= '0' && char <= '9')) {
      cleanValue += char;
    } else {
      el.value = el.value.replace(/[^a-zA-Z0-9]/g, '');
      return
    }
  }
  el.value = cleanValue;
  var status_icon = document.getElementById("status-icon");
  var status_message = document.getElementById("status-message");
  status_icon.classList.remove("fa-spinner-third");
  status_icon.classList.remove("fa-check-circle");
  status_icon.classList.remove("fa-spin");
  status_icon.classList.remove("fa-circle-xmark");
  if (username && username != currentUsername) {
    status_icon.classList.add("fa-spin");
    status_message.innerHTML = "Checking username availability...";
    status_icon.classList.add("fa-spinner-third");
    status_icon.classList.add("status-icon");
    setTimeout(() => {
      fetch('/check/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: cleanValue
        })
      }).then((res) =>
        res.json()
      ).then((data) => {
        status_icon.classList.remove("fa-spin");
        status_icon.classList.remove("fa-spinner-third");
        if (data.success) {
          status_icon.classList.add("fa-check-circle");
          status_icon.style.color = "green";
          status_message.innerHTML = "<span class='green'>Username available!</span>";
        } else {
          status_icon.classList.add("fa-circle-xmark");
          status_icon.style.color = "red";
          status_message.innerHTML = "<span class='red'>Username already taken!</span>";
        }
      })
    }, 300)
  } else {
    status_message.innerHTML = "";
  }
}

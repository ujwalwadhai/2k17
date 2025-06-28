function togglePassword() {
    var password = document.getElementById("password");
    var toggle = document.getElementById("toggle");
    if (password.type === "password") {
      password.type = "text";
      toggle.classList.remove("fa-eye");
      toggle.classList.add("fa-eye-slash");
    } else {
      password.type = "password";
      toggle.classList.remove("fa-eye-slash");
      toggle.classList.add("fa-eye");
    }
  }
  
  function updateUsername(name) {
    const usernameInput = document.getElementById("username");
    const username = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .replace(/^-|-$/g, "");
    usernameInput.value = username;
  }
  
  function register() {
    var email = document.getElementById("email").value;
    var name = document.getElementById("name").value;
    var username = document.getElementById("username").value;
    var dob = document.getElementById("dob").value;
    var info = document.getElementById("info");
    var signup_btn = document.getElementById("signup-btn");
    if (!document.querySelector("#terms-box").checked) {
      return Toast("Please accept terms of service!", "error");
    }
    if (email && username && name && dob) {
      signup_btn.innerHTML =
        "<span class='fal fa-spin fa-spinner-third'></span> &nbsp; Creating account...";
      fetch("/pre-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          username: username,
          name: name,
          dob: dob
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            info.innerHTML =
              "<span class='green'><span class='fal fa-circle-check'></span> &nbsp; Your pre-registeration is done!</span>";
            signup_btn.innerHTML = "Return to home...";
            signup_btn.onclick = () => {
              window.location.href = data.redirect;
            }
            document.getElementById("pre-register-form").reset();
            Toast(
              "Account created successfully! Please check your email for verification link."
            );
          } else {
            setTimeout(() => {
              signup_btn.innerHTML = "Create account";
              info.innerHTML = `<span class='red'><span class='fal fa-circle-xmark'></span> &nbsp; ${data.message}</span>`;
            }, 500);
          }
        });
    } else {
      info.innerHTML =
        "<span class='red'><span class='fal fa-triangle-exclamation'></span> &nbsp; Please fill all fields!</span>";
    }
  }
  
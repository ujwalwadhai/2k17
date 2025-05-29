var otpEmail;



function login(redirectURL){
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var login = {
        username: username.toLowerCase(),
        password: password
    }
    var info = document.getElementById('info');
    var login_btn = document.getElementById('login_btn');
    login_btn.disabled = true;
    info.innerHTML = "<span style='color: green'>Logging in...</span>";
    login_btn.innerHTML = "<span class='fal fa-spin fa-spinner-third'></span> &nbsp; Logging in..."
    setTimeout(() => {
        fetch('/login/password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(login)
        })
        .then(res => res.json())
        .then(data => {
            if(data.success){
                info.innerHTML = `<span style='color: green'><span class='fal fa-circle-check'></span> &nbsp; ${data.message}</span>`;
                login_btn.innerHTML = "Redirecting..."
                setTimeout(() => {
                    window.location.href = redirectURL;
                }, 300)
            } else {
                login_btn.disabled = false;
                info.innerHTML = `<span style='color: red'><span class='fal fa-circle-xmark'></span> &nbsp; ${data.message}</span>`;
                login_btn.innerHTML = "Continue"
            }
        })
    }, 500)

}

function sendOTP(){
    var otp = document.getElementById("otp");
    var status_message = document.getElementById("otp-status-message");
    var email_inp = document.getElementById("login-email");
    var send_otp_btn = document.getElementById("send-otp-btn");
    var login_btn = document.getElementById("login-btn");
    if(email_inp.value){
        send_otp_btn.innerHTML = "<span class='fal fa-spin fa-spinner-third'><span>"
        status_message.innerHTML = "Sending OTP...";
        fetch('/send/otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: email_inp.value})
        })
        .then(res => res.json())
        .then(data => {
            setTimeout(() => {
                if(data.success){
                    send_otp_btn.style.display = "none";
                    email_inp.style.display = "none";
                    status_message.innerHTML = `<span style='color:green'><span class='fal fa-circle-check'></span> &nbsp; OTP sent to ${email_inp.value}</span>`;
                    login_btn.style.display = "block";
                    otp.style.display = "block";
                    otp.disabled = false;
                    otpEmail = email_inp.value;
                } else {
                    status_message.innerHTML = `<span style='color: red'><span class='fal fa-circle-xmark'></span> &nbsp; ${data.message}</span>`;
                    send_otp_btn.innerHTML = "Send OTP";
                }
            }, 500)
        })
    }
}

function togglePassword(){
    var password = document.getElementById("password");
    var toggle = document.getElementById("toggle");
    if(password.type === "password"){
        password.type = "text";
        toggle.classList.remove("fa-eye");
        toggle.classList.add("fa-eye-slash");
    } else {
        password.type = "password";
        toggle.classList.remove("fa-eye-slash");
        toggle.classList.add("fa-eye");
    }
}

function email_login(){
    var otp = document.getElementById("otp").value;
    var status_message = document.getElementById("otp-status-message");
    var login_btn = document.getElementById("login-btn");
    var email = otpEmail || document.getElementById("login-email").value;
    var send_otp_btn = document.getElementById("send-otp-btn");
    login_btn.disabled = true;
    if(otp){
        login_btn.innerHTML = "<span class='fal fa-spin fa-spinner-third'><span>"
        status_message.innerHTML = "Logging in...";
        fetch('/login/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({otp, email})
        })
        .then(res => res.json())
        .then(data => {
            if(data.success){
                status_message.innerHTML = `<span style='color:green'>${data.message}</span>`;
                login_btn.innerHTML = "Redirecting...";
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 500)
            } else {
                status_message.innerHTML = `<span style='color: red'>${data.message}, please try again!</span>`;
                setTimeout(() => {
                    window.location.reload();
                }, 500)
            }
        })
    } else {
        status_message.innerHTML = `<span style='color: red'>Please enter OTP</span>`;
    }
}


document.getElementById("forgotten-password-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var statusBox = document.getElementById("forgotten-password-status");
  statusBox.style.color = "green";
  statusBox.innerHTML = "<i class='fal fa-circle-notch fa-rotate'></i> &nbsp;Submitting...";

  fetch("/forgotten-password", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({email : this.elements["email"].value})
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

function openForgottenPassword(){
  var forgottenPasswordPopup = document.getElementById('forgotten-password-popup');
  var forgottenPasswordOverlay = forgottenPasswordPopup.querySelector('.overlay');
  forgottenPasswordPopup.classList.add('show');
  forgottenPasswordOverlay.classList.add('show');
}

function closeForgottenPassword(){
  var forgottenPasswordPopup = document.getElementById('forgotten-password-popup');
  var forgottenPasswordOverlay = forgottenPasswordPopup.querySelector('.overlay');
  forgottenPasswordPopup.classList.remove('show');
  forgottenPasswordOverlay.classList.remove('show');
}
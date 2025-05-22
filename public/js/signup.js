function checkUsername(el, username){
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
    status_icon.classList.remove("fa-user-circle");
    status_icon.classList.remove("fa-spinner-third");
    status_icon.classList.remove("fa-check-circle");
    status_icon.classList.remove("fa-spin");
    status_icon.classList.remove("fa-circle-xmark");
    if(username){
        status_icon.classList.add("fa-spin");
        status_message.innerHTML = "Checking username availability...";
        status_icon.classList.add("fa-spinner-third");
        status_icon.classList.add("status-icon");
        setTimeout(()=>{
            fetch('/check/username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: cleanValue
                })  
            }).then((res)=>
                res.json()
            ).then((data)=>{
                status_icon.classList.remove("fa-spin");
                status_icon.classList.remove("fa-spinner-third");
                if(data.success){
                    status_icon.classList.add("fa-check-circle");
                    status_message.innerHTML = "<span class='green'>Username available!</span>";
                } else {
                    status_icon.classList.add("fa-circle-xmark");
                    status_message.innerHTML = "<span class='red'>Username already taken!</span>"; 
                }
            })
        }, 1500)
    } else {
        status_icon.classList.add("fa-user-circle");
        status_message.innerHTML = "<span class='grey-1'>Enter username to check</span>";
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

function signup(){
    var username = document.getElementById("signup-username").value;
    var email = document.getElementById("email").value;
    var code = document.getElementById("code").value;
    var info = document.getElementById("info");
    var signup_btn = document.getElementById("signup-btn");
    if(username && email && code){
        signup_btn.innerHTML = "<span class='fal fa-spin fa-spinner-third'></span> &nbsp; Creating account...";
        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                code: code
            })  
        }).then(
            (res)=>res.json()
        ).then((data)=>{
            if(data.success){
                info.innerHTML = "<span class='green'><span class='fal fa-circle-check'></span> &nbsp; Account created successfully!</span>";
                setTimeout(()=>{
                    window.location.href = "/home";
                }, 2000)
            } else {
                setTimeout(()=>{
                    signup_btn.innerHTML = "Create account";
                    info.innerHTML = `<span class='red'><span class='fal fa-circle-xmark'></span> &nbsp; ${data.message}</span>`;
                }, 1500)
            }
        })
    } else {
        info.innerHTML = "<span class='red'><span class='fal fa-triangle-exclamation'></span> &nbsp; Please fill all fields!</span>"
    }
}

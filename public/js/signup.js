

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
    var email = document.getElementById("email").value;
    var code = document.getElementById("code").value;
    var info = document.getElementById("info");
    var signup_btn = document.getElementById("signup-btn");
    if(!document.querySelector('#terms-box').checked){
        return Toast("Please accept terms of service!", 'error')
    }
    if(email && code){
        signup_btn.innerHTML = "<span class='fal fa-spin fa-spinner-third'></span> &nbsp; Creating account...";
        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                code: code
            })  
        }).then(
            (res)=>res.json()
        ).then((data)=>{
            if(data.success){
                info.innerHTML = "<span class='green'><span class='fal fa-circle-check'></span> &nbsp; Account created successfully!</span>";
                signup_btn.innerHTML = "Redirecting to home...";
                alert('Account created successfully! Please check your email for verification link.')
                setTimeout(()=>{
                    window.location.href = data.redirect;
                }, 1500)
            } else {
                setTimeout(()=>{
                    signup_btn.innerHTML = "Create account";
                    info.innerHTML = `<span class='red'><span class='fal fa-circle-xmark'></span> &nbsp; ${data.message}</span>`;
                }, 500)
            }
        })
    } else {
        info.innerHTML = "<span class='red'><span class='fal fa-triangle-exclamation'></span> &nbsp; Please fill all fields!</span>"
    }
}


const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");
let index = 0;

function showSlide(i) {
    slides.forEach((slide, idx) => {
        slide.classList.toggle("active", idx === i);
        dots[idx].classList.toggle("active", idx === i);
    });
    index = i;
}

function nextSlide() {
    index = (index + 1) % slides.length;
    showSlide(index);
}

dots.forEach(dot => {
    dot.addEventListener("click", () => {
        showSlide(Number(dot.dataset.index));
    });
});

function checkUsername(username){
    var status_icon = document.getElementById("status-icon");
    var status_message = document.getElementById("status-message");
    status_icon.classList.remove("fa-user-circle");
    status_icon.classList.remove("fa-rotate");
    status_icon.classList.remove("fa-check-circle");
    status_icon.classList.remove("fa-spin");
    status_icon.classList.remove("fa-circle-xmark");
    if(username){
        status_icon.classList.add("fa-spin");
        status_message.innerHTML = "Checking username availability...";
        status_icon.classList.add("fa-rotate");
        status_icon.classList.add("status-icon");
        setTimeout(()=>{
            status_icon.classList.remove("fa-spin");
            status_icon.classList.remove("fa-rotate");

            /* status_icon.classList.add("fa-check-circle");
            status_message.innerHTML = "<span class='green'>Username available!</span>"; */
            status_icon.classList.add("fa-circle-xmark");
            status_message.innerHTML = "<span class='red'>Username already taken!</span>"; 

        }, 2000)
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

setInterval(nextSlide, 4000);
document.getElementById("contact-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var statusBox = document.getElementById("contact-status");
    statusBox.style.color = "green";
    statusBox.innerHTML = "<i class='fal fa-circle-notch fa-rotate'></i> &nbsp;Sending email to admin...";

    fetch("/contact", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: this.elements["email"].value, text: this.elements["text"].value })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                statusBox.innerHTML = "<i class='fal fa-circle-check'></i> &nbsp; Message sent successfully. We will get back to you soon.";
                statusBox.style.color = "green";
                this.reset();
            } else {
                statusBox.innerHTML = "<i class='fal fa-circle-xmark'></i> &nbsp;" + (data.message || "Failed to send email.");
                statusBox.style.color = "red";
            }
        })
        .catch(err => {
            console.log(err);
            statusBox.innerHTML = "<i class='fal fa-times-circle'></i> &nbsp;Something went wrong. Please try again later";
            statusBox.style.color = "red";
        });
});
/* 
document.getElementById("newsletter-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var statusBtn = document.getElementById("newsletter-sub-btn");
    statusBtn.innerHTML = "Subscribing...";

    fetch("/newsletter/subscribe", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: this.elements["email"].value })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                statusBtn.innerHTML = "Suscribed successfully!";
                statusBtn.disabled = true;
                this.reset();
            } else {
                statusBtn.innerHTML = "Couldn't subscribe";
            }
        })
        .catch(err => {
            console.log(err);
            statusBox.innerHTML = "Server unavailable";
        });
}); */
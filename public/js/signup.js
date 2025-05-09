
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

setInterval(nextSlide, 5000); // auto-slide every 5 sec
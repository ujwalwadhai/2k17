document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
    var url = new URL(window.location);
    url.searchParams.set('s', btn.dataset.tab);
    window.history.pushState({}, '', url);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  var urlParams = new URLSearchParams(window.location.search);
  var s = urlParams.get('s');
  if (['about', 'media', 'posts'].includes(s)) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    var btn = document.getElementById(s);

    btn.classList.add('active');
    var tabId = s + "-tab"
    document.getElementById(tabId).classList.add('active');
  }
})


function showLoginBanner() {
  var popup = document.getElementById("login-banner")
  popup.classList.add("show");
  popup.querySelector(".overlay").classList.add("show");
}
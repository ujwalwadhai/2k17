var VERSION = `2k17-11-08-2025`; // Change this when you want to force localStorage update

var storedVersion = localStorage.getItem('version') || null;

if (storedVersion !== VERSION) {
    console.log("OLD VERSION DETECTED, CLEARING CACHE")
    localStorage.removeItem('session_id');
    localStorage.setItem('session_id', crypto.randomUUID())
    localStorage.setItem('version', VERSION);
}

function Toast(message, type = 'info') {
  var container = document.getElementById('toast-container');
  var toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  var icons = {
    success: 'fal fa-check-circle',
    error: 'fal fa-times-circle',
    info: 'fal fa-info-circle',
    warning: 'fal fa-exclamation-triangle'
  };

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <i class="${icons[type] || icons.info}"></i>
      <span>${message}</span>
    </div>
    <button class="toast-close ${type}" aria-label="Close"><span class="fal fa-xmark"></span></button>
    <div class="toast-progress ${type}"></div>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

document.querySelectorAll('img').forEach(img => {
  img.setAttribute('oncontextmenu', 'return false;');
});

document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});

function clearNotifications() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      action: 'clear-notifications'
    });
  }
}

window.addEventListener('focus', clearNotifications);

document.addEventListener('DOMContentLoaded', clearNotifications);
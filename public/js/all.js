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

// Disable right-click globally
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});

document.addEventListener('DOMContentLoaded', () => {
  var tabs = document.querySelectorAll('.tab');
  var tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.add('hidden'));

      tab.classList.add('active');
      var target = document.getElementById(`${tab.dataset.tab}-tab`);
      document.title = tab.dataset.title;
      target.classList.remove('hidden');
    });
  });

  window.addEventListener('popstate', (event) => {
    var folderId = event.state?.folderId || 'root';
    loadFolder(folderId, false);
  });


});

function openViewImage(name, url){
  var ViewImagePopup = document.getElementById('view-image-popup');
  var ViewImageOverlay = ViewImagePopup.querySelector('.overlay');
  var img = document.querySelector('#imgLarge')
  var imgName = document.querySelector('#imgName')
  img.src = url;
  imgName.textContent = name;
  Toast('Loading image...', 'info')
  ViewImagePopup.classList.add('show');
  ViewImageOverlay.classList.add('show');
}

function closeViewImage(){
  var ViewImagePopup = document.getElementById('view-image-popup');
  var ViewImageOverlay = ViewImagePopup.querySelector('.overlay');
  ViewImagePopup.classList.remove('show');
  ViewImageOverlay.classList.remove('show');
  var img = document.querySelector('#imgLarge')
  var name = document.querySelector('#imgName')
  img.src = ''
  name.textContent = ''
}


async function loadFolder(folderId, updateURL = true) {
  var folders = document.querySelector('.folders');
  var breadcrumb = document.querySelector('.breadcrumb');
  var driveGallery = document.querySelector('.drive-gallery');

  folders.innerHTML = '<span class="fal fa-rotate fa-circle notch"></span>'
  driveGallery.innerHTML = ''
  Toast('Loading...', 'info')

  // ✅ Update the URL (but not if this is root)
  if (updateURL) {
    var newPath = folderId === 'root' ? '/memories' : `/memories/${folderId}`;
    window.history.pushState({ folderId }, '', newPath);
  }

  let response;
  if (folderId === 'root') {
    response = await fetch(`/memories/root`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    response = await fetch(`/memories/folders/${folderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  }

  var data = await response.json();

  if (data.success) {
    if(data.currentFolder){ 
      document.title = data.currentFolder.name
    } else {
      document.title = '2k17 Drive'
    }

    breadcrumb.innerHTML = '<a onclick="loadFolder(`root`)"><span class="fal fa-house"></span></a>';
    data.breadcrumb.forEach(folder => {
      breadcrumb.innerHTML += `<a onclick="loadFolder('${folder.id}')">${folder.name}</a>`;
    });

    folders.innerHTML = '';
    data.subfolders.forEach(folder => {
      folders.innerHTML += `<div class="folder" onclick="loadFolder('${folder._id}')">
        <span class="fal fa-folder-image"></span>
        <span>${folder.name}</span>
      </div>`;
    });

    driveGallery.innerHTML = '';
    data.files.forEach(file => {
      if (file.type === 'image') {
        driveGallery.innerHTML += `<div onclick="openViewImage('${file.name}', '${file.url}')">
          <img oncontextmenu="return false;" src="https://picsum.photos/200/300" alt="Drive Image">
          <p>${file.name.substring(0, 18)}${file.name.length > 18 ? '...' : ''}<span><span class="fal fa-heart"></span><span class="fal fa-message"></span></span></p>
        </div>`;
      }
    });

  } else {
    Toast(data.message, 'error');
    folders.innerHTML = data.message;
  }
}

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

  loadFolder('root', false);
});

function openViewImage(name, url) {
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

function closeViewImage() {
  var ViewImagePopup = document.getElementById('view-image-popup');
  var ViewImageOverlay = ViewImagePopup.querySelector('.overlay');
  ViewImagePopup.classList.remove('show');
  ViewImageOverlay.classList.remove('show');
  var img = document.querySelector('#imgLarge')
  var name = document.querySelector('#imgName')
  img.src = ''
  name.textContent = ''
}
function openViewVideo(name, url) {
  var ViewVideoPopup = document.getElementById('view-video-popup');
  var ViewVideoOverlay = ViewVideoPopup.querySelector('.overlay');
  var videoIframe = document.querySelector('#videoIframe')
  var videoName = document.querySelector('#videoName')
  videoIframe.src = url;
  videoName.textContent = name;
  Toast('Loading video could take time...', 'info')
  ViewVideoPopup.classList.add('show');
  ViewVideoOverlay.classList.add('show');
}

function closeViewVideo() {
  var ViewVideoPopup = document.getElementById('view-video-popup');
  var ViewVideoOverlay = ViewVideoPopup.querySelector('.overlay');
  ViewVideoPopup.classList.remove('show');
  ViewVideoOverlay.classList.remove('show');
  var videoIframe = document.querySelector('#videoIframe')
  var videoName = document.querySelector('#videoName')
  videoIframe.src = ''
  videoName.textContent = ''
}


async function loadFolder(folderId, updateURL = true) {
  var folders = document.querySelector('.folders');
  var breadcrumb = document.querySelector('.breadcrumb');
  var driveGallery = document.querySelector('.drive-gallery');
  var featuredImages = document.querySelector('.featured-gallery');
  folders.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    folders.innerHTML += `<div class="skeleton-folder"></div>`;
  }

  driveGallery.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    driveGallery.innerHTML += `<div><div class="skeleton"></div></div>`;
  }


  if (!folderId) return
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
    if (data.currentFolder) {
      document.title = data.currentFolder.name + " - 2k17"
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
        <span class="fal fa-folder"></span>
        <span class="foldername">${folder.name}</span>
      </div>`;
    });

    driveGallery.innerHTML = '';
    featuredImages.innerHTML = '';

    data.featuredImages.forEach(img => {
      var isLiked = false
      if(data.userId){
        isLiked = img.likes.some(u=> u._id.toString() === data.userId.toString())
        featuredImages.innerHTML += `<div>
        <p class="fileinfo">
          <span class="filename"><span class="fal fa-image"></span>${img.name.replace(/\.[^/.]+$/, '')}</span>
          <span class="${isLiked ? 'fas' : 'fal'} fa-heart" id="like-icon-${img._id}" onclick="likeFile('${img._id}')"></span>
        </p>
        <img onclick="openViewImage('${img.name}','${img.url}')" oncontextmenu="return false;" src="${img.thumbnail}" alt="Featured Image">
      </div>`
      } else {
      featuredImages.innerHTML += `<div>
      <p class="fileinfo">
        <span class="filename"><span class="fal fa-image"></span>${img.name.replace(/\.[^/.]+$/, '')}</span>
        <span class="fal fa-heart" id="like-icon-${img._id}"></span>
      </p>
      <img onclick="openViewImage('${img.name}','${img.url}')" oncontextmenu="return false;" src="${img.thumbnail}" alt="Featured Image">
    </div>`
      }
    })

    data.files.forEach(file => {
      const wrapper = document.createElement('div');
      wrapper.className = file.type === 'image' ? 'file-image' : 'file-video';
      
      if(data.userId){
        var isLiked = file.likes.some(u=> u._id.toString() === data.userId.toString())
        var fileInfoHTML = `
          <p class="fileinfo">
            <span class="filename"><span class="fal ${file.type === 'image' ? 'fa-image' : 'fa-video'}"></span>${file.name.replace(/\.[^/.]+$/, '')}</span>
            <span class="${isLiked ? 'fas' : 'fal'} fa-heart" id="like-icon-${file._id}" onclick="likeFile('${file._id}')"></span>
          </p>`;
      } else {
        var fileInfoHTML = `
          <p class="fileinfo">
            <span class="filename"><span class="fal ${file.type === 'image' ? 'fa-image' : 'fa-video'}"></span>${file.name.replace(/\.[^/.]+$/, '')}</span>
            <span class="fal fa-heart" id="like-icon-${file._id}"></span>
          </p>`;
      }
      const img = new Image();
      img.src = file.thumbnail;
      img.alt = 'Drive ' + file.type;
      img.loading = 'lazy';
      img.setAttribute('onclick',
        file.type === 'image'
          ? `openViewImage('${file.name}', '${file.url}')`
          : `openViewVideo('${file.name}', '${file.url}')`
      );
      img.oncontextmenu = () => false;
      img.onload = () => img.classList.add('loaded');

      wrapper.innerHTML = fileInfoHTML;
      wrapper.appendChild(img);
      driveGallery.appendChild(wrapper);
    });

  } else {
    Toast(data.message, 'error');
    folders.innerHTML = data.message;
  }
}

async function likeFile(fileId) {
  try {
    var icon = document.getElementById(`like-icon-${fileId}`);
    icon.classList.remove("fa-heart");
    icon.classList.add("fa-spinner-third");
    icon.classList.add("fa-spin");
    var res = await fetch(`/file/${fileId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    var data = await res.json();
    if (!data.success) return Toast('Failed to update like', 'error');

    // Toggle icon style
    icon.classList.remove('fa-spin');
    icon.classList.remove('fa-spinner-third');
    icon.classList.add('fa-heart');
    if (data.liked) {
      icon.classList.remove('fal');
      icon.classList.add('fas');
    } else {
      icon.classList.remove('fas');
      icon.classList.add('fal');
    }

  } catch (err) {
    console.log(err);
    Toast('Error while liking post', 'error');
  }
}

var userId = document.getElementById('userId').value;

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

async function submitComment(fileId) {
  document.querySelector('#newCommentBtn').disabled = true;
  var text = document.getElementById('new-comment').value;
  var res = await fetch(`/file/${fileId}/new/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  var data = await res.json()
  if (data.success) {
    document.getElementById('new-comment').value = ''
    document.querySelector('#newCommentBtn').disabled = false;
    openComments(fileId);
  } else {
    Toast('Failed to add comment! Please try again later.','error')
    document.querySelector('#newCommentBtn').disabled = false;
  }
}


async function deleteFileComment(commentId, fileId) {
  var conf = confirm('Are you sure you want to delete this comment?')
  if (!conf) {
    return
  }
  var res = await fetch(`/file/${fileId}/comment/${commentId}/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  var data = await res.json();
  if (data.success) {
    Toast('Comment deleted successfully!', 'success')
      openComments(fileId);
  } else {
    Toast('Failed to delete comment! Please try again later.', 'error')
  }
}


async function openComments(fileId) {
  var commentsPopup = document.getElementById('comments-popup')
  var overlay = document.getElementById('overlay')
  commentsPopup.classList.add('show');
  overlay.classList.add('show');

  commentsPopup.querySelector('#newCommentBtn').removeEventListener('click', () => { submitComment(fileId) })
  commentsPopup.querySelector('#newCommentBtn').addEventListener('click', () => { submitComment(fileId) })
  document.getElementById('new-comment').value = ''

  if(!fileId) closeComments()
  var list = document.getElementById('comments-list');
  list.innerHTML = '';
  list.innerHTML = `<div id="comments-loader">
  <div class="comments-loader-text" id="comments-loader-text">
      <span class="letter" style="animation-delay: 0s"><span class='letter-blue'>2</span></span>
      <span class="letter" style="animation-delay: 0.15s"><span class='letter-green'>k</span></span>
      <span class="letter" style="animation-delay: 0.3s"><span class='letter-red'>1</span></span>
      <span class="letter" style="animation-delay: 0.45s"><span class='letter-yellow'>7</span></span>
  </div>
</div>`
  var res = await fetch(`/file/${fileId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  var comments = await res.json();
  setTimeout(() => {
    if (comments.length > 0) {

      document.getElementById('comments-loader').classList.add('hidden');
      comments.forEach(c => {
        if (c.user._id.toString() === userId.toString()) {
          var trashIcon = `<span class='fal fa-trash' onclick='deleteFileComment("${c._id}", "${fileId}")'></span>`
        } else {
          var trashIcon = ''
        }
        list.innerHTML += `<div class="comment" id="comment-${c._id}">
                                  <img src="${c.user.profile ? c.user.profile : '/images/user.png'}" alt="" onclick="window.location.href='/${c.user.username}'" class="user-profile">
                                  <div class="comment-info">
                                  <p class="name" onclick="window.location.href='/${c.user.username}'">${c.user.name} &nbsp; <span class="time">${c.timeAgo || 'moments ago'}</span></p>
                              <span class="text">${c.text}</span>
                            </div>
                            <div class="action-buttons">
                              ${trashIcon}
                            </div>
                          </div>`;
      });

      setTimeout(() => {
        document.querySelectorAll('.comment').forEach(c => {
          c.style.display = 'flex'
        })
      }, 100)
    } else {
      list.innerHTML = "No comments yet"
    }
  }, 500)
}

function closeComments() {
  var CommentsPopup = document.getElementById('comments-popup');
  var CommentsOverlay = CommentsPopup.querySelector('.overlay');
  CommentsPopup.classList.remove('show');
  CommentsOverlay.classList.remove('show');
}

function openViewImage(name, url, id, thumbnail) {
  var ViewImagePopup = document.getElementById('view-image-popup');
  var ViewImageOverlay = ViewImagePopup.querySelector('.overlay');
  var img = document.querySelector('#imgLarge')
  var imgName = document.querySelector('#imgName')
  img.src = url;
  imgName.textContent = name;
  ViewImagePopup.querySelector("#comments-icon").setAttribute('onclick', `openComments("${id}")`)
  ViewImagePopup.querySelector("#share-icon").setAttribute('onclick', `shareImage("${id}", "${thumbnail}")`)
  ViewImagePopup.classList.add('show');
  ViewImageOverlay.classList.add('show');
  if(!localStorage.getItem('viewedImages') || !localStorage.getItem('viewedImages').includes(id)) {
    navigator.sendBeacon('/api/analytics/addFileView', JSON.stringify({ fileId: id }));
    localStorage.setItem('viewedImages', localStorage.getItem('viewedImages') ? localStorage.getItem('viewedImages') + ',' + id : id)
  }
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
function openViewVideo(name, url, id, thumbnail) {
  var ViewVideoPopup = document.getElementById('view-video-popup');
  var ViewVideoOverlay = ViewVideoPopup.querySelector('.overlay');
  var videoIframe = document.querySelector('#videoIframe')
  var videoName = document.querySelector('#videoName')
  videoIframe.src = url;
  videoName.textContent = name;
  ViewVideoPopup.querySelector("#comments-icon").setAttribute('onclick', `openComments("${id}")`)
  ViewVideoPopup.querySelector("#share-icon").setAttribute('onclick', `shareImage("${id}", "${thumbnail}")`)
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

  if (updateURL) {
    var newPath = folderId === 'root' ? '/memories' : `/memories/folder/${folderId}`;
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
    if(folderId === 'root'){
      driveGallery.innerHTML += `<div class="upload-own-banner folder" style="padding: 10px 14px; line-height:25px" onclick="window.open('https://drive.google.com/drive/folders/1uy7KZjeHKomo2Ml80_bixL_mDAcVFxUf', '_blank')">
        <span class="fal fa-images"></span> &nbsp; Want to upload images and videos?<br>
        <span class='grey-1'>Click here to upload your own memories</span>
      </div>`;
    }

    data.featuredImages.forEach(img => {
      var isLiked = false
      if(data.userId){
        isLiked = img.likes.some(u=> u._id.toString() === data.userId.toString())
        featuredImages.innerHTML += `<div>
        <p class="fileinfo">
          <span class="filename"><span class="fal fa-image"></span>${img.name.replace(/\.[^/.]+$/, '')}</span>
          <span class="${isLiked ? 'fas' : 'fal'} fa-heart" id="like-icon-${img._id}" onclick="likeFile('${img._id}')"></span>
        </p>
        <img onclick="openViewImage("${img.name.replace(/\.[^/.]+$/, '')}",'${img.url}', '${img._id}', '${img.thumbnail}')" oncontextmenu="return false;" src="${img.thumbnail}" alt="Featured Image">
      </div>`
      } else {
      featuredImages.innerHTML += `<div>
      <p class="fileinfo">
        <span class="filename"><span class="fal fa-image"></span>${img.name.replace(/\.[^/.]+$/, '')}</span>
        <span class="fal fa-heart" id="like-icon-${img._id}"></span>
      </p>
      <img onclick="openViewImage("${img.name.replace(/\.[^/.]+$/, '')}",'${img.url}', '${img._id}', '${img.thumbnail}')" oncontextmenu="return false;" src="${img.thumbnail}" alt="Featured Image">
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
          ? `openViewImage("${file.name.replace(/\.[^/.]+$/, '')}", '${file.url}', '${file._id}', '${file.thumbnail}')`
          : `openViewVideo("${file.name.replace(/\.[^/.]+$/, '')}", '${file.url}', '${file._id}', '${file.thumbnail}')`
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


async function shareImage(fileId, url){
  const response = await fetch(url);
  const blob = await response.blob();
  const file = new File([blob], 'image.jpg', { type: blob.type });

  const shareData = {
    title: 'Check this memory',
    text: 'See this memory I found on 2k17 Platform.',
    url: `https://twok17.onrender.com/memories/file/${fileId}`,
    files: [file]
  };

  try {
    await navigator.share(shareData);
    console.log('Shared successfully');
  } catch (err) {
    console.error('Sharing failed', err);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('popstate', (event) => {
    var folderId = event.state?.folderId || 'root';
    loadFolder(folderId, false);
  });
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
    Toast('Failed to add comment! Please try again later.', 'error')
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

  if (!fileId) closeComments()
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
        if (currentUser && (c.user._id.toString() === currentUser._id.toString() || currentUser.role == 'admin')) {
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
  document.querySelector(".memories-container").style.filter = "blur(6px)"
  ViewImagePopup.querySelector('#tagBtnImg').parentElement.parentElement.style.display = 'block'
  ViewImagePopup.querySelector('#tagBtnImg').parentElement.style.display = "flex"
  ViewImagePopup.querySelector('#tagBtnImg').disabled = false
  document.querySelector("#tag-memory-que").innerHTML = `<span class="fal fa-user-question" style="margin-right: 8px;"></span> Are you in this memory?`
  document.querySelector("#tag-memory-que").style.margin = '0 0 16px 0'
  if (USER_ID) {
    ViewImagePopup.querySelector('#tagBtnImg').setAttribute('onclick', `tagMemory("${id}", 'yes')`)
    ViewImagePopup.querySelector('.no').setAttribute('onclick', `tagMemory("${id}", 'no')`)
    ViewImagePopup.querySelector("#comments-icon").setAttribute('onclick', `openComments("${id}")`)
  } else {
    ViewImagePopup.querySelector('#tagBtnImg').setAttribute('onclick', `alert("Please login to tag yourself in memories")`)
    ViewImagePopup.querySelector('.no').setAttribute('onclick', `alert("Please login to remove yourself from memories")`)
    ViewImagePopup.querySelector("#comments-icon").setAttribute('onclick', `alert("Please login to comment on this image")`)
  }
  ViewImagePopup.querySelector("#share-icon").setAttribute('onclick', `shareImage("${id}", "${thumbnail}")`)
  ViewImagePopup.querySelector("#download-icon").setAttribute('onclick', `downloadImage("${name}")`)
  ViewImagePopup.classList.add('show');
  ViewImageOverlay.classList.add('show');
  navigator.sendBeacon('/api/analytics/addFileView', JSON.stringify({ fileId: id }));
}

async function tagMemory(fileId, yesorno) {
  if (USER_ID) {
    const tagBtn = document.getElementById('tagBtnImg');
    const tagQue = document.querySelector("#tag-memory-que");
    tagBtn.disabled = true;
    const res = await fetch(`/file/${fileId}/tag?s=${yesorno || 'yes'}`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      tagBtn.parentElement.style.display = 'none'
      tagQue.style.margin = '0'
      if (data.tag) {
        tagQue.innerHTML = `<span class="fal fa-user-check" style="margin-right: 8px;"></span> Added to My Memories`
      } else {
        tagQue.innerHTML = `<span class="fal fa-user-xmark" style="margin-right: 8px;"></span> Removed from My Memories`
      }
    } else {
      tagBtn.parentElement.parentElement.style.display = 'none'
    }
  } else {
    alert("Please login to tag yourself in memories")
  }
}

function closeViewImage() {
  var ViewImagePopup = document.getElementById('view-image-popup');
  var ViewImageOverlay = ViewImagePopup.querySelector('.overlay');
  document.querySelector(".memories-container").style.filter = "none"
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

const createSkeletons = (count, skeletonHTML) => {
  return Array(count).fill(skeletonHTML).join('');
};

async function loadFolder(folderId, updateURL = true) {
  const folders = document.querySelector('.folders');
  const breadcrumb = document.querySelector('.breadcrumb');
  const driveGallery = document.querySelector('.gallery');

  folders.innerHTML = createSkeletons(5, '<div class="skeleton-folder"></div>');
  driveGallery.innerHTML = createSkeletons(6, '<div><div class="skeleton"></div></div>');

  if (!folderId) return;

  if (folderId !== 'root' && !USER_ID) {
    folderId = 'root'
    alert("Please login to view more memories")
    return window.location.href = '/login'
  }

  if (updateURL) {
    const newPath = folderId === 'root' ? '/memories' : `/memories/folder/${folderId}`;
    window.history.pushState({ folderId }, '', newPath);
  }

  try {
    const endpoint = folderId === 'root' ? '/memories/root' : folderId == 'my-memories' ? '/memories/my-memories' : `/memories/folders/${folderId}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      document.title = data.currentFolder ? `${data.currentFolder.name} • 2k17` : 'Memories • 2k17 Platform';

      const homeLink = `<a onclick="loadFolder('root')"><span class="fal fa-house"></span></a>`;
      let pathLinks;
      if (folderId == 'my-memories') {
        pathLinks = `<a onclick="loadFolder('my-memories')">My Memories</a>`;
      } else {
        pathLinks = data.breadcrumb.map(folder => `<a onclick="loadFolder('${folder.id}')">${folder.name}</a>`).join('');
      }
      breadcrumb.innerHTML = homeLink + pathLinks;

      let subfoldersHTML = '';

      if (folderId === 'root') {
        subfoldersHTML += `<div class="folder" onclick="loadFolder('my-memories')">
        <span class="fal fa-folder-user"></span>
        <span class="foldername">My Memories</span>
    </div>`;
      }

      subfoldersHTML += data.subfolders.map(folder => `
    <div class="folder" onclick="loadFolder('${folder._id}')">
    <span class="fal fa-folder"></span>
    <span class="foldername">${folder.name}</span>
    </div>`).join('');

      folders.innerHTML = subfoldersHTML;
      driveGallery.innerHTML = ''
      if (folderId === 'root') {
        driveGallery.innerHTML += data.featuredImages.map(img => {
          const isLiked = data.userId && img.likes.some(u => u._id.toString() === data.userId.toString());
          const likeAction = data.userId ? `onclick="likeFile('${img._id}')"` : '';
          const viewAction = `openViewImage('Featured Image', '${img.url}', '${img._id}', '${img.thumbnail}')`;
          return `
            <div>
              <p class="fileinfo">
                <span class="filename"><span class="fal fa-image"></span>Featured Image</span>
                <span class="${isLiked ? 'fas' : 'fal'} fa-heart" id="like-icon-${img._id}" ${likeAction}></span>
              </p>
              <img onclick="${viewAction}" oncontextmenu="return false;" src="${img.thumbnail}" alt="Featured Image">
            </div>`;
        }).join('');
      } else {
        data.files.forEach(file => {
          const wrapper = document.createElement('div');
          wrapper.className = file.type === 'image' ? 'file-image' : 'file-video';

          const fileName = file.name.replace(/\.[^/.]+$/, '');
          const isLiked = data.userId && file.likes.some(u => u._id.toString() === data.userId.toString());
          const likeAction = data.userId ? `onclick="likeFile('${file._id}')"` : '';

          const fileInfoHTML = `
          <p class="fileinfo">
            <span class="filename"><span class="fal ${file.type === 'image' ? 'fa-image' : 'fa-video'}"></span>${fileName}</span>
            <span class="${isLiked ? 'fas' : 'fal'} fa-heart" id="like-icon-${file._id}" ${likeAction}></span>
          </p>`;

          const img = new Image();
          img.src = file.thumbnail;
          img.alt = `Drive ${file.type}`;
          img.loading = 'lazy';
          img.oncontextmenu = () => false;
          img.onload = () => img.classList.add('loaded');
          const viewAction = file.type === 'image'
            ? `openViewImage('${fileName}', '${file.url}', '${file._id}', '${file.thumbnail}')`
            : `openViewVideo('${fileName}', '${file.url}', '${file._id}', '${file.thumbnail}')`;
          img.setAttribute('onclick', viewAction);

          wrapper.innerHTML = fileInfoHTML;
          wrapper.appendChild(img);
          driveGallery.appendChild(wrapper);
        });
      }

    } else {
      throw new Error(data.message || 'Failed to load data.');
    }
  } catch (error) {
    console.log('Failed to load folder:', error);
    folders.innerHTML = `<p class="error-message">Please try again later!</p>`;
    driveGallery.innerHTML = '';
  }
}


async function shareImage(fileId) {
  const shareData = {
    title: 'Check this memory',
    text: 'See this memory I found on 2k17 Platform.',
    url: `https://twok17.onrender.com/memories/file/${fileId}`,
  };

  try {
    await navigator.share(shareData);
    console.log('Shared successfully');
  } catch (err) {
    console.error('Sharing failed', err);
  }
}

async function downloadImage(fileName) {
  const largeImg = document.getElementById('imgLarge');
  const imgUrl = largeImg.src.replace(/\.avif$/, ".jpg");
  const downloadBtn = document.getElementById('download-icon');
  const downloadBtnIcon = document.querySelector('#download-icon i');

  downloadBtnIcon.className = 'fal fa-spinner fa-spin';
  downloadBtn.disabled = true;

  try {
    const response = await fetch(imgUrl);
    const blob = await response.blob();

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName.endsWith('.jpg') ? fileName : fileName + '.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error fetching image:', error);
  }

  downloadBtnIcon.className = 'fal fa-download';
  downloadBtn.disabled = false;
}


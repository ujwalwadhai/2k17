var userId;

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


async function openComments(fileId, userId) {
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
        if (userId && c.user._id.toString() === userId.toString()) {
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

function openViewImage(id, userId) {
    userId = userId
  var ViewImagePopup = document.getElementById('view-image-popup');
  var ViewImageOverlay = ViewImagePopup.querySelector('.overlay');
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
function openViewVideo(name, url, id) {
  var ViewVideoPopup = document.getElementById('view-video-popup');
  var ViewVideoOverlay = ViewVideoPopup.querySelector('.overlay');
  var videoIframe = document.querySelector('#videoIframe')
  var videoName = document.querySelector('#videoName')
  videoIframe.src = url;
  videoName.textContent = name;
  ViewVideoPopup.querySelector("#comments-icon").setAttribute('onclick', `openComments("${id}")`)
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
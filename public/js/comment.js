async function loadComments(postId) {
  var commentsPopup = document.getElementById('comments-popup')
  var overlay = document.getElementById('overlay')
  commentsPopup.classList.add('show');
  overlay.classList.add('show');

  if (userId) {
    commentsPopup.querySelector('#newCommentBtn').removeEventListener('click', () => { submitComment(postId) })
    commentsPopup.querySelector('#newCommentBtn').addEventListener('click', () => { submitComment(postId) })
    document.getElementById('new-comment').value = ''
  }
  var list = document.getElementById('comments-list');
  list.innerHTML = '';
  list.innerHTML = partialLoader('comments-loader');
  var res = await fetch(`/post/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  var comments = await res.json();
  setTimeout(() => {
    if (comments.length > 0) {

      document.getElementById('comments-loader').classList.add('hidden');
      comments.forEach(c => {
        if (c.user._id.toString() === userId.toString() || (currentUser && currentUser.role == 'admin')) {
          var trashIcon = `<span class='fal fa-trash' onclick='deleteComment("${c._id}", "${postId}")'></span>`
        } else {
          var trashIcon = ''
        }
        list.innerHTML += `<div class="comment" id="comment-${c._id}">
                                  <img src="${c.user.profile ? c.user.profile : '/images/user.png'}" alt="" onclick="window.location.href='/${c.user.username}'" class="user-profile">
                                  <div class="comment-info">
                                  <p class="name" onclick="window.location.href='/${c.user.username}'">${c.user.name} &nbsp; <span class="time">${c.timeAgo}</span></p>
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

async function submitComment(postId, isHomePage = true) {
  document.querySelector('#newCommentBtn').disabled = true;
  var text = document.getElementById('new-comment').value;
  var res = await fetch(`/post/${postId}/new/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  var data = await res.json()
  if (data.success) {
    if (isHomePage) {
      loadComments(postId);
      document.getElementById('new-comment').value = ''
      var id = `comment-btn-${postId}`
      document.getElementById(id).innerHTML = `<span class="fal fa-message-lines"></span>${data.commentsLength}`
    } else {
      window.location.reload()
    }
    document.querySelector('#newCommentBtn').disabled = false;
  } else {
    Toast('Failed to add comment! Please try again later.', 'error')
    document.querySelector('#newCommentBtn').disabled = false;
  }
}

async function deleteComment(commentId, postId, isHomePage = true) {
  var conf = confirm('Are you sure you want to delete this comment?')
  if (!conf) {
    return
  }
  var res = await fetch(`/post/${postId}/comment/${commentId}/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  var data = await res.json();
  if (data.success) {
    if (isHomePage) {
      loadComments(postId);
      var id = `comment-btn-${postId}`
      document.getElementById(id).innerHTML = `<span class="fal fa-message-lines"></span>${data.commentsLength}`
    } else {
      document.getElementById(`comment-${commentId}`).style.display = 'none'
    }
  } else {
    Toast('Failed to delete comment! Please try again later.', 'error')
  }
}
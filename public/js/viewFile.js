document.addEventListener('DOMContentLoaded', () => {
  const popup = document.querySelector('.view-file-popup');
  if (!popup) return;

  popup.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    switch (action) {
      case 'like':
        likeFile(FILE_ID);
        break;
      case 'comment':
        openComments(FILE_ID);
        break;
      case 'share':
        const thumbnail = target.dataset.thumbnail;
        shareImage(FILE_ID, thumbnail);
        break;
    }
  });

  navigator.sendBeacon('/api/analytics/addFileView', JSON.stringify({ fileId: FILE_ID }));

  const newCommentBtn = document.getElementById('newCommentBtn');
  if (newCommentBtn) {
    newCommentBtn.addEventListener('click', () => submitComment(FILE_ID));
  }
});

async function likeFile(fileId) {
  if (!USER_ID) return alert("Please login to like this file")

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

async function submitComment(fileId) {
  const commentBtn = document.getElementById('newCommentBtn');
  const commentInput = document.getElementById('new-comment');
  const text = commentInput.value;

  if (!text) return;

  commentBtn.disabled = true;

  try {
    const res = await fetch(`/file/${fileId}/new/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (data.success) {
      commentInput.value = '';
      openComments(fileId);
    } else {
      Toast('Failed to add comment!', 'error');
    }
  } catch (error) {
    Toast('An error occurred.', 'error');
  } finally {
    commentBtn.disabled = false;
  }
}

async function deleteFileComment(commentId, fileId) {
  if (!confirm('Are you sure you want to delete this comment?')) return;

  const res = await fetch(`/file/${fileId}/comment/${commentId}/delete`, { method: 'POST' });
  const data = await res.json();
  if (data.success) {
    Toast('Comment deleted!', 'success');
    openComments(fileId);
  } else {
    Toast('Failed to delete comment.', 'error');
  }
}

async function openComments(fileId) {
  const commentsPopup = document.getElementById('comments-popup');
  commentsPopup.classList.add('show');
  document.getElementById('new-comment').value = '';

  const list = document.getElementById('comments-list');
  list.innerHTML = '';
  list.innerHTML = `<div id="comments-loader">
      <div class="comments-loader-text" id="comments-loader-text">
        <span class="letter" style="animation-delay: 0s"><span class='letter-blue'>2</span></span>
        <span class="letter" style="animation-delay: 0.15s"><span class='letter-green'>k</span></span>
        <span class="letter" style="animation-delay: 0.3s"><span class='letter-red'>1</span></span>
        <span class="letter" style="animation-delay: 0.45s"><span class='letter-yellow'>7</span></span>
      </div>
      </div>`

  const res = await fetch(`/file/${fileId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const comments = await res.json();

  if (comments.length > 0) {
    list.innerHTML = ''; 
    comments.forEach(c => {
      const isOwner = (USER_ID && c.user._id.toString() === USER_ID.toString()) || currentUser.role == 'admin';
      const trashIcon = isOwner ? `<span class='fal fa-trash' onclick='deleteFileComment("${c._id}", "${fileId}")'></span>` : '';
      list.innerHTML += `
                <div class="comment" id="comment-${c._id}">
                    <img src="${c.user.profile || '/images/user.png'}" alt="" class="user-profile">
                    <div class="comment-info">
                        <p class="name">${c.user.name} &nbsp; <span class="time">${c.timeAgo || 'moments ago'}</span></p>
                        <span class="text">${c.text}</span>
                    </div>
                    <div class="action-buttons">${trashIcon}</div>
                </div>`;
    });
  } else {
    list.innerHTML = "<p style='color: var(--text-muted); margin-top: 0'>No comments yet.</p>";
  }
}

function closeComments() {
  const commentsPopup = document.getElementById('comments-popup');
  commentsPopup.classList.remove('show');
}

async function shareImage(fileId, url) {
  try {
    const shareData = {
      title: 'Check out this memory!',
      text: 'See this memory I found on the 2k17 Platform.',
      url: `https://twok17.onrender.com/memories/file/${fileId}`
    };
    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      Toast('Web Share not supported on this browser.', 'info');
    }
  } catch (err) {
    console.error('Sharing failed', err);
  }
}

async function tagMemory(fileId) {
  if (USER_ID) {
    const tagBtn = document.getElementById('tagBtn');
    tagBtn.innerHTML = "Tagging..."
    tagBtn.disabled = true;
    const res = await fetch(`/file/${fileId}/tag`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      if (data.tag) {
        Toast('Memory tagged!', 'success');
        tagBtn.innerHTML = "Tagged successfully!"
      } else {
        Toast('Memory untagged!', 'success');
        tagBtn.innerHTML = "Untagged successfully!"
      }
    } else {
      Toast('Failed to tag memory.', 'error');
      tagBtn.innerHTML = "Tagging failed"
    }
  } else {
    alert("Please login to tag yourself in memories")
  }
}
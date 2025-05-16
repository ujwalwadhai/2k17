function getGreeting() {
  var now = new Date();
  var hours = now.getHours();

  if (hours >= 5 && hours < 12) {
    return "Good morning";
  } else if (hours >= 12 && hours < 17) {
    return "Good afternoon";
  } else if (hours >= 17 && hours < 21) {
    return "Good evening";
  } else {
    return "Welcome"; // No greeting (e.g., for night time)
  }
}

var greeting = getGreeting();
document.getElementById("greeting-msg").innerHTML = greeting;


async function toggleLike(postId) {
  try {
    var res = await fetch(`/post/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    var data = await res.json();
    if (!data.success) return alert('Failed to update like');

    // Update count
    var countElem = document.getElementById(`like-count-${postId}`);
    countElem.textContent = data.likesCount;

    // Toggle icon style
    var icon = document.getElementById(`like-icon-${postId}`);
    if (data.liked) {
      icon.classList.remove('fal');
      icon.classList.add('fas');
    } else {
      icon.classList.remove('fas');
      icon.classList.add('fal');
    }

  } catch (err) {
    console.error('Like error:', err);
    alert('Error while liking post');
  }
}

function hidePopup() {
  document.getElementById('comments-popup').style.display = 'none';
}


async function loadComments(postId, userId) {
  var commentsPopup = document.getElementById('comments-popup')
  commentsPopup.style.display = 'block';
  commentsPopup.querySelector('#newCommentBtn').removeEventListener('click', ()=> { submitComment(postId) })
  commentsPopup.querySelector('#newCommentBtn').addEventListener('click', ()=> { submitComment(postId) })
  document.getElementById('new-comment').value = ''
  var list = document.getElementById('comments-list');
  list.innerHTML = '';
  list.innerHTML = `<div id="comments-loader">
  <div class="comments-loader-text" id="comments-loader-text">
      <span class="letter" style="animation-delay: 0s"><span class='letter-blue'>2</span></span>
      <span class="letter" style="animation-delay: 0.15s"><span class='letter-green'>k</span></span>
      <span class="letter" style="animation-delay: 0.3s"><span class='letter-red'>1</span></span>
      <span class="letter" style="animation-delay: 0.45s"><span class='letter-yellow'>7</span></span>
  </div>
</div>`;
  var res = await fetch(`/post/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  var comments = await res.json();
  setTimeout(()=> {
    if(comments.length > 0){

      document.getElementById('comments-loader').classList.add('hidden');
      comments.forEach(c => {
        if(c.user._id.toString() === userId.toString()){
          var trashIcon = `<span class='fal fa-trash' onclick='deleteComment("${c._id}", "${postId}", "${userId}")'></span>`
        } else {
          var trashIcon = ''
        }
        list.innerHTML += `<div class="comment">
                                  <img src="${c.user.profilePicture ? c.user.profilePicture : '/images/user.png'}" alt="" class="user-profile">
                                  <div class="comment-info">
                                  <p class="name">${c.user.name} &nbsp; <span class="time">${c.timeAgo}</span></p>
                              <span class="text">${c.text}</span>
                            </div>
                            <div class="action-buttons">
                              <span class="fal fa-triangle-exclamation"></span>
                              ${trashIcon}
                            </div>
                          </div>`;
      });

      setTimeout(()=> {
        document.querySelectorAll('.comment').forEach(c => {
          c.style.display = 'flex'
        })
      }, 100)
    } else {
      list.innerHTML = "No comments yet"
    }
  }, 2500)
}


async function submitComment(postId, userId) {
  document.querySelector('#newCommentBtn').disabled = true;
  var text = document.getElementById('new-comment').value;
  var res = await fetch(`/post/${postId}/new/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  var data = await res.json()
  if (data.success){
    loadComments(postId, userId);
    document.getElementById('new-comment').value = ''
    var id = `comment-btn-${postId}`
    document.getElementById(id).innerHTML = `<span class="fal fa-comment"></span>${ data.commentsLength }`
    document.querySelector('#newCommentBtn').disabled = false;
  } else {
    alert('Failed to add comment! Please try again later.')
    document.querySelector('#newCommentBtn').disabled = false;
  }
}

async function deleteComment(commentId, postId, userId) {
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
    loadComments(postId, userId);
    var id = `comment-btn-${postId}`
    document.getElementById(id).innerHTML = `<span class="fal fa-comment"></span>${ data.commentsLength }`
  } else {
    console.log(JSON.stringify(data))
    alert('Failed to delete comment! Please try again later.')
  }
}
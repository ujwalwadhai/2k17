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
var greetingElement = document.getElementById("greeting-msg")
if (greetingElement) greetingElement.innerHTML = greeting;

async function sharePost(button) {
  var title = button.getAttribute('data-title');
  var text = button.getAttribute('data-text');
  var url = button.getAttribute('data-url');
  var media = button.getAttribute('data-media');

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url, media });
    } catch (err) {
    }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      prompt('Copy this link manually:', url);
    }
  }
}


async function toggleLike(postId) {
  try {
    var icon = document.getElementById(`like-icon-${postId}`);
    icon.classList.remove("fa-heart")
    icon.classList.add("fa-spinner-third")
    icon.classList.add("fa-spin")
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
    alert('Error while liking post');
  }
}

function hidePopup(popupId = 'comments-popup') {
  var commentsPopup = document.getElementById(popupId)
  var overlay = commentsPopup.querySelector('.overlay')
  commentsPopup.classList.remove('show');
  overlay.classList.remove('show');
}


async function loadComments(postId, userId = '') {
  var commentsPopup = document.getElementById('comments-popup')
  var overlay = document.getElementById('overlay')
  commentsPopup.classList.add('show');
  overlay.classList.add('show');


  commentsPopup.querySelector('#newCommentBtn').removeEventListener('click', () => { submitComment(postId) })
  commentsPopup.querySelector('#newCommentBtn').addEventListener('click', () => { submitComment(postId) })
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
  setTimeout(() => {
    if (comments.length > 0) {

      document.getElementById('comments-loader').classList.add('hidden');
      comments.forEach(c => {
        if (c.user._id.toString() === userId.toString()) {
          var trashIcon = `<span class='fal fa-trash' onclick='deleteComment("${c._id}", "${postId}", "${userId}")'></span>`
        } else {
          var trashIcon = ''
        }
        list.innerHTML += `<div class="comment" id="comment-${c._id}">
                                  <img src="${c.user.profilePicture ? c.user.profilePicture : '/images/user.png'}" alt="" onclick="window.location.href='/u/${c.user.username}'" class="user-profile">
                                  <div class="comment-info">
                                  <p class="name" onclick="window.location.href='/u/${c.user.username}'">${c.user.name} &nbsp; <span class="time">${c.timeAgo}</span></p>
                              <span class="text">${c.text}</span>
                            </div>
                            <div class="action-buttons">
                              <span class="fal fa-triangle-exclamation"></span>
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
  }, 2500)
}


async function submitComment(postId, userId, isHomePage = true) {
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
      loadComments(postId, userId);
      document.getElementById('new-comment').value = ''
      var id = `comment-btn-${postId}`
      document.getElementById(id).innerHTML = `<span class="fal fa-comment"></span>${data.commentsLength}`
    } else {
      alert('Comment added successfully')
      window.location.reload()
    }
    document.querySelector('#newCommentBtn').disabled = false;
  } else {
    alert('Failed to add comment! Please try again later.')
    document.querySelector('#newCommentBtn').disabled = false;
  }
}

async function deleteComment(commentId, postId, userId, isHomePage = true) {
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
      loadComments(postId, userId);
      var id = `comment-btn-${postId}`
      document.getElementById(id).innerHTML = `<span class="fal fa-comment"></span>${data.commentsLength}`
    } else {
      document.getElementById(`comment-${commentId}`).style.display = 'none'
    }
  } else {
    alert('Failed to delete comment! Please try again later.')
  }
}

function loadNotifications() {
  var notificationsPopup = document.getElementById('notifications-popup');
  var notificationsOverlay = document.querySelector('#notifications-popup .overlay');
  notificationsPopup.classList.add('show');
  notificationsOverlay.classList.add('show');
  var list = document.getElementById('notifications-list');
  list.innerHTML = '';
  list.innerHTML = `<div id="notifications-loader">
    <div class="notifications-loader-text" id="notifications-loader-text">
        <span class="letter" style="animation-delay: 0s"><span class='letter-blue'>2</span></span>
        <span class="letter" style="animation-delay: 0.15s"><span class='letter-green'>k</span></span>
        <span class="letter" style="animation-delay: 0.3s"><span class='letter-red'>1</span></span>
        <span class="letter" style="animation-delay: 0.45s"><span class='letter-yellow'>7</span></span>
    </div>
  </div>`;
  fetch('/notifications', {
    method: 'POST'
  })
    .then(res => res.json())
    .then(data => {
      setTimeout(() => {
        if (data.notifications.length > 0) {
          document.getElementById('notifications-loader').classList.add('hidden');
          fetch('/notifications/read', { method: "POST" })
          document.querySelectorAll('.fa-bell').forEach(el => {
            el.classList.remove('has-unread')
          })
          setTimeout(() => {
            data.notifications.forEach(n => {
              if (n.seen) {
                list.innerHTML += `<div class="notification" onclick="window.location.href = '${n.url}'">
          <img class="notification-img" src="${n.icon ? n.icon : ['like', 'comment'].includes(n.type) ? (n.user.profilePicture || '/images/user.png') : '/images/bell.png'}" alt="Icon">
          <div class="content">
            <div class="text">${['like', 'comment'].includes(n.type)
              ? `<a href='/u/${n.fromUser.username}'>${n.fromUser.username}</a>` 
              : '' } ${n.message}</div>
            <div class="time">${n.timeAgo}</div>
          </div>
          <div class="action-buttons">
            <span class="fal fa-triangle-exclamation grey-1"></span>
            <span class="fal fa-trash red"></span>
          </div>
        </div>`
              } else {
                list.innerHTML += `<div class="notification unread" onclick="window.location.href = '${n.url}'">
                        <img class="notification-img" src="${n.icon ? n.icon : ['like', 'comment'].includes(n.type) ? (n.user.profilePicture || '/images/user.png') : '/images/bell.png'}" alt="Icon">
                        <div class="content">
                          <div class="text">${['like', 'comment'].includes(n.type)
              ? `<a href='/u/${n.fromUser.username}'>${n.fromUser.username}</a>` 
              : '' } ${n.message}</div>
                          <div class="time">${n.timeAgo}</div>
                        </div>
                        <div class="action-buttons">
                          <span class="fal fa-triangle-exclamation grey-1"></span>
                          <span class="fal fa-trash red"></span>
                        </div>
                      </div>`
              }
            })
          }, 100)
        } else {
          list.innerHTML = `<div class="no-notifications grey-1">
          <span class="fal fa-bell-slash"></span><br><br>
          <p>No notifications yet!</p>
          </div>`
        }

      }, 2000)
    })
}

function closeNotifications() {
  var notificationsPopup = document.getElementById('notifications-popup');
  var notificationsOverlay = document.querySelector('#notifications-popup .overlay');
  notificationsPopup.classList.remove('show');
  notificationsOverlay.classList.remove('show');
}

function loadPosts(userId) {
  var posts = document.getElementById('posts');
  posts.innerHTML = '<p class="heading">Posts in last 6 months</p>';
  posts.innerHTML += `<div id="posts-loader">
    <div class="posts-loader-text" id="posts-loader-text">
        <span class="letter" style="animation-delay: 0s"><span class='letter-blue'>2</span></span>
        <span class="letter" style="animation-delay: 0.15s"><span class='letter-green'>k</span></span>
        <span class="letter" style="animation-delay: 0.3s"><span class='letter-red'>1</span></span>
        <span class="letter" style="animation-delay: 0.45s"><span class='letter-yellow'>7</span></span>
    </div>
  </div>`
  fetch('/posts', {
    method: 'POST'
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setTimeout(() => {
          if (data.posts.length > 0) {
            document.getElementById('posts-loader').classList.add('hidden');
            data.posts.forEach(post => {
              var isLiked = post.likes.includes(userId)
              if (post.media) {
                if (post.media.type.startsWith('image')) {
                  var mediaItem = `<img src="${post.media.url}" alt="" class="post-img">`
                } else if (post.media.type.startsWith('video')) {
                  var mediaItem = `<video controls class="post-video">
                  <source src="${post.media.url}" type="video/mp4">
                  Your browser does not support the video tag.
                </video>`
                } else {
                  var mediaItem = ``
                }
              } else {
                var mediaItem = ``
              }
              posts.innerHTML += `<div class="post" id="post-${post._id}">
            <div class="user-info">
              <img src="${post.author.profilePicture}" alt="" class="user-profile">
              <div class="user-info-helper" onclick="window.location.href='/u/${post.author.username}'">
                <span class="name" >${post.author.name}</span><br>
                <span class="username">@${post.author.username} (${post.timeAgo})</span>
              </div>
            </div>
            <div class="post-data">
              <p class="post-text">${post.text}</p>
              ${mediaItem}
            </div>
            <div class="post-buttons">
              <button class="like-btn" onclick="toggleLike('${post._id}')" id="like-btn-${post._id}">
                <span class="${isLiked ? 'fas' : 'fal'} fa-heart" id="like-icon-${post._id}"></span>
                <span id="like-count-${post._id}">${post.likes.length}</span>
              </button> &nbsp; 

              <button class="comment-btn" onclick="loadComments('${post._id}', '${userId}')" id="comment-btn-${post._id}"><span class="fal fa-messages"></span>${post.comments.length}</button>
              <div class="btns-right">
                <button class="report-btn"><span class="fal fa-triangle-exclamation"></span></button>
                <button class="share-btn" onclick="sharePost(this)" data-text="See this post by ${post.author.name} on 2k17" data-title="2k17 Platform" data-media="${post.media ? post.media.url : ''}" data-url="https://yourdomain.com/post/123"><span class="fal fa-share"></span></button>
                <button class="save-btn"><span class="fal fa-bookmark"></span></button>
              </div>
            </div>
          </div>`
            })
          } else {
            posts.innerHTML = `<div class="no-posts grey-1">
          <span class="fal fa-file-lines"></span><br><br>
          <p>No posts yet!</p>
          </div>`
          }
        }, 3000)
      } else {
        alert("Can't load posts at the moment. Please try again later.")
      }
    })
}



function openPostPopup() {
  document.getElementById('post-popup').classList.add('show');
  document.getElementById('post-text').focus();
}

function closePostPopup() {
  document.getElementById('post-popup').classList.remove('show');
}

function createPost(userId) {
  var text = document.getElementById('post-text').value;
  var media = document.getElementById('media-input').files;
  if (media.length > 0) {
    var formData = new FormData();
    formData.append('text', text);
    formData.append('media', media[0]);
    closePostPopup()
    alert("Uploading the file. Please wait...")
    fetch('/new/post/file?folder=posts', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.getElementById('post-text').value = '';
          document.getElementById('media-input').value = '';
          document.getElementById('media-preview').innerHTML = '';

          document.getElementById('posts').scrollIntoView({
            behavior: 'smooth'
          });
          loadPosts(userId)
        } else {
          alert("Can't create post at the moment. Please try again later.")
        }
      })
  } else {
    fetch('/new/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.getElementById('post-text').value = '';
          document.getElementById('media-input').value = '';
          document.getElementById('media-preview').innerHTML = '';
          closePostPopup()
          document.getElementById('posts').scrollIntoView({
            behavior: 'smooth'
          });
          loadPosts(userId);
        } else {
          alert("Can't create post at the moment. Please try again later.")
        }
      })
  }
}




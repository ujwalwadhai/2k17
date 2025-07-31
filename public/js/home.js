const userId = currentUser ? currentUser.id : null;

function partialLoader(id) {
  return `<div id="${id}">
  <div class="${id}-text" id="${id}-text">
      <span class="letter" style="animation-delay: 0s"><span class='letter-blue'>2</span></span>
      <span class="letter" style="animation-delay: 0.15s"><span class='letter-green'>k</span></span>
      <span class="letter" style="animation-delay: 0.3s"><span class='letter-red'>1</span></span>
      <span class="letter" style="animation-delay: 0.45s"><span class='letter-yellow'>7</span></span>
  </div>
</div>`
}

async function sharePost(button) {
  var title = button.getAttribute('data-title');
  var text = button.getAttribute('data-text');
  var url = button.getAttribute('data-url');
  var media = button.getAttribute('data-media');

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url, media });
    } catch (err) {
      console.log(err);
    }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      Toast('Link copied to clipboard!');
    } catch (err) {
      console.log(err);
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

function hidePopup(popupId = 'comments-popup') {
  var commentsPopup = document.getElementById(popupId)
  var overlay = commentsPopup.querySelector('.overlay')
  commentsPopup.classList.remove('show');
  overlay.classList.remove('show');
}

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
      document.getElementById(id).innerHTML = `<span class="fal fa-messages"></span>${data.commentsLength}`
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
      document.getElementById(id).innerHTML = `<span class="fal fa-messages"></span>${data.commentsLength}`
    } else {
      document.getElementById(`comment-${commentId}`).style.display = 'none'
    }
  } else {
    Toast('Failed to delete comment! Please try again later.', 'error')
  }
}

function loadNotifications() {
  var notificationsPopup = document.getElementById('notifications-popup');
  var notificationsOverlay = document.querySelector('#notifications-popup .overlay');
  notificationsPopup.classList.add('show');
  notificationsOverlay.classList.add('show');
  var list = document.getElementById('notifications-list');
  list.innerHTML = '';
  list.innerHTML = partialLoader('notifications-loader');
  fetch('/notifications', {
    method: 'POST'
  })
    .then(res => res.json())
    .then(data => {
      setTimeout(() => {
        if (data.notifications && data.notifications.length > 0) {
          document.getElementById('notifications-loader').classList.add('hidden');
          fetch('/notifications/read', { method: "POST" })
          document.querySelectorAll('.fa-bell').forEach(el => {
            el.classList.remove('has-unread')
          })
          setTimeout(() => {
            data.notifications.forEach(n => {
              if (n.seen) {
                list.innerHTML += `<div class="notification" onclick="window.location.href = '${n.url}'">
          <img class="notification-img" src="${n.icon ? n.icon : ['like', 'comment', 'mention'].includes(n.type) ? (n.fromUser.profile || '/images/user.png') : '/images/bell.png'}" alt="Icon">
          <div class="content">
            <div class="text">${['like', 'comment', 'mention'].includes(n.type)
                    ? `<a href='/${n.fromUser.username}'>${n.fromUser.username}</a>`
                    : ''} ${n.message}</div>
                    </div>

                    <div class="time">${n.timeAgo}</div>
          
        </div>`
              } else {
                list.innerHTML += `<div class="notification unread" onclick="window.location.href = '${n.url}'">
                        <img class="notification-img" src="${n.icon ? n.icon : ['like', 'comment', 'mention'].includes(n.type) ? (n.fromUser.profile || '/images/user.png') : '/images/bell.png'}" alt="Icon">
                        <div class="content">
                          <div class="text">${['like', 'comment', 'mention'].includes(n.type)
                    ? `<a href='/${n.fromUser.username}'>${n.fromUser.username}</a>`
                    : ''} ${n.message}</div>
                        </div>
                        
                    <div class="time">${n.timeAgo}</div>
          
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

      }, 500)
    })
}

function closeNotifications() {
  var notificationsPopup = document.getElementById('notifications-popup');
  var notificationsOverlay = document.querySelector('#notifications-popup .overlay');
  notificationsPopup.classList.remove('show');
  notificationsOverlay.classList.remove('show');
}

function loadPosts() {
  var posts = document.getElementById('posts');
  posts.innerHTML = '<p class="heading">Recent posts</p>';
  posts.innerHTML += partialLoader('posts-loader')
  fetch('/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setTimeout(() => {
          if (data.posts.length > 0) {
            document.getElementById('posts-loader').classList.add('hidden');
            data.posts.forEach(post => {
              var isLiked = post.likes.some(u => u._id.toString() === userId.toString())
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
              if (post.likes.length > 2) {
                var likedBy = `<p class="extend-like-msg"><img src="${post.likes[1].profile || '/images/user.png'}" alt="" class="user-profile"> Liked by <span style='margin: 0 3px' onclick='window.location.href="/${post.likes[1].username}"'> ${post.likes[1].username} </span> and <span style="margin: 0 3px" onclick="openPostLikes('${post._id}')">${post.likes.length - 1} others</span></p>`
              }
              if (post.author._id.toString() === userId.toString() || (currentUser && currentUser.role == 'admin')) {
                var trashIcon = `<span class="fal fa-trash red" aria-label="Delete this post" onclick="deletePost('${post._id}')"></span>`
              }
              posts.innerHTML += `<div class="post" id="post-${post._id}">
            <div class="user-info">
              <img src="${post.author.profile}" alt="" class="user-profile">
              <div class="user-info-helper" onclick="window.location.href='/${post.author.username}'">
                <span class="name" >${post.author.name}</span><br>
                <span class="username">@${post.author.username} (${post.timeAgo})</span>
              </div>
            </div>
            <div class="post-data"> 
              ${post.text}
              ${mediaItem}
            </div>
            <div class="post-buttons">
              <button class="like-btn" onclick="toggleLike('${post._id}')" id="like-btn-${post._id}">
                <span class="${isLiked ? 'fas' : 'fal'} fa-heart" id="like-icon-${post._id}"></span>
              </button> &nbsp; 

              <button class="comment-btn" onclick="loadComments('${post._id}')" id="comment-btn-${post._id}"><span class="fal fa-messages"></span>&nbsp; ${post.comments.length > 0 ? post.comments.length : ''}</button>
              <div class="btns-right">
              <button class="share-btn" onclick="sharePost(this)" data-text="See this post by ${post.author.name} on 2k17" data-title="2k17 Platform" data-media="${post.media ? post.media.url : ''}" data-url="https://twok17.onrender.com/post/${post._id}"><span class="fal fa-share"></span></button>
              ${trashIcon || ''}
              </div>
            </div>
            ${likedBy || ''}
          </div>`
            })
          } else {
            posts.innerHTML = `<div class="no-posts grey-1">
          <span class="fal fa-file-lines"></span><br><br>
          <p>No posts yet!</p>
          </div>`
          }
        }, 500)
      } else {
        Toast("Can't load posts at the moment. Please try again later.", 'error')
      }
    })
}

let quill;

// This function should be called when your popup opens, or on page load.
function initializeQuillEditor() {
  // Prevent re-initializing
  if (quill) return;

  quill = new Quill('#editor', {
    theme: 'snow', // Use the 'snow' theme for a clean toolbar
    placeholder: 'Say hi to everyone...',
    modules: {
      // Configure the toolbar for bold, italics, underline, and links
      toolbar: [
        ['bold', 'italic', 'underline'],
        ['link']
      ]
    }
  });
}

function openPostPopup() {
  document.getElementById('post-popup').classList.add('show');
  initializeQuillEditor()
  document.getElementById('editor').focus();
}

function closePostPopup() {
  document.getElementById('post-popup').classList.remove('show');
}

function createPost() {
  const contentHTML = quill.root.innerHTML;
  var media = document.getElementById('media-input').files;
  if (contentHTML === '<p><br></p>' && !media) {
    alert('Your post cannot be empty!');
    return;
  }
  document.getElementById('hiddenContent').value = contentHTML;

  if (media.length > 0) {
    var formData = new FormData();
    formData.append('text', contentHTML);
    formData.append('media', media[0]);
    closePostPopup()
    Toast("Uploading the file. Please wait...", 'info')
    fetch('/new/post/file?folder=posts', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.getElementById('editor').innerHTML = ''; 
          document.getElementById('media-input').value = '';
          document.getElementById('media-preview').innerHTML = '';

          document.getElementById('posts').scrollIntoView({
            behavior: 'smooth'
          });
          loadPosts()
        } else {
          Toast("Can't create post at the moment. Please try again later.", 'error')
        }
      })
  } else {
    fetch('/new/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: contentHTML })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.getElementById('editor').innerHTML = '';
          document.getElementById('media-input').value = '';
          document.getElementById('media-preview').innerHTML = '';
          closePostPopup()
          document.getElementById('posts').scrollIntoView({
            behavior: 'smooth'
          });
          loadPosts();
        } else {
          Toast("Can't create post at the moment. Please try again later.", 'error')
        }
      })
  }
}

function deletePost(postId) {
  var conf = confirm("Are you sure you want to delete this post?");
  if (!conf) return
  fetch(`/post/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ postId })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        Toast("Post deleted!", "success")
        loadPosts()
      } else {
        Toast("Can't delete post. Try again later.", 'error')
      }
    })
}

function checkUsername(el) {
  el.value = el.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
  var status_message = document.getElementById("choose-username-status");
  if (el.value) {
    status_message.innerHTML = "Checking username availability...";
    setTimeout(() => {
      fetch('/check/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: el.value
        })
      }).then((res) =>
        res.json()
      ).then((data) => {
        if (data.success) {
          status_message.innerHTML = "<span class='green'>Username available!</span>";
        } else {
          status_message.innerHTML = "<span class='red'>Username already taken!</span>";
        }
      })
    }, 500)
  } else {
    status_message.innerHTML = "<span class='grey-1'>Enter username to check</span>";
  }


}

var usernameform = document.getElementById("choose-username-form");

if (usernameform) {
  document.getElementById("choose-username-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var statusBox = document.getElementById("choose-username-status");
    statusBox.style.color = "green";
    statusBox.innerHTML = "<span class='fal fa-rotate fa-circle-notch'><span> &nbsp;Updating...";
    var data = {
      username: this.elements['username'].value
    };

    fetch("/profile/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          statusBox.innerHTML = "<i class='fal fa-check-circle'></i> &nbsp;Username added!";
          setTimeout(closeChooseUsername, 2000);
        } else {
          statusBox.style.color = "red";
          statusBox.innerHTML = `<i class='fal fa-times-circle'></i> &nbsp;${data.message || 'Failed to add username'}`;
        }
      })
      .catch(err => {
        console.log(err);
        statusBox.style.color = "red";
        statusBox.innerHTML = "<i class='fal fa-times-circle'></i> &nbsp;Something went wrong.";
      });
  });
}

async function openPostLikes(postId) {
  var PostLikesPopup = document.getElementById('post-likes-popup');
  var PostLikesOverlay = PostLikesPopup.querySelector('.overlay');
  var res = await fetch(`/post/${postId}/likes`)
  var data = await res.json()
  PostLikesPopup.querySelector('.post-likes-list').innerHTML = '';
  if (data.success) {
    data.likes.forEach(like => {
      var li = document.createElement('li');
      li.innerHTML = `<a href="/${like.username}"><img src="${like.profile || '/images/user.png'}" alt="${like.username}">${like.username}</a>`;
      PostLikesPopup.querySelector('.post-likes-list').appendChild(li);
    })
    PostLikesPopup.classList.add('show');
    PostLikesOverlay.classList.add('show');
  } else {
    alert("Can't fetch likes at the moment. Please try again later.")
  }
}

function closePostLikes() {
  var PostLikesPopup = document.getElementById('post-likes-popup');
  var PostLikesOverlay = PostLikesPopup.querySelector('.overlay');
  PostLikesPopup.classList.remove('show');
  PostLikesOverlay.classList.remove('show');
}
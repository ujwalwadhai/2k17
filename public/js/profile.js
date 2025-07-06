document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
    var url = new URL(window.location);
    url.searchParams.set('s', btn.dataset.tab);
    window.history.pushState({}, '', url);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  var urlParams = new URLSearchParams(window.location.search);
  var s = urlParams.get('s');
  if (['about', 'media', 'posts'].includes(s)) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    var btn = document.getElementById(s);

    btn.classList.add('active');
    var tabId = s + "-tab"
    document.getElementById(tabId).classList.add('active');
  }
})


function showLoginBanner() {
  var popup = document.getElementById("login-banner")
  popup.classList.add("show");
  popup.querySelector(".overlay").classList.add("show");
}


async function openPostLikes(postId){
  var PostLikesPopup = document.getElementById('post-likes-popup');
  var PostLikesOverlay = PostLikesPopup.querySelector('.overlay');
  var res = await fetch(`/post/${postId}/likes`)
  var data = await res.json()
  if(data.success){
    data.likes.forEach(like=>{
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

function closePostLikes(){
  var PostLikesPopup = document.getElementById('post-likes-popup');
  var PostLikesOverlay = PostLikesPopup.querySelector('.overlay');
  PostLikesPopup.classList.remove('show');
  PostLikesOverlay.classList.remove('show');
}
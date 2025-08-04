function disableLoginUser(userId) {
    fetch('/admin/users/disablelogin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('user-action-btn').innerHTML = data.registered ? `<button id="user-disable-login-btn" class="btn btn-danger" onclick="disableLoginUser('${userId}')">Disable Login</button>` : `<button id="user-enable-login-btn" class="btn btn-success" onclick="disableLoginUser('${userId}')">Enable Login</button>`;
            } else {
                alert('Error: ' + data.message); 
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while disabling user.');
        });
}

function openUserInfo(userId) {
    const UserInfoPopup = document.getElementById('user-info-popup');
    const UserInfoOverlay = UserInfoPopup.querySelector('.overlay');
    UserInfoPopup.classList.add('show');
    UserInfoOverlay.classList.add('show');
    fetch(`/userinfo/${userId}`, {method: "POST", headers: {'Content-Type': 'application/json'}})
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.getElementById('user-profile').src = data.user?.profile || '/images/user.png';
                document.getElementById('user-id').textContent = userId;
                document.getElementById('user-name').textContent = data.user?.name || '-'
                document.getElementById('user-username').innerHTML = `<a href='/${data.user?.username || ''}'">${data.user?.username || '-'}</a>`;
                document.getElementById('user-email').innerHTML = `<a href='mailto:${data.user?.email || ''}'">${data.user?.email || '-'}</a>`;
                document.getElementById('user-phone').innerHTML = `<a href='tel:${data.user?.phone || ''}'">${data.user?.phone || '<span class="grey-1">No data available</span>'}</a>`;
                document.getElementById('user-dob').textContent = data.user?.dob || '-';
                document.getElementById('user-code').textContent = data.user?.code || '-';
                document.getElementById('user-gender').textContent = (data.user?.gender.charAt(0).toUpperCase() + data.user?.gender.slice(1)) || '<span class="grey-1">No data available</span>';
                document.getElementById('user-house').textContent = data.user?.house || '<span class="grey-1">No data available</span>';
                document.getElementById('user-joinedAt').textContent = data.user?.joinedAt ? new Date(data.user.joinedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
                if(data.user?.lastLogin){
                document.getElementById('user-lastLogin').innerHTML = data.user?.lastLogin ? new Date(data.user.lastLogin).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '<span class="grey-1">No data available</span>';
                }
                document.getElementById('user-action-btn').innerHTML = data.user?.registered ? `<button id="user-disable-login-btn" class="btn btn-danger" onclick="disableLoginUser('${userId}')">Disable Login</button>` : `<button id="user-enable-login-btn" class="btn btn-success" onclick="disableLoginUser('${userId}')">Enable Login</button>`;
            } else {
                alert("No user found")
            }
        }).catch(err => console.log(err))
}

function closeUserInfo() {
    var UserInfoPopup = document.getElementById('user-info-popup');
    var UserInfoOverlay = UserInfoPopup.querySelector('.overlay');
    UserInfoPopup.classList.remove('show');
    UserInfoOverlay.classList.remove('show');
}
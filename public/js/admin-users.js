function disableLoginUser(userId) {
    console.log(userId)
    fetch('/admin/users/disablelogin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: userId
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const userTable = document.getElementById('users-table');
            const userRows = userTable.querySelectorAll('tbody tr');
            const email = data.userData.email;

            for (let row of userRows) {
                const emailCell = row.querySelector('td[data-email]');
                console.log(emailCell)
                
                if (emailCell && emailCell.textContent.trim() === email) {
                    const action = row.querySelector('td[data-action]')
                    
                    if (action) {
                        if(data.registered){
action.innerHTML = `<button class="btn btn-primary" onclick="disableLoginUser('${userId}')">Disable Login</button>`;
                        } else {
                        action.innerHTML = `<button class="btn btn-primary" onclick="disableLoginUser('${userId}')">Enable Login</button>`;
                        }
                    }
                    break;
                }
            }
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while registering the user.');
    });
}
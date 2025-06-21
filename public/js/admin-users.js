function registerUser(userId) {
    console.log(userId)
    fetch('/admin/users/register', {
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
                        action.textContent = 'Yes';
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
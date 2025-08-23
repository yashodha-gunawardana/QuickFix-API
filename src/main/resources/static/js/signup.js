document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) {
        console.error('Signup form not found.');
        return;
    }

    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Signup failed: ' + res.statusText);
                }
                return res.json();
            })
            .then(data => {
                alert('Signup successful! Please log in.');
                window.location.href = 'login.html';
            })
            .catch(err => {
                console.error('Signup failed:', err);
                alert('Signup failed: ' + err.message);
            });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const resetForm = document.getElementById('resetPasswordForm');
    if (!resetForm) {
        console.error('Reset password form not found.');
        return;
    }

    resetForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token'); // Assumes reset link includes token

        if (newPassword !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        fetch('http://localhost:8080/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Password reset failed: ' + res.statusText);
                }
                return res.json();
            })
            .then(data => {
                alert('Password reset successful! Please log in.');
                window.location.href = 'login.html';
            })
            .catch(err => {
                console.error('Password reset failed:', err);
                alert('Password reset failed: ' + err.message);
            });
    });
});
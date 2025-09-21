document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (!email || !newPassword || !confirmPassword) {
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Fill all fields',
        });
    }
    if (newPassword !== confirmPassword) {
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Passwords do not match!',
        });
    }

    // Get token from URL
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Reset token missing!',
        });
    }

    // Show processing alert
    Swal.fire({
        title: 'Processing...',
        text: 'Please wait while we reset your password',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const res = await fetch('http://localhost:8080/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword, token })
        });
        const data = await res.json();
        Swal.close(); // Close processing alert
        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: data.message || 'Password reset successful!',
            }).then(() => {
                window.location.href = '/login.html';
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'Something went wrong!',
            });
        }
    } catch (err) {
        console.error('Error resetting password:', err);
        Swal.close(); // Close processing alert
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Server error! Please try again later.',
        });
    }
});
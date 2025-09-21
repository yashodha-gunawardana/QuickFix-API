document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (!email || !newPassword || !confirmPassword) return Swal.fire('Error', 'Fill all fields', 'error');
    if (newPassword !== confirmPassword) return Swal.fire('Error', 'Passwords do not match!', 'error');

    // Get token from URL
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) return Swal.fire('Error', 'Reset token missing!', 'error');

    try {
        const res = await fetch('http://localhost:8080/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword, token })
        });
        const data = await res.json();
        if (res.ok) {
            Swal.fire('Success', data.message || 'Password reset successful!', 'success')
                .then(() => window.location.href = '/login.html');
        } else {
            Swal.fire('Error', data.message || 'Something went wrong!', 'error');
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Server error!', 'error');
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    let username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    // Protect the dashboard
    if (!token || role !== 'CUSTOMER') {
        alert('Please log in as a customer to access this dashboard');
        window.location.href = 'login.html';
        return;
    }

    // Capitalize first letter
    if (username) {
        username = username.charAt(0).toUpperCase() + username.slice(1);
    }

    // Update welcome message
    const welcomeElement = document.querySelector('.welcome-user');
    if (welcomeElement) {
        welcomeElement.textContent = username || 'Customer';
    }

    // Update username in profile section
    const usernameElement = document.querySelector('.user-name');
    if (usernameElement) {
        usernameElement.textContent = username || 'Customer';
    }


});
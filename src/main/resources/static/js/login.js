document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Login form not found. Ensure the form has id="loginForm".');
        return;
    }

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(errorData => {
                        throw new Error('Login failed: ' + (errorData.message || res.statusText));
                    });
                }
                return res.json();
            })
            .then(data => {
                // Access the JwtResponse from ApiResponse.data
                const jwtResponse = data.data; // Unwrap the data field
                if (!jwtResponse || !jwtResponse.role) {
                    throw new Error('Invalid response: Role is missing');
                }

                localStorage.setItem('token', jwtResponse.token);
                localStorage.setItem('role', jwtResponse.role);
                localStorage.setItem('username', jwtResponse.username);

                // Redirect based on role
                switch (jwtResponse.role) {
                    case 'CUSTOMER':
                        window.location.href = 'customerDashboard.html';
                        break;
                    case 'SERVICE_PROVIDER':
                        window.location.href = 'serviceProviderDashboard.html';
                        break;
                    case 'ADMIN':
                        window.location.href = 'adminDashboard.html';
                        break;
                    default:
                        throw new Error('Unknown role: ' + jwtResponse.role);
                }
            })
            .catch(err => {
                console.error('Login failed:', err);
                alert('Login failed: ' + err.message);
            });
    });
});
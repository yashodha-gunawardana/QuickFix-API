document.addEventListener("DOMContentLoaded", function () {
    // Display username & role in header
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("jwtToken")

    if (username) {
        document.querySelectorAll(".welcome-user").forEach(el => {
            el.textContent = username;
        });
    }
    if (role) {
        document.getElementById("header-role").textContent = role;
    }

    // Page switching for sidebar links
    const customerLinks = document.querySelectorAll(".customer-links a");
    const pages = document.querySelectorAll(".page-content");

    customerLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const pageId = this.dataset.page;

            pages.forEach(p => p.classList.remove("active"));
            const activePage = document.getElementById(pageId);
            if (activePage) activePage.classList.add("active");

            customerLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");
        });
    });


    // Handle request provider button
    const requestProviderBtn = document.getElementById('request-provider-btn');
    if (requestProviderBtn) {
        requestProviderBtn.addEventListener('click', function() {
            if (!userId) {
                Swal.fire('Error', 'You must be logged in to make this request', 'error');
                return;
            }

            if (!token) {
                Swal.fire('Error', 'Authentication required. Please login again.', 'error');
                window.location.href = '/login.html';
                return;
            }

            Swal.fire({
                title: 'Become a Provider?',
                text: 'Do you want to request to become a service provider?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, request it!',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Send request to server
                    fetch('http://localhost:8080/api/customer/request-provider', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ userId: parseInt(userId) })
                    })
                    .then(response => {
                    if (!response.ok) {
                        if (response.status === 403) {
                            throw new Error('Access forbidden. Please check your permissions.');
                        }
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                    })

                    .then(data => {
                        if (data.message) {
                            Swal.fire('Success', data.message, 'success');
                        } else {
                            Swal.fire('Error', 'Something went wrong', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire('Error', 'Failed to send request', 'error');
                    });
                }
            });
        });
    }


    // Logout button
    const confirmLogout = document.getElementById('confirmLogout');
    if (confirmLogout) {
        confirmLogout.addEventListener('click', function() {
            localStorage.clear();
            window.location.href = '/login.html?mode=login';
        });
    }
});
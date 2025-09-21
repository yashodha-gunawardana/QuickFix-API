document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    // 1. LOGIN FORM HANDLER
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            // ----------- Validation ----------- //
            if (!email || !password) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Both email and password are required.'
                });
                return;
            }

            // Email format check
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please enter a valid email address.'
                });
                return;
            }

            // Password length check
            if (password.length < 6) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Password must be at least 6 characters long.'
                });
                return;
            }


            // ----------- API CALL ----------- //
            try {
                const res = await fetch("http://localhost:8080/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                // Safe JSON parse (handle non-JSON errors)
                let body;
                const text = await res.text();
                try {
                    body = text ? JSON.parse(text) : {};
                } catch (parseErr) {
                    throw new Error('Invalid server response: ' + text.substring(0, 100));
                }

                if (res.status !== 200) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Failed',
                        text: body.message || "Login failed"
                    });
                    return;
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Login Successful!',
                    text: body.message || "You are now logged in."
                });

                console.log("Login response:", body);

                loginForm.reset();

                if (body.data) {
                    // Save token + user info
                    localStorage.setItem("jwtToken", body.data.token);
                    localStorage.setItem("role", body.data.role);   // CUSTOMER / SUPER_ADMIN / PROVIDER
                    localStorage.setItem("username", body.data.username);
                    localStorage.setItem("email", body.data.email);
                    localStorage.setItem("userId", body.data.userId);

                    // Redirect based on role
                    setTimeout(() => {
                        if (body.data.role === "SUPER_ADMIN") {
                            window.location.href = "/adminDashboard.html";
                        } else if (body.data.role === "CUSTOMER") {
                            window.location.href = "/customerDashboard.html";
                        } else if (body.data.role === "PROVIDER") {
                            window.location.href = "/providerDashboard.html";
                        } else {
                            window.location.href = "/index.html"; // fallback
                        }
                    }, 1000);
                }
            } catch (err) {
                console.error("Error during login:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Login Error',
                    text: err.message || "Login failed, please check your email and password."
                });
            }
        });
    }
});

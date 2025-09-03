document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    // 1. LOGIN FORM HANDLER
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            try {
                const res = await fetch("http://localhost:8080/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const body = await res.json();

                if (res.status !== 200) {
                    showAlert(body.message || "Login failed", "error");
                    return;
                }

                showAlert(body.message || "Login successful!", "success");
                console.log("Login response:", body);

                if (body.data) {
                    // Save token + user info
                    localStorage.setItem("jwtToken", body.data.token);
                    localStorage.setItem("role", body.data.role);   // CUSTOMER / SUPER_ADMIN
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
                showAlert(err.message || "Login failed, please check your email and password.", "error");
            }
        });
    }
});

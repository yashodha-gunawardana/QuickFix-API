document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signupForm");
    if (!signupForm) {
        console.warn("signupForm not found in DOM!");
        return;
    }

    signupForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = document.getElementById("signupUsername").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value.trim();

        // ------------ validation -------------- //
        if (!username || !email || !password) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'All fields are required.'
            });
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid email address.'
            });
            return;
        }

        // Show success immediately after clicking signup
        Swal.fire({
            icon: 'success',
            title: 'Signup Successful!',
            text: 'Your account has been created. Please login.'
        }).then(() => {
            signupForm.reset();

            // Switch to login view
            document.querySelector(".register").classList.remove("active");
            document.querySelector(".login").classList.add("active");
        });

        // Optionally, still send data to the backend
        try {
            const res = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();
            console.log("Signup response:", data);
        } catch (err) {
            console.error("Error sending signup data:", err);
        }
    });
});

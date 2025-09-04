document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signupForm");
    if (!signupForm) {
        console.warn("signupForm not found in DOM!");
        return;
    }

    signupForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const username = document.getElementById("signupUsername").value;
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;

        // ------------ validation -------------- //
        if (!username || !email || !password) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'All fields are required.'
            });
            return;
        }

        // email format check
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid email address.'
            });
            return;
        }

        // password check
        if (password.length < 6) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Password must be at least 6 characters long.'
            });
            return;
        }

        // if validation passed, send request
        try {
            const res = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Signup Failed',
                    text: data.message || 'Signup failed, try again.'
                });
                return;
            }

            Swal.fire({
                icon: 'success',
                title: 'Signup Successful!',
                text: data.message || 'Your account has been created. Please login.'
            }).then(() => {

                signupForm.reset();

                // Switch to login view
                document.querySelector(".register").classList.remove("active");
                document.querySelector(".login").classList.add("active");
            });

            console.log("Signup response:", data);

        } catch (err) {
            console.error("Error during signup:", err);
            Swal.fire({
                icon: 'error',
                title: 'Signup Error',
                text: 'Something went wrong. Please try again later.'
            });
        }

    });
});


document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signupForm");
    if (!signupForm) {
        console.warn("signupForm not found in DOM!");
        return;
    }

    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("signupUsername").value;
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;

        fetch("http://localhost:8080/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        })
            .then(res => {
                if (!res.ok) throw new Error("Signup failed");
                return res.json();
            })
            .then(data => {
                showAlert(data.message || "Signup successful! Please login.", "success");
                console.log("Signup response:", data);
                document.querySelector(".register").classList.remove("active");
                document.querySelector(".login").classList.add("active");
            })
            .catch(err => {
                console.error(err);
                showAlert("Signup failed, try again.", "error");
            });
    });
});


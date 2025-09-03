document.addEventListener("DOMContentLoaded", function () {

    //  1. Check login & get token
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        alert("Please log in first!");
        window.location.href = "/login.html";
        return;
    }

    // 2. Display username & role in header
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    if (username) document.querySelector(".welcome-user").textContent = username;
    if (role) document.getElementById("header-role").textContent = role;

    // 3. Page switching for sidebar links
    const customerLinks = document.querySelectorAll(".customer-links a");
    const pages = document.querySelectorAll(".page-content");

    customerLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const pageId = this.dataset.page;

            pages.forEach(p => p.classList.remove("active")); // hide all pages
            const activePage = document.getElementById(pageId);
            if (activePage) activePage.classList.add("active");

            customerLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // 3. Call protected API example
    fetch("http://localhost:8080/api/some-protected-endpoint", {
        method: "GET",
        headers: { "Authorization": "Bearer " + token }
    })
        .then(res => res.json())
        .then(data => console.log("Protected data:", data))
        .catch(err => console.error("Error fetching protected API:", err));


    // 4. Logout AJAX
    const confirmLogout = document.getElementById('confirmLogout');
    if (confirmLogout) {
        confirmLogout.addEventListener('click', function () {
            localStorage.clear();
            window.location.href = '/login.html?mode=login';
        });
    }




});

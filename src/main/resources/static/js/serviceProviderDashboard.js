document.addEventListener("DOMContentLoaded", function () {
    // 1. Page switching for sidebar links
    const providerLinks = document.querySelectorAll(".provider-links a");
    const pages = document.querySelectorAll(".page-content");

    providerLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const pageId = this.dataset.page;

            pages.forEach(p => p.classList.remove("active")); // hide all pages
            const activePage = document.getElementById(pageId);
            if (activePage) activePage.classList.add("active");

            providerLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");
        });
    });


    // 2. Logout AJAX
    const confirmLogout = document.getElementById('confirmLogout');
    if (confirmLogout) {
        confirmLogout.addEventListener('click', function () {
            localStorage.clear();
            window.location.href = '/login.html?mode=login';
        });
    }



});

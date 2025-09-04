document.addEventListener("DOMContentLoaded", function () {

    // ------------- user info setup -------------
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("jwtToken");

    // Check authentication & role
    if (!token || !userId || role !== "SUPER_ADMIN") {
        Swal.fire({
            icon: 'warning',
            title: 'Not Logged In',
            text: 'Please log in as an admin!',
        }).then(() => {
            window.location.href = "/login.html";
        });
        return;
    }

    // Display username and role
    if (username) {
        document.querySelectorAll(".welcome-user").forEach(el => el.textContent = username);
        document.querySelectorAll(".user-name").forEach(el => el.textContent = username);
    }
    if (role && document.getElementById("header-role")) {
        document.getElementById("header-role").textContent = role;
    }

    // ------------- sidebar page switching --------------
    const adminLinks = document.querySelectorAll(".admin-links a");
    const pages = document.querySelectorAll(".page-content");

    adminLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const pageId = this.dataset.page;

            // Show selected page
            pages.forEach(p => p.classList.remove("active"));
            const activePage = document.getElementById(pageId);
            if (activePage) activePage.classList.add("active");

            // Highlight selected link
            adminLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");

            // Load page-specific data
            if (pageId === "admin-dashboard") loadPendingRequests();
            else if (pageId === "admin-notifications") loadNotifications();
        });
    });

    // -------------- pending requests ----------------
    async function loadPendingRequests() {
        try {
            const res = await fetch("http://localhost:8080/api/admin/pending-requests", {
                headers: { Authorization: "Bearer " + token }
            });
            const requests = await res.json();

            const tableBody = document.getElementById("pending-requests-table");
            if (!tableBody) return;
            tableBody.innerHTML = "";

            if (!requests || requests.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No pending requests</td></tr>`;
                return;
            }

            requests.forEach(request => {
                const row = document.createElement("tr");
                const actionButtons = request.status === "PENDING" ? `
                    <button class="btn btn-success btn-sm approve-btn" data-id="${request.requestId}">Approve</button>
                    <button class="btn btn-danger btn-sm reject-btn" data-id="${request.requestId}">Reject</button>
                ` : '';
                row.innerHTML = `
                    <td>${request.requestId}</td>
                    <td>${request.name}</td>
                    <td>${request.currentRole || "Customer"}</td>
                    <td><span class="badge badge-${request.status.toLowerCase()}">${request.status}</span></td>
                    <td>${request.requestedRole}</td>
                    <td>${new Date(request.requestDate).toLocaleDateString()}</td>
                    <td>${actionButtons}</td>
                `;
                tableBody.appendChild(row);
            });

            // Attach approve/reject events
            document.querySelectorAll(".approve-btn").forEach(btn =>
                btn.addEventListener("click", () => approveRequest(btn.dataset.id))
            );
            document.querySelectorAll(".reject-btn").forEach(btn =>
                btn.addEventListener("click", () => rejectRequest(btn.dataset.id))
            );
        } catch (err) {
            console.error("Error loading pending requests:", err);
        }
    }

    async function approveRequest(requestId) {
        try {
            const res = await fetch(`http://localhost:8080/api/admin/approve-requests/${requestId}`, {
                method: "POST",
                headers: { Authorization: "Bearer " + token }
            });
            const message = await res.text();
            Swal.fire("Success", message, "success");
            loadPendingRequests();
            loadNotifications();
        } catch (err) {
            console.error("Error approving request:", err);
            Swal.fire("Error", "Failed to approve request", "error");
        }
    }

    async function rejectRequest(requestId) {
        try {
            const res = await fetch(`http://localhost:8080/api/admin/reject-request/${requestId}`, {
                method: "POST",
                headers: { Authorization: "Bearer " + token }
            });
            const message = await res.text();
            Swal.fire("Info", message, "info");
            loadPendingRequests();
            loadNotifications();
        } catch (err) {
            console.error("Error rejecting request:", err);
            Swal.fire("Error", "Failed to reject request", "error");
        }
    }

    // ---------------- notifications ---------------
    async function loadNotifications() {
        try {
            // Fetch unread count for badges
            const countRes = await fetch(`http://localhost:8080/api/notifications/user/${userId}/count`, {
                headers: { Authorization: "Bearer " + token }
            });
            const { count } = await countRes.json();

            // Sidebar + Header badges
            const headerBadge = document.getElementById("header-notification-badge");
            const sidebarBadge = document.querySelector('li.admin-links a[data-page="admin-notifications"] .badge');

            if (headerBadge) {
                headerBadge.textContent = count;
                headerBadge.style.display = count > 0 ? "flex" : "none";
            }
            if (sidebarBadge) {
                sidebarBadge.textContent = count;
                sidebarBadge.style.display = count > 0 ? "inline-block" : "none";
            }

            // Fetch all notifications for list
            const allRes = await fetch(`http://localhost:8080/api/notifications/user/${userId}/all`, {
                headers: { Authorization: "Bearer " + token }
            });
            const allNotifications = await allRes.json();

            // Notification list in page
            const notificationList = document.querySelector("#admin-notifications .notification-list");
            if (!notificationList) return;
            notificationList.innerHTML = "";

            if (!allNotifications || allNotifications.length === 0) {
                notificationList.innerHTML = '<li class="text-center p-4">No notifications</li>';
                return;
            }

            allNotifications.forEach(n => {
                const li = document.createElement("li");
                li.className = "notification-item";
                li.setAttribute("data-id", n.id);

                let iconClass = "info", icon = "fas fa-info-circle";
                if (n.type === "PROVIDER_REQUEST") {
                    iconClass = "warning";
                    icon = "fas fa-exclamation-triangle";
                } else if (n.type === "PROVIDER_APPROVED") {
                    iconClass = "success";
                    icon = "fas fa-check-circle";
                } else if (n.type === "PROVIDER_REJECTED") {
                    iconClass = "danger";
                    icon = "fas fa-times-circle";
                }

                li.innerHTML = `
                    <div class="notification-icon ${iconClass}">
                        <i class="${icon}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${n.type.replace("_", " ")}</div>
                        <div class="notification-desc">${n.message}</div>
                        <div class="notification-time">${new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    <div class="notification-actions">
                        ${!n.isRead ? `<button class="btn btn-sm btn-outline-secondary mark-as-read">Mark as read</button>` : ''}
                    </div>
                `;
                notificationList.appendChild(li);
            });

            // Mark as read
            document.querySelectorAll(".mark-as-read").forEach(btn =>
                btn.addEventListener("click", async function () {
                    const id = this.closest(".notification-item").dataset.id;
                    try {
                        await fetch(`http://localhost:8080/api/notifications/${id}/read`, {
                            method: "POST",
                            headers: { Authorization: "Bearer " + token }
                        });
                        loadNotifications();
                    } catch (err) {
                        console.error("Error marking notification as read:", err);
                    }
                })
            );

            // Mark all as read button
            const markAllBtn = document.querySelector('#admin-notifications .mark-all-read');
            if (markAllBtn) {
                markAllBtn.addEventListener("click", async () => {
                    try {
                        await fetch(`http://localhost:8080/api/notifications/user/${userId}/read-all`, {
                            method: "POST",
                            headers: { Authorization: "Bearer " + token }
                        });
                        loadNotifications();
                    } catch (err) {
                        console.error("Error marking all notifications as read:", err);
                    }
                });
            }
        } catch (err) {
            console.error("Error loading notifications:", err);
        }
    }

    // ------------ init + refresh --------------
    if (document.getElementById("admin-dashboard")?.classList.contains("active")) loadPendingRequests();
    if (document.getElementById("admin-notifications")?.classList.contains("active")) loadNotifications();
    loadNotifications(); // load on dashboard entry

    setInterval(() => {
        loadNotifications();
        loadPendingRequests();
    }, 30000);

    // Bell icon → switch to notifications page
    const bell = document.querySelector(".notification-bell");
    if (bell) {
        bell.addEventListener("click", () => {
            document.querySelectorAll(".page-content").forEach(p => p.classList.remove("active"));
            const notifPage = document.getElementById("admin-notifications");
            if (notifPage) {
                notifPage.classList.add("active");
                loadNotifications();
            }
        });
    }

    // --------------- logout -------------------
    const confirmLogout = document.getElementById("confirmLogout");
    if (confirmLogout) {
        confirmLogout.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "/login.html?mode=login";
        });
    }
});
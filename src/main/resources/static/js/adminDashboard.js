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

    // Current states for users and jobs
    let currentUserFilter = 'all';
    let currentUserSearch = '';
    let currentUserPage = 0;
    let currentUserSize = 10;
    let currentJobFilter = 'all';
    let currentJobPage = 0;
    let currentJobSize = 10;

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
            else if (pageId === "admin-manage-users") {
                loadUsers(currentUserPage, currentUserSize, currentUserFilter, currentUserSearch);
            } else if (pageId === "admin-manage-jobs") {
                loadAllJobs(currentJobPage, currentJobSize, currentJobFilter);
            }
        });
    });

    // -------------- pending requests ----------------
    async function loadPendingRequests() {
        try {
            const res = await fetch(`http://localhost:8080/api/admin/pending-requests`, {
                headers: { Authorization: "Bearer " + token }
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP error! Status: ${res.status}, ${errorText}`);
            }
            const requests = await res.json();
            console.log('Fetched requests:', requests);

            const tbody = document.querySelector('#admin-dashboard .pending-requests-table tbody');
            if (!tbody) {
                console.error('Table body not found');
                return;
            }
            tbody.innerHTML = "";

            if (!requests || requests.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No pending requests</td></tr>';
                return;
            }

            requests.forEach(request => {
                const row = document.createElement("tr");
                const actionButtons = request.status === "PENDING" ? `
                    <td>
                        <button class="btn btn-sm btn-success approve-btn" data-id="${request.requestId}">
                            <i class="fas fa-check"></i> Accept
                        </button>
                        <button class="btn btn-sm btn-danger reject-btn" data-id="${request.requestId}">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    </td>
                ` : '<td></td>';
                row.innerHTML = `
                    <td>${request.requestId || 'N/A'}</td>
                    <td>${request.username || 'Unknown User'}</td>
                    <td>${request.currentRole || 'Unknown'}</td>
                    <td><span class="badge-${request.status.toLowerCase()}">${request.status}</span></td>
                    <td>${request.requestedRole || 'N/A'}</td>
                    <td>${request.requestDate ? new Date(request.requestDate).toLocaleDateString() : 'N/A'}</td>
                    ${actionButtons}
                `;
                tbody.appendChild(row);
            });

            // Attach event listeners
            document.querySelectorAll(".approve-btn").forEach(btn =>
                btn.addEventListener("click", () => approveRequest(btn.dataset.id))
            );
            document.querySelectorAll(".reject-btn").forEach(btn =>
                btn.addEventListener("click", () => rejectRequest(btn.dataset.id))
            );
        } catch (err) {
            console.error("Error loading pending requests:", err.message);
            Swal.fire("Error", `Failed to load pending requests: ${err.message}`, "error");
        }
    }

    async function approveRequest(requestId) {
        Swal.fire({
            title: 'Processing...',
            text: 'Approving the request, please wait.',
            icon: 'info',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => { Swal.showLoading(); }
        });

        try {
            const res = await fetch(`http://localhost:8080/api/admin/approve-requests/${requestId}`, {
                method: "POST",
                headers: { Authorization: "Bearer " + token }
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to approve request: ${res.status}, ${errorText}`);
            }
            const message = await res.text();
            Swal.fire({
                icon: "success",
                title: "Success",
                text: message || "Request approved successfully",
                timer: 2000,
                showConfirmButton: false
            });
            await loadPendingRequests();
            await loadNotifications("all");
        } catch (err) {
            Swal.fire("Error", err.message || "Failed to approve request", "error");
        }
    }

    async function rejectRequest(requestId) {
        Swal.fire({
            title: 'Processing...',
            text: 'Rejecting the request, please wait.',
            icon: 'info',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => { Swal.showLoading(); }
        });

        try {
            const res = await fetch(`http://localhost:8080/api/admin/reject-request/${requestId}`, {
                method: "POST",
                headers: { Authorization: "Bearer " + token }
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to reject request: ${res.status}, ${errorText}`);
            }
            const message = await res.text();
            Swal.fire({
                icon: "info",
                title: "Request Rejected",
                text: message || "Request rejected successfully",
                timer: 2000,
                showConfirmButton: false
            });
            await loadPendingRequests();
            await loadNotifications("all");
        } catch (err) {
            Swal.fire("Error", err.message || "Failed to reject request", "error");
        }
    }

    // -------------- manage users ----------------
    async function loadUsers(page = 0, size = 10, filter = 'all', search = '') {
        try {
            let url = `http://localhost:8080/api/admin/all/users?page=${page}&size=${size}&filter=${filter}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            const res = await fetch(url, {
                headers: { Authorization: "Bearer " + token }
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to fetch users: ${res.status}, ${errorText}`);
            }
            const data = await res.json();
            const users = data.content || data;
            const totalElements = data.totalElements || users.length;
            const totalPages = data.totalPages || Math.ceil(totalElements / size);

            const tbody = document.querySelector('#admin-manage-users .users-table tbody');
            if (!tbody) return;
            tbody.innerHTML = "";

            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
            } else {
                users.forEach(user => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="https://via.placeholder.com/32" class="rounded-circle me-2" width="32" height="32" alt="">
                                <div>
                                    <div class="fw-bold">${user.username}</div>
                                    <div class="text-muted small">${user.email || 'N/A'}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="badge-info">${user.role === 'SUPER_ADMIN' ? 'ADMIN' : user.role}</span>
                        </td>
                        <td>
                            <span class="badge-secondary">${user.requestedRole || '-'}</span>
                        </td>
                        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                            <select class="status-select" data-id="${user.id}">
                                <option value="ACTIVE" ${user.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
                                <option value="SUSPENDED" ${user.status === 'SUSPENDED' ? 'selected' : ''}>Suspended</option>
                                <option value="PENDING" ${user.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                            </select>
                        </td>
                        <td>${user.postedJobCount || 0}</td>
                        <td>${user.acceptedJobCount || 0}</td>
                        <td>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-primary view-btn" data-id="${user.id}"><i class="fas fa-eye"></i></button>
                                <button class="btn btn-sm btn-warning edit-btn" data-id="${user.id}"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id}"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }

            // Update pagination
            updatePagination(page, totalPages, size, totalElements, loadUsers, "admin-manage-users", "users-pagination", "users-page-info");

            // Attach event listeners for dynamic updates
            document.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', async (e) => {
                    const id = e.target.dataset.id;
                    const status = e.target.value;
                    console.log("Updating user:", id, "to status:", status);
                    await updateUserField(id, { status });
                });
            });

            // View, Edit, Delete actions
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', () => viewUser(btn.dataset.id));
            });
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => editUser(btn.dataset.id));
            });
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteUser(btn.dataset.id));
            });
        } catch (err) {
            console.error("Error loading users:", err);
            Swal.fire("Error", "Failed to load users", "error");
        }
    }

    async function updateUserField(id, updates) {
        try {
            const res = await fetch(`http://localhost:8080/api/admin/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify(updates)
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to update user: ${res.status}, ${errorText}`);
            }
            Swal.fire("Success", "User updated successfully", "success");
            loadUsers(currentUserPage, currentUserSize, currentUserFilter, currentUserSearch);
        } catch (err) {
            Swal.fire("Error", "Failed to update user", "error");
        }
    }

    async function viewUser(id) {
        try {
            const res = await fetch(`http://localhost:8080/api/admin/users/${id}`, {
                headers: { Authorization: "Bearer " + token }
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to fetch user: ${res.status}, ${errorText}`);
            }
            const user = await res.json();

            Swal.fire({
                title: 'User Details',
                html: `
                    <p><strong>Username:</strong> ${user.username}</p>
                    <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
                    <p><strong>Role:</strong> ${user.role}</p>
                    <p><strong>Status:</strong> ${user.status}</p>
                    <p><strong>Join Date:</strong> ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Requested Role:</strong> ${user.requestedRole || '-'}</p>
                    <p><strong>Posted Jobs:</strong> ${user.postedJobCount || 0}</p>
                    <p><strong>Accepted Jobs:</strong> ${user.acceptedJobCount || 0}</p>
                `,
                confirmButtonText: 'Close'
            });
        } catch (err) {
            console.error("View user failed:", err);
            Swal.fire("Error", "Failed to view user", "error");
        }
    }

    async function editUser(id) {
        try {
            const res = await fetch(`http://localhost:8080/api/admin/users/${id}`, {
                headers: { Authorization: "Bearer " + token }
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to fetch user: ${res.status}, ${errorText}`);
            }
            const user = await res.json();
            Swal.fire({
                title: 'Edit User',
                html: `
                    <input id="swal-username" class="swal2-input" value="${user.username}" placeholder="Username">
                    <select id="swal-role" class="swal2-select">
                        <option value="CUSTOMER" ${user.role === 'CUSTOMER' ? 'selected' : ''}>Customer</option>
                        <option value="PROVIDER" ${user.role === 'PROVIDER' ? 'selected' : ''}>Provider</option>
                        <option value="SUPER_ADMIN" ${user.role === 'SUPER_ADMIN' ? 'selected' : ''}>Admin</option>
                    </select>
                    <select id="swal-status" class="swal2-select">
                        <option value="ACTIVE" ${user.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
                        <option value="SUSPENDED" ${user.status === 'SUSPENDED' ? 'selected' : ''}>Suspended</option>
                        <option value="PENDING" ${user.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                    </select>
                `,
                showCancelButton: true,
                confirmButtonText: 'Update',
                preConfirm: () => ({
                    username: document.getElementById('swal-username').value,
                    role: document.getElementById('swal-role').value,
                    status: document.getElementById('swal-status').value
                })
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await updateUserField(id, result.value);
                }
            });
        } catch (err) {
            Swal.fire("Error", "Failed to edit user", "error");
        }
    }

    async function deleteUser(id) {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will permanently delete the user!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`http://localhost:8080/api/admin/delete/${id}`, {
                        method: "DELETE",
                        headers: {
                            Authorization: "Bearer " + token,
                            "Content-Type": "application/json"
                        }
                    });
                    if (!res.ok) {
                        const errorText = await res.text();
                        throw new Error(`Failed to delete user: ${res.status}, ${errorText}`);
                    }
                    Swal.fire("Success", "User deleted successfully", "success");
                    loadUsers(currentUserPage, currentUserSize, currentUserFilter, currentUserSearch);
                } catch (err) {
                    console.error("Delete error:", err);
                    Swal.fire("Error", "Failed to delete user", "error");
                }
            }
        });
    }

    // User search and filters
    const userSearchInput = document.querySelector('#admin-manage-users .form-control');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', (e) => {
            let value = e.target.value.trim();
            currentUserSearch = value.length >= 3 ? value.substring(0, 3) : '';
            currentUserPage = 0;
            loadUsers(currentUserPage, currentUserSize, currentUserFilter, currentUserSearch);
        });
    }

    document.querySelectorAll('#admin-manage-users .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#admin-manage-users .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentUserFilter = btn.textContent.trim().toLowerCase().replace(' ', '-');
            currentUserPage = 0;
            loadUsers(currentUserPage, currentUserSize, currentUserFilter, currentUserSearch);
        });
    });

    // ----------------- Manage all jobs ---------------------------------
    async function loadAllJobs(page = 0, size = 10, filter = "all") {
        try {
            const url = `http://localhost:8080/api/admin/all/jobs?page=${page}&size=${size}&filter=${filter}`;
            const res = await fetch(url, {
                headers: { Authorization: "Bearer " + token }
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to fetch jobs: ${res.status}, ${errorText}`);
            }
            const data = await res.json();
            const jobs = data.content || [];
            const totalElements = data.totalElements ?? 0;
            const totalPages = data.totalPages ?? 1;

            const tableBody = document.getElementById("jobs-table");
            if (!tableBody) return;
            tableBody.innerHTML = "";

            if (!jobs || jobs.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="9" class="text-center">No jobs found</td></tr>`;
                return;
            }

            jobs.forEach(job => {
                const actionButtons = job.status === "PENDING" ? `
                    <button class="btn btn-sm btn-success approve-job-btn" data-id="${job.id}">Approve</button>
                    <button class="btn btn-sm btn-danger reject-job-btn" data-id="${job.id}">Reject</button>
                ` : '';
                const row = document.createElement("tr");
                row.setAttribute("data-status", job.status);
                row.innerHTML = `
                    <td>${job.id}</td>
                    <td>${job.title}</td>
                    <td>${job.category}</td>
                    <td>${job.location || "-"}</td>
                    <td>${job.customerEmail}</td>
                    <td>${job.budget ? "$" + job.budget : "-"}</td>
                    <td><span class="badge-${job.status.toLowerCase()}">${job.status}</span></td>
                    <td>${job.datePosted ? new Date(job.datePosted).toLocaleDateString() : "-"}</td>
                    <td>${actionButtons}</td>
                `;
                tableBody.appendChild(row);
            });

            // Update pagination
            updatePagination(page, totalPages, size, totalElements, loadAllJobs, "admin-manage-jobs", "jobs-pagination", "jobs-page-info");


            // Attach approve/reject events dynamically
            document.querySelectorAll(".approve-job-btn").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.dataset.id;
                    if (!id) return;

                    // Show processing SweetAlert
                    Swal.fire({
                        title: 'Processing...',
                        text: 'Approving job, please wait.',
                        allowOutsideClick: false,
                        didOpen: () => Swal.showLoading()
                    });

                    btn.disabled = true; // Prevent multiple clicks

                    try {
                        const res = await fetch(`http://localhost:8080/api/jobs/accept/${id}`, {
                            method: "POST",
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        if (!res.ok) {
                            const errorText = await res.text();
                            throw new Error(`Failed to approve job: ${res.status} ${errorText}`);
                        }

                        Swal.fire("Success", "Job approved successfully", "success");

                        // Remove buttons after approval
                        const row = btn.closest("tr");
                        if (row) {
                            const actionCell = row.querySelector("td:last-child");
                            if (actionCell) actionCell.innerHTML = ""; // hide buttons
                        }

                    } catch (err) {
                        console.error("Approval error:", err.message);
                        Swal.fire("Error", `Failed to approve job: ${err.message}`, "error");
                        btn.disabled = false;
                    }
                });
            });

            document.querySelectorAll(".reject-job-btn").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.dataset.id;
                    if (!id) return;


                    btn.disabled = true;

                    try {
                        const res = await fetch(`http://localhost:8080/api/jobs/reject/${id}`, {
                            method: "POST",
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        if (!res.ok) {
                            const errorText = await res.text();
                            throw new Error(`Failed to reject job: ${res.status} ${errorText}`);
                        }

                        Swal.fire("Success", "Job rejected successfully", "success");

                        // Remove buttons after rejection
                        const row = btn.closest("tr");
                        if (row) {
                            const actionCell = row.querySelector("td:last-child");
                            if (actionCell) actionCell.innerHTML = ""; // hide buttons
                        }

                    } catch (err) {
                        Swal.fire("Error", `Failed to reject job: ${err.message}`, "error");
                        btn.disabled = false;
                    }
                });
            });


        } catch (err) {
            console.error("Error loading jobs:", err);
            Swal.fire("Error", "Failed to load jobs", "error");
        }
    }

    // ------------- Filter buttons -------------
    const filterToggle = document.getElementById('filter-toggle');
    if (filterToggle) {
        filterToggle.addEventListener('click', function (e) {
            e.preventDefault();
            const filterContainer = document.getElementById('job-filters');
            if (filterContainer) {
                filterContainer.classList.toggle('show');
            }
        });
    }

    document.querySelectorAll('#admin-manage-jobs .filter-btn').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelectorAll('#admin-manage-jobs .filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentJobFilter = this.getAttribute('data-filter') || 'all';
            currentJobPage = 0;
            loadAllJobs(currentJobPage, currentJobSize, currentJobFilter);
        });
    });

    // ------------- pagination --------------
    function updatePagination(page, totalPages, size, totalElements, loadFunction, containerId, paginationId, pageInfoId) {
        const pagination = document.querySelector(`#${containerId} #${paginationId}`);
        if (!pagination) return;
        pagination.innerHTML = '';

        const ul = document.createElement('ul');
        ul.className = 'pagination';

        // -------- Prev Button --------
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${page === 0 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#">Prev</a>`;
        if (page > 0) {
            prevLi.addEventListener('click', (e) => {
                e.preventDefault();
                if (containerId === "admin-manage-users") {
                    loadFunction(page - 1, size, currentUserFilter, currentUserSearch);
                } else {
                    loadFunction(page - 1, size, currentJobFilter);
                }
            });
        }
        ul.appendChild(prevLi);

        // -------- Page Numbers (show all pages) --------
        for (let i = 0; i < totalPages; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === page ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
            if (i !== page) {
                pageLi.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (containerId === "admin-manage-users") {
                        loadFunction(i, size, currentUserFilter, currentUserSearch);
                    } else {
                        loadFunction(i, size, currentJobFilter);
                    }
                });
            }
            ul.appendChild(pageLi);
        }

        // -------- Next Button --------
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${page >= totalPages - 1 ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#">Next</a>`;
        if (page < totalPages - 1) {
            nextLi.addEventListener('click', (e) => {
                e.preventDefault();
                if (containerId === "admin-manage-users") {
                    loadFunction(page + 1, size, currentUserFilter, currentUserSearch);
                } else {
                    loadFunction(page + 1, size, currentJobFilter);
                }
            });
        }
        ul.appendChild(nextLi);

        pagination.appendChild(ul);

        // -------- Page Info --------
        const pageInfo = document.getElementById(pageInfoId);
        if (pageInfo) {
            const start = totalElements === 0 ? 0 : (page * size + 1);
            const end = Math.min((page + 1) * size, totalElements);
            pageInfo.textContent = `Showing ${start} to ${end} of ${totalElements} entries`;
        }
    }



    // ------------- notifications ---------------
    async function loadNotifications(filter = "all") {
        if (!token || !userId) return;

        try {
            // --- Update header and sidebar badge counts ---
            const countRes = await fetch(`http://localhost:8080/api/notifications/user/${userId}/count`, {
                headers: { Authorization: "Bearer " + token }
            });
            if (!countRes.ok) throw new Error(await countRes.text());
            const { count } = await countRes.json();

            const headerBadge = document.getElementById('header-notification-badge');
            const sidebarBadge = document.querySelector('.admin-links a[data-page="admin-notifications"] .badge');
            if (headerBadge) headerBadge.textContent = count;
            if (sidebarBadge) sidebarBadge.textContent = count;

            // --- Fetch all notifications ---
            const allRes = await fetch(`http://localhost:8080/api/notifications/user/${userId}/all`, {
                headers: { Authorization: "Bearer " + token }
            });
            if (!allRes.ok) throw new Error(await allRes.text());
            const allNotifications = await allRes.json();

            // --- Filter notifications based on selected tab ---
            let filteredNotifications = allNotifications;
            if (filter === "unread") filteredNotifications = allNotifications.filter(n => !n.isRead);
            if (filter === "system") filteredNotifications = allNotifications.filter(n => n.type === "SYSTEM");
            if (filter === "provider_request") filteredNotifications = allNotifications.filter(n => n.type === "PROVIDER_REQUEST");

            // --- Update filter badges ---
            const allCount = allNotifications.length;
            const unreadCount = allNotifications.filter(n => !n.isRead).length;
            const systemCount = allNotifications.filter(n => n.type === "SYSTEM").length;
            const providerRequestCount = allNotifications.filter(n => n.type === "PROVIDER_REQUEST").length;

            document.querySelectorAll('.job-filters .filter-tab').forEach(tab => {
                const tabFilter = tab.dataset.filter;
                tab.classList.toggle('active', tabFilter === filter);

                switch (tabFilter) {
                    case "all": tab.querySelector('.badge').textContent = allCount; break;
                    case "unread": tab.querySelector('.badge').textContent = unreadCount; break;
                    case "system": tab.querySelector('.badge').textContent = systemCount; break;
                    case "provider_request": tab.querySelector('.badge').textContent = providerRequestCount; break;
                }
            });

            // --- Render notifications ---
            const container = document.querySelector("#admin-notifications .notifications");
            container.innerHTML = "";

            if (!filteredNotifications.length) {
                container.innerHTML = '<div class="text-center p-4">No notifications</div>';
                return;
            }

            filteredNotifications.forEach(n => {
                const card = document.createElement("div");
                card.className = `notification-card ${n.isRead ? '' : 'unread'}`;
                card.dataset.id = n.id;

                const iconMap = {
                    "PROVIDER_REQUEST": { class: "warning", icon: "fas fa-briefcase" },
                    "NEW_USER": { class: "info", icon: "fas fa-user-plus" },
                    "USER_REPORT": { class: "danger", icon: "fas fa-exclamation-circle" },
                    "SYSTEM": { class: "info", icon: "fas fa-cog" },
                };
                const iconData = iconMap[n.type] || { class: "warning", icon: "fas fa-bell" };

                const titleMap = {
                    "PROVIDER_REQUEST": "Provider Request",
                    "NEW_USER": "New User",
                    "USER_REPORT": "User Report",
                    "SYSTEM": "System"
                };

                card.innerHTML = `
                <div class="icon ${iconData.class}"><i class="${iconData.icon}"></i></div>
                <div class="notification-content">
                    <div class="notification-title">
                        ${titleMap[n.type] || n.type} ${n.isRead ? '' : '<span class="badge">New</span>'}
                    </div>
                    <div class="notification-desc">${n.message}</div>
                    <div class="notification-meta">
                        <div class="notification-time">
                            <i class="far fa-clock"></i> ${new Date(n.createdAt).toLocaleString()}
                        </div>
                        <div class="notification-actions">
                            <button class="btn btn-sm btn-outline mark-as-${n.isRead ? 'unread' : 'read'}">
                                Mark as ${n.isRead ? 'unread' : 'read'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
                container.appendChild(card);
            });

            // --- Mark as read/unread buttons ---
            container.querySelectorAll(".mark-as-read, .mark-as-unread").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const card = btn.closest(".notification-card");
                    const id = card.dataset.id;

                    if (btn.disabled) return; // Prevent double click

                    const markUnread = btn.classList.contains("mark-as-unread");
                    if (markUnread) {
                        // If already unread, disable button and do nothing
                        btn.disabled = true;
                        return;
                    }

                    const endpoint = markUnread
                        ? `http://localhost:8080/api/notifications/${id}/unread`
                        : `http://localhost:8080/api/notifications/${id}/read`;

                    await fetch(endpoint, { method: "POST", headers: { Authorization: "Bearer " + token } });

                    loadNotifications(filter); // Reload to update UI and counts
                });
            });


            // --- Filter tab clicks ---
            document.querySelectorAll('.job-filters .filter-tab').forEach(tab => {
                if (tab.dataset.filter === 'unread') tab.querySelector('.badge').textContent = unreadCount;
            });


            // --- Mark all as read ---
            document.getElementById("mark-all-read")?.addEventListener("click", async () => {
                await fetch(`http://localhost:8080/api/notifications/user/${userId}/read-all`, {
                    method: "POST", headers: { Authorization: "Bearer " + token }
                });
                loadNotifications(filter);
            });

        } catch (err) {
            console.error("Error loading notifications:", err);
            Swal.fire("Error", "Failed to load notifications", "error");
        }
    }


    // --- Init + Refresh ---
    if (document.getElementById("admin-dashboard")?.classList.contains("active")) loadPendingRequests();
    if (document.getElementById("admin-notifications")?.classList.contains("active")) loadNotifications("all");
    if (document.getElementById("admin-manage-users")?.classList.contains("active")) loadUsers(0, 10, 'all', '');
    if (document.getElementById("admin-manage-jobs")?.classList.contains("active")) loadAllJobs(0, 10, 'all');

    setInterval(() => {
        if (document.getElementById("admin-dashboard")?.classList.contains("active")) loadPendingRequests();
        if (document.getElementById("admin-notifications")?.classList.contains("active")) loadNotifications("all");
        if (document.getElementById("admin-manage-users")?.classList.contains("active")) loadUsers(currentUserPage, currentUserSize, currentUserFilter, currentUserSearch);
        if (document.getElementById("admin-manage-jobs")?.classList.contains("active")) loadAllJobs(currentJobPage, currentJobSize, currentJobFilter);
    }, 30000);


    // --- Bell icon → switch to notifications page ---
    const bell = document.querySelector(".notification-bell");
    if (bell) {
        bell.addEventListener("click", () => {
            document.querySelectorAll(".page-content").forEach(p => p.classList.remove("active"));
            const notifyPage = document.getElementById("admin-notifications");
            if (notifyPage) {
                notifyPage.classList.add("active");
                loadNotifications("all");
            }
            adminLinks.forEach(l => l.classList.remove("active"));
            document.querySelector(`a[data-page="admin-notifications"]`).classList.add("active");
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

    document.addEventListener("DOMContentLoaded", () => {
        // Select the button and the page sections
        const manageUsersBtn = document.querySelector('a[href="#admin-manage-users"]');
        const allPages = document.querySelectorAll('.page-content');

        manageUsersBtn.addEventListener("click", (e) => {
            e.preventDefault(); // prevent default anchor behavior

            // Hide all pages
            allPages.forEach(page => page.classList.remove("active"));

            // Show the Manage Users page
            const targetPage = document.querySelector("#admin-manage-users");
            targetPage.classList.add("active");
        });
    });
});